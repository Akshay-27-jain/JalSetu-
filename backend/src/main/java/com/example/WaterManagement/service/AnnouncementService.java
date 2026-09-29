package com.example.WaterManagement.service;

import com.example.WaterManagement.dto.CommunityDtos.*;
import com.example.WaterManagement.entity.Announcement;
import com.example.WaterManagement.entity.Apartment;
import com.example.WaterManagement.entity.User;
import com.example.WaterManagement.repository.AnnouncementRepository;
import com.example.WaterManagement.repository.ApartmentRepository;
import com.example.WaterManagement.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class AnnouncementService {

    private static final Logger log = LoggerFactory.getLogger(AnnouncementService.class);

    private final AnnouncementRepository announcementRepository;
    private final ApartmentRepository apartmentRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    public AnnouncementService(AnnouncementRepository announcementRepository,
                               ApartmentRepository apartmentRepository,
                               UserRepository userRepository,
                               EmailService emailService) {
        this.announcementRepository = announcementRepository;
        this.apartmentRepository = apartmentRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    @Transactional(readOnly = true)
    public List<AnnouncementDto> getAnnouncementsForApartment(Long apartmentId, boolean activeOnly) {
        List<Announcement> list = activeOnly
                ? announcementRepository.findActiveByApartmentIdOrMainAdminBroadcast(apartmentId)
                : announcementRepository.findAllByApartmentIdOrMainAdminBroadcast(apartmentId);
        return list.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AnnouncementDto> getAllMainAdminBroadcasts() {
        return announcementRepository.findAllMainAdminBroadcasts()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public AnnouncementDto createAnnouncement(Long apartmentId, CreateAnnouncementRequest req) {
        Apartment apt = apartmentRepository.findById(apartmentId)
                .orElseThrow(() -> new IllegalArgumentException("Apartment not found with id: " + apartmentId));

        Announcement announcement = new Announcement(
                apt,
                req.getTitle(),
                req.getContent(),
                req.getCategory() != null ? req.getCategory() : "GENERAL",
                req.getPriority() != null ? req.getPriority() : "NORMAL",
                req.getIsPinned() != null ? req.getIsPinned() : false,
                req.getPublishDate() != null ? req.getPublishDate() : LocalDate.now(),
                req.getExpiryDate()
        );

        Announcement saved = announcementRepository.save(announcement);
        log.info("📢 Created announcement #{} '{}' for apartment {}", saved.getId(), saved.getTitle(), apt.getName());

        // Broadcast email to all residents (unless explicitly disabled)
        if (!Boolean.FALSE.equals(req.getSendEmailBroadcast())) {
            broadcastToResidents(apt, saved);
        }

        return mapToDto(saved);
    }

    public AnnouncementDto createMainAdminAnnouncement(CreateMainAdminAnnouncementRequest req) {
        Announcement announcement = new Announcement();
        announcement.setTitle(req.getTitle());
        announcement.setContent(req.getContent());
        announcement.setCategory(req.getCategory() != null ? req.getCategory() : "GENERAL");
        announcement.setPriority(req.getPriority() != null ? req.getPriority() : "NORMAL");
        announcement.setIsPinned(req.getIsPinned() != null ? req.getIsPinned() : false);
        announcement.setIsMainAdminBroadcast(true);
        announcement.setTargetApartmentId(req.getTargetApartmentId());
        announcement.setPublishDate(LocalDate.now());
        announcement.setCreatedAt(LocalDateTime.now());

        if (req.getTargetApartmentId() != null) {
            apartmentRepository.findById(req.getTargetApartmentId()).ifPresent(announcement::setApartment);
        }

        Announcement saved = announcementRepository.save(announcement);
        log.info("📢 Created Main Admin Broadcast #{} '{}'", saved.getId(), saved.getTitle());

        // Broadcast to relevant residents via email
        try {
            if (req.getTargetApartmentId() != null) {
                apartmentRepository.findById(req.getTargetApartmentId()).ifPresent(apt -> broadcastToResidents(apt, saved));
            } else {
                List<Apartment> allApts = apartmentRepository.findAll();
                for (Apartment apt : allApts) {
                    broadcastToResidents(apt, saved);
                }
            }
        } catch (Exception e) {
            log.warn("Could not complete Main Admin announcement email broadcast: {}", e.getMessage());
        }

        return mapToDto(saved);
    }

    public AnnouncementDto forwardAnnouncementToResidents(Long announcementId, Long apartmentId, String adminName) {
        Announcement announcement = announcementRepository.findById(announcementId)
                .orElseThrow(() -> new IllegalArgumentException("Announcement not found with id: " + announcementId));

        Apartment apt = apartmentRepository.findById(apartmentId)
                .orElseThrow(() -> new IllegalArgumentException("Apartment not found with id: " + apartmentId));

        announcement.setForwardedToResidentsByEmail(true);
        announcement.setForwardedAt(LocalDateTime.now());
        announcement.setForwardedByAdminName(adminName);

        Announcement saved = announcementRepository.save(announcement);
        broadcastToResidents(apt, saved);

        List<User> residents = userRepository.findByApartmentId(apt.getId());
        int recipientCount = 0;
        if (residents != null) {
            for (User u : residents) {
                if (u.getEmail() != null && !u.getEmail().trim().isEmpty() && u.getRole() == com.example.WaterManagement.entity.Role.RESIDENT) {
                    recipientCount++;
                }
            }
        }

        log.info("📢 Forwarded announcement #{} to all residents of apartment {} by admin {} (recipients: {})", announcementId, apt.getName(), adminName, recipientCount);
        AnnouncementDto dto = mapToDto(saved);
        dto.setRecipientCount(recipientCount);
        return dto;
    }

    private void broadcastToResidents(Apartment apt, Announcement a) {
        try {
            List<User> residents = userRepository.findByApartmentId(apt.getId());
            for (User resident : residents) {
                if (resident.getEmail() != null && !resident.getEmail().trim().isEmpty()) {
                    emailService.sendAnnouncementBroadcastEmail(
                            resident.getEmail(),
                            resident.getFullName() != null ? resident.getFullName() : "Resident",
                            apt.getName(),
                            a.getTitle(),
                            a.getCategory(),
                            a.getPriority(),
                            a.getContent()
                    );
                }
            }
        } catch (Exception e) {
            log.warn("Could not complete full announcement email broadcast: {}", e.getMessage());
        }
    }

    public void deleteAnnouncement(Long id) {
        announcementRepository.deleteById(id);
        log.info("Deleted announcement #{}", id);
    }

    private AnnouncementDto mapToDto(Announcement a) {
        AnnouncementDto dto = new AnnouncementDto();
        dto.setId(a.getId());
        dto.setApartmentId(a.getApartment() != null ? a.getApartment().getId() : null);
        dto.setApartmentName(a.getApartment() != null ? a.getApartment().getName() : "All Connected Societies");
        dto.setTitle(a.getTitle());
        dto.setContent(a.getContent());
        dto.setCategory(a.getCategory());
        dto.setPriority(a.getPriority());
        dto.setIsPinned(a.getIsPinned());
        dto.setIsMainAdminBroadcast(a.getIsMainAdminBroadcast());
        dto.setTargetApartmentId(a.getTargetApartmentId());
        dto.setForwardedToResidentsByEmail(a.getForwardedToResidentsByEmail());
        dto.setForwardedAt(a.getForwardedAt());
        dto.setForwardedByAdminName(a.getForwardedByAdminName());
        dto.setPublishDate(a.getPublishDate());
        dto.setExpiryDate(a.getExpiryDate());
        dto.setCreatedAt(a.getCreatedAt());
        return dto;
    }
}
