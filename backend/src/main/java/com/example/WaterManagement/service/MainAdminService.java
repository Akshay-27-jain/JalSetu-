package com.example.WaterManagement.service;

import com.example.WaterManagement.dto.ApartmentDtos;
import com.example.WaterManagement.dto.HouseholdDtos;
import com.example.WaterManagement.entity.*;
import com.example.WaterManagement.exception.BadRequestException;
import com.example.WaterManagement.exception.ResourceNotFoundException;
import com.example.WaterManagement.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class MainAdminService {

    private static final Logger log = LoggerFactory.getLogger(MainAdminService.class);

    private final ApartmentRepository apartmentRepository;
    private final UserRepository userRepository;
    private final HouseholdRepository householdRepository;
    private final TariffPlanRepository tariffPlanRepository;
    private final WaterUsageLogRepository waterUsageLogRepository;
    private final AlertRepository alertRepository;
    private final InvoiceRepository invoiceRepository;
    private final BulkPurchaseRepository bulkPurchaseRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final HouseholdService householdService;
    private final DocumentVerificationService documentVerificationService;
    private final ObjectMapper objectMapper;

    public MainAdminService(ApartmentRepository apartmentRepository,
                            UserRepository userRepository,
                            HouseholdRepository householdRepository,
                            TariffPlanRepository tariffPlanRepository,
                            WaterUsageLogRepository waterUsageLogRepository,
                            AlertRepository alertRepository,
                            InvoiceRepository invoiceRepository,
                            BulkPurchaseRepository bulkPurchaseRepository,
                            PasswordEncoder passwordEncoder,
                            EmailService emailService,
                            HouseholdService householdService,
                            DocumentVerificationService documentVerificationService) {
        this.apartmentRepository = apartmentRepository;
        this.userRepository = userRepository;
        this.householdRepository = householdRepository;
        this.tariffPlanRepository = tariffPlanRepository;
        this.waterUsageLogRepository = waterUsageLogRepository;
        this.alertRepository = alertRepository;
        this.invoiceRepository = invoiceRepository;
        this.bulkPurchaseRepository = bulkPurchaseRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.householdService = householdService;
        this.documentVerificationService = documentVerificationService;
        this.objectMapper = new ObjectMapper();
    }

    @Transactional
    public ApartmentDtos.ApartmentResponse createApartment(ApartmentDtos.CreateApartmentRequest request) {
        String email = request.getAdminEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("A user with email " + request.getAdminEmail() + " already exists");
        }

        String doc1Type = request.getDoc1Type() != null && !request.getDoc1Type().isBlank() ? request.getDoc1Type().trim() : "PROPERTY_TAX_OR_SALE_DEED";
        String doc1FileName = request.getDoc1FileName() != null && !request.getDoc1FileName().isBlank() ? request.getDoc1FileName().trim() : "society_registration_deed.pdf";
        String doc1Base64 = request.getDoc1Base64();

        String doc2Type = request.getDoc2Type() != null && !request.getDoc2Type().isBlank() ? request.getDoc2Type().trim() : "GOVT_ID";
        String doc2FileName = request.getDoc2FileName() != null && !request.getDoc2FileName().isBlank() ? request.getDoc2FileName().trim() : "admin_govt_id.pdf";
        String doc2Base64 = request.getDoc2Base64();

        String doc3Type = request.getDoc3Type() != null && !request.getDoc3Type().isBlank() ? request.getDoc3Type().trim() : "AUTH_REPRESENTATIVE_OR_UTILITY";
        String doc3FileName = request.getDoc3FileName() != null && !request.getDoc3FileName().isBlank() ? request.getDoc3FileName().trim() : "rwa_board_resolution.pdf";
        String doc3Base64 = request.getDoc3Base64();

        DocumentVerificationService.VerificationResult aiResult = null;
        if (doc1Base64 != null || doc2Base64 != null || doc3Base64 != null) {
            aiResult = documentVerificationService.analyzeDocuments(
                    request.getAdminFullName().trim(),
                    request.getName().trim(),
                    "ADMIN",
                    doc1Type, doc1FileName, doc1Base64,
                    doc2Type, doc2FileName, doc2Base64,
                    doc3Type, doc3FileName, doc3Base64
            );
        }

        String aiJson = null;
        if (aiResult != null && aiResult.getExtractedData() != null) {
            try {
                aiJson = objectMapper.writeValueAsString(aiResult.getExtractedData());
            } catch (Exception ignored) {}
        }

        Apartment apartment = Apartment.builder()
                .name(request.getName().trim())
                .address(request.getAddress() != null ? request.getAddress().trim() : "")
                .totalHouseholds(request.getTotalHouseholds())
                .verificationStatus(UserStatus.ACTIVE)
                .doc1Type(doc1Type)
                .doc1FileName(doc1FileName)
                .doc1Url(doc1Base64)
                .doc2Type(doc2Type)
                .doc2FileName(doc2FileName)
                .doc2Url(doc2Base64)
                .doc3Type(doc3Type)
                .doc3FileName(doc3FileName)
                .doc3Url(doc3Base64)
                .aiVerificationScore(aiResult != null ? aiResult.getAuthenticityScore() : 95.0)
                .aiVerificationStatus(aiResult != null ? aiResult.getStatus() : "AUTHENTIC")
                .aiVerificationSummary(aiResult != null ? aiResult.getSummary() : "Directly verified & onboarded by Platform Main Administrator")
                .aiExtractedDataJson(aiJson)
                .reviewedAt(LocalDateTime.now())
                .build();
        apartment = apartmentRepository.save(apartment);

        User admin = User.builder()
                .fullName(request.getAdminFullName().trim())
                .email(email)
                .phoneNumber(request.getAdminPhone() != null ? request.getAdminPhone().trim() : null)
                .passwordHash(passwordEncoder.encode(request.getAdminPassword()))
                .initialPassword(request.getAdminPassword())
                .role(Role.COMMUNITY_ADMIN)
                .status(UserStatus.ACTIVE)
                .apartment(apartment)
                .household(null)
                .doc1Type(doc1Type)
                .doc1FileName(doc1FileName)
                .doc1Url(doc1Base64)
                .doc2Type(doc2Type)
                .doc2FileName(doc2FileName)
                .doc2Url(doc2Base64)
                .doc3Type(doc3Type)
                .doc3FileName(doc3FileName)
                .doc3Url(doc3Base64)
                .aiVerificationScore(aiResult != null ? aiResult.getAuthenticityScore() : 95.0)
                .aiVerificationStatus(aiResult != null ? aiResult.getStatus() : "AUTHENTIC")
                .aiVerificationSummary(aiResult != null ? aiResult.getSummary() : "Directly verified & onboarded by Platform Main Administrator")
                .aiExtractedDataJson(aiJson)
                .aiVerifiedAt(aiResult != null ? aiResult.getVerifiedAt() : LocalDateTime.now())
                .build();
        admin = userRepository.save(admin);

        TariffPlan defaultTariff = TariffPlan.builder()
                .apartment(apartment)
                .baseRatePerKl(40.0)
                .baseTierLimitKl(10.0)
                .midRatePerKl(25.0)
                .midTierLimitKl(25.0)
                .higherRatePerKl(70.0)
                .baseMaintenanceFee(150.0)
                .apportionmentMethod(ApportionmentMethod.BY_FLAT_AREA)
                .effectiveFrom(LocalDate.now().withDayOfMonth(1))
                .build();
        tariffPlanRepository.save(defaultTariff);

        // Dispatch official onboarding email with credentials & PWA instructions asynchronously / safely
        try {
            emailService.sendCommunityAdminOnboardingEmail(
                    admin.getEmail(),
                    admin.getFullName(),
                    apartment.getName(),
                    apartment.getTotalHouseholds(),
                    request.getAdminPassword()
            );
        } catch (Exception ex) {
            log.warn("Could not dispatch onboarding email to community admin {}: {}", admin.getEmail(), ex.getMessage());
        }

        return ApartmentDtos.ApartmentResponse.builder()
                .id(apartment.getId())
                .name(apartment.getName())
                .address(apartment.getAddress())
                .totalHouseholds(apartment.getTotalHouseholds())
                .registeredHouseholds(0L)
                .adminId(admin.getId())
                .adminName(admin.getFullName())
                .adminEmail(admin.getEmail())
                .adminPhone(admin.getPhoneNumber())
                .createdAt(apartment.getCreatedAt())
                .build();
    }

    @Transactional(readOnly = true)
    public List<ApartmentDtos.ApartmentResponse> getAllApartments() {
        return apartmentRepository.findAll().stream().map(apt -> {
            User admin = userRepository.findByApartmentIdAndRole(apt.getId(), Role.COMMUNITY_ADMIN).orElse(null);
            long regCount = householdRepository.countByApartmentId(apt.getId());

            return ApartmentDtos.ApartmentResponse.builder()
                    .id(apt.getId())
                    .name(apt.getName())
                    .address(apt.getAddress())
                    .totalHouseholds(apt.getTotalHouseholds())
                    .registeredHouseholds(regCount)
                    .adminId(admin != null ? admin.getId() : null)
                    .adminName(admin != null ? admin.getFullName() : "Unassigned")
                    .adminEmail(admin != null ? admin.getEmail() : "N/A")
                    .adminPhone(admin != null ? admin.getPhoneNumber() : null)
                    .createdAt(apt.getCreatedAt())
                    .build();
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ApartmentDtos.PlatformHouseholdResponse> getAllPlatformHouseholds() {
        List<Household> households = householdRepository.findAll();
        LocalDate now = LocalDate.now();
        LocalDate startOfMonth = now.withDayOfMonth(1);
        LocalDate endOfMonth = now.plusMonths(1).withDayOfMonth(1).minusDays(1);

        return households.stream().map(h -> {
            User resident = userRepository.findFirstByHouseholdId(h.getId()).orElse(null);

            // Latest meter reading
            Optional<WaterUsageLog> latestLog = waterUsageLogRepository.findFirstByHouseholdIdOrderByReadingDateDesc(h.getId());
            Double latestReading = latestLog.map(WaterUsageLog::getMeterReadingKl).orElse(0.0);

            // Current month consumption sum
            Double currentMonthSum = waterUsageLogRepository.sumConsumptionByHouseholdAndDateBetween(h.getId(), startOfMonth, endOfMonth);
            double currentMonthUsage = currentMonthSum != null ? Math.round(currentMonthSum * 100.0) / 100.0 : 0.0;

            return ApartmentDtos.PlatformHouseholdResponse.builder()
                    .id(h.getId())
                    .apartmentId(h.getApartment().getId())
                    .apartmentName(h.getApartment().getName())
                    .flatNumber(h.getFlatNumber())
                    .meterSerialNumber(h.getMeterSerialNumber())
                    .areaSqft(h.getAreaSqft())
                    .occupancyCount(h.getOccupancyCount())
                    .hasMeter(h.getHasMeter())
                    .status(h.getStatus() != null ? h.getStatus() : UserStatus.ACTIVE)
                    .inviteCode(h.getInviteCode())
                    .residentName(resident != null ? resident.getFullName() : "Vacant / Unregistered")
                    .residentEmail(resident != null ? resident.getEmail() : "N/A")
                    .residentPhone(resident != null ? resident.getPhoneNumber() : null)
                    .latestReadingKl(latestReading)
                    .currentMonthConsumptionKl(currentMonthUsage)
                    .createdAt(h.getCreatedAt())
                    .build();
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ApartmentDtos.CommunityAdminDetailResponse> getAllCommunityAdmins() {
        List<User> admins = userRepository.findByRole(Role.COMMUNITY_ADMIN);

        LocalDate now = LocalDate.now();
        LocalDate startOfMonth = now.withDayOfMonth(1);
        LocalDate endOfMonth = now.plusMonths(1).withDayOfMonth(1).minusDays(1);

        return admins.stream().map(admin -> {
            Apartment apt = admin.getApartment();
            Long aptId = apt != null ? apt.getId() : null;

            long regCount = aptId != null ? householdRepository.countByApartmentId(aptId) : 0L;
            long activeMeters = aptId != null ? householdRepository.countByApartmentIdAndHasMeterTrue(aptId) : 0L;

            Double monthlyUsage = 0.0;
            Double monthlyRev = 0.0;
            String tariffSummary = "Standard Tiered";

            if (aptId != null) {
                Double usageSum = waterUsageLogRepository.sumConsumptionByApartmentAndDateBetween(aptId, startOfMonth, endOfMonth);
                if (usageSum != null) {
                    monthlyUsage = Math.round(usageSum * 100.0) / 100.0;
                }

                List<Invoice> aptInvoices = invoiceRepository.findByApartmentId(aptId);
                double revSum = aptInvoices.stream()
                        .filter(inv -> inv.getGeneratedAt() != null && !inv.getGeneratedAt().toLocalDate().isBefore(startOfMonth) && !inv.getGeneratedAt().toLocalDate().isAfter(endOfMonth))
                        .mapToDouble(Invoice::getTotalAmount)
                        .sum();
                monthlyRev = Math.round(revSum * 100.0) / 100.0;

                Optional<TariffPlan> tp = tariffPlanRepository.findFirstByApartmentIdOrderByEffectiveFromDesc(aptId);
                if (tp.isPresent()) {
                    TariffPlan plan = tp.get();
                    tariffSummary = "Base: ₹" + plan.getBaseRatePerKl() + "/kL (≤" + plan.getBaseTierLimitKl() + "kL), High: ₹" + plan.getHigherRatePerKl() + "/kL";
                }
            }

            return ApartmentDtos.CommunityAdminDetailResponse.builder()
                    .adminId(admin.getId())
                    .adminName(admin.getFullName())
                    .adminEmail(admin.getEmail())
                    .adminPhone(admin.getPhoneNumber())
                    .role(admin.getRole())
                    .status(admin.getStatus())
                    .apartmentId(aptId)
                    .apartmentName(apt != null ? apt.getName() : "Unassigned")
                    .apartmentAddress(apt != null ? apt.getAddress() : null)
                    .totalHouseholds(apt != null ? apt.getTotalHouseholds() : 0)
                    .registeredHouseholds(regCount)
                    .activeMetersCount(activeMeters)
                    .totalMonthlyConsumptionKl(monthlyUsage)
                    .totalMonthlyRevenue(monthlyRev)
                    .baseTariffSummary(tariffSummary)
                    .adminCreatedAt(admin.getCreatedAt())
                    .apartmentCreatedAt(apt != null ? apt.getCreatedAt() : null)
                    .build();
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ApartmentDtos.CommunityAdminDetailResponse getCommunityAdminById(Long adminId) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Community Administrator not found with ID: " + adminId));

        if (admin.getRole() != Role.COMMUNITY_ADMIN) {
            throw new BadRequestException("Requested user is not a Community Administrator");
        }

        Apartment apt = admin.getApartment();
        Long aptId = apt != null ? apt.getId() : null;

        long regCount = aptId != null ? householdRepository.countByApartmentId(aptId) : 0L;
        long activeMeters = aptId != null ? householdRepository.countByApartmentIdAndHasMeterTrue(aptId) : 0L;

        LocalDate now = LocalDate.now();
        LocalDate startOfMonth = now.withDayOfMonth(1);
        LocalDate endOfMonth = now.plusMonths(1).withDayOfMonth(1).minusDays(1);

        Double monthlyUsage = 0.0;
        Double monthlyRev = 0.0;
        String tariffSummary = "Standard Tiered";

        if (aptId != null) {
            Double usageSum = waterUsageLogRepository.sumConsumptionByApartmentAndDateBetween(aptId, startOfMonth, endOfMonth);
            if (usageSum != null) {
                monthlyUsage = Math.round(usageSum * 100.0) / 100.0;
            }

            List<Invoice> aptInvoices = invoiceRepository.findByApartmentId(aptId);
            double revSum = aptInvoices.stream()
                    .filter(inv -> inv.getGeneratedAt() != null && !inv.getGeneratedAt().toLocalDate().isBefore(startOfMonth) && !inv.getGeneratedAt().toLocalDate().isAfter(endOfMonth))
                    .mapToDouble(Invoice::getTotalAmount)
                    .sum();
            monthlyRev = Math.round(revSum * 100.0) / 100.0;

            Optional<TariffPlan> tp = tariffPlanRepository.findFirstByApartmentIdOrderByEffectiveFromDesc(aptId);
            if (tp.isPresent()) {
                TariffPlan plan = tp.get();
                tariffSummary = "Base: ₹" + plan.getBaseRatePerKl() + "/kL (≤" + plan.getBaseTierLimitKl() + "kL), High: ₹" + plan.getHigherRatePerKl() + "/kL";
            }
        }

        List<HouseholdDtos.HouseholdResponse> households = new ArrayList<>();
        if (aptId != null) {
            households = householdService.getHouseholdsByApartment(aptId);
        }

        return ApartmentDtos.CommunityAdminDetailResponse.builder()
                .adminId(admin.getId())
                .adminName(admin.getFullName())
                .adminEmail(admin.getEmail())
                .adminPhone(admin.getPhoneNumber())
                .role(admin.getRole())
                .status(admin.getStatus())
                .apartmentId(aptId)
                .apartmentName(apt != null ? apt.getName() : "Unassigned")
                .apartmentAddress(apt != null ? apt.getAddress() : null)
                .totalHouseholds(apt != null ? apt.getTotalHouseholds() : 0)
                .registeredHouseholds(regCount)
                .activeMetersCount(activeMeters)
                .totalMonthlyConsumptionKl(monthlyUsage)
                .totalMonthlyRevenue(monthlyRev)
                .baseTariffSummary(tariffSummary)
                .adminCreatedAt(admin.getCreatedAt())
                .apartmentCreatedAt(apt != null ? apt.getCreatedAt() : null)
                .households(households)
                .build();
    }

    @Transactional(readOnly = true)
    public ApartmentDtos.PlatformAnalyticsResponse getPlatformAnalytics() {
        long totalApts = apartmentRepository.count();
        long totalHouseholds = householdRepository.count();
        long totalUsers = userRepository.count();
        long totalActiveMeters = householdRepository.findAll().stream().filter(Household::getHasMeter).count();

        LocalDate now = LocalDate.now();
        LocalDate startOfMonth = now.withDayOfMonth(1);
        LocalDate endOfMonth = now.plusMonths(1).withDayOfMonth(1).minusDays(1);

        Double currentMonthUsage = 0.0;
        Double currentMonthBilled = 0.0;
        Double currentMonthCollected = 0.0;

        List<Apartment> apartments = apartmentRepository.findAll();
        for (Apartment apt : apartments) {
            Double u = waterUsageLogRepository.sumConsumptionByApartmentAndDateBetween(apt.getId(), startOfMonth, endOfMonth);
            if (u != null) currentMonthUsage += u;

            List<Invoice> aptInvoices = invoiceRepository.findByApartmentId(apt.getId());
            double b = aptInvoices.stream()
                    .filter(inv -> inv.getGeneratedAt() != null && !inv.getGeneratedAt().toLocalDate().isBefore(startOfMonth) && !inv.getGeneratedAt().toLocalDate().isAfter(endOfMonth))
                    .mapToDouble(Invoice::getTotalAmount)
                    .sum();
            currentMonthBilled += b;

            double c = aptInvoices.stream()
                    .filter(inv -> inv.getStatus() == InvoiceStatus.PAID && inv.getPaidAt() != null && !inv.getPaidAt().toLocalDate().isBefore(startOfMonth) && !inv.getPaidAt().toLocalDate().isAfter(endOfMonth))
                    .mapToDouble(Invoice::getTotalAmount)
                    .sum();
            currentMonthCollected += c;
        }

        currentMonthUsage = Math.round(currentMonthUsage * 100.0) / 100.0;
        currentMonthBilled = Math.round(currentMonthBilled * 100.0) / 100.0;
        currentMonthCollected = Math.round(currentMonthCollected * 100.0) / 100.0;

        double collectionRate = currentMonthBilled > 0 ? Math.round((currentMonthCollected / currentMonthBilled) * 1000.0) / 10.0 : 100.0;

        // 6-Month Monthly Trends
        List<ApartmentDtos.MonthlyTrendDto> monthlyTrends = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            YearMonth ym = YearMonth.now().minusMonths(i);
            LocalDate fDay = ym.atDay(1);
            LocalDate lDay = ym.atEndOfMonth();
            String monthName = ym.getMonth().name().substring(0, 3) + " " + ym.getYear();

            double monthUsage = 0.0;
            double monthBilled = 0.0;
            double monthCollected = 0.0;

            for (Apartment apt : apartments) {
                Double u = waterUsageLogRepository.sumConsumptionByApartmentAndDateBetween(apt.getId(), fDay, lDay);
                if (u != null) monthUsage += u;

                List<Invoice> aptInvoices = invoiceRepository.findByApartmentId(apt.getId());
                double b = aptInvoices.stream()
                        .filter(inv -> inv.getGeneratedAt() != null && !inv.getGeneratedAt().toLocalDate().isBefore(fDay) && !inv.getGeneratedAt().toLocalDate().isAfter(lDay))
                        .mapToDouble(Invoice::getTotalAmount)
                        .sum();
                monthBilled += b;

                double c = aptInvoices.stream()
                        .filter(inv -> inv.getStatus() == InvoiceStatus.PAID && inv.getPaidAt() != null && !inv.getPaidAt().toLocalDate().isBefore(fDay) && !inv.getPaidAt().toLocalDate().isAfter(lDay))
                        .mapToDouble(Invoice::getTotalAmount)
                        .sum();
                monthCollected += c;
            }

            monthlyTrends.add(new ApartmentDtos.MonthlyTrendDto(
                    monthName,
                    Math.round(monthUsage * 100.0) / 100.0,
                    Math.round(monthBilled * 100.0) / 100.0,
                    Math.round(monthCollected * 100.0) / 100.0
            ));
        }

        // Per-Society Analytics
        List<ApartmentDtos.SocietyAnalyticsDto> societyStats = new ArrayList<>();
        for (Apartment apt : apartments) {
            User admin = userRepository.findByApartmentIdAndRole(apt.getId(), Role.COMMUNITY_ADMIN).orElse(null);
            long regCount = householdRepository.countByApartmentId(apt.getId());
            long meterCount = householdRepository.countByApartmentIdAndHasMeterTrue(apt.getId());

            Double sUsage = waterUsageLogRepository.sumConsumptionByApartmentAndDateBetween(apt.getId(), startOfMonth, endOfMonth);
            List<Invoice> aptInvoices = invoiceRepository.findByApartmentId(apt.getId());
            double sBilled = aptInvoices.stream()
                    .filter(inv -> inv.getGeneratedAt() != null && !inv.getGeneratedAt().toLocalDate().isBefore(startOfMonth) && !inv.getGeneratedAt().toLocalDate().isAfter(endOfMonth))
                    .mapToDouble(Invoice::getTotalAmount)
                    .sum();
            double sCollected = aptInvoices.stream()
                    .filter(inv -> inv.getStatus() == InvoiceStatus.PAID && inv.getPaidAt() != null && !inv.getPaidAt().toLocalDate().isBefore(startOfMonth) && !inv.getPaidAt().toLocalDate().isAfter(endOfMonth))
                    .mapToDouble(Invoice::getTotalAmount)
                    .sum();

            double uVal = sUsage != null ? Math.round(sUsage * 100.0) / 100.0 : 0.0;
            double bVal = Math.round(sBilled * 100.0) / 100.0;
            double cVal = Math.round(sCollected * 100.0) / 100.0;
            double collRate = bVal > 0 ? Math.round((cVal / bVal) * 1000.0) / 10.0 : 100.0;

            societyStats.add(new ApartmentDtos.SocietyAnalyticsDto(
                    apt.getId(),
                    apt.getName(),
                    admin != null ? admin.getFullName() : "N/A",
                    admin != null ? admin.getEmail() : "N/A",
                    apt.getTotalHouseholds(),
                    regCount,
                    meterCount,
                    uVal,
                    bVal,
                    cVal,
                    collRate
            ));
        }

        // Top Consumer Households
        List<Household> allHouseholds = householdRepository.findAll();
        List<ApartmentDtos.TopConsumerDto> topConsumers = allHouseholds.stream().map(h -> {
            Double hUsage = waterUsageLogRepository.sumConsumptionByHouseholdAndDateBetween(h.getId(), startOfMonth, endOfMonth);
            double usageKl = hUsage != null ? Math.round(hUsage * 100.0) / 100.0 : 0.0;
            User res = userRepository.findFirstByHouseholdId(h.getId()).orElse(null);

            return new ApartmentDtos.TopConsumerDto(
                    h.getFlatNumber(),
                    h.getApartment().getName(),
                    res != null ? res.getFullName() : "Vacant",
                    usageKl
            );
        }).sorted((a, b) -> Double.compare(b.getConsumptionKl(), a.getConsumptionKl()))
                .limit(10)
                .collect(Collectors.toList());

        return ApartmentDtos.PlatformAnalyticsResponse.builder()
                .totalApartments(totalApts)
                .totalHouseholds(totalHouseholds)
                .totalUsers(totalUsers)
                .totalActiveMeters(totalActiveMeters)
                .totalConsumptionCurrentMonth(currentMonthUsage)
                .totalBilledCurrentMonth(currentMonthBilled)
                .totalCollectedCurrentMonth(currentMonthCollected)
                .collectionRatePercentage(collectionRate)
                .monthlyTrends(monthlyTrends)
                .societyStats(societyStats)
                .topConsumers(topConsumers)
                .build();
    }

    @Transactional
    public ApartmentDtos.CommunityAdminDetailResponse updateCommunityAdmin(Long adminId, ApartmentDtos.UpdateCommunityAdminRequest request) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Community Administrator not found with ID: " + adminId));

        if (admin.getRole() != Role.COMMUNITY_ADMIN) {
            throw new BadRequestException("User is not a Community Administrator");
        }

        // Check if new email is taken by someone else
        String newEmail = request.getAdminEmail().trim().toLowerCase();
        if (!newEmail.equalsIgnoreCase(admin.getEmail()) && userRepository.existsByEmail(newEmail)) {
            throw new BadRequestException("A user with email " + newEmail + " already exists");
        }

        admin.setFullName(request.getAdminFullName().trim());
        admin.setEmail(newEmail);
        if (request.getAdminPhone() != null) {
            admin.setPhoneNumber(request.getAdminPhone().trim());
        }
        if (request.getStatus() != null) {
            admin.setStatus(request.getStatus());
        }
        if (request.getAdminPassword() != null && !request.getAdminPassword().isBlank()) {
            if (request.getAdminPassword().trim().length() < 6) {
                throw new BadRequestException("Password must be at least 6 characters");
            }
            admin.setPasswordHash(passwordEncoder.encode(request.getAdminPassword().trim()));
            admin.setInitialPassword(request.getAdminPassword().trim());
        }
        userRepository.save(admin);

        // Update Apartment Details
        Apartment apt = admin.getApartment();
        if (apt != null) {
            apt.setName(request.getApartmentName().trim());
            if (request.getApartmentAddress() != null) {
                apt.setAddress(request.getApartmentAddress().trim());
            }
            if (request.getTotalHouseholds() != null && request.getTotalHouseholds() > 0) {
                apt.setTotalHouseholds(request.getTotalHouseholds());
            }
            apartmentRepository.save(apt);
        }

        log.info("Successfully updated Community Admin ID: {} and Community: {}", adminId, apt != null ? apt.getName() : "N/A");
        return getCommunityAdminById(adminId);
    }

    @Transactional
    public ApartmentDtos.CommunityAdminDetailResponse updateCommunityAdminStatus(Long adminId, UserStatus status) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Community Administrator not found with ID: " + adminId));

        if (admin.getRole() != Role.COMMUNITY_ADMIN) {
            throw new BadRequestException("User is not a Community Administrator");
        }

        admin.setStatus(status != null ? status : UserStatus.ACTIVE);
        userRepository.save(admin);
        log.info("Successfully updated Community Admin ID: {} status to {}", adminId, admin.getStatus());
        return getCommunityAdminById(adminId);
    }

    @Transactional
    public HouseholdDtos.HouseholdResponse updateHouseholdStatus(Long householdId, UserStatus status) {
        return householdService.updateHouseholdStatus(null, householdId, status);
    }

    @Transactional
    public HouseholdDtos.HouseholdResponse updateHousehold(Long householdId, HouseholdDtos.UpdateHouseholdRequest request) {
        return householdService.updateHousehold(null, householdId, request);
    }

    @Transactional
    public void deleteCommunityAdmin(Long adminId) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Community Administrator not found with ID: " + adminId));

        Apartment apt = admin.getApartment();

        // Delete Admin
        userRepository.delete(admin);
        log.info("Deleted Community Admin: {}", admin.getEmail());

        // Clean up apartment and associated data if this was the sole administrator
        if (apt != null) {
            deleteApartmentCascade(apt.getId());
        }
    }

    @Transactional
    public void deleteApartment(Long apartmentId) {
        deleteApartmentCascade(apartmentId);
    }

    private void deleteApartmentCascade(Long apartmentId) {
        Apartment apt = apartmentRepository.findById(apartmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Apartment community not found with ID: " + apartmentId));

        List<Household> households = householdRepository.findByApartmentId(apartmentId);

        for (Household h : households) {
            // Delete alerts
            alertRepository.deleteByHouseholdId(h.getId());
            // Delete logs
            waterUsageLogRepository.deleteByHouseholdId(h.getId());
            // Delete invoices
            invoiceRepository.deleteByHouseholdId(h.getId());
            // Delete resident users assigned to this flat
            Optional<User> resUser = userRepository.findFirstByHouseholdId(h.getId());
            resUser.ifPresent(userRepository::delete);
            // Delete household
            householdRepository.delete(h);
        }

        // Delete bulk purchases
        bulkPurchaseRepository.deleteByApartmentId(apartmentId);

        // Delete tariff plans
        tariffPlanRepository.deleteByApartmentId(apartmentId);

        // Delete any remaining users belonging to this apartment
        List<User> remainingUsers = userRepository.findByApartmentId(apartmentId);
        userRepository.deleteAll(remainingUsers);

        // Finally delete the apartment
        apartmentRepository.delete(apt);
        log.info("Successfully deleted apartment community ID: {} ({}) and all cascaded data.", apartmentId, apt.getName());
    }

    @Transactional(readOnly = true)
    public ApartmentDtos.MainAdminStatsResponse getStats() {
        long totalApts = apartmentRepository.count();
        long totalHouseholds = householdRepository.count();
        long totalUsers = userRepository.count();

        LocalDate firstDayOfMonth = LocalDate.now().withDayOfMonth(1);
        LocalDate lastDayOfMonth = LocalDate.now().plusMonths(1).withDayOfMonth(1).minusDays(1);

        Double totalConsumption = 0.0;
        List<Apartment> apartments = apartmentRepository.findAll();
        for (Apartment apt : apartments) {
            Double aptSum = waterUsageLogRepository.sumConsumptionByApartmentAndDateBetween(apt.getId(), firstDayOfMonth, lastDayOfMonth);
            if (aptSum != null) {
                totalConsumption += aptSum;
            }
        }

        return ApartmentDtos.MainAdminStatsResponse.builder()
                .totalApartments(totalApts)
                .totalHouseholds(totalHouseholds)
                .totalUsers(totalUsers)
                .totalConsumptionCurrentMonth(Math.round(totalConsumption * 100.0) / 100.0)
                .build();
    }

    @Transactional(readOnly = true)
    public List<ApartmentDtos.PendingVerificationResponse> getPendingVerifications() {
        List<ApartmentDtos.PendingVerificationResponse> list = new ArrayList<>();

        // 1. Pending/Rejected Community Admins
        List<Apartment> pendingApartments = apartmentRepository.findAll().stream()
                .filter(apt -> apt.getVerificationStatus() == UserStatus.PENDING_APPROVAL || apt.getVerificationStatus() == UserStatus.REJECTED)
                .collect(Collectors.toList());

        for (Apartment apt : pendingApartments) {
            User admin = userRepository.findByApartmentIdAndRole(apt.getId(), Role.COMMUNITY_ADMIN).orElse(null);
            list.add(ApartmentDtos.PendingVerificationResponse.builder()
                    .verificationType("COMMUNITY_ADMIN")
                    .userId(admin != null ? admin.getId() : null)
                    .apartmentId(apt.getId())
                    .householdId(null)
                    .apartmentName(apt.getName())
                    .flatNumber("ADMIN")
                    .address(apt.getAddress())
                    .totalHouseholds(apt.getTotalHouseholds())
                    .adminId(admin != null ? admin.getId() : null)
                    .adminFullName(admin != null ? admin.getFullName() : "N/A")
                    .adminEmail(admin != null ? admin.getEmail() : "N/A")
                    .adminPhone(admin != null ? admin.getPhoneNumber() : null)
                    .status(apt.getVerificationStatus())
                    .doc1Type(apt.getDoc1Type())
                    .doc1FileName(apt.getDoc1FileName())
                    .doc1Url(apt.getDoc1Url())
                    .doc2Type(apt.getDoc2Type())
                    .doc2FileName(apt.getDoc2FileName())
                    .doc2Url(apt.getDoc2Url())
                    .doc3Type(apt.getDoc3Type())
                    .doc3FileName(apt.getDoc3FileName())
                    .doc3Url(apt.getDoc3Url())
                    .documentUrl(apt.getDoc1Url())
                    .documentFileName(apt.getDoc1FileName())
                    .documentType(apt.getDoc1Type())
                    .aiVerificationScore(apt.getAiVerificationScore())
                    .aiVerificationStatus(apt.getAiVerificationStatus())
                    .aiVerificationSummary(apt.getAiVerificationSummary())
                    .aiExtractedDataJson(apt.getAiExtractedDataJson())
                    .verificationNotes(apt.getVerificationNotes())
                    .submittedAt(apt.getCreatedAt())
                    .reviewedAt(apt.getReviewedAt())
                    .build());
        }

        // 2. Pending/Rejected Residents
        List<User> pendingResidents = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.RESIDENT && (u.getStatus() == UserStatus.PENDING_APPROVAL || u.getStatus() == UserStatus.REJECTED))
                .collect(Collectors.toList());

        for (User resident : pendingResidents) {
            Apartment apt = resident.getApartment();
            Household h = resident.getHousehold();

            list.add(ApartmentDtos.PendingVerificationResponse.builder()
                    .verificationType("RESIDENT")
                    .userId(resident.getId())
                    .apartmentId(apt != null ? apt.getId() : null)
                    .householdId(h != null ? h.getId() : null)
                    .apartmentName(apt != null ? apt.getName() : "N/A")
                    .flatNumber(h != null ? h.getFlatNumber() : "N/A")
                    .address(apt != null ? apt.getAddress() : "")
                    .totalHouseholds(apt != null ? apt.getTotalHouseholds() : null)
                    .adminId(resident.getId())
                    .adminFullName(resident.getFullName())
                    .adminEmail(resident.getEmail())
                    .adminPhone(resident.getPhoneNumber())
                    .status(resident.getStatus())
                    .doc1Type(resident.getDoc1Type())
                    .doc1FileName(resident.getDoc1FileName())
                    .doc1Url(resident.getDoc1Url())
                    .doc2Type(resident.getDoc2Type())
                    .doc2FileName(resident.getDoc2FileName())
                    .doc2Url(resident.getDoc2Url())
                    .doc3Type(resident.getDoc3Type())
                    .doc3FileName(resident.getDoc3FileName())
                    .doc3Url(resident.getDoc3Url())
                    .documentUrl(resident.getDoc1Url())
                    .documentFileName(resident.getDoc1FileName())
                    .documentType(resident.getDoc1Type())
                    .aiVerificationScore(resident.getAiVerificationScore())
                    .aiVerificationStatus(resident.getAiVerificationStatus())
                    .aiVerificationSummary(resident.getAiVerificationSummary())
                    .aiExtractedDataJson(resident.getAiExtractedDataJson())
                    .verificationNotes(resident.getVerificationNotes())
                    .submittedAt(resident.getCreatedAt())
                    .reviewedAt(resident.getReviewedAt())
                    .build());
        }

        // Sort: PENDING_APPROVAL first, then by submittedAt descending
        list.sort((a, b) -> {
            if (a.getStatus() == UserStatus.PENDING_APPROVAL && b.getStatus() != UserStatus.PENDING_APPROVAL) return -1;
            if (a.getStatus() != UserStatus.PENDING_APPROVAL && b.getStatus() == UserStatus.PENDING_APPROVAL) return 1;
            if (a.getSubmittedAt() != null && b.getSubmittedAt() != null) return b.getSubmittedAt().compareTo(a.getSubmittedAt());
            return 0;
        });

        return list;
    }

    @Transactional
    public ApartmentDtos.PendingVerificationResponse reviewVerification(ApartmentDtos.ReviewVerificationRequest request, Long reviewerAdminId) {
        String type = request.getVerificationType() != null && !request.getVerificationType().isBlank()
                ? request.getVerificationType().trim().toUpperCase()
                : "COMMUNITY_ADMIN";
        String action = request.getAction() != null ? request.getAction().trim().toUpperCase() : "APPROVE";
        Long targetId = request.getTargetId();

        if ("APPROVE".equals(action)) {
            return approveVerification(type, targetId, reviewerAdminId);
        } else {
            return rejectVerification(type, targetId, reviewerAdminId, request.getNotes());
        }
    }

    @Transactional
    public ApartmentDtos.PendingVerificationResponse approveVerification(String verificationType, Long targetId, Long reviewerAdminId) {
        if ("RESIDENT".equalsIgnoreCase(verificationType)) {
            User resident = userRepository.findById(targetId)
                    .orElseThrow(() -> new ResourceNotFoundException("Resident user not found with ID: " + targetId));

            resident.setStatus(UserStatus.ACTIVE);
            resident.setReviewedAt(LocalDateTime.now());
            resident.setReviewedByAdminId(reviewerAdminId);
            resident.setVerificationNotes("Resident identity & flat ownership documents verified and approved.");
            userRepository.save(resident);

            Apartment apt = resident.getApartment();
            Household h = resident.getHousehold();
            if (h != null) {
                h.setStatus(UserStatus.ACTIVE);
                householdRepository.save(h);
            }

            // Send official approval & welcome credentials email to resident
            try {
                String pwd = resident.getInitialPassword() != null && !resident.getInitialPassword().isBlank()
                        ? resident.getInitialPassword() : "Resident@123";
                emailService.sendVerificationApprovedEmail(
                        resident.getEmail(),
                        resident.getFullName(),
                        apt != null ? apt.getName() : "Community",
                        "RESIDENT",
                        h != null ? h.getFlatNumber() : null,
                        pwd
                );
            } catch (Exception ex) {
                log.warn("Could not dispatch approval email to resident {}: {}", resident.getEmail(), ex.getMessage());
            }

            return ApartmentDtos.PendingVerificationResponse.builder()
                    .verificationType("RESIDENT")
                    .userId(resident.getId())
                    .apartmentId(apt != null ? apt.getId() : null)
                    .householdId(h != null ? h.getId() : null)
                    .apartmentName(apt != null ? apt.getName() : "N/A")
                    .flatNumber(h != null ? h.getFlatNumber() : "N/A")
                    .address(apt != null ? apt.getAddress() : "")
                    .adminFullName(resident.getFullName())
                    .adminEmail(resident.getEmail())
                    .adminPhone(resident.getPhoneNumber())
                    .status(UserStatus.ACTIVE)
                    .doc1Type(resident.getDoc1Type())
                    .doc1FileName(resident.getDoc1FileName())
                    .doc1Url(resident.getDoc1Url())
                    .doc2Type(resident.getDoc2Type())
                    .doc2FileName(resident.getDoc2FileName())
                    .doc2Url(resident.getDoc2Url())
                    .doc3Type(resident.getDoc3Type())
                    .doc3FileName(resident.getDoc3FileName())
                    .doc3Url(resident.getDoc3Url())
                    .aiVerificationScore(resident.getAiVerificationScore())
                    .aiVerificationStatus(resident.getAiVerificationStatus())
                    .aiVerificationSummary(resident.getAiVerificationSummary())
                    .aiExtractedDataJson(resident.getAiExtractedDataJson())
                    .verificationNotes(resident.getVerificationNotes())
                    .submittedAt(resident.getCreatedAt())
                    .reviewedAt(resident.getReviewedAt())
                    .build();
        } else {
            // Community Admin approval
            Apartment apt = apartmentRepository.findById(targetId)
                    .orElseThrow(() -> new ResourceNotFoundException("Apartment not found with ID: " + targetId));

            apt.setVerificationStatus(UserStatus.ACTIVE);
            apt.setReviewedAt(LocalDateTime.now());
            apt.setReviewedByAdminId(reviewerAdminId);
            apt.setVerificationNotes("Verified and approved by Platform Administration.");
            apartmentRepository.save(apt);

            User admin = userRepository.findByApartmentIdAndRole(apt.getId(), Role.COMMUNITY_ADMIN).orElse(null);
            if (admin != null) {
                admin.setStatus(UserStatus.ACTIVE);
                admin.setReviewedAt(LocalDateTime.now());
                admin.setReviewedByAdminId(reviewerAdminId);
                admin.setVerificationNotes("Verified and approved by Platform Administration.");
                userRepository.save(admin);

                // Send official approval email
                try {
                    String pwd = admin.getInitialPassword() != null && !admin.getInitialPassword().isBlank()
                            ? admin.getInitialPassword() : "Admin@12345";
                    emailService.sendVerificationApprovedEmail(
                            admin.getEmail(),
                            admin.getFullName(),
                            apt.getName(),
                            "COMMUNITY_ADMIN",
                            null,
                            pwd
                    );
                } catch (Exception ex) {
                    log.warn("Could not dispatch approval email to {}: {}", admin.getEmail(), ex.getMessage());
                }
            }

            return ApartmentDtos.PendingVerificationResponse.builder()
                    .verificationType("COMMUNITY_ADMIN")
                    .apartmentId(apt.getId())
                    .apartmentName(apt.getName())
                    .address(apt.getAddress())
                    .totalHouseholds(apt.getTotalHouseholds())
                    .adminId(admin != null ? admin.getId() : null)
                    .adminFullName(admin != null ? admin.getFullName() : "N/A")
                    .adminEmail(admin != null ? admin.getEmail() : "N/A")
                    .adminPhone(admin != null ? admin.getPhoneNumber() : null)
                    .status(UserStatus.ACTIVE)
                    .doc1Type(apt.getDoc1Type())
                    .doc1FileName(apt.getDoc1FileName())
                    .doc1Url(apt.getDoc1Url())
                    .doc2Type(apt.getDoc2Type())
                    .doc2FileName(apt.getDoc2FileName())
                    .doc2Url(apt.getDoc2Url())
                    .doc3Type(apt.getDoc3Type())
                    .doc3FileName(apt.getDoc3FileName())
                    .doc3Url(apt.getDoc3Url())
                    .aiVerificationScore(apt.getAiVerificationScore())
                    .aiVerificationStatus(apt.getAiVerificationStatus())
                    .aiVerificationSummary(apt.getAiVerificationSummary())
                    .aiExtractedDataJson(apt.getAiExtractedDataJson())
                    .verificationNotes(apt.getVerificationNotes())
                    .submittedAt(apt.getCreatedAt())
                    .reviewedAt(apt.getReviewedAt())
                    .build();
        }
    }

    @Transactional
    public ApartmentDtos.PendingVerificationResponse approveVerification(Long apartmentId, Long reviewerAdminId) {
        return approveVerification("COMMUNITY_ADMIN", apartmentId, reviewerAdminId);
    }

    @Transactional
    public ApartmentDtos.PendingVerificationResponse rejectVerification(String verificationType, Long targetId, Long reviewerAdminId, String notes) {
        String cleanNotes = notes != null && !notes.trim().isEmpty() ? notes.trim() : "Document verification failed. Please submit valid documents.";

        if ("RESIDENT".equalsIgnoreCase(verificationType)) {
            User resident = userRepository.findById(targetId)
                    .orElseThrow(() -> new ResourceNotFoundException("Resident user not found with ID: " + targetId));

            resident.setStatus(UserStatus.REJECTED);
            resident.setReviewedAt(LocalDateTime.now());
            resident.setReviewedByAdminId(reviewerAdminId);
            resident.setVerificationNotes(cleanNotes);
            userRepository.save(resident);

            Apartment apt = resident.getApartment();
            Household h = resident.getHousehold();

            // Send rejection email to resident
            try {
                emailService.sendVerificationRejectedEmail(
                        resident.getEmail(),
                        resident.getFullName(),
                        (apt != null ? apt.getName() : "Community") + " (Flat " + (h != null ? h.getFlatNumber() : "") + ")",
                        cleanNotes
                );
            } catch (Exception ex) {
                log.warn("Could not dispatch rejection email to resident {}: {}", resident.getEmail(), ex.getMessage());
            }

            return ApartmentDtos.PendingVerificationResponse.builder()
                    .verificationType("RESIDENT")
                    .userId(resident.getId())
                    .apartmentId(apt != null ? apt.getId() : null)
                    .householdId(h != null ? h.getId() : null)
                    .apartmentName(apt != null ? apt.getName() : "N/A")
                    .flatNumber(h != null ? h.getFlatNumber() : "N/A")
                    .address(apt != null ? apt.getAddress() : "")
                    .adminFullName(resident.getFullName())
                    .adminEmail(resident.getEmail())
                    .adminPhone(resident.getPhoneNumber())
                    .status(UserStatus.REJECTED)
                    .doc1Type(resident.getDoc1Type())
                    .doc1FileName(resident.getDoc1FileName())
                    .doc1Url(resident.getDoc1Url())
                    .doc2Type(resident.getDoc2Type())
                    .doc2FileName(resident.getDoc2FileName())
                    .doc2Url(resident.getDoc2Url())
                    .doc3Type(resident.getDoc3Type())
                    .doc3FileName(resident.getDoc3FileName())
                    .doc3Url(resident.getDoc3Url())
                    .aiVerificationScore(resident.getAiVerificationScore())
                    .aiVerificationStatus(resident.getAiVerificationStatus())
                    .aiVerificationSummary(resident.getAiVerificationSummary())
                    .aiExtractedDataJson(resident.getAiExtractedDataJson())
                    .verificationNotes(cleanNotes)
                    .submittedAt(resident.getCreatedAt())
                    .reviewedAt(resident.getReviewedAt())
                    .build();
        } else {
            Apartment apt = apartmentRepository.findById(targetId)
                    .orElseThrow(() -> new ResourceNotFoundException("Apartment not found with ID: " + targetId));

            apt.setVerificationStatus(UserStatus.REJECTED);
            apt.setReviewedAt(LocalDateTime.now());
            apt.setReviewedByAdminId(reviewerAdminId);
            apt.setVerificationNotes(cleanNotes);
            apartmentRepository.save(apt);

            User admin = userRepository.findByApartmentIdAndRole(apt.getId(), Role.COMMUNITY_ADMIN).orElse(null);
            if (admin != null) {
                admin.setStatus(UserStatus.REJECTED);
                admin.setReviewedAt(LocalDateTime.now());
                admin.setReviewedByAdminId(reviewerAdminId);
                admin.setVerificationNotes(cleanNotes);
                userRepository.save(admin);

                // Send rejection email with notes
                try {
                    emailService.sendVerificationRejectedEmail(admin.getEmail(), admin.getFullName(), apt.getName(), cleanNotes);
                } catch (Exception ex) {
                    log.warn("Could not dispatch rejection email to {}: {}", admin.getEmail(), ex.getMessage());
                }
            }

            return ApartmentDtos.PendingVerificationResponse.builder()
                    .verificationType("COMMUNITY_ADMIN")
                    .apartmentId(apt.getId())
                    .apartmentName(apt.getName())
                    .address(apt.getAddress())
                    .totalHouseholds(apt.getTotalHouseholds())
                    .adminId(admin != null ? admin.getId() : null)
                    .adminFullName(admin != null ? admin.getFullName() : "N/A")
                    .adminEmail(admin != null ? admin.getEmail() : "N/A")
                    .adminPhone(admin != null ? admin.getPhoneNumber() : null)
                    .status(UserStatus.REJECTED)
                    .doc1Type(apt.getDoc1Type())
                    .doc1FileName(apt.getDoc1FileName())
                    .doc1Url(apt.getDoc1Url())
                    .doc2Type(apt.getDoc2Type())
                    .doc2FileName(apt.getDoc2FileName())
                    .doc2Url(apt.getDoc2Url())
                    .doc3Type(apt.getDoc3Type())
                    .doc3FileName(apt.getDoc3FileName())
                    .doc3Url(apt.getDoc3Url())
                    .aiVerificationScore(apt.getAiVerificationScore())
                    .aiVerificationStatus(apt.getAiVerificationStatus())
                    .aiVerificationSummary(apt.getAiVerificationSummary())
                    .aiExtractedDataJson(apt.getAiExtractedDataJson())
                    .verificationNotes(cleanNotes)
                    .submittedAt(apt.getCreatedAt())
                    .reviewedAt(apt.getReviewedAt())
                    .build();
        }
    }

    @Transactional
    public ApartmentDtos.PendingVerificationResponse rejectVerification(Long apartmentId, Long reviewerAdminId, String notes) {
        return rejectVerification("COMMUNITY_ADMIN", apartmentId, reviewerAdminId, notes);
    }

    @Transactional
    public ApartmentDtos.PendingVerificationResponse triggerAiDocumentScan(String verificationType, Long targetId) {
        return triggerAiDocumentScan(verificationType, targetId, null);
    }

    @Transactional
    public ApartmentDtos.PendingVerificationResponse triggerAiDocumentScan(String verificationType, Long targetId, ApartmentDtos.ReviewVerificationRequest request) {
        String scanMode = (request != null && request.getScanMode() != null) ? request.getScanMode() : "DEEP_FORENSIC";
        Boolean checkNameMatch = request != null ? request.getCheckNameMatch() : true;
        Boolean checkAddressMatch = request != null ? request.getCheckAddressMatch() : true;
        Boolean checkStampSeal = request != null ? request.getCheckStampSeal() : true;
        Boolean checkTampering = request != null ? request.getCheckTampering() : true;
        Boolean checkDuplicates = request != null ? request.getCheckDuplicates() : true;

        if ("RESIDENT".equalsIgnoreCase(verificationType)) {
            User resident = userRepository.findById(targetId)
                    .orElseThrow(() -> new ResourceNotFoundException("Resident user not found with ID: " + targetId));

            Apartment apt = resident.getApartment();
            Household h = resident.getHousehold();

            DocumentVerificationService.VerificationResult aiResult = documentVerificationService.analyzeDocuments(
                    resident.getFullName(),
                    apt != null ? apt.getName() : "Resident Community",
                    h != null ? h.getFlatNumber() : "FLAT",
                    resident.getDoc1Type(), resident.getDoc1FileName(), resident.getDoc1Url(),
                    resident.getDoc2Type(), resident.getDoc2FileName(), resident.getDoc2Url(),
                    resident.getDoc3Type(), resident.getDoc3FileName(), resident.getDoc3Url(),
                    scanMode, checkNameMatch, checkAddressMatch, checkStampSeal, checkTampering, checkDuplicates
            );

            String aiJson = null;
            try {
                aiJson = objectMapper.writeValueAsString(aiResult.getExtractedData());
            } catch (Exception ignored) {}

            resident.setAiVerificationScore(aiResult.getAuthenticityScore());
            resident.setAiVerificationStatus(aiResult.getStatus());
            resident.setAiVerificationSummary(aiResult.getSummary());
            resident.setAiExtractedDataJson(aiJson);
            resident.setAiVerifiedAt(aiResult.getVerifiedAt());
            userRepository.save(resident);

            return ApartmentDtos.PendingVerificationResponse.builder()
                    .verificationType("RESIDENT")
                    .userId(resident.getId())
                    .apartmentId(apt != null ? apt.getId() : null)
                    .householdId(h != null ? h.getId() : null)
                    .apartmentName(apt != null ? apt.getName() : "N/A")
                    .flatNumber(h != null ? h.getFlatNumber() : "N/A")
                    .address(apt != null ? apt.getAddress() : "")
                    .adminFullName(resident.getFullName())
                    .adminEmail(resident.getEmail())
                    .adminPhone(resident.getPhoneNumber())
                    .status(resident.getStatus())
                    .doc1Type(resident.getDoc1Type())
                    .doc1FileName(resident.getDoc1FileName())
                    .doc1Url(resident.getDoc1Url())
                    .doc2Type(resident.getDoc2Type())
                    .doc2FileName(resident.getDoc2FileName())
                    .doc2Url(resident.getDoc2Url())
                    .doc3Type(resident.getDoc3Type())
                    .doc3FileName(resident.getDoc3FileName())
                    .doc3Url(resident.getDoc3Url())
                    .aiVerificationScore(resident.getAiVerificationScore())
                    .aiVerificationStatus(resident.getAiVerificationStatus())
                    .aiVerificationSummary(resident.getAiVerificationSummary())
                    .aiExtractedDataJson(resident.getAiExtractedDataJson())
                    .verificationNotes(resident.getVerificationNotes())
                    .submittedAt(resident.getCreatedAt())
                    .reviewedAt(resident.getReviewedAt())
                    .build();
        } else {
            Apartment apt = apartmentRepository.findById(targetId)
                    .orElseThrow(() -> new ResourceNotFoundException("Apartment not found with ID: " + targetId));

            User admin = userRepository.findByApartmentIdAndRole(apt.getId(), Role.COMMUNITY_ADMIN).orElse(null);

            DocumentVerificationService.VerificationResult aiResult = documentVerificationService.analyzeDocuments(
                    admin != null ? admin.getFullName() : apt.getName(),
                    apt.getName(),
                    "ADMIN",
                    apt.getDoc1Type(), apt.getDoc1FileName(), apt.getDoc1Url(),
                    apt.getDoc2Type(), apt.getDoc2FileName(), apt.getDoc2Url(),
                    apt.getDoc3Type(), apt.getDoc3FileName(), apt.getDoc3Url(),
                    scanMode, checkNameMatch, checkAddressMatch, checkStampSeal, checkTampering, checkDuplicates
            );

            String aiJson = null;
            try {
                aiJson = objectMapper.writeValueAsString(aiResult.getExtractedData());
            } catch (Exception ignored) {}

            apt.setAiVerificationScore(aiResult.getAuthenticityScore());
            apt.setAiVerificationStatus(aiResult.getStatus());
            apt.setAiVerificationSummary(aiResult.getSummary());
            apt.setAiExtractedDataJson(aiJson);
            apt.setAiVerifiedAt(aiResult.getVerifiedAt());
            apartmentRepository.save(apt);

            if (admin != null) {
                admin.setAiVerificationScore(aiResult.getAuthenticityScore());
                admin.setAiVerificationStatus(aiResult.getStatus());
                admin.setAiVerificationSummary(aiResult.getSummary());
                admin.setAiExtractedDataJson(aiJson);
                admin.setAiVerifiedAt(aiResult.getVerifiedAt());
                userRepository.save(admin);
            }

            return ApartmentDtos.PendingVerificationResponse.builder()
                    .verificationType("COMMUNITY_ADMIN")
                    .apartmentId(apt.getId())
                    .apartmentName(apt.getName())
                    .address(apt.getAddress())
                    .totalHouseholds(apt.getTotalHouseholds())
                    .adminId(admin != null ? admin.getId() : null)
                    .adminFullName(admin != null ? admin.getFullName() : "N/A")
                    .adminEmail(admin != null ? admin.getEmail() : "N/A")
                    .adminPhone(admin != null ? admin.getPhoneNumber() : null)
                    .status(apt.getVerificationStatus())
                    .doc1Type(apt.getDoc1Type())
                    .doc1FileName(apt.getDoc1FileName())
                    .doc1Url(apt.getDoc1Url())
                    .doc2Type(apt.getDoc2Type())
                    .doc2FileName(apt.getDoc2FileName())
                    .doc2Url(apt.getDoc2Url())
                    .doc3Type(apt.getDoc3Type())
                    .doc3FileName(apt.getDoc3FileName())
                    .doc3Url(apt.getDoc3Url())
                    .aiVerificationScore(apt.getAiVerificationScore())
                    .aiVerificationStatus(apt.getAiVerificationStatus())
                    .aiVerificationSummary(apt.getAiVerificationSummary())
                    .aiExtractedDataJson(apt.getAiExtractedDataJson())
                    .verificationNotes(apt.getVerificationNotes())
                    .submittedAt(apt.getCreatedAt())
                    .reviewedAt(apt.getReviewedAt())
                    .build();
        }
    }
}
