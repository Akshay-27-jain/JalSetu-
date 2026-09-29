package com.example.WaterManagement.repository;

import com.example.WaterManagement.entity.WaterUsageLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface WaterUsageLogRepository extends JpaRepository<WaterUsageLog, Long> {

    @Query("SELECT l FROM WaterUsageLog l WHERE l.household.id = :householdId AND l.readingDate <= CURRENT_DATE ORDER BY l.readingDate DESC, l.id DESC")
    List<WaterUsageLog> findByHouseholdIdOrderByReadingDateDesc(@Param("householdId") Long householdId);

    Optional<WaterUsageLog> findByHouseholdIdAndReadingDate(Long householdId, LocalDate readingDate);

    boolean existsByHouseholdIdAndReadingDate(Long householdId, LocalDate readingDate);

    Optional<WaterUsageLog> findFirstByHouseholdIdOrderByReadingDateDesc(Long householdId);

    Optional<WaterUsageLog> findFirstByHouseholdIdAndReadingDateLessThanOrderByReadingDateDesc(Long householdId, LocalDate readingDate);

    void deleteByHouseholdId(Long householdId);

    @Query("SELECT l FROM WaterUsageLog l WHERE l.household.apartment.id = :apartmentId AND l.readingDate <= CURRENT_DATE ORDER BY l.readingDate DESC, l.id DESC")
    List<WaterUsageLog> findByApartmentIdOrderByReadingDateDesc(@Param("apartmentId") Long apartmentId);

    @Query("SELECT l FROM WaterUsageLog l WHERE l.household.id = :householdId AND l.readingDate BETWEEN :startDate AND :endDate ORDER BY l.readingDate ASC")
    List<WaterUsageLog> findByHouseholdIdAndDateBetween(
            @Param("householdId") Long householdId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query("SELECT COALESCE(SUM(l.consumptionKl), 0.0) FROM WaterUsageLog l WHERE l.household.id = :householdId AND l.readingDate BETWEEN :startDate AND :endDate")
    Double sumConsumptionByHouseholdAndDateBetween(
            @Param("householdId") Long householdId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query("SELECT COALESCE(SUM(l.consumptionKl), 0.0) FROM WaterUsageLog l WHERE l.household.apartment.id = :apartmentId AND l.readingDate BETWEEN :startDate AND :endDate")
    Double sumConsumptionByApartmentAndDateBetween(
            @Param("apartmentId") Long apartmentId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query("SELECT l.household.id, l.household.flatNumber, COALESCE(SUM(l.consumptionKl), 0.0) " +
           "FROM WaterUsageLog l " +
           "WHERE l.household.apartment.id = :apartmentId AND l.readingDate >= :startDate " +
           "GROUP BY l.household.id, l.household.flatNumber " +
           "ORDER BY SUM(l.consumptionKl) DESC")
    List<Object[]> findTopConsumersByApartmentSince(
            @Param("apartmentId") Long apartmentId,
            @Param("startDate") LocalDate startDate
    );
}
