package com.example.WaterManagement.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "households", uniqueConstraints = {
    @UniqueConstraint(name = "uq_apartment_flat", columnNames = {"apartment_id", "flat_number"})
})
public class Household {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "apartment_id", nullable = false)
    private Apartment apartment;

    @Column(name = "flat_number", nullable = false, length = 50)
    private String flatNumber;

    @Column(name = "meter_serial_number", length = 100)
    private String meterSerialNumber;

    @Column(name = "area_sqft")
    private Double areaSqft;

    @Column(name = "occupancy_count")
    private Integer occupancyCount;

    @Column(name = "has_meter")
    private Boolean hasMeter = true;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private UserStatus status = UserStatus.ACTIVE;

    @Column(name = "invite_code", nullable = false, unique = true, length = 100)
    private String inviteCode;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public Household() {}

    public Household(Long id, Apartment apartment, String flatNumber, String meterSerialNumber, Double areaSqft, Integer occupancyCount, Boolean hasMeter, UserStatus status, String inviteCode, LocalDateTime createdAt) {
        this.id = id;
        this.apartment = apartment;
        this.flatNumber = flatNumber;
        this.meterSerialNumber = meterSerialNumber;
        this.areaSqft = areaSqft;
        this.occupancyCount = occupancyCount;
        this.hasMeter = hasMeter != null ? hasMeter : true;
        this.status = status != null ? status : UserStatus.ACTIVE;
        this.inviteCode = inviteCode;
        this.createdAt = createdAt;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private Apartment apartment;
        private String flatNumber;
        private String meterSerialNumber;
        private Double areaSqft;
        private Integer occupancyCount;
        private Boolean hasMeter = true;
        private UserStatus status = UserStatus.ACTIVE;
        private String inviteCode;
        private LocalDateTime createdAt;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder apartment(Apartment apartment) { this.apartment = apartment; return this; }
        public Builder flatNumber(String flatNumber) { this.flatNumber = flatNumber; return this; }
        public Builder meterSerialNumber(String meterSerialNumber) { this.meterSerialNumber = meterSerialNumber; return this; }
        public Builder areaSqft(Double areaSqft) { this.areaSqft = areaSqft; return this; }
        public Builder occupancyCount(Integer occupancyCount) { this.occupancyCount = occupancyCount; return this; }
        public Builder hasMeter(Boolean hasMeter) { this.hasMeter = hasMeter; return this; }
        public Builder status(UserStatus status) { this.status = status; return this; }
        public Builder inviteCode(String inviteCode) { this.inviteCode = inviteCode; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public Household build() {
            return new Household(id, apartment, flatNumber, meterSerialNumber, areaSqft, occupancyCount, hasMeter, status, inviteCode, createdAt);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Apartment getApartment() { return apartment; }
    public void setApartment(Apartment apartment) { this.apartment = apartment; }
    public String getFlatNumber() { return flatNumber; }
    public void setFlatNumber(String flatNumber) { this.flatNumber = flatNumber; }
    public String getMeterSerialNumber() { return meterSerialNumber; }
    public void setMeterSerialNumber(String meterSerialNumber) { this.meterSerialNumber = meterSerialNumber; }
    public Double getAreaSqft() { return areaSqft; }
    public void setAreaSqft(Double areaSqft) { this.areaSqft = areaSqft; }
    public Integer getOccupancyCount() { return occupancyCount; }
    public void setOccupancyCount(Integer occupancyCount) { this.occupancyCount = occupancyCount; }
    public Boolean getHasMeter() { return hasMeter; }
    public Boolean isHasMeter() { return hasMeter != null && hasMeter; }
    public void setHasMeter(Boolean hasMeter) { this.hasMeter = hasMeter; }
    public UserStatus getStatus() { return status; }
    public void setStatus(UserStatus status) { this.status = status != null ? status : UserStatus.ACTIVE; }
    public String getInviteCode() { return inviteCode; }
    public void setInviteCode(String inviteCode) { this.inviteCode = inviteCode; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
