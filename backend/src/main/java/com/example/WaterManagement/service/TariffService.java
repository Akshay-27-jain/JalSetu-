package com.example.WaterManagement.service;

import com.example.WaterManagement.dto.BillingDtos;
import com.example.WaterManagement.entity.Apartment;
import com.example.WaterManagement.entity.ApportionmentMethod;
import com.example.WaterManagement.entity.TariffPlan;
import com.example.WaterManagement.exception.ResourceNotFoundException;
import com.example.WaterManagement.repository.ApartmentRepository;
import com.example.WaterManagement.repository.TariffPlanRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class TariffService {

    private final TariffPlanRepository tariffPlanRepository;
    private final ApartmentRepository apartmentRepository;
    private final com.example.WaterManagement.repository.HouseholdRepository householdRepository;

    public TariffService(TariffPlanRepository tariffPlanRepository,
                         ApartmentRepository apartmentRepository,
                         com.example.WaterManagement.repository.HouseholdRepository householdRepository) {
        this.tariffPlanRepository = tariffPlanRepository;
        this.apartmentRepository = apartmentRepository;
        this.householdRepository = householdRepository;
    }

    /**
     * Get active tariff plan for apartment, or initialize default plan if none exists
     */
    @Transactional
    public TariffPlan getOrCreateActiveTariff(Long apartmentId) {
        TariffPlan plan = tariffPlanRepository.findFirstByApartmentIdOrderByEffectiveFromDesc(apartmentId)
                .orElseGet(() -> {
                    Apartment apartment = apartmentRepository.findById(apartmentId)
                            .orElseThrow(() -> new ResourceNotFoundException("Apartment not found with ID: " + apartmentId));

                    TariffPlan defaultPlan = TariffPlan.builder()
                            .apartment(apartment)
                            .baseMaintenanceFee(150.0)
                            .baseRatePerKl(15.0)       // Slab 1: 0 - 10 kL @ ₹15
                            .baseTierLimitKl(10.0)
                            .midRatePerKl(25.0)        // Slab 2: 10 - 25 kL @ ₹25
                            .midTierLimitKl(25.0)
                            .higherRatePerKl(45.0)     // Slab 3: > 25 kL @ ₹45
                            .apportionmentMethod(ApportionmentMethod.BY_FLAT_AREA)
                            .effectiveFrom(LocalDate.now())
                            .build();

                    return tariffPlanRepository.save(defaultPlan);
                });

        // Ensure no null values on existing rows
        boolean modified = false;
        if (plan.getBaseMaintenanceFee() == null) { plan.setBaseMaintenanceFee(150.0); modified = true; }
        if (plan.getBaseRatePerKl() == null) { plan.setBaseRatePerKl(15.0); modified = true; }
        if (plan.getBaseTierLimitKl() == null) { plan.setBaseTierLimitKl(10.0); modified = true; }
        if (plan.getMidRatePerKl() == null) { plan.setMidRatePerKl(25.0); modified = true; }
        if (plan.getMidTierLimitKl() == null) { plan.setMidTierLimitKl(25.0); modified = true; }
        if (plan.getHigherRatePerKl() == null) { plan.setHigherRatePerKl(45.0); modified = true; }
        if (plan.getApportionmentMethod() == null) { plan.setApportionmentMethod(ApportionmentMethod.BY_FLAT_AREA); modified = true; }

        if (modified) {
            plan = tariffPlanRepository.save(plan);
        }

        return plan;
    }

    @Transactional(readOnly = true)
    public BillingDtos.TariffPlanDto getTariffPlanDto(Long apartmentId) {
        TariffPlan plan = getOrCreateActiveTariff(apartmentId);
        return mapToDto(plan);
    }

    @Transactional
    public BillingDtos.TariffPlanDto updateTariffPlan(Long apartmentId, BillingDtos.UpdateTariffRequest request) {
        Apartment apartment = apartmentRepository.findById(apartmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Apartment not found with ID: " + apartmentId));

        TariffPlan plan = tariffPlanRepository.findFirstByApartmentIdOrderByEffectiveFromDesc(apartmentId)
                .orElse(TariffPlan.builder().apartment(apartment).build());

        plan.setBaseMaintenanceFee(round2(request.getBaseMaintenanceFee()));
        plan.setBaseRatePerKl(round2(request.getBaseRatePerKl()));
        plan.setBaseTierLimitKl(round2(request.getBaseTierLimitKl()));
        plan.setMidRatePerKl(round2(request.getMidRatePerKl()));
        plan.setMidTierLimitKl(round2(request.getMidTierLimitKl()));
        plan.setHigherRatePerKl(round2(request.getHigherRatePerKl()));
        plan.setApportionmentMethod(request.getApportionmentMethod() != null ? request.getApportionmentMethod() : ApportionmentMethod.BY_FLAT_AREA);
        plan.setEffectiveFrom(LocalDate.now());

        plan = tariffPlanRepository.save(plan);
        return mapToDto(plan);
    }

    /**
     * Compute tiered metered cost and detailed slab-by-slab breakdown
     * Supports both:
     * 1. Configurable 2-Tier Engine: Base rate for first 10 kL (or configured limit), Higher rate for everything beyond
     * 2. Progressive 3-Tier Engine: Base rate (0 - tier1Limit), Mid rate (tier1Limit - tier2Limit), Higher rate (> tier2Limit)
     */
    public TierCalculationResult calculateTieredCost(TariffPlan tariff, Double consumptionKl) {
        double baseRate = tariff.getBaseRatePerKl() != null ? tariff.getBaseRatePerKl() : 15.0;
        double tier1Limit = tariff.getBaseTierLimitKl() != null && tariff.getBaseTierLimitKl() > 0 ? tariff.getBaseTierLimitKl() : 10.0;
        Double midRate = tariff.getMidRatePerKl();
        Double tier2Limit = tariff.getMidTierLimitKl();
        double higherRate = tariff.getHigherRatePerKl() != null ? tariff.getHigherRatePerKl() : 45.0;

        // Determine if apartment is using 2-Tier or 3-Tier model
        boolean isThreeTier = tier2Limit != null && tier2Limit > tier1Limit && midRate != null && midRate > 0;

        if (consumptionKl == null || consumptionKl <= 0.0) {
            String initialSlabName = isThreeTier
                    ? "Slab 1 (0 - " + tier1Limit + " kL)"
                    : "Base Tier (0 - " + tier1Limit + " kL)";
            return new TierCalculationResult(0.0, List.of(
                    BillingDtos.SlabBreakdownItem.builder()
                            .slabName(initialSlabName)
                            .volumeBilledKl(0.0)
                            .ratePerKl(baseRate)
                            .amount(0.0)
                            .build()
            ));
        }

        double remaining = consumptionKl;
        double totalMeteredCost = 0.0;
        List<BillingDtos.SlabBreakdownItem> breakdown = new ArrayList<>();

        // Tier 1: 0 to tier1Limit (e.g. First 10 kL at Base Rate)
        double slab1Usage = Math.min(remaining, tier1Limit);
        double slab1Cost = slab1Usage * baseRate;
        totalMeteredCost += slab1Cost;
        breakdown.add(BillingDtos.SlabBreakdownItem.builder()
                .slabName(isThreeTier ? "Slab 1 (0 - " + tier1Limit + " kL)" : "Base Tier (0 - " + tier1Limit + " kL)")
                .volumeBilledKl(round2(slab1Usage))
                .ratePerKl(baseRate)
                .amount(round2(slab1Cost))
                .build());
        remaining -= slab1Usage;

        if (remaining > 0) {
            if (isThreeTier) {
                // Tier 2: tier1Limit to tier2Limit (e.g. 10 to 25 kL at Mid Rate)
                double slab2Capacity = tier2Limit - tier1Limit;
                double slab2Usage = Math.min(remaining, slab2Capacity);
                double slab2Cost = slab2Usage * midRate;
                totalMeteredCost += slab2Cost;
                breakdown.add(BillingDtos.SlabBreakdownItem.builder()
                        .slabName("Slab 2 (" + tier1Limit + " - " + tier2Limit + " kL)")
                        .volumeBilledKl(round2(slab2Usage))
                        .ratePerKl(midRate)
                        .amount(round2(slab2Cost))
                        .build());
                remaining -= slab2Usage;

                // Tier 3: > tier2Limit (e.g. > 25 kL at Higher Rate)
                if (remaining > 0) {
                    double slab3Usage = remaining;
                    double slab3Cost = slab3Usage * higherRate;
                    totalMeteredCost += slab3Cost;
                    breakdown.add(BillingDtos.SlabBreakdownItem.builder()
                            .slabName("Slab 3 (> " + tier2Limit + " kL)")
                            .volumeBilledKl(round2(slab3Usage))
                            .ratePerKl(higherRate)
                            .amount(round2(slab3Cost))
                            .build());
                }
            } else {
                // Direct 2-Tier Model: Higher Rate for everything beyond tier1Limit (e.g. beyond 10 kL)
                double higherTierUsage = remaining;
                double higherTierCost = higherTierUsage * higherRate;
                totalMeteredCost += higherTierCost;
                breakdown.add(BillingDtos.SlabBreakdownItem.builder()
                        .slabName("Higher Tier (> " + tier1Limit + " kL)")
                        .volumeBilledKl(round2(higherTierUsage))
                        .ratePerKl(higherRate)
                        .amount(round2(higherTierCost))
                        .build());
            }
        }

        return new TierCalculationResult(round2(totalMeteredCost), breakdown);
    }

    public static class TierCalculationResult {
        private final Double totalCharge;
        private final List<BillingDtos.SlabBreakdownItem> breakdown;

        public TierCalculationResult(Double totalCharge, List<BillingDtos.SlabBreakdownItem> breakdown) {
            this.totalCharge = totalCharge;
            this.breakdown = breakdown;
        }

        public Double getTotalCharge() { return totalCharge; }
        public List<BillingDtos.SlabBreakdownItem> getBreakdown() { return breakdown; }
    }

    private BillingDtos.TariffPlanDto mapToDto(TariffPlan plan) {
        return BillingDtos.TariffPlanDto.builder()
                .id(plan.getId())
                .apartmentId(plan.getApartment().getId())
                .baseMaintenanceFee(plan.getBaseMaintenanceFee() != null ? plan.getBaseMaintenanceFee() : 150.0)
                .baseRatePerKl(plan.getBaseRatePerKl() != null ? plan.getBaseRatePerKl() : 15.0)
                .baseTierLimitKl(plan.getBaseTierLimitKl() != null ? plan.getBaseTierLimitKl() : 10.0)
                .midRatePerKl(plan.getMidRatePerKl() != null ? plan.getMidRatePerKl() : 25.0)
                .midTierLimitKl(plan.getMidTierLimitKl() != null ? plan.getMidTierLimitKl() : 25.0)
                .higherRatePerKl(plan.getHigherRatePerKl() != null ? plan.getHigherRatePerKl() : 45.0)
                .apportionmentMethod(plan.getApportionmentMethod() != null ? plan.getApportionmentMethod() : ApportionmentMethod.BY_FLAT_AREA)
                .effectiveFrom(plan.getEffectiveFrom())
                .build();
    }

    @Transactional(readOnly = true)
    public List<BillingDtos.ApartmentTariffSummaryDto> getAllApartmentTariffSummaries() {
        List<Apartment> apartments = apartmentRepository.findAll();
        List<BillingDtos.ApartmentTariffSummaryDto> summaries = new ArrayList<>();

        for (Apartment apt : apartments) {
            TariffPlan plan = getOrCreateActiveTariff(apt.getId());
            long regCount = householdRepository.countByApartmentId(apt.getId());
            long meterCount = householdRepository.countByApartmentIdAndHasMeterTrue(apt.getId());

            summaries.add(BillingDtos.ApartmentTariffSummaryDto.builder()
                    .apartmentId(apt.getId())
                    .apartmentName(apt.getName())
                    .address(apt.getAddress())
                    .totalHouseholds(apt.getTotalHouseholds())
                    .registeredHouseholds(regCount)
                    .activeMetersCount(meterCount)
                    .tariffId(plan.getId())
                    .baseMaintenanceFee(plan.getBaseMaintenanceFee())
                    .baseRatePerKl(plan.getBaseRatePerKl())
                    .baseTierLimitKl(plan.getBaseTierLimitKl())
                    .midRatePerKl(plan.getMidRatePerKl())
                    .midTierLimitKl(plan.getMidTierLimitKl())
                    .higherRatePerKl(plan.getHigherRatePerKl())
                    .apportionmentMethod(plan.getApportionmentMethod())
                    .effectiveFrom(plan.getEffectiveFrom())
                    .build());
        }

        return summaries;
    }

    @Transactional(readOnly = true)
    public BillingDtos.PlatformTariffOverviewResponse getPlatformTariffOverview() {
        List<BillingDtos.ApartmentTariffSummaryDto> list = getAllApartmentTariffSummaries();
        if (list.isEmpty()) {
            return BillingDtos.PlatformTariffOverviewResponse.builder().build();
        }

        double sumBaseRate = 0;
        double sumMidRate = 0;
        double sumHigherRate = 0;
        double sumBaseFee = 0;

        for (BillingDtos.ApartmentTariffSummaryDto item : list) {
            sumBaseRate += (item.getBaseRatePerKl() != null ? item.getBaseRatePerKl() : 0.0);
            sumMidRate += (item.getMidRatePerKl() != null ? item.getMidRatePerKl() : 0.0);
            sumHigherRate += (item.getHigherRatePerKl() != null ? item.getHigherRatePerKl() : 0.0);
            sumBaseFee += (item.getBaseMaintenanceFee() != null ? item.getBaseMaintenanceFee() : 0.0);
        }

        int count = list.size();
        return BillingDtos.PlatformTariffOverviewResponse.builder()
                .totalApartments(count)
                .averageBaseRate(round2(sumBaseRate / count))
                .averageMidRate(round2(sumMidRate / count))
                .averageHigherRate(round2(sumHigherRate / count))
                .averageBaseFee(round2(sumBaseFee / count))
                .tariffs(list)
                .build();
    }

    private double round2(double val) {
        return Math.round(val * 100.0) / 100.0;
    }
}
