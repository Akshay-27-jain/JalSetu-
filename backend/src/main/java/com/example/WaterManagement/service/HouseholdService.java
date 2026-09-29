package com.example.WaterManagement.service;

import com.example.WaterManagement.dto.HouseholdDtos;
import com.example.WaterManagement.entity.Apartment;
import com.example.WaterManagement.entity.Household;
import com.example.WaterManagement.entity.Role;
import com.example.WaterManagement.entity.User;
import com.example.WaterManagement.entity.UserStatus;
import com.example.WaterManagement.entity.WaterUsageLog;
import com.example.WaterManagement.exception.BadRequestException;
import com.example.WaterManagement.exception.ResourceNotFoundException;
import com.example.WaterManagement.repository.AlertRepository;
import com.example.WaterManagement.repository.ApartmentRepository;
import com.example.WaterManagement.repository.HouseholdRepository;
import com.example.WaterManagement.repository.InvoiceRepository;
import com.example.WaterManagement.repository.UserRepository;
import com.example.WaterManagement.repository.WaterUsageLogRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class HouseholdService {

    private static final Logger log = LoggerFactory.getLogger(HouseholdService.class);

    private final HouseholdRepository householdRepository;
    private final ApartmentRepository apartmentRepository;
    private final UserRepository userRepository;
    private final WaterUsageLogRepository waterUsageLogRepository;
    private final AlertRepository alertRepository;
    private final InvoiceRepository invoiceRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final DocumentVerificationService documentVerificationService;
    private final ObjectMapper objectMapper;

    public HouseholdService(HouseholdRepository householdRepository,
                            ApartmentRepository apartmentRepository,
                            UserRepository userRepository,
                            WaterUsageLogRepository waterUsageLogRepository,
                            AlertRepository alertRepository,
                            InvoiceRepository invoiceRepository,
                            PasswordEncoder passwordEncoder,
                            EmailService emailService,
                            DocumentVerificationService documentVerificationService,
                            ObjectMapper objectMapper) {
        this.householdRepository = householdRepository;
        this.apartmentRepository = apartmentRepository;
        this.userRepository = userRepository;
        this.waterUsageLogRepository = waterUsageLogRepository;
        this.alertRepository = alertRepository;
        this.invoiceRepository = invoiceRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.documentVerificationService = documentVerificationService;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public HouseholdDtos.HouseholdResponse createHousehold(Long apartmentId, HouseholdDtos.CreateHouseholdRequest request) {
        Apartment apartment = apartmentRepository.findById(apartmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Apartment not found with ID: " + apartmentId));

        String flatNumber = request.getFlatNumber().trim().toUpperCase();

        if (householdRepository.existsByApartmentIdAndFlatNumber(apartmentId, flatNumber)) {
            throw new BadRequestException("Flat " + flatNumber + " already exists in this apartment community");
        }

        // Generate clean unique invite code
        String prefix = apartment.getName().replaceAll("[^A-Za-z0-9]", "").toUpperCase();
        if (prefix.length() > 4) prefix = prefix.substring(0, 4);
        String inviteCode = "INV-" + prefix + "-" + flatNumber + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();

        String meterSerial = request.getMeterSerialNumber() != null && !request.getMeterSerialNumber().trim().isEmpty()
                ? request.getMeterSerialNumber().trim()
                : "MTR-" + flatNumber.replaceAll("[^A-Za-z0-9]", "") + "-" + (1000 + (int)(Math.random() * 9000));

        boolean hasResident = request.getResidentEmail() != null && !request.getResidentEmail().trim().isEmpty();
        UserStatus initialStatus = hasResident ? UserStatus.PENDING_APPROVAL : UserStatus.ACTIVE;

        Household household = Household.builder()
                .apartment(apartment)
                .flatNumber(flatNumber)
                .meterSerialNumber(meterSerial)
                .areaSqft(request.getAreaSqft() != null ? request.getAreaSqft() : 1200.0)
                .occupancyCount(request.getOccupancyCount() != null ? request.getOccupancyCount() : 3)
                .hasMeter(request.getHasMeter() != null ? request.getHasMeter() : true)
                .status(initialStatus)
                .inviteCode(inviteCode)
                .build();

        household = householdRepository.save(household);

        // If resident details are provided, onboard resident with 3-document verification
        if (hasResident) {
            String email = request.getResidentEmail().trim().toLowerCase();
            if (userRepository.existsByEmail(email)) {
                throw new BadRequestException("A user with email '" + email + "' already exists in the system");
            }
            String password = request.getResidentPassword() != null && !request.getResidentPassword().trim().isEmpty()
                    ? request.getResidentPassword().trim()
                    : "Resident@123";
            String fullName = request.getResidentFullName() != null && !request.getResidentFullName().trim().isEmpty()
                    ? request.getResidentFullName().trim()
                    : "Resident " + flatNumber;

            String doc1Type = request.getDoc1Type() != null && !request.getDoc1Type().isBlank() ? request.getDoc1Type().trim() : "PROPERTY_TAX_OR_SALE_DEED";
            String doc1FileName = request.getDoc1FileName() != null && !request.getDoc1FileName().isBlank() ? request.getDoc1FileName().trim() : "flat_ownership_doc.pdf";
            String doc1Base64 = request.getDoc1Base64();

            String doc2Type = request.getDoc2Type() != null && !request.getDoc2Type().isBlank() ? request.getDoc2Type().trim() : "GOVT_ID";
            String doc2FileName = request.getDoc2FileName() != null && !request.getDoc2FileName().isBlank() ? request.getDoc2FileName().trim() : "resident_govt_id.pdf";
            String doc2Base64 = request.getDoc2Base64();

            String doc3Type = request.getDoc3Type() != null && !request.getDoc3Type().isBlank() ? request.getDoc3Type().trim() : "AUTH_REPRESENTATIVE_OR_UTILITY";
            String doc3FileName = request.getDoc3FileName() != null && !request.getDoc3FileName().isBlank() ? request.getDoc3FileName().trim() : "signatory_utility_proof.pdf";
            String doc3Base64 = request.getDoc3Base64();

            // Run AI Verification Audit
            DocumentVerificationService.VerificationResult aiResult = documentVerificationService.analyzeDocuments(
                    fullName, apartment.getName(), flatNumber,
                    doc1Type, doc1FileName, doc1Base64,
                    doc2Type, doc2FileName, doc2Base64,
                    doc3Type, doc3FileName, doc3Base64
            );

            String aiJson = null;
            try {
                aiJson = objectMapper.writeValueAsString(aiResult.getExtractedData());
            } catch (Exception ignored) {}

            User residentUser = User.builder()
                    .email(email)
                    .passwordHash(passwordEncoder.encode(password))
                    .initialPassword(password)
                    .fullName(fullName)
                    .phoneNumber(request.getResidentPhone() != null && !request.getResidentPhone().trim().isEmpty() ? request.getResidentPhone().trim() : null)
                    .role(Role.RESIDENT)
                    .status(UserStatus.PENDING_APPROVAL)
                    .apartment(apartment)
                    .household(household)
                    .doc1Type(doc1Type)
                    .doc1FileName(doc1FileName)
                    .doc1Url(doc1Base64)
                    .doc2Type(doc2Type)
                    .doc2FileName(doc2FileName)
                    .doc2Url(doc2Base64)
                    .doc3Type(doc3Type)
                    .doc3FileName(doc3FileName)
                    .doc3Url(doc3Base64)
                    .aiVerificationScore(aiResult.getAuthenticityScore())
                    .aiVerificationStatus(aiResult.getStatus())
                    .aiVerificationSummary(aiResult.getSummary())
                    .aiExtractedDataJson(aiJson)
                    .aiVerifiedAt(aiResult.getVerifiedAt())
                    .build();

            userRepository.save(residentUser);

            // Notify resident that their flat account has been created by Community Admin and submitted for Main Admin verification
            try {
                emailService.sendRegistrationUnderReviewEmail(
                        email,
                        fullName,
                        apartment.getName(),
                        "Resident 3-Document Package (Flat " + flatNumber + ")"
                );
            } catch (Exception ex) {
                log.warn("⚠️ Could not dispatch resident registration email: {}", ex.getMessage());
            }
        }

        return mapToResponse(household);
    }

    @Transactional
    public HouseholdDtos.HouseholdResponse updateHousehold(Long apartmentId, Long householdId, HouseholdDtos.UpdateHouseholdRequest request) {
        Household household = householdRepository.findById(householdId)
                .orElseThrow(() -> new ResourceNotFoundException("Household not found with ID: " + householdId));

        if (!household.getApartment().getId().equals(apartmentId)) {
            throw new BadRequestException("Household does not belong to your apartment");
        }

        String newFlatNumber = request.getFlatNumber().trim().toUpperCase();
        if (!household.getFlatNumber().equalsIgnoreCase(newFlatNumber)) {
            if (householdRepository.existsByApartmentIdAndFlatNumber(apartmentId, newFlatNumber)) {
                throw new BadRequestException("Flat " + newFlatNumber + " already exists in this apartment community");
            }
            household.setFlatNumber(newFlatNumber);
        }

        if (request.getMeterSerialNumber() != null && !request.getMeterSerialNumber().trim().isEmpty()) {
            household.setMeterSerialNumber(request.getMeterSerialNumber().trim());
        }
        if (request.getAreaSqft() != null) {
            household.setAreaSqft(request.getAreaSqft());
        }
        if (request.getOccupancyCount() != null) {
            household.setOccupancyCount(request.getOccupancyCount());
        }
        if (request.getHasMeter() != null) {
            household.setHasMeter(request.getHasMeter());
        }
        if (request.getStatus() != null) {
            household.setStatus(request.getStatus());
        }

        household = householdRepository.save(household);

        // Update or create resident user
        Optional<User> existingUserOpt = userRepository.findFirstByHouseholdId(household.getId());
        if (existingUserOpt.isPresent()) {
            User user = existingUserOpt.get();
            if (request.getStatus() != null) {
                user.setStatus(request.getStatus());
            }
            if (request.getResidentFullName() != null && !request.getResidentFullName().trim().isEmpty()) {
                user.setFullName(request.getResidentFullName().trim());
            }
            if (request.getResidentPhone() != null) {
                user.setPhoneNumber(request.getResidentPhone().trim().isEmpty() ? null : request.getResidentPhone().trim());
            }
            if (request.getResidentEmail() != null && !request.getResidentEmail().trim().isEmpty()) {
                String newEmail = request.getResidentEmail().trim().toLowerCase();
                if (!user.getEmail().equalsIgnoreCase(newEmail)) {
                    if (userRepository.existsByEmail(newEmail)) {
                        throw new BadRequestException("A user with email '" + newEmail + "' already exists in the system");
                    }
                    user.setEmail(newEmail);
                }
            }

            // If new verification documents are uploaded
            if (request.getDoc1Base64() != null || request.getDoc2Base64() != null || request.getDoc3Base64() != null) {
                String doc1Type = request.getDoc1Type() != null ? request.getDoc1Type() : (user.getDoc1Type() != null ? user.getDoc1Type() : "PROPERTY_DOC");
                String doc1FileName = request.getDoc1FileName() != null ? request.getDoc1FileName() : (user.getDoc1FileName() != null ? user.getDoc1FileName() : "doc1.pdf");
                String doc1Base64 = request.getDoc1Base64() != null ? request.getDoc1Base64() : user.getDoc1Url();

                String doc2Type = request.getDoc2Type() != null ? request.getDoc2Type() : (user.getDoc2Type() != null ? user.getDoc2Type() : "GOVT_ID");
                String doc2FileName = request.getDoc2FileName() != null ? request.getDoc2FileName() : (user.getDoc2FileName() != null ? user.getDoc2FileName() : "doc2.pdf");
                String doc2Base64 = request.getDoc2Base64() != null ? request.getDoc2Base64() : user.getDoc2Url();

                String doc3Type = request.getDoc3Type() != null ? request.getDoc3Type() : (user.getDoc3Type() != null ? user.getDoc3Type() : "UTILITY_NOC");
                String doc3FileName = request.getDoc3FileName() != null ? request.getDoc3FileName() : (user.getDoc3FileName() != null ? user.getDoc3FileName() : "doc3.pdf");
                String doc3Base64 = request.getDoc3Base64() != null ? request.getDoc3Base64() : user.getDoc3Url();

                DocumentVerificationService.VerificationResult aiResult = documentVerificationService.analyzeDocuments(
                        user.getFullName(), household.getApartment().getName(), household.getFlatNumber(),
                        doc1Type, doc1FileName, doc1Base64,
                        doc2Type, doc2FileName, doc2Base64,
                        doc3Type, doc3FileName, doc3Base64
                );

                String aiJson = null;
                try {
                    aiJson = objectMapper.writeValueAsString(aiResult.getExtractedData());
                } catch (Exception ignored) {}

                user.setDoc1Type(doc1Type);
                user.setDoc1FileName(doc1FileName);
                user.setDoc1Url(doc1Base64);
                user.setDoc2Type(doc2Type);
                user.setDoc2FileName(doc2FileName);
                user.setDoc2Url(doc2Base64);
                user.setDoc3Type(doc3Type);
                user.setDoc3FileName(doc3FileName);
                user.setDoc3Url(doc3Base64);
                user.setAiVerificationScore(aiResult.getAuthenticityScore());
                user.setAiVerificationStatus(aiResult.getStatus());
                user.setAiVerificationSummary(aiResult.getSummary());
                user.setAiExtractedDataJson(aiJson);
                user.setAiVerifiedAt(aiResult.getVerifiedAt());
                user.setStatus(UserStatus.PENDING_APPROVAL);
                household.setStatus(UserStatus.PENDING_APPROVAL);
                householdRepository.save(household);
            }

            userRepository.save(user);
        } else if (request.getResidentEmail() != null && !request.getResidentEmail().trim().isEmpty()) {
            String newEmail = request.getResidentEmail().trim().toLowerCase();
            if (userRepository.existsByEmail(newEmail)) {
                throw new BadRequestException("A user with email '" + newEmail + "' already exists in the system");
            }
            String fullName = request.getResidentFullName() != null && !request.getResidentFullName().trim().isEmpty()
                    ? request.getResidentFullName().trim()
                    : "Resident " + household.getFlatNumber();

            String password = request.getResidentPassword() != null && !request.getResidentPassword().trim().isEmpty()
                    ? request.getResidentPassword().trim()
                    : "Resident@123";

            String doc1Type = request.getDoc1Type() != null ? request.getDoc1Type() : "PROPERTY_DOC";
            String doc1FileName = request.getDoc1FileName() != null ? request.getDoc1FileName() : "flat_doc.pdf";
            String doc1Base64 = request.getDoc1Base64();

            String doc2Type = request.getDoc2Type() != null ? request.getDoc2Type() : "GOVT_ID";
            String doc2FileName = request.getDoc2FileName() != null ? request.getDoc2FileName() : "resident_id.pdf";
            String doc2Base64 = request.getDoc2Base64();

            String doc3Type = request.getDoc3Type() != null ? request.getDoc3Type() : "UTILITY_NOC";
            String doc3FileName = request.getDoc3FileName() != null ? request.getDoc3FileName() : "utility_doc.pdf";
            String doc3Base64 = request.getDoc3Base64();

            DocumentVerificationService.VerificationResult aiResult = documentVerificationService.analyzeDocuments(
                    fullName, household.getApartment().getName(), household.getFlatNumber(),
                    doc1Type, doc1FileName, doc1Base64,
                    doc2Type, doc2FileName, doc2Base64,
                    doc3Type, doc3FileName, doc3Base64
            );

            String aiJson = null;
            try {
                aiJson = objectMapper.writeValueAsString(aiResult.getExtractedData());
            } catch (Exception ignored) {}

            User residentUser = User.builder()
                    .email(newEmail)
                    .passwordHash(passwordEncoder.encode(password))
                    .fullName(fullName)
                    .phoneNumber(request.getResidentPhone() != null && !request.getResidentPhone().trim().isEmpty() ? request.getResidentPhone().trim() : null)
                    .role(Role.RESIDENT)
                    .status(UserStatus.PENDING_APPROVAL)
                    .apartment(household.getApartment())
                    .household(household)
                    .doc1Type(doc1Type)
                    .doc1FileName(doc1FileName)
                    .doc1Url(doc1Base64)
                    .doc2Type(doc2Type)
                    .doc2FileName(doc2FileName)
                    .doc2Url(doc2Base64)
                    .doc3Type(doc3Type)
                    .doc3FileName(doc3FileName)
                    .doc3Url(doc3Base64)
                    .aiVerificationScore(aiResult.getAuthenticityScore())
                    .aiVerificationStatus(aiResult.getStatus())
                    .aiVerificationSummary(aiResult.getSummary())
                    .aiExtractedDataJson(aiJson)
                    .aiVerifiedAt(aiResult.getVerifiedAt())
                    .build();

            userRepository.save(residentUser);
            household.setStatus(UserStatus.PENDING_APPROVAL);
            householdRepository.save(household);
        }

        return mapToResponse(household);
    }

    @Transactional
    public HouseholdDtos.HouseholdResponse updateHouseholdStatus(Long apartmentId, Long householdId, UserStatus newStatus) {
        Household household = householdRepository.findById(householdId)
                .orElseThrow(() -> new ResourceNotFoundException("Household not found with ID: " + householdId));

        if (!household.getApartment().getId().equals(apartmentId)) {
            throw new BadRequestException("Household does not belong to your apartment");
        }

        household.setStatus(newStatus);
        household = householdRepository.save(household);

        Optional<User> userOpt = userRepository.findFirstByHouseholdId(household.getId());
        userOpt.ifPresent(u -> {
            u.setStatus(newStatus);
            userRepository.save(u);
        });

        return mapToResponse(household);
    }

    @Transactional
    public void deleteHousehold(Long apartmentId, Long householdId) {
        Household household = householdRepository.findById(householdId)
                .orElseThrow(() -> new ResourceNotFoundException("Household not found with ID: " + householdId));

        if (!household.getApartment().getId().equals(apartmentId)) {
            throw new BadRequestException("Household does not belong to your apartment");
        }

        // Clean up child records
        alertRepository.findByHouseholdIdOrderBySentAtDesc(householdId).forEach(alertRepository::delete);
        invoiceRepository.findByHouseholdIdOrderByGeneratedAtDesc(householdId).forEach(invoiceRepository::delete);
        waterUsageLogRepository.findByHouseholdIdOrderByReadingDateDesc(householdId).forEach(waterUsageLogRepository::delete);
        userRepository.findByHouseholdId(householdId).forEach(userRepository::delete);

        // Delete household entity
        householdRepository.delete(household);
    }

    @Transactional(readOnly = true)
    public List<HouseholdDtos.HouseholdResponse> getHouseholdsByApartment(Long apartmentId) {
        return householdRepository.findByApartmentId(apartmentId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public HouseholdDtos.HouseholdResponse getHouseholdById(Long apartmentId, Long householdId) {
        Household household = householdRepository.findById(householdId)
                .orElseThrow(() -> new ResourceNotFoundException("Household not found with ID: " + householdId));

        if (!household.getApartment().getId().equals(apartmentId)) {
            throw new BadRequestException("Household does not belong to your apartment");
        }

        return mapToResponse(household);
    }

    private HouseholdDtos.HouseholdResponse mapToResponse(Household household) {
        User resident = userRepository.findFirstByHouseholdId(household.getId()).orElse(null);

        WaterUsageLog latestLog = waterUsageLogRepository.findFirstByHouseholdIdOrderByReadingDateDesc(household.getId())
                .orElse(null);

        LocalDate firstDayOfMonth = LocalDate.now().withDayOfMonth(1);
        LocalDate lastDayOfMonth = LocalDate.now().plusMonths(1).withDayOfMonth(1).minusDays(1);
        Double currentMonthSum = waterUsageLogRepository.sumConsumptionByHouseholdAndDateBetween(
                household.getId(), firstDayOfMonth, lastDayOfMonth
        );

        return HouseholdDtos.HouseholdResponse.builder()
                .id(household.getId())
                .apartmentId(household.getApartment().getId())
                .flatNumber(household.getFlatNumber())
                .meterSerialNumber(household.getMeterSerialNumber())
                .areaSqft(household.getAreaSqft())
                .occupancyCount(household.getOccupancyCount())
                .hasMeter(household.getHasMeter())
                .status(household.getStatus() != null ? household.getStatus() : (resident != null && resident.getStatus() != null ? resident.getStatus() : UserStatus.ACTIVE))
                .inviteCode(household.getInviteCode())
                .residentName(resident != null ? resident.getFullName() : null)
                .residentEmail(resident != null ? resident.getEmail() : null)
                .residentPhone(resident != null ? resident.getPhoneNumber() : null)
                .createdAt(household.getCreatedAt())
                .latestReadingKl(latestLog != null ? latestLog.getMeterReadingKl() : null)
                .currentMonthConsumptionKl(currentMonthSum != null ? Math.round(currentMonthSum * 100.0) / 100.0 : 0.0)
                .doc1Type(resident != null ? resident.getDoc1Type() : null)
                .doc1FileName(resident != null ? resident.getDoc1FileName() : null)
                .doc1Url(resident != null ? resident.getDoc1Url() : null)
                .doc2Type(resident != null ? resident.getDoc2Type() : null)
                .doc2FileName(resident != null ? resident.getDoc2FileName() : null)
                .doc2Url(resident != null ? resident.getDoc2Url() : null)
                .doc3Type(resident != null ? resident.getDoc3Type() : null)
                .doc3FileName(resident != null ? resident.getDoc3FileName() : null)
                .doc3Url(resident != null ? resident.getDoc3Url() : null)
                .aiVerificationScore(resident != null ? resident.getAiVerificationScore() : null)
                .aiVerificationStatus(resident != null ? resident.getAiVerificationStatus() : null)
                .aiVerificationSummary(resident != null ? resident.getAiVerificationSummary() : null)
                .verificationNotes(resident != null ? resident.getVerificationNotes() : null)
                .build();
    }

    @Transactional
    public boolean sendCredentialsEmail(Long apartmentId, Long householdId, String overrideEmail) {
        Household household = householdRepository.findById(householdId)
                .orElseThrow(() -> new ResourceNotFoundException("Household not found with ID: " + householdId));

        if (!household.getApartment().getId().equals(apartmentId)) {
            throw new BadRequestException("Household does not belong to your apartment");
        }

        Optional<User> userOpt = userRepository.findFirstByHouseholdId(household.getId());
        String email = (overrideEmail != null && !overrideEmail.trim().isEmpty())
                ? overrideEmail.trim()
                : userOpt.map(User::getEmail).orElse(null);

        if (email == null || email.trim().isEmpty()) {
            throw new BadRequestException("No recipient email address available for Flat " + household.getFlatNumber());
        }

        String name = userOpt.map(User::getFullName).orElse("Resident Flat " + household.getFlatNumber());
        return emailService.sendResidentCredentialsEmail(
                email,
                name,
                household.getApartment().getName(),
                household.getFlatNumber(),
                household.getMeterSerialNumber(),
                "Resident@123"
        );
    }
}
