package com.example.WaterManagement.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "alerts")
public class Alert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "household_id", nullable = false)
    private Household household;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private AlertType type;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String message;

    @CreationTimestamp
    @Column(name = "sent_at", updatable = false)
    private LocalDateTime sentAt;

    @Column(name = "is_read")
    private Boolean isRead = false;

    public Alert() {}

    public Alert(Long id, Household household, AlertType type, String message, LocalDateTime sentAt, Boolean isRead) {
        this.id = id;
        this.household = household;
        this.type = type;
        this.message = message;
        this.sentAt = sentAt;
        this.isRead = isRead != null ? isRead : false;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private Household household;
        private AlertType type;
        private String message;
        private LocalDateTime sentAt;
        private Boolean isRead = false;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder household(Household household) { this.household = household; return this; }
        public Builder type(AlertType type) { this.type = type; return this; }
        public Builder message(String message) { this.message = message; return this; }
        public Builder sentAt(LocalDateTime sentAt) { this.sentAt = sentAt; return this; }
        public Builder isRead(Boolean isRead) { this.isRead = isRead; return this; }

        public Alert build() {
            return new Alert(id, household, type, message, sentAt, isRead);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Household getHousehold() { return household; }
    public void setHousehold(Household household) { this.household = household; }
    public AlertType getType() { return type; }
    public void setType(AlertType type) { this.type = type; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public LocalDateTime getSentAt() { return sentAt; }
    public void setSentAt(LocalDateTime sentAt) { this.sentAt = sentAt; }
    public Boolean getIsRead() { return isRead; }
    public void setIsRead(Boolean isRead) { this.isRead = isRead; }
}
