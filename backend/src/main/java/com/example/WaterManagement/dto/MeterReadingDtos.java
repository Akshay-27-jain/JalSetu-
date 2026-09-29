package com.example.WaterManagement.dto;

import com.example.WaterManagement.entity.UsageSource;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class MeterReadingDtos {

    public static class ResidentMeterReadingRequest {
        @NotNull(message = "Reading date is required")
        @PastOrPresent(message = "Reading date cannot be in the future")
        private LocalDate readingDate;

        @NotNull(message = "Meter reading is required")
        @DecimalMin(value = "0.0", inclusive = true, message = "Meter reading cannot be negative")
        private Double meterReadingKl;

        public ResidentMeterReadingRequest() {}

        public ResidentMeterReadingRequest(LocalDate readingDate, Double meterReadingKl) {
            this.readingDate = readingDate;
            this.meterReadingKl = meterReadingKl;
        }

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private LocalDate readingDate;
            private Double meterReadingKl;

            public Builder readingDate(LocalDate readingDate) { this.readingDate = readingDate; return this; }
            public Builder meterReadingKl(Double meterReadingKl) { this.meterReadingKl = meterReadingKl; return this; }

            public ResidentMeterReadingRequest build() {
                return new ResidentMeterReadingRequest(readingDate, meterReadingKl);
            }
        }

        public LocalDate getReadingDate() { return readingDate; }
        public void setReadingDate(LocalDate readingDate) { this.readingDate = readingDate; }
        public Double getMeterReadingKl() { return meterReadingKl; }
        public void setMeterReadingKl(Double meterReadingKl) { this.meterReadingKl = meterReadingKl; }
    }

    public static class AdminMeterReadingRequest {
        @NotNull(message = "Household ID is required")
        private Long householdId;

        @NotNull(message = "Reading date is required")
        @PastOrPresent(message = "Reading date cannot be in the future")
        private LocalDate readingDate;

        @NotNull(message = "Meter reading is required")
        @DecimalMin(value = "0.0", inclusive = true, message = "Meter reading cannot be negative")
        private Double meterReadingKl;

        public AdminMeterReadingRequest() {}

        public AdminMeterReadingRequest(Long householdId, LocalDate readingDate, Double meterReadingKl) {
            this.householdId = householdId;
            this.readingDate = readingDate;
            this.meterReadingKl = meterReadingKl;
        }

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private Long householdId;
            private LocalDate readingDate;
            private Double meterReadingKl;

            public Builder householdId(Long householdId) { this.householdId = householdId; return this; }
            public Builder readingDate(LocalDate readingDate) { this.readingDate = readingDate; return this; }
            public Builder meterReadingKl(Double meterReadingKl) { this.meterReadingKl = meterReadingKl; return this; }

            public AdminMeterReadingRequest build() {
                return new AdminMeterReadingRequest(householdId, readingDate, meterReadingKl);
            }
        }

        public Long getHouseholdId() { return householdId; }
        public void setHouseholdId(Long householdId) { this.householdId = householdId; }
        public LocalDate getReadingDate() { return readingDate; }
        public void setReadingDate(LocalDate readingDate) { this.readingDate = readingDate; }
        public Double getMeterReadingKl() { return meterReadingKl; }
        public void setMeterReadingKl(Double meterReadingKl) { this.meterReadingKl = meterReadingKl; }
    }

    public static class MeterReadingResponse {
        private Long id;
        private Long householdId;
        private String flatNumber;
        private String meterSerialNumber;
        private String apartmentName;
        private LocalDate readingDate;
        private Double meterReadingKl;
        private Double consumptionKl;
        private UsageSource source;
        private String status;
        private LocalDateTime createdAt;

        public MeterReadingResponse() {}

        public MeterReadingResponse(Long id, Long householdId, String flatNumber, String meterSerialNumber, String apartmentName, LocalDate readingDate, Double meterReadingKl, Double consumptionKl, UsageSource source, String status, LocalDateTime createdAt) {
            this.id = id;
            this.householdId = householdId;
            this.flatNumber = flatNumber;
            this.meterSerialNumber = meterSerialNumber;
            this.apartmentName = apartmentName;
            this.readingDate = readingDate;
            this.meterReadingKl = meterReadingKl;
            this.consumptionKl = consumptionKl;
            this.source = source;
            this.status = status;
            this.createdAt = createdAt;
        }

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private Long id;
            private Long householdId;
            private String flatNumber;
            private String meterSerialNumber;
            private String apartmentName;
            private LocalDate readingDate;
            private Double meterReadingKl;
            private Double consumptionKl;
            private UsageSource source;
            private String status;
            private LocalDateTime createdAt;

            public Builder id(Long id) { this.id = id; return this; }
            public Builder householdId(Long householdId) { this.householdId = householdId; return this; }
            public Builder flatNumber(String flatNumber) { this.flatNumber = flatNumber; return this; }
            public Builder meterSerialNumber(String meterSerialNumber) { this.meterSerialNumber = meterSerialNumber; return this; }
            public Builder apartmentName(String apartmentName) { this.apartmentName = apartmentName; return this; }
            public Builder readingDate(LocalDate readingDate) { this.readingDate = readingDate; return this; }
            public Builder meterReadingKl(Double meterReadingKl) { this.meterReadingKl = meterReadingKl; return this; }
            public Builder consumptionKl(Double consumptionKl) { this.consumptionKl = consumptionKl; return this; }
            public Builder source(UsageSource source) { this.source = source; return this; }
            public Builder status(String status) { this.status = status; return this; }
            public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

            public MeterReadingResponse build() {
                return new MeterReadingResponse(id, householdId, flatNumber, meterSerialNumber, apartmentName, readingDate, meterReadingKl, consumptionKl, source, status, createdAt);
            }
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getHouseholdId() { return householdId; }
        public void setHouseholdId(Long householdId) { this.householdId = householdId; }
        public String getFlatNumber() { return flatNumber; }
        public void setFlatNumber(String flatNumber) { this.flatNumber = flatNumber; }
        public String getMeterSerialNumber() { return meterSerialNumber; }
        public void setMeterSerialNumber(String meterSerialNumber) { this.meterSerialNumber = meterSerialNumber; }
        public String getApartmentName() { return apartmentName; }
        public void setApartmentName(String apartmentName) { this.apartmentName = apartmentName; }
        public LocalDate getReadingDate() { return readingDate; }
        public void setReadingDate(LocalDate readingDate) { this.readingDate = readingDate; }
        public Double getMeterReadingKl() { return meterReadingKl; }
        public void setMeterReadingKl(Double meterReadingKl) { this.meterReadingKl = meterReadingKl; }
        public Double getConsumptionKl() { return consumptionKl; }
        public void setConsumptionKl(Double consumptionKl) { this.consumptionKl = consumptionKl; }
        public UsageSource getSource() { return source; }
        public void setSource(UsageSource source) { this.source = source; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    }

    public static class FailedRowDto {
        private int row;
        private String flatNumber;
        private String readingDate;
        private String meterReading;
        private String reason;

        public FailedRowDto() {}

        public FailedRowDto(int row, String flatNumber, String readingDate, String meterReading, String reason) {
            this.row = row;
            this.flatNumber = flatNumber;
            this.readingDate = readingDate;
            this.meterReading = meterReading;
            this.reason = reason;
        }

        public int getRow() { return row; }
        public void setRow(int row) { this.row = row; }
        public String getFlatNumber() { return flatNumber; }
        public void setFlatNumber(String flatNumber) { this.flatNumber = flatNumber; }
        public String getReadingDate() { return readingDate; }
        public void setReadingDate(String readingDate) { this.readingDate = readingDate; }
        public String getMeterReading() { return meterReading; }
        public void setMeterReading(String meterReading) { this.meterReading = meterReading; }
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }

    public static class BulkUploadResponse {
        private int successCount;
        private int failureCount;
        private int totalProcessed;
        private List<FailedRowDto> failedRows = new ArrayList<>();

        public BulkUploadResponse() {}

        public BulkUploadResponse(int successCount, int failureCount, int totalProcessed, List<FailedRowDto> failedRows) {
            this.successCount = successCount;
            this.failureCount = failureCount;
            this.totalProcessed = totalProcessed;
            if (failedRows != null) {
                this.failedRows = failedRows;
            }
        }

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private int successCount;
            private int failureCount;
            private int totalProcessed;
            private List<FailedRowDto> failedRows = new ArrayList<>();

            public Builder successCount(int successCount) { this.successCount = successCount; return this; }
            public Builder failureCount(int failureCount) { this.failureCount = failureCount; return this; }
            public Builder totalProcessed(int totalProcessed) { this.totalProcessed = totalProcessed; return this; }
            public Builder failedRows(List<FailedRowDto> failedRows) { this.failedRows = failedRows; return this; }

            public BulkUploadResponse build() {
                return new BulkUploadResponse(successCount, failureCount, totalProcessed, failedRows);
            }
        }

        public int getSuccessCount() { return successCount; }
        public void setSuccessCount(int successCount) { this.successCount = successCount; }
        public int getFailureCount() { return failureCount; }
        public void setFailureCount(int failureCount) { this.failureCount = failureCount; }
        public int getTotalProcessed() { return totalProcessed; }
        public void setTotalProcessed(int totalProcessed) { this.totalProcessed = totalProcessed; }
        public List<FailedRowDto> getFailedRows() { return failedRows; }
        public void setFailedRows(List<FailedRowDto> failedRows) { this.failedRows = failedRows; }
    }

    public static class HouseholdReadingStatsDto {
        private Double currentMonthConsumption;
        private Double totalConsumption;
        private Double averageDailyConsumption;
        private Long totalReadings;
        private LocalDate lastReadingDate;
        private Double lastReadingValue;

        public HouseholdReadingStatsDto() {}

        public HouseholdReadingStatsDto(Double currentMonthConsumption, Double totalConsumption, Double averageDailyConsumption, Long totalReadings, LocalDate lastReadingDate, Double lastReadingValue) {
            this.currentMonthConsumption = currentMonthConsumption;
            this.totalConsumption = totalConsumption;
            this.averageDailyConsumption = averageDailyConsumption;
            this.totalReadings = totalReadings;
            this.lastReadingDate = lastReadingDate;
            this.lastReadingValue = lastReadingValue;
        }

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private Double currentMonthConsumption;
            private Double totalConsumption;
            private Double averageDailyConsumption;
            private Long totalReadings;
            private LocalDate lastReadingDate;
            private Double lastReadingValue;

            public Builder currentMonthConsumption(Double currentMonthConsumption) { this.currentMonthConsumption = currentMonthConsumption; return this; }
            public Builder totalConsumption(Double totalConsumption) { this.totalConsumption = totalConsumption; return this; }
            public Builder averageDailyConsumption(Double averageDailyConsumption) { this.averageDailyConsumption = averageDailyConsumption; return this; }
            public Builder totalReadings(Long totalReadings) { this.totalReadings = totalReadings; return this; }
            public Builder lastReadingDate(LocalDate lastReadingDate) { this.lastReadingDate = lastReadingDate; return this; }
            public Builder lastReadingValue(Double lastReadingValue) { this.lastReadingValue = lastReadingValue; return this; }

            public HouseholdReadingStatsDto build() {
                return new HouseholdReadingStatsDto(currentMonthConsumption, totalConsumption, averageDailyConsumption, totalReadings, lastReadingDate, lastReadingValue);
            }
        }

        public Double getCurrentMonthConsumption() { return currentMonthConsumption; }
        public void setCurrentMonthConsumption(Double currentMonthConsumption) { this.currentMonthConsumption = currentMonthConsumption; }
        public Double getTotalConsumption() { return totalConsumption; }
        public void setTotalConsumption(Double totalConsumption) { this.totalConsumption = totalConsumption; }
        public Double getAverageDailyConsumption() { return averageDailyConsumption; }
        public void setAverageDailyConsumption(Double averageDailyConsumption) { this.averageDailyConsumption = averageDailyConsumption; }
        public Long getTotalReadings() { return totalReadings; }
        public void setTotalReadings(Long totalReadings) { this.totalReadings = totalReadings; }
        public LocalDate getLastReadingDate() { return lastReadingDate; }
        public void setLastReadingDate(LocalDate lastReadingDate) { this.lastReadingDate = lastReadingDate; }
        public Double getLastReadingValue() { return lastReadingValue; }
        public void setLastReadingValue(Double lastReadingValue) { this.lastReadingValue = lastReadingValue; }
    }
}
