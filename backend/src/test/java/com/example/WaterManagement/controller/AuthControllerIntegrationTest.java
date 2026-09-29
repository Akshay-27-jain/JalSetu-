package com.example.WaterManagement.controller;

import com.example.WaterManagement.dto.AuthDtos;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("Main admin login with seeded credentials should succeed and return JWT token")
    void testMainAdminLogin_Success() throws Exception {
        AuthDtos.LoginRequest request = AuthDtos.LoginRequest.builder()
                .email("admin@aquatrack.com")
                .password("Admin@12345")
                .build();

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.role").value("MAIN_ADMIN"))
                .andExpect(jsonPath("$.email").value("admin@aquatrack.com"));
    }

    @Test
    @DisplayName("Login with invalid password should return 401 Unauthorized")
    void testLogin_InvalidCredentials_ReturnsUnauthorized() throws Exception {
        AuthDtos.LoginRequest request = AuthDtos.LoginRequest.builder()
                .email("admin@aquatrack.com")
                .password("WrongPassword999")
                .build();

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid email or password"));
    }

    @Test
    @DisplayName("Register resident with invalid invite code should fail with 404")
    void testRegisterResident_InvalidInviteCode_ReturnsNotFound() throws Exception {
        AuthDtos.ResidentRegisterRequest request = AuthDtos.ResidentRegisterRequest.builder()
                .fullName("Test Resident")
                .email("newtestresident99@test.com")
                .password("Password@123")
                .inviteCode("INV-INVALID-CODE-999")
                .build();

        mockMvc.perform(post("/api/auth/register/resident")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Resource Not Found"));
    }
}
