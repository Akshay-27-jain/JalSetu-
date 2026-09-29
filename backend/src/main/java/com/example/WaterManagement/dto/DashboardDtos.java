package com.example.WaterManagement.dto;

import java.util.ArrayList;
import java.util.List;

public class DashboardDtos {

    public static class TopConsumerDto {
        private Long householdId;
        private String flatNumber;
        private Double consumptionKl;

        public TopConsumerDto() {}

        public TopConsumerDto(Long householdId, String flatNumber, Double consumptionKl) {
            this.householdId = householdId;
            this.flatNumber = flatNumber;
            this.consumptionKl = consumptionKl;
        }

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private Long householdId;
            private String flatNumber;
            private Double consumptionKl;

            public Builder householdId(Long householdId) { this.householdId = householdId; return this; }
            public Builder flatNumber(String flatNumber) { this.flatNumber = flatNumber; return this; }
            public Builder consumptionKl(Double consumptionKl) { this.consumptionKl = consumptionKl; return this; }

            public TopConsumerDto build() {
                return new TopConsumerDto(householdId, flatNumber, consumptionKl);
            }
        }

        public Long getHouseholdId() { return householdId; }
        public void setHouseholdId(Long householdId) { this.householdId = householdId; }
        public String getFlatNumber() { return flatNumber; }
        public void setFlatNumber(String flatNumber) { this.flatNumber = flatNumber; }
        public Double getConsumptionKl() { return consumptionKl; }
        public void setConsumptionKl(Double consumptionKl) { this.consumptionKl = consumptionKl; }
    }

    public static class UsageTrendDto {
        private String label;
        private Double consumptionKl;
        private Double communityAvgKl;

        public UsageTrendDto() {}

        public UsageTrendDto(String label, Double consumptionKl, Double communityAvgKl) {
            this.label = label;
            this.consumptionKl = consumptionKl;
            this.communityAvgKl = communityAvgKl;
        }

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private String label;
            private Double consumptionKl;
            private Double communityAvgKl;

            public Builder label(String label) { this.label = label; return this; }
            public Builder consumptionKl(Double consumptionKl) { this.consumptionKl = consumptionKl; return this; }
            public Builder communityAvgKl(Double communityAvgKl) { this.communityAvgKl = communityAvgKl; return this; }

            public UsageTrendDto build() {
                return new UsageTrendDto(label, consumptionKl, communityAvgKl);
            }
        }

        public String getLabel() { return label; }
        public void setLabel(String label) { this.label = label; }
        public Double getConsumptionKl() { return consumptionKl; }
        public void setConsumptionKl(Double consumptionKl) { this.consumptionKl = consumptionKl; }
        public Double getCommunityAvgKl() { return communityAvgKl; }
        public void setCommunityAvgKl(Double communityAvgKl) { this.communityAvgKl = communityAvgKl; }
    }

    public static class CommunityAdminDashboardResponse {
        private Long apartmentId;
        private String apartmentName;
        private long totalHouseholds;
        private long meteredHouseholds;
        private double currentMonthConsumption;
        private double avgDailyUsage;
        private long activeAlertsCount;
        private List<TopConsumerDto> topConsumers = new ArrayList<>();
        private List<MeterReadingDtos.MeterReadingResponse> recentLogs = new ArrayList<>();
        private List<AlertDto> activeAlerts = new ArrayList<>();

        public CommunityAdminDashboardResponse() {}

        public CommunityAdminDashboardResponse(Long apartmentId, String apartmentName, long totalHouseholds, long meteredHouseholds, double currentMonthConsumption, double avgDailyUsage, long activeAlertsCount, List<TopConsumerDto> topConsumers, List<MeterReadingDtos.MeterReadingResponse> recentLogs, List<AlertDto> activeAlerts) {
            this.apartmentId = apartmentId;
            this.apartmentName = apartmentName;
            this.totalHouseholds = totalHouseholds;
            this.meteredHouseholds = meteredHouseholds;
            this.currentMonthConsumption = currentMonthConsumption;
            this.avgDailyUsage = avgDailyUsage;
            this.activeAlertsCount = activeAlertsCount;
            if (topConsumers != null) this.topConsumers = topConsumers;
            if (recentLogs != null) this.recentLogs = recentLogs;
            if (activeAlerts != null) this.activeAlerts = activeAlerts;
        }

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private Long apartmentId;
            private String apartmentName;
            private long totalHouseholds;
            private long meteredHouseholds;
            private double currentMonthConsumption;
            private double avgDailyUsage;
            private long activeAlertsCount;
            private List<TopConsumerDto> topConsumers = new ArrayList<>();
            private List<MeterReadingDtos.MeterReadingResponse> recentLogs = new ArrayList<>();
            private List<AlertDto> activeAlerts = new ArrayList<>();

            public Builder apartmentId(Long apartmentId) { this.apartmentId = apartmentId; return this; }
            public Builder apartmentName(String apartmentName) { this.apartmentName = apartmentName; return this; }
            public Builder totalHouseholds(long totalHouseholds) { this.totalHouseholds = totalHouseholds; return this; }
            public Builder meteredHouseholds(long meteredHouseholds) { this.meteredHouseholds = meteredHouseholds; return this; }
            public Builder currentMonthConsumption(double currentMonthConsumption) { this.currentMonthConsumption = currentMonthConsumption; return this; }
            public Builder avgDailyUsage(double avgDailyUsage) { this.avgDailyUsage = avgDailyUsage; return this; }
            public Builder activeAlertsCount(long activeAlertsCount) { this.activeAlertsCount = activeAlertsCount; return this; }
            public Builder topConsumers(List<TopConsumerDto> topConsumers) { this.topConsumers = topConsumers; return this; }
            public Builder recentLogs(List<MeterReadingDtos.MeterReadingResponse> recentLogs) { this.recentLogs = recentLogs; return this; }
            public Builder activeAlerts(List<AlertDto> activeAlerts) { this.activeAlerts = activeAlerts; return this; }

            public CommunityAdminDashboardResponse build() {
                return new CommunityAdminDashboardResponse(apartmentId, apartmentName, totalHouseholds, meteredHouseholds, currentMonthConsumption, avgDailyUsage, activeAlertsCount, topConsumers, recentLogs, activeAlerts);
            }
        }

        public Long getApartmentId() { return apartmentId; }
        public void setApartmentId(Long apartmentId) { this.apartmentId = apartmentId; }
        public String getApartmentName() { return apartmentName; }
        public void setApartmentName(String apartmentName) { this.apartmentName = apartmentName; }
        public long getTotalHouseholds() { return totalHouseholds; }
        public void setTotalHouseholds(long totalHouseholds) { this.totalHouseholds = totalHouseholds; }
        public long getMeteredHouseholds() { return meteredHouseholds; }
        public void setMeteredHouseholds(long meteredHouseholds) { this.meteredHouseholds = meteredHouseholds; }
        public double getCurrentMonthConsumption() { return currentMonthConsumption; }
        public void setCurrentMonthConsumption(double currentMonthConsumption) { this.currentMonthConsumption = currentMonthConsumption; }
        public double getAvgDailyUsage() { return avgDailyUsage; }
        public void setAvgDailyUsage(double avgDailyUsage) { this.avgDailyUsage = avgDailyUsage; }
        public long getActiveAlertsCount() { return activeAlertsCount; }
        public void setActiveAlertsCount(long activeAlertsCount) { this.activeAlertsCount = activeAlertsCount; }
        public List<TopConsumerDto> getTopConsumers() { return topConsumers; }
        public void setTopConsumers(List<TopConsumerDto> topConsumers) { this.topConsumers = topConsumers; }
        public List<MeterReadingDtos.MeterReadingResponse> getRecentLogs() { return recentLogs; }
        public void setRecentLogs(List<MeterReadingDtos.MeterReadingResponse> recentLogs) { this.recentLogs = recentLogs; }
        public List<AlertDto> getActiveAlerts() { return activeAlerts; }
        public void setActiveAlerts(List<AlertDto> activeAlerts) { this.activeAlerts = activeAlerts; }
    }

    public static class ResidentDashboardResponse {
        private Long householdId;
        private String flatNumber;
        private String meterSerialNumber;
        private String apartmentName;
        private Double currentMonthConsumption;
        private Double lastReadingValue;
        private String lastReadingDate;
        private Double communityAvgConsumption;
        private long activeAlertsCount;
        private List<UsageTrendDto> usageTrends = new ArrayList<>();
        private List<MeterReadingDtos.MeterReadingResponse> recentLogs = new ArrayList<>();
        private List<AlertDto> activeAlerts = new ArrayList<>();

        public ResidentDashboardResponse() {}

        public ResidentDashboardResponse(Long householdId, String flatNumber, String meterSerialNumber, String apartmentName, Double currentMonthConsumption, Double lastReadingValue, String lastReadingDate, Double communityAvgConsumption, long activeAlertsCount, List<UsageTrendDto> usageTrends, List<MeterReadingDtos.MeterReadingResponse> recentLogs, List<AlertDto> activeAlerts) {
            this.householdId = householdId;
            this.flatNumber = flatNumber;
            this.meterSerialNumber = meterSerialNumber;
            this.apartmentName = apartmentName;
            this.currentMonthConsumption = currentMonthConsumption;
            this.lastReadingValue = lastReadingValue;
            this.lastReadingDate = lastReadingDate;
            this.communityAvgConsumption = communityAvgConsumption;
            this.activeAlertsCount = activeAlertsCount;
            if (usageTrends != null) this.usageTrends = usageTrends;
            if (recentLogs != null) this.recentLogs = recentLogs;
            if (activeAlerts != null) this.activeAlerts = activeAlerts;
        }

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private Long householdId;
            private String flatNumber;
            private String meterSerialNumber;
            private String apartmentName;
            private Double currentMonthConsumption;
            private Double lastReadingValue;
            private String lastReadingDate;
            private Double communityAvgConsumption;
            private long activeAlertsCount;
            private List<UsageTrendDto> usageTrends = new ArrayList<>();
            private List<MeterReadingDtos.MeterReadingResponse> recentLogs = new ArrayList<>();
            private List<AlertDto> activeAlerts = new ArrayList<>();

            public Builder householdId(Long householdId) { this.householdId = householdId; return this; }
            public Builder flatNumber(String flatNumber) { this.flatNumber = flatNumber; return this; }
            public Builder meterSerialNumber(String meterSerialNumber) { this.meterSerialNumber = meterSerialNumber; return this; }
            public Builder apartmentName(String apartmentName) { this.apartmentName = apartmentName; return this; }
            public Builder currentMonthConsumption(Double currentMonthConsumption) { this.currentMonthConsumption = currentMonthConsumption; return this; }
            public Builder lastReadingValue(Double lastReadingValue) { this.lastReadingValue = lastReadingValue; return this; }
            public Builder lastReadingDate(String lastReadingDate) { this.lastReadingDate = lastReadingDate; return this; }
            public Builder communityAvgConsumption(Double communityAvgConsumption) { this.communityAvgConsumption = communityAvgConsumption; return this; }
            public Builder activeAlertsCount(long activeAlertsCount) { this.activeAlertsCount = activeAlertsCount; return this; }
            public Builder usageTrends(List<UsageTrendDto> usageTrends) { this.usageTrends = usageTrends; return this; }
            public Builder recentLogs(List<MeterReadingDtos.MeterReadingResponse> recentLogs) { this.recentLogs = recentLogs; return this; }
            public Builder activeAlerts(List<AlertDto> activeAlerts) { this.activeAlerts = activeAlerts; return this; }

            public ResidentDashboardResponse build() {
                return new ResidentDashboardResponse(householdId, flatNumber, meterSerialNumber, apartmentName, currentMonthConsumption, lastReadingValue, lastReadingDate, communityAvgConsumption, activeAlertsCount, usageTrends, recentLogs, activeAlerts);
            }
        }

        public Long getHouseholdId() { return householdId; }
        public void setHouseholdId(Long householdId) { this.householdId = householdId; }
        public String getFlatNumber() { return flatNumber; }
        public void setFlatNumber(String flatNumber) { this.flatNumber = flatNumber; }
        public String getMeterSerialNumber() { return meterSerialNumber; }
        public void setMeterSerialNumber(String meterSerialNumber) { this.meterSerialNumber = meterSerialNumber; }
        public String getApartmentName() { return apartmentName; }
        public void setApartmentName(String apartmentName) { this.apartmentName = apartmentName; }
        public Double getCurrentMonthConsumption() { return currentMonthConsumption; }
        public void setCurrentMonthConsumption(Double currentMonthConsumption) { this.currentMonthConsumption = currentMonthConsumption; }
        public Double getLastReadingValue() { return lastReadingValue; }
        public void setLastReadingValue(Double lastReadingValue) { this.lastReadingValue = lastReadingValue; }
        public String getLastReadingDate() { return lastReadingDate; }
        public void setLastReadingDate(String lastReadingDate) { this.lastReadingDate = lastReadingDate; }
        public Double getCommunityAvgConsumption() { return communityAvgConsumption; }
        public void setCommunityAvgConsumption(Double communityAvgConsumption) { this.communityAvgConsumption = communityAvgConsumption; }
        public long getActiveAlertsCount() { return activeAlertsCount; }
        public void setActiveAlertsCount(long activeAlertsCount) { this.activeAlertsCount = activeAlertsCount; }
        public List<UsageTrendDto> getUsageTrends() { return usageTrends; }
        public void setUsageTrends(List<UsageTrendDto> usageTrends) { this.usageTrends = usageTrends; }
        public List<MeterReadingDtos.MeterReadingResponse> getRecentLogs() { return recentLogs; }
        public void setRecentLogs(List<MeterReadingDtos.MeterReadingResponse> recentLogs) { this.recentLogs = recentLogs; }
        public List<AlertDto> getActiveAlerts() { return activeAlerts; }
        public void setActiveAlerts(List<AlertDto> activeAlerts) { this.activeAlerts = activeAlerts; }
    }
}
