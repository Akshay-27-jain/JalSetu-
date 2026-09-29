package com.example.WaterManagement.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "tariff_plans")
public class TariffPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "apartment_id", nullable = false)
    private Apartment apartment;

    @Column(name = "base_maintenance_fee", nullable = false)
    private Double baseMaintenanceFee = 150.0;

    @Column(name = "base_rate_per_kl", nullable = false)
    private Double baseRatePerKl = 15.0; // Tier 1 rate

    @Column(name = "base_tier_limit_kl", nullable = false)
    private Double baseTierLimitKl = 10.0; // Tier 1 limit

    @Column(name = "mid_rate_per_kl", nullable = false)
    private Double midRatePerKl = 25.0; // Tier 2 rate

    @Column(name = "mid_tier_limit_kl", nullable = false)
    private Double midTierLimitKl = 25.0; // Tier 2 limit

    @Column(name = "higher_rate_per_kl", nullable = false)
    private Double higherRatePerKl = 45.0; // Tier 3 rate

    @Enumerated(EnumType.STRING)
    @Column(name = "apportionment_method", nullable = false, length = 50)
    private ApportionmentMethod apportionmentMethod = ApportionmentMethod.BY_FLAT_AREA;

    @Column(name = "effective_from", nullable = false)
    private LocalDate effectiveFrom = LocalDate.now();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public TariffPlan() {}

    public TariffPlan(Long id, Apartment apartment, Double baseMaintenanceFee, Double baseRatePerKl, Double baseTierLimitKl, Double midRatePerKl, Double midTierLimitKl, Double higherRatePerKl, ApportionmentMethod apportionmentMethod, LocalDate effectiveFrom, LocalDateTime createdAt) {
        this.id = id;
        this.apartment = apartment;
        this.baseMaintenanceFee = baseMaintenanceFee != null ? baseMaintenanceFee : 150.0;
        this.baseRatePerKl = baseRatePerKl != null ? baseRatePerKl : 15.0;
        this.baseTierLimitKl = baseTierLimitKl != null ? baseTierLimitKl : 10.0;
        this.midRatePerKl = midRatePerKl != null ? midRatePerKl : 25.0;
        this.midTierLimitKl = midTierLimitKl != null ? midTierLimitKl : 25.0;
        this.higherRatePerKl = higherRatePerKl != null ? higherRatePerKl : 45.0;
        this.apportionmentMethod = apportionmentMethod != null ? apportionmentMethod : ApportionmentMethod.BY_FLAT_AREA;
        this.effectiveFrom = effectiveFrom != null ? effectiveFrom : LocalDate.now();
        this.createdAt = createdAt;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private Apartment apartment;
        private Double baseMaintenanceFee = 150.0;
        private Double baseRatePerKl = 15.0;
        private Double baseTierLimitKl = 10.0;
        private Double midRatePerKl = 25.0;
        private Double midTierLimitKl = 25.0;
        private Double higherRatePerKl = 45.0;
        private ApportionmentMethod apportionmentMethod = ApportionmentMethod.BY_FLAT_AREA;
        private LocalDate effectiveFrom = LocalDate.now();
        private LocalDateTime createdAt;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder apartment(Apartment apartment) { this.apartment = apartment; return this; }
        public Builder baseMaintenanceFee(Double fee) { this.baseMaintenanceFee = fee; return this; }
        public Builder baseRatePerKl(Double baseRatePerKl) { this.baseRatePerKl = baseRatePerKl; return this; }
        public Builder baseTierLimitKl(Double baseTierLimitKl) { this.baseTierLimitKl = baseTierLimitKl; return this; }
        public Builder midRatePerKl(Double midRatePerKl) { this.midRatePerKl = midRatePerKl; return this; }
        public Builder midTierLimitKl(Double midTierLimitKl) { this.midTierLimitKl = midTierLimitKl; return this; }
        public Builder higherRatePerKl(Double higherRatePerKl) { this.higherRatePerKl = higherRatePerKl; return this; }
        public Builder apportionmentMethod(ApportionmentMethod method) { this.apportionmentMethod = method; return this; }
        public Builder effectiveFrom(LocalDate effectiveFrom) { this.effectiveFrom = effectiveFrom; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public TariffPlan build() {
            return new TariffPlan(id, apartment, baseMaintenanceFee, baseRatePerKl, baseTierLimitKl, midRatePerKl, midTierLimitKl, higherRatePerKl, apportionmentMethod, effectiveFrom, createdAt);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Apartment getApartment() { return apartment; }
    public void setApartment(Apartment apartment) { this.apartment = apartment; }
    public Double getBaseMaintenanceFee() { return baseMaintenanceFee; }
    public void setBaseMaintenanceFee(Double baseMaintenanceFee) { this.baseMaintenanceFee = baseMaintenanceFee; }
    public Double getBaseRatePerKl() { return baseRatePerKl; }
    public void setBaseRatePerKl(Double baseRatePerKl) { this.baseRatePerKl = baseRatePerKl; }
    public Double getBaseTierLimitKl() { return baseTierLimitKl; }
    public void setBaseTierLimitKl(Double baseTierLimitKl) { this.baseTierLimitKl = baseTierLimitKl; }
    public Double getMidRatePerKl() { return midRatePerKl; }
    public void setMidRatePerKl(Double midRatePerKl) { this.midRatePerKl = midRatePerKl; }
    public Double getMidTierLimitKl() { return midTierLimitKl; }
    public void setMidTierLimitKl(Double midTierLimitKl) { this.midTierLimitKl = midTierLimitKl; }
    public Double getHigherRatePerKl() { return higherRatePerKl; }
    public void setHigherRatePerKl(Double higherRatePerKl) { this.higherRatePerKl = higherRatePerKl; }
    public ApportionmentMethod getApportionmentMethod() { return apportionmentMethod; }
    public void setApportionmentMethod(ApportionmentMethod apportionmentMethod) { this.apportionmentMethod = apportionmentMethod; }
    public LocalDate getEffectiveFrom() { return effectiveFrom; }
    public void setEffectiveFrom(LocalDate effectiveFrom) { this.effectiveFrom = effectiveFrom; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
