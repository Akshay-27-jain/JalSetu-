package com.example.WaterManagement.repository;

import com.example.WaterManagement.entity.Apartment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ApartmentRepository extends JpaRepository<Apartment, Long> {
    Optional<Apartment> findByName(String name);
    Optional<Apartment> findFirstByName(String name);
    Optional<Apartment> findFirstByNameOrderByIdAsc(String name);
}

