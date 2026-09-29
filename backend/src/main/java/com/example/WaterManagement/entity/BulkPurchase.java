package com.example.WaterManagement.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "bulk_purchases")
public class BulkPurchase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "apartment_id", nullable = false)
    private Apartment apartment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cycle_id")
    private BillingCycle billingCycle;

    @Enumerated(EnumType.STRING)
    @Column(name = "source_type", nullable = false, length = 50)
    private BulkPurchaseSource sourceType = BulkPurchaseSource.TANKER;

    @Column(name = "vendor_name", length = 150)
    private String vendorName;

    @Column(name = "volume_kl", nullable = false)
    private Double volumeKl;

    @Column(name = "unit_cost", nullable = false)
    private Double unitCost;

    @Column(name = "total_cost", nullable = false)
    private Double totalCost;

    @Column(name = "purchased_at", nullable = false)
    private LocalDate purchasedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public BulkPurchase() {}

    public BulkPurchase(Long id, Apartment apartment, BillingCycle billingCycle, BulkPurchaseSource sourceType, String vendorName, Double volumeKl, Double unitCost, Double totalCost, LocalDate purchasedAt, LocalDateTime createdAt) {
        this.id = id;
        this.apartment = apartment;
        this.billingCycle = billingCycle;
        this.sourceType = sourceType != null ? sourceType : BulkPurchaseSource.TANKER;
        this.vendorName = vendorName;
        this.volumeKl = volumeKl;
        this.unitCost = unitCost;
        this.totalCost = totalCost;
        this.purchasedAt = purchasedAt;
        this.createdAt = createdAt;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private Apartment apartment;
        private BillingCycle billingCycle;
        private BulkPurchaseSource sourceType = BulkPurchaseSource.TANKER;
        private String vendorName;
        private Double volumeKl;
        private Double unitCost;
        private Double totalCost;
        private LocalDate purchasedAt;
        private LocalDateTime createdAt;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder apartment(Apartment apartment) { this.apartment = apartment; return this; }
        public Builder billingCycle(BillingCycle billingCycle) { this.billingCycle = billingCycle; return this; }
        public Builder sourceType(BulkPurchaseSource sourceType) { this.sourceType = sourceType; return this; }
        public Builder vendorName(String vendorName) { this.vendorName = vendorName; return this; }
        public Builder volumeKl(Double volumeKl) { this.volumeKl = volumeKl; return this; }
        public Builder unitCost(Double unitCost) { this.unitCost = unitCost; return this; }
        public Builder totalCost(Double totalCost) { this.totalCost = totalCost; return this; }
        public Builder purchasedAt(LocalDate purchasedAt) { this.purchasedAt = purchasedAt; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public BulkPurchase build() {
            return new BulkPurchase(id, apartment, billingCycle, sourceType, vendorName, volumeKl, unitCost, totalCost, purchasedAt, createdAt);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Apartment getApartment() { return apartment; }
    public void setApartment(Apartment apartment) { this.apartment = apartment; }
    public BillingCycle getBillingCycle() { return billingCycle; }
    public void setBillingCycle(BillingCycle billingCycle) { this.billingCycle = billingCycle; }
    public BulkPurchaseSource getSourceType() { return sourceType; }
    public void setSourceType(BulkPurchaseSource sourceType) { this.sourceType = sourceType; }
    public String getVendorName() { return vendorName; }
    public void setVendorName(String vendorName) { this.vendorName = vendorName; }
    public Double getVolumeKl() { return volumeKl; }
    public void setVolumeKl(Double volumeKl) { this.volumeKl = volumeKl; }
    public Double getUnitCost() { return unitCost; }
    public void setUnitCost(Double unitCost) { this.unitCost = unitCost; }
    public Double getTotalCost() { return totalCost; }
    public void setTotalCost(Double totalCost) { this.totalCost = totalCost; }
    public LocalDate getPurchasedAt() { return purchasedAt; }
    public void setPurchasedAt(LocalDate purchasedAt) { this.purchasedAt = purchasedAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
