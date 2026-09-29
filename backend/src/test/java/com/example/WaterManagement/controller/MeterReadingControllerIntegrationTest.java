package com.example.WaterManagement.controller;

import com.example.WaterManagement.dto.AuthDtos;
import com.example.WaterManagement.dto.MeterReadingDtos;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class MeterReadingControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private com.example.WaterManagement.repository.WaterUsageLogRepository waterUsageLogRepository;

    @Autowired
    private com.example.WaterManagement.repository.HouseholdRepository householdRepository;

    private String residentToken;
    private String adminToken;

    @BeforeEach
    void obtainTokens() throws Exception {
        // Login as resident (john@palmmeadows.com / Resident@123)
        AuthDtos.LoginRequest residentLogin = AuthDtos.LoginRequest.builder()
                .email("john@palmmeadows.com")
                .password("Resident@123")
                .build();

        MvcResult residentResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(residentLogin)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode residentJson = objectMapper.readTree(residentResult.getResponse().getContentAsString());
        residentToken = residentJson.get("token").asText();

        // Login as community admin (admin@palmmeadows.com / Admin@12345)
        AuthDtos.LoginRequest adminLogin = AuthDtos.LoginRequest.builder()
                .email("admin@palmmeadows.com")
                .password("Admin@12345")
                .build();

        MvcResult adminResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(adminLogin)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode adminJson = objectMapper.readTree(adminResult.getResponse().getContentAsString());
        adminToken = adminJson.get("token").asText();
    }

    @Test
    @DisplayName("Resident can log a new meter reading and retrieve usage history")
    void testResidentLogReadingAndHistory() throws Exception {
        LocalDate readingDate = LocalDate.now().plusDays(200 + (long)(Math.random() * 5000));

        MeterReadingDtos.ResidentMeterReadingRequest request = MeterReadingDtos.ResidentMeterReadingRequest.builder()
                .readingDate(readingDate)
                .meterReadingKl(500.0)
                .build();

        mockMvc.perform(post("/api/resident/meter-readings")
                        .header("Authorization", "Bearer " + residentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.meterReadingKl").value(500.0))
                .andExpect(jsonPath("$.source").value("MANUAL"));

        mockMvc.perform(get("/api/resident/meter-readings")
                        .header("Authorization", "Bearer " + residentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @DisplayName("Resident cannot access community admin meter readings endpoint (RBAC check)")
    void testResidentAccessToAdminEndpoint_ReturnsForbidden() throws Exception {
        mockMvc.perform(get("/api/community-admin/meter-readings")
                        .header("Authorization", "Bearer " + residentToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Community admin can retrieve all apartment readings")
    void testCommunityAdminGetApartmentReadings() throws Exception {
        mockMvc.perform(get("/api/community-admin/meter-readings")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }
}
