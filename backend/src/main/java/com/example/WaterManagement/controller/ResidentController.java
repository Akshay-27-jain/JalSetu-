package com.example.WaterManagement.controller;

import com.example.WaterManagement.dto.AlertDto;
import com.example.WaterManagement.dto.DashboardDtos;
import com.example.WaterManagement.dto.MeterReadingDtos;
import com.example.WaterManagement.exception.BadRequestException;
import com.example.WaterManagement.security.CustomUserPrincipal;
import com.example.WaterManagement.service.AlertService;
import com.example.WaterManagement.service.MeterReadingService;
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
@RequestMapping("/api/resident")
@PreAuthorize("hasRole('RESIDENT')")
@SecurityRequirement(name = "BearerAuth")
@Tag(name = "Resident", description = "Resident water monitoring and meter reading APIs")
public class ResidentController {

    private final MeterReadingService meterReadingService;
    private final AlertService alertService;

    public ResidentController(MeterReadingService meterReadingService,
                              AlertService alertService) {
        this.meterReadingService = meterReadingService;
        this.alertService = alertService;
    }

    @PostMapping("/meter-readings")
    @Operation(summary = "Log Resident Meter Reading", description = "Logs a meter reading for the authenticated resident's household")
    public ResponseEntity<MeterReadingDtos.MeterReadingResponse> logMeterReading(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @Valid @RequestBody MeterReadingDtos.ResidentMeterReadingRequest request) {
        validateHousehold(principal);
        return new ResponseEntity<>(meterReadingService.logResidentReading(principal.getHouseholdId(), request), HttpStatus.CREATED);
    }

    @GetMapping("/meter-readings")
    @Operation(summary = "Get Resident Meter Readings", description = "Retrieves meter reading history for the authenticated resident's household, most recent first")
    public ResponseEntity<List<MeterReadingDtos.MeterReadingResponse>> getMeterReadings(
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        validateHousehold(principal);
        return ResponseEntity.ok(meterReadingService.getResidentReadings(principal.getHouseholdId()));
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Get Resident Dashboard", description = "Retrieves resident consumption KPIs, trend charts, active alerts, and comparison")
    public ResponseEntity<DashboardDtos.ResidentDashboardResponse> getDashboard(
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        validateHousehold(principal);
        return ResponseEntity.ok(meterReadingService.getResidentDashboard(principal.getHouseholdId()));
    }

    @GetMapping("/alerts")
    @Operation(summary = "Get Resident Alerts", description = "Retrieves alerts and notifications for the resident's household")
    public ResponseEntity<List<AlertDto>> getAlerts(
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        validateHousehold(principal);
        return ResponseEntity.ok(alertService.getHouseholdAlerts(principal.getHouseholdId()));
    }

    @PatchMapping("/alerts/{id}/read")
    @Operation(summary = "Mark Alert Read", description = "Marks a specific alert as read")
    public ResponseEntity<Void> markAlertRead(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @PathVariable Long id) {
        validateHousehold(principal);
        alertService.markAsRead(id, principal.getHouseholdId());
        return ResponseEntity.noContent().build();
    }

    private void validateHousehold(CustomUserPrincipal principal) {
        if (principal == null || principal.getHouseholdId() == null) {
            throw new BadRequestException("No household associated with the authenticated resident");
        }
    }
}
