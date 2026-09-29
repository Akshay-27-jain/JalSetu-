package com.example.WaterManagement.repository;

import com.example.WaterManagement.entity.Invoice;
import com.example.WaterManagement.entity.InvoiceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    List<Invoice> findByHouseholdIdOrderByGeneratedAtDesc(Long householdId);
    List<Invoice> findByHouseholdIdOrderByBillingMonthDesc(Long householdId);
    List<Invoice> findByHouseholdIdAndBillingMonth(Long householdId, String billingMonth);
    List<Invoice> findByHouseholdIdAndBillingMonthOrderByGeneratedAtAsc(Long householdId, String billingMonth);
    Optional<Invoice> findFirstByHouseholdIdAndBillingMonthOrderByGeneratedAtDesc(Long householdId, String billingMonth);
    List<Invoice> findByBillingCycleId(Long billingCycleId);
    Optional<Invoice> findByHouseholdIdAndBillingCycleId(Long householdId, Long billingCycleId);
    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);
    Optional<Invoice> findByRazorpayOrderId(String razorpayOrderId);
    List<Invoice> findByStatusNot(InvoiceStatus status);
    void deleteByHouseholdId(Long householdId);

    @Query("SELECT i FROM Invoice i WHERE i.household.apartment.id = :apartmentId ORDER BY i.generatedAt DESC")
    List<Invoice> findByApartmentId(@Param("apartmentId") Long apartmentId);

    @Query("SELECT i FROM Invoice i WHERE i.household.apartment.id = :apartmentId AND i.billingMonth = :billingMonth ORDER BY i.household.flatNumber ASC, i.generatedAt DESC")
    List<Invoice> findByApartmentIdAndBillingMonth(@Param("apartmentId") Long apartmentId, @Param("billingMonth") String billingMonth);

    @Query("SELECT i FROM Invoice i WHERE i.household.apartment.id = :apartmentId AND i.billingMonth = :billingMonth AND i.status = :status ORDER BY i.household.flatNumber ASC, i.generatedAt DESC")
    List<Invoice> findByApartmentIdAndBillingMonthAndStatus(@Param("apartmentId") Long apartmentId, @Param("billingMonth") String billingMonth, @Param("status") InvoiceStatus status);

    @Query("SELECT i FROM Invoice i WHERE i.household.apartment.id = :apartmentId AND (:status IS NULL OR i.status = :status) ORDER BY i.generatedAt DESC")
    List<Invoice> findByApartmentIdAndStatus(@Param("apartmentId") Long apartmentId, @Param("status") InvoiceStatus status);
}
