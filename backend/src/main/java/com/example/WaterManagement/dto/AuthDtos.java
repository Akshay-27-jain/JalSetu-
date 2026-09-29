package com.example.WaterManagement.dto;

import com.example.WaterManagement.entity.Role;
import com.example.WaterManagement.entity.UserStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public class AuthDtos {

    public static class LoginRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Password is required")
        private String password;

        public LoginRequest() {}

        public LoginRequest(String email, String password) {
            this.email = email;
            this.password = password;
        }

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private String email;
            private String password;
            public Builder email(String email) { this.email = email; return this; }
            public Builder password(String password) { this.password = password; return this; }
            public LoginRequest build() { return new LoginRequest(email, password); }
        }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class LoginResponse {
        private String token;
        private Role role;
        private UserStatus status;
        private String fullName;
        private String email;
        private Long apartmentId;
        private Long householdId;
        private String apartmentName;
        private String flatNumber;
        private String phoneNumber;
        private String verificationNotes;
        
        // Document 1 (Property / Flat Ownership / Society Reg)
        private String doc1Url;
        private String doc1Type;
        private String doc1FileName;

        // Document 2 (Government ID Proof)
        private String doc2Url;
        private String doc2Type;
        private String doc2FileName;

        // Document 3 (Signatory / Representative / Utility Bill)
        private String doc3Url;
        private String doc3Type;
        private String doc3FileName;

        // AI Verification
        private Double aiVerificationScore;
        private String aiVerificationStatus;
        private String aiVerificationSummary;

        // Backward compatibility
        private String documentUrl;
        private String documentType;
        private String documentFileName;

        public LoginResponse() {}

        public LoginResponse(String token, Role role, UserStatus status, String fullName, String email, String phoneNumber, Long apartmentId, Long householdId, String apartmentName, String flatNumber, String verificationNotes, String doc1Url, String doc1Type, String doc1FileName, String doc2Url, String doc2Type, String doc2FileName, String doc3Url, String doc3Type, String doc3FileName, Double aiVerificationScore, String aiVerificationStatus, String aiVerificationSummary, String documentUrl, String documentType, String documentFileName) {
            this.token = token;
            this.role = role;
            this.status = status != null ? status : UserStatus.ACTIVE;
            this.fullName = fullName;
            this.email = email;
            this.phoneNumber = phoneNumber;
            this.apartmentId = apartmentId;
            this.householdId = householdId;
            this.apartmentName = apartmentName;
            this.flatNumber = flatNumber;
            this.verificationNotes = verificationNotes;
            this.doc1Url = doc1Url != null ? doc1Url : documentUrl;
            this.doc1Type = doc1Type != null ? doc1Type : documentType;
            this.doc1FileName = doc1FileName != null ? doc1FileName : documentFileName;
            this.doc2Url = doc2Url;
            this.doc2Type = doc2Type;
            this.doc2FileName = doc2FileName;
            this.doc3Url = doc3Url;
            this.doc3Type = doc3Type;
            this.doc3FileName = doc3FileName;
            this.aiVerificationScore = aiVerificationScore;
            this.aiVerificationStatus = aiVerificationStatus;
            this.aiVerificationSummary = aiVerificationSummary;
            this.documentUrl = this.doc1Url;
            this.documentType = this.doc1Type;
            this.documentFileName = this.doc1FileName;
        }

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private String token;
            private Role role;
            private UserStatus status = UserStatus.ACTIVE;
            private String fullName;
            private String email;
            private String phoneNumber;
            private Long apartmentId;
            private Long householdId;
            private String apartmentName;
            private String flatNumber;
            private String verificationNotes;
            private String doc1Url;
            private String doc1Type;
            private String doc1FileName;
            private String doc2Url;
            private String doc2Type;
            private String doc2FileName;
            private String doc3Url;
            private String doc3Type;
            private String doc3FileName;
            private Double aiVerificationScore;
            private String aiVerificationStatus;
            private String aiVerificationSummary;
            private String documentUrl;
            private String documentType;
            private String documentFileName;

            public Builder token(String token) { this.token = token; return this; }
            public Builder role(Role role) { this.role = role; return this; }
            public Builder status(UserStatus status) { this.status = status; return this; }
            public Builder fullName(String fullName) { this.fullName = fullName; return this; }
            public Builder email(String email) { this.email = email; return this; }
            public Builder phoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; return this; }
            public Builder apartmentId(Long apartmentId) { this.apartmentId = apartmentId; return this; }
            public Builder householdId(Long householdId) { this.householdId = householdId; return this; }
            public Builder apartmentName(String apartmentName) { this.apartmentName = apartmentName; return this; }
            public Builder flatNumber(String flatNumber) { this.flatNumber = flatNumber; return this; }
            public Builder verificationNotes(String verificationNotes) { this.verificationNotes = verificationNotes; return this; }
            public Builder doc1Url(String doc1Url) { this.doc1Url = doc1Url; return this; }
            public Builder doc1Type(String doc1Type) { this.doc1Type = doc1Type; return this; }
            public Builder doc1FileName(String doc1FileName) { this.doc1FileName = doc1FileName; return this; }
            public Builder doc2Url(String doc2Url) { this.doc2Url = doc2Url; return this; }
            public Builder doc2Type(String doc2Type) { this.doc2Type = doc2Type; return this; }
            public Builder doc2FileName(String doc2FileName) { this.doc2FileName = doc2FileName; return this; }
            public Builder doc3Url(String doc3Url) { this.doc3Url = doc3Url; return this; }
            public Builder doc3Type(String doc3Type) { this.doc3Type = doc3Type; return this; }
            public Builder doc3FileName(String doc3FileName) { this.doc3FileName = doc3FileName; return this; }
            public Builder aiVerificationScore(Double aiVerificationScore) { this.aiVerificationScore = aiVerificationScore; return this; }
            public Builder aiVerificationStatus(String aiVerificationStatus) { this.aiVerificationStatus = aiVerificationStatus; return this; }
            public Builder aiVerificationSummary(String aiVerificationSummary) { this.aiVerificationSummary = aiVerificationSummary; return this; }
            public Builder documentUrl(String documentUrl) { this.documentUrl = documentUrl; return this; }
            public Builder documentType(String documentType) { this.documentType = documentType; return this; }
            public Builder documentFileName(String documentFileName) { this.documentFileName = documentFileName; return this; }

            public LoginResponse build() {
                return new LoginResponse(token, role, status, fullName, email, phoneNumber, apartmentId, householdId, apartmentName, flatNumber, verificationNotes, doc1Url, doc1Type, doc1FileName, doc2Url, doc2Type, doc2FileName, doc3Url, doc3Type, doc3FileName, aiVerificationScore, aiVerificationStatus, aiVerificationSummary, documentUrl, documentType, documentFileName);
            }
        }

        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }
        public Role getRole() { return role; }
        public void setRole(Role role) { this.role = role; }
        public UserStatus getStatus() { return status; }
        public void setStatus(UserStatus status) { this.status = status; }
        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPhoneNumber() { return phoneNumber; }
        public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
        public Long getApartmentId() { return apartmentId; }
        public void setApartmentId(Long apartmentId) { this.apartmentId = apartmentId; }
        public Long getHouseholdId() { return householdId; }
        public void setHouseholdId(Long householdId) { this.householdId = householdId; }
        public String getApartmentName() { return apartmentName; }
        public void setApartmentName(String apartmentName) { this.apartmentName = apartmentName; }
        public String getFlatNumber() { return flatNumber; }
        public void setFlatNumber(String flatNumber) { this.flatNumber = flatNumber; }
        public String getVerificationNotes() { return verificationNotes; }
        public void setVerificationNotes(String verificationNotes) { this.verificationNotes = verificationNotes; }
        public String getDoc1Url() { return doc1Url != null ? doc1Url : documentUrl; }
        public void setDoc1Url(String doc1Url) { this.doc1Url = doc1Url; this.documentUrl = doc1Url; }
        public String getDoc1Type() { return doc1Type != null ? doc1Type : documentType; }
        public void setDoc1Type(String doc1Type) { this.doc1Type = doc1Type; this.documentType = doc1Type; }
        public String getDoc1FileName() { return doc1FileName != null ? doc1FileName : documentFileName; }
        public void setDoc1FileName(String doc1FileName) { this.doc1FileName = doc1FileName; this.documentFileName = doc1FileName; }
        public String getDoc2Url() { return doc2Url; }
        public void setDoc2Url(String doc2Url) { this.doc2Url = doc2Url; }
        public String getDoc2Type() { return doc2Type; }
        public void setDoc2Type(String doc2Type) { this.doc2Type = doc2Type; }
        public String getDoc2FileName() { return doc2FileName; }
        public void setDoc2FileName(String doc2FileName) { this.doc2FileName = doc2FileName; }
        public String getDoc3Url() { return doc3Url; }
        public void setDoc3Url(String doc3Url) { this.doc3Url = doc3Url; }
        public String getDoc3Type() { return doc3Type; }
        public void setDoc3Type(String doc3Type) { this.doc3Type = doc3Type; }
        public String getDoc3FileName() { return doc3FileName; }
        public void setDoc3FileName(String doc3FileName) { this.doc3FileName = doc3FileName; }
        public Double getAiVerificationScore() { return aiVerificationScore; }
        public void setAiVerificationScore(Double aiVerificationScore) { this.aiVerificationScore = aiVerificationScore; }
        public String getAiVerificationStatus() { return aiVerificationStatus; }
        public void setAiVerificationStatus(String aiVerificationStatus) { this.aiVerificationStatus = aiVerificationStatus; }
        public String getAiVerificationSummary() { return aiVerificationSummary; }
        public void setAiVerificationSummary(String aiVerificationSummary) { this.aiVerificationSummary = aiVerificationSummary; }
        public String getDocumentUrl() { return documentUrl != null ? documentUrl : doc1Url; }
        public void setDocumentUrl(String documentUrl) { this.documentUrl = documentUrl; this.doc1Url = documentUrl; }
        public String getDocumentType() { return documentType != null ? documentType : doc1Type; }
        public void setDocumentType(String documentType) { this.documentType = documentType; this.doc1Type = documentType; }
        public String getDocumentFileName() { return documentFileName != null ? documentFileName : doc1FileName; }
        public void setDocumentFileName(String documentFileName) { this.documentFileName = documentFileName; this.doc1FileName = documentFileName; }
    }

    public static class ResidentRegisterRequest {
        @NotBlank(message = "Full name is required")
        private String fullName;

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Password is required")
        @Size(min = 6, message = "Password must be at least 6 characters")
        private String password;

        private String phoneNumber;

        @NotBlank(message = "Invite code is required")
        private String inviteCode;

        // 3 Verification Documents
        private String doc1Type;
        private String doc1FileName;
        private String doc1Base64;

        private String doc2Type;
        private String doc2FileName;
        private String doc2Base64;

        private String doc3Type;
        private String doc3FileName;
        private String doc3Base64;

        public ResidentRegisterRequest() {}

        public ResidentRegisterRequest(String fullName, String email, String password, String phoneNumber, String inviteCode, String doc1Type, String doc1FileName, String doc1Base64, String doc2Type, String doc2FileName, String doc2Base64, String doc3Type, String doc3FileName, String doc3Base64) {
            this.fullName = fullName;
            this.email = email;
            this.password = password;
            this.phoneNumber = phoneNumber;
            this.inviteCode = inviteCode;
            this.doc1Type = doc1Type;
            this.doc1FileName = doc1FileName;
            this.doc1Base64 = doc1Base64;
            this.doc2Type = doc2Type;
            this.doc2FileName = doc2FileName;
            this.doc2Base64 = doc2Base64;
            this.doc3Type = doc3Type;
            this.doc3FileName = doc3FileName;
            this.doc3Base64 = doc3Base64;
        }

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private String fullName;
            private String email;
            private String password;
            private String phoneNumber;
            private String inviteCode;
            private String doc1Type;
            private String doc1FileName;
            private String doc1Base64;
            private String doc2Type;
            private String doc2FileName;
            private String doc2Base64;
            private String doc3Type;
            private String doc3FileName;
            private String doc3Base64;

            public Builder fullName(String fullName) { this.fullName = fullName; return this; }
            public Builder email(String email) { this.email = email; return this; }
            public Builder password(String password) { this.password = password; return this; }
            public Builder phoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; return this; }
            public Builder inviteCode(String inviteCode) { this.inviteCode = inviteCode; return this; }
            public Builder doc1Type(String doc1Type) { this.doc1Type = doc1Type; return this; }
            public Builder doc1FileName(String doc1FileName) { this.doc1FileName = doc1FileName; return this; }
            public Builder doc1Base64(String doc1Base64) { this.doc1Base64 = doc1Base64; return this; }
            public Builder doc2Type(String doc2Type) { this.doc2Type = doc2Type; return this; }
            public Builder doc2FileName(String doc2FileName) { this.doc2FileName = doc2FileName; return this; }
            public Builder doc2Base64(String doc2Base64) { this.doc2Base64 = doc2Base64; return this; }
            public Builder doc3Type(String doc3Type) { this.doc3Type = doc3Type; return this; }
            public Builder doc3FileName(String doc3FileName) { this.doc3FileName = doc3FileName; return this; }
            public Builder doc3Base64(String doc3Base64) { this.doc3Base64 = doc3Base64; return this; }

            public ResidentRegisterRequest build() {
                return new ResidentRegisterRequest(fullName, email, password, phoneNumber, inviteCode, doc1Type, doc1FileName, doc1Base64, doc2Type, doc2FileName, doc2Base64, doc3Type, doc3FileName, doc3Base64);
            }
        }

        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getPhoneNumber() { return phoneNumber; }
        public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
        public String getInviteCode() { return inviteCode; }
        public void setInviteCode(String inviteCode) { this.inviteCode = inviteCode; }
        public String getDoc1Type() { return doc1Type; }
        public void setDoc1Type(String doc1Type) { this.doc1Type = doc1Type; }
        public String getDoc1FileName() { return doc1FileName; }
        public void setDoc1FileName(String doc1FileName) { this.doc1FileName = doc1FileName; }
        public String getDoc1Base64() { return doc1Base64; }
        public void setDoc1Base64(String doc1Base64) { this.doc1Base64 = doc1Base64; }
        public String getDoc2Type() { return doc2Type; }
        public void setDoc2Type(String doc2Type) { this.doc2Type = doc2Type; }
        public String getDoc2FileName() { return doc2FileName; }
        public void setDoc2FileName(String doc2FileName) { this.doc2FileName = doc2FileName; }
        public String getDoc2Base64() { return doc2Base64; }
        public void setDoc2Base64(String doc2Base64) { this.doc2Base64 = doc2Base64; }
        public String getDoc3Type() { return doc3Type; }
        public void setDoc3Type(String doc3Type) { this.doc3Type = doc3Type; }
        public String getDoc3FileName() { return doc3FileName; }
        public void setDoc3FileName(String doc3FileName) { this.doc3FileName = doc3FileName; }
        public String getDoc3Base64() { return doc3Base64; }
        public void setDoc3Base64(String doc3Base64) { this.doc3Base64 = doc3Base64; }
    }

    public static class CommunityAdminRegisterRequest {
        @NotBlank(message = "Community name is required")
        private String communityName;

        private String address;

        private Integer totalHouseholds = 20;

        @NotBlank(message = "Admin full name is required")
        private String adminFullName;

        @NotBlank(message = "Admin email is required")
        @Email(message = "Invalid email format")
        private String adminEmail;

        private String adminPhone;

        @NotBlank(message = "Password is required")
        @Size(min = 6, message = "Password must be at least 6 characters")
        private String adminPassword;

        // 3 Verification Documents
        private String doc1Type;
        private String doc1FileName;
        private String doc1Base64;

        private String doc2Type;
        private String doc2FileName;
        private String doc2Base64;

        private String doc3Type;
        private String doc3FileName;
        private String doc3Base64;

        // Backward compatibility
        private String documentType;
        private String documentFileName;
        private String documentBase64;

        public CommunityAdminRegisterRequest() {}

        public CommunityAdminRegisterRequest(String communityName, String address, Integer totalHouseholds, String adminFullName, String adminEmail, String adminPhone, String adminPassword, String doc1Type, String doc1FileName, String doc1Base64, String doc2Type, String doc2FileName, String doc2Base64, String doc3Type, String doc3FileName, String doc3Base64, String documentType, String documentFileName, String documentBase64) {
            this.communityName = communityName;
            this.address = address;
            this.totalHouseholds = totalHouseholds != null ? totalHouseholds : 20;
            this.adminFullName = adminFullName;
            this.adminEmail = adminEmail;
            this.adminPhone = adminPhone;
            this.adminPassword = adminPassword;
            this.doc1Type = doc1Type != null ? doc1Type : documentType;
            this.doc1FileName = doc1FileName != null ? doc1FileName : documentFileName;
            this.doc1Base64 = doc1Base64 != null ? doc1Base64 : documentBase64;
            this.doc2Type = doc2Type;
            this.doc2FileName = doc2FileName;
            this.doc2Base64 = doc2Base64;
            this.doc3Type = doc3Type;
            this.doc3FileName = doc3FileName;
            this.doc3Base64 = doc3Base64;
            this.documentType = this.doc1Type;
            this.documentFileName = this.doc1FileName;
            this.documentBase64 = this.doc1Base64;
        }

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private String communityName;
            private String address;
            private Integer totalHouseholds = 20;
            private String adminFullName;
            private String adminEmail;
            private String adminPhone;
            private String adminPassword;
            private String doc1Type;
            private String doc1FileName;
            private String doc1Base64;
            private String doc2Type;
            private String doc2FileName;
            private String doc2Base64;
            private String doc3Type;
            private String doc3FileName;
            private String doc3Base64;
            private String documentType;
            private String documentFileName;
            private String documentBase64;

            public Builder communityName(String communityName) { this.communityName = communityName; return this; }
            public Builder address(String address) { this.address = address; return this; }
            public Builder totalHouseholds(Integer totalHouseholds) { this.totalHouseholds = totalHouseholds; return this; }
            public Builder adminFullName(String adminFullName) { this.adminFullName = adminFullName; return this; }
            public Builder adminEmail(String adminEmail) { this.adminEmail = adminEmail; return this; }
            public Builder adminPhone(String adminPhone) { this.adminPhone = adminPhone; return this; }
            public Builder adminPassword(String adminPassword) { this.adminPassword = adminPassword; return this; }
            public Builder doc1Type(String doc1Type) { this.doc1Type = doc1Type; return this; }
            public Builder doc1FileName(String doc1FileName) { this.doc1FileName = doc1FileName; return this; }
            public Builder doc1Base64(String doc1Base64) { this.doc1Base64 = doc1Base64; return this; }
            public Builder doc2Type(String doc2Type) { this.doc2Type = doc2Type; return this; }
            public Builder doc2FileName(String doc2FileName) { this.doc2FileName = doc2FileName; return this; }
            public Builder doc2Base64(String doc2Base64) { this.doc2Base64 = doc2Base64; return this; }
            public Builder doc3Type(String doc3Type) { this.doc3Type = doc3Type; return this; }
            public Builder doc3FileName(String doc3FileName) { this.doc3FileName = doc3FileName; return this; }
            public Builder doc3Base64(String doc3Base64) { this.doc3Base64 = doc3Base64; return this; }
            public Builder documentType(String documentType) { this.documentType = documentType; return this; }
            public Builder documentFileName(String documentFileName) { this.documentFileName = documentFileName; return this; }
            public Builder documentBase64(String documentBase64) { this.documentBase64 = documentBase64; return this; }

            public CommunityAdminRegisterRequest build() {
                return new CommunityAdminRegisterRequest(communityName, address, totalHouseholds, adminFullName, adminEmail, adminPhone, adminPassword, doc1Type, doc1FileName, doc1Base64, doc2Type, doc2FileName, doc2Base64, doc3Type, doc3FileName, doc3Base64, documentType, documentFileName, documentBase64);
            }
        }

        public String getCommunityName() { return communityName; }
        public void setCommunityName(String communityName) { this.communityName = communityName; }
        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }
        public Integer getTotalHouseholds() { return totalHouseholds; }
        public void setTotalHouseholds(Integer totalHouseholds) { this.totalHouseholds = totalHouseholds; }
        public String getAdminFullName() { return adminFullName; }
        public void setAdminFullName(String adminFullName) { this.adminFullName = adminFullName; }
        public String getAdminEmail() { return adminEmail; }
        public void setAdminEmail(String adminEmail) { this.adminEmail = adminEmail; }
        public String getAdminPhone() { return adminPhone; }
        public void setAdminPhone(String adminPhone) { this.adminPhone = adminPhone; }
        public String getAdminPassword() { return adminPassword; }
        public void setAdminPassword(String adminPassword) { this.adminPassword = adminPassword; }
        public String getDoc1Type() { return doc1Type != null ? doc1Type : documentType; }
        public void setDoc1Type(String doc1Type) { this.doc1Type = doc1Type; this.documentType = doc1Type; }
        public String getDoc1FileName() { return doc1FileName != null ? doc1FileName : documentFileName; }
        public void setDoc1FileName(String doc1FileName) { this.doc1FileName = doc1FileName; this.documentFileName = doc1FileName; }
        public String getDoc1Base64() { return doc1Base64 != null ? doc1Base64 : documentBase64; }
        public void setDoc1Base64(String doc1Base64) { this.doc1Base64 = doc1Base64; this.documentBase64 = doc1Base64; }
        public String getDoc2Type() { return doc2Type; }
        public void setDoc2Type(String doc2Type) { this.doc2Type = doc2Type; }
        public String getDoc2FileName() { return doc2FileName; }
        public void setDoc2FileName(String doc2FileName) { this.doc2FileName = doc2FileName; }
        public String getDoc2Base64() { return doc2Base64; }
        public void setDoc2Base64(String doc2Base64) { this.doc2Base64 = doc2Base64; }
        public String getDoc3Type() { return doc3Type; }
        public void setDoc3Type(String doc3Type) { this.doc3Type = doc3Type; }
        public String getDoc3FileName() { return doc3FileName; }
        public void setDoc3FileName(String doc3FileName) { this.doc3FileName = doc3FileName; }
        public String getDoc3Base64() { return doc3Base64; }
        public void setDoc3Base64(String doc3Base64) { this.doc3Base64 = doc3Base64; }
        public String getDocumentType() { return documentType != null ? documentType : doc1Type; }
        public void setDocumentType(String documentType) { this.documentType = documentType; this.doc1Type = documentType; }
        public String getDocumentFileName() { return documentFileName != null ? documentFileName : doc1FileName; }
        public void setDocumentFileName(String documentFileName) { this.documentFileName = documentFileName; this.doc1FileName = documentFileName; }
        public String getDocumentBase64() { return documentBase64 != null ? documentBase64 : doc1Base64; }
        public void setDocumentBase64(String documentBase64) { this.documentBase64 = documentBase64; this.doc1Base64 = documentBase64; }
    }

    public static class ResubmitVerificationRequest {
        private String email;
        private String adminEmail;
        private String adminFullName;
        private String adminPhone;
        private String communityName;
        private String address;

        private String doc1Type;
        private String doc1FileName;
        private String doc1Base64;

        private String doc2Type;
        private String doc2FileName;
        private String doc2Base64;

        private String doc3Type;
        private String doc3FileName;
        private String doc3Base64;

        private String documentType;
        private String documentFileName;
        private String documentBase64;

        public ResubmitVerificationRequest() {}

        public String getEffectiveEmail() {
            if (email != null && !email.isBlank()) return email.trim().toLowerCase();
            if (adminEmail != null && !adminEmail.isBlank()) return adminEmail.trim().toLowerCase();
            return "";
        }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getAdminEmail() { return adminEmail; }
        public void setAdminEmail(String adminEmail) { this.adminEmail = adminEmail; }
        public String getAdminFullName() { return adminFullName; }
        public void setAdminFullName(String adminFullName) { this.adminFullName = adminFullName; }
        public String getAdminPhone() { return adminPhone; }
        public void setAdminPhone(String adminPhone) { this.adminPhone = adminPhone; }
        public String getCommunityName() { return communityName; }
        public void setCommunityName(String communityName) { this.communityName = communityName; }
        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }
        public String getDoc1Type() { return doc1Type != null ? doc1Type : documentType; }
        public void setDoc1Type(String doc1Type) { this.doc1Type = doc1Type; this.documentType = doc1Type; }
        public String getDoc1FileName() { return doc1FileName != null ? doc1FileName : documentFileName; }
        public void setDoc1FileName(String doc1FileName) { this.doc1FileName = doc1FileName; this.documentFileName = doc1FileName; }
        public String getDoc1Base64() { return doc1Base64 != null ? doc1Base64 : documentBase64; }
        public void setDoc1Base64(String doc1Base64) { this.doc1Base64 = doc1Base64; this.documentBase64 = doc1Base64; }
        public String getDoc2Type() { return doc2Type; }
        public void setDoc2Type(String doc2Type) { this.doc2Type = doc2Type; }
        public String getDoc2FileName() { return doc2FileName; }
        public void setDoc2FileName(String doc2FileName) { this.doc2FileName = doc2FileName; }
        public String getDoc2Base64() { return doc2Base64; }
        public void setDoc2Base64(String doc2Base64) { this.doc2Base64 = doc2Base64; }
        public String getDoc3Type() { return doc3Type; }
        public void setDoc3Type(String doc3Type) { this.doc3Type = doc3Type; }
        public String getDoc3FileName() { return doc3FileName; }
        public void setDoc3FileName(String doc3FileName) { this.doc3FileName = doc3FileName; }
        public String getDoc3Base64() { return doc3Base64; }
        public void setDoc3Base64(String doc3Base64) { this.doc3Base64 = doc3Base64; }
        public String getDocumentType() { return documentType != null ? documentType : doc1Type; }
        public void setDocumentType(String documentType) { this.documentType = documentType; this.doc1Type = documentType; }
        public String getDocumentFileName() { return documentFileName != null ? documentFileName : doc1FileName; }
        public void setDocumentFileName(String documentFileName) { this.documentFileName = documentFileName; this.doc1FileName = documentFileName; }
        public String getDocumentBase64() { return documentBase64 != null ? documentBase64 : doc1Base64; }
        public void setDocumentBase64(String documentBase64) { this.documentBase64 = documentBase64; this.doc1Base64 = documentBase64; }
    }

    public static class GoogleOAuthRequest {
        @NotBlank(message = "Token or credential is required")
        private String token;
        private String email;
        private String name;
        private String picture;

        public GoogleOAuthRequest() {}

        public GoogleOAuthRequest(String token, String email, String name, String picture) {
            this.token = token;
            this.email = email;
            this.name = name;
            this.picture = picture;
        }

        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getPicture() { return picture; }
        public void setPicture(String picture) { this.picture = picture; }
    }

    public static class VerificationStatusResponse {
        private Long userId;
        private String email;
        private String fullName;
        private Role role;
        private Long apartmentId;
        private String apartmentName;
        private Long householdId;
        private String flatNumber;
        private UserStatus status;
        
        // 3 Documents
        private String doc1Type;
        private String doc1FileName;
        private String doc1Url;

        private String doc2Type;
        private String doc2FileName;
        private String doc2Url;

        private String doc3Type;
        private String doc3FileName;
        private String doc3Url;

        // AI Verification
        private Double aiVerificationScore;
        private String aiVerificationStatus;
        private String aiVerificationSummary;

        private String verificationNotes;
        private LocalDateTime submittedAt;

        public VerificationStatusResponse() {}

        public VerificationStatusResponse(Long userId, String email, String fullName, Role role, Long apartmentId, String apartmentName, Long householdId, String flatNumber, UserStatus status, String doc1Type, String doc1FileName, String doc1Url, String doc2Type, String doc2FileName, String doc2Url, String doc3Type, String doc3FileName, String doc3Url, Double aiVerificationScore, String aiVerificationStatus, String aiVerificationSummary, String verificationNotes, LocalDateTime submittedAt) {
            this.userId = userId;
            this.email = email;
            this.fullName = fullName;
            this.role = role;
            this.apartmentId = apartmentId;
            this.apartmentName = apartmentName;
            this.householdId = householdId;
            this.flatNumber = flatNumber;
            this.status = status;
            this.doc1Type = doc1Type;
            this.doc1FileName = doc1FileName;
            this.doc1Url = doc1Url;
            this.doc2Type = doc2Type;
            this.doc2FileName = doc2FileName;
            this.doc2Url = doc2Url;
            this.doc3Type = doc3Type;
            this.doc3FileName = doc3FileName;
            this.doc3Url = doc3Url;
            this.aiVerificationScore = aiVerificationScore;
            this.aiVerificationStatus = aiVerificationStatus;
            this.aiVerificationSummary = aiVerificationSummary;
            this.verificationNotes = verificationNotes;
            this.submittedAt = submittedAt;
        }

        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public Role getRole() { return role; }
        public void setRole(Role role) { this.role = role; }
        public Long getApartmentId() { return apartmentId; }
        public void setApartmentId(Long apartmentId) { this.apartmentId = apartmentId; }
        public String getApartmentName() { return apartmentName; }
        public void setApartmentName(String apartmentName) { this.apartmentName = apartmentName; }
        public Long getHouseholdId() { return householdId; }
        public void setHouseholdId(Long householdId) { this.householdId = householdId; }
        public String getFlatNumber() { return flatNumber; }
        public void setFlatNumber(String flatNumber) { this.flatNumber = flatNumber; }
        public UserStatus getStatus() { return status; }
        public void setStatus(UserStatus status) { this.status = status; }
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
        public String getVerificationNotes() { return verificationNotes; }
        public void setVerificationNotes(String verificationNotes) { this.verificationNotes = verificationNotes; }
        public LocalDateTime getSubmittedAt() { return submittedAt; }
        public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }

        // Backward compatibility getters
        public String getDocumentType() { return doc1Type; }
        public String getDocumentFileName() { return doc1FileName; }
    }

    public static class ChangePasswordRequest {
        @NotBlank(message = "Current password is required")
        private String currentPassword;

        @NotBlank(message = "New password is required")
        @Size(min = 6, message = "New password must be at least 6 characters")
        private String newPassword;

        public ChangePasswordRequest() {}

        public ChangePasswordRequest(String currentPassword, String newPassword) {
            this.currentPassword = currentPassword;
            this.newPassword = newPassword;
        }

        public String getCurrentPassword() { return currentPassword; }
        public void setCurrentPassword(String currentPassword) { this.currentPassword = currentPassword; }
        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }

    public static class MessageResponse {
        private String message;
        private boolean success;

        public MessageResponse() {}

        public MessageResponse(String message, boolean success) {
            this.message = message;
            this.success = success;
        }

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }
    }

    public static class UpdateProfileRequest {
        private String fullName;
        private String phoneNumber;

        public UpdateProfileRequest() {}

        public UpdateProfileRequest(String fullName, String phoneNumber) {
            this.fullName = fullName;
            this.phoneNumber = phoneNumber;
        }

        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public String getPhoneNumber() { return phoneNumber; }
        public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    }
}
