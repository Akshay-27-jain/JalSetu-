package com.example.WaterManagement.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "water_usage_logs", uniqueConstraints = {
    @UniqueConstraint(name = "uq_household_date", columnNames = {"household_id", "reading_date"})
})
public class WaterUsageLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "household_id", nullable = false)
    private Household household;

    @Column(name = "reading_date", nullable = false)
    private LocalDate readingDate;

    @Column(name = "meter_reading_kl", nullable = false)
    private Double meterReadingKl;

    @Column(name = "consumption_kl", nullable = false)
    private Double consumptionKl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private UsageSource source;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public WaterUsageLog() {}

    public WaterUsageLog(Long id, Household household, LocalDate readingDate, Double meterReadingKl, Double consumptionKl, UsageSource source, LocalDateTime createdAt) {
        this.id = id;
        this.household = household;
        this.readingDate = readingDate;
        this.meterReadingKl = meterReadingKl;
        this.consumptionKl = consumptionKl;
        this.source = source;
        this.createdAt = createdAt;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private Household household;
        private LocalDate readingDate;
        private Double meterReadingKl;
        private Double consumptionKl;
        private UsageSource source;
        private LocalDateTime createdAt;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder household(Household household) { this.household = household; return this; }
        public Builder readingDate(LocalDate readingDate) { this.readingDate = readingDate; return this; }
        public Builder meterReadingKl(Double meterReadingKl) { this.meterReadingKl = meterReadingKl; return this; }
        public Builder consumptionKl(Double consumptionKl) { this.consumptionKl = consumptionKl; return this; }
        public Builder source(UsageSource source) { this.source = source; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public WaterUsageLog build() {
            return new WaterUsageLog(id, household, readingDate, meterReadingKl, consumptionKl, source, createdAt);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Household getHousehold() { return household; }
    public void setHousehold(Household household) { this.household = household; }
    public LocalDate getReadingDate() { return readingDate; }
    public void setReadingDate(LocalDate readingDate) { this.readingDate = readingDate; }
    public Double getMeterReadingKl() { return meterReadingKl; }
    public void setMeterReadingKl(Double meterReadingKl) { this.meterReadingKl = meterReadingKl; }
    public Double getConsumptionKl() { return consumptionKl; }
    public void setConsumptionKl(Double consumptionKl) { this.consumptionKl = consumptionKl; }
    public UsageSource getSource() { return source; }
    public void setSource(UsageSource source) { this.source = source; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
