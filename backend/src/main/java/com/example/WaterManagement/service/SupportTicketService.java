package com.example.WaterManagement.service;

import com.example.WaterManagement.dto.CommunityDtos.*;
import com.example.WaterManagement.entity.Apartment;
import com.example.WaterManagement.entity.Household;
import com.example.WaterManagement.entity.Role;
import com.example.WaterManagement.entity.SupportTicket;
import com.example.WaterManagement.entity.User;
import com.example.WaterManagement.repository.ApartmentRepository;
import com.example.WaterManagement.repository.HouseholdRepository;
import com.example.WaterManagement.repository.SupportTicketRepository;
import com.example.WaterManagement.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class SupportTicketService {

    private static final Logger log = LoggerFactory.getLogger(SupportTicketService.class);

    private final SupportTicketRepository supportTicketRepository;
    private final ApartmentRepository apartmentRepository;
    private final HouseholdRepository householdRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    public SupportTicketService(SupportTicketRepository supportTicketRepository,
                                ApartmentRepository apartmentRepository,
                                HouseholdRepository householdRepository,
                                UserRepository userRepository,
                                EmailService emailService) {
        this.supportTicketRepository = supportTicketRepository;
        this.apartmentRepository = apartmentRepository;
        this.householdRepository = householdRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    @Transactional(readOnly = true)
    public List<SupportTicketDto> getTicketsForApartment(Long apartmentId) {
        return supportTicketRepository.findAllByApartmentIdWithDetails(apartmentId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SupportTicketDto> getTicketsForHousehold(Long householdId) {
        return supportTicketRepository.findAllByHouseholdIdWithDetails(householdId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SupportTicketDto> getAllPlatformTickets(String filter) {
        List<SupportTicket> list;
        if ("escalated".equalsIgnoreCase(filter) || "concerns".equalsIgnoreCase(filter)) {
            list = supportTicketRepository.findAllEscalatedAndCommunityConcernsWithDetails();
        } else {
            list = supportTicketRepository.findAllPlatformTicketsWithDetails();
        }

        if ("resolved".equalsIgnoreCase(filter)) {
            list = list.stream()
                    .filter(t -> "RESOLVED".equalsIgnoreCase(t.getStatus()) || "CLOSED".equalsIgnoreCase(t.getStatus()))
                    .collect(Collectors.toList());
        } else if ("open".equalsIgnoreCase(filter)) {
            list = list.stream()
                    .filter(t -> !"RESOLVED".equalsIgnoreCase(t.getStatus()) && !"CLOSED".equalsIgnoreCase(t.getStatus()))
                    .collect(Collectors.toList());
        }

        return list.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public SupportTicketDto createTicket(Long apartmentId, Long householdId, Long userId, CreateSupportTicketRequest req) {
        Apartment apt = apartmentRepository.findById(apartmentId)
                .orElseThrow(() -> new IllegalArgumentException("Apartment not found with id: " + apartmentId));

        Household household = null;
        if (householdId != null) {
            household = householdRepository.findById(householdId).orElse(null);
        }

        User user = null;
        if (userId != null) {
            user = userRepository.findById(userId).orElse(null);
        }

        SupportTicket ticket = new SupportTicket(
                apt,
                household,
                user,
                req.getCategory(),
                req.getPriority() != null ? req.getPriority() : "MEDIUM",
                req.getSubject(),
                req.getDescription()
        );

        SupportTicket saved = supportTicketRepository.save(ticket);
        String flatNo = household != null ? household.getFlatNumber() : "N/A";
        log.info("Created support ticket #{} for apartment: {}, flat: {}", saved.getId(), apt.getName(), flatNo);

        // 1. Notify Community Admin via Email
        try {
            Optional<User> adminOpt = userRepository.findByApartmentIdAndRole(apartmentId, Role.COMMUNITY_ADMIN);
            if (adminOpt.isPresent()) {
                User admin = adminOpt.get();
                emailService.sendNewTicketNotificationToAdmin(
                        admin.getEmail(),
                        admin.getFullName(),
                        apt.getName(),
                        flatNo,
                        req.getCategory(),
                        req.getPriority() != null ? req.getPriority() : "MEDIUM",
                        req.getSubject(),
                        req.getDescription(),
                        saved.getId()
                );
            }
        } catch (Exception e) {
            log.warn("Could not dispatch ticket notification to Community Admin: {}", e.getMessage());
        }

        // 2. Send Acknowledgment Email to Resident
        try {
            if (user != null && user.getEmail() != null) {
                emailService.sendTicketCreatedAcknowledgment(
                        user.getEmail(),
                        user.getFullName(),
                        flatNo,
                        apt.getName(),
                        saved.getId(),
                        req.getSubject(),
                        req.getPriority() != null ? req.getPriority() : "MEDIUM"
                );
            }
        } catch (Exception e) {
            log.warn("Could not dispatch ticket acknowledgment to Resident: {}", e.getMessage());
        }

        return mapToDto(saved);
    }

    public SupportTicketDto updateTicketStatus(Long ticketId, UpdateTicketStatusRequest req) {
        SupportTicket ticket = supportTicketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Support ticket not found with id: " + ticketId));

        ticket.setStatus(req.getStatus());
        if (req.getResolutionNotes() != null && !req.getResolutionNotes().trim().isEmpty()) {
            ticket.setResolutionNotes(req.getResolutionNotes().trim());
        }
        boolean isResolved = "RESOLVED".equalsIgnoreCase(req.getStatus()) || "CLOSED".equalsIgnoreCase(req.getStatus());
        if (isResolved) {
            ticket.setResolvedAt(LocalDateTime.now());
            ticket.setResolvedByRole("COMMUNITY_ADMIN");
        }

        SupportTicket saved = supportTicketRepository.save(ticket);
        log.info("Updated support ticket #{} status to {}", saved.getId(), saved.getStatus());

        // Send Resolution Email to Resident if resolved
        if (isResolved && ticket.getUser() != null && ticket.getUser().getEmail() != null) {
            try {
                emailService.sendTicketResolutionNotification(
                        ticket.getUser().getEmail(),
                        ticket.getUser().getFullName(),
                        ticket.getId(),
                        ticket.getSubject(),
                        ticket.getResolutionNotes(),
                        "COMMUNITY_ADMIN"
                );
            } catch (Exception e) {
                log.warn("Could not dispatch ticket resolution email to Resident: {}", e.getMessage());
            }
        }

        return mapToDto(saved);
    }

    public SupportTicketDto escalateTicketToMainAdmin(Long ticketId, EscalateTicketRequest req, String adminEmail) {
        SupportTicket ticket = supportTicketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Support ticket not found with id: " + ticketId));

        ticket.setIsEscalatedToMainAdmin(true);
        ticket.setEscalationReason(req.getEscalationReason());
        ticket.setEscalatedAt(LocalDateTime.now());
        ticket.setStatus("IN_PROGRESS");
        if ("LOW".equalsIgnoreCase(ticket.getPriority()) || "MEDIUM".equalsIgnoreCase(ticket.getPriority())) {
            ticket.setPriority("HIGH");
        }

        SupportTicket saved = supportTicketRepository.save(ticket);
        log.info("Escalated ticket #{} to Main Admin by admin {}. Reason: {}", ticketId, adminEmail, req.getEscalationReason());

        // 1. Notify Main Admin via Email
        try {
            emailService.sendCommunityConcernToMainAdmin(
                    "admin@aquatrack.com",
                    adminEmail,
                    adminEmail,
                    ticket.getApartment() != null ? ticket.getApartment().getName() : "Community",
                    ticket.getId(),
                    ticket.getSubject(),
                    ticket.getDescription(),
                    req.getEscalationReason()
            );
        } catch (Exception e) {
            log.warn("Could not dispatch escalation email to Main Admin: {}", e.getMessage());
        }

        // 2. Notify Resident of Escalation
        if (ticket.getUser() != null && ticket.getUser().getEmail() != null) {
            try {
                emailService.sendTicketEscalationEmail(
                        ticket.getUser().getEmail(),
                        ticket.getUser().getFullName(),
                        ticket.getId(),
                        ticket.getSubject(),
                        "ESCALATED TO MAIN ADMIN",
                        "Reason: " + req.getEscalationReason(),
                        false
                );
            } catch (Exception e) {
                log.warn("Could not dispatch escalation notice to Resident: {}", e.getMessage());
            }
        }

        return mapToDto(saved);
    }

    public SupportTicketDto createCommunityAdminConcern(Long apartmentId, Long adminUserId, CreateCommunityConcernRequest req) {
        Apartment apt = apartmentRepository.findById(apartmentId)
                .orElseThrow(() -> new IllegalArgumentException("Apartment not found with id: " + apartmentId));

        User user = null;
        if (adminUserId != null) {
            user = userRepository.findById(adminUserId).orElse(null);
        }

        SupportTicket ticket = new SupportTicket();
        ticket.setApartment(apt);
        ticket.setUser(user);
        ticket.setCategory(req.getCategory() != null ? req.getCategory() : "BULK_SUPPLY_ISSUE");
        ticket.setPriority(req.getPriority() != null ? req.getPriority() : "HIGH");
        ticket.setSubject(req.getSubject());
        ticket.setDescription(req.getDescription());
        ticket.setStatus("OPEN");
        ticket.setTicketScope("COMMUNITY_ADMIN_ISSUE");
        ticket.setIsEscalatedToMainAdmin(true);
        ticket.setEscalatedAt(LocalDateTime.now());
        ticket.setCreatedAt(LocalDateTime.now());
        ticket.setUpdatedAt(LocalDateTime.now());

        SupportTicket saved = supportTicketRepository.save(ticket);
        log.info("Created Community Admin Concern #{} for apartment: {}", saved.getId(), apt.getName());

        // Dispatch Email to Main Admin
        try {
            emailService.sendCommunityConcernToMainAdmin(
                    "admin@aquatrack.com",
                    user != null ? user.getFullName() : "Community Admin",
                    user != null ? user.getEmail() : "admin@community.com",
                    apt.getName(),
                    saved.getId(),
                    req.getSubject(),
                    req.getDescription(),
                    null
            );
        } catch (Exception e) {
            log.warn("Could not dispatch concern email to Main Admin: {}", e.getMessage());
        }

        return mapToDto(saved);
    }

    public SupportTicketDto resolveTicketByMainAdmin(Long ticketId, ResolveTicketByMainAdminRequest req) {
        SupportTicket ticket = supportTicketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Support ticket not found with id: " + ticketId));

        ticket.setStatus(req.getStatus());
        ticket.setMainAdminNotes(req.getMainAdminNotes());
        if (req.getResolutionNotes() != null && !req.getResolutionNotes().trim().isEmpty()) {
            ticket.setResolutionNotes(req.getResolutionNotes().trim());
        }
        ticket.setResolvedByRole("MAIN_ADMIN");
        boolean isResolved = "RESOLVED".equalsIgnoreCase(req.getStatus()) || "CLOSED".equalsIgnoreCase(req.getStatus());
        if (isResolved) {
            ticket.setResolvedAt(LocalDateTime.now());
        }

        SupportTicket saved = supportTicketRepository.save(ticket);
        log.info("Main Admin resolved ticket #{} with status {}. Notes: {}", ticketId, req.getStatus(), req.getMainAdminNotes());

        // Dispatch Resolution Email
        if (isResolved && ticket.getUser() != null && ticket.getUser().getEmail() != null) {
            try {
                emailService.sendTicketResolutionNotification(
                        ticket.getUser().getEmail(),
                        ticket.getUser().getFullName(),
                        ticket.getId(),
                        ticket.getSubject(),
                        req.getMainAdminNotes() != null ? req.getMainAdminNotes() : ticket.getResolutionNotes(),
                        "MAIN_ADMIN"
                );
            } catch (Exception e) {
                log.warn("Could not dispatch resolution email: {}", e.getMessage());
            }
        }

        return mapToDto(saved);
    }

    private SupportTicketDto mapToDto(SupportTicket t) {
        SupportTicketDto dto = new SupportTicketDto();
        dto.setId(t.getId());
        dto.setApartmentId(t.getApartment() != null ? t.getApartment().getId() : null);
        dto.setApartmentName(t.getApartment() != null ? t.getApartment().getName() : "All Communities");
        dto.setHouseholdId(t.getHousehold() != null ? t.getHousehold().getId() : null);
        dto.setFlatNumber(t.getHousehold() != null ? t.getHousehold().getFlatNumber() : (t.getTicketScope().equals("COMMUNITY_ADMIN_ISSUE") ? "Admin Concern" : "N/A"));
        dto.setUserId(t.getUser() != null ? t.getUser().getId() : null);
        dto.setResidentName(t.getUser() != null ? t.getUser().getFullName() : (t.getHousehold() != null ? "Flat " + t.getHousehold().getFlatNumber() : "Resident"));
        dto.setResidentEmail(t.getUser() != null ? t.getUser().getEmail() : null);
        dto.setCategory(t.getCategory());
        dto.setPriority(t.getPriority());
        dto.setStatus(t.getStatus());
        dto.setSubject(t.getSubject());
        dto.setDescription(t.getDescription());
        dto.setResolutionNotes(t.getResolutionNotes());
        dto.setResolvedAt(t.getResolvedAt());
        dto.setIsEscalatedToMainAdmin(t.getIsEscalatedToMainAdmin());
        dto.setEscalationReason(t.getEscalationReason());
        dto.setEscalatedAt(t.getEscalatedAt());
        dto.setTicketScope(t.getTicketScope());
        dto.setMainAdminNotes(t.getMainAdminNotes());
        dto.setResolvedByRole(t.getResolvedByRole());
        dto.setCreatedAt(t.getCreatedAt());
        dto.setUpdatedAt(t.getUpdatedAt());
        return dto;
    }
}
