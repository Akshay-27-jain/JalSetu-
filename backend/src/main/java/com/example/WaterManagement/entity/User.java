package com.example.WaterManagement.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "phone_number", length = 30)
    private String phoneNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private Role role;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private UserStatus status = UserStatus.ACTIVE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "apartment_id")
    private Apartment apartment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "household_id")
    private Household household;

    // Document 1: Property / Flat Ownership / Rent Agreement / Society Reg
    @Column(name = "doc1_type", length = 100)
    private String doc1Type;

    @Column(name = "doc1_file_name")
    private String doc1FileName;

    @Column(name = "doc1_url", columnDefinition = "TEXT")
    private String doc1Url;

    // Document 2: Government ID Proof (Aadhaar / Passport / Voter ID / DL)
    @Column(name = "doc2_type", length = 100)
    private String doc2Type;

    @Column(name = "doc2_file_name")
    private String doc2FileName;

    @Column(name = "doc2_url", columnDefinition = "TEXT")
    private String doc2Url;

    // Document 3: Authorized Signatory / Representative Proof / Utility Bill / Landlord NOC
    @Column(name = "doc3_type", length = 100)
    private String doc3Type;

    @Column(name = "doc3_file_name")
    private String doc3FileName;

    @Column(name = "doc3_url", columnDefinition = "TEXT")
    private String doc3Url;

    // AI Document Authenticity & Fraud Risk Audit
    @Column(name = "ai_verification_score")
    private Double aiVerificationScore = 0.0;

    @Column(name = "ai_verification_status", length = 50)
    private String aiVerificationStatus = "PENDING_SCAN";

    @Column(name = "ai_verification_summary", columnDefinition = "TEXT")
    private String aiVerificationSummary;

    @Column(name = "ai_extracted_data_json", columnDefinition = "TEXT")
    private String aiExtractedDataJson;

    @Column(name = "ai_verified_at")
    private LocalDateTime aiVerifiedAt;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "reviewed_by_admin_id")
    private Long reviewedByAdminId;

    @Column(name = "verification_notes", columnDefinition = "TEXT")
    private String verificationNotes;

    @Column(name = "initial_password", length = 100)
    private String initialPassword;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public User() {}

    public User(Long id, String email, String passwordHash, String fullName, String phoneNumber, Role role, UserStatus status, Apartment apartment, Household household, String doc1Type, String doc1FileName, String doc1Url, String doc2Type, String doc2FileName, String doc2Url, String doc3Type, String doc3FileName, String doc3Url, Double aiVerificationScore, String aiVerificationStatus, String aiVerificationSummary, String aiExtractedDataJson, LocalDateTime aiVerifiedAt, LocalDateTime reviewedAt, Long reviewedByAdminId, String verificationNotes, String initialPassword, LocalDateTime createdAt) {
        this.id = id;
        this.email = email;
        this.passwordHash = passwordHash;
        this.fullName = fullName;
        this.phoneNumber = phoneNumber;
        this.role = role;
        this.status = status != null ? status : UserStatus.ACTIVE;
        this.apartment = apartment;
        this.household = household;
        this.doc1Type = doc1Type;
        this.doc1FileName = doc1FileName;
        this.doc1Url = doc1Url;
        this.doc2Type = doc2Type;
        this.doc2FileName = doc2FileName;
        this.doc2Url = doc2Url;
        this.doc3Type = doc3Type;
        this.doc3FileName = doc3FileName;
        this.doc3Url = doc3Url;
        this.aiVerificationScore = aiVerificationScore != null ? aiVerificationScore : 0.0;
        this.aiVerificationStatus = aiVerificationStatus != null ? aiVerificationStatus : "PENDING_SCAN";
        this.aiVerificationSummary = aiVerificationSummary;
        this.aiExtractedDataJson = aiExtractedDataJson;
        this.aiVerifiedAt = aiVerifiedAt;
        this.reviewedAt = reviewedAt;
        this.reviewedByAdminId = reviewedByAdminId;
        this.verificationNotes = verificationNotes;
        this.initialPassword = initialPassword;
        this.createdAt = createdAt;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private String email;
        private String passwordHash;
        private String fullName;
        private String phoneNumber;
        private Role role;
        private UserStatus status = UserStatus.ACTIVE;
        private Apartment apartment;
        private Household household;
        private String doc1Type;
        private String doc1FileName;
        private String doc1Url;
        private String doc2Type;
        private String doc2FileName;
        private String doc2Url;
        private String doc3Type;
        private String doc3FileName;
        private String doc3Url;
        private Double aiVerificationScore = 0.0;
        private String aiVerificationStatus = "PENDING_SCAN";
        private String aiVerificationSummary;
        private String aiExtractedDataJson;
        private LocalDateTime aiVerifiedAt;
        private LocalDateTime reviewedAt;
        private Long reviewedByAdminId;
        private String verificationNotes;
        private String initialPassword;
        private LocalDateTime createdAt;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder email(String email) { this.email = email; return this; }
        public Builder passwordHash(String passwordHash) { this.passwordHash = passwordHash; return this; }
        public Builder fullName(String fullName) { this.fullName = fullName; return this; }
        public Builder phoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; return this; }
        public Builder role(Role role) { this.role = role; return this; }
        public Builder status(UserStatus status) { this.status = status; return this; }
        public Builder apartment(Apartment apartment) { this.apartment = apartment; return this; }
        public Builder household(Household household) { this.household = household; return this; }
        public Builder doc1Type(String doc1Type) { this.doc1Type = doc1Type; return this; }
        public Builder doc1FileName(String doc1FileName) { this.doc1FileName = doc1FileName; return this; }
        public Builder doc1Url(String doc1Url) { this.doc1Url = doc1Url; return this; }
        public Builder doc2Type(String doc2Type) { this.doc2Type = doc2Type; return this; }
        public Builder doc2FileName(String doc2FileName) { this.doc2FileName = doc2FileName; return this; }
        public Builder doc2Url(String doc2Url) { this.doc2Url = doc2Url; return this; }
        public Builder doc3Type(String doc3Type) { this.doc3Type = doc3Type; return this; }
        public Builder doc3FileName(String doc3FileName) { this.doc3FileName = doc3FileName; return this; }
        public Builder doc3Url(String doc3Url) { this.doc3Url = doc3Url; return this; }
        public Builder aiVerificationScore(Double aiVerificationScore) { this.aiVerificationScore = aiVerificationScore; return this; }
        public Builder aiVerificationStatus(String aiVerificationStatus) { this.aiVerificationStatus = aiVerificationStatus; return this; }
        public Builder aiVerificationSummary(String aiVerificationSummary) { this.aiVerificationSummary = aiVerificationSummary; return this; }
        public Builder aiExtractedDataJson(String aiExtractedDataJson) { this.aiExtractedDataJson = aiExtractedDataJson; return this; }
        public Builder aiVerifiedAt(LocalDateTime aiVerifiedAt) { this.aiVerifiedAt = aiVerifiedAt; return this; }
        public Builder reviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; return this; }
        public Builder reviewedByAdminId(Long reviewedByAdminId) { this.reviewedByAdminId = reviewedByAdminId; return this; }
        public Builder verificationNotes(String verificationNotes) { this.verificationNotes = verificationNotes; return this; }
        public Builder initialPassword(String initialPassword) { this.initialPassword = initialPassword; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public User build() {
            return new User(id, email, passwordHash, fullName, phoneNumber, role, status, apartment, household, doc1Type, doc1FileName, doc1Url, doc2Type, doc2FileName, doc2Url, doc3Type, doc3FileName, doc3Url, aiVerificationScore, aiVerificationStatus, aiVerificationSummary, aiExtractedDataJson, aiVerifiedAt, reviewedAt, reviewedByAdminId, verificationNotes, initialPassword, createdAt);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
    public UserStatus getStatus() { return status; }
    public void setStatus(UserStatus status) { this.status = status != null ? status : UserStatus.ACTIVE; }
    public Apartment getApartment() { return apartment; }
    public void setApartment(Apartment apartment) { this.apartment = apartment; }
    public Household getHousehold() { return household; }
    public void setHousehold(Household household) { this.household = household; }
    public String getDoc1Type() { return doc1Type; }
    public void setDoc1Type(String doc1Type) { this.doc1Type = doc1Type; }
    public String getDoc1FileName() { return doc1FileName; }
    public void setDoc1FileName(String doc1FileName) { this.doc1FileName = doc1FileName; }
    public String getDoc1Url() { return doc1Url; }
    public void setDoc1Url(String doc1Url) { this.doc1Url = doc1Url; }
    public String getDoc2Type() { return doc2Type; }
    public void setDoc2Type(String doc2Type) { this.doc2Type = doc2Type; }
    public String getDoc2FileName() { return doc2FileName; }
    public void setDoc2FileName(String doc2FileName) { this.doc2FileName = doc2FileName; }
    public String getDoc2Url() { return doc2Url; }
    public void setDoc2Url(String doc2Url) { this.doc2Url = doc2Url; }
    public String getDoc3Type() { return doc3Type; }
    public void setDoc3Type(String doc3Type) { this.doc3Type = doc3Type; }
    public String getDoc3FileName() { return doc3FileName; }
    public void setDoc3FileName(String doc3FileName) { this.doc3FileName = doc3FileName; }
    public String getDoc3Url() { return doc3Url; }
    public void setDoc3Url(String doc3Url) { this.doc3Url = doc3Url; }
    public Double getAiVerificationScore() { return aiVerificationScore; }
    public void setAiVerificationScore(Double aiVerificationScore) { this.aiVerificationScore = aiVerificationScore; }
    public String getAiVerificationStatus() { return aiVerificationStatus; }
    public void setAiVerificationStatus(String aiVerificationStatus) { this.aiVerificationStatus = aiVerificationStatus; }
    public String getAiVerificationSummary() { return aiVerificationSummary; }
    public void setAiVerificationSummary(String aiVerificationSummary) { this.aiVerificationSummary = aiVerificationSummary; }
    public String getAiExtractedDataJson() { return aiExtractedDataJson; }
    public void setAiExtractedDataJson(String aiExtractedDataJson) { this.aiExtractedDataJson = aiExtractedDataJson; }
    public LocalDateTime getAiVerifiedAt() { return aiVerifiedAt; }
    public void setAiVerifiedAt(LocalDateTime aiVerifiedAt) { this.aiVerifiedAt = aiVerifiedAt; }
    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; }
    public Long getReviewedByAdminId() { return reviewedByAdminId; }
    public void setReviewedByAdminId(Long reviewedByAdminId) { this.reviewedByAdminId = reviewedByAdminId; }
    public String getVerificationNotes() { return verificationNotes; }
    public void setVerificationNotes(String verificationNotes) { this.verificationNotes = verificationNotes; }
    public String getInitialPassword() { return initialPassword; }
    public void setInitialPassword(String initialPassword) { this.initialPassword = initialPassword; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
