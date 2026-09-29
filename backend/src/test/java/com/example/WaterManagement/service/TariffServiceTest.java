package com.example.WaterManagement.service;

import com.example.WaterManagement.entity.Apartment;
import com.example.WaterManagement.entity.ApportionmentMethod;
import com.example.WaterManagement.entity.TariffPlan;
import com.example.WaterManagement.repository.ApartmentRepository;
import com.example.WaterManagement.repository.HouseholdRepository;
import com.example.WaterManagement.repository.TariffPlanRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

public class TariffServiceTest {

    private TariffPlanRepository tariffPlanRepository;
    private ApartmentRepository apartmentRepository;
    private HouseholdRepository householdRepository;
    private TariffService tariffService;

    @BeforeEach
    void setUp() {
        tariffPlanRepository = Mockito.mock(TariffPlanRepository.class);
        apartmentRepository = Mockito.mock(ApartmentRepository.class);
        householdRepository = Mockito.mock(HouseholdRepository.class);
        tariffService = new TariffService(tariffPlanRepository, apartmentRepository, householdRepository);
    }

    @Test
    @DisplayName("2-Tier Model: Consumption below base limit (8 kL @ Rs 15/kL)")
    void testTwoTierUnderLimit() {
        TariffPlan tariff = TariffPlan.builder()
                .baseMaintenanceFee(150.0)
                .baseTierLimitKl(10.0)
                .baseRatePerKl(15.0)
                .midTierLimitKl(10.0)   // 2-Tier mode: mid limit <= base limit
                .midRatePerKl(0.0)
                .higherRatePerKl(45.0)
                .apportionmentMethod(ApportionmentMethod.BY_FLAT_AREA)
                .build();

        TariffService.TierCalculationResult result = tariffService.calculateTieredCost(tariff, 8.0);
        assertNotNull(result);
        assertEquals(120.0, result.getTotalCharge(), 0.001, "8 kL * Rs 15 = Rs 120");
        assertEquals(1, result.getBreakdown().size());
        assertEquals("Base Tier (0 - 10.0 kL)", result.getBreakdown().get(0).getSlabName());
        assertEquals(8.0, result.getBreakdown().get(0).getVolumeBilledKl());
        assertEquals(120.0, result.getBreakdown().get(0).getAmount());
    }

    @Test
    @DisplayName("2-Tier Model: Consumption above base limit (18 kL: 10 kL @ Rs 15/kL + 8 kL @ Rs 45/kL)")
    void testTwoTierAboveLimit() {
        TariffPlan tariff = TariffPlan.builder()
                .baseMaintenanceFee(150.0)
                .baseTierLimitKl(10.0)
                .baseRatePerKl(15.0)
                .midTierLimitKl(10.0)   // 2-Tier mode
                .midRatePerKl(0.0)
                .higherRatePerKl(45.0)
                .apportionmentMethod(ApportionmentMethod.BY_FLAT_AREA)
                .build();

        TariffService.TierCalculationResult result = tariffService.calculateTieredCost(tariff, 18.0);
        assertNotNull(result);
        // Tier 1: 10 * 15 = 150. Tier 2: 8 * 45 = 360. Total = 510.
        assertEquals(510.0, result.getTotalCharge(), 0.001);
        assertEquals(2, result.getBreakdown().size());
        assertEquals("Base Tier (0 - 10.0 kL)", result.getBreakdown().get(0).getSlabName());
        assertEquals(10.0, result.getBreakdown().get(0).getVolumeBilledKl());
        assertEquals(150.0, result.getBreakdown().get(0).getAmount());

        assertEquals("Higher Tier (> 10.0 kL)", result.getBreakdown().get(1).getSlabName());
        assertEquals(8.0, result.getBreakdown().get(1).getVolumeBilledKl());
        assertEquals(360.0, result.getBreakdown().get(1).getAmount());
    }

    @Test
    @DisplayName("3-Tier Progressive Model: Consumption across all 3 tiers (30 kL)")
    void testThreeTierProgressive() {
        TariffPlan tariff = TariffPlan.builder()
                .baseMaintenanceFee(150.0)
                .baseTierLimitKl(10.0)
                .baseRatePerKl(15.0)
                .midTierLimitKl(25.0)
                .midRatePerKl(25.0)
                .higherRatePerKl(45.0)
                .apportionmentMethod(ApportionmentMethod.BY_FLAT_AREA)
                .build();

        TariffService.TierCalculationResult result = tariffService.calculateTieredCost(tariff, 30.0);
        assertNotNull(result);
        // Tier 1: 10 * 15 = 150
        // Tier 2: 15 * 25 = 375
        // Tier 3: 5 * 45 = 225
        // Total = 150 + 375 + 225 = 750
        assertEquals(750.0, result.getTotalCharge(), 0.001);
        assertEquals(3, result.getBreakdown().size());
        assertEquals("Slab 1 (0 - 10.0 kL)", result.getBreakdown().get(0).getSlabName());
        assertEquals("Slab 2 (10.0 - 25.0 kL)", result.getBreakdown().get(1).getSlabName());
        assertEquals("Slab 3 (> 25.0 kL)", result.getBreakdown().get(2).getSlabName());
    }

    @Test
    @DisplayName("Zero consumption handling")
    void testZeroConsumption() {
        TariffPlan tariff = TariffPlan.builder()
                .baseMaintenanceFee(150.0)
                .baseTierLimitKl(10.0)
                .baseRatePerKl(15.0)
                .higherRatePerKl(45.0)
                .build();

        TariffService.TierCalculationResult result = tariffService.calculateTieredCost(tariff, 0.0);
        assertNotNull(result);
        assertEquals(0.0, result.getTotalCharge());
        assertEquals(1, result.getBreakdown().size());
        assertEquals(0.0, result.getBreakdown().get(0).getAmount());
    }
}
