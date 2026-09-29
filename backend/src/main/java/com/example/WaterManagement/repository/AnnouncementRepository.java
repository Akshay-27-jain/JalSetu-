package com.example.WaterManagement.repository;

import com.example.WaterManagement.entity.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {

    @Query("SELECT a FROM Announcement a LEFT JOIN FETCH a.apartment WHERE a.apartment.id = :apartmentId OR (a.isMainAdminBroadcast = true AND (a.targetApartmentId IS NULL OR a.targetApartmentId = :apartmentId)) ORDER BY a.isPinned DESC, a.publishDate DESC, a.createdAt DESC")
    List<Announcement> findAllByApartmentIdOrMainAdminBroadcast(@Param("apartmentId") Long apartmentId);

    @Query("SELECT a FROM Announcement a LEFT JOIN FETCH a.apartment WHERE (a.apartment.id = :apartmentId OR (a.isMainAdminBroadcast = true AND (a.targetApartmentId IS NULL OR a.targetApartmentId = :apartmentId))) AND (a.expiryDate IS NULL OR a.expiryDate >= CURRENT_DATE) ORDER BY a.isPinned DESC, a.publishDate DESC, a.createdAt DESC")
    List<Announcement> findActiveByApartmentIdOrMainAdminBroadcast(@Param("apartmentId") Long apartmentId);

    @Query("SELECT a FROM Announcement a LEFT JOIN FETCH a.apartment WHERE a.apartment.id = :apartmentId AND (a.expiryDate IS NULL OR a.expiryDate >= CURRENT_DATE) ORDER BY a.isPinned DESC, a.publishDate DESC, a.createdAt DESC")
    List<Announcement> findActiveByApartmentId(@Param("apartmentId") Long apartmentId);

    List<Announcement> findByApartmentId(Long apartmentId);

    @Query("SELECT a FROM Announcement a LEFT JOIN FETCH a.apartment WHERE a.isMainAdminBroadcast = true ORDER BY a.createdAt DESC")
    List<Announcement> findAllMainAdminBroadcasts();
}
