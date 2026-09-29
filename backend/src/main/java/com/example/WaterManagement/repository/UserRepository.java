package com.example.WaterManagement.repository;

import com.example.WaterManagement.entity.Role;
import com.example.WaterManagement.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByApartmentId(Long apartmentId);
    List<User> findByRole(Role role);
    Optional<User> findByApartmentIdAndRole(Long apartmentId, Role role);
    List<User> findByHouseholdId(Long householdId);
    Optional<User> findFirstByHouseholdId(Long householdId);
}
