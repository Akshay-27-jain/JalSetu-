package com.example.WaterManagement.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "support_tickets")
public class SupportTicket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "apartment_id", nullable = false)
    private Apartment apartment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "household_id")
    private Household household;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false, length = 50)
    private String category; // METER_DEFECT, BILLING_DISPUTE, WATER_LEAKAGE, LOW_PRESSURE, WATER_QUALITY, BULK_SUPPLY_ISSUE, GENERAL

    @Column(nullable = false, length = 20)
    private String priority = "MEDIUM"; // LOW, MEDIUM, HIGH, URGENT

    @Column(nullable = false, length = 30)
    private String status = "OPEN"; // OPEN, IN_PROGRESS, RESOLVED, CLOSED

    @Column(nullable = false, length = 200)
    private String subject;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String resolutionNotes;

    private LocalDateTime resolvedAt;

    // Escalation & Main Admin fields
    @Column(nullable = false)
    private Boolean isEscalatedToMainAdmin = false;

    @Column(columnDefinition = "TEXT")
    private String escalationReason;

    private LocalDateTime escalatedAt;

    @Column(length = 50)
    private String ticketScope = "HOUSEHOLD"; // HOUSEHOLD, COMMUNITY_ADMIN_ISSUE

    @Column(columnDefinition = "TEXT")
    private String mainAdminNotes;

    @Column(length = 30)
    private String resolvedByRole; // COMMUNITY_ADMIN, MAIN_ADMIN

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    public SupportTicket() {}

    public SupportTicket(Apartment apartment, Household household, User user, String category, String priority, String subject, String description) {
        this.apartment = apartment;
        this.household = household;
        this.user = user;
        this.category = category;
        this.priority = priority != null ? priority : "MEDIUM";
        this.status = "OPEN";
        this.subject = subject;
        this.description = description;
        this.isEscalatedToMainAdmin = false;
        this.ticketScope = "HOUSEHOLD";
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Apartment getApartment() { return apartment; }
    public void setApartment(Apartment apartment) { this.apartment = apartment; }
    public Household getHousehold() { return household; }
    public void setHousehold(Household household) { this.household = household; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
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
    public Boolean getIsEscalatedToMainAdmin() { return isEscalatedToMainAdmin != null ? isEscalatedToMainAdmin : false; }
    public void setIsEscalatedToMainAdmin(Boolean isEscalatedToMainAdmin) { this.isEscalatedToMainAdmin = isEscalatedToMainAdmin; }
    public String getEscalationReason() { return escalationReason; }
    public void setEscalationReason(String escalationReason) { this.escalationReason = escalationReason; }
    public LocalDateTime getEscalatedAt() { return escalatedAt; }
    public void setEscalatedAt(LocalDateTime escalatedAt) { this.escalatedAt = escalatedAt; }
    public String getTicketScope() { return ticketScope != null ? ticketScope : "HOUSEHOLD"; }
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
