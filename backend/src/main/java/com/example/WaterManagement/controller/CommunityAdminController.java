package com.example.WaterManagement.controller;

import com.example.WaterManagement.dto.AlertDto;
import com.example.WaterManagement.dto.DashboardDtos;
import com.example.WaterManagement.dto.HouseholdDtos;
import com.example.WaterManagement.dto.MeterReadingDtos;
import com.example.WaterManagement.exception.BadRequestException;
import com.example.WaterManagement.security.CustomUserPrincipal;
import com.example.WaterManagement.service.AlertService;
import com.example.WaterManagement.service.HouseholdService;
import com.example.WaterManagement.service.MeterReadingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/community-admin")
@PreAuthorize("hasRole('COMMUNITY_ADMIN')")
@SecurityRequirement(name = "BearerAuth")
@Tag(name = "Community Admin", description = "Apartment community management APIs")
public class CommunityAdminController {

    private final HouseholdService householdService;
    private final MeterReadingService meterReadingService;
    private final AlertService alertService;

    public CommunityAdminController(HouseholdService householdService,
                                    MeterReadingService meterReadingService,
                                    AlertService alertService) {
        this.householdService = householdService;
        this.meterReadingService = meterReadingService;
        this.alertService = alertService;
    }

    @PostMapping("/households")
    @Operation(summary = "Create Household", description = "Creates a new household in the community admin's apartment and generates an invite code")
    public ResponseEntity<HouseholdDtos.HouseholdResponse> createHousehold(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @Valid @RequestBody HouseholdDtos.CreateHouseholdRequest request) {
        validateApartment(principal);
        return new ResponseEntity<>(householdService.createHousehold(principal.getApartmentId(), request), HttpStatus.CREATED);
    }

    @GetMapping("/households")
    @Operation(summary = "Get All Households", description = "Lists all households in the community admin's apartment with invite codes")
    public ResponseEntity<List<HouseholdDtos.HouseholdResponse>> getHouseholds(
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        validateApartment(principal);
        return ResponseEntity.ok(householdService.getHouseholdsByApartment(principal.getApartmentId()));
    }

    @PutMapping("/households/{householdId}")
    @Operation(summary = "Update Household", description = "Updates household flat, meter, and resident details")
    public ResponseEntity<HouseholdDtos.HouseholdResponse> updateHousehold(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @PathVariable Long householdId,
            @Valid @RequestBody HouseholdDtos.UpdateHouseholdRequest request) {
        validateApartment(principal);
        return ResponseEntity.ok(householdService.updateHousehold(principal.getApartmentId(), householdId, request));
    }

    @PutMapping("/households/{householdId}/status")
    @Operation(summary = "Update Household Status", description = "Updates household and attached resident account status (ACTIVE, INACTIVE, BLOCKED)")
    public ResponseEntity<HouseholdDtos.HouseholdResponse> updateHouseholdStatus(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @PathVariable Long householdId,
            @RequestBody HouseholdDtos.UpdateHouseholdStatusRequest request) {
        validateApartment(principal);
        return ResponseEntity.ok(householdService.updateHouseholdStatus(principal.getApartmentId(), householdId, request.getStatus()));
    }

    @DeleteMapping("/households/{householdId}")
    @Operation(summary = "Delete Household", description = "Deletes a household and its associated resident user and readings")
    public ResponseEntity<Void> deleteHousehold(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @PathVariable Long householdId) {
        validateApartment(principal);
        householdService.deleteHousehold(principal.getApartmentId(), householdId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/households/{householdId}/send-credentials")
    @Operation(summary = "Send Credentials Email to Resident", description = "Dispatches welcome login credentials email to the resident")
    public ResponseEntity<java.util.Map<String, Object>> sendCredentialsEmail(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @PathVariable Long householdId,
            @RequestParam(required = false) String recipientEmail) {
        validateApartment(principal);
        boolean sent = householdService.sendCredentialsEmail(principal.getApartmentId(), householdId, recipientEmail);
        return ResponseEntity.ok(java.util.Map.of("success", sent, "message", sent ? "Credentials email dispatched successfully." : "Email delivery queued/simulated."));
    }

    @PostMapping("/meter-readings")
    @Operation(summary = "Log Meter Reading", description = "Logs a single manual meter reading for a household in the community admin's apartment")
    public ResponseEntity<MeterReadingDtos.MeterReadingResponse> logMeterReading(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @Valid @RequestBody MeterReadingDtos.AdminMeterReadingRequest request) {
        validateApartment(principal);
        return new ResponseEntity<>(meterReadingService.logAdminReading(principal.getApartmentId(), request), HttpStatus.CREATED);
    }

    @PostMapping(value = "/meter-readings/bulk-upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Bulk Upload Meter Readings", description = "Processes a CSV file of meter readings row-by-row with error collection")
    public ResponseEntity<MeterReadingDtos.BulkUploadResponse> bulkUploadMeterReadings(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @RequestParam("file") MultipartFile file) {
        validateApartment(principal);
        return ResponseEntity.ok(meterReadingService.bulkUploadReadings(principal.getApartmentId(), file));
    }

    @GetMapping("/meter-readings")
    @Operation(summary = "Get Meter Readings", description = "Retrieves meter reading history for a specific household or the entire apartment")
    public ResponseEntity<List<MeterReadingDtos.MeterReadingResponse>> getMeterReadings(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @RequestParam(required = false) Long householdId) {
        validateApartment(principal);
        if (householdId != null) {
            return ResponseEntity.ok(meterReadingService.getHouseholdReadings(principal.getApartmentId(), householdId));
        } else {
            return ResponseEntity.ok(meterReadingService.getApartmentReadings(principal.getApartmentId()));
        }
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Get Community Admin Dashboard", description = "Retrieves overview stats, top 6 consumers chart data, and recent logs")
    public ResponseEntity<DashboardDtos.CommunityAdminDashboardResponse> getDashboard(
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        validateApartment(principal);
        return ResponseEntity.ok(meterReadingService.getCommunityAdminDashboard(principal.getApartmentId()));
    }

    @GetMapping("/alerts")
    @Operation(summary = "Get Community Alerts", description = "Retrieves active alerts across the apartment")
    public ResponseEntity<List<AlertDto>> getAlerts(
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        validateApartment(principal);
        return ResponseEntity.ok(alertService.getApartmentAlerts(principal.getApartmentId()));
    }

    private void validateApartment(CustomUserPrincipal principal) {
        if (principal == null || principal.getApartmentId() == null) {
            throw new BadRequestException("No apartment associated with the current community admin");
        }
    }
}
