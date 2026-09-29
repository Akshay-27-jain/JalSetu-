package com.example.WaterManagement.repository;

import com.example.WaterManagement.entity.BulkPurchase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BulkPurchaseRepository extends JpaRepository<BulkPurchase, Long> {
    List<BulkPurchase> findByApartmentIdOrderByPurchasedAtDesc(Long apartmentId);
    List<BulkPurchase> findByBillingCycleId(Long billingCycleId);
    List<BulkPurchase> findByApartmentId(Long apartmentId);
    void deleteByApartmentId(Long apartmentId);

    @Query("SELECT b FROM BulkPurchase b WHERE b.apartment.id = :apartmentId AND b.purchasedAt BETWEEN :startDate AND :endDate ORDER BY b.purchasedAt DESC")
    List<BulkPurchase> findByApartmentIdAndDateRange(@Param("apartmentId") Long apartmentId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
