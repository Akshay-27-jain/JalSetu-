package com.example.WaterManagement.repository;

import com.example.WaterManagement.entity.SupportTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupportTicketRepository extends JpaRepository<SupportTicket, Long> {

    @Query("SELECT t FROM SupportTicket t LEFT JOIN FETCH t.apartment LEFT JOIN FETCH t.household LEFT JOIN FETCH t.user WHERE t.apartment.id = :apartmentId ORDER BY t.createdAt DESC")
    List<SupportTicket> findAllByApartmentIdWithDetails(@Param("apartmentId") Long apartmentId);

    @Query("SELECT t FROM SupportTicket t LEFT JOIN FETCH t.apartment LEFT JOIN FETCH t.household LEFT JOIN FETCH t.user WHERE t.household.id = :householdId ORDER BY t.createdAt DESC")
    List<SupportTicket> findAllByHouseholdIdWithDetails(@Param("householdId") Long householdId);

    @Query("SELECT t FROM SupportTicket t LEFT JOIN FETCH t.apartment LEFT JOIN FETCH t.household LEFT JOIN FETCH t.user ORDER BY t.createdAt DESC")
    List<SupportTicket> findAllPlatformTicketsWithDetails();

    @Query("SELECT t FROM SupportTicket t LEFT JOIN FETCH t.apartment LEFT JOIN FETCH t.household LEFT JOIN FETCH t.user WHERE t.isEscalatedToMainAdmin = true OR t.ticketScope = 'COMMUNITY_ADMIN_ISSUE' ORDER BY t.createdAt DESC")
    List<SupportTicket> findAllEscalatedAndCommunityConcernsWithDetails();

    long countByApartmentIdAndStatus(Long apartmentId, String status);

    long countByApartmentId(Long apartmentId);

    long countByIsEscalatedToMainAdminTrue();
}
