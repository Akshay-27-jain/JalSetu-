package com.example.WaterManagement.service;

import com.example.WaterManagement.dto.AlertDto;
import com.example.WaterManagement.dto.DashboardDtos;
import com.example.WaterManagement.dto.MeterReadingDtos;
import com.example.WaterManagement.entity.*;
import com.example.WaterManagement.exception.BadRequestException;
import com.example.WaterManagement.exception.DuplicateReadingDateException;
import com.example.WaterManagement.exception.InvalidMeterReadingException;
import com.example.WaterManagement.exception.ResourceNotFoundException;
import com.example.WaterManagement.repository.AlertRepository;
import com.example.WaterManagement.repository.ApartmentRepository;
import com.example.WaterManagement.repository.HouseholdRepository;
import com.example.WaterManagement.repository.WaterUsageLogRepository;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class MeterReadingService {

    private static final Logger log = LoggerFactory.getLogger(MeterReadingService.class);

    private final WaterUsageLogRepository waterUsageLogRepository;
    private final HouseholdRepository householdRepository;
    private final ApartmentRepository apartmentRepository;
    private final AlertRepository alertRepository;
    private final AlertService alertService;

    public MeterReadingService(WaterUsageLogRepository waterUsageLogRepository,
                               HouseholdRepository householdRepository,
                               ApartmentRepository apartmentRepository,
                               AlertRepository alertRepository,
                               AlertService alertService) {
        this.waterUsageLogRepository = waterUsageLogRepository;
        this.householdRepository = householdRepository;
        this.apartmentRepository = apartmentRepository;
        this.alertRepository = alertRepository;
        this.alertService = alertService;
    }

    private static final DateTimeFormatter[] DATE_FORMATTERS = {
            DateTimeFormatter.ISO_LOCAL_DATE,              // 2026-08-20
            DateTimeFormatter.ofPattern("yyyy/MM/dd"),     // 2026/08/20
            DateTimeFormatter.ofPattern("dd-MM-yyyy"),     // 20-08-2026
            DateTimeFormatter.ofPattern("dd/MM/yyyy")      // 20/08/2026
    };

    /**
     * Log a reading for a resident's own household
     */
    @Transactional
    public MeterReadingDtos.MeterReadingResponse logResidentReading(Long householdId, MeterReadingDtos.ResidentMeterReadingRequest request) {
        if (householdId == null) {
            throw new BadRequestException("No household associated with the current user");
        }

        Household household = householdRepository.findById(householdId)
                .orElseThrow(() -> new ResourceNotFoundException("Household not found with ID: " + householdId));

        Double calculatedConsumption = processReadingValidationAndCalculation(household, request.getReadingDate(), request.getMeterReadingKl());

        WaterUsageLog logEntity = WaterUsageLog.builder()
                .household(household)
                .readingDate(request.getReadingDate())
                .meterReadingKl(round2(request.getMeterReadingKl()))
                .consumptionKl(round2(calculatedConsumption))
                .source(UsageSource.MANUAL)
                .build();

        logEntity = waterUsageLogRepository.save(logEntity);

        checkAndTriggerOveruseAlert(household, logEntity.getConsumptionKl(), logEntity.getReadingDate());

        return mapToResponse(logEntity);
    }

    /**
     * Log a reading for a household in a community admin's apartment
     */
    @Transactional
    public MeterReadingDtos.MeterReadingResponse logAdminReading(Long apartmentId, MeterReadingDtos.AdminMeterReadingRequest request) {
        Household household = householdRepository.findById(request.getHouseholdId())
                .orElseThrow(() -> new ResourceNotFoundException("Household not found with ID: " + request.getHouseholdId()));

        if (!household.getApartment().getId().equals(apartmentId)) {
            throw new BadRequestException("Household flat " + household.getFlatNumber() + " does not belong to your apartment");
        }

        Double calculatedConsumption = processReadingValidationAndCalculation(household, request.getReadingDate(), request.getMeterReadingKl());

        WaterUsageLog logEntity = WaterUsageLog.builder()
                .household(household)
                .readingDate(request.getReadingDate())
                .meterReadingKl(round2(request.getMeterReadingKl()))
                .consumptionKl(round2(calculatedConsumption))
                .source(UsageSource.MANUAL)
                .build();

        logEntity = waterUsageLogRepository.save(logEntity);

        checkAndTriggerOveruseAlert(household, logEntity.getConsumptionKl(), logEntity.getReadingDate());

        return mapToResponse(logEntity);
    }

    /**
     * Core validation and consumption calculation logic
     */
    public Double processReadingValidationAndCalculation(Household household, LocalDate readingDate, Double meterReadingKl) {
        // 0. Validate reading date is not in the future
        if (readingDate.isAfter(LocalDate.now())) {
            throw new BadRequestException("Reading date cannot be in the future (" + readingDate + ")");
        }

        // 1. Check duplicate reading date for this household
        if (waterUsageLogRepository.findByHouseholdIdAndReadingDate(household.getId(), readingDate).isPresent()) {
            throw new DuplicateReadingDateException("A reading for date " + readingDate + " already exists for flat " + household.getFlatNumber() + ". Please edit the existing entry instead.");
        }

        // 2. Fetch the most recent prior reading
        Optional<WaterUsageLog> priorLogOpt = waterUsageLogRepository.findFirstByHouseholdIdAndReadingDateLessThanOrderByReadingDateDesc(household.getId(), readingDate);
        if (priorLogOpt.isEmpty()) {
            // Also check latest overall reading if date is later than all existing
            priorLogOpt = waterUsageLogRepository.findFirstByHouseholdIdOrderByReadingDateDesc(household.getId());
        }

        if (priorLogOpt.isPresent()) {
            WaterUsageLog priorLog = priorLogOpt.get();
            if (meterReadingKl < priorLog.getMeterReadingKl()) {
                throw new InvalidMeterReadingException("Meter reading (" + meterReadingKl + " kL) cannot be lower than the previous reading of " + priorLog.getMeterReadingKl() + " kL from " + priorLog.getReadingDate());
            }
            return meterReadingKl - priorLog.getMeterReadingKl();
        } else {
            // First reading ever for this household: baseline is 0.0 kL, so consumption is the entire reading value
            return meterReadingKl;
        }
    }

    /**
     * Bulk CSV Upload with row-by-row validation & partial error capture
     */
    @Transactional
    public MeterReadingDtos.BulkUploadResponse bulkUploadReadings(Long apartmentId, MultipartFile file) {
        if (file.isEmpty()) {
            throw new BadRequestException("Uploaded CSV file is empty");
        }

        int successCount = 0;
        int failureCount = 0;
        int totalRows = 0;
        List<MeterReadingDtos.FailedRowDto> failedRows = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8));
             CSVParser csvParser = new CSVParser(reader, CSVFormat.DEFAULT
                     .builder()
                     .setHeader()
                     .setSkipHeaderRecord(true)
                     .setIgnoreHeaderCase(true)
                     .setTrim(true)
                     .setIgnoreEmptyLines(true)
                     .build())) {

            for (CSVRecord record : csvParser) {
                totalRows++;
                int rowNumber = (int) record.getRecordNumber() + 1; // 1-indexed including header row

                String flatNumber = getRecordValue(record, "flat_number", "flatNumber", "flat");
                String readingDateStr = getRecordValue(record, "reading_date", "readingDate", "date");
                String meterReadingStr = getRecordValue(record, "meter_reading_kl", "meterReadingKl", "meter_reading", "reading");

                if (flatNumber == null || flatNumber.trim().isEmpty()) {
                    failedRows.add(new MeterReadingDtos.FailedRowDto(rowNumber, "", readingDateStr, meterReadingStr, "Missing flat number"));
                    failureCount++;
                    continue;
                }

                if (readingDateStr == null || readingDateStr.trim().isEmpty()) {
                    failedRows.add(new MeterReadingDtos.FailedRowDto(rowNumber, flatNumber, "", meterReadingStr, "Missing reading date"));
                    failureCount++;
                    continue;
                }

                if (meterReadingStr == null || meterReadingStr.trim().isEmpty()) {
                    failedRows.add(new MeterReadingDtos.FailedRowDto(rowNumber, flatNumber, readingDateStr, "", "Missing meter reading"));
                    failureCount++;
                    continue;
                }

                flatNumber = flatNumber.trim().toUpperCase();

                // 1. Lookup household in this apartment
                Optional<Household> householdOpt = householdRepository.findByApartmentIdAndFlatNumber(apartmentId, flatNumber);
                if (householdOpt.isEmpty()) {
                    failedRows.add(new MeterReadingDtos.FailedRowDto(rowNumber, flatNumber, readingDateStr, meterReadingStr, "Flat '" + flatNumber + "' does not exist in this apartment"));
                    failureCount++;
                    continue;
                }
                Household household = householdOpt.get();

                // 2. Parse Date
                LocalDate readingDate;
                try {
                    readingDate = parseDate(readingDateStr.trim());
                } catch (Exception ex) {
                    failedRows.add(new MeterReadingDtos.FailedRowDto(rowNumber, flatNumber, readingDateStr, meterReadingStr, "Invalid date format. Supported formats: YYYY-MM-DD, DD-MM-YYYY"));
                    failureCount++;
                    continue;
                }

                // 3. Parse Meter Reading
                Double meterReadingKl;
                try {
                    meterReadingKl = Double.parseDouble(meterReadingStr.trim());
                    if (meterReadingKl < 0) {
                        throw new IllegalArgumentException("Negative value");
                    }
                } catch (Exception ex) {
                    failedRows.add(new MeterReadingDtos.FailedRowDto(rowNumber, flatNumber, readingDateStr, meterReadingStr, "Invalid meter reading number: " + meterReadingStr));
                    failureCount++;
                    continue;
                }

                // 4. Validate duplicate date & calculate consumption
                try {
                    Double calculatedConsumption = processReadingValidationAndCalculation(household, readingDate, meterReadingKl);

                    WaterUsageLog logEntity = WaterUsageLog.builder()
                            .household(household)
                            .readingDate(readingDate)
                            .meterReadingKl(round2(meterReadingKl))
                            .consumptionKl(round2(calculatedConsumption))
                            .source(UsageSource.CSV)
                            .build();

                    waterUsageLogRepository.save(logEntity);
                    checkAndTriggerOveruseAlert(household, logEntity.getConsumptionKl(), logEntity.getReadingDate());
                    successCount++;
                } catch (DuplicateReadingDateException | InvalidMeterReadingException | BadRequestException ex) {
                    failedRows.add(new MeterReadingDtos.FailedRowDto(rowNumber, flatNumber, readingDateStr, meterReadingStr, ex.getMessage()));
                    failureCount++;
                } catch (Exception ex) {
                    failedRows.add(new MeterReadingDtos.FailedRowDto(rowNumber, flatNumber, readingDateStr, meterReadingStr, "Error: " + ex.getMessage()));
                    failureCount++;
                }
            }

        } catch (Exception ex) {
            log.error("Failed to parse CSV file: {}", ex.getMessage());
            throw new BadRequestException("Failed to parse CSV file: " + ex.getMessage());
        }

        return MeterReadingDtos.BulkUploadResponse.builder()
                .successCount(successCount)
                .failureCount(failureCount)
                .totalProcessed(totalRows)
                .failedRows(failedRows)
                .build();
    }

    private String getRecordValue(CSVRecord record, String... headerAliases) {
        for (String alias : headerAliases) {
            if (record.isMapped(alias)) {
                return record.get(alias);
            }
        }
        return null;
    }

    private LocalDate parseDate(String dateStr) {
        for (DateTimeFormatter formatter : DATE_FORMATTERS) {
            try {
                return LocalDate.parse(dateStr, formatter);
            } catch (DateTimeParseException ignored) {
            }
        }
        throw new IllegalArgumentException("Unable to parse date: " + dateStr);
    }

    private void checkAndTriggerOveruseAlert(Household household, Double consumptionKl, LocalDate date) {
        if (consumptionKl != null && consumptionKl >= 1.2) {
            String message = "High water consumption detected on " + date + ": " + consumptionKl + " kL (Daily Threshold: 1.2 kL). Please inspect faucets, flush valves, or check for leaks.";
            alertService.createAlert(household, AlertType.OVERUSE, message);
        }
    }

    @Transactional(readOnly = true)
    public List<MeterReadingDtos.MeterReadingResponse> getResidentReadings(Long householdId) {
        return waterUsageLogRepository.findByHouseholdIdOrderByReadingDateDesc(householdId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MeterReadingDtos.MeterReadingResponse> getHouseholdReadings(Long apartmentId, Long householdId) {
        Household household = householdRepository.findById(householdId)
                .orElseThrow(() -> new ResourceNotFoundException("Household not found with ID: " + householdId));

        if (!household.getApartment().getId().equals(apartmentId)) {
            throw new BadRequestException("Household does not belong to your apartment");
        }

        return waterUsageLogRepository.findByHouseholdIdOrderByReadingDateDesc(householdId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MeterReadingDtos.MeterReadingResponse> getApartmentReadings(Long apartmentId) {
        return waterUsageLogRepository.findByApartmentIdOrderByReadingDateDesc(apartmentId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DashboardDtos.ResidentDashboardResponse getResidentDashboard(Long householdId) {
        Household household = householdRepository.findById(householdId)
                .orElseThrow(() -> new ResourceNotFoundException("Household not found with ID: " + householdId));

        LocalDate now = LocalDate.now();
        LocalDate firstDayOfMonth = now.withDayOfMonth(1);
        LocalDate lastDayOfMonth = now.plusMonths(1).withDayOfMonth(1).minusDays(1);

        Double currentMonthSum = waterUsageLogRepository.sumConsumptionByHouseholdAndDateBetween(
                householdId, firstDayOfMonth, lastDayOfMonth
        );

        WaterUsageLog latestLog = waterUsageLogRepository.findFirstByHouseholdIdOrderByReadingDateDesc(householdId).orElse(null);

        Double aptSum = waterUsageLogRepository.sumConsumptionByApartmentAndDateBetween(
                household.getApartment().getId(), firstDayOfMonth, lastDayOfMonth
        );
        long aptHouseholds = householdRepository.countByApartmentId(household.getApartment().getId());
        double commAvg = aptHouseholds > 0 && aptSum != null ? (aptSum / aptHouseholds) : 0.0;

        List<WaterUsageLog> recentLogs = waterUsageLogRepository.findByHouseholdIdOrderByReadingDateDesc(householdId);
        List<DashboardDtos.UsageTrendDto> trends = recentLogs.stream()
                .limit(14)
                .sorted(Comparator.comparing(WaterUsageLog::getReadingDate))
                .map(logItem -> DashboardDtos.UsageTrendDto.builder()
                        .label(logItem.getReadingDate().toString())
                        .consumptionKl(logItem.getConsumptionKl())
                        .communityAvgKl(round2(commAvg / 30.0))
                        .build())
                .collect(Collectors.toList());

        List<MeterReadingDtos.MeterReadingResponse> recentResponses = recentLogs.stream()
                .limit(10)
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        List<AlertDto> alerts = alertService.getHouseholdAlerts(householdId);

        return DashboardDtos.ResidentDashboardResponse.builder()
                .householdId(householdId)
                .flatNumber(household.getFlatNumber())
                .meterSerialNumber(household.getMeterSerialNumber())
                .apartmentName(household.getApartment().getName())
                .currentMonthConsumption(round2(currentMonthSum != null ? currentMonthSum : 0.0))
                .lastReadingValue(latestLog != null ? latestLog.getMeterReadingKl() : 0.0)
                .lastReadingDate(latestLog != null ? latestLog.getReadingDate().toString() : "No readings yet")
                .communityAvgConsumption(round2(commAvg))
                .activeAlertsCount(alerts.stream().filter(a -> !a.getIsRead()).count())
                .usageTrends(trends)
                .recentLogs(recentResponses)
                .activeAlerts(alerts)
                .build();
    }

    @Transactional(readOnly = true)
    public DashboardDtos.CommunityAdminDashboardResponse getCommunityAdminDashboard(Long apartmentId) {
        Apartment apartment = apartmentRepository.findById(apartmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Apartment not found with ID: " + apartmentId));

        LocalDate now = LocalDate.now();
        LocalDate firstDayOfMonth = now.withDayOfMonth(1);
        LocalDate lastDayOfMonth = now.plusMonths(1).withDayOfMonth(1).minusDays(1);

        long totalHouseholds = householdRepository.countByApartmentId(apartmentId);
        long meteredHouseholds = householdRepository.countByApartmentIdAndHasMeterTrue(apartmentId);

        Double currentMonthSum = waterUsageLogRepository.sumConsumptionByApartmentAndDateBetween(
                apartmentId, firstDayOfMonth, lastDayOfMonth
        );
        double totalMonthKl = currentMonthSum != null ? currentMonthSum : 0.0;
        int dayOfMonth = now.getDayOfMonth();
        double avgDaily = dayOfMonth > 0 ? (totalMonthKl / dayOfMonth) : 0.0;

        List<Object[]> topConsumerRows = waterUsageLogRepository.findTopConsumersByApartmentSince(apartmentId, firstDayOfMonth);
        List<DashboardDtos.TopConsumerDto> topConsumers = topConsumerRows.stream()
                .limit(6)
                .map(row -> DashboardDtos.TopConsumerDto.builder()
                        .householdId(((Number) row[0]).longValue())
                        .flatNumber((String) row[1])
                        .consumptionKl(round2(((Number) row[2]).doubleValue()))
                        .build())
                .collect(Collectors.toList());

        List<MeterReadingDtos.MeterReadingResponse> recentLogs = waterUsageLogRepository.findByApartmentIdOrderByReadingDateDesc(apartmentId)
                .stream()
                .limit(10)
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        List<AlertDto> alerts = alertService.getApartmentAlerts(apartmentId);

        return DashboardDtos.CommunityAdminDashboardResponse.builder()
                .apartmentId(apartmentId)
                .apartmentName(apartment.getName())
                .totalHouseholds(totalHouseholds)
                .meteredHouseholds(meteredHouseholds)
                .currentMonthConsumption(round2(totalMonthKl))
                .avgDailyUsage(round2(avgDaily))
                .activeAlertsCount(alerts.stream().filter(a -> !a.getIsRead()).count())
                .topConsumers(topConsumers)
                .recentLogs(recentLogs)
                .activeAlerts(alerts)
                .build();
    }

    public MeterReadingDtos.MeterReadingResponse mapToResponse(WaterUsageLog logEntity) {
        String status = (logEntity.getConsumptionKl() != null && logEntity.getConsumptionKl() >= 1.2) ? "Overuse" : "Normal";

        return MeterReadingDtos.MeterReadingResponse.builder()
                .id(logEntity.getId())
                .householdId(logEntity.getHousehold().getId())
                .flatNumber(logEntity.getHousehold().getFlatNumber())
                .meterSerialNumber(logEntity.getHousehold().getMeterSerialNumber())
                .apartmentName(logEntity.getHousehold().getApartment().getName())
                .readingDate(logEntity.getReadingDate())
                .meterReadingKl(logEntity.getMeterReadingKl())
                .consumptionKl(logEntity.getConsumptionKl())
                .source(logEntity.getSource())
                .status(status)
                .createdAt(logEntity.getCreatedAt())
                .build();
    }

    private Double round2(Double val) {
        if (val == null) return 0.0;
        return Math.round(val * 100.0) / 100.0;
    }
}
