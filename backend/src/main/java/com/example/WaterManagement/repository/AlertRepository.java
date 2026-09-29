package com.example.WaterManagement.repository;

import com.example.WaterManagement.entity.Alert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {
    List<Alert> findByHouseholdIdOrderBySentAtDesc(Long householdId);
    List<Alert> findByHouseholdIdAndIsReadFalseOrderBySentAtDesc(Long householdId);
    long countByHouseholdIdAndIsReadFalse(Long householdId);
    void deleteByHouseholdId(Long householdId);

    @Query("SELECT a FROM Alert a WHERE a.household.apartment.id = :apartmentId ORDER BY a.sentAt DESC")
    List<Alert> findByApartmentIdOrderBySentAtDesc(@Param("apartmentId") Long apartmentId);

    @Query("SELECT COUNT(a) FROM Alert a WHERE a.household.apartment.id = :apartmentId AND a.isRead = false")
    long countUnreadByApartmentId(@Param("apartmentId") Long apartmentId);
}
