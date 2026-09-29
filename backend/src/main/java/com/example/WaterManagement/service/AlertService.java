package com.example.WaterManagement.service;

import com.example.WaterManagement.dto.AlertDto;
import com.example.WaterManagement.entity.Alert;
import com.example.WaterManagement.entity.AlertType;
import com.example.WaterManagement.entity.Household;
import com.example.WaterManagement.exception.ResourceNotFoundException;
import com.example.WaterManagement.repository.AlertRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AlertService {

    private final AlertRepository alertRepository;

    public AlertService(AlertRepository alertRepository) {
        this.alertRepository = alertRepository;
    }

    @Transactional
    public Alert createAlert(Household household, AlertType type, String message) {
        Alert alert = Alert.builder()
                .household(household)
                .type(type)
                .message(message)
                .isRead(false)
                .build();
        return alertRepository.save(alert);
    }

    @Transactional(readOnly = true)
    public List<AlertDto> getHouseholdAlerts(Long householdId) {
        return alertRepository.findByHouseholdIdOrderBySentAtDesc(householdId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AlertDto> getApartmentAlerts(Long apartmentId) {
        return alertRepository.findByApartmentIdOrderBySentAtDesc(apartmentId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void markAsRead(Long alertId, Long householdId) {
        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new ResourceNotFoundException("Alert not found with ID: " + alertId));
        if (householdId != null && !alert.getHousehold().getId().equals(householdId)) {
            throw new ResourceNotFoundException("Alert does not belong to your household");
        }
        alert.setIsRead(true);
        alertRepository.save(alert);
    }

    public AlertDto mapToDto(Alert alert) {
        return AlertDto.builder()
                .id(alert.getId())
                .householdId(alert.getHousehold().getId())
                .flatNumber(alert.getHousehold().getFlatNumber())
                .type(alert.getType())
                .message(alert.getMessage())
                .sentAt(alert.getSentAt())
                .isRead(alert.getIsRead())
                .build();
    }
}
