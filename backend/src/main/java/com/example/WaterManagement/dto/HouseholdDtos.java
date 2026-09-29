package com.example.WaterManagement.dto;

import com.example.WaterManagement.entity.UserStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public class HouseholdDtos {

    public static class CreateHouseholdRequest {
        @NotBlank(message = "Flat number is required")
        private String flatNumber;

        private String meterSerialNumber;

        private Double areaSqft = 1200.0;

        private Integer occupancyCount = 3;

        private Boolean hasMeter = true;

        private String residentFullName;

        @Email(message = "Invalid resident email format")
        private String residentEmail;

        private String residentPhone;

        private String residentPassword = "Resident@123";

        // 3 Mandatory Verification Documents
        private String doc1Type;
        private String doc1FileName;
        private String doc1Base64;

        private String doc2Type;
        private String doc2FileName;
        private String doc2Base64;

        private String doc3Type;
        private String doc3FileName;
        private String doc3Base64;

        public CreateHouseholdRequest() {}

        public CreateHouseholdRequest(String flatNumber, String meterSerialNumber, Double areaSqft, Integer occupancyCount, Boolean hasMeter, String residentFullName, String residentEmail, String residentPhone, String residentPassword, String doc1Type, String doc1FileName, String doc1Base64, String doc2Type, String doc2FileName, String doc2Base64, String doc3Type, String doc3FileName, String doc3Base64) {
            this.flatNumber = flatNumber;
            this.meterSerialNumber = meterSerialNumber;
            this.areaSqft = areaSqft != null ? areaSqft : 1200.0;
            this.occupancyCount = occupancyCount != null ? occupancyCount : 3;
            this.hasMeter = hasMeter != null ? hasMeter : true;
            this.residentFullName = residentFullName;
            this.residentEmail = residentEmail;
            this.residentPhone = residentPhone;
            this.residentPassword = residentPassword != null ? residentPassword : "Resident@123";
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

        public String getFlatNumber() { return flatNumber; }
        public void setFlatNumber(String flatNumber) { this.flatNumber = flatNumber; }
        public String getMeterSerialNumber() { return meterSerialNumber; }
        public void setMeterSerialNumber(String meterSerialNumber) { this.meterSerialNumber = meterSerialNumber; }
        public Double getAreaSqft() { return areaSqft; }
        public void setAreaSqft(Double areaSqft) { this.areaSqft = areaSqft; }
        public Integer getOccupancyCount() { return occupancyCount; }
        public void setOccupancyCount(Integer occupancyCount) { this.occupancyCount = occupancyCount; }
        public Boolean getHasMeter() { return hasMeter; }
        public void setHasMeter(Boolean hasMeter) { this.hasMeter = hasMeter; }
        public String getResidentFullName() { return residentFullName; }
        public void setResidentFullName(String residentFullName) { this.residentFullName = residentFullName; }
        public String getResidentEmail() { return residentEmail; }
        public void setResidentEmail(String residentEmail) { this.residentEmail = residentEmail; }
        public String getResidentPhone() { return residentPhone; }
        public void setResidentPhone(String residentPhone) { this.residentPhone = residentPhone; }
        public String getResidentPassword() { return residentPassword; }
        public void setResidentPassword(String residentPassword) { this.residentPassword = residentPassword; }
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

    public static class UpdateHouseholdRequest {
        @NotBlank(message = "Flat number is required")
        private String flatNumber;

        private String meterSerialNumber;

        private Double areaSqft;

        private Integer occupancyCount;

        private Boolean hasMeter;

        private UserStatus status;

        private String residentFullName;

        @Email(message = "Invalid resident email format")
        private String residentEmail;

        private String residentPhone;

        private String residentPassword;

        // 3 Mandatory Verification Documents
        private String doc1Type;
        private String doc1FileName;
        private String doc1Base64;

        private String doc2Type;
        private String doc2FileName;
        private String doc2Base64;

        private String doc3Type;
        private String doc3FileName;
        private String doc3Base64;

        public UpdateHouseholdRequest() {}

        public String getFlatNumber() { return flatNumber; }
        public void setFlatNumber(String flatNumber) { this.flatNumber = flatNumber; }
        public String getMeterSerialNumber() { return meterSerialNumber; }
        public void setMeterSerialNumber(String meterSerialNumber) { this.meterSerialNumber = meterSerialNumber; }
        public Double getAreaSqft() { return areaSqft; }
        public void setAreaSqft(Double areaSqft) { this.areaSqft = areaSqft; }
        public Integer getOccupancyCount() { return occupancyCount; }
        public void setOccupancyCount(Integer occupancyCount) { this.occupancyCount = occupancyCount; }
        public Boolean getHasMeter() { return hasMeter; }
        public void setHasMeter(Boolean hasMeter) { this.hasMeter = hasMeter; }
        public UserStatus getStatus() { return status; }
        public void setStatus(UserStatus status) { this.status = status; }
        public String getResidentFullName() { return residentFullName; }
        public void setResidentFullName(String residentFullName) { this.residentFullName = residentFullName; }
        public String getResidentEmail() { return residentEmail; }
        public void setResidentEmail(String residentEmail) { this.residentEmail = residentEmail; }
        public String getResidentPhone() { return residentPhone; }
        public void setResidentPhone(String residentPhone) { this.residentPhone = residentPhone; }
        public String getResidentPassword() { return residentPassword; }
        public void setResidentPassword(String residentPassword) { this.residentPassword = residentPassword; }
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

    public static class UpdateHouseholdStatusRequest {
        private UserStatus status = UserStatus.ACTIVE;

        public UpdateHouseholdStatusRequest() {}

        public UpdateHouseholdStatusRequest(UserStatus status) {
            this.status = status;
        }

        public UserStatus getStatus() { return status; }
        public void setStatus(UserStatus status) { this.status = status; }
    }

    public static class HouseholdResponse {
        private Long id;
        private Long apartmentId;
        private String flatNumber;
        private String meterSerialNumber;
        private Double areaSqft;
        private Integer occupancyCount;
        private Boolean hasMeter;
        private UserStatus status;
        private String inviteCode;
        private String residentName;
        private String residentEmail;
        private String residentPhone;
        private LocalDateTime createdAt;
        private Double latestReadingKl;
        private Double currentMonthConsumptionKl;

        // 3 Verification Documents & AI Verification fields
        private String doc1Type;
        private String doc1FileName;
        private String doc1Url;

        private String doc2Type;
        private String doc2FileName;
        private String doc2Url;

        private String doc3Type;
        private String doc3FileName;
        private String doc3Url;

        private Double aiVerificationScore;
        private String aiVerificationStatus;
        private String aiVerificationSummary;
        private String verificationNotes;

        public HouseholdResponse() {}

        public HouseholdResponse(Long id, Long apartmentId, String flatNumber, String meterSerialNumber, Double areaSqft, Integer occupancyCount, Boolean hasMeter, UserStatus status, String inviteCode, String residentName, String residentEmail, String residentPhone, LocalDateTime createdAt, Double latestReadingKl, Double currentMonthConsumptionKl, String doc1Type, String doc1FileName, String doc1Url, String doc2Type, String doc2FileName, String doc2Url, String doc3Type, String doc3FileName, String doc3Url, Double aiVerificationScore, String aiVerificationStatus, String aiVerificationSummary, String verificationNotes) {
            this.id = id;
            this.apartmentId = apartmentId;
            this.flatNumber = flatNumber;
            this.meterSerialNumber = meterSerialNumber;
            this.areaSqft = areaSqft;
            this.occupancyCount = occupancyCount;
            this.hasMeter = hasMeter;
            this.status = status != null ? status : UserStatus.ACTIVE;
            this.inviteCode = inviteCode;
            this.residentName = residentName;
            this.residentEmail = residentEmail;
            this.residentPhone = residentPhone;
            this.createdAt = createdAt;
            this.latestReadingKl = latestReadingKl;
            this.currentMonthConsumptionKl = currentMonthConsumptionKl;
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
        }

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private Long id;
            private Long apartmentId;
            private String flatNumber;
            private String meterSerialNumber;
            private Double areaSqft;
            private Integer occupancyCount;
            private Boolean hasMeter;
            private UserStatus status = UserStatus.ACTIVE;
            private String inviteCode;
            private String residentName;
            private String residentEmail;
            private String residentPhone;
            private LocalDateTime createdAt;
            private Double latestReadingKl;
            private Double currentMonthConsumptionKl;
            private String doc1Type;
            private String doc1FileName;
            private String doc1Url;
            private String doc2Type;
            private String doc2FileName;
            private String doc2Url;
            private String doc3Type;
            private String doc3FileName;
            private String doc3Url;
            private Double aiVerificationScore;
            private String aiVerificationStatus;
            private String aiVerificationSummary;
            private String verificationNotes;

            public Builder id(Long id) { this.id = id; return this; }
            public Builder apartmentId(Long apartmentId) { this.apartmentId = apartmentId; return this; }
            public Builder flatNumber(String flatNumber) { this.flatNumber = flatNumber; return this; }
            public Builder meterSerialNumber(String meterSerialNumber) { this.meterSerialNumber = meterSerialNumber; return this; }
            public Builder areaSqft(Double areaSqft) { this.areaSqft = areaSqft; return this; }
            public Builder occupancyCount(Integer occupancyCount) { this.occupancyCount = occupancyCount; return this; }
            public Builder hasMeter(Boolean hasMeter) { this.hasMeter = hasMeter; return this; }
            public Builder status(UserStatus status) { this.status = status; return this; }
            public Builder inviteCode(String inviteCode) { this.inviteCode = inviteCode; return this; }
            public Builder residentName(String residentName) { this.residentName = residentName; return this; }
            public Builder residentEmail(String residentEmail) { this.residentEmail = residentEmail; return this; }
            public Builder residentPhone(String residentPhone) { this.residentPhone = residentPhone; return this; }
            public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
            public Builder latestReadingKl(Double latestReadingKl) { this.latestReadingKl = latestReadingKl; return this; }
            public Builder currentMonthConsumptionKl(Double currentMonthConsumptionKl) { this.currentMonthConsumptionKl = currentMonthConsumptionKl; return this; }
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
            public Builder verificationNotes(String verificationNotes) { this.verificationNotes = verificationNotes; return this; }

            public HouseholdResponse build() {
                return new HouseholdResponse(id, apartmentId, flatNumber, meterSerialNumber, areaSqft, occupancyCount, hasMeter, status, inviteCode, residentName, residentEmail, residentPhone, createdAt, latestReadingKl, currentMonthConsumptionKl, doc1Type, doc1FileName, doc1Url, doc2Type, doc2FileName, doc2Url, doc3Type, doc3FileName, doc3Url, aiVerificationScore, aiVerificationStatus, aiVerificationSummary, verificationNotes);
            }
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getApartmentId() { return apartmentId; }
        public void setApartmentId(Long apartmentId) { this.apartmentId = apartmentId; }
        public String getFlatNumber() { return flatNumber; }
        public void setFlatNumber(String flatNumber) { this.flatNumber = flatNumber; }
        public String getMeterSerialNumber() { return meterSerialNumber; }
        public void setMeterSerialNumber(String meterSerialNumber) { this.meterSerialNumber = meterSerialNumber; }
        public Double getAreaSqft() { return areaSqft; }
        public void setAreaSqft(Double areaSqft) { this.areaSqft = areaSqft; }
        public Integer getOccupancyCount() { return occupancyCount; }
        public void setOccupancyCount(Integer occupancyCount) { this.occupancyCount = occupancyCount; }
        public Boolean getHasMeter() { return hasMeter; }
        public void setHasMeter(Boolean hasMeter) { this.hasMeter = hasMeter; }
        public UserStatus getStatus() { return status; }
        public void setStatus(UserStatus status) { this.status = status; }
        public String getInviteCode() { return inviteCode; }
        public void setInviteCode(String inviteCode) { this.inviteCode = inviteCode; }
        public String getResidentName() { return residentName; }
        public void setResidentName(String residentName) { this.residentName = residentName; }
        public String getResidentEmail() { return residentEmail; }
        public void setResidentEmail(String residentEmail) { this.residentEmail = residentEmail; }
        public String getResidentPhone() { return residentPhone; }
        public void setResidentPhone(String residentPhone) { this.residentPhone = residentPhone; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
        public Double getLatestReadingKl() { return latestReadingKl; }
        public void setLatestReadingKl(Double latestReadingKl) { this.latestReadingKl = latestReadingKl; }
        public Double getCurrentMonthConsumptionKl() { return currentMonthConsumptionKl; }
        public void setCurrentMonthConsumptionKl(Double currentMonthConsumptionKl) { this.currentMonthConsumptionKl = currentMonthConsumptionKl; }
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
    }
}
