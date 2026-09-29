package com.example.WaterManagement.controller;

import com.example.WaterManagement.dto.ApartmentDtos;
import com.example.WaterManagement.dto.BillingDtos;
import com.example.WaterManagement.dto.CommunityDtos.*;
import com.example.WaterManagement.dto.HouseholdDtos;
import com.example.WaterManagement.service.AnnouncementService;
import com.example.WaterManagement.service.MainAdminService;
import com.example.WaterManagement.service.SupportTicketService;
import com.example.WaterManagement.service.TariffService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/main-admin")
@PreAuthorize("hasRole('MAIN_ADMIN')")
@SecurityRequirement(name = "BearerAuth")
@Tag(name = "Main Admin", description = "Platform owner management APIs for Communities & Community Admins")
public class MainAdminController {

    private final MainAdminService mainAdminService;
    private final TariffService tariffService;
    private final SupportTicketService supportTicketService;
    private final AnnouncementService announcementService;

    public MainAdminController(MainAdminService mainAdminService,
                               TariffService tariffService,
                               SupportTicketService supportTicketService,
                               AnnouncementService announcementService) {
        this.mainAdminService = mainAdminService;
        this.tariffService = tariffService;
        this.supportTicketService = supportTicketService;
        this.announcementService = announcementService;
    }

    // ---------------- APARTMENT COMMUNITIES ----------------

    @PostMapping("/apartments")
    @Operation(summary = "Create Apartment Community", description = "Onboards an apartment community and creates its first Community Admin in one transaction")
    public ResponseEntity<ApartmentDtos.ApartmentResponse> createApartment(@Valid @RequestBody ApartmentDtos.CreateApartmentRequest request) {
        return new ResponseEntity<>(mainAdminService.createApartment(request), HttpStatus.CREATED);
    }

    @GetMapping("/apartments")
    @Operation(summary = "Get All Apartments", description = "Lists all registered apartment communities with admin details")
    public ResponseEntity<List<ApartmentDtos.ApartmentResponse>> getAllApartments() {
        return ResponseEntity.ok(mainAdminService.getAllApartments());
    }

    @DeleteMapping("/apartments/{id}")
    @Operation(summary = "Delete Apartment Community", description = "Removes an apartment community and all its cascaded records")
    public ResponseEntity<Void> deleteApartment(@PathVariable Long id) {
        mainAdminService.deleteApartment(id);
        return ResponseEntity.noContent().build();
    }

    // ---------------- COMMUNITY ADMINS DIRECTORY & MANAGEMENT ----------------

    @GetMapping("/community-admins")
    @Operation(summary = "Get All Community Admins", description = "Lists all community administrators with their managed apartments, registered households, and metrics")
    public ResponseEntity<List<ApartmentDtos.CommunityAdminDetailResponse>> getAllCommunityAdmins() {
        return ResponseEntity.ok(mainAdminService.getAllCommunityAdmins());
    }

    @GetMapping("/community-admins/{id}")
    @Operation(summary = "Get Community Admin Details", description = "Retrieves complete information for a specific community administrator including its residents")
    public ResponseEntity<ApartmentDtos.CommunityAdminDetailResponse> getCommunityAdminById(@PathVariable Long id) {
        return ResponseEntity.ok(mainAdminService.getCommunityAdminById(id));
    }

    @PutMapping("/community-admins/{id}")
    @Operation(summary = "Update Community Admin & Community", description = "Updates administrator credentials, contact information, and assigned apartment parameters")
    public ResponseEntity<ApartmentDtos.CommunityAdminDetailResponse> updateCommunityAdmin(
            @PathVariable Long id,
            @Valid @RequestBody ApartmentDtos.UpdateCommunityAdminRequest request) {
        return ResponseEntity.ok(mainAdminService.updateCommunityAdmin(id, request));
    }

    @PutMapping("/community-admins/{id}/status")
    @Operation(summary = "Update Community Admin Status", description = "Updates account status (ACTIVE, INACTIVE, BLOCKED) for a Community Administrator")
    public ResponseEntity<ApartmentDtos.CommunityAdminDetailResponse> updateCommunityAdminStatus(
            @PathVariable Long id,
            @RequestBody ApartmentDtos.UpdateCommunityAdminStatusRequest request) {
        return ResponseEntity.ok(mainAdminService.updateCommunityAdminStatus(id, request.getStatus()));
    }

    @DeleteMapping("/community-admins/{id}")
    @Operation(summary = "Delete Community Admin", description = "Deletes a community administrator and cleans up the associated community records")
    public ResponseEntity<Void> deleteCommunityAdmin(@PathVariable Long id) {
        mainAdminService.deleteCommunityAdmin(id);
        return ResponseEntity.noContent().build();
    }

    // ---------------- ALL PLATFORM RESIDENTS & HOUSEHOLDS ----------------

    @GetMapping("/households")
    @Operation(summary = "Get All Platform Households & Residents", description = "Lists all registered residents and household units across all communities")
    public ResponseEntity<List<ApartmentDtos.PlatformHouseholdResponse>> getAllPlatformHouseholds() {
        return ResponseEntity.ok(mainAdminService.getAllPlatformHouseholds());
    }

    @PutMapping("/households/{householdId}/status")
    @Operation(summary = "Update Household Status (Platform Admin)", description = "Updates household and resident account status (ACTIVE, INACTIVE, BLOCKED) across any community")
    public ResponseEntity<HouseholdDtos.HouseholdResponse> updateHouseholdStatus(
            @PathVariable Long householdId,
            @RequestBody HouseholdDtos.UpdateHouseholdStatusRequest request) {
        return ResponseEntity.ok(mainAdminService.updateHouseholdStatus(householdId, request.getStatus()));
    }

    @PutMapping("/households/{householdId}")
    @Operation(summary = "Update Household Information (Platform Admin)", description = "Updates flat number, meter number, resident details, area, occupancy across any community")
    public ResponseEntity<HouseholdDtos.HouseholdResponse> updateHousehold(
            @PathVariable Long householdId,
            @Valid @RequestBody HouseholdDtos.UpdateHouseholdRequest request) {
        return ResponseEntity.ok(mainAdminService.updateHousehold(householdId, request));
    }

    // ---------------- PLATFORM STATISTICS & ANALYTICS ----------------

    @GetMapping("/stats")
    @Operation(summary = "Get Main Admin Statistics", description = "Platform-wide summary KPIs")
    public ResponseEntity<ApartmentDtos.MainAdminStatsResponse> getStats() {
        return ResponseEntity.ok(mainAdminService.getStats());
    }

    @GetMapping("/reports/analytics")
    @Operation(summary = "Get Global Platform Analytics", description = "Platform-wide monthly consumption trends, society financial comparisons, and top water consumer flats")
    public ResponseEntity<ApartmentDtos.PlatformAnalyticsResponse> getPlatformAnalytics() {
        return ResponseEntity.ok(mainAdminService.getPlatformAnalytics());
    }

    // ---------------- PLATFORM-WIDE TARIFF MANAGEMENT ----------------

    @GetMapping("/tariffs")
    @Operation(summary = "Get Global Tariffs Overview", description = "Retrieves all society tiered tariff plans with benchmark pricing metrics and apportionment methods")
    public ResponseEntity<BillingDtos.PlatformTariffOverviewResponse> getPlatformTariffOverview() {
        return ResponseEntity.ok(tariffService.getPlatformTariffOverview());
    }

    @GetMapping("/tariffs/{apartmentId}")
    @Operation(summary = "Get Society Tariff Plan", description = "Retrieves active tiered tariff plan for a specific apartment society")
    public ResponseEntity<BillingDtos.TariffPlanDto> getSocietyTariffPlan(@PathVariable Long apartmentId) {
        return ResponseEntity.ok(tariffService.getTariffPlanDto(apartmentId));
    }

    @PutMapping("/tariffs/{apartmentId}")
    @Operation(summary = "Update Society Tariff Plan (Platform Admin)", description = "Updates tiered pricing slabs, base fee, or apportionment formula for any society")
    public ResponseEntity<BillingDtos.TariffPlanDto> updateSocietyTariffPlan(
            @PathVariable Long apartmentId,
            @Valid @RequestBody BillingDtos.UpdateTariffRequest request) {
        return ResponseEntity.ok(tariffService.updateTariffPlan(apartmentId, request));
    }

    // ---------------- MAIN ADMIN GLOBAL SUPPORT DESK & ESCALATIONS ----------------

    @GetMapping("/support-tickets")
    @Operation(summary = "Get All Platform Support Tickets", description = "Retrieves all tickets across societies with filter for escalated issues and community concerns")
    public ResponseEntity<List<SupportTicketDto>> getAllSupportTickets(
            @RequestParam(defaultValue = "all") String filter) {
        return ResponseEntity.ok(supportTicketService.getAllPlatformTickets(filter));
    }

    @PutMapping("/support-tickets/{id}/resolve")
    @Operation(summary = "Resolve Ticket by Main Admin", description = "Submits official Main Admin resolution notes and updates ticket status")
    public ResponseEntity<SupportTicketDto> resolveTicket(
            @PathVariable Long id,
            @Valid @RequestBody ResolveTicketByMainAdminRequest request) {
        return ResponseEntity.ok(supportTicketService.resolveTicketByMainAdmin(id, request));
    }

    // ---------------- MAIN ADMIN PLATFORM ANNOUNCEMENTS ----------------

    @GetMapping("/announcements")
    @Operation(summary = "Get Main Admin Platform Broadcasts", description = "Lists all global broadcasts and advisories")
    public ResponseEntity<List<AnnouncementDto>> getPlatformAnnouncements() {
        return ResponseEntity.ok(announcementService.getAllMainAdminBroadcasts());
    }

    @PostMapping("/announcements")
    @Operation(summary = "Create Platform Announcement", description = "Broadcasts an announcement to all societies or a selected society")
    public ResponseEntity<AnnouncementDto> createPlatformAnnouncement(
            @Valid @RequestBody CreateMainAdminAnnouncementRequest request) {
        return new ResponseEntity<>(announcementService.createMainAdminAnnouncement(request), HttpStatus.CREATED);
    }

    @DeleteMapping("/announcements/{id}")
    @Operation(summary = "Delete Platform Announcement", description = "Removes a platform broadcast")
    public ResponseEntity<Void> deletePlatformAnnouncement(@PathVariable Long id) {
        announcementService.deleteAnnouncement(id);
        return ResponseEntity.noContent().build();
    }

    // ---------------- MANDATORY 3-DOCUMENT VERIFICATION & AI AUTHENTICITY AUDIT ----------------

    @GetMapping("/verifications")
    @Operation(summary = "Get Pending Verifications", description = "Lists all community admins and residents awaiting 3-document approval or in rejected state")
    public ResponseEntity<List<ApartmentDtos.PendingVerificationResponse>> getPendingVerifications() {
        return ResponseEntity.ok(mainAdminService.getPendingVerifications());
    }

    @PostMapping("/verifications/review")
    @Operation(summary = "Review Verification (Unified)", description = "Approves or rejects a Community Admin or Resident application with optional notes")
    public ResponseEntity<ApartmentDtos.PendingVerificationResponse> reviewVerification(
            @RequestBody ApartmentDtos.ReviewVerificationRequest request,
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.example.WaterManagement.security.CustomUserPrincipal principal) {
        Long reviewerId = principal != null ? principal.getId() : 1L;
        return ResponseEntity.ok(mainAdminService.reviewVerification(request, reviewerId));
    }

    @PostMapping("/verifications/ai-scan")
    @Operation(summary = "Run AI Authenticity Scan", description = "Triggers on-demand AI Document Authenticity and Fraud Risk Analysis")
    public ResponseEntity<ApartmentDtos.PendingVerificationResponse> triggerAiScan(
            @RequestBody ApartmentDtos.ReviewVerificationRequest request) {
        String type = request.getVerificationType() != null ? request.getVerificationType() : "COMMUNITY_ADMIN";
        Long targetId = request.getTargetId();
        return ResponseEntity.ok(mainAdminService.triggerAiDocumentScan(type, targetId, request));
    }

    @PostMapping("/verifications/{apartmentId}/approve")
    @Operation(summary = "Approve Society Verification", description = "Approves society registration, sets status to ACTIVE, and dispatches activation email")
    public ResponseEntity<ApartmentDtos.PendingVerificationResponse> approveVerification(
            @PathVariable Long apartmentId,
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.example.WaterManagement.security.CustomUserPrincipal principal) {
        Long reviewerId = principal != null ? principal.getId() : 1L;
        return ResponseEntity.ok(mainAdminService.approveVerification("COMMUNITY_ADMIN", apartmentId, reviewerId));
    }

    @PostMapping("/verifications/{apartmentId}/reject")
    @Operation(summary = "Reject Society Verification", description = "Rejects society registration with feedback notes and dispatches re-submission email")
    public ResponseEntity<ApartmentDtos.PendingVerificationResponse> rejectVerification(
            @PathVariable Long apartmentId,
            @RequestBody ApartmentDtos.ReviewVerificationRequest request,
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.example.WaterManagement.security.CustomUserPrincipal principal) {
        Long reviewerId = principal != null ? principal.getId() : 1L;
        return ResponseEntity.ok(mainAdminService.rejectVerification("COMMUNITY_ADMIN", apartmentId, reviewerId, request.getNotes()));
    }
}
