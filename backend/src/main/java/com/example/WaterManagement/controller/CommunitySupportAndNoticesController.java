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
@RequestMapping("/api/community-admin")
@PreAuthorize("hasRole('COMMUNITY_ADMIN')")
@SecurityRequirement(name = "BearerAuth")
@Tag(name = "Community Support & Notices", description = "Resident Support Desk and Community Announcements management")
public class CommunitySupportAndNoticesController {

    private final SupportTicketService supportTicketService;
    private final AnnouncementService announcementService;

    public CommunitySupportAndNoticesController(SupportTicketService supportTicketService,
                                                AnnouncementService announcementService) {
        this.supportTicketService = supportTicketService;
        this.announcementService = announcementService;
    }

    // ---------------- SUPPORT TICKET ENDPOINTS ----------------

    @GetMapping("/support-tickets")
    @Operation(summary = "Get All Support Tickets", description = "Retrieves all resident support tickets and concerns for the community")
    public ResponseEntity<List<SupportTicketDto>> getSupportTickets(
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        validateApartment(principal);
        return ResponseEntity.ok(supportTicketService.getTicketsForApartment(principal.getApartmentId()));
    }

    @PutMapping("/support-tickets/{id}/status")
    @Operation(summary = "Update Support Ticket Status", description = "Updates ticket lifecycle status and resolution notes")
    public ResponseEntity<SupportTicketDto> updateTicketStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTicketStatusRequest request) {
        return ResponseEntity.ok(supportTicketService.updateTicketStatus(id, request));
    }

    @RequestMapping(value = "/support-tickets/{id}/escalate", method = {RequestMethod.POST, RequestMethod.PUT})
    @Operation(summary = "Escalate Ticket to Main Admin", description = "Escalates an unresolved household ticket to Main Admin with an escalation reason")
    public ResponseEntity<SupportTicketDto> escalateTicket(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @Valid @RequestBody EscalateTicketRequest request) {
        String adminEmail = principal != null ? principal.getEmail() : "admin@community.com";
        return ResponseEntity.ok(supportTicketService.escalateTicketToMainAdmin(id, request, adminEmail));
    }

    @PostMapping("/support-tickets/community-concern")
    @Operation(summary = "Raise Community Concern to Main Admin", description = "Community Admin reports a society-level infrastructure problem directly to Main Admin")
    public ResponseEntity<SupportTicketDto> raiseCommunityConcern(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @Valid @RequestBody CreateCommunityConcernRequest request) {
        validateApartment(principal);
        return new ResponseEntity<>(
                supportTicketService.createCommunityAdminConcern(principal.getApartmentId(), principal.getId(), request),
                HttpStatus.CREATED
        );
    }

    // ---------------- ANNOUNCEMENT ENDPOINTS ----------------

    @GetMapping("/announcements")
    @Operation(summary = "Get Community Announcements", description = "Lists all announcements created for the community including Main Admin broadcasts")
    public ResponseEntity<List<AnnouncementDto>> getAnnouncements(
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        validateApartment(principal);
        return ResponseEntity.ok(announcementService.getAnnouncementsForApartment(principal.getApartmentId(), false));
    }

    @PostMapping("/announcements")
    @Operation(summary = "Create Announcement", description = "Publishes a new community notice and optionally broadcasts via email")
    public ResponseEntity<AnnouncementDto> createAnnouncement(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @Valid @RequestBody CreateAnnouncementRequest request) {
        validateApartment(principal);
        return new ResponseEntity<>(announcementService.createAnnouncement(principal.getApartmentId(), request), HttpStatus.CREATED);
    }

    @PostMapping("/announcements/{id}/forward-email")
    @Operation(summary = "Forward Announcement to All Households", description = "Forwards a Main Admin announcement to all society households via Email")
    public ResponseEntity<AnnouncementDto> forwardAnnouncementToEmail(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        validateApartment(principal);
        String adminName = principal != null ? principal.getFullName() : "Society Admin";
        return ResponseEntity.ok(announcementService.forwardAnnouncementToResidents(id, principal.getApartmentId(), adminName));
    }

    @DeleteMapping("/announcements/{id}")
    @Operation(summary = "Delete Announcement", description = "Removes a community notice")
    public ResponseEntity<Void> deleteAnnouncement(@PathVariable Long id) {
        announcementService.deleteAnnouncement(id);
        return ResponseEntity.noContent().build();
    }

    private void validateApartment(CustomUserPrincipal principal) {
        if (principal == null || principal.getApartmentId() == null) {
            throw new BadRequestException("Community admin is not associated with an apartment");
        }
    }
}
