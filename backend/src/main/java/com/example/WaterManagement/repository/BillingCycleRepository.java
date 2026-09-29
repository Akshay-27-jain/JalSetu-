package com.example.WaterManagement.repository;

import com.example.WaterManagement.entity.BillingCycle;
import com.example.WaterManagement.entity.BillingCycleStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BillingCycleRepository extends JpaRepository<BillingCycle, Long> {
    List<BillingCycle> findByApartmentIdOrderByStartDateDesc(Long apartmentId);
    Optional<BillingCycle> findFirstByApartmentIdAndStatus(Long apartmentId, BillingCycleStatus status);
}
