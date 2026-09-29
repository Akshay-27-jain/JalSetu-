package com.example.WaterManagement.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "invoices")
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "invoice_number", nullable = false, unique = true, length = 100)
    private String invoiceNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "household_id", nullable = false)
    private Household household;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cycle_id")
    private BillingCycle billingCycle;

    @Column(name = "billing_month", nullable = false, length = 20)
    private String billingMonth; // e.g. "2026-08"

    @Column(name = "meter_reading_start_kl")
    private Double meterReadingStartKl = 0.0;

    @Column(name = "meter_reading_end_kl")
    private Double meterReadingEndKl = 0.0;

    @Column(name = "consumption_kl", nullable = false)
    private Double consumptionKl = 0.0;

    @Column(name = "base_charge", nullable = false)
    private Double baseCharge = 150.0;

    @Column(name = "metered_charge", nullable = false)
    private Double meteredCharge = 0.0;

    @Column(name = "shared_charge", nullable = false)
    private Double sharedCharge = 0.0;

    @Column(name = "adjustments")
    private Double adjustments = 0.0;

    @Column(name = "total_amount", nullable = false)
    private Double totalAmount;

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private InvoiceStatus status = InvoiceStatus.PENDING;

    @Column(name = "payment_method", length = 50)
    private String paymentMethod; // e.g. "RAZORPAY", "UPI", "CASH"

    @Column(name = "razorpay_order_id", length = 100)
    private String razorpayOrderId;

    @Column(name = "razorpay_payment_id", length = 100)
    private String razorpayPaymentId;

    @Column(name = "razorpay_signature", length = 255)
    private String razorpaySignature;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @Column(name = "pdf_path", length = 500)
    private String pdfPath;

    @CreationTimestamp
    @Column(name = "generated_at", updatable = false)
    private LocalDateTime generatedAt;

    public Invoice() {}

    public Invoice(Long id, String invoiceNumber, Household household, BillingCycle billingCycle, String billingMonth, Double meterReadingStartKl, Double meterReadingEndKl, Double consumptionKl, Double baseCharge, Double meteredCharge, Double sharedCharge, Double adjustments, Double totalAmount, LocalDate dueDate, InvoiceStatus status, String paymentMethod, String razorpayOrderId, String razorpayPaymentId, String razorpaySignature, LocalDateTime paidAt, String pdfPath, LocalDateTime generatedAt) {
        this.id = id;
        this.invoiceNumber = invoiceNumber;
        this.household = household;
        this.billingCycle = billingCycle;
        this.billingMonth = billingMonth;
        this.meterReadingStartKl = meterReadingStartKl != null ? meterReadingStartKl : 0.0;
        this.meterReadingEndKl = meterReadingEndKl != null ? meterReadingEndKl : 0.0;
        this.consumptionKl = consumptionKl != null ? consumptionKl : 0.0;
        this.baseCharge = baseCharge != null ? baseCharge : 150.0;
        this.meteredCharge = meteredCharge != null ? meteredCharge : 0.0;
        this.sharedCharge = sharedCharge != null ? sharedCharge : 0.0;
        this.adjustments = adjustments != null ? adjustments : 0.0;
        this.totalAmount = totalAmount;
        this.dueDate = dueDate != null ? dueDate : LocalDate.now().plusDays(15);
        this.status = status != null ? status : InvoiceStatus.PENDING;
        this.paymentMethod = paymentMethod;
        this.razorpayOrderId = razorpayOrderId;
        this.razorpayPaymentId = razorpayPaymentId;
        this.razorpaySignature = razorpaySignature;
        this.paidAt = paidAt;
        this.pdfPath = pdfPath;
        this.generatedAt = generatedAt;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private String invoiceNumber;
        private Household household;
        private BillingCycle billingCycle;
        private String billingMonth;
        private Double meterReadingStartKl = 0.0;
        private Double meterReadingEndKl = 0.0;
        private Double consumptionKl = 0.0;
        private Double baseCharge = 150.0;
        private Double meteredCharge = 0.0;
        private Double sharedCharge = 0.0;
        private Double adjustments = 0.0;
        private Double totalAmount;
        private LocalDate dueDate;
        private InvoiceStatus status = InvoiceStatus.PENDING;
        private String paymentMethod;
        private String razorpayOrderId;
        private String razorpayPaymentId;
        private String razorpaySignature;
        private LocalDateTime paidAt;
        private String pdfPath;
        private LocalDateTime generatedAt;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder invoiceNumber(String invoiceNumber) { this.invoiceNumber = invoiceNumber; return this; }
        public Builder household(Household household) { this.household = household; return this; }
        public Builder billingCycle(BillingCycle billingCycle) { this.billingCycle = billingCycle; return this; }
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
        public Builder razorpaySignature(String signature) { this.razorpaySignature = signature; return this; }
        public Builder paidAt(LocalDateTime paidAt) { this.paidAt = paidAt; return this; }
        public Builder pdfPath(String pdfPath) { this.pdfPath = pdfPath; return this; }
        public Builder generatedAt(LocalDateTime generatedAt) { this.generatedAt = generatedAt; return this; }

        public Invoice build() {
            return new Invoice(id, invoiceNumber, household, billingCycle, billingMonth, meterReadingStartKl, meterReadingEndKl, consumptionKl, baseCharge, meteredCharge, sharedCharge, adjustments, totalAmount, dueDate, status, paymentMethod, razorpayOrderId, razorpayPaymentId, razorpaySignature, paidAt, pdfPath, generatedAt);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getInvoiceNumber() { return invoiceNumber; }
    public void setInvoiceNumber(String invoiceNumber) { this.invoiceNumber = invoiceNumber; }
    public Household getHousehold() { return household; }
    public void setHousehold(Household household) { this.household = household; }
    public BillingCycle getBillingCycle() { return billingCycle; }
    public void setBillingCycle(BillingCycle billingCycle) { this.billingCycle = billingCycle; }
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
    public String getRazorpaySignature() { return razorpaySignature; }
    public void setRazorpaySignature(String razorpaySignature) { this.razorpaySignature = razorpaySignature; }
    public LocalDateTime getPaidAt() { return paidAt; }
    public void setPaidAt(LocalDateTime paidAt) { this.paidAt = paidAt; }
    public String getPdfPath() { return pdfPath; }
    public void setPdfPath(String pdfPath) { this.pdfPath = pdfPath; }
    public LocalDateTime getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(LocalDateTime generatedAt) { this.generatedAt = generatedAt; }
}
