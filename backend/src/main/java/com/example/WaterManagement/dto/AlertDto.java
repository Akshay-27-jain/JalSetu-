package com.example.WaterManagement.dto;

import com.example.WaterManagement.entity.AlertType;

import java.time.LocalDateTime;

public class AlertDto {
    private Long id;
    private Long householdId;
    private String flatNumber;
    private AlertType type;
    private String message;
    private LocalDateTime sentAt;
    private Boolean isRead;

    public AlertDto() {}

    public AlertDto(Long id, Long householdId, String flatNumber, AlertType type, String message, LocalDateTime sentAt, Boolean isRead) {
        this.id = id;
        this.householdId = householdId;
        this.flatNumber = flatNumber;
        this.type = type;
        this.message = message;
        this.sentAt = sentAt;
        this.isRead = isRead != null ? isRead : false;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private Long householdId;
        private String flatNumber;
        private AlertType type;
        private String message;
        private LocalDateTime sentAt;
        private Boolean isRead = false;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder householdId(Long householdId) { this.householdId = householdId; return this; }
        public Builder flatNumber(String flatNumber) { this.flatNumber = flatNumber; return this; }
        public Builder type(AlertType type) { this.type = type; return this; }
        public Builder message(String message) { this.message = message; return this; }
        public Builder sentAt(LocalDateTime sentAt) { this.sentAt = sentAt; return this; }
        public Builder isRead(Boolean isRead) { this.isRead = isRead; return this; }

        public AlertDto build() {
            return new AlertDto(id, householdId, flatNumber, type, message, sentAt, isRead);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getHouseholdId() { return householdId; }
    public void setHouseholdId(Long householdId) { this.householdId = householdId; }
    public String getFlatNumber() { return flatNumber; }
    public void setFlatNumber(String flatNumber) { this.flatNumber = flatNumber; }
    public AlertType getType() { return type; }
    public void setType(AlertType type) { this.type = type; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public LocalDateTime getSentAt() { return sentAt; }
    public void setSentAt(LocalDateTime sentAt) { this.sentAt = sentAt; }
    public Boolean getIsRead() { return isRead; }
    public void setIsRead(Boolean isRead) { this.isRead = isRead; }
}
