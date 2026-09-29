package com.example.WaterManagement.service;

import com.example.WaterManagement.entity.Apartment;
import com.example.WaterManagement.entity.ApportionmentMethod;
import com.example.WaterManagement.entity.Household;
import com.example.WaterManagement.entity.TariffPlan;
import com.example.WaterManagement.repository.HouseholdRepository;
import com.example.WaterManagement.repository.WaterUsageLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;

@Service
public class ApportionmentService {

    private final HouseholdRepository householdRepository;
    private final BulkPurchaseService bulkPurchaseService;
    private final WaterUsageLogRepository waterUsageLogRepository;

    public ApportionmentService(HouseholdRepository householdRepository,
                                BulkPurchaseService bulkPurchaseService,
                                WaterUsageLogRepository waterUsageLogRepository) {
        this.householdRepository = householdRepository;
        this.bulkPurchaseService = bulkPurchaseService;
        this.waterUsageLogRepository = waterUsageLogRepository;
    }

    /**
     * Compute shared water apportionment charge for a specific household in a given month
     */
    @Transactional(readOnly = true)
    public ApportionmentResult calculateHouseholdApportionment(Apartment apartment,
                                                              Household household,
                                                              String billingMonth,
                                                              TariffPlan tariffPlan,
                                                              Double extraCommonWaterKl) {
        // 1. Total Bulk Tanker & Municipal Purchase Cost for the month
        double bulkCost = bulkPurchaseService.getTotalTankerCostForMonth(apartment.getId(), billingMonth);

        // 2. Extra common water consumption cost (e.g. Garden/Pool water metered separately)
        double extraCommonCost = 0.0;
        if (extraCommonWaterKl != null && extraCommonWaterKl > 0.0) {
            extraCommonCost = extraCommonWaterKl * (tariffPlan.getBaseRatePerKl() != null ? tariffPlan.getBaseRatePerKl() : 15.0);
        }

        double totalSharedExpenditure = bulkCost + extraCommonCost;

        if (totalSharedExpenditure <= 0.0) {
            return new ApportionmentResult(0.0, "No common water purchase or shared tanker usage recorded for this billing period.");
        }

        List<Household> allHouseholds = householdRepository.findByApartmentId(apartment.getId());
        if (allHouseholds.isEmpty()) {
            return new ApportionmentResult(0.0, "No households found.");
        }

        ApportionmentMethod method = tariffPlan.getApportionmentMethod() != null
                ? tariffPlan.getApportionmentMethod()
                : ApportionmentMethod.BY_FLAT_AREA;

        double sharedCharge = 0.0;
        String explanation;

        switch (method) {
            case BY_METERED_CONSUMPTION_WITH_AREA_FALLBACK: {
                LocalDate start;
                LocalDate end;
                try {
                    YearMonth ym = YearMonth.parse(billingMonth);
                    start = ym.atDay(1);
                    end = ym.atEndOfMonth();
                } catch (Exception e) {
                    start = LocalDate.now().withDayOfMonth(1);
                    end = LocalDate.now();
                }

                // Partition households into metered and unmetered
                List<Household> meteredList = new ArrayList<>();
                List<Household> unmeteredList = new ArrayList<>();
                double totalMeteredConsumption = 0.0;
                double targetHouseholdConsumption = 0.0;

                for (Household h : allHouseholds) {
                    boolean hasMeter = h.getMeterSerialNumber() != null && !h.getMeterSerialNumber().trim().isEmpty();
                    Double consumption = waterUsageLogRepository.sumConsumptionByHouseholdAndDateBetween(h.getId(), start, end);
                    double c = consumption != null ? consumption : 0.0;

                    if (h.getId().equals(household.getId())) {
                        targetHouseholdConsumption = c;
                    }

                    if (hasMeter) {
                        meteredList.add(h);
                        totalMeteredConsumption += c;
                    } else {
                        unmeteredList.add(h);
                    }
                }

                double totalSocietyArea = allHouseholds.stream()
                        .mapToDouble(h -> h.getAreaSqft() != null && h.getAreaSqft() > 0 ? h.getAreaSqft() : 1200.0)
                        .sum();
                double unmeteredArea = unmeteredList.stream()
                        .mapToDouble(h -> h.getAreaSqft() != null && h.getAreaSqft() > 0 ? h.getAreaSqft() : 1200.0)
                        .sum();
                double meteredArea = totalSocietyArea - unmeteredArea;

                boolean isTargetMetered = household.getMeterSerialNumber() != null && !household.getMeterSerialNumber().trim().isEmpty();

                if (unmeteredList.isEmpty() || unmeteredArea <= 0.0) {
                    // 100% Metered Society
                    double fraction = totalMeteredConsumption > 0.0 ? (targetHouseholdConsumption / totalMeteredConsumption) : (1.0 / allHouseholds.size());
                    sharedCharge = round2(totalSharedExpenditure * fraction);
                    explanation = String.format("Proportional by Metered Consumption: %.2f kL / %.2f total metered kL (%.2f%% of total shared cost ₹%.2f)",
                            targetHouseholdConsumption, totalMeteredConsumption, fraction * 100.0, totalSharedExpenditure);
                } else if (meteredList.isEmpty()) {
                    // Fallback 100% Flat Area
                    double flatArea = household.getAreaSqft() != null && household.getAreaSqft() > 0 ? household.getAreaSqft() : 1200.0;
                    double fraction = totalSocietyArea > 0.0 ? (flatArea / totalSocietyArea) : (1.0 / allHouseholds.size());
                    sharedCharge = round2(totalSharedExpenditure * fraction);
                    explanation = String.format("Fallback by Flat Area: %.0f sq.ft / %.0f total society sq.ft (%.2f%% of shared cost ₹%.2f)",
                            flatArea, totalSocietyArea, fraction * 100.0, totalSharedExpenditure);
                } else {
                    // Hybrid: Metered consumption share + Flat area fallback share
                    double unmeteredPoolFraction = totalSocietyArea > 0.0 ? (unmeteredArea / totalSocietyArea) : 0.0;
                    double meteredPoolFraction = 1.0 - unmeteredPoolFraction;

                    double meteredPoolCost = totalSharedExpenditure * meteredPoolFraction;
                    double unmeteredPoolCost = totalSharedExpenditure * unmeteredPoolFraction;

                    if (isTargetMetered) {
                        double fraction = totalMeteredConsumption > 0.0 ? (targetHouseholdConsumption / totalMeteredConsumption) : (1.0 / meteredList.size());
                        sharedCharge = round2(meteredPoolCost * fraction);
                        explanation = String.format("Proportional Metered Share: %.2f kL / %.2f metered kL of metered pool ₹%.2f (%.2f%% pool share, total cost ₹%.2f)",
                                targetHouseholdConsumption, totalMeteredConsumption, meteredPoolCost, fraction * 100.0, totalSharedExpenditure);
                    } else {
                        double flatArea = household.getAreaSqft() != null && household.getAreaSqft() > 0 ? household.getAreaSqft() : 1200.0;
                        double fraction = unmeteredArea > 0.0 ? (flatArea / unmeteredArea) : (1.0 / unmeteredList.size());
                        sharedCharge = round2(unmeteredPoolCost * fraction);
                        explanation = String.format("Fallback Area Share (Unmetered): %.0f sq.ft / %.0f unmetered sq.ft of unmetered pool ₹%.2f (%.2f%% pool share, total cost ₹%.2f)",
                                flatArea, unmeteredArea, unmeteredPoolCost, fraction * 100.0, totalSharedExpenditure);
                    }
                }
                break;
            }

            case BY_FLAT_AREA: {
                double totalAreaSqft = allHouseholds.stream()
                        .mapToDouble(h -> h.getAreaSqft() != null && h.getAreaSqft() > 0 ? h.getAreaSqft() : 1200.0)
                        .sum();
                double flatArea = household.getAreaSqft() != null && household.getAreaSqft() > 0 ? household.getAreaSqft() : 1200.0;
                double fraction = totalAreaSqft > 0 ? flatArea / totalAreaSqft : (1.0 / allHouseholds.size());
                sharedCharge = round2(totalSharedExpenditure * fraction);
                explanation = String.format("Proportional by Flat Area: %.0f sq.ft / %.0f total society sq.ft (%.2f%% of total shared cost ₹%.2f)",
                        flatArea, totalAreaSqft, fraction * 100.0, totalSharedExpenditure);
                break;
            }

            case BY_OCCUPANCY: {
                double totalOccupants = allHouseholds.stream()
                        .mapToDouble(h -> h.getOccupancyCount() != null && h.getOccupancyCount() > 0 ? h.getOccupancyCount() : 3)
                        .sum();
                double occupants = household.getOccupancyCount() != null && household.getOccupancyCount() > 0 ? household.getOccupancyCount() : 3;
                double fraction = totalOccupants > 0 ? occupants / totalOccupants : (1.0 / allHouseholds.size());
                sharedCharge = round2(totalSharedExpenditure * fraction);
                explanation = String.format("Proportional by Occupancy: %.0f occupants / %.0f total society residents (%.2f%% of total shared cost ₹%.2f)",
                        occupants, totalOccupants, fraction * 100.0, totalSharedExpenditure);
                break;
            }

            case EQUAL_PER_FLAT:
            default: {
                double fraction = 1.0 / allHouseholds.size();
                sharedCharge = round2(totalSharedExpenditure * fraction);
                explanation = String.format("Equal Division: Split equally across all %d registered flats (1/%d of total shared cost ₹%.2f)",
                        allHouseholds.size(), allHouseholds.size(), totalSharedExpenditure);
                break;
            }
        }

        return new ApportionmentResult(sharedCharge, explanation);
    }

    public static class ApportionmentResult {
        private final Double sharedCharge;
        private final String details;

        public ApportionmentResult(Double sharedCharge, String details) {
            this.sharedCharge = sharedCharge;
            this.details = details;
        }

        public Double getSharedCharge() { return sharedCharge; }
        public String getDetails() { return details; }
    }

    private double round2(double val) {
        return Math.round(val * 100.0) / 100.0;
    }
}
