package com.example.WaterManagement.service;

import com.example.WaterManagement.dto.BillingDtos;
import com.example.WaterManagement.entity.Apartment;
import com.example.WaterManagement.entity.BulkPurchase;
import com.example.WaterManagement.entity.BulkPurchaseSource;
import com.example.WaterManagement.exception.BadRequestException;
import com.example.WaterManagement.exception.ResourceNotFoundException;
import com.example.WaterManagement.repository.ApartmentRepository;
import com.example.WaterManagement.repository.BulkPurchaseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BulkPurchaseService {

    private final BulkPurchaseRepository bulkPurchaseRepository;
    private final ApartmentRepository apartmentRepository;

    public BulkPurchaseService(BulkPurchaseRepository bulkPurchaseRepository, ApartmentRepository apartmentRepository) {
        this.bulkPurchaseRepository = bulkPurchaseRepository;
        this.apartmentRepository = apartmentRepository;
    }

    @Transactional
    public BillingDtos.BulkPurchaseDto logPurchase(Long apartmentId, BillingDtos.CreateBulkPurchaseRequest request) {
        Apartment apartment = apartmentRepository.findById(apartmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Apartment not found with ID: " + apartmentId));

        double volume = request.getVolumeKl();
        double unitCost = request.getUnitCost();
        double totalCost = round2(volume * unitCost);

        BulkPurchase purchase = BulkPurchase.builder()
                .apartment(apartment)
                .sourceType(request.getSourceType() != null ? request.getSourceType() : BulkPurchaseSource.TANKER)
                .vendorName(request.getVendorName().trim())
                .volumeKl(round2(volume))
                .unitCost(round2(unitCost))
                .totalCost(totalCost)
                .purchasedAt(request.getPurchasedAt())
                .build();

        purchase = bulkPurchaseRepository.save(purchase);
        return mapToDto(purchase);
    }

    @Transactional(readOnly = true)
    public List<BillingDtos.BulkPurchaseDto> getPurchases(Long apartmentId) {
        return bulkPurchaseRepository.findByApartmentIdOrderByPurchasedAtDesc(apartmentId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deletePurchase(Long apartmentId, Long purchaseId) {
        BulkPurchase purchase = bulkPurchaseRepository.findById(purchaseId)
                .orElseThrow(() -> new ResourceNotFoundException("Bulk purchase not found with ID: " + purchaseId));

        if (!purchase.getApartment().getId().equals(apartmentId)) {
            throw new BadRequestException("Bulk purchase does not belong to your apartment");
        }

        bulkPurchaseRepository.delete(purchase);
    }

    /**
     * Compute total tanker cost for a specific billing month (YYYY-MM)
     */
    @Transactional(readOnly = true)
    public Double getTotalTankerCostForMonth(Long apartmentId, String billingMonth) {
        try {
            YearMonth ym = YearMonth.parse(billingMonth);
            LocalDate start = ym.atDay(1);
            LocalDate end = ym.atEndOfMonth();

            List<BulkPurchase> purchases = bulkPurchaseRepository.findByApartmentIdAndDateRange(apartmentId, start, end);
            return purchases.stream().mapToDouble(BulkPurchase::getTotalCost).sum();
        } catch (Exception e) {
            return 0.0;
        }
    }

    /**
     * Compute total tanker volume (kL) for a specific billing month (YYYY-MM)
     */
    @Transactional(readOnly = true)
    public Double getTotalTankerVolumeForMonth(Long apartmentId, String billingMonth) {
        try {
            YearMonth ym = YearMonth.parse(billingMonth);
            LocalDate start = ym.atDay(1);
            LocalDate end = ym.atEndOfMonth();

            List<BulkPurchase> purchases = bulkPurchaseRepository.findByApartmentIdAndDateRange(apartmentId, start, end);
            return purchases.stream().mapToDouble(BulkPurchase::getVolumeKl).sum();
        } catch (Exception e) {
            return 0.0;
        }
    }

    /**
     * Compute comprehensive cycle summary analytics for bulk procurement (volume, cost, effective unit cost, tanker vs municipal)
     */
    @Transactional(readOnly = true)
    public BillingDtos.BulkPurchaseCycleSummaryDto getCyclePurchasesSummary(Long apartmentId, String billingMonth) {
        List<BulkPurchase> purchases;
        if (billingMonth != null && !billingMonth.trim().isEmpty()) {
            try {
                YearMonth ym = YearMonth.parse(billingMonth.trim());
                LocalDate start = ym.atDay(1);
                LocalDate end = ym.atEndOfMonth();
                purchases = bulkPurchaseRepository.findByApartmentIdAndDateRange(apartmentId, start, end);
            } catch (Exception e) {
                purchases = bulkPurchaseRepository.findByApartmentIdOrderByPurchasedAtDesc(apartmentId);
            }
        } else {
            purchases = bulkPurchaseRepository.findByApartmentIdOrderByPurchasedAtDesc(apartmentId);
        }

        double totalVolume = 0.0;
        double totalCost = 0.0;
        double tankerVol = 0.0;
        double tankerCost = 0.0;
        double municipalVol = 0.0;
        double municipalCost = 0.0;

        for (BulkPurchase p : purchases) {
            double v = p.getVolumeKl() != null ? p.getVolumeKl() : 0.0;
            double c = p.getTotalCost() != null ? p.getTotalCost() : 0.0;
            totalVolume += v;
            totalCost += c;

            if (p.getSourceType() == BulkPurchaseSource.MUNICIPAL) {
                municipalVol += v;
                municipalCost += c;
            } else {
                tankerVol += v;
                tankerCost += c;
            }
        }

        double effectiveUnitCost = totalVolume > 0 ? round2(totalCost / totalVolume) : 0.0;

        return BillingDtos.BulkPurchaseCycleSummaryDto.builder()
                .apartmentId(apartmentId)
                .billingMonth(billingMonth != null ? billingMonth : "ALL")
                .totalVolumeKl(round2(totalVolume))
                .totalCost(round2(totalCost))
                .effectiveUnitCost(effectiveUnitCost)
                .deliveryCount(purchases.size())
                .tankerVolumeKl(round2(tankerVol))
                .tankerCost(round2(tankerCost))
                .municipalVolumeKl(round2(municipalVol))
                .municipalCost(round2(municipalCost))
                .build();
    }

    private BillingDtos.BulkPurchaseDto mapToDto(BulkPurchase p) {
        return BillingDtos.BulkPurchaseDto.builder()
                .id(p.getId())
                .apartmentId(p.getApartment().getId())
                .sourceType(p.getSourceType())
                .vendorName(p.getVendorName())
                .volumeKl(p.getVolumeKl())
                .unitCost(p.getUnitCost())
                .totalCost(p.getTotalCost())
                .purchasedAt(p.getPurchasedAt())
                .createdAt(p.getCreatedAt())
                .build();
    }

    private double round2(double val) {
        return Math.round(val * 100.0) / 100.0;
    }
}
