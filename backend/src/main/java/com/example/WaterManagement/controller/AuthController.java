package com.example.WaterManagement.controller;

import com.example.WaterManagement.dto.ApartmentDtos;
import com.example.WaterManagement.dto.AuthDtos;
import com.example.WaterManagement.security.CustomUserPrincipal;
import com.example.WaterManagement.service.AuthService;
import com.example.WaterManagement.service.MainAdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Authentication and registration APIs")
public class AuthController {

    private final AuthService authService;
    private final MainAdminService mainAdminService;

    public AuthController(AuthService authService, MainAdminService mainAdminService) {
        this.authService = authService;
        this.mainAdminService = mainAdminService;
    }

    @GetMapping("/platform-stats")
    @Operation(summary = "Get Public Platform Stats", description = "Retrieves live platform metrics from database for landing page animation counter")
    public ResponseEntity<ApartmentDtos.MainAdminStatsResponse> getPublicPlatformStats() {
        return ResponseEntity.ok(mainAdminService.getStats());
    }

    @PostMapping("/login")
    @Operation(summary = "User Login", description = "Authenticates user (Community Admin, Resident, Main Admin) and returns JWT token")
    public ResponseEntity<AuthDtos.LoginResponse> login(@Valid @RequestBody AuthDtos.LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register/community-admin")
    @Operation(summary = "Register Community Admin", description = "Onboards a new apartment community and registers the Community Admin account")
    public ResponseEntity<AuthDtos.LoginResponse> registerCommunityAdmin(@Valid @RequestBody AuthDtos.CommunityAdminRegisterRequest request) {
        return new ResponseEntity<>(authService.registerCommunityAdmin(request), HttpStatus.CREATED);
    }

    @PostMapping("/register/resident")
    @Operation(summary = "Register Resident", description = "Registers a new resident using a valid household invite code")
    public ResponseEntity<AuthDtos.LoginResponse> registerResident(@Valid @RequestBody AuthDtos.ResidentRegisterRequest request) {
        return ResponseEntity.ok(authService.registerResident(request));
    }

    @PostMapping("/oauth/google")
    @Operation(summary = "Google OAuth 2.0 Sign-In", description = "Authenticates or initiates onboarding with Google OAuth token")
    public ResponseEntity<AuthDtos.LoginResponse> googleLogin(@Valid @RequestBody AuthDtos.GoogleOAuthRequest request) {
        return ResponseEntity.ok(authService.googleOAuthLogin(request));
    }

    @GetMapping("/verification-status")
    @Operation(summary = "Check Verification Status", description = "Retrieves current society registration approval status by email")
    public ResponseEntity<AuthDtos.VerificationStatusResponse> getVerificationStatus(@RequestParam String email) {
        return ResponseEntity.ok(authService.getVerificationStatusByEmail(email));
    }

    @PostMapping("/resubmit-verification")
    @Operation(summary = "Resubmit Verification Documents", description = "Re-submits corrected verification documents for a rejected or pending society")
    public ResponseEntity<AuthDtos.LoginResponse> resubmitVerification(@RequestBody AuthDtos.ResubmitVerificationRequest request) {
        return ResponseEntity.ok(authService.resubmitVerification(request));
    }

    @GetMapping("/me")
    @Operation(summary = "Get Current User Profile", description = "Retrieves the authenticated user's profile details", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<AuthDtos.LoginResponse> getCurrentUserProfile(@AuthenticationPrincipal CustomUserPrincipal principal) {
        if (principal == null) {
            throw new com.example.WaterManagement.exception.UnauthorizedAccessException("User is not authenticated");
        }
        return ResponseEntity.ok(authService.getCurrentUser(principal.getId()));
    }

    @PutMapping("/me")
    @Operation(summary = "Update User Profile", description = "Updates the authenticated user's name and contact number", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<AuthDtos.LoginResponse> updateCurrentUserProfile(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @RequestBody AuthDtos.UpdateProfileRequest request) {
        if (principal == null) {
            throw new com.example.WaterManagement.exception.UnauthorizedAccessException("User is not authenticated");
        }
        return ResponseEntity.ok(authService.updateCurrentUser(principal.getId(), request));
    }

    @PostMapping("/change-password")
    @Operation(summary = "Change Password", description = "Updates user password in the database after validating current credentials", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<AuthDtos.MessageResponse> changePassword(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @Valid @RequestBody AuthDtos.ChangePasswordRequest request) {
        return ResponseEntity.ok(authService.changePassword(principal.getId(), request));
    }
}
