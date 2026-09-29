package com.example.WaterManagement.dto;

import com.example.WaterManagement.entity.ApportionmentMethod;
import com.example.WaterManagement.entity.BulkPurchaseSource;
import com.example.WaterManagement.entity.InvoiceStatus;
import jakarta.validation.constraints.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class BillingDtos {

    // ---------------- TARIFF DTOS ----------------

    public static class TariffPlanDto {
        private Long id;
        private Long apartmentId;
        private Double baseMaintenanceFee;
        private Double baseRatePerKl;
        private Double baseTierLimitKl;
        private Double midRatePerKl;
        private Double midTierLimitKl;
        private Double higherRatePerKl;
        private ApportionmentMethod apportionmentMethod;
        private LocalDate effectiveFrom;

        public TariffPlanDto() {}

        public TariffPlanDto(Long id, Long apartmentId, Double baseMaintenanceFee, Double baseRatePerKl, Double baseTierLimitKl, Double midRatePerKl, Double midTierLimitKl, Double higherRatePerKl, ApportionmentMethod apportionmentMethod, LocalDate effectiveFrom) {
            this.id = id;
            this.apartmentId = apartmentId;
            this.baseMaintenanceFee = baseMaintenanceFee;
            this.baseRatePerKl = baseRatePerKl;
            this.baseTierLimitKl = baseTierLimitKl;
            this.midRatePerKl = midRatePerKl;
            this.midTierLimitKl = midTierLimitKl;
            this.higherRatePerKl = higherRatePerKl;
            this.apportionmentMethod = apportionmentMethod;
            this.effectiveFrom = effectiveFrom;
        }

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private Long id;
            private Long apartmentId;
            private Double baseMaintenanceFee;
            private Double baseRatePerKl;
            private Double baseTierLimitKl;
            private Double midRatePerKl;
            private Double midTierLimitKl;
            private Double higherRatePerKl;
            private ApportionmentMethod apportionmentMethod;
            private LocalDate effectiveFrom;

            public Builder id(Long id) { this.id = id; return this; }
            public Builder apartmentId(Long apartmentId) { this.apartmentId = apartmentId; return this; }
            public Builder baseMaintenanceFee(Double fee) { this.baseMaintenanceFee = fee; return this; }
            public Builder baseRatePerKl(Double rate) { this.baseRatePerKl = rate; return this; }
            public Builder baseTierLimitKl(Double limit) { this.baseTierLimitKl = limit; return this; }
            public Builder midRatePerKl(Double rate) { this.midRatePerKl = rate; return this; }
            public Builder midTierLimitKl(Double limit) { this.midTierLimitKl = limit; return this; }
            public Builder higherRatePerKl(Double rate) { this.higherRatePerKl = rate; return this; }
            public Builder apportionmentMethod(ApportionmentMethod method) { this.apportionmentMethod = method; return this; }
            public Builder effectiveFrom(LocalDate effectiveFrom) { this.effectiveFrom = effectiveFrom; return this; }

            public TariffPlanDto build() {
                return new TariffPlanDto(id, apartmentId, baseMaintenanceFee, baseRatePerKl, baseTierLimitKl, midRatePerKl, midTierLimitKl, higherRatePerKl, apportionmentMethod, effectiveFrom);
            }
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getApartmentId() { return apartmentId; }
        public void setApartmentId(Long apartmentId) { this.apartmentId = apartmentId; }
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
    }

    public static class UpdateTariffRequest {
        @NotNull(message = "Base maintenance fee is required")
        @Min(value = 0, message = "Base maintenance fee cannot be negative")
        private Double baseMaintenanceFee;

        @NotNull(message = "Slab 1 rate is required")
        @Min(value = 0, message = "Rate cannot be negative")
        private Double baseRatePerKl;

        @NotNull(message = "Slab 1 limit is required")
        @Min(value = 1, message = "Limit must be at least 1 kL")
        private Double baseTierLimitKl;

        @NotNull(message = "Slab 2 rate is required")
        @Min(value = 0, message = "Rate cannot be negative")
        private Double midRatePerKl;

        @NotNull(message = "Slab 2 limit is required")
        @Min(value = 1, message = "Limit must be at least 1 kL")
        private Double midTierLimitKl;

        @NotNull(message = "Slab 3 rate is required")
        @Min(value = 0, message = "Rate cannot be negative")
        private Double higherRatePerKl;

        @NotNull(message = "Apportionment method is required")
        private ApportionmentMethod apportionmentMethod;

        public UpdateTariffRequest() {}

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
    }

    // ---------------- BULK TANKER DTOS ----------------

    public static class BulkPurchaseDto {
        private Long id;
        private Long apartmentId;
        private BulkPurchaseSource sourceType;
        private String vendorName;
        private Double volumeKl;
        private Double unitCost;
        private Double totalCost;
        private LocalDate purchasedAt;
        private LocalDateTime createdAt;

        public BulkPurchaseDto() {}

        public BulkPurchaseDto(Long id, Long apartmentId, BulkPurchaseSource sourceType, String vendorName, Double volumeKl, Double unitCost, Double totalCost, LocalDate purchasedAt, LocalDateTime createdAt) {
            this.id = id;
            this.apartmentId = apartmentId;
            this.sourceType = sourceType;
            this.vendorName = vendorName;
            this.volumeKl = volumeKl;
            this.unitCost = unitCost;
            this.totalCost = totalCost;
            this.purchasedAt = purchasedAt;
            this.createdAt = createdAt;
        }

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private Long id;
            private Long apartmentId;
            private BulkPurchaseSource sourceType;
            private String vendorName;
            private Double volumeKl;
            private Double unitCost;
            private Double totalCost;
            private LocalDate purchasedAt;
            private LocalDateTime createdAt;

            public Builder id(Long id) { this.id = id; return this; }
            public Builder apartmentId(Long apartmentId) { this.apartmentId = apartmentId; return this; }
            public Builder sourceType(BulkPurchaseSource sourceType) { this.sourceType = sourceType; return this; }
            public Builder vendorName(String vendorName) { this.vendorName = vendorName; return this; }
            public Builder volumeKl(Double volumeKl) { this.volumeKl = volumeKl; return this; }
            public Builder unitCost(Double unitCost) { this.unitCost = unitCost; return this; }
            public Builder totalCost(Double totalCost) { this.totalCost = totalCost; return this; }
            public Builder purchasedAt(LocalDate purchasedAt) { this.purchasedAt = purchasedAt; return this; }
            public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

            public BulkPurchaseDto build() {
                return new BulkPurchaseDto(id, apartmentId, sourceType, vendorName, volumeKl, unitCost, totalCost, purchasedAt, createdAt);
            }
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getApartmentId() { return apartmentId; }
        public void setApartmentId(Long apartmentId) { this.apartmentId = apartmentId; }
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

    public static class CreateBulkPurchaseRequest {
        private BulkPurchaseSource sourceType;

        @NotBlank(message = "Vendor name is required")
        private String vendorName;

        @NotNull(message = "Volume in kL is required")
        @Min(value = 1, message = "Volume must be greater than 0")
        private Double volumeKl;

        @NotNull(message = "Unit cost is required")
        @Min(value = 0, message = "Unit cost cannot be negative")
        private Double unitCost;

        @NotNull(message = "Purchase date is required")
        private LocalDate purchasedAt;

        public CreateBulkPurchaseRequest() {}

        public BulkPurchaseSource getSourceType() { return sourceType; }
        public void setSourceType(BulkPurchaseSource sourceType) { this.sourceType = sourceType; }
        public String getVendorName() { return vendorName; }
        public void setVendorName(String vendorName) { this.vendorName = vendorName; }
        public Double getVolumeKl() { return volumeKl; }
        public void setVolumeKl(Double volumeKl) { this.volumeKl = volumeKl; }
        public Double getUnitCost() { return unitCost; }
        public void setUnitCost(Double unitCost) { this.unitCost = unitCost; }
        public LocalDate getPurchasedAt() { return purchasedAt; }
        public void setPurchasedAt(LocalDate purchasedAt) { this.purchasedAt = purchasedAt; }
    }

    // ---------------- INVOICE DTOS ----------------

    public static class SlabBreakdownItem {
        private String slabName;
        private Double volumeBilledKl;
        private Double ratePerKl;
        private Double amount;

        public SlabBreakdownItem() {}

        public SlabBreakdownItem(String slabName, Double volumeBilledKl, Double ratePerKl, Double amount) {
            this.slabName = slabName;
            this.volumeBilledKl = volumeBilledKl;
            this.ratePerKl = ratePerKl;
            this.amount = amount;
        }

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private String slabName;
            private Double volumeBilledKl;
            private Double ratePerKl;
            private Double amount;

            public Builder slabName(String name) { this.slabName = name; return this; }
            public Builder volumeBilledKl(Double vol) { this.volumeBilledKl = vol; return this; }
            public Builder ratePerKl(Double rate) { this.ratePerKl = rate; return this; }
            public Builder amount(Double amount) { this.amount = amount; return this; }

            public SlabBreakdownItem build() {
                return new SlabBreakdownItem(slabName, volumeBilledKl, ratePerKl, amount);
            }
        }

        public String getSlabName() { return slabName; }
        public void setSlabName(String slabName) { this.slabName = slabName; }
        public Double getVolumeBilledKl() { return volumeBilledKl; }
        public void setVolumeBilledKl(Double volumeBilledKl) { this.volumeBilledKl = volumeBilledKl; }
        public Double getRatePerKl() { return ratePerKl; }
        public void setRatePerKl(Double ratePerKl) { this.ratePerKl = ratePerKl; }
        public Double getAmount() { return amount; }
        public void setAmount(Double amount) { this.amount = amount; }
    }

    public static class InvoiceResponse {
        private Long id;
        private String invoiceNumber;
        private Long householdId;
        private String flatNumber;
        private String residentName;
        private String residentEmail;
        private String residentPhone;
        private String meterSerialNumber;
        private String billingMonth;
        private Double meterReadingStartKl;
        private Double meterReadingEndKl;
        private Double consumptionKl;
        private Double baseCharge;
        private Double meteredCharge;
        private Double sharedCharge;
        private Double adjustments;
        private Double totalAmount;
        private LocalDate dueDate;
        private InvoiceStatus status;
        private String paymentMethod;
        private String razorpayOrderId;
        private String razorpayPaymentId;
        private LocalDateTime paidAt;
        private LocalDateTime generatedAt;
        private List<SlabBreakdownItem> slabBreakdown = new ArrayList<>();
        private String apportionmentDetails;

        public InvoiceResponse() {}

        public InvoiceResponse(Long id, String invoiceNumber, Long householdId, String flatNumber, String residentName, String residentEmail, String residentPhone, String meterSerialNumber, String billingMonth, Double meterReadingStartKl, Double meterReadingEndKl, Double consumptionKl, Double baseCharge, Double meteredCharge, Double sharedCharge, Double adjustments, Double totalAmount, LocalDate dueDate, InvoiceStatus status, String paymentMethod, String razorpayOrderId, String razorpayPaymentId, LocalDateTime paidAt, LocalDateTime generatedAt, List<SlabBreakdownItem> slabBreakdown, String apportionmentDetails) {
            this.id = id;
            this.invoiceNumber = invoiceNumber;
            this.householdId = householdId;
            this.flatNumber = flatNumber;
            this.residentName = residentName;
            this.residentEmail = residentEmail;
            this.residentPhone = residentPhone;
            this.meterSerialNumber = meterSerialNumber;
            this.billingMonth = billingMonth;
            this.meterReadingStartKl = meterReadingStartKl;
            this.meterReadingEndKl = meterReadingEndKl;
            this.consumptionKl = consumptionKl;
            this.baseCharge = baseCharge;
            this.meteredCharge = meteredCharge;
            this.sharedCharge = sharedCharge;
            this.adjustments = adjustments;
            this.totalAmount = totalAmount;
            this.dueDate = dueDate;
            this.status = status;
            this.paymentMethod = paymentMethod;
            this.razorpayOrderId = razorpayOrderId;
            this.razorpayPaymentId = razorpayPaymentId;
            this.paidAt = paidAt;
            this.generatedAt = generatedAt;
            this.slabBreakdown = slabBreakdown != null ? slabBreakdown : new ArrayList<>();
            this.apportionmentDetails = apportionmentDetails;
        }

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private Long id;
            private String invoiceNumber;
            private Long householdId;
            private String flatNumber;
            private String residentName;
            private String residentEmail;
            private String residentPhone;
            private String meterSerialNumber;
            private String billingMonth;
            private Double meterReadingStartKl;
            private Double meterReadingEndKl;
            private Double consumptionKl;
            private Double baseCharge;
            private Double meteredCharge;
            private Double sharedCharge;
            private Double adjustments;
            private Double totalAmount;
            private LocalDate dueDate;
            private InvoiceStatus status;
            private String paymentMethod;
            private String razorpayOrderId;
            private String razorpayPaymentId;
            private LocalDateTime paidAt;
            private LocalDateTime generatedAt;
            private List<SlabBreakdownItem> slabBreakdown = new ArrayList<>();
            private String apportionmentDetails;

            public Builder id(Long id) { this.id = id; return this; }
            public Builder invoiceNumber(String invoiceNumber) { this.invoiceNumber = invoiceNumber; return this; }
            public Builder householdId(Long householdId) { this.householdId = householdId; return this; }
            public Builder flatNumber(String flatNumber) { this.flatNumber = flatNumber; return this; }
            public Builder residentName(String residentName) { this.residentName = residentName; return this; }
            public Builder residentEmail(String residentEmail) { this.residentEmail = residentEmail; return this; }
            public Builder residentPhone(String residentPhone) { this.residentPhone = residentPhone; return this; }
            public Builder meterSerialNumber(String meterSerialNumber) { this.meterSerialNumber = meterSerialNumber; return this; }
            public Builder billingMonth(String billingMonth) { this.billingMonth = billingMonth; return this; }
            public Builder meterReadingStartKl(Double start) { this.meterReadingStartKl = start; return this; }
            public Builder meterReadingEndKl(Double end) { this.meterReadingEndKl = end; return this; }
            public Builder consumptionKl(Double consumption) { this.consumptionKl = consumption; return this; }
            public Builder baseCharge(Double baseCharge) { this.baseCharge = baseCharge; return this; }
            public Builder meteredCharge(Double meteredCharge) { this.meteredCharge = meteredCharge; return this; }
            public Builder sharedCharge(Double sharedCharge) { this.sharedCharge = sharedCharge; return this; }
            public Builder adjustments(Double adjustments) { this.adjustments = adjustments; return this; }
            public Builder totalAmount(Double totalAmount) { this.totalAmount = totalAmount; return this; }
            public Builder dueDate(LocalDate dueDate) { this.dueDate = dueDate; return this; }
            public Builder status(InvoiceStatus status) { this.status = status; return this; }
            public Builder paymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; return this; }
            public Builder razorpayOrderId(String orderId) { this.razorpayOrderId = orderId; return this; }
            public Builder razorpayPaymentId(String paymentId) { this.razorpayPaymentId = paymentId; return this; }
            public Builder paidAt(LocalDateTime paidAt) { this.paidAt = paidAt; return this; }
            public Builder generatedAt(LocalDateTime generatedAt) { this.generatedAt = generatedAt; return this; }
            public Builder slabBreakdown(List<SlabBreakdownItem> list) { this.slabBreakdown = list; return this; }
            public Builder apportionmentDetails(String details) { this.apportionmentDetails = details; return this; }

            public InvoiceResponse build() {
                return new InvoiceResponse(id, invoiceNumber, householdId, flatNumber, residentName, residentEmail, residentPhone, meterSerialNumber, billingMonth, meterReadingStartKl, meterReadingEndKl, consumptionKl, baseCharge, meteredCharge, sharedCharge, adjustments, totalAmount, dueDate, status, paymentMethod, razorpayOrderId, razorpayPaymentId, paidAt, generatedAt, slabBreakdown, apportionmentDetails);
            }
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getInvoiceNumber() { return invoiceNumber; }
        public void setInvoiceNumber(String invoiceNumber) { this.invoiceNumber = invoiceNumber; }
        public Long getHouseholdId() { return householdId; }
        public void setHouseholdId(Long householdId) { this.householdId = householdId; }
        public String getFlatNumber() { return flatNumber; }
        public void setFlatNumber(String flatNumber) { this.flatNumber = flatNumber; }
        public String getResidentName() { return residentName; }
        public void setResidentName(String residentName) { this.residentName = residentName; }
        public String getResidentEmail() { return residentEmail; }
        public void setResidentEmail(String residentEmail) { this.residentEmail = residentEmail; }
        public String getResidentPhone() { return residentPhone; }
        public void setResidentPhone(String residentPhone) { this.residentPhone = residentPhone; }
        public String getMeterSerialNumber() { return meterSerialNumber; }
        public void setMeterSerialNumber(String meterSerialNumber) { this.meterSerialNumber = meterSerialNumber; }
        public String getBillingMonth() { return billingMonth; }
        public void setBillingMonth(String billingMonth) { this.billingMonth = billingMonth; }
        public Double getMeterReadingStartKl() { return meterReadingStartKl; }
        public void setMeterReadingStartKl(Double meterReadingStartKl) { this.meterReadingStartKl = meterReadingStartKl; }
        public Double getMeterReadingEndKl() { return meterReadingEndKl; }
        public void setMeterReadingEndKl(Double meterReadingEndKl) { this.meterReadingEndKl = meterReadingEndKl; }
        public Double getConsumptionKl() { return consumptionKl; }
        public void setConsumptionKl(Double consumptionKl) { this.consumptionKl = consumptionKl; }
        public Double getBaseCharge() { return baseCharge; }
        public void setBaseCharge(Double baseCharge) { this.baseCharge = baseCharge; }
        public Double getMeteredCharge() { return meteredCharge; }
        public void setMeteredCharge(Double meteredCharge) { this.meteredCharge = meteredCharge; }
        public Double getSharedCharge() { return sharedCharge; }
        public void setSharedCharge(Double sharedCharge) { this.sharedCharge = sharedCharge; }
        public Double getAdjustments() { return adjustments; }
        public void setAdjustments(Double adjustments) { this.adjustments = adjustments; }
        public Double getTotalAmount() { return totalAmount; }
        public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }
        public LocalDate getDueDate() { return dueDate; }
        public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
        public InvoiceStatus getStatus() { return status; }
        public void setStatus(InvoiceStatus status) { this.status = status; }
        public String getPaymentMethod() { return paymentMethod; }
        public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
        public String getRazorpayOrderId() { return razorpayOrderId; }
        public void setRazorpayOrderId(String razorpayOrderId) { this.razorpayOrderId = razorpayOrderId; }
        public String getRazorpayPaymentId() { return razorpayPaymentId; }
        public void setRazorpayPaymentId(String razorpayPaymentId) { this.razorpayPaymentId = razorpayPaymentId; }
        public LocalDateTime getPaidAt() { return paidAt; }
        public void setPaidAt(LocalDateTime paidAt) { this.paidAt = paidAt; }
        public LocalDateTime getGeneratedAt() { return generatedAt; }
        public void setGeneratedAt(LocalDateTime generatedAt) { this.generatedAt = generatedAt; }
        public List<SlabBreakdownItem> getSlabBreakdown() { return slabBreakdown; }
        public void setSlabBreakdown(List<SlabBreakdownItem> slabBreakdown) { this.slabBreakdown = slabBreakdown; }
        public String getApportionmentDetails() { return apportionmentDetails; }
        public void setApportionmentDetails(String apportionmentDetails) { this.apportionmentDetails = apportionmentDetails; }
    }

    public static class GenerateBillsRequest {
        @NotBlank(message = "Billing month is required (format: YYYY-MM)")
        private String billingMonth;
        private LocalDate dueDate;
        private Double commonAreaWaterKl;

        public GenerateBillsRequest() {}

        public String getBillingMonth() { return billingMonth; }
        public void setBillingMonth(String billingMonth) { this.billingMonth = billingMonth; }
        public LocalDate getDueDate() { return dueDate; }
        public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
        public Double getCommonAreaWaterKl() { return commonAreaWaterKl; }
        public void setCommonAreaWaterKl(Double commonAreaWaterKl) { this.commonAreaWaterKl = commonAreaWaterKl; }
    }

    public static class GenerateBillsResponse {
        private String billingMonth;
        private int totalHouseholds;
        private int generatedInvoicesCount;
        private int skippedInvoicesCount;
        private Double totalBilledAmount;
        private String message;

        public GenerateBillsResponse() {}

        public GenerateBillsResponse(String billingMonth, int totalHouseholds, int generatedInvoicesCount, int skippedInvoicesCount, Double totalBilledAmount, String message) {
            this.billingMonth = billingMonth;
            this.totalHouseholds = totalHouseholds;
            this.generatedInvoicesCount = generatedInvoicesCount;
            this.skippedInvoicesCount = skippedInvoicesCount;
            this.totalBilledAmount = totalBilledAmount;
            this.message = message;
        }

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private String billingMonth;
            private int totalHouseholds;
            private int generatedInvoicesCount;
            private int skippedInvoicesCount;
            private Double totalBilledAmount;
            private String message;

            public Builder billingMonth(String month) { this.billingMonth = month; return this; }
            public Builder totalHouseholds(int count) { this.totalHouseholds = count; return this; }
            public Builder generatedInvoicesCount(int count) { this.generatedInvoicesCount = count; return this; }
            public Builder skippedInvoicesCount(int count) { this.skippedInvoicesCount = count; return this; }
            public Builder totalBilledAmount(Double amount) { this.totalBilledAmount = amount; return this; }
            public Builder message(String message) { this.message = message; return this; }

            public GenerateBillsResponse build() {
                return new GenerateBillsResponse(billingMonth, totalHouseholds, generatedInvoicesCount, skippedInvoicesCount, totalBilledAmount, message);
            }
        }

        public String getBillingMonth() { return billingMonth; }
        public void setBillingMonth(String billingMonth) { this.billingMonth = billingMonth; }
        public int getTotalHouseholds() { return totalHouseholds; }
        public void setTotalHouseholds(int totalHouseholds) { this.totalHouseholds = totalHouseholds; }
        public int getGeneratedInvoicesCount() { return generatedInvoicesCount; }
        public void setGeneratedInvoicesCount(int generatedInvoicesCount) { this.generatedInvoicesCount = generatedInvoicesCount; }
        public int getSkippedInvoicesCount() { return skippedInvoicesCount; }
        public void setSkippedInvoicesCount(int skippedInvoicesCount) { this.skippedInvoicesCount = skippedInvoicesCount; }
        public Double getTotalBilledAmount() { return totalBilledAmount; }
        public void setTotalBilledAmount(Double totalBilledAmount) { this.totalBilledAmount = totalBilledAmount; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }

    public static class BillingStatsResponse {
        private String billingMonth;
        private Double totalInvoicedAmount;
        private Double totalCollectedAmount;
        private Double totalPendingAmount;
        private Double totalOverdueAmount;
        private int totalInvoicesCount;
        private int paidInvoicesCount;
        private int pendingInvoicesCount;
        private int overdueInvoicesCount;
        private Double collectionRatePercentage;

        public BillingStatsResponse() {}

        public BillingStatsResponse(String billingMonth, Double totalInvoicedAmount, Double totalCollectedAmount, Double totalPendingAmount, Double totalOverdueAmount, int totalInvoicesCount, int paidInvoicesCount, int pendingInvoicesCount, int overdueInvoicesCount, Double collectionRatePercentage) {
            this.billingMonth = billingMonth;
            this.totalInvoicedAmount = totalInvoicedAmount;
            this.totalCollectedAmount = totalCollectedAmount;
            this.totalPendingAmount = totalPendingAmount;
            this.totalOverdueAmount = totalOverdueAmount;
            this.totalInvoicesCount = totalInvoicesCount;
            this.paidInvoicesCount = paidInvoicesCount;
            this.pendingInvoicesCount = pendingInvoicesCount;
            this.overdueInvoicesCount = overdueInvoicesCount;
            this.collectionRatePercentage = collectionRatePercentage;
        }

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private String billingMonth;
            private Double totalInvoicedAmount;
            private Double totalCollectedAmount;
            private Double totalPendingAmount;
            private Double totalOverdueAmount;
            private int totalInvoicesCount;
            private int paidInvoicesCount;
            private int pendingInvoicesCount;
            private int overdueInvoicesCount;
            private Double collectionRatePercentage;

            public Builder billingMonth(String month) { this.billingMonth = month; return this; }
            public Builder totalInvoicedAmount(Double amt) { this.totalInvoicedAmount = amt; return this; }
            public Builder totalCollectedAmount(Double amt) { this.totalCollectedAmount = amt; return this; }
            public Builder totalPendingAmount(Double amt) { this.totalPendingAmount = amt; return this; }
            public Builder totalOverdueAmount(Double amt) { this.totalOverdueAmount = amt; return this; }
            public Builder totalInvoicesCount(int count) { this.totalInvoicesCount = count; return this; }
            public Builder paidInvoicesCount(int count) { this.paidInvoicesCount = count; return this; }
            public Builder pendingInvoicesCount(int count) { this.pendingInvoicesCount = count; return this; }
            public Builder overdueInvoicesCount(int count) { this.overdueInvoicesCount = count; return this; }
            public Builder collectionRatePercentage(Double rate) { this.collectionRatePercentage = rate; return this; }

            public BillingStatsResponse build() {
                return new BillingStatsResponse(billingMonth, totalInvoicedAmount, totalCollectedAmount, totalPendingAmount, totalOverdueAmount, totalInvoicesCount, paidInvoicesCount, pendingInvoicesCount, overdueInvoicesCount, collectionRatePercentage);
            }
        }

        public String getBillingMonth() { return billingMonth; }
        public void setBillingMonth(String billingMonth) { this.billingMonth = billingMonth; }
        public Double getTotalInvoicedAmount() { return totalInvoicedAmount; }
        public void setTotalInvoicedAmount(Double totalInvoicedAmount) { this.totalInvoicedAmount = totalInvoicedAmount; }
        public Double getTotalCollectedAmount() { return totalCollectedAmount; }
        public void setTotalCollectedAmount(Double totalCollectedAmount) { this.totalCollectedAmount = totalCollectedAmount; }
        public Double getTotalPendingAmount() { return totalPendingAmount; }
        public void setTotalPendingAmount(Double totalPendingAmount) { this.totalPendingAmount = totalPendingAmount; }
        public Double getTotalOverdueAmount() { return totalOverdueAmount; }
        public void setTotalOverdueAmount(Double totalOverdueAmount) { this.totalOverdueAmount = totalOverdueAmount; }
        public int getTotalInvoicesCount() { return totalInvoicesCount; }
        public void setTotalInvoicesCount(int totalInvoicesCount) { this.totalInvoicesCount = totalInvoicesCount; }
        public int getPaidInvoicesCount() { return paidInvoicesCount; }
        public void setPaidInvoicesCount(int paidInvoicesCount) { this.paidInvoicesCount = paidInvoicesCount; }
        public int getPendingInvoicesCount() { return pendingInvoicesCount; }
        public void setPendingInvoicesCount(int pendingInvoicesCount) { this.pendingInvoicesCount = pendingInvoicesCount; }
        public int getOverdueInvoicesCount() { return overdueInvoicesCount; }
        public void setOverdueInvoicesCount(int overdueInvoicesCount) { this.overdueInvoicesCount = overdueInvoicesCount; }
        public Double getCollectionRatePercentage() { return collectionRatePercentage; }
        public void setCollectionRatePercentage(Double collectionRatePercentage) { this.collectionRatePercentage = collectionRatePercentage; }
    }

    // ---------------- RAZORPAY PAYMENT DTOS ----------------

    public static class CreateRazorpayOrderResponse {
        private String keyId;
        private String orderId;
        private String invoiceNumber;
        private Long invoiceId;
        private Double amount;
        private Long amountInPaise;
        private String currency;
        private String customerName;
        private String customerEmail;
        private String customerContact;
        private String societyName;
        private String flatNumber;

        public CreateRazorpayOrderResponse() {}

        public CreateRazorpayOrderResponse(String keyId, String orderId, String invoiceNumber, Long invoiceId, Double amount, Long amountInPaise, String currency, String customerName, String customerEmail, String customerContact, String societyName, String flatNumber) {
            this.keyId = keyId;
            this.orderId = orderId;
            this.invoiceNumber = invoiceNumber;
            this.invoiceId = invoiceId;
            this.amount = amount;
            this.amountInPaise = amountInPaise;
            this.currency = currency;
            this.customerName = customerName;
            this.customerEmail = customerEmail;
            this.customerContact = customerContact;
            this.societyName = societyName;
            this.flatNumber = flatNumber;
        }

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private String keyId;
            private String orderId;
            private String invoiceNumber;
            private Long invoiceId;
            private Double amount;
            private Long amountInPaise;
            private String currency;
            private String customerName;
            private String customerEmail;
            private String customerContact;
            private String societyName;
            private String flatNumber;

            public Builder keyId(String keyId) { this.keyId = keyId; return this; }
            public Builder orderId(String orderId) { this.orderId = orderId; return this; }
            public Builder invoiceNumber(String invoiceNumber) { this.invoiceNumber = invoiceNumber; return this; }
            public Builder invoiceId(Long invoiceId) { this.invoiceId = invoiceId; return this; }
            public Builder amount(Double amount) { this.amount = amount; return this; }
            public Builder amountInPaise(Long amountInPaise) { this.amountInPaise = amountInPaise; return this; }
            public Builder currency(String currency) { this.currency = currency; return this; }
            public Builder customerName(String customerName) { this.customerName = customerName; return this; }
            public Builder customerEmail(String customerEmail) { this.customerEmail = customerEmail; return this; }
            public Builder customerContact(String customerContact) { this.customerContact = customerContact; return this; }
            public Builder societyName(String societyName) { this.societyName = societyName; return this; }
            public Builder flatNumber(String flatNumber) { this.flatNumber = flatNumber; return this; }

            public CreateRazorpayOrderResponse build() {
                return new CreateRazorpayOrderResponse(keyId, orderId, invoiceNumber, invoiceId, amount, amountInPaise, currency, customerName, customerEmail, customerContact, societyName, flatNumber);
            }
        }

        public String getKeyId() { return keyId; }
        public void setKeyId(String keyId) { this.keyId = keyId; }
        public String getOrderId() { return orderId; }
        public void setOrderId(String orderId) { this.orderId = orderId; }
        public String getInvoiceNumber() { return invoiceNumber; }
        public void setInvoiceNumber(String invoiceNumber) { this.invoiceNumber = invoiceNumber; }
        public Long getInvoiceId() { return invoiceId; }
        public void setInvoiceId(Long invoiceId) { this.invoiceId = invoiceId; }
        public Double getAmount() { return amount; }
        public void setAmount(Double amount) { this.amount = amount; }
        public Long getAmountInPaise() { return amountInPaise; }
        public void setAmountInPaise(Long amountInPaise) { this.amountInPaise = amountInPaise; }
        public String getCurrency() { return currency; }
        public void setCurrency(String currency) { this.currency = currency; }
        public String getCustomerName() { return customerName; }
        public void setCustomerName(String customerName) { this.customerName = customerName; }
        public String getCustomerEmail() { return customerEmail; }
        public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }
        public String getCustomerContact() { return customerContact; }
        public void setCustomerContact(String customerContact) { this.customerContact = customerContact; }
        public String getSocietyName() { return societyName; }
        public void setSocietyName(String societyName) { this.societyName = societyName; }
        public String getFlatNumber() { return flatNumber; }
        public void setFlatNumber(String flatNumber) { this.flatNumber = flatNumber; }
    }

    public static class VerifyPaymentRequest {
        @NotBlank(message = "Razorpay Order ID is required")
        private String razorpayOrderId;

        @NotBlank(message = "Razorpay Payment ID is required")
        private String razorpayPaymentId;

        @NotBlank(message = "Razorpay Signature is required")
        private String razorpaySignature;

        public VerifyPaymentRequest() {}

        public String getRazorpayOrderId() { return razorpayOrderId; }
        public void setRazorpayOrderId(String razorpayOrderId) { this.razorpayOrderId = razorpayOrderId; }
        public String getRazorpayPaymentId() { return razorpayPaymentId; }
        public void setRazorpayPaymentId(String razorpayPaymentId) { this.razorpayPaymentId = razorpayPaymentId; }
        public String getRazorpaySignature() { return razorpaySignature; }
        public void setRazorpaySignature(String razorpaySignature) { this.razorpaySignature = razorpaySignature; }
    }

    public static class PaymentReceiptResponse {
        private boolean success;
        private String message;
        private String invoiceNumber;
        private Double amountPaid;
        private String paymentId;
        private String orderId;
        private LocalDateTime paymentTime;
        private String receiptPdfUrl;

        public PaymentReceiptResponse() {}

        public PaymentReceiptResponse(boolean success, String message, String invoiceNumber, Double amountPaid, String paymentId, String orderId, LocalDateTime paymentTime, String receiptPdfUrl) {
            this.success = success;
            this.message = message;
            this.invoiceNumber = invoiceNumber;
            this.amountPaid = amountPaid;
            this.paymentId = paymentId;
            this.orderId = orderId;
            this.paymentTime = paymentTime;
            this.receiptPdfUrl = receiptPdfUrl;
        }

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private boolean success;
            private String message;
            private String invoiceNumber;
            private Double amountPaid;
            private String paymentId;
            private String orderId;
            private LocalDateTime paymentTime;
            private String receiptPdfUrl;

            public Builder success(boolean success) { this.success = success; return this; }
            public Builder message(String message) { this.message = message; return this; }
            public Builder invoiceNumber(String invoiceNumber) { this.invoiceNumber = invoiceNumber; return this; }
            public Builder amountPaid(Double amountPaid) { this.amountPaid = amountPaid; return this; }
            public Builder paymentId(String paymentId) { this.paymentId = paymentId; return this; }
            public Builder orderId(String orderId) { this.orderId = orderId; return this; }
            public Builder paymentTime(LocalDateTime paymentTime) { this.paymentTime = paymentTime; return this; }
            public Builder receiptPdfUrl(String receiptPdfUrl) { this.receiptPdfUrl = receiptPdfUrl; return this; }

            public PaymentReceiptResponse build() {
                return new PaymentReceiptResponse(success, message, invoiceNumber, amountPaid, paymentId, orderId, paymentTime, receiptPdfUrl);
            }
        }

        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public String getInvoiceNumber() { return invoiceNumber; }
        public void setInvoiceNumber(String invoiceNumber) { this.invoiceNumber = invoiceNumber; }
        public Double getAmountPaid() { return amountPaid; }
        public void setAmountPaid(Double amountPaid) { this.amountPaid = amountPaid; }
        public String getPaymentId() { return paymentId; }
        public void setPaymentId(String paymentId) { this.paymentId = paymentId; }
        public String getOrderId() { return orderId; }
        public void setOrderId(String orderId) { this.orderId = orderId; }
        public LocalDateTime getPaymentTime() { return paymentTime; }
        public void setPaymentTime(LocalDateTime paymentTime) { this.paymentTime = paymentTime; }
        public String getReceiptPdfUrl() { return receiptPdfUrl; }
        public void setReceiptPdfUrl(String receiptPdfUrl) { this.receiptPdfUrl = receiptPdfUrl; }
    }

    // ---------------- BULK PURCHASE SUMMARY DTO ----------------

    public static class BulkPurchaseCycleSummaryDto {
        private Long apartmentId;
        private String billingMonth;
        private Double totalVolumeKl;
        private Double totalCost;
        private Double effectiveUnitCost;
        private Integer deliveryCount;
        private Double tankerVolumeKl;
        private Double tankerCost;
        private Double municipalVolumeKl;
        private Double municipalCost;

        public BulkPurchaseCycleSummaryDto() {}

        public BulkPurchaseCycleSummaryDto(Long apartmentId, String billingMonth, Double totalVolumeKl, Double totalCost, Double effectiveUnitCost, Integer deliveryCount, Double tankerVolumeKl, Double tankerCost, Double municipalVolumeKl, Double municipalCost) {
            this.apartmentId = apartmentId;
            this.billingMonth = billingMonth;
            this.totalVolumeKl = totalVolumeKl;
            this.totalCost = totalCost;
            this.effectiveUnitCost = effectiveUnitCost;
            this.deliveryCount = deliveryCount;
            this.tankerVolumeKl = tankerVolumeKl;
            this.tankerCost = tankerCost;
            this.municipalVolumeKl = municipalVolumeKl;
            this.municipalCost = municipalCost;
        }

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private Long apartmentId;
            private String billingMonth;
            private Double totalVolumeKl = 0.0;
            private Double totalCost = 0.0;
            private Double effectiveUnitCost = 0.0;
            private Integer deliveryCount = 0;
            private Double tankerVolumeKl = 0.0;
            private Double tankerCost = 0.0;
            private Double municipalVolumeKl = 0.0;
            private Double municipalCost = 0.0;

            public Builder apartmentId(Long apartmentId) { this.apartmentId = apartmentId; return this; }
            public Builder billingMonth(String billingMonth) { this.billingMonth = billingMonth; return this; }
            public Builder totalVolumeKl(Double totalVolumeKl) { this.totalVolumeKl = totalVolumeKl; return this; }
            public Builder totalCost(Double totalCost) { this.totalCost = totalCost; return this; }
            public Builder effectiveUnitCost(Double effectiveUnitCost) { this.effectiveUnitCost = effectiveUnitCost; return this; }
            public Builder deliveryCount(Integer deliveryCount) { this.deliveryCount = deliveryCount; return this; }
            public Builder tankerVolumeKl(Double tankerVolumeKl) { this.tankerVolumeKl = tankerVolumeKl; return this; }
            public Builder tankerCost(Double tankerCost) { this.tankerCost = tankerCost; return this; }
            public Builder municipalVolumeKl(Double municipalVolumeKl) { this.municipalVolumeKl = municipalVolumeKl; return this; }
            public Builder municipalCost(Double municipalCost) { this.municipalCost = municipalCost; return this; }

            public BulkPurchaseCycleSummaryDto build() {
                return new BulkPurchaseCycleSummaryDto(apartmentId, billingMonth, totalVolumeKl, totalCost, effectiveUnitCost, deliveryCount, tankerVolumeKl, tankerCost, municipalVolumeKl, municipalCost);
            }
        }

        public Long getApartmentId() { return apartmentId; }
        public void setApartmentId(Long apartmentId) { this.apartmentId = apartmentId; }
        public String getBillingMonth() { return billingMonth; }
        public void setBillingMonth(String billingMonth) { this.billingMonth = billingMonth; }
        public Double getTotalVolumeKl() { return totalVolumeKl; }
        public void setTotalVolumeKl(Double totalVolumeKl) { this.totalVolumeKl = totalVolumeKl; }
        public Double getTotalCost() { return totalCost; }
        public void setTotalCost(Double totalCost) { this.totalCost = totalCost; }
        public Double getEffectiveUnitCost() { return effectiveUnitCost; }
        public void setEffectiveUnitCost(Double effectiveUnitCost) { this.effectiveUnitCost = effectiveUnitCost; }
        public Integer getDeliveryCount() { return deliveryCount; }
        public void setDeliveryCount(Integer deliveryCount) { this.deliveryCount = deliveryCount; }
        public Double getTankerVolumeKl() { return tankerVolumeKl; }
        public void setTankerVolumeKl(Double tankerVolumeKl) { this.tankerVolumeKl = tankerVolumeKl; }
        public Double getTankerCost() { return tankerCost; }
        public void setTankerCost(Double tankerCost) { this.tankerCost = tankerCost; }
        public Double getMunicipalVolumeKl() { return municipalVolumeKl; }
        public void setMunicipalVolumeKl(Double municipalVolumeKl) { this.municipalVolumeKl = municipalVolumeKl; }
        public Double getMunicipalCost() { return municipalCost; }
        public void setMunicipalCost(Double municipalCost) { this.municipalCost = municipalCost; }
    }

    // ---------------- BILLING CYCLE DTOS ----------------

    public static class BillingCycleDto {
        private Long id;
        private Long apartmentId;
        private LocalDate startDate;
        private LocalDate endDate;
        private String status;
        private LocalDateTime createdAt;
        private Integer totalInvoices;
        private Double totalBilledAmount;

        public BillingCycleDto() {}

        public BillingCycleDto(Long id, Long apartmentId, LocalDate startDate, LocalDate endDate, String status, LocalDateTime createdAt, Integer totalInvoices, Double totalBilledAmount) {
            this.id = id;
            this.apartmentId = apartmentId;
            this.startDate = startDate;
            this.endDate = endDate;
            this.status = status;
            this.createdAt = createdAt;
            this.totalInvoices = totalInvoices;
            this.totalBilledAmount = totalBilledAmount;
        }

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private Long id;
            private Long apartmentId;
            private LocalDate startDate;
            private LocalDate endDate;
            private String status;
            private LocalDateTime createdAt;
            private Integer totalInvoices = 0;
            private Double totalBilledAmount = 0.0;

            public Builder id(Long id) { this.id = id; return this; }
            public Builder apartmentId(Long apartmentId) { this.apartmentId = apartmentId; return this; }
            public Builder startDate(LocalDate startDate) { this.startDate = startDate; return this; }
            public Builder endDate(LocalDate endDate) { this.endDate = endDate; return this; }
            public Builder status(String status) { this.status = status; return this; }
            public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
            public Builder totalInvoices(Integer totalInvoices) { this.totalInvoices = totalInvoices; return this; }
            public Builder totalBilledAmount(Double totalBilledAmount) { this.totalBilledAmount = totalBilledAmount; return this; }

            public BillingCycleDto build() {
                return new BillingCycleDto(id, apartmentId, startDate, endDate, status, createdAt, totalInvoices, totalBilledAmount);
            }
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getApartmentId() { return apartmentId; }
        public void setApartmentId(Long apartmentId) { this.apartmentId = apartmentId; }
        public LocalDate getStartDate() { return startDate; }
        public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
        public LocalDate getEndDate() { return endDate; }
        public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
        public Integer getTotalInvoices() { return totalInvoices; }
        public void setTotalInvoices(Integer totalInvoices) { this.totalInvoices = totalInvoices; }
        public Double getTotalBilledAmount() { return totalBilledAmount; }
        public void setTotalBilledAmount(Double totalBilledAmount) { this.totalBilledAmount = totalBilledAmount; }
    }

    public static class OpenBillingCycleRequest {
        @NotNull(message = "Cycle start date is required")
        private LocalDate startDate;

        @NotNull(message = "Cycle end date is required")
        private LocalDate endDate;

        public OpenBillingCycleRequest() {}

        public OpenBillingCycleRequest(LocalDate startDate, LocalDate endDate) {
            this.startDate = startDate;
            this.endDate = endDate;
        }

        public LocalDate getStartDate() { return startDate; }
        public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
        public LocalDate getEndDate() { return endDate; }
        public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    }

    public static class FinalizeBillingCycleRequest {
        private LocalDate dueDate;
        private Double commonAreaWaterKl = 0.0;

        public FinalizeBillingCycleRequest() {}

        public FinalizeBillingCycleRequest(LocalDate dueDate, Double commonAreaWaterKl) {
            this.dueDate = dueDate;
            this.commonAreaWaterKl = commonAreaWaterKl;
        }

        public LocalDate getDueDate() { return dueDate; }
        public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
        public Double getCommonAreaWaterKl() { return commonAreaWaterKl; }
        public void setCommonAreaWaterKl(Double commonAreaWaterKl) { this.commonAreaWaterKl = commonAreaWaterKl; }
    }

    public static class HouseholdAdjustmentRequest {
        @NotNull(message = "Adjustment amount is required (positive or negative)")
        private Double adjustmentAmount;

        @NotBlank(message = "Adjustment reason is required")
        private String reason;

        public HouseholdAdjustmentRequest() {}

        public HouseholdAdjustmentRequest(Double adjustmentAmount, String reason) {
            this.adjustmentAmount = adjustmentAmount;
            this.reason = reason;
        }

        public Double getAdjustmentAmount() { return adjustmentAmount; }
        public void setAdjustmentAmount(Double adjustmentAmount) { this.adjustmentAmount = adjustmentAmount; }
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }

    // ---------------- STATISTICAL LEAK & ANOMALY DTOS ----------------

    public static class LeakAnomalyItemDto {
        private Long householdId;
        private String flatNumber;
        private String residentName;
        private String residentEmail;
        private String meterSerialNumber;
        private Double latestConsumptionKl;
        private Double meanConsumptionKl;
        private Double stdDevKl;
        @com.fasterxml.jackson.annotation.JsonProperty("zScore")
        private Double zScore;
        private String riskLevel;
        private String status;
        private LocalDate readingDate;

        public LeakAnomalyItemDto() {}

        public LeakAnomalyItemDto(Long householdId, String flatNumber, String residentName, String residentEmail, String meterSerialNumber, Double latestConsumptionKl, Double meanConsumptionKl, Double stdDevKl, Double zScore, String riskLevel, String status, LocalDate readingDate) {
            this.householdId = householdId;
            this.flatNumber = flatNumber;
            this.residentName = residentName;
            this.residentEmail = residentEmail;
            this.meterSerialNumber = meterSerialNumber;
            this.latestConsumptionKl = latestConsumptionKl;
            this.meanConsumptionKl = meanConsumptionKl;
            this.stdDevKl = stdDevKl;
            this.zScore = zScore;
            this.riskLevel = riskLevel;
            this.status = status;
            this.readingDate = readingDate;
        }

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private Long householdId;
            private String flatNumber;
            private String residentName;
            private String residentEmail;
            private String meterSerialNumber;
            private Double latestConsumptionKl = 0.0;
            private Double meanConsumptionKl = 0.0;
            private Double stdDevKl = 0.0;
            private Double zScore = 0.0;
            private String riskLevel = "MEDIUM";
            private String status = "POTENTIAL_LEAK";
            private LocalDate readingDate;

            public Builder householdId(Long householdId) { this.householdId = householdId; return this; }
            public Builder flatNumber(String flatNumber) { this.flatNumber = flatNumber; return this; }
            public Builder residentName(String residentName) { this.residentName = residentName; return this; }
            public Builder residentEmail(String residentEmail) { this.residentEmail = residentEmail; return this; }
            public Builder meterSerialNumber(String meterSerialNumber) { this.meterSerialNumber = meterSerialNumber; return this; }
            public Builder latestConsumptionKl(Double latestConsumptionKl) { this.latestConsumptionKl = latestConsumptionKl; return this; }
            public Builder meanConsumptionKl(Double meanConsumptionKl) { this.meanConsumptionKl = meanConsumptionKl; return this; }
            public Builder stdDevKl(Double stdDevKl) { this.stdDevKl = stdDevKl; return this; }
            public Builder zScore(Double zScore) { this.zScore = zScore; return this; }
            public Builder riskLevel(String riskLevel) { this.riskLevel = riskLevel; return this; }
            public Builder status(String status) { this.status = status; return this; }
            public Builder readingDate(LocalDate readingDate) { this.readingDate = readingDate; return this; }

            public Builder severity(String severity) { this.riskLevel = severity; return this; }

            public LeakAnomalyItemDto build() {
                return new LeakAnomalyItemDto(householdId, flatNumber, residentName, residentEmail, meterSerialNumber, latestConsumptionKl, meanConsumptionKl, stdDevKl, zScore, riskLevel, status, readingDate);
            }
        }

        public Long getHouseholdId() { return householdId; }
        public void setHouseholdId(Long householdId) { this.householdId = householdId; }
        public String getFlatNumber() { return flatNumber; }
        public void setFlatNumber(String flatNumber) { this.flatNumber = flatNumber; }
        public String getResidentName() { return residentName; }
        public void setResidentName(String residentName) { this.residentName = residentName; }
        public String getResidentEmail() { return residentEmail; }
        public void setResidentEmail(String residentEmail) { this.residentEmail = residentEmail; }
        public String getMeterSerialNumber() { return meterSerialNumber; }
        public void setMeterSerialNumber(String meterSerialNumber) { this.meterSerialNumber = meterSerialNumber; }
        public Double getLatestConsumptionKl() { return latestConsumptionKl; }
        public void setLatestConsumptionKl(Double latestConsumptionKl) { this.latestConsumptionKl = latestConsumptionKl; }
        public Double getMeanConsumptionKl() { return meanConsumptionKl; }
        public void setMeanConsumptionKl(Double meanConsumptionKl) { this.meanConsumptionKl = meanConsumptionKl; }
        public Double getStdDevKl() { return stdDevKl; }
        public void setStdDevKl(Double stdDevKl) { this.stdDevKl = stdDevKl; }
        public Double getZScore() { return zScore; }
        public void setZScore(Double zScore) { this.zScore = zScore; }
        public String getRiskLevel() { return riskLevel; }
        public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }
        public String getSeverity() { return riskLevel; }
        public void setSeverity(String severity) { this.riskLevel = severity; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public LocalDate getReadingDate() { return readingDate; }
        public void setReadingDate(LocalDate readingDate) { this.readingDate = readingDate; }
    }

    public static class LeakScanResultDto {
        private Long apartmentId;
        private LocalDateTime scannedAt;
        private Integer totalHouseholdsScanned;
        private Integer outliersDetected;
        private Integer highRiskLeakCount;
        private Double averageConsumptionKl;
        private List<LeakAnomalyItemDto> anomalies = new ArrayList<>();

        public LeakScanResultDto() {}

        public LeakScanResultDto(Long apartmentId, LocalDateTime scannedAt, Integer totalHouseholdsScanned, Integer outliersDetected, Integer highRiskLeakCount, Double averageConsumptionKl, List<LeakAnomalyItemDto> anomalies) {
            this.apartmentId = apartmentId;
            this.scannedAt = scannedAt;
            this.totalHouseholdsScanned = totalHouseholdsScanned;
            this.outliersDetected = outliersDetected;
            this.highRiskLeakCount = highRiskLeakCount;
            this.averageConsumptionKl = averageConsumptionKl;
            this.anomalies = anomalies != null ? anomalies : new ArrayList<>();
        }

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private Long apartmentId;
            private LocalDateTime scannedAt;
            private Integer totalHouseholdsScanned = 0;
            private Integer outliersDetected = 0;
            private Integer highRiskLeakCount = 0;
            private Double averageConsumptionKl = 0.0;
            private List<LeakAnomalyItemDto> anomalies = new ArrayList<>();

            public Builder apartmentId(Long apartmentId) { this.apartmentId = apartmentId; return this; }
            public Builder scannedAt(LocalDateTime scannedAt) { this.scannedAt = scannedAt; return this; }
            public Builder totalHouseholdsScanned(Integer count) { this.totalHouseholdsScanned = count; return this; }
            public Builder outliersDetected(Integer count) { this.outliersDetected = count; return this; }
            public Builder highRiskLeakCount(Integer count) { this.highRiskLeakCount = count; return this; }
            public Builder averageConsumptionKl(Double avg) { this.averageConsumptionKl = avg; return this; }
            public Builder anomalies(List<LeakAnomalyItemDto> list) { this.anomalies = list; return this; }

            public LeakScanResultDto build() {
                return new LeakScanResultDto(apartmentId, scannedAt, totalHouseholdsScanned, outliersDetected, highRiskLeakCount, averageConsumptionKl, anomalies);
            }
        }

        public Long getApartmentId() { return apartmentId; }
        public void setApartmentId(Long apartmentId) { this.apartmentId = apartmentId; }
        public LocalDateTime getScannedAt() { return scannedAt; }
        public void setScannedAt(LocalDateTime scannedAt) { this.scannedAt = scannedAt; }
        public Integer getTotalHouseholdsScanned() { return totalHouseholdsScanned; }
        public void setTotalHouseholdsScanned(Integer totalHouseholdsScanned) { this.totalHouseholdsScanned = totalHouseholdsScanned; }
        public Integer getOutliersDetected() { return outliersDetected; }
        public void setOutliersDetected(Integer outliersDetected) { this.outliersDetected = outliersDetected; }
        public Integer getHighRiskLeakCount() { return highRiskLeakCount; }
        public void setHighRiskLeakCount(Integer highRiskLeakCount) { this.highRiskLeakCount = highRiskLeakCount; }
        public Double getAverageConsumptionKl() { return averageConsumptionKl; }
        public void setAverageConsumptionKl(Double averageConsumptionKl) { this.averageConsumptionKl = averageConsumptionKl; }
        public List<LeakAnomalyItemDto> getAnomalies() { return anomalies; }
        public void setAnomalies(List<LeakAnomalyItemDto> anomalies) { this.anomalies = anomalies; }
    }

    public static class SendTestAlertRequest {
        @NotBlank(message = "Recipient email is required")
        @Email(message = "Invalid email format")
        private String recipientEmail = "jainakshay0804@gmail.com";

        private String alertType = "ANOMALY"; // "ANOMALY" or "OVERUSE"
        private String flatNumber = "B-201";
        private Double consumptionKl = 4.85;
        private Double meanConsumptionKl = 0.80;
        private Double zScore = 22.5;

        public SendTestAlertRequest() {}

        public String getRecipientEmail() { return recipientEmail; }
        public void setRecipientEmail(String recipientEmail) { this.recipientEmail = recipientEmail; }
        public String getAlertType() { return alertType; }
        public void setAlertType(String alertType) { this.alertType = alertType; }
        public String getFlatNumber() { return flatNumber; }
        public void setFlatNumber(String flatNumber) { this.flatNumber = flatNumber; }
        public Double getConsumptionKl() { return consumptionKl; }
        public void setConsumptionKl(Double consumptionKl) { this.consumptionKl = consumptionKl; }
        public Double getMeanConsumptionKl() { return meanConsumptionKl; }
        public void setMeanConsumptionKl(Double meanConsumptionKl) { this.meanConsumptionKl = meanConsumptionKl; }
        public Double getZScore() { return zScore; }
        public void setZScore(Double zScore) { this.zScore = zScore; }
    }

    public static class NotifyResidentAlertRequest {
        @NotNull(message = "Household ID is required")
        private Long householdId;

        private String overrideEmail;
        private String customMessage;
        private boolean force = true;
        private Double consumptionKl;
        private Double meanConsumptionKl;
        private Double zScore;
        private LocalDate readingDate;

        public NotifyResidentAlertRequest() {}

        public NotifyResidentAlertRequest(Long householdId, String overrideEmail, String customMessage, boolean force) {
            this.householdId = householdId;
            this.overrideEmail = overrideEmail;
            this.customMessage = customMessage;
            this.force = force;
        }

        public Long getHouseholdId() { return householdId; }
        public void setHouseholdId(Long householdId) { this.householdId = householdId; }
        public String getOverrideEmail() { return overrideEmail; }
        public void setOverrideEmail(String overrideEmail) { this.overrideEmail = overrideEmail; }
        public String getCustomMessage() { return customMessage; }
        public void setCustomMessage(String customMessage) { this.customMessage = customMessage; }
        public boolean isForce() { return force; }
        public void setForce(boolean force) { this.force = force; }
        public Double getConsumptionKl() { return consumptionKl; }
        public void setConsumptionKl(Double consumptionKl) { this.consumptionKl = consumptionKl; }
        public Double getMeanConsumptionKl() { return meanConsumptionKl; }
        public void setMeanConsumptionKl(Double meanConsumptionKl) { this.meanConsumptionKl = meanConsumptionKl; }
        public Double getZScore() { return zScore; }
        public void setZScore(Double zScore) { this.zScore = zScore; }
        public LocalDate getReadingDate() { return readingDate; }
        public void setReadingDate(LocalDate readingDate) { this.readingDate = readingDate; }
    }

    public static class AlertDispatchResponse {
        private boolean success;
        private String message;
        private String recipientEmail;
        private String alertType;
        private LocalDateTime dispatchedAt;

        public AlertDispatchResponse() {}

        public AlertDispatchResponse(boolean success, String message, String recipientEmail, String alertType, LocalDateTime dispatchedAt) {
            this.success = success;
            this.message = message;
            this.recipientEmail = recipientEmail;
            this.alertType = alertType;
            this.dispatchedAt = dispatchedAt;
        }

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private boolean success;
            private String message;
            private String recipientEmail;
            private String alertType;
            private LocalDateTime dispatchedAt = LocalDateTime.now();

            public Builder success(boolean success) { this.success = success; return this; }
            public Builder message(String message) { this.message = message; return this; }
            public Builder recipientEmail(String recipientEmail) { this.recipientEmail = recipientEmail; return this; }
            public Builder alertType(String alertType) { this.alertType = alertType; return this; }
            public Builder dispatchedAt(LocalDateTime dispatchedAt) { this.dispatchedAt = dispatchedAt; return this; }

            public AlertDispatchResponse build() {
                return new AlertDispatchResponse(success, message, recipientEmail, alertType, dispatchedAt);
            }
        }

        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public String getRecipientEmail() { return recipientEmail; }
        public void setRecipientEmail(String recipientEmail) { this.recipientEmail = recipientEmail; }
        public String getAlertType() { return alertType; }
        public void setAlertType(String alertType) { this.alertType = alertType; }
        public LocalDateTime getDispatchedAt() { return dispatchedAt; }
        public void setDispatchedAt(LocalDateTime dispatchedAt) { this.dispatchedAt = dispatchedAt; }
    }

    public static class ApartmentTariffSummaryDto {
        private Long apartmentId;
        private String apartmentName;
        private String address;
        private Integer totalHouseholds;
        private Long registeredHouseholds;
        private Long activeMetersCount;
        private Long tariffId;
        private Double baseMaintenanceFee;
        private Double baseRatePerKl;
        private Double baseTierLimitKl;
        private Double midRatePerKl;
        private Double midTierLimitKl;
        private Double higherRatePerKl;
        private ApportionmentMethod apportionmentMethod;
        private LocalDate effectiveFrom;

        public ApartmentTariffSummaryDto() {}

        public ApartmentTariffSummaryDto(Long apartmentId, String apartmentName, String address, Integer totalHouseholds, Long registeredHouseholds, Long activeMetersCount, Long tariffId, Double baseMaintenanceFee, Double baseRatePerKl, Double baseTierLimitKl, Double midRatePerKl, Double midTierLimitKl, Double higherRatePerKl, ApportionmentMethod apportionmentMethod, LocalDate effectiveFrom) {
            this.apartmentId = apartmentId;
            this.apartmentName = apartmentName;
            this.address = address;
            this.totalHouseholds = totalHouseholds;
            this.registeredHouseholds = registeredHouseholds;
            this.activeMetersCount = activeMetersCount;
            this.tariffId = tariffId;
            this.baseMaintenanceFee = baseMaintenanceFee;
            this.baseRatePerKl = baseRatePerKl;
            this.baseTierLimitKl = baseTierLimitKl;
            this.midRatePerKl = midRatePerKl;
            this.midTierLimitKl = midTierLimitKl;
            this.higherRatePerKl = higherRatePerKl;
            this.apportionmentMethod = apportionmentMethod;
            this.effectiveFrom = effectiveFrom;
        }

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private Long apartmentId;
            private String apartmentName;
            private String address;
            private Integer totalHouseholds;
            private Long registeredHouseholds = 0L;
            private Long activeMetersCount = 0L;
            private Long tariffId;
            private Double baseMaintenanceFee = 150.0;
            private Double baseRatePerKl = 15.0;
            private Double baseTierLimitKl = 10.0;
            private Double midRatePerKl = 25.0;
            private Double midTierLimitKl = 25.0;
            private Double higherRatePerKl = 45.0;
            private ApportionmentMethod apportionmentMethod = ApportionmentMethod.BY_FLAT_AREA;
            private LocalDate effectiveFrom;

            public Builder apartmentId(Long id) { this.apartmentId = id; return this; }
            public Builder apartmentName(String name) { this.apartmentName = name; return this; }
            public Builder address(String address) { this.address = address; return this; }
            public Builder totalHouseholds(Integer count) { this.totalHouseholds = count; return this; }
            public Builder registeredHouseholds(Long count) { this.registeredHouseholds = count; return this; }
            public Builder activeMetersCount(Long count) { this.activeMetersCount = count; return this; }
            public Builder tariffId(Long id) { this.tariffId = id; return this; }
            public Builder baseMaintenanceFee(Double fee) { this.baseMaintenanceFee = fee; return this; }
            public Builder baseRatePerKl(Double rate) { this.baseRatePerKl = rate; return this; }
            public Builder baseTierLimitKl(Double limit) { this.baseTierLimitKl = limit; return this; }
            public Builder midRatePerKl(Double rate) { this.midRatePerKl = rate; return this; }
            public Builder midTierLimitKl(Double limit) { this.midTierLimitKl = limit; return this; }
            public Builder higherRatePerKl(Double rate) { this.higherRatePerKl = rate; return this; }
            public Builder apportionmentMethod(ApportionmentMethod method) { this.apportionmentMethod = method; return this; }
            public Builder effectiveFrom(LocalDate date) { this.effectiveFrom = date; return this; }

            public ApartmentTariffSummaryDto build() {
                return new ApartmentTariffSummaryDto(apartmentId, apartmentName, address, totalHouseholds, registeredHouseholds, activeMetersCount, tariffId, baseMaintenanceFee, baseRatePerKl, baseTierLimitKl, midRatePerKl, midTierLimitKl, higherRatePerKl, apportionmentMethod, effectiveFrom);
            }
        }

        public Long getApartmentId() { return apartmentId; }
        public void setApartmentId(Long apartmentId) { this.apartmentId = apartmentId; }
        public String getApartmentName() { return apartmentName; }
        public void setApartmentName(String apartmentName) { this.apartmentName = apartmentName; }
        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }
        public Integer getTotalHouseholds() { return totalHouseholds; }
        public void setTotalHouseholds(Integer totalHouseholds) { this.totalHouseholds = totalHouseholds; }
        public Long getRegisteredHouseholds() { return registeredHouseholds; }
        public void setRegisteredHouseholds(Long registeredHouseholds) { this.registeredHouseholds = registeredHouseholds; }
        public Long getActiveMetersCount() { return activeMetersCount; }
        public void setActiveMetersCount(Long activeMetersCount) { this.activeMetersCount = activeMetersCount; }
        public Long getTariffId() { return tariffId; }
        public void setTariffId(Long tariffId) { this.tariffId = tariffId; }
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
    }

    public static class PlatformTariffOverviewResponse {
        private int totalApartments;
        private double averageBaseRate;
        private double averageMidRate;
        private double averageHigherRate;
        private double averageBaseFee;
        private List<ApartmentTariffSummaryDto> tariffs = new ArrayList<>();

        public PlatformTariffOverviewResponse() {}

        public PlatformTariffOverviewResponse(int totalApartments, double averageBaseRate, double averageMidRate, double averageHigherRate, double averageBaseFee, List<ApartmentTariffSummaryDto> tariffs) {
            this.totalApartments = totalApartments;
            this.averageBaseRate = averageBaseRate;
            this.averageMidRate = averageMidRate;
            this.averageHigherRate = averageHigherRate;
            this.averageBaseFee = averageBaseFee;
            this.tariffs = tariffs != null ? tariffs : new ArrayList<>();
        }

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private int totalApartments = 0;
            private double averageBaseRate = 0.0;
            private double averageMidRate = 0.0;
            private double averageHigherRate = 0.0;
            private double averageBaseFee = 0.0;
            private List<ApartmentTariffSummaryDto> tariffs = new ArrayList<>();

            public Builder totalApartments(int val) { this.totalApartments = val; return this; }
            public Builder averageBaseRate(double val) { this.averageBaseRate = val; return this; }
            public Builder averageMidRate(double val) { this.averageMidRate = val; return this; }
            public Builder averageHigherRate(double val) { this.averageHigherRate = val; return this; }
            public Builder averageBaseFee(double val) { this.averageBaseFee = val; return this; }
            public Builder tariffs(List<ApartmentTariffSummaryDto> list) { this.tariffs = list; return this; }

            public PlatformTariffOverviewResponse build() {
                return new PlatformTariffOverviewResponse(totalApartments, averageBaseRate, averageMidRate, averageHigherRate, averageBaseFee, tariffs);
            }
        }

        public int getTotalApartments() { return totalApartments; }
        public void setTotalApartments(int totalApartments) { this.totalApartments = totalApartments; }
        public double getAverageBaseRate() { return averageBaseRate; }
        public void setAverageBaseRate(double averageBaseRate) { this.averageBaseRate = averageBaseRate; }
        public double getAverageMidRate() { return averageMidRate; }
        public void setAverageMidRate(double averageMidRate) { this.averageMidRate = averageMidRate; }
        public double getAverageHigherRate() { return averageHigherRate; }
        public void setAverageHigherRate(double averageHigherRate) { this.averageHigherRate = averageHigherRate; }
        public double getAverageBaseFee() { return averageBaseFee; }
        public void setAverageBaseFee(double averageBaseFee) { this.averageBaseFee = averageBaseFee; }
        public List<ApartmentTariffSummaryDto> getTariffs() { return tariffs; }
        public void setTariffs(List<ApartmentTariffSummaryDto> tariffs) { this.tariffs = tariffs; }
    }
}
