package com.example.WaterManagement.controller;

import com.example.WaterManagement.dto.CommunityDtos.*;
import com.example.WaterManagement.exception.BadRequestException;
import com.example.WaterManagement.security.CustomUserPrincipal;
import com.example.WaterManagement.service.AnnouncementService;
import com.example.WaterManagement.service.SupportTicketService;
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
@Tag(name = "Resident Support & Notices", description = "Resident concern submission and community notices")
public class ResidentSupportAndNoticesController {

    private final SupportTicketService supportTicketService;
    private final AnnouncementService announcementService;

    public ResidentSupportAndNoticesController(SupportTicketService supportTicketService,
                                               AnnouncementService announcementService) {
        this.supportTicketService = supportTicketService;
        this.announcementService = announcementService;
    }

    // ---------------- SUPPORT TICKET ENDPOINTS ----------------

    @GetMapping("/support-tickets")
    @Operation(summary = "Get Resident Support Tickets", description = "Lists tickets raised by the authenticated resident's household")
    public ResponseEntity<List<SupportTicketDto>> getResidentTickets(
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        validateHousehold(principal);
        return ResponseEntity.ok(supportTicketService.getTicketsForHousehold(principal.getHouseholdId()));
    }

    @PostMapping("/support-tickets")
    @Operation(summary = "Raise Support Ticket / Concern", description = "Submits a new concern (leak, billing dispute, meter check, etc.)")
    public ResponseEntity<SupportTicketDto> createSupportTicket(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @Valid @RequestBody CreateSupportTicketRequest request) {
        validateHousehold(principal);
        return new ResponseEntity<>(supportTicketService.createTicket(
                principal.getApartmentId(),
                principal.getHouseholdId(),
                principal.getId(),
                request
        ), HttpStatus.CREATED);
    }

    // ---------------- ANNOUNCEMENT ENDPOINTS ----------------

    @GetMapping("/announcements")
    @Operation(summary = "Get Active Community Notices", description = "Lists all active notices and announcements for the resident's community")
    public ResponseEntity<List<AnnouncementDto>> getCommunityAnnouncements(
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        if (principal == null || principal.getApartmentId() == null) {
            throw new BadRequestException("Resident is not associated with an apartment");
        }
        return ResponseEntity.ok(announcementService.getAnnouncementsForApartment(principal.getApartmentId(), true));
    }

    private void validateHousehold(CustomUserPrincipal principal) {
        if (principal == null || principal.getHouseholdId() == null) {
            throw new BadRequestException("Resident is not associated with a household");
        }
    }
}
