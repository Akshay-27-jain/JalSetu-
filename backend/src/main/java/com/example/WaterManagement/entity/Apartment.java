package com.example.WaterManagement.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "apartments")
public class Apartment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(name = "total_households")
    private Integer totalHouseholds = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status", nullable = false, length = 30)
    private UserStatus verificationStatus = UserStatus.ACTIVE;

    // Document 1: Society / Property Registration
    @Column(name = "doc1_type", length = 100)
    private String doc1Type;

    @Column(name = "doc1_file_name")
    private String doc1FileName;

    @Column(name = "doc1_url", columnDefinition = "TEXT")
    private String doc1Url;

    // Document 2: Government ID Proof (Aadhaar / Passport / Voter ID)
    @Column(name = "doc2_type", length = 100)
    private String doc2Type;

    @Column(name = "doc2_file_name")
    private String doc2FileName;

    @Column(name = "doc2_url", columnDefinition = "TEXT")
    private String doc2Url;

    // Document 3: Authorized Signatory / RWA Resolution / Common Utility Bill
    @Column(name = "doc3_type", length = 100)
    private String doc3Type;

    @Column(name = "doc3_file_name")
    private String doc3FileName;

    @Column(name = "doc3_url", columnDefinition = "TEXT")
    private String doc3Url;

    // Legacy fields mapped to doc1
    @Column(name = "document_url", columnDefinition = "TEXT")
    private String documentUrl;

    @Column(name = "document_file_name")
    private String documentFileName;

    @Column(name = "document_type", length = 100)
    private String documentType;

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

    @Column(name = "verification_notes", columnDefinition = "TEXT")
    private String verificationNotes;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "reviewed_by_admin_id")
    private Long reviewedByAdminId;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "apartment", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Household> households = new ArrayList<>();

    public Apartment() {}

    public Apartment(Long id, String name, String address, Integer totalHouseholds, UserStatus verificationStatus, String doc1Type, String doc1FileName, String doc1Url, String doc2Type, String doc2FileName, String doc2Url, String doc3Type, String doc3FileName, String doc3Url, String documentUrl, String documentFileName, String documentType, Double aiVerificationScore, String aiVerificationStatus, String aiVerificationSummary, String aiExtractedDataJson, LocalDateTime aiVerifiedAt, String verificationNotes, LocalDateTime reviewedAt, Long reviewedByAdminId, LocalDateTime createdAt, List<Household> households) {
        this.id = id;
        this.name = name;
        this.address = address;
        this.totalHouseholds = totalHouseholds != null ? totalHouseholds : 0;
        this.verificationStatus = verificationStatus != null ? verificationStatus : UserStatus.ACTIVE;
        this.doc1Type = doc1Type != null ? doc1Type : documentType;
        this.doc1FileName = doc1FileName != null ? doc1FileName : documentFileName;
        this.doc1Url = doc1Url != null ? doc1Url : documentUrl;
        this.doc2Type = doc2Type;
        this.doc2FileName = doc2FileName;
        this.doc2Url = doc2Url;
        this.doc3Type = doc3Type;
        this.doc3FileName = doc3FileName;
        this.doc3Url = doc3Url;
        this.documentUrl = doc1Url != null ? doc1Url : documentUrl;
        this.documentFileName = doc1FileName != null ? doc1FileName : documentFileName;
        this.documentType = doc1Type != null ? doc1Type : documentType;
        this.aiVerificationScore = aiVerificationScore != null ? aiVerificationScore : 0.0;
        this.aiVerificationStatus = aiVerificationStatus != null ? aiVerificationStatus : "PENDING_SCAN";
        this.aiVerificationSummary = aiVerificationSummary;
        this.aiExtractedDataJson = aiExtractedDataJson;
        this.aiVerifiedAt = aiVerifiedAt;
        this.verificationNotes = verificationNotes;
        this.reviewedAt = reviewedAt;
        this.reviewedByAdminId = reviewedByAdminId;
        this.createdAt = createdAt;
        if (households != null) {
            this.households = households;
        }
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private String name;
        private String address;
        private Integer totalHouseholds = 0;
        private UserStatus verificationStatus = UserStatus.ACTIVE;
        private String doc1Type;
        private String doc1FileName;
        private String doc1Url;
        private String doc2Type;
        private String doc2FileName;
        private String doc2Url;
        private String doc3Type;
        private String doc3FileName;
        private String doc3Url;
        private String documentUrl;
        private String documentFileName;
        private String documentType;
        private Double aiVerificationScore = 0.0;
        private String aiVerificationStatus = "PENDING_SCAN";
        private String aiVerificationSummary;
        private String aiExtractedDataJson;
        private LocalDateTime aiVerifiedAt;
        private String verificationNotes;
        private LocalDateTime reviewedAt;
        private Long reviewedByAdminId;
        private LocalDateTime createdAt;
        private List<Household> households = new ArrayList<>();

        public Builder id(Long id) { this.id = id; return this; }
        public Builder name(String name) { this.name = name; return this; }
        public Builder address(String address) { this.address = address; return this; }
        public Builder totalHouseholds(Integer totalHouseholds) { this.totalHouseholds = totalHouseholds; return this; }
        public Builder verificationStatus(UserStatus verificationStatus) { this.verificationStatus = verificationStatus; return this; }
        public Builder doc1Type(String doc1Type) { this.doc1Type = doc1Type; return this; }
        public Builder doc1FileName(String doc1FileName) { this.doc1FileName = doc1FileName; return this; }
        public Builder doc1Url(String doc1Url) { this.doc1Url = doc1Url; return this; }
        public Builder doc2Type(String doc2Type) { this.doc2Type = doc2Type; return this; }
        public Builder doc2FileName(String doc2FileName) { this.doc2FileName = doc2FileName; return this; }
        public Builder doc2Url(String doc2Url) { this.doc2Url = doc2Url; return this; }
        public Builder doc3Type(String doc3Type) { this.doc3Type = doc3Type; return this; }
        public Builder doc3FileName(String doc3FileName) { this.doc3FileName = doc3FileName; return this; }
        public Builder doc3Url(String doc3Url) { this.doc3Url = doc3Url; return this; }
        public Builder documentUrl(String documentUrl) { this.documentUrl = documentUrl; return this; }
        public Builder documentFileName(String documentFileName) { this.documentFileName = documentFileName; return this; }
        public Builder documentType(String documentType) { this.documentType = documentType; return this; }
        public Builder aiVerificationScore(Double aiVerificationScore) { this.aiVerificationScore = aiVerificationScore; return this; }
        public Builder aiVerificationStatus(String aiVerificationStatus) { this.aiVerificationStatus = aiVerificationStatus; return this; }
        public Builder aiVerificationSummary(String aiVerificationSummary) { this.aiVerificationSummary = aiVerificationSummary; return this; }
        public Builder aiExtractedDataJson(String aiExtractedDataJson) { this.aiExtractedDataJson = aiExtractedDataJson; return this; }
        public Builder aiVerifiedAt(LocalDateTime aiVerifiedAt) { this.aiVerifiedAt = aiVerifiedAt; return this; }
        public Builder verificationNotes(String verificationNotes) { this.verificationNotes = verificationNotes; return this; }
        public Builder reviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; return this; }
        public Builder reviewedByAdminId(Long reviewedByAdminId) { this.reviewedByAdminId = reviewedByAdminId; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public Builder households(List<Household> households) { this.households = households; return this; }

        public Apartment build() {
            return new Apartment(id, name, address, totalHouseholds, verificationStatus, doc1Type, doc1FileName, doc1Url, doc2Type, doc2FileName, doc2Url, doc3Type, doc3FileName, doc3Url, documentUrl, documentFileName, documentType, aiVerificationScore, aiVerificationStatus, aiVerificationSummary, aiExtractedDataJson, aiVerifiedAt, verificationNotes, reviewedAt, reviewedByAdminId, createdAt, households);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public Integer getTotalHouseholds() { return totalHouseholds; }
    public void setTotalHouseholds(Integer totalHouseholds) { this.totalHouseholds = totalHouseholds; }
    public UserStatus getVerificationStatus() { return verificationStatus; }
    public void setVerificationStatus(UserStatus verificationStatus) { this.verificationStatus = verificationStatus; }
    public String getDoc1Type() { return doc1Type != null ? doc1Type : documentType; }
    public void setDoc1Type(String doc1Type) { this.doc1Type = doc1Type; this.documentType = doc1Type; }
    public String getDoc1FileName() { return doc1FileName != null ? doc1FileName : documentFileName; }
    public void setDoc1FileName(String doc1FileName) { this.doc1FileName = doc1FileName; this.documentFileName = doc1FileName; }
    public String getDoc1Url() { return doc1Url != null ? doc1Url : documentUrl; }
    public void setDoc1Url(String doc1Url) { this.doc1Url = doc1Url; this.documentUrl = doc1Url; }
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
    public String getDocumentUrl() { return documentUrl != null ? documentUrl : doc1Url; }
    public void setDocumentUrl(String documentUrl) { this.documentUrl = documentUrl; this.doc1Url = documentUrl; }
    public String getDocumentFileName() { return documentFileName != null ? documentFileName : doc1FileName; }
    public void setDocumentFileName(String documentFileName) { this.documentFileName = documentFileName; this.doc1FileName = documentFileName; }
    public String getDocumentType() { return documentType != null ? documentType : doc1Type; }
    public void setDocumentType(String documentType) { this.documentType = documentType; this.doc1Type = documentType; }
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
    public String getVerificationNotes() { return verificationNotes; }
    public void setVerificationNotes(String verificationNotes) { this.verificationNotes = verificationNotes; }
    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; }
    public Long getReviewedByAdminId() { return reviewedByAdminId; }
    public void setReviewedByAdminId(Long reviewedByAdminId) { this.reviewedByAdminId = reviewedByAdminId; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public List<Household> getHouseholds() { return households; }
    public void setHouseholds(List<Household> households) { this.households = households; }
}
