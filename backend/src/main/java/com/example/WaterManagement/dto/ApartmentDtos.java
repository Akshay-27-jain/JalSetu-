package com.example.WaterManagement.dto;

import com.example.WaterManagement.entity.Role;
import com.example.WaterManagement.entity.UserStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class ApartmentDtos {

    public static class CreateApartmentRequest {
        @NotBlank(message = "Apartment name is required")
        private String name;

        private String address;

        @NotNull(message = "Total households count is required")
        private Integer totalHouseholds;

        @NotBlank(message = "Admin full name is required")
        private String adminFullName;

        @NotBlank(message = "Admin email is required")
        @Email(message = "Invalid admin email format")
        private String adminEmail;

        private String adminPhone;

        @NotBlank(message = "Admin password is required")
        @Size(min = 6, message = "Password must be at least 6 characters")
        private String adminPassword;

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

        public CreateApartmentRequest() {}

        public CreateApartmentRequest(String name, String address, Integer totalHouseholds, String adminFullName, String adminEmail, String adminPhone, String adminPassword, String doc1Type, String doc1FileName, String doc1Base64, String doc2Type, String doc2FileName, String doc2Base64, String doc3Type, String doc3FileName, String doc3Base64) {
            this.name = name;
            this.address = address;
            this.totalHouseholds = totalHouseholds;
            this.adminFullName = adminFullName;
            this.adminEmail = adminEmail;
            this.adminPhone = adminPhone;
            this.adminPassword = adminPassword;
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
            private String name;
            private String address;
            private Integer totalHouseholds;
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

            public Builder name(String name) { this.name = name; return this; }
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

            public CreateApartmentRequest build() {
                return new CreateApartmentRequest(name, address, totalHouseholds, adminFullName, adminEmail, adminPhone, adminPassword, doc1Type, doc1FileName, doc1Base64, doc2Type, doc2FileName, doc2Base64, doc3Type, doc3FileName, doc3Base64);
            }
        }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
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

    public static class UpdateCommunityAdminRequest {
        @NotBlank(message = "Admin full name is required")
        private String adminFullName;

        @NotBlank(message = "Admin email is required")
        @Email(message = "Invalid admin email format")
        private String adminEmail;

        private String adminPhone;

        private String adminPassword;

        private UserStatus status;

        @NotBlank(message = "Apartment name is required")
        private String apartmentName;

        private String apartmentAddress;

        @NotNull(message = "Total households count is required")
        private Integer totalHouseholds;

        public UpdateCommunityAdminRequest() {}

        public UpdateCommunityAdminRequest(String adminFullName, String adminEmail, String adminPhone, String adminPassword, UserStatus status, String apartmentName, String apartmentAddress, Integer totalHouseholds) {
            this.adminFullName = adminFullName;
            this.adminEmail = adminEmail;
            this.adminPhone = adminPhone;
            this.adminPassword = adminPassword;
            this.status = status;
            this.apartmentName = apartmentName;
            this.apartmentAddress = apartmentAddress;
            this.totalHouseholds = totalHouseholds;
        }

        public String getAdminFullName() { return adminFullName; }
        public void setAdminFullName(String adminFullName) { this.adminFullName = adminFullName; }
        public String getAdminEmail() { return adminEmail; }
        public void setAdminEmail(String adminEmail) { this.adminEmail = adminEmail; }
        public String getAdminPhone() { return adminPhone; }
        public void setAdminPhone(String adminPhone) { this.adminPhone = adminPhone; }
        public String getAdminPassword() { return adminPassword; }
        public void setAdminPassword(String adminPassword) { this.adminPassword = adminPassword; }
        public UserStatus getStatus() { return status; }
        public void setStatus(UserStatus status) { this.status = status; }
        public String getApartmentName() { return apartmentName; }
        public void setApartmentName(String apartmentName) { this.apartmentName = apartmentName; }
        public String getApartmentAddress() { return apartmentAddress; }
        public void setApartmentAddress(String apartmentAddress) { this.apartmentAddress = apartmentAddress; }
        public Integer getTotalHouseholds() { return totalHouseholds; }
        public void setTotalHouseholds(Integer totalHouseholds) { this.totalHouseholds = totalHouseholds; }
    }

    public static class UpdateCommunityAdminStatusRequest {
        private UserStatus status = UserStatus.ACTIVE;

        public UpdateCommunityAdminStatusRequest() {}

        public UpdateCommunityAdminStatusRequest(UserStatus status) {
            this.status = status;
        }

        public UserStatus getStatus() { return status; }
        public void setStatus(UserStatus status) { this.status = status; }
    }

    public static class ApartmentResponse {
        private Long id;
        private String name;
        private String address;
        private Integer totalHouseholds;
        private Long registeredHouseholds;
        private Long adminId;
        private String adminName;
        private String adminEmail;
        private String adminPhone;
        private LocalDateTime createdAt;

        public ApartmentResponse() {}

        public ApartmentResponse(Long id, String name, String address, Integer totalHouseholds, Long registeredHouseholds, Long adminId, String adminName, String adminEmail, String adminPhone, LocalDateTime createdAt) {
            this.id = id;
            this.name = name;
            this.address = address;
            this.totalHouseholds = totalHouseholds;
            this.registeredHouseholds = registeredHouseholds;
            this.adminId = adminId;
            this.adminName = adminName;
            this.adminEmail = adminEmail;
            this.adminPhone = adminPhone;
            this.createdAt = createdAt;
        }

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private Long id;
            private String name;
            private String address;
            private Integer totalHouseholds;
            private Long registeredHouseholds;
            private Long adminId;
            private String adminName;
            private String adminEmail;
            private String adminPhone;
            private LocalDateTime createdAt;

            public Builder id(Long id) { this.id = id; return this; }
            public Builder name(String name) { this.name = name; return this; }
            public Builder address(String address) { this.address = address; return this; }
            public Builder totalHouseholds(Integer totalHouseholds) { this.totalHouseholds = totalHouseholds; return this; }
            public Builder registeredHouseholds(Long registeredHouseholds) { this.registeredHouseholds = registeredHouseholds; return this; }
            public Builder adminId(Long adminId) { this.adminId = adminId; return this; }
            public Builder adminName(String adminName) { this.adminName = adminName; return this; }
            public Builder adminEmail(String adminEmail) { this.adminEmail = adminEmail; return this; }
            public Builder adminPhone(String adminPhone) { this.adminPhone = adminPhone; return this; }
            public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

            public ApartmentResponse build() {
                return new ApartmentResponse(id, name, address, totalHouseholds, registeredHouseholds, adminId, adminName, adminEmail, adminPhone, createdAt);
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
        public Long getRegisteredHouseholds() { return registeredHouseholds; }
        public void setRegisteredHouseholds(Long registeredHouseholds) { this.registeredHouseholds = registeredHouseholds; }
        public Long getAdminId() { return adminId; }
        public void setAdminId(Long adminId) { this.adminId = adminId; }
        public String getAdminName() { return adminName; }
        public void setAdminName(String adminName) { this.adminName = adminName; }
        public String getAdminEmail() { return adminEmail; }
        public void setAdminEmail(String adminEmail) { this.adminEmail = adminEmail; }
        public String getAdminPhone() { return adminPhone; }
        public void setAdminPhone(String adminPhone) { this.adminPhone = adminPhone; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    }

    public static class CommunityAdminDetailResponse {
        private Long adminId;
        private String adminName;
        private String adminEmail;
        private String adminPhone;
        private Role role;
        private UserStatus status;
        private Long apartmentId;
        private String apartmentName;
        private String apartmentAddress;
        private Integer totalHouseholds;
        private Long registeredHouseholds;
        private Long activeMetersCount;
        private Double totalMonthlyConsumptionKl;
        private Double totalMonthlyRevenue;
        private String baseTariffSummary;
        private LocalDateTime adminCreatedAt;
        private LocalDateTime apartmentCreatedAt;
        private List<HouseholdDtos.HouseholdResponse> households = new ArrayList<>();

        public CommunityAdminDetailResponse() {}

        public CommunityAdminDetailResponse(Long adminId, String adminName, String adminEmail, String adminPhone, Role role, UserStatus status, Long apartmentId, String apartmentName, String apartmentAddress, Integer totalHouseholds, Long registeredHouseholds, Long activeMetersCount, Double totalMonthlyConsumptionKl, Double totalMonthlyRevenue, String baseTariffSummary, LocalDateTime adminCreatedAt, LocalDateTime apartmentCreatedAt, List<HouseholdDtos.HouseholdResponse> households) {
            this.adminId = adminId;
            this.adminName = adminName;
            this.adminEmail = adminEmail;
            this.adminPhone = adminPhone;
            this.role = role;
            this.status = status != null ? status : UserStatus.ACTIVE;
            this.apartmentId = apartmentId;
            this.apartmentName = apartmentName;
            this.apartmentAddress = apartmentAddress;
            this.totalHouseholds = totalHouseholds;
            this.registeredHouseholds = registeredHouseholds;
            this.activeMetersCount = activeMetersCount;
            this.totalMonthlyConsumptionKl = totalMonthlyConsumptionKl;
            this.totalMonthlyRevenue = totalMonthlyRevenue;
            this.baseTariffSummary = baseTariffSummary;
            this.adminCreatedAt = adminCreatedAt;
            this.apartmentCreatedAt = apartmentCreatedAt;
            this.households = households != null ? households : new ArrayList<>();
        }

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private Long adminId;
            private String adminName;
            private String adminEmail;
            private String adminPhone;
            private Role role;
            private UserStatus status = UserStatus.ACTIVE;
            private Long apartmentId;
            private String apartmentName;
            private String apartmentAddress;
            private Integer totalHouseholds;
            private Long registeredHouseholds;
            private Long activeMetersCount;
            private Double totalMonthlyConsumptionKl;
            private Double totalMonthlyRevenue;
            private String baseTariffSummary;
            private LocalDateTime adminCreatedAt;
            private LocalDateTime apartmentCreatedAt;
            private List<HouseholdDtos.HouseholdResponse> households = new ArrayList<>();

            public Builder adminId(Long adminId) { this.adminId = adminId; return this; }
            public Builder adminName(String adminName) { this.adminName = adminName; return this; }
            public Builder adminEmail(String adminEmail) { this.adminEmail = adminEmail; return this; }
            public Builder adminPhone(String adminPhone) { this.adminPhone = adminPhone; return this; }
            public Builder role(Role role) { this.role = role; return this; }
            public Builder status(UserStatus status) { this.status = status; return this; }
            public Builder apartmentId(Long apartmentId) { this.apartmentId = apartmentId; return this; }
            public Builder apartmentName(String apartmentName) { this.apartmentName = apartmentName; return this; }
            public Builder apartmentAddress(String apartmentAddress) { this.apartmentAddress = apartmentAddress; return this; }
            public Builder totalHouseholds(Integer totalHouseholds) { this.totalHouseholds = totalHouseholds; return this; }
            public Builder registeredHouseholds(Long registeredHouseholds) { this.registeredHouseholds = registeredHouseholds; return this; }
            public Builder activeMetersCount(Long activeMetersCount) { this.activeMetersCount = activeMetersCount; return this; }
            public Builder totalMonthlyConsumptionKl(Double totalMonthlyConsumptionKl) { this.totalMonthlyConsumptionKl = totalMonthlyConsumptionKl; return this; }
            public Builder totalMonthlyRevenue(Double totalMonthlyRevenue) { this.totalMonthlyRevenue = totalMonthlyRevenue; return this; }
            public Builder baseTariffSummary(String baseTariffSummary) { this.baseTariffSummary = baseTariffSummary; return this; }
            public Builder adminCreatedAt(LocalDateTime adminCreatedAt) { this.adminCreatedAt = adminCreatedAt; return this; }
            public Builder apartmentCreatedAt(LocalDateTime apartmentCreatedAt) { this.apartmentCreatedAt = apartmentCreatedAt; return this; }
            public Builder households(List<HouseholdDtos.HouseholdResponse> households) { this.households = households; return this; }

            public CommunityAdminDetailResponse build() {
                return new CommunityAdminDetailResponse(adminId, adminName, adminEmail, adminPhone, role, status, apartmentId, apartmentName, apartmentAddress, totalHouseholds, registeredHouseholds, activeMetersCount, totalMonthlyConsumptionKl, totalMonthlyRevenue, baseTariffSummary, adminCreatedAt, apartmentCreatedAt, households);
            }
        }

        public Long getAdminId() { return adminId; }
        public void setAdminId(Long adminId) { this.adminId = adminId; }
        public String getAdminName() { return adminName; }
        public void setAdminName(String adminName) { this.adminName = adminName; }
        public String getAdminEmail() { return adminEmail; }
        public void setAdminEmail(String adminEmail) { this.adminEmail = adminEmail; }
        public String getAdminPhone() { return adminPhone; }
        public void setAdminPhone(String adminPhone) { this.adminPhone = adminPhone; }
        public Role getRole() { return role; }
        public void setRole(Role role) { this.role = role; }
        public UserStatus getStatus() { return status; }
        public void setStatus(UserStatus status) { this.status = status; }
        public Long getApartmentId() { return apartmentId; }
        public void setApartmentId(Long apartmentId) { this.apartmentId = apartmentId; }
        public String getApartmentName() { return apartmentName; }
        public void setApartmentName(String apartmentName) { this.apartmentName = apartmentName; }
        public String getApartmentAddress() { return apartmentAddress; }
        public void setApartmentAddress(String apartmentAddress) { this.apartmentAddress = apartmentAddress; }
        public Integer getTotalHouseholds() { return totalHouseholds; }
        public void setTotalHouseholds(Integer totalHouseholds) { this.totalHouseholds = totalHouseholds; }
        public Long getRegisteredHouseholds() { return registeredHouseholds; }
        public void setRegisteredHouseholds(Long registeredHouseholds) { this.registeredHouseholds = registeredHouseholds; }
        public Long getActiveMetersCount() { return activeMetersCount; }
        public void setActiveMetersCount(Long activeMetersCount) { this.activeMetersCount = activeMetersCount; }
        public Double getTotalMonthlyConsumptionKl() { return totalMonthlyConsumptionKl; }
        public void setTotalMonthlyConsumptionKl(Double totalMonthlyConsumptionKl) { this.totalMonthlyConsumptionKl = totalMonthlyConsumptionKl; }
        public Double getTotalMonthlyRevenue() { return totalMonthlyRevenue; }
        public void setTotalMonthlyRevenue(Double totalMonthlyRevenue) { this.totalMonthlyRevenue = totalMonthlyRevenue; }
        public String getBaseTariffSummary() { return baseTariffSummary; }
        public void setBaseTariffSummary(String baseTariffSummary) { this.baseTariffSummary = baseTariffSummary; }
        public LocalDateTime getAdminCreatedAt() { return adminCreatedAt; }
        public void setAdminCreatedAt(LocalDateTime adminCreatedAt) { this.adminCreatedAt = adminCreatedAt; }
        public LocalDateTime getApartmentCreatedAt() { return apartmentCreatedAt; }
        public void setApartmentCreatedAt(LocalDateTime apartmentCreatedAt) { this.apartmentCreatedAt = apartmentCreatedAt; }
        public List<HouseholdDtos.HouseholdResponse> getHouseholds() { return households; }
        public void setHouseholds(List<HouseholdDtos.HouseholdResponse> households) { this.households = households; }
    }

    public static class PlatformHouseholdResponse {
        private Long id;
        private Long apartmentId;
        private String apartmentName;
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
        private Double latestReadingKl;
        private Double currentMonthConsumptionKl;
        private LocalDateTime createdAt;

        public PlatformHouseholdResponse() {}

        public PlatformHouseholdResponse(Long id, Long apartmentId, String apartmentName, String flatNumber, String meterSerialNumber, Double areaSqft, Integer occupancyCount, Boolean hasMeter, UserStatus status, String inviteCode, String residentName, String residentEmail, String residentPhone, Double latestReadingKl, Double currentMonthConsumptionKl, LocalDateTime createdAt) {
            this.id = id;
            this.apartmentId = apartmentId;
            this.apartmentName = apartmentName;
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
            this.latestReadingKl = latestReadingKl;
            this.currentMonthConsumptionKl = currentMonthConsumptionKl;
            this.createdAt = createdAt;
        }

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private Long id;
            private Long apartmentId;
            private String apartmentName;
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
            private Double latestReadingKl;
            private Double currentMonthConsumptionKl;
            private LocalDateTime createdAt;

            public Builder id(Long id) { this.id = id; return this; }
            public Builder apartmentId(Long apartmentId) { this.apartmentId = apartmentId; return this; }
            public Builder apartmentName(String apartmentName) { this.apartmentName = apartmentName; return this; }
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
            public Builder latestReadingKl(Double latestReadingKl) { this.latestReadingKl = latestReadingKl; return this; }
            public Builder currentMonthConsumptionKl(Double currentMonthConsumptionKl) { this.currentMonthConsumptionKl = currentMonthConsumptionKl; return this; }
            public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

            public PlatformHouseholdResponse build() {
                return new PlatformHouseholdResponse(id, apartmentId, apartmentName, flatNumber, meterSerialNumber, areaSqft, occupancyCount, hasMeter, status, inviteCode, residentName, residentEmail, residentPhone, latestReadingKl, currentMonthConsumptionKl, createdAt);
            }
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getApartmentId() { return apartmentId; }
        public void setApartmentId(Long apartmentId) { this.apartmentId = apartmentId; }
        public String getApartmentName() { return apartmentName; }
        public void setApartmentName(String apartmentName) { this.apartmentName = apartmentName; }
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
        public Double getLatestReadingKl() { return latestReadingKl; }
        public void setLatestReadingKl(Double latestReadingKl) { this.latestReadingKl = latestReadingKl; }
        public Double getCurrentMonthConsumptionKl() { return currentMonthConsumptionKl; }
        public void setCurrentMonthConsumptionKl(Double currentMonthConsumptionKl) { this.currentMonthConsumptionKl = currentMonthConsumptionKl; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    }

    public static class MonthlyTrendDto {
        private String month;
        private Double consumptionKl;
        private Double billedAmount;
        private Double collectedAmount;

        public MonthlyTrendDto() {}

        public MonthlyTrendDto(String month, Double consumptionKl, Double billedAmount, Double collectedAmount) {
            this.month = month;
            this.consumptionKl = consumptionKl;
            this.billedAmount = billedAmount;
            this.collectedAmount = collectedAmount;
        }

        public String getMonth() { return month; }
        public void setMonth(String month) { this.month = month; }
        public Double getConsumptionKl() { return consumptionKl; }
        public void setConsumptionKl(Double consumptionKl) { this.consumptionKl = consumptionKl; }
        public Double getBilledAmount() { return billedAmount; }
        public void setBilledAmount(Double billedAmount) { this.billedAmount = billedAmount; }
        public Double getCollectedAmount() { return collectedAmount; }
        public void setCollectedAmount(Double collectedAmount) { this.collectedAmount = collectedAmount; }
    }

    public static class SocietyAnalyticsDto {
        private Long apartmentId;
        private String apartmentName;
        private String adminName;
        private String adminEmail;
        private Integer totalHouseholds;
        private Long registeredHouseholds;
        private Long activeMeters;
        private Double consumptionKl;
        private Double billedAmount;
        private Double collectedAmount;
        private Double collectionRate;

        public SocietyAnalyticsDto() {}

        public SocietyAnalyticsDto(Long apartmentId, String apartmentName, String adminName, String adminEmail, Integer totalHouseholds, Long registeredHouseholds, Long activeMeters, Double consumptionKl, Double billedAmount, Double collectedAmount, Double collectionRate) {
            this.apartmentId = apartmentId;
            this.apartmentName = apartmentName;
            this.adminName = adminName;
            this.adminEmail = adminEmail;
            this.totalHouseholds = totalHouseholds;
            this.registeredHouseholds = registeredHouseholds;
            this.activeMeters = activeMeters;
            this.consumptionKl = consumptionKl;
            this.billedAmount = billedAmount;
            this.collectedAmount = collectedAmount;
            this.collectionRate = collectionRate;
        }

        public Long getApartmentId() { return apartmentId; }
        public void setApartmentId(Long apartmentId) { this.apartmentId = apartmentId; }
        public String getApartmentName() { return apartmentName; }
        public void setApartmentName(String apartmentName) { this.apartmentName = apartmentName; }
        public String getAdminName() { return adminName; }
        public void setAdminName(String adminName) { this.adminName = adminName; }
        public String getAdminEmail() { return adminEmail; }
        public void setAdminEmail(String adminEmail) { this.adminEmail = adminEmail; }
        public Integer getTotalHouseholds() { return totalHouseholds; }
        public void setTotalHouseholds(Integer totalHouseholds) { this.totalHouseholds = totalHouseholds; }
        public Long getRegisteredHouseholds() { return registeredHouseholds; }
        public void setRegisteredHouseholds(Long registeredHouseholds) { this.registeredHouseholds = registeredHouseholds; }
        public Long getActiveMeters() { return activeMeters; }
        public void setActiveMeters(Long activeMeters) { this.activeMeters = activeMeters; }
        public Double getConsumptionKl() { return consumptionKl; }
        public void setConsumptionKl(Double consumptionKl) { this.consumptionKl = consumptionKl; }
        public Double getBilledAmount() { return billedAmount; }
        public void setBilledAmount(Double billedAmount) { this.billedAmount = billedAmount; }
        public Double getCollectedAmount() { return collectedAmount; }
        public void setCollectedAmount(Double collectedAmount) { this.collectedAmount = collectedAmount; }
        public Double getCollectionRate() { return collectionRate; }
        public void setCollectionRate(Double collectionRate) { this.collectionRate = collectionRate; }
    }

    public static class TopConsumerDto {
        private String flatNumber;
        private String apartmentName;
        private String residentName;
        private Double consumptionKl;

        public TopConsumerDto() {}

        public TopConsumerDto(String flatNumber, String apartmentName, String residentName, Double consumptionKl) {
            this.flatNumber = flatNumber;
            this.apartmentName = apartmentName;
            this.residentName = residentName;
            this.consumptionKl = consumptionKl;
        }

        public String getFlatNumber() { return flatNumber; }
        public void setFlatNumber(String flatNumber) { this.flatNumber = flatNumber; }
        public String getApartmentName() { return apartmentName; }
        public void setApartmentName(String apartmentName) { this.apartmentName = apartmentName; }
        public String getResidentName() { return residentName; }
        public void setResidentName(String residentName) { this.residentName = residentName; }
        public Double getConsumptionKl() { return consumptionKl; }
        public void setConsumptionKl(Double consumptionKl) { this.consumptionKl = consumptionKl; }
    }

    public static class PlatformAnalyticsResponse {
        private long totalApartments;
        private long totalHouseholds;
        private long totalUsers;
        private long totalActiveMeters;
        private double totalConsumptionCurrentMonth;
        private double totalBilledCurrentMonth;
        private double totalCollectedCurrentMonth;
        private double collectionRatePercentage;
        private List<MonthlyTrendDto> monthlyTrends = new ArrayList<>();
        private List<SocietyAnalyticsDto> societyStats = new ArrayList<>();
        private List<TopConsumerDto> topConsumers = new ArrayList<>();

        public PlatformAnalyticsResponse() {}

        public PlatformAnalyticsResponse(long totalApartments, long totalHouseholds, long totalUsers, long totalActiveMeters, double totalConsumptionCurrentMonth, double totalBilledCurrentMonth, double totalCollectedCurrentMonth, double collectionRatePercentage, List<MonthlyTrendDto> monthlyTrends, List<SocietyAnalyticsDto> societyStats, List<TopConsumerDto> topConsumers) {
            this.totalApartments = totalApartments;
            this.totalHouseholds = totalHouseholds;
            this.totalUsers = totalUsers;
            this.totalActiveMeters = totalActiveMeters;
            this.totalConsumptionCurrentMonth = totalConsumptionCurrentMonth;
            this.totalBilledCurrentMonth = totalBilledCurrentMonth;
            this.totalCollectedCurrentMonth = totalCollectedCurrentMonth;
            this.collectionRatePercentage = collectionRatePercentage;
            this.monthlyTrends = monthlyTrends != null ? monthlyTrends : new ArrayList<>();
            this.societyStats = societyStats != null ? societyStats : new ArrayList<>();
            this.topConsumers = topConsumers != null ? topConsumers : new ArrayList<>();
        }

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private long totalApartments;
            private long totalHouseholds;
            private long totalUsers;
            private long totalActiveMeters;
            private double totalConsumptionCurrentMonth;
            private double totalBilledCurrentMonth;
            private double totalCollectedCurrentMonth;
            private double collectionRatePercentage;
            private List<MonthlyTrendDto> monthlyTrends = new ArrayList<>();
            private List<SocietyAnalyticsDto> societyStats = new ArrayList<>();
            private List<TopConsumerDto> topConsumers = new ArrayList<>();

            public Builder totalApartments(long val) { this.totalApartments = val; return this; }
            public Builder totalHouseholds(long val) { this.totalHouseholds = val; return this; }
            public Builder totalUsers(long val) { this.totalUsers = val; return this; }
            public Builder totalActiveMeters(long val) { this.totalActiveMeters = val; return this; }
            public Builder totalConsumptionCurrentMonth(double val) { this.totalConsumptionCurrentMonth = val; return this; }
            public Builder totalBilledCurrentMonth(double val) { this.totalBilledCurrentMonth = val; return this; }
            public Builder totalCollectedCurrentMonth(double val) { this.totalCollectedCurrentMonth = val; return this; }
            public Builder collectionRatePercentage(double val) { this.collectionRatePercentage = val; return this; }
            public Builder monthlyTrends(List<MonthlyTrendDto> val) { this.monthlyTrends = val; return this; }
            public Builder societyStats(List<SocietyAnalyticsDto> val) { this.societyStats = val; return this; }
            public Builder topConsumers(List<TopConsumerDto> val) { this.topConsumers = val; return this; }

            public PlatformAnalyticsResponse build() {
                return new PlatformAnalyticsResponse(totalApartments, totalHouseholds, totalUsers, totalActiveMeters, totalConsumptionCurrentMonth, totalBilledCurrentMonth, totalCollectedCurrentMonth, collectionRatePercentage, monthlyTrends, societyStats, topConsumers);
            }
        }

        public long getTotalApartments() { return totalApartments; }
        public void setTotalApartments(long totalApartments) { this.totalApartments = totalApartments; }
        public long getTotalHouseholds() { return totalHouseholds; }
        public void setTotalHouseholds(long totalHouseholds) { this.totalHouseholds = totalHouseholds; }
        public long getTotalUsers() { return totalUsers; }
        public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }
        public long getTotalActiveMeters() { return totalActiveMeters; }
        public void setTotalActiveMeters(long totalActiveMeters) { this.totalActiveMeters = totalActiveMeters; }
        public double getTotalConsumptionCurrentMonth() { return totalConsumptionCurrentMonth; }
        public void setTotalConsumptionCurrentMonth(double totalConsumptionCurrentMonth) { this.totalConsumptionCurrentMonth = totalConsumptionCurrentMonth; }
        public double getTotalBilledCurrentMonth() { return totalBilledCurrentMonth; }
        public void setTotalBilledCurrentMonth(double totalBilledCurrentMonth) { this.totalBilledCurrentMonth = totalBilledCurrentMonth; }
        public double getTotalCollectedCurrentMonth() { return totalCollectedCurrentMonth; }
        public void setTotalCollectedCurrentMonth(double totalCollectedCurrentMonth) { this.totalCollectedCurrentMonth = totalCollectedCurrentMonth; }
        public double getCollectionRatePercentage() { return collectionRatePercentage; }
        public void setCollectionRatePercentage(double collectionRatePercentage) { this.collectionRatePercentage = collectionRatePercentage; }
        public List<MonthlyTrendDto> getMonthlyTrends() { return monthlyTrends; }
        public void setMonthlyTrends(List<MonthlyTrendDto> monthlyTrends) { this.monthlyTrends = monthlyTrends; }
        public List<SocietyAnalyticsDto> getSocietyStats() { return societyStats; }
        public void setSocietyStats(List<SocietyAnalyticsDto> societyStats) { this.societyStats = societyStats; }
        public List<TopConsumerDto> getTopConsumers() { return topConsumers; }
        public void setTopConsumers(List<TopConsumerDto> topConsumers) { this.topConsumers = topConsumers; }
    }

    public static class MainAdminStatsResponse {
        private long totalApartments;
        private long totalHouseholds;
        private long totalUsers;
        private double totalConsumptionCurrentMonth;

        public MainAdminStatsResponse() {}

        public MainAdminStatsResponse(long totalApartments, long totalHouseholds, long totalUsers, double totalConsumptionCurrentMonth) {
            this.totalApartments = totalApartments;
            this.totalHouseholds = totalHouseholds;
            this.totalUsers = totalUsers;
            this.totalConsumptionCurrentMonth = totalConsumptionCurrentMonth;
        }

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private long totalApartments;
            private long totalHouseholds;
            private long totalUsers;
            private double totalConsumptionCurrentMonth;

            public Builder totalApartments(long totalApartments) { this.totalApartments = totalApartments; return this; }
            public Builder totalHouseholds(long totalHouseholds) { this.totalHouseholds = totalHouseholds; return this; }
            public Builder totalUsers(long totalUsers) { this.totalUsers = totalUsers; return this; }
            public Builder totalConsumptionCurrentMonth(double totalConsumptionCurrentMonth) { this.totalConsumptionCurrentMonth = totalConsumptionCurrentMonth; return this; }

            public MainAdminStatsResponse build() {
                return new MainAdminStatsResponse(totalApartments, totalHouseholds, totalUsers, totalConsumptionCurrentMonth);
            }
        }

        public long getTotalApartments() { return totalApartments; }
        public void setTotalApartments(long totalApartments) { this.totalApartments = totalApartments; }
        public long getTotalHouseholds() { return totalHouseholds; }
        public void setTotalHouseholds(long totalHouseholds) { this.totalHouseholds = totalHouseholds; }
        public long getTotalUsers() { return totalUsers; }
        public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }
        public double getTotalConsumptionCurrentMonth() { return totalConsumptionCurrentMonth; }
        public void setTotalConsumptionCurrentMonth(double totalConsumptionCurrentMonth) { this.totalConsumptionCurrentMonth = totalConsumptionCurrentMonth; }
    }

    public static class PendingVerificationResponse {
        private String verificationType; // "COMMUNITY_ADMIN" or "RESIDENT"
        private Long userId;
        private Long apartmentId;
        private Long householdId;
        private String apartmentName;
        private String flatNumber;
        private String address;
        private Integer totalHouseholds;
        private Long adminId;
        private String adminFullName;
        private String adminEmail;
        private String adminPhone;
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

        // Backward compatibility
        private String documentUrl;
        private String documentFileName;
        private String documentType;

        // AI Verification Audit
        private Double aiVerificationScore;
        private String aiVerificationStatus;
        private String aiVerificationSummary;
        private String aiExtractedDataJson;

        private String verificationNotes;
        private LocalDateTime submittedAt;
        private LocalDateTime reviewedAt;

        public PendingVerificationResponse() {}

        public PendingVerificationResponse(String verificationType, Long userId, Long apartmentId, Long householdId, String apartmentName, String flatNumber, String address, Integer totalHouseholds, Long adminId, String adminFullName, String adminEmail, String adminPhone, UserStatus status, String doc1Type, String doc1FileName, String doc1Url, String doc2Type, String doc2FileName, String doc2Url, String doc3Type, String doc3FileName, String doc3Url, String documentUrl, String documentFileName, String documentType, Double aiVerificationScore, String aiVerificationStatus, String aiVerificationSummary, String aiExtractedDataJson, String verificationNotes, LocalDateTime submittedAt, LocalDateTime reviewedAt) {
            this.verificationType = verificationType != null ? verificationType : "COMMUNITY_ADMIN";
            this.userId = userId != null ? userId : adminId;
            this.apartmentId = apartmentId;
            this.householdId = householdId;
            this.apartmentName = apartmentName;
            this.flatNumber = flatNumber;
            this.address = address;
            this.totalHouseholds = totalHouseholds;
            this.adminId = this.userId;
            this.adminFullName = adminFullName;
            this.adminEmail = adminEmail;
            this.adminPhone = adminPhone;
            this.status = status;
            this.doc1Type = doc1Type != null ? doc1Type : documentType;
            this.doc1FileName = doc1FileName != null ? doc1FileName : documentFileName;
            this.doc1Url = doc1Url != null ? doc1Url : documentUrl;
            this.doc2Type = doc2Type;
            this.doc2FileName = doc2FileName;
            this.doc2Url = doc2Url;
            this.doc3Type = doc3Type;
            this.doc3FileName = doc3FileName;
            this.doc3Url = doc3Url;
            this.documentUrl = this.doc1Url;
            this.documentFileName = this.doc1FileName;
            this.documentType = this.doc1Type;
            this.aiVerificationScore = aiVerificationScore != null ? aiVerificationScore : 0.0;
            this.aiVerificationStatus = aiVerificationStatus != null ? aiVerificationStatus : "PENDING_SCAN";
            this.aiVerificationSummary = aiVerificationSummary;
            this.aiExtractedDataJson = aiExtractedDataJson;
            this.verificationNotes = verificationNotes;
            this.submittedAt = submittedAt;
            this.reviewedAt = reviewedAt;
        }

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private String verificationType = "COMMUNITY_ADMIN";
            private Long userId;
            private Long apartmentId;
            private Long householdId;
            private String apartmentName;
            private String flatNumber;
            private String address;
            private Integer totalHouseholds;
            private Long adminId;
            private String adminFullName;
            private String adminEmail;
            private String adminPhone;
            private UserStatus status;
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
            private String verificationNotes;
            private LocalDateTime submittedAt;
            private LocalDateTime reviewedAt;

            public Builder verificationType(String verificationType) { this.verificationType = verificationType; return this; }
            public Builder userId(Long userId) { this.userId = userId; this.adminId = userId; return this; }
            public Builder apartmentId(Long apartmentId) { this.apartmentId = apartmentId; return this; }
            public Builder householdId(Long householdId) { this.householdId = householdId; return this; }
            public Builder apartmentName(String apartmentName) { this.apartmentName = apartmentName; return this; }
            public Builder flatNumber(String flatNumber) { this.flatNumber = flatNumber; return this; }
            public Builder address(String address) { this.address = address; return this; }
            public Builder totalHouseholds(Integer totalHouseholds) { this.totalHouseholds = totalHouseholds; return this; }
            public Builder adminId(Long adminId) { this.adminId = adminId; this.userId = adminId; return this; }
            public Builder adminFullName(String adminFullName) { this.adminFullName = adminFullName; return this; }
            public Builder adminEmail(String adminEmail) { this.adminEmail = adminEmail; return this; }
            public Builder adminPhone(String adminPhone) { this.adminPhone = adminPhone; return this; }
            public Builder status(UserStatus status) { this.status = status; return this; }
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
            public Builder verificationNotes(String verificationNotes) { this.verificationNotes = verificationNotes; return this; }
            public Builder submittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; return this; }
            public Builder reviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; return this; }

            public PendingVerificationResponse build() {
                return new PendingVerificationResponse(verificationType, userId, apartmentId, householdId, apartmentName, flatNumber, address, totalHouseholds, adminId, adminFullName, adminEmail, adminPhone, status, doc1Type, doc1FileName, doc1Url, doc2Type, doc2FileName, doc2Url, doc3Type, doc3FileName, doc3Url, documentUrl, documentFileName, documentType, aiVerificationScore, aiVerificationStatus, aiVerificationSummary, aiExtractedDataJson, verificationNotes, submittedAt, reviewedAt);
            }
        }

        public String getVerificationType() { return verificationType != null ? verificationType : "COMMUNITY_ADMIN"; }
        public void setVerificationType(String verificationType) { this.verificationType = verificationType; }
        public Long getUserId() { return userId != null ? userId : adminId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public Long getApartmentId() { return apartmentId; }
        public void setApartmentId(Long apartmentId) { this.apartmentId = apartmentId; }
        public Long getHouseholdId() { return householdId; }
        public void setHouseholdId(Long householdId) { this.householdId = householdId; }
        public String getApartmentName() { return apartmentName; }
        public void setApartmentName(String apartmentName) { this.apartmentName = apartmentName; }
        public String getFlatNumber() { return flatNumber; }
        public void setFlatNumber(String flatNumber) { this.flatNumber = flatNumber; }
        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }
        public Integer getTotalHouseholds() { return totalHouseholds; }
        public void setTotalHouseholds(Integer totalHouseholds) { this.totalHouseholds = totalHouseholds; }
        public Long getAdminId() { return adminId != null ? adminId : userId; }
        public void setAdminId(Long adminId) { this.adminId = adminId; }
        public String getAdminFullName() { return adminFullName; }
        public void setAdminFullName(String adminFullName) { this.adminFullName = adminFullName; }
        public String getAdminEmail() { return adminEmail; }
        public void setAdminEmail(String adminEmail) { this.adminEmail = adminEmail; }
        public String getAdminPhone() { return adminPhone; }
        public void setAdminPhone(String adminPhone) { this.adminPhone = adminPhone; }
        public UserStatus getStatus() { return status; }
        public void setStatus(UserStatus status) { this.status = status; }
        public String getDoc1Type() { return doc1Type != null ? doc1Type : documentType; }
        public void setDoc1Type(String doc1Type) { this.doc1Type = doc1Type; }
        public String getDoc1FileName() { return doc1FileName != null ? doc1FileName : documentFileName; }
        public void setDoc1FileName(String doc1FileName) { this.doc1FileName = doc1FileName; }
        public String getDoc1Url() { return doc1Url != null ? doc1Url : documentUrl; }
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
        public String getDocumentUrl() { return documentUrl != null ? documentUrl : doc1Url; }
        public void setDocumentUrl(String documentUrl) { this.documentUrl = documentUrl; }
        public String getDocumentFileName() { return documentFileName != null ? documentFileName : doc1FileName; }
        public void setDocumentFileName(String documentFileName) { this.documentFileName = documentFileName; }
        public String getDocumentType() { return documentType != null ? documentType : doc1Type; }
        public void setDocumentType(String documentType) { this.documentType = documentType; }
        public Double getAiVerificationScore() { return aiVerificationScore; }
        public void setAiVerificationScore(Double aiVerificationScore) { this.aiVerificationScore = aiVerificationScore; }
        public String getAiVerificationStatus() { return aiVerificationStatus; }
        public void setAiVerificationStatus(String aiVerificationStatus) { this.aiVerificationStatus = aiVerificationStatus; }
        public String getAiVerificationSummary() { return aiVerificationSummary; }
        public void setAiVerificationSummary(String aiVerificationSummary) { this.aiVerificationSummary = aiVerificationSummary; }
        public String getAiExtractedDataJson() { return aiExtractedDataJson; }
        public void setAiExtractedDataJson(String aiExtractedDataJson) { this.aiExtractedDataJson = aiExtractedDataJson; }
        public String getVerificationNotes() { return verificationNotes; }
        public void setVerificationNotes(String verificationNotes) { this.verificationNotes = verificationNotes; }
        public LocalDateTime getSubmittedAt() { return submittedAt; }
        public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }
        public LocalDateTime getReviewedAt() { return reviewedAt; }
        public void setReviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; }
    }

    public static class ReviewVerificationRequest {
        private String action;
        private String notes;
        private String verificationType; // "COMMUNITY_ADMIN" or "RESIDENT"
        private Long targetId; // apartmentId or userId

        private String scanMode; // "DEEP_FORENSIC", "FAST_HEURISTIC", "STRICT_FRAUD"
        private Boolean checkNameMatch;
        private Boolean checkAddressMatch;
        private Boolean checkStampSeal;
        private Boolean checkTampering;
        private Boolean checkDuplicates;

        public ReviewVerificationRequest() {}

        public ReviewVerificationRequest(String action, String notes, String verificationType, Long targetId) {
            this.action = action;
            this.notes = notes;
            this.verificationType = verificationType;
            this.targetId = targetId;
        }

        public String getAction() { return action; }
        public void setAction(String action) { this.action = action; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
        public String getVerificationType() { return verificationType; }
        public void setVerificationType(String verificationType) { this.verificationType = verificationType; }
        public Long getTargetId() { return targetId; }
        public void setTargetId(Long targetId) { this.targetId = targetId; }
        public String getScanMode() { return scanMode; }
        public void setScanMode(String scanMode) { this.scanMode = scanMode; }
        public Boolean getCheckNameMatch() { return checkNameMatch; }
        public void setCheckNameMatch(Boolean checkNameMatch) { this.checkNameMatch = checkNameMatch; }
        public Boolean getCheckAddressMatch() { return checkAddressMatch; }
        public void setCheckAddressMatch(Boolean checkAddressMatch) { this.checkAddressMatch = checkAddressMatch; }
        public Boolean getCheckStampSeal() { return checkStampSeal; }
        public void setCheckStampSeal(Boolean checkStampSeal) { this.checkStampSeal = checkStampSeal; }
        public Boolean getCheckTampering() { return checkTampering; }
        public void setCheckTampering(Boolean checkTampering) { this.checkTampering = checkTampering; }
        public Boolean getCheckDuplicates() { return checkDuplicates; }
        public void setCheckDuplicates(Boolean checkDuplicates) { this.checkDuplicates = checkDuplicates; }
    }
}
