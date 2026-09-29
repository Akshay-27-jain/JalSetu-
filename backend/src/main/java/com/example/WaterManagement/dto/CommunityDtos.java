package com.example.WaterManagement.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class CommunityDtos {

    // ---------------- SUPPORT TICKET DTOS ----------------

    public static class SupportTicketDto {
        private Long id;
        private Long apartmentId;
        private String apartmentName;
        private Long householdId;
        private String flatNumber;
        private Long userId;
        private String residentName;
        private String residentEmail;
        private String category;
        private String priority;
        private String status;
        private String subject;
        private String description;
        private String resolutionNotes;
        private LocalDateTime resolvedAt;
        private Boolean isEscalatedToMainAdmin;
        private String escalationReason;
        private LocalDateTime escalatedAt;
        private String ticketScope;
        private String mainAdminNotes;
        private String resolvedByRole;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public SupportTicketDto() {}

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getApartmentId() { return apartmentId; }
        public void setApartmentId(Long apartmentId) { this.apartmentId = apartmentId; }
        public String getApartmentName() { return apartmentName; }
        public void setApartmentName(String apartmentName) { this.apartmentName = apartmentName; }
        public Long getHouseholdId() { return householdId; }
        public void setHouseholdId(Long householdId) { this.householdId = householdId; }
        public String getFlatNumber() { return flatNumber; }
        public void setFlatNumber(String flatNumber) { this.flatNumber = flatNumber; }
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public String getResidentName() { return residentName; }
        public void setResidentName(String residentName) { this.residentName = residentName; }
        public String getResidentEmail() { return residentEmail; }
        public void setResidentEmail(String residentEmail) { this.residentEmail = residentEmail; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public String getPriority() { return priority; }
        public void setPriority(String priority) { this.priority = priority; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getSubject() { return subject; }
        public void setSubject(String subject) { this.subject = subject; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getResolutionNotes() { return resolutionNotes; }
        public void setResolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; }
        public LocalDateTime getResolvedAt() { return resolvedAt; }
        public void setResolvedAt(LocalDateTime resolvedAt) { this.resolvedAt = resolvedAt; }
        public Boolean getIsEscalatedToMainAdmin() { return isEscalatedToMainAdmin; }
        public void setIsEscalatedToMainAdmin(Boolean isEscalatedToMainAdmin) { this.isEscalatedToMainAdmin = isEscalatedToMainAdmin; }
        public String getEscalationReason() { return escalationReason; }
        public void setEscalationReason(String escalationReason) { this.escalationReason = escalationReason; }
        public LocalDateTime getEscalatedAt() { return escalatedAt; }
        public void setEscalatedAt(LocalDateTime escalatedAt) { this.escalatedAt = escalatedAt; }
        public String getTicketScope() { return ticketScope; }
        public void setTicketScope(String ticketScope) { this.ticketScope = ticketScope; }
        public String getMainAdminNotes() { return mainAdminNotes; }
        public void setMainAdminNotes(String mainAdminNotes) { this.mainAdminNotes = mainAdminNotes; }
        public String getResolvedByRole() { return resolvedByRole; }
        public void setResolvedByRole(String resolvedByRole) { this.resolvedByRole = resolvedByRole; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
        public LocalDateTime getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    }

    public static class CreateSupportTicketRequest {
        @NotBlank(message = "Category is required")
        private String category; // METER_DEFECT, BILLING_DISPUTE, WATER_LEAKAGE, LOW_PRESSURE, WATER_QUALITY, GENERAL

        private String priority = "MEDIUM"; // LOW, MEDIUM, HIGH, URGENT

        @NotBlank(message = "Subject is required")
        private String subject;

        @NotBlank(message = "Description is required")
        private String description;

        public CreateSupportTicketRequest() {}

        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public String getPriority() { return priority; }
        public void setPriority(String priority) { this.priority = priority; }
        public String getSubject() { return subject; }
        public void setSubject(String subject) { this.subject = subject; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }

    public static class UpdateTicketStatusRequest {
        @NotBlank(message = "Status is required")
        private String status; // OPEN, IN_PROGRESS, RESOLVED, CLOSED

        private String resolutionNotes;

        public UpdateTicketStatusRequest() {}

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getResolutionNotes() { return resolutionNotes; }
        public void setResolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; }
    }

    public static class EscalateTicketRequest {
        @NotBlank(message = "Escalation reason is required")
        private String escalationReason;

        public EscalateTicketRequest() {}

        public String getEscalationReason() { return escalationReason; }
        public void setEscalationReason(String escalationReason) { this.escalationReason = escalationReason; }
    }

    public static class CreateCommunityConcernRequest {
        @NotBlank(message = "Category is required")
        private String category; // BULK_SUPPLY_ISSUE, HARDWARE_DEFECT, TARIFF_DISPUTE, MUNICIPAL_OUTAGE, GENERAL

        private String priority = "HIGH"; // MEDIUM, HIGH, URGENT

        @NotBlank(message = "Subject is required")
        private String subject;

        @NotBlank(message = "Description is required")
        private String description;

        public CreateCommunityConcernRequest() {}

        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public String getPriority() { return priority; }
        public void setPriority(String priority) { this.priority = priority; }
        public String getSubject() { return subject; }
        public void setSubject(String subject) { this.subject = subject; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }

    public static class ResolveTicketByMainAdminRequest {
        @NotBlank(message = "Status is required")
        private String status = "RESOLVED"; // IN_PROGRESS, RESOLVED, CLOSED

        @NotBlank(message = "Main Admin notes are required")
        private String mainAdminNotes;

        private String resolutionNotes;

        public ResolveTicketByMainAdminRequest() {}

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getMainAdminNotes() { return mainAdminNotes; }
        public void setMainAdminNotes(String mainAdminNotes) { this.mainAdminNotes = mainAdminNotes; }
        public String getResolutionNotes() { return resolutionNotes; }
        public void setResolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; }
    }

    // ---------------- ANNOUNCEMENT DTOS ----------------

    public static class AnnouncementDto {
        private Long id;
        private Long apartmentId;
        private String apartmentName;
        private String title;
        private String content;
        private String category;
        private String priority;
        private Boolean isPinned;
        private Boolean isMainAdminBroadcast;
        private Long targetApartmentId;
        private Boolean forwardedToResidentsByEmail;
        private LocalDateTime forwardedAt;
        private String forwardedByAdminName;
        private LocalDate publishDate;
        private LocalDate expiryDate;
        private LocalDateTime createdAt;
        private Integer recipientCount;

        public AnnouncementDto() {}

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getApartmentId() { return apartmentId; }
        public void setApartmentId(Long apartmentId) { this.apartmentId = apartmentId; }
        public String getApartmentName() { return apartmentName; }
        public void setApartmentName(String apartmentName) { this.apartmentName = apartmentName; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public String getPriority() { return priority; }
        public void setPriority(String priority) { this.priority = priority; }
        public Boolean getIsPinned() { return isPinned; }
        public void setIsPinned(Boolean isPinned) { this.isPinned = isPinned; }
        public Boolean getIsMainAdminBroadcast() { return isMainAdminBroadcast; }
        public void setIsMainAdminBroadcast(Boolean isMainAdminBroadcast) { this.isMainAdminBroadcast = isMainAdminBroadcast; }
        public Long getTargetApartmentId() { return targetApartmentId; }
        public void setTargetApartmentId(Long targetApartmentId) { this.targetApartmentId = targetApartmentId; }
        public Boolean getForwardedToResidentsByEmail() { return forwardedToResidentsByEmail; }
        public void setForwardedToResidentsByEmail(Boolean forwardedToResidentsByEmail) { this.forwardedToResidentsByEmail = forwardedToResidentsByEmail; }
        public LocalDateTime getForwardedAt() { return forwardedAt; }
        public void setForwardedAt(LocalDateTime forwardedAt) { this.forwardedAt = forwardedAt; }
        public String getForwardedByAdminName() { return forwardedByAdminName; }
        public void setForwardedByAdminName(String forwardedByAdminName) { this.forwardedByAdminName = forwardedByAdminName; }
        public LocalDate getPublishDate() { return publishDate; }
        public void setPublishDate(LocalDate publishDate) { this.publishDate = publishDate; }
        public LocalDate getExpiryDate() { return expiryDate; }
        public void setExpiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
        public Integer getRecipientCount() { return recipientCount; }
        public void setRecipientCount(Integer recipientCount) { this.recipientCount = recipientCount; }
    }

    public static class CreateAnnouncementRequest {
        @NotBlank(message = "Title is required")
        private String title;

        @NotBlank(message = "Content is required")
        private String content;

        private String category = "GENERAL";
        private String priority = "NORMAL";
        private Boolean isPinned = false;
        private LocalDate publishDate;
        private LocalDate expiryDate;
        private Boolean sendEmailBroadcast = false;

        public CreateAnnouncementRequest() {}

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public String getPriority() { return priority; }
        public void setPriority(String priority) { this.priority = priority; }
        public Boolean getIsPinned() { return isPinned; }
        public void setIsPinned(Boolean isPinned) { this.isPinned = isPinned; }
        public LocalDate getPublishDate() { return publishDate; }
        public void setPublishDate(LocalDate publishDate) { this.publishDate = publishDate; }
        public LocalDate getExpiryDate() { return expiryDate; }
        public void setExpiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; }
        public Boolean getSendEmailBroadcast() { return sendEmailBroadcast; }
        public void setSendEmailBroadcast(Boolean sendEmailBroadcast) { this.sendEmailBroadcast = sendEmailBroadcast; }
    }

    public static class CreateMainAdminAnnouncementRequest {
        @NotBlank(message = "Title is required")
        private String title;

        @NotBlank(message = "Content is required")
        private String content;

        private String category = "GENERAL"; // WATER_QUALITY, RATIONING_ADVISORY, MAINTENANCE, GENERAL
        private String priority = "NORMAL"; // NORMAL, IMPORTANT, CRITICAL
        private Boolean isPinned = false;
        private Long targetApartmentId; // null = all societies
        private Boolean sendEmailBroadcast = false;

        public CreateMainAdminAnnouncementRequest() {}

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public String getPriority() { return priority; }
        public void setPriority(String priority) { this.priority = priority; }
        public Boolean getIsPinned() { return isPinned; }
        public void setIsPinned(Boolean isPinned) { this.isPinned = isPinned; }
        public Long getTargetApartmentId() { return targetApartmentId; }
        public void setTargetApartmentId(Long targetApartmentId) { this.targetApartmentId = targetApartmentId; }
        public Boolean getSendEmailBroadcast() { return sendEmailBroadcast; }
        public void setSendEmailBroadcast(Boolean sendEmailBroadcast) { this.sendEmailBroadcast = sendEmailBroadcast; }
    }
}
