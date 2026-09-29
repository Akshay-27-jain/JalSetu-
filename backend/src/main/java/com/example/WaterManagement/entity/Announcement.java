package com.example.WaterManagement.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "announcements")
public class Announcement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "apartment_id", nullable = true)
    private Apartment apartment; // null if broadcast to ALL communities by Main Admin

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false, length = 50)
    private String category = "GENERAL"; // TANK_CLEANING, SUPPLY_INTERRUPTION, MAINTENANCE, BILLING_NOTICE, WATER_QUALITY, RATIONING_ADVISORY, GENERAL

    @Column(nullable = false, length = 20)
    private String priority = "NORMAL"; // NORMAL, IMPORTANT, CRITICAL

    @Column(nullable = false)
    private Boolean isPinned = false;

    // Multi-Tier Broadcasting Fields
    @Column(nullable = false)
    private Boolean isMainAdminBroadcast = false;

    private Long targetApartmentId; // null = all apartments

    @Column(nullable = false)
    private Boolean forwardedToResidentsByEmail = false;

    private LocalDateTime forwardedAt;

    @Column(length = 100)
    private String forwardedByAdminName;

    @Column(nullable = false)
    private LocalDate publishDate = LocalDate.now();

    private LocalDate expiryDate;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Announcement() {}

    public Announcement(Apartment apartment, String title, String content, String category, String priority, Boolean isPinned, LocalDate publishDate, LocalDate expiryDate) {
        this.apartment = apartment;
        this.title = title;
        this.content = content;
        this.category = category != null ? category : "GENERAL";
        this.priority = priority != null ? priority : "NORMAL";
        this.isPinned = isPinned != null ? isPinned : false;
        this.isMainAdminBroadcast = false;
        this.forwardedToResidentsByEmail = false;
        this.publishDate = publishDate != null ? publishDate : LocalDate.now();
        this.expiryDate = expiryDate;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Apartment getApartment() { return apartment; }
    public void setApartment(Apartment apartment) { this.apartment = apartment; }
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
    public Boolean getIsMainAdminBroadcast() { return isMainAdminBroadcast != null ? isMainAdminBroadcast : false; }
    public void setIsMainAdminBroadcast(Boolean isMainAdminBroadcast) { this.isMainAdminBroadcast = isMainAdminBroadcast; }
    public Long getTargetApartmentId() { return targetApartmentId; }
    public void setTargetApartmentId(Long targetApartmentId) { this.targetApartmentId = targetApartmentId; }
    public Boolean getForwardedToResidentsByEmail() { return forwardedToResidentsByEmail != null ? forwardedToResidentsByEmail : false; }
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
}
