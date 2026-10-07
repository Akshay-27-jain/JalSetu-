package com.example.WaterManagement.service;

import com.example.WaterManagement.dto.MeterReadingDtos;
import com.example.WaterManagement.entity.*;
import com.example.WaterManagement.exception.DuplicateReadingDateException;
import com.example.WaterManagement.exception.InvalidMeterReadingException;
import com.example.WaterManagement.repository.AlertRepository;
import com.example.WaterManagement.repository.ApartmentRepository;
import com.example.WaterManagement.repository.HouseholdRepository;
import com.example.WaterManagement.repository.WaterUsageLogRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class MeterReadingServiceTest {

    @Mock
    private WaterUsageLogRepository waterUsageLogRepository;

    @Mock
    private HouseholdRepository householdRepository;

    @Mock
    private ApartmentRepository apartmentRepository;

    @Mock
    private AlertRepository alertRepository;

    @Mock
    private AlertService alertService;

    @InjectMocks
    private MeterReadingService meterReadingService;

    private Apartment apartment;
    private Household household;

    @BeforeEach
    void setUp() {
        apartment = Apartment.builder()
                .id(1L)
                .name("Palm Meadows")
                .address("Sector 4")
                .totalHouseholds(10)
                .build();

        household = Household.builder()
                .id(101L)
                .apartment(apartment)
                .flatNumber("A-101")
                .areaSqft(1200.0)
                .occupancyCount(3)
                .hasMeter(true)
                .inviteCode("INV-PALM-A101-1234")
                .build();
    }

    @Test
    @DisplayName("Initial meter reading should calculate consumption from 0.0 kL baseline")
    void testFirstMeterReading_CalculatesConsumptionFromZeroBaseline() {
        LocalDate date = LocalDate.of(2026, 8, 1);
        Double readingValue = 100.0;

        when(householdRepository.findById(101L)).thenReturn(Optional.of(household));
        when(waterUsageLogRepository.findByHouseholdIdAndReadingDate(101L, date)).thenReturn(Optional.empty());
        when(waterUsageLogRepository.findFirstByHouseholdIdAndReadingDateLessThanOrderByReadingDateDesc(101L, date))
                .thenReturn(Optional.empty());
        when(waterUsageLogRepository.findFirstByHouseholdIdOrderByReadingDateDesc(101L))
                .thenReturn(Optional.empty());

        when(waterUsageLogRepository.save(any(WaterUsageLog.class))).thenAnswer(invocation -> {
            WaterUsageLog log = invocation.getArgument(0);
            log.setId(1L);
            return log;
        });

        MeterReadingDtos.ResidentMeterReadingRequest request = MeterReadingDtos.ResidentMeterReadingRequest.builder()
                .readingDate(date)
                .meterReadingKl(readingValue)
                .build();

        MeterReadingDtos.MeterReadingResponse response = meterReadingService.logResidentReading(101L, request);

        assertNotNull(response);
        assertEquals(100.0, response.getMeterReadingKl());
        assertEquals(100.0, response.getConsumptionKl(), "First reading consumption must be relative to 0.0 baseline");
        assertEquals(UsageSource.MANUAL, response.getSource());
        verify(waterUsageLogRepository, times(1)).save(any(WaterUsageLog.class));
    }

    @Test
    @DisplayName("Sequential valid reading should calculate correct consumption (current - prior)")
    void testSequentialValidReading_CalculatesAccurateConsumption() {
        LocalDate priorDate = LocalDate.of(2026, 8, 1);
        LocalDate newDate = LocalDate.of(2026, 8, 2);

        WaterUsageLog priorLog = WaterUsageLog.builder()
                .id(1L)
                .household(household)
                .readingDate(priorDate)
                .meterReadingKl(100.0)
                .consumptionKl(0.0)
                .source(UsageSource.MANUAL)
                .build();

        when(householdRepository.findById(101L)).thenReturn(Optional.of(household));
        when(waterUsageLogRepository.findByHouseholdIdAndReadingDate(101L, newDate)).thenReturn(Optional.empty());
        when(waterUsageLogRepository.findFirstByHouseholdIdAndReadingDateLessThanOrderByReadingDateDesc(101L, newDate))
                .thenReturn(Optional.of(priorLog));

        when(waterUsageLogRepository.save(any(WaterUsageLog.class))).thenAnswer(invocation -> {
            WaterUsageLog log = invocation.getArgument(0);
            log.setId(2L);
            return log;
        });

        MeterReadingDtos.ResidentMeterReadingRequest request = MeterReadingDtos.ResidentMeterReadingRequest.builder()
                .readingDate(newDate)
                .meterReadingKl(108.5)
                .build();

        MeterReadingDtos.MeterReadingResponse response = meterReadingService.logResidentReading(101L, request);

        assertNotNull(response);
        assertEquals(108.5, response.getMeterReadingKl());
        assertEquals(8.5, response.getConsumptionKl(), "Consumption must be exactly 108.5 - 100.0 = 8.5");
    }

    @Test
    @DisplayName("Lower meter reading must be rejected with InvalidMeterReadingException")
    void testLowerMeterReading_ThrowsInvalidMeterReadingException() {
        LocalDate priorDate = LocalDate.of(2026, 8, 1);
        LocalDate newDate = LocalDate.of(2026, 8, 2);

        WaterUsageLog priorLog = WaterUsageLog.builder()
                .id(1L)
                .household(household)
                .readingDate(priorDate)
                .meterReadingKl(100.0)
                .consumptionKl(0.0)
                .source(UsageSource.MANUAL)
                .build();

        when(householdRepository.findById(101L)).thenReturn(Optional.of(household));
        when(waterUsageLogRepository.findByHouseholdIdAndReadingDate(101L, newDate)).thenReturn(Optional.empty());
        when(waterUsageLogRepository.findFirstByHouseholdIdAndReadingDateLessThanOrderByReadingDateDesc(101L, newDate))
                .thenReturn(Optional.of(priorLog));

        MeterReadingDtos.ResidentMeterReadingRequest request = MeterReadingDtos.ResidentMeterReadingRequest.builder()
                .readingDate(newDate)
                .meterReadingKl(95.0) // Lower than 100.0
                .build();

        InvalidMeterReadingException ex = assertThrows(InvalidMeterReadingException.class, () ->
                meterReadingService.logResidentReading(101L, request)
        );

        assertTrue(ex.getMessage().contains("cannot be lower than the previous reading of 100.0 kL"));
        verify(waterUsageLogRepository, never()).save(any());
    }

    @Test
    @DisplayName("Duplicate reading date for same household must throw DuplicateReadingDateException")
    void testDuplicateReadingDate_ThrowsDuplicateReadingDateException() {
        LocalDate existingDate = LocalDate.of(2026, 8, 1);

        WaterUsageLog existingLog = WaterUsageLog.builder()
                .id(1L)
                .household(household)
                .readingDate(existingDate)
                .meterReadingKl(100.0)
                .consumptionKl(0.0)
                .build();

        when(householdRepository.findById(101L)).thenReturn(Optional.of(household));
        when(waterUsageLogRepository.findByHouseholdIdAndReadingDate(101L, existingDate))
                .thenReturn(Optional.of(existingLog));

        MeterReadingDtos.ResidentMeterReadingRequest request = MeterReadingDtos.ResidentMeterReadingRequest.builder()
                .readingDate(existingDate)
                .meterReadingKl(105.0)
                .build();

        DuplicateReadingDateException ex = assertThrows(DuplicateReadingDateException.class, () ->
                meterReadingService.logResidentReading(101L, request)
        );

        assertTrue(ex.getMessage().contains("already exists"));
        verify(waterUsageLogRepository, never()).save(any());
    }

    @Test
    @DisplayName("Bulk CSV upload should process valid rows and collect failures without aborting entire batch")
    void testBulkUpload_ProcessesValidAndCollectsFailedRows() {
        String csvContent = "flat_number,reading_date,meter_reading_kl\n" +
                "A-101,2026-08-01,100.0\n" +
                "A-101,2026-08-02,90.0\n" +   // Fails: lower reading than 100.0
                "Z-999,2026-08-01,50.0\n";   // Fails: flat does not exist

        MockMultipartFile file = new MockMultipartFile(
                "file", "readings.csv", "text/csv", csvContent.getBytes(StandardCharsets.UTF_8)
        );

        when(householdRepository.findByApartmentIdAndFlatNumber(1L, "A-101")).thenReturn(Optional.of(household));
        when(householdRepository.findByApartmentIdAndFlatNumber(1L, "Z-999")).thenReturn(Optional.empty());

        // For row 1 (A-101 on 2026-08-01): first reading -> success
        when(waterUsageLogRepository.findByHouseholdIdAndReadingDate(101L, LocalDate.of(2026, 8, 1))).thenReturn(Optional.empty());
        when(waterUsageLogRepository.findFirstByHouseholdIdAndReadingDateLessThanOrderByReadingDateDesc(101L, LocalDate.of(2026, 8, 1)))
                .thenReturn(Optional.empty());
        when(waterUsageLogRepository.findFirstByHouseholdIdOrderByReadingDateDesc(101L))
                .thenReturn(Optional.empty());

        // For row 2 (A-101 on 2026-08-02): prior reading is 100.0
        WaterUsageLog firstLog = WaterUsageLog.builder()
                .id(1L)
                .household(household)
                .readingDate(LocalDate.of(2026, 8, 1))
                .meterReadingKl(100.0)
                .consumptionKl(0.0)
                .build();
        when(waterUsageLogRepository.findByHouseholdIdAndReadingDate(101L, LocalDate.of(2026, 8, 2))).thenReturn(Optional.empty());
        when(waterUsageLogRepository.findFirstByHouseholdIdAndReadingDateLessThanOrderByReadingDateDesc(101L, LocalDate.of(2026, 8, 2)))
                .thenReturn(Optional.of(firstLog));

        MeterReadingDtos.BulkUploadResponse response = meterReadingService.bulkUploadReadings(1L, file);

        assertNotNull(response);
        assertEquals(1, response.getSuccessCount(), "1 valid row should succeed");
        assertEquals(2, response.getFailureCount(), "2 invalid rows should be captured");
        assertEquals(3, response.getTotalProcessed());
        assertEquals(2, response.getFailedRows().size());

        assertTrue(response.getFailedRows().get(0).getReason().contains("lower than the previous reading"));
        assertTrue(response.getFailedRows().get(1).getReason().contains("does not exist"));
    }
}
