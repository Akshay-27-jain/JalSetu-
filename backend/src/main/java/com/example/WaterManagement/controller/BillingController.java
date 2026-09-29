package com.example.WaterManagement.controller;

import com.example.WaterManagement.dto.BillingDtos;
import com.example.WaterManagement.entity.InvoiceStatus;
import com.example.WaterManagement.exception.BadRequestException;
import com.example.WaterManagement.security.CustomUserPrincipal;
import com.example.WaterManagement.service.AlertSchedulerService;
import com.example.WaterManagement.service.BillingService;
import com.example.WaterManagement.service.BulkPurchaseService;
import com.example.WaterManagement.service.TariffService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('COMMUNITY_ADMIN')")
@SecurityRequirement(name = "BearerAuth")
@Tag(name = "Admin Billing & Tariffs", description = "Endpoints for Tiered Tariffs, Bulk Tankers, Billing Cycles, and Monthly Invoice Generation")
public class BillingController {

    private final TariffService tariffService;
    private final BulkPurchaseService bulkPurchaseService;
    private final BillingService billingService;
    private final AlertSchedulerService alertSchedulerService;
    private final com.example.WaterManagement.service.InvoicePdfService invoicePdfService;

    public BillingController(TariffService tariffService,
                             BulkPurchaseService bulkPurchaseService,
                             BillingService billingService,
                             AlertSchedulerService alertSchedulerService,
                             com.example.WaterManagement.service.InvoicePdfService invoicePdfService) {
        this.tariffService = tariffService;
        this.bulkPurchaseService = bulkPurchaseService;
        this.billingService = billingService;
        this.alertSchedulerService = alertSchedulerService;
        this.invoicePdfService = invoicePdfService;
    }

    // ---------------- TARIFF MANAGEMENT ----------------

    @GetMapping("/tariffs")
    @Operation(summary = "Get Apartment Tariff Plan", description = "Retrieves active tiered tariff slabs, base maintenance fee, and apportionment rules")
    public ResponseEntity<BillingDtos.TariffPlanDto> getTariffPlan(@AuthenticationPrincipal CustomUserPrincipal principal) {
        validateApartment(principal);
        return ResponseEntity.ok(tariffService.getTariffPlanDto(principal.getApartmentId()));
    }

    @PutMapping("/tariffs")
    @Operation(summary = "Update Apartment Tariff Plan", description = "Updates tiered pricing slabs, base fee, or apportionment formula")
    public ResponseEntity<BillingDtos.TariffPlanDto> updateTariffPlan(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @Valid @RequestBody BillingDtos.UpdateTariffRequest request) {
        validateApartment(principal);
        return ResponseEntity.ok(tariffService.updateTariffPlan(principal.getApartmentId(), request));
    }

    // ---------------- BULK TANKER PROCUREMENT ----------------

    @GetMapping("/bulk-purchases")
    @Operation(summary = "Get Bulk Water Purchases", description = "Retrieves logged tanker purchases for the community")
    public ResponseEntity<List<BillingDtos.BulkPurchaseDto>> getBulkPurchases(@AuthenticationPrincipal CustomUserPrincipal principal) {
        validateApartment(principal);
        return ResponseEntity.ok(bulkPurchaseService.getPurchases(principal.getApartmentId()));
    }

    @GetMapping("/bulk-purchases/summary")
    @Operation(summary = "Get Bulk Purchases Cycle Summary", description = "Retrieves aggregated volume, cost, and effective unit cost per cycle")
    public ResponseEntity<BillingDtos.BulkPurchaseCycleSummaryDto> getBulkPurchasesSummary(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @RequestParam(required = false) String month) {
        validateApartment(principal);
        return ResponseEntity.ok(bulkPurchaseService.getCyclePurchasesSummary(principal.getApartmentId(), month));
    }

    @PostMapping("/bulk-purchases")
    @Operation(summary = "Log Bulk Water Tanker Purchase", description = "Records a new bulk water tanker delivery")
    public ResponseEntity<BillingDtos.BulkPurchaseDto> logBulkPurchase(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @Valid @RequestBody BillingDtos.CreateBulkPurchaseRequest request) {
        validateApartment(principal);
        return new ResponseEntity<>(bulkPurchaseService.logPurchase(principal.getApartmentId(), request), HttpStatus.CREATED);
    }

    @DeleteMapping("/bulk-purchases/{id}")
    @Operation(summary = "Delete Bulk Water Purchase", description = "Removes a tanker purchase entry")
    public ResponseEntity<Void> deleteBulkPurchase(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @PathVariable Long id) {
        validateApartment(principal);
        bulkPurchaseService.deletePurchase(principal.getApartmentId(), id);
        return ResponseEntity.noContent().build();
    }

    // ---------------- BILLING CYCLES & INVOICING ----------------

    @GetMapping("/billing/cycles")
    @Operation(summary = "Get Billing Cycles", description = "Retrieves all billing cycles for the apartment community")
    public ResponseEntity<List<BillingDtos.BillingCycleDto>> getBillingCycles(@AuthenticationPrincipal CustomUserPrincipal principal) {
        validateApartment(principal);
        return ResponseEntity.ok(billingService.getBillingCycles(principal.getApartmentId()));
    }

    @PostMapping("/billing/cycles/open")
    @Operation(summary = "Open New Billing Cycle", description = "Opens a new billing cycle period for water metering and invoicing")
    public ResponseEntity<BillingDtos.BillingCycleDto> openBillingCycle(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @Valid @RequestBody BillingDtos.OpenBillingCycleRequest request) {
        validateApartment(principal);
        return new ResponseEntity<>(billingService.openBillingCycle(principal.getApartmentId(), request), HttpStatus.CREATED);
    }

    @PostMapping("/billing/cycles/{id}/finalize")
    @Operation(summary = "Finalize Billing Cycle", description = "Locks the cycle, computes metered consumption & apportionment, and generates itemized household invoices")
    public ResponseEntity<BillingDtos.BillingCycleDto> finalizeBillingCycle(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @PathVariable Long id,
            @RequestBody(required = false) BillingDtos.FinalizeBillingCycleRequest request) {
        validateApartment(principal);
        BillingDtos.FinalizeBillingCycleRequest req = request != null ? request : new BillingDtos.FinalizeBillingCycleRequest();
        return ResponseEntity.ok(billingService.finalizeBillingCycle(principal.getApartmentId(), id, req));
    }

    @PostMapping("/billing/cycles/{id}/archive")
    @Operation(summary = "Archive Billing Cycle", description = "Archives a finalized billing cycle")
    public ResponseEntity<BillingDtos.BillingCycleDto> archiveBillingCycle(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @PathVariable Long id) {
        validateApartment(principal);
        return ResponseEntity.ok(billingService.archiveBillingCycle(principal.getApartmentId(), id));
    }

    @PutMapping("/billing/invoices/{id}/adjustments")
    @Operation(summary = "Apply Household Invoice Adjustment", description = "Applies a discount, late fee, or leak rebate adjustment to an invoice")
    public ResponseEntity<BillingDtos.InvoiceResponse> applyAdjustment(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody BillingDtos.HouseholdAdjustmentRequest request) {
        validateApartment(principal);
        return ResponseEntity.ok(billingService.applyHouseholdAdjustment(principal.getApartmentId(), id, request));
    }

    @PostMapping("/billing/generate")
    @Operation(summary = "Generate Monthly Household Bills", description = "Calculates metered consumption, applies tiered tariffs and shared costs, and generates invoices for all flats")
    public ResponseEntity<BillingDtos.GenerateBillsResponse> generateMonthlyBills(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @Valid @RequestBody BillingDtos.GenerateBillsRequest request) {
        validateApartment(principal);
        return new ResponseEntity<>(billingService.generateMonthlyInvoices(principal.getApartmentId(), request), HttpStatus.CREATED);
    }

    @PostMapping("/billing/auto-dispatch")
    @Operation(summary = "Auto-Generate & Email Bills to All Residents", description = "Generates/updates invoices for the billing month and immediately dispatches PDF emails to all registered residents")
    public ResponseEntity<BillingDtos.GenerateBillsResponse> autoGenerateAndEmailBills(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @RequestParam(required = false) String month) {
        validateApartment(principal);
        return ResponseEntity.ok(billingService.autoGenerateAndEmailBills(principal.getApartmentId(), month));
    }

    @GetMapping("/billing/invoices")
    @Operation(summary = "Get Community Invoices", description = "Retrieves all household invoices with optional month and payment status filters")
    public ResponseEntity<List<BillingDtos.InvoiceResponse>> getInvoices(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @RequestParam(required = false) String month,
            @RequestParam(required = false) InvoiceStatus status) {
        validateApartment(principal);
        return ResponseEntity.ok(billingService.getApartmentInvoices(principal.getApartmentId(), month, status));
    }

    @GetMapping("/billing/invoices/{id}")
    @Operation(summary = "Get Single Invoice Details", description = "Retrieves itemized breakdown of a specific invoice")
    public ResponseEntity<BillingDtos.InvoiceResponse> getInvoiceById(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @PathVariable Long id) {
        validateApartment(principal);
        return ResponseEntity.ok(billingService.getInvoiceById(id));
    }

    @GetMapping("/billing/invoices/{id}/pdf")
    @Operation(summary = "Download Invoice PDF", description = "Generates and streams itemized PDF water invoice")
    public ResponseEntity<byte[]> downloadInvoicePdf(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @PathVariable Long id) {
        validateApartment(principal);
        com.example.WaterManagement.entity.Invoice invoice = billingService.getInvoiceEntityById(id);
        if (!invoice.getHousehold().getApartment().getId().equals(principal.getApartmentId())) {
            throw new BadRequestException("Invoice does not belong to your community");
        }
        byte[] pdfBytes = invoicePdfService.generateInvoicePdf(invoice);
        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setContentType(org.springframework.http.MediaType.APPLICATION_PDF);
        headers.setContentDisposition(org.springframework.http.ContentDisposition.attachment()
                .filename("JalSetu_Invoice_" + invoice.getInvoiceNumber() + ".pdf")
                .build());
        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }

    @PostMapping("/billing/invoices/{id}/mark-paid")
    @Operation(summary = "Mark Invoice as Paid (Manual)", description = "Records offline cash/cheque payment for an invoice")
    public ResponseEntity<BillingDtos.InvoiceResponse> markInvoicePaid(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @PathVariable Long id,
            @RequestParam(required = false, defaultValue = "OFFLINE_CASH") String paymentMethod) {
        validateApartment(principal);
        return ResponseEntity.ok(billingService.markInvoiceAsPaidManual(principal.getApartmentId(), id, paymentMethod));
    }

    @PostMapping("/billing/invoices/{id}/email")
    @Operation(summary = "Email Invoice to Resident", description = "Dispatches the monthly invoice with attached PDF to the resident")
    public ResponseEntity<java.util.Map<String, Object>> emailInvoice(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @PathVariable Long id,
            @RequestParam(required = false) String recipientEmail) {
        validateApartment(principal);
        boolean sent = billingService.emailInvoiceToResident(principal.getApartmentId(), id, recipientEmail);
        return ResponseEntity.ok(java.util.Map.of("success", sent, "message", sent ? "Invoice PDF emailed successfully." : "Email delivery queued/simulated."));
    }

    @PostMapping("/billing/invoices/{id}/send-reminder")
    @Operation(summary = "Send Due/Overdue Bill Reminder Email", description = "Dispatches an urgent due or overdue bill reminder email to the resident")
    public ResponseEntity<java.util.Map<String, Object>> sendBillReminder(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @PathVariable Long id) {
        validateApartment(principal);
        com.example.WaterManagement.entity.Invoice invoice = billingService.getInvoiceEntityById(id);
        if (!invoice.getHousehold().getApartment().getId().equals(principal.getApartmentId())) {
            throw new BadRequestException("Invoice does not belong to your community");
        }
        boolean sent = alertSchedulerService.sendManualBillReminder(id);
        return ResponseEntity.ok(java.util.Map.of(
                "success", sent,
                "message", sent ? "Payment reminder email dispatched to resident." : "Failed to dispatch reminder email."
        ));
    }

    @GetMapping("/billing/stats")
    @Operation(summary = "Get Billing KPI Analytics", description = "Financial metrics on invoiced totals, collected revenue, and collection rate")
    public ResponseEntity<BillingDtos.BillingStatsResponse> getBillingStats(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @RequestParam(required = false) String month) {
        validateApartment(principal);
        return ResponseEntity.ok(billingService.getBillingStats(principal.getApartmentId(), month));
    }

    // ---------------- ALERT ENGINE & STATISTICAL LEAK DETECTOR ----------------

    @PostMapping("/alerts/scan-leaks")
    @Operation(summary = "Trigger Statistical Leak & Overuse Audit", description = "Executes real-time 2-sigma outlier analysis and threshold scans across all flats")
    public ResponseEntity<BillingDtos.LeakScanResultDto> triggerLeakScan(@AuthenticationPrincipal CustomUserPrincipal principal) {
        validateApartment(principal);
        return ResponseEntity.ok(alertSchedulerService.scanApartmentLeaks(principal.getApartmentId()));
    }

    @GetMapping("/alerts/anomalies")
    @Operation(summary = "Get Statistical Leak Anomalies", description = "Retrieves current 2-sigma consumption outliers and high-risk leak alerts")
    public ResponseEntity<BillingDtos.LeakScanResultDto> getLeakAnomalies(@AuthenticationPrincipal CustomUserPrincipal principal) {
        validateApartment(principal);
        return ResponseEntity.ok(alertSchedulerService.scanApartmentLeaks(principal.getApartmentId()));
    }

    @PostMapping("/alerts/send-test-email")
    @Operation(summary = "Send Test Alert Email", description = "Dispatches a live HTML leak or overuse alert email to a designated address (e.g., jainakshay0804@gmail.com)")
    public ResponseEntity<BillingDtos.AlertDispatchResponse> sendTestAlertEmail(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @Valid @RequestBody BillingDtos.SendTestAlertRequest request) {
        validateApartment(principal);
        return ResponseEntity.ok(alertSchedulerService.sendTestAlertEmail(principal.getApartmentId(), request));
    }

    @PostMapping("/alerts/notify-resident")
    @Operation(summary = "Notify Household Resident via Email", description = "Triggers an on-demand leak/overuse alert email to a specific flat's resident with optional email override")
    public ResponseEntity<BillingDtos.AlertDispatchResponse> notifyResident(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @Valid @RequestBody BillingDtos.NotifyResidentAlertRequest request) {
        validateApartment(principal);
        return ResponseEntity.ok(alertSchedulerService.notifyHouseholdLeakAlert(principal.getApartmentId(), request));
    }

    private void validateApartment(CustomUserPrincipal principal) {
        if (principal == null || principal.getApartmentId() == null) {
            throw new BadRequestException("No apartment assigned to this community administrator");
        }
    }
}
