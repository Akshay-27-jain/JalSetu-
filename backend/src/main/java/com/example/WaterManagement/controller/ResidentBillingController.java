package com.example.WaterManagement.controller;

import com.example.WaterManagement.dto.BillingDtos;
import com.example.WaterManagement.exception.BadRequestException;
import com.example.WaterManagement.security.CustomUserPrincipal;
import com.example.WaterManagement.service.BillingService;
import com.example.WaterManagement.service.RazorpayService;
import com.example.WaterManagement.service.TariffService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resident/billing")
@PreAuthorize("hasRole('RESIDENT')")
@SecurityRequirement(name = "BearerAuth")
@Tag(name = "Resident Invoices & Razorpay", description = "Endpoints for Resident bill viewing and Razorpay payments")
public class ResidentBillingController {

    private final BillingService billingService;
    private final TariffService tariffService;
    private final RazorpayService razorpayService;
    private final com.example.WaterManagement.service.InvoicePdfService invoicePdfService;

    public ResidentBillingController(BillingService billingService,
                                     TariffService tariffService,
                                     RazorpayService razorpayService,
                                     com.example.WaterManagement.service.InvoicePdfService invoicePdfService) {
        this.billingService = billingService;
        this.tariffService = tariffService;
        this.razorpayService = razorpayService;
        this.invoicePdfService = invoicePdfService;
    }

    @GetMapping("/invoices")
    @Operation(summary = "Get Resident Invoices", description = "Retrieves all monthly invoices for the authenticated resident household")
    public ResponseEntity<List<BillingDtos.InvoiceResponse>> getResidentInvoices(
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        validateHousehold(principal);
        return ResponseEntity.ok(billingService.getResidentInvoices(principal.getHouseholdId()));
    }

    @GetMapping("/invoices/{id}")
    @Operation(summary = "Get Invoice Itemized Breakdown", description = "Retrieves itemized tiered slabs, base fee, and shared apportionment details")
    public ResponseEntity<BillingDtos.InvoiceResponse> getInvoiceById(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @PathVariable Long id) {
        validateHousehold(principal);
        return ResponseEntity.ok(billingService.getInvoiceById(id));
    }

    @GetMapping("/invoices/{id}/pdf")
    @Operation(summary = "Download Resident Invoice PDF", description = "Generates and streams itemized PDF water invoice")
    public ResponseEntity<byte[]> downloadResidentInvoicePdf(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @PathVariable Long id) {
        validateHousehold(principal);
        com.example.WaterManagement.entity.Invoice invoice = billingService.getInvoiceEntityById(id);
        if (!invoice.getHousehold().getId().equals(principal.getHouseholdId())) {
            throw new BadRequestException("Invoice does not belong to your household unit");
        }
        byte[] pdfBytes = invoicePdfService.generateInvoicePdf(invoice);
        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setContentType(org.springframework.http.MediaType.APPLICATION_PDF);
        headers.setContentDisposition(org.springframework.http.ContentDisposition.attachment()
                .filename("JalSetu_Invoice_" + invoice.getInvoiceNumber() + ".pdf")
                .build());
        return new ResponseEntity<>(pdfBytes, headers, org.springframework.http.HttpStatus.OK);
    }

    @GetMapping("/tariff-plan")
    @Operation(summary = "Get Active Society Tariff Plan", description = "Retrieves current pricing tiers so resident can understand their bill calculation")
    public ResponseEntity<BillingDtos.TariffPlanDto> getTariffPlan(
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        validateHousehold(principal);
        return ResponseEntity.ok(tariffService.getTariffPlanDto(principal.getApartmentId()));
    }

    // ---------------- RAZORPAY PAYMENT ENDPOINTS ----------------

    @PostMapping("/invoices/{id}/create-razorpay-order")
    @Operation(summary = "Create Razorpay Order", description = "Initiates Razorpay Checkout test order for this invoice")
    public ResponseEntity<BillingDtos.CreateRazorpayOrderResponse> createRazorpayOrder(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @PathVariable Long id) {
        validateHousehold(principal);
        return ResponseEntity.ok(razorpayService.createOrder(principal.getHouseholdId(), id));
    }

    @PostMapping("/invoices/{id}/verify-payment")
    @Operation(summary = "Verify Razorpay Payment", description = "Verifies payment signature and marks invoice as PAID")
    public ResponseEntity<BillingDtos.PaymentReceiptResponse> verifyPayment(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody BillingDtos.VerifyPaymentRequest request) {
        validateHousehold(principal);
        return ResponseEntity.ok(razorpayService.verifyPayment(principal.getHouseholdId(), id, request));
    }

    private void validateHousehold(CustomUserPrincipal principal) {
        if (principal == null || principal.getHouseholdId() == null) {
            throw new BadRequestException("No household assigned to this resident account");
        }
    }
}
