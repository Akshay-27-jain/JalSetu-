package com.example.WaterManagement.repository;

import com.example.WaterManagement.entity.Household;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HouseholdRepository extends JpaRepository<Household, Long> {
    List<Household> findByApartmentId(Long apartmentId);
    Optional<Household> findByApartmentIdAndFlatNumber(Long apartmentId, String flatNumber);
    Optional<Household> findByInviteCode(String inviteCode);
    boolean existsByApartmentIdAndFlatNumber(Long apartmentId, String flatNumber);
    boolean existsByInviteCode(String inviteCode);
    long countByApartmentId(Long apartmentId);
    long countByApartmentIdAndHasMeterTrue(Long apartmentId);
}
