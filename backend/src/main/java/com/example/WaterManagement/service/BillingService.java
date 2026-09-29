package com.example.WaterManagement.service;

import com.example.WaterManagement.dto.BillingDtos;
import com.example.WaterManagement.entity.*;
import com.example.WaterManagement.exception.BadRequestException;
import com.example.WaterManagement.exception.ResourceNotFoundException;
import com.example.WaterManagement.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class BillingService {

    private static final Logger log = LoggerFactory.getLogger(BillingService.class);

    private final InvoiceRepository invoiceRepository;
    private final HouseholdRepository householdRepository;
    private final ApartmentRepository apartmentRepository;
    private final UserRepository userRepository;
    private final WaterUsageLogRepository waterUsageLogRepository;
    private final BillingCycleRepository billingCycleRepository;
    private final TariffService tariffService;
    private final ApportionmentService apportionmentService;
    private final InvoicePdfService invoicePdfService;
    private final EmailService emailService;

    public BillingService(InvoiceRepository invoiceRepository,
                          HouseholdRepository householdRepository,
                          ApartmentRepository apartmentRepository,
                          UserRepository userRepository,
                          WaterUsageLogRepository waterUsageLogRepository,
                          BillingCycleRepository billingCycleRepository,
                          TariffService tariffService,
                          ApportionmentService apportionmentService,
                          InvoicePdfService invoicePdfService,
                          EmailService emailService) {
        this.invoiceRepository = invoiceRepository;
        this.householdRepository = householdRepository;
        this.apartmentRepository = apartmentRepository;
        this.userRepository = userRepository;
        this.waterUsageLogRepository = waterUsageLogRepository;
        this.billingCycleRepository = billingCycleRepository;
        this.tariffService = tariffService;
        this.apportionmentService = apportionmentService;
        this.invoicePdfService = invoicePdfService;
        this.emailService = emailService;
    }

    // =========================================================================
    // 1. BILLING CYCLE LIFECYCLE MANAGEMENT (OPEN -> FINALIZE -> ARCHIVE)
    // =========================================================================

    @Transactional(readOnly = true)
    public List<BillingDtos.BillingCycleDto> getBillingCycles(Long apartmentId) {
        List<BillingCycle> cycles = billingCycleRepository.findByApartmentIdOrderByStartDateDesc(apartmentId);
        List<BillingDtos.BillingCycleDto> dtos = new ArrayList<>();

        for (BillingCycle cycle : cycles) {
            String month = cycle.getStartDate().toString().substring(0, 7);
            List<Invoice> invoices = invoiceRepository.findByApartmentIdAndBillingMonth(apartmentId, month);

            int count = invoices.size();
            double totalBilled = invoices.stream().mapToDouble(i -> i.getTotalAmount() != null ? i.getTotalAmount() : 0.0).sum();

            dtos.add(BillingDtos.BillingCycleDto.builder()
                    .id(cycle.getId())
                    .apartmentId(apartmentId)
                    .startDate(cycle.getStartDate())
                    .endDate(cycle.getEndDate())
                    .status(cycle.getStatus() != null ? cycle.getStatus().name() : "OPEN")
                    .createdAt(cycle.getCreatedAt())
                    .totalInvoices(count)
                    .totalBilledAmount(round2(totalBilled))
                    .build());
        }

        return dtos;
    }

    @Transactional
    public BillingDtos.BillingCycleDto openBillingCycle(Long apartmentId, BillingDtos.OpenBillingCycleRequest request) {
        Apartment apartment = apartmentRepository.findById(apartmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Apartment not found with ID: " + apartmentId));

        if (request.getStartDate() == null || request.getEndDate() == null) {
            throw new BadRequestException("Cycle start date and end date are required");
        }

        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new BadRequestException("Cycle end date cannot be before start date");
        }

        // Check if there is already an OPEN cycle
        Optional<BillingCycle> openOpt = billingCycleRepository.findFirstByApartmentIdAndStatus(apartmentId, BillingCycleStatus.OPEN);
        if (openOpt.isPresent()) {
            throw new BadRequestException("A billing cycle is already OPEN (" + openOpt.get().getStartDate() + " to " + openOpt.get().getEndDate() + "). Please finalize or archive it first.");
        }

        BillingCycle cycle = BillingCycle.builder()
                .apartment(apartment)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .status(BillingCycleStatus.OPEN)
                .build();

        cycle = billingCycleRepository.save(cycle);

        return BillingDtos.BillingCycleDto.builder()
                .id(cycle.getId())
                .apartmentId(apartmentId)
                .startDate(cycle.getStartDate())
                .endDate(cycle.getEndDate())
                .status(cycle.getStatus().name())
                .createdAt(cycle.getCreatedAt())
                .totalInvoices(0)
                .totalBilledAmount(0.0)
                .build();
    }

    @Transactional
    public BillingDtos.BillingCycleDto finalizeBillingCycle(Long apartmentId, Long cycleId, BillingDtos.FinalizeBillingCycleRequest request) {
        BillingCycle cycle = billingCycleRepository.findById(cycleId)
                .orElseThrow(() -> new ResourceNotFoundException("Billing cycle not found with ID: " + cycleId));

        if (!cycle.getApartment().getId().equals(apartmentId)) {
            throw new BadRequestException("Billing cycle does not belong to your community");
        }

        if (cycle.getStatus() == BillingCycleStatus.ARCHIVED) {
            throw new BadRequestException("Cannot finalize an already ARCHIVED billing cycle");
        }

        String billingMonth = cycle.getStartDate().toString().substring(0, 7);

        // Generate or recalculate all invoices for this cycle
        BillingDtos.GenerateBillsRequest genReq = new BillingDtos.GenerateBillsRequest();
        genReq.setBillingMonth(billingMonth);
        genReq.setDueDate(request.getDueDate() != null ? request.getDueDate() : LocalDate.now().plusDays(15));
        genReq.setCommonAreaWaterKl(request.getCommonAreaWaterKl() != null ? request.getCommonAreaWaterKl() : 0.0);

        generateMonthlyInvoicesForCycle(cycle, genReq);

        // Transition status to FINALIZED
        cycle.setStatus(BillingCycleStatus.FINALIZED);
        cycle = billingCycleRepository.save(cycle);

        List<Invoice> invoices = invoiceRepository.findByApartmentIdAndBillingMonth(apartmentId, billingMonth);
        double totalBilled = invoices.stream().mapToDouble(i -> i.getTotalAmount() != null ? i.getTotalAmount() : 0.0).sum();

        // Asynchronously dispatch monthly bill notification email with attached PDF to all residents in this cycle
        for (Invoice inv : invoices) {
            try {
                Household h = inv.getHousehold();
                Optional<User> userOpt = userRepository.findFirstByHouseholdId(h.getId());
                String email = userOpt.map(User::getEmail).orElse(null);
                String name = userOpt.map(User::getFullName).orElse("Valued Resident");
                if (email != null && !email.trim().isEmpty()) {
                    byte[] pdfBytes = invoicePdfService.generateInvoicePdf(inv);
                    emailService.sendMonthlyBillNotificationEmail(
                            email,
                            name,
                            cycle.getApartment().getName(),
                            h.getFlatNumber(),
                            inv.getInvoiceNumber(),
                            billingMonth,
                            inv.getTotalAmount(),
                            inv.getDueDate(),
                            inv.getConsumptionKl(),
                            pdfBytes
                    );
                }
            } catch (Exception e) {
                log.warn("⚠️ Could not dispatch bill email for invoice {}: {}", inv.getInvoiceNumber(), e.getMessage());
            }
        }

        return BillingDtos.BillingCycleDto.builder()
                .id(cycle.getId())
                .apartmentId(apartmentId)
                .startDate(cycle.getStartDate())
                .endDate(cycle.getEndDate())
                .status(cycle.getStatus().name())
                .createdAt(cycle.getCreatedAt())
                .totalInvoices(invoices.size())
                .totalBilledAmount(round2(totalBilled))
                .build();
    }

    @Transactional
    public BillingDtos.BillingCycleDto archiveBillingCycle(Long apartmentId, Long cycleId) {
        BillingCycle cycle = billingCycleRepository.findById(cycleId)
                .orElseThrow(() -> new ResourceNotFoundException("Billing cycle not found with ID: " + cycleId));

        if (!cycle.getApartment().getId().equals(apartmentId)) {
            throw new BadRequestException("Billing cycle does not belong to your community");
        }

        cycle.setStatus(BillingCycleStatus.ARCHIVED);
        cycle = billingCycleRepository.save(cycle);

        String billingMonth = cycle.getStartDate().toString().substring(0, 7);
        List<Invoice> invoices = invoiceRepository.findByApartmentIdAndBillingMonth(apartmentId, billingMonth);
        double totalBilled = invoices.stream().mapToDouble(i -> i.getTotalAmount() != null ? i.getTotalAmount() : 0.0).sum();

        return BillingDtos.BillingCycleDto.builder()
                .id(cycle.getId())
                .apartmentId(apartmentId)
                .startDate(cycle.getStartDate())
                .endDate(cycle.getEndDate())
                .status(cycle.getStatus().name())
                .createdAt(cycle.getCreatedAt())
                .totalInvoices(invoices.size())
                .totalBilledAmount(round2(totalBilled))
                .build();
    }

    @Transactional
    public BillingDtos.InvoiceResponse applyHouseholdAdjustment(Long apartmentId, Long invoiceId, BillingDtos.HouseholdAdjustmentRequest request) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with ID: " + invoiceId));

        if (!invoice.getHousehold().getApartment().getId().equals(apartmentId)) {
            throw new BadRequestException("Invoice does not belong to your community");
        }

        if (invoice.getBillingCycle() != null && invoice.getBillingCycle().getStatus() == BillingCycleStatus.ARCHIVED) {
            throw new BadRequestException("Cannot modify adjustments on an ARCHIVED billing cycle");
        }

        double adj = request.getAdjustmentAmount() != null ? request.getAdjustmentAmount() : 0.0;
        invoice.setAdjustments(round2(adj));

        double base = invoice.getBaseCharge() != null ? invoice.getBaseCharge() : 0.0;
        double metered = invoice.getMeteredCharge() != null ? invoice.getMeteredCharge() : 0.0;
        double shared = invoice.getSharedCharge() != null ? invoice.getSharedCharge() : 0.0;
        double newTotal = Math.max(0.0, round2(base + metered + shared + adj));
        invoice.setTotalAmount(newTotal);

        invoice = invoiceRepository.save(invoice);

        TariffPlan tariff = tariffService.getOrCreateActiveTariff(apartmentId);
        return mapToResponse(invoice, tariff);
    }

    // =========================================================================
    // 2. 1-CLICK MONTHLY BILL GENERATION & INVOICE ENGINE
    // =========================================================================

    @Transactional
    public BillingDtos.GenerateBillsResponse generateMonthlyInvoices(Long apartmentId, BillingDtos.GenerateBillsRequest request) {
        Apartment apartment = apartmentRepository.findById(apartmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Apartment not found with ID: " + apartmentId));

        String billingMonth = request.getBillingMonth() != null ? request.getBillingMonth().trim() : YearMonth.now().toString();
        YearMonth ym;
        try {
            ym = YearMonth.parse(billingMonth);
        } catch (Exception e) {
            throw new BadRequestException("Invalid billing month format. Please use YYYY-MM (e.g. 2026-09)");
        }

        LocalDate startDate = ym.atDay(1);
        LocalDate endDate = ym.atEndOfMonth();

        // Check if there is an active/matching cycle for this month or create one
        BillingCycle cycle = billingCycleRepository.findByApartmentIdOrderByStartDateDesc(apartmentId).stream()
                .filter(c -> c.getStartDate().equals(startDate) && c.getEndDate().equals(endDate))
                .findFirst()
                .orElseGet(() -> billingCycleRepository.save(
                        BillingCycle.builder()
                                .apartment(apartment)
                                .startDate(startDate)
                                .endDate(endDate)
                                .status(BillingCycleStatus.OPEN)
                                .build()
                ));

        return generateMonthlyInvoicesForCycle(cycle, request);
    }

    private BillingDtos.GenerateBillsResponse generateMonthlyInvoicesForCycle(BillingCycle cycle, BillingDtos.GenerateBillsRequest request) {
        Apartment apartment = cycle.getApartment();
        Long apartmentId = apartment.getId();
        String billingMonth = request.getBillingMonth() != null && !request.getBillingMonth().trim().isEmpty()
                ? request.getBillingMonth().trim()
                : cycle.getStartDate().toString().substring(0, 7);

        YearMonth ym;
        try {
            ym = YearMonth.parse(billingMonth);
        } catch (Exception e) {
            ym = YearMonth.from(cycle.getStartDate());
        }

        LocalDate startDate = ym.atDay(1);
        LocalDate endDate = ym.atEndOfMonth();

        LocalDate dueDate = request.getDueDate() != null ? request.getDueDate() : LocalDate.now().plusDays(15);
        TariffPlan tariffPlan = tariffService.getOrCreateActiveTariff(apartmentId);

        List<Household> households = householdRepository.findByApartmentId(apartmentId);
        if (households.isEmpty()) {
            throw new BadRequestException("No household units found for your apartment community.");
        }

        int generatedCount = 0;
        int skippedCount = 0;
        double totalBilled = 0.0;

        for (Household h : households) {
            // Check if household was created after the billing cycle end date
            if (h.getCreatedAt() != null && h.getCreatedAt().toLocalDate().isAfter(endDate)) {
                log.info("Skipping flat {} for billing period {} because household was created on {} (after cycle end)",
                        h.getFlatNumber(), billingMonth, h.getCreatedAt());
                skippedCount++;
                continue;
            }

            Optional<User> userOpt = userRepository.findFirstByHouseholdId(h.getId());
            if (userOpt.isPresent() && userOpt.get().getCreatedAt() != null && userOpt.get().getCreatedAt().toLocalDate().isAfter(endDate)) {
                log.info("Skipping flat {} for billing period {} because resident joined on {} (after cycle end)",
                        h.getFlatNumber(), billingMonth, userOpt.get().getCreatedAt());
                skippedCount++;
                continue;
            }

            List<Invoice> existingInvoices = invoiceRepository.findByHouseholdIdAndBillingMonthOrderByGeneratedAtAsc(h.getId(), billingMonth);

            // 1. Fetch water usage logs for this household during the cycle period
            List<WaterUsageLog> monthlyLogs = waterUsageLogRepository.findByHouseholdIdAndDateBetween(h.getId(), startDate, endDate);

            double totalConsumptionKl = 0.0;
            double startMeterReading = 0.0;
            double endMeterReading = 0.0;

            if (!monthlyLogs.isEmpty()) {
                totalConsumptionKl = monthlyLogs.stream().mapToDouble(WaterUsageLog::getConsumptionKl).sum();
                startMeterReading = monthlyLogs.get(0).getMeterReadingKl() - monthlyLogs.get(0).getConsumptionKl();
                if (startMeterReading < 0.0) {
                    startMeterReading = monthlyLogs.get(0).getMeterReadingKl();
                }
                endMeterReading = monthlyLogs.get(monthlyLogs.size() - 1).getMeterReadingKl();
            } else {
                Optional<WaterUsageLog> latestLog = waterUsageLogRepository.findFirstByHouseholdIdOrderByReadingDateDesc(h.getId());
                if (latestLog.isPresent()) {
                    startMeterReading = latestLog.get().getMeterReadingKl();
                    endMeterReading = startMeterReading;
                }
            }

            // Segregate paid invoices and pending/unpaid invoices
            List<Invoice> paidInvoices = existingInvoices.stream()
                    .filter(i -> i.getStatus() == InvoiceStatus.PAID)
                    .collect(Collectors.toList());

            Optional<Invoice> pendingInvoiceOpt = existingInvoices.stream()
                    .filter(i -> i.getStatus() != InvoiceStatus.PAID)
                    .findFirst();

            double alreadyPaidConsumptionKl = paidInvoices.stream()
                    .mapToDouble(i -> i.getConsumptionKl() != null ? i.getConsumptionKl() : 0.0)
                    .sum();

            double lastPaidEndReading = paidInvoices.stream()
                    .mapToDouble(i -> i.getMeterReadingEndKl() != null ? i.getMeterReadingEndKl() : 0.0)
                    .max()
                    .orElse(startMeterReading);

            double unbilledConsumptionKl = Math.max(0.0, totalConsumptionKl - alreadyPaidConsumptionKl);

            // If all existing invoices are PAID and there's no new consumption, skip
            if (pendingInvoiceOpt.isEmpty() && !paidInvoices.isEmpty() && unbilledConsumptionKl < 0.01) {
                skippedCount++;
                continue;
            }

            String cleanFlat = h.getFlatNumber().replaceAll("[^a-zA-Z0-9]", "");
            String cleanMonth = billingMonth.replace("-", "");

            if (pendingInvoiceOpt.isPresent()) {
                // Update the pending invoice with latest unbilled data
                Invoice pendingInvoice = pendingInvoiceOpt.get();
                boolean hadPriorPaid = !paidInvoices.isEmpty();

                double billingConsumption = hadPriorPaid ? unbilledConsumptionKl : totalConsumptionKl;
                double billStartReading = hadPriorPaid ? lastPaidEndReading : startMeterReading;
                double billEndReading = endMeterReading;

                TariffService.TierCalculationResult tierResult = tariffService.calculateTieredCost(tariffPlan, billingConsumption);
                double meteredCharge = tierResult.getTotalCharge();
                double baseCharge = hadPriorPaid ? 0.0 : (tariffPlan.getBaseMaintenanceFee() != null ? tariffPlan.getBaseMaintenanceFee() : 150.0);

                double sharedCharge = 0.0;
                if (!hadPriorPaid) {
                    ApportionmentService.ApportionmentResult appResult = apportionmentService.calculateHouseholdApportionment(
                            apartment, h, billingMonth, tariffPlan, request.getCommonAreaWaterKl()
                    );
                    sharedCharge = appResult.getSharedCharge();
                }

                double existingAdjustments = pendingInvoice.getAdjustments() != null ? pendingInvoice.getAdjustments() : 0.0;
                double totalAmount = round2(baseCharge + meteredCharge + sharedCharge + existingAdjustments);

                pendingInvoice.setBillingCycle(cycle);
                pendingInvoice.setMeterReadingStartKl(round2(billStartReading));
                pendingInvoice.setMeterReadingEndKl(round2(billEndReading));
                pendingInvoice.setConsumptionKl(round2(billingConsumption));
                pendingInvoice.setBaseCharge(round2(baseCharge));
                pendingInvoice.setMeteredCharge(round2(meteredCharge));
                pendingInvoice.setSharedCharge(round2(sharedCharge));
                pendingInvoice.setTotalAmount(totalAmount);
                pendingInvoice.setDueDate(dueDate);

                invoiceRepository.save(pendingInvoice);
                generatedCount++;
                totalBilled += totalAmount;
            } else if (!paidInvoices.isEmpty() && unbilledConsumptionKl >= 0.01) {
                // Generate a supplementary / incremental invoice for new water usage after payment
                TariffService.TierCalculationResult tierResult = tariffService.calculateTieredCost(tariffPlan, unbilledConsumptionKl);
                double meteredCharge = tierResult.getTotalCharge();
                double baseCharge = 0.0; // Base maintenance already paid for the month
                double sharedCharge = 0.0; // Shared fee already paid for the month
                double totalAmount = round2(meteredCharge);

                int billSeq = existingInvoices.size() + 1;
                String invoiceNumber = String.format("INV-%s-%s-%04d-%d", cleanMonth, cleanFlat, h.getId() % 10000, billSeq);
                int counter = billSeq;
                while (invoiceRepository.findByInvoiceNumber(invoiceNumber).isPresent()) {
                    counter++;
                    invoiceNumber = String.format("INV-%s-%s-%04d-%d", cleanMonth, cleanFlat, h.getId() % 10000, counter);
                }

                Invoice supplementaryInvoice = Invoice.builder()
                        .invoiceNumber(invoiceNumber)
                        .household(h)
                        .billingCycle(cycle)
                        .billingMonth(billingMonth)
                        .meterReadingStartKl(round2(lastPaidEndReading))
                        .meterReadingEndKl(round2(endMeterReading))
                        .consumptionKl(round2(unbilledConsumptionKl))
                        .baseCharge(round2(baseCharge))
                        .meteredCharge(round2(meteredCharge))
                        .sharedCharge(round2(sharedCharge))
                        .adjustments(0.0)
                        .totalAmount(totalAmount)
                        .dueDate(dueDate)
                        .status(InvoiceStatus.PENDING)
                        .build();

                invoiceRepository.save(supplementaryInvoice);
                generatedCount++;
                totalBilled += totalAmount;
            } else {
                // Brand new initial invoice for this month
                TariffService.TierCalculationResult tierResult = tariffService.calculateTieredCost(tariffPlan, totalConsumptionKl);
                double meteredCharge = tierResult.getTotalCharge();
                double baseCharge = tariffPlan.getBaseMaintenanceFee() != null ? tariffPlan.getBaseMaintenanceFee() : 150.0;

                ApportionmentService.ApportionmentResult appResult = apportionmentService.calculateHouseholdApportionment(
                        apartment, h, billingMonth, tariffPlan, request.getCommonAreaWaterKl()
                );
                double sharedCharge = appResult.getSharedCharge();
                double totalAmount = round2(baseCharge + meteredCharge + sharedCharge);

                String invoiceNumber = String.format("INV-%s-%s-%04d", cleanMonth, cleanFlat, h.getId() % 10000);
                int counter = 1;
                while (invoiceRepository.findByInvoiceNumber(invoiceNumber).isPresent()) {
                    invoiceNumber = String.format("INV-%s-%s-%04d-%d", cleanMonth, cleanFlat, h.getId() % 10000, ++counter);
                }

                Invoice initialInvoice = Invoice.builder()
                        .invoiceNumber(invoiceNumber)
                        .household(h)
                        .billingCycle(cycle)
                        .billingMonth(billingMonth)
                        .meterReadingStartKl(round2(startMeterReading))
                        .meterReadingEndKl(round2(endMeterReading))
                        .consumptionKl(round2(totalConsumptionKl))
                        .baseCharge(round2(baseCharge))
                        .meteredCharge(round2(meteredCharge))
                        .sharedCharge(round2(sharedCharge))
                        .adjustments(0.0)
                        .totalAmount(totalAmount)
                        .dueDate(dueDate)
                        .status(InvoiceStatus.PENDING)
                        .build();

                invoiceRepository.save(initialInvoice);
                generatedCount++;
                totalBilled += totalAmount;
            }
        }

        return BillingDtos.GenerateBillsResponse.builder()
                .billingMonth(billingMonth)
                .totalHouseholds(households.size())
                .generatedInvoicesCount(generatedCount)
                .skippedInvoicesCount(skippedCount)
                .totalBilledAmount(round2(totalBilled))
                .message(String.format("Successfully processed %d invoices for billing period %s. Total billed: ₹%.2f (Skipped %d up-to-date/inactive)",
                        generatedCount, billingMonth, totalBilled, skippedCount))
                .build();
    }

    /**
     * Automated End-of-Month Bill Generation & PDF Email Dispatch.
     * Scheduled to run automatically on the last day of each month at 23:00.
     */
    @org.springframework.scheduling.annotation.Scheduled(cron = "0 0 23 L * ?")
    @Transactional
    public void scheduledEndOfMonthBillGenerationAndEmailDispatch() {
        log.info("⏰ STARTING AUTOMATED END-OF-MONTH BILL GENERATION & RESIDENT EMAIL DISPATCH...");
        YearMonth currentYm = YearMonth.now();
        String billingMonth = currentYm.toString();

        List<Apartment> apartments = apartmentRepository.findAll();
        for (Apartment apt : apartments) {
            try {
                autoGenerateAndEmailBills(apt.getId(), billingMonth);
            } catch (Exception e) {
                log.error("❌ Failed automated billing for apartment {}: {}", apt.getName(), e.getMessage());
            }
        }
    }

    /**
     * Generate monthly bills for an apartment and automatically dispatch itemized PDF emails
     * to all registered residents.
     */
    @Transactional
    public BillingDtos.GenerateBillsResponse autoGenerateAndEmailBills(Long apartmentId, String billingMonth) {
        Apartment apartment = apartmentRepository.findById(apartmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Apartment not found with ID: " + apartmentId));

        if (billingMonth == null || billingMonth.trim().isEmpty()) {
            billingMonth = YearMonth.now().toString();
        }

        BillingDtos.GenerateBillsRequest genReq = new BillingDtos.GenerateBillsRequest();
        genReq.setBillingMonth(billingMonth.trim());
        genReq.setDueDate(LocalDate.now().plusDays(15));
        genReq.setCommonAreaWaterKl(0.0);

        BillingDtos.GenerateBillsResponse genRes = generateMonthlyInvoices(apartmentId, genReq);

        // Fetch all invoices for this apartment and billing month and email PDFs
        List<Invoice> invoices = invoiceRepository.findByApartmentIdAndBillingMonth(apartmentId, billingMonth.trim());
        int emailsDispatched = 0;

        for (Invoice inv : invoices) {
            try {
                Household h = inv.getHousehold();
                Optional<User> userOpt = userRepository.findFirstByHouseholdId(h.getId());
                String email = userOpt.map(User::getEmail).orElse(null);
                String name = userOpt.map(User::getFullName).orElse("Valued Resident");

                if (email != null && !email.trim().isEmpty()) {
                    byte[] pdfBytes = invoicePdfService.generateInvoicePdf(inv);
                    boolean sent = emailService.sendMonthlyBillNotificationEmail(
                            email,
                            name,
                            apartment.getName(),
                            h.getFlatNumber(),
                            inv.getInvoiceNumber(),
                            inv.getBillingMonth(),
                            inv.getTotalAmount(),
                            inv.getDueDate(),
                            inv.getConsumptionKl(),
                            pdfBytes
                    );
                    if (sent) emailsDispatched++;
                }
            } catch (Exception e) {
                log.warn("⚠️ Could not auto-dispatch email for invoice {}: {}", inv.getInvoiceNumber(), e.getMessage());
            }
        }

        log.info("📧 Auto-generated and emailed {} bills (out of {} invoices) for community {}",
                emailsDispatched, invoices.size(), apartment.getName());

        genRes.setMessage(genRes.getMessage() + String.format(" | Emailed %d resident invoices with PDF attachments.", emailsDispatched));
        return genRes;
    }

    @Transactional(readOnly = true)
    public List<BillingDtos.InvoiceResponse> getApartmentInvoices(Long apartmentId, String billingMonth, InvoiceStatus status) {
        List<Invoice> invoices;
        if (billingMonth != null && !billingMonth.trim().isEmpty() && status != null) {
            invoices = invoiceRepository.findByApartmentIdAndBillingMonthAndStatus(apartmentId, billingMonth.trim(), status);
        } else if (billingMonth != null && !billingMonth.trim().isEmpty()) {
            invoices = invoiceRepository.findByApartmentIdAndBillingMonth(apartmentId, billingMonth.trim());
        } else if (status != null) {
            invoices = invoiceRepository.findByApartmentIdAndStatus(apartmentId, status);
        } else {
            invoices = invoiceRepository.findByApartmentId(apartmentId);
        }

        TariffPlan tariff = tariffService.getOrCreateActiveTariff(apartmentId);
        return invoices.stream()
                .map(inv -> mapToResponse(inv, tariff))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BillingDtos.InvoiceResponse> getResidentInvoices(Long householdId) {
        List<Invoice> invoices = invoiceRepository.findByHouseholdIdOrderByGeneratedAtDesc(householdId);
        if (invoices.isEmpty()) {
            return Collections.emptyList();
        }
        TariffPlan tariff = tariffService.getOrCreateActiveTariff(invoices.get(0).getHousehold().getApartment().getId());
        return invoices.stream()
                .map(inv -> mapToResponse(inv, tariff))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Invoice getInvoiceEntityById(Long invoiceId) {
        return invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with ID: " + invoiceId));
    }

    @Transactional(readOnly = true)
    public BillingDtos.InvoiceResponse getInvoiceById(Long invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with ID: " + invoiceId));
        TariffPlan tariff = tariffService.getOrCreateActiveTariff(invoice.getHousehold().getApartment().getId());
        return mapToResponse(invoice, tariff);
    }

    @Transactional
    public BillingDtos.InvoiceResponse markInvoiceAsPaidManual(Long apartmentId, Long invoiceId, String paymentMethod) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with ID: " + invoiceId));

        if (!invoice.getHousehold().getApartment().getId().equals(apartmentId)) {
            throw new BadRequestException("Invoice does not belong to your apartment community");
        }

        invoice.setStatus(InvoiceStatus.PAID);
        invoice.setPaymentMethod(paymentMethod != null ? paymentMethod : "OFFLINE_CASH");
        invoice.setPaidAt(LocalDateTime.now());
        invoice = invoiceRepository.save(invoice);

        // Dispatch Payment Receipt Email to Resident
        try {
            Household household = invoice.getHousehold();
            Optional<User> userOpt = userRepository.findFirstByHouseholdId(household.getId());
            if (userOpt.isPresent() && userOpt.get().getEmail() != null) {
                User resident = userOpt.get();
                byte[] pdfBytes = null;
                try {
                    pdfBytes = invoicePdfService.generateInvoicePdf(invoice);
                } catch (Exception pe) {
                    log.warn("Could not generate PDF invoice for {}: {}", invoice.getInvoiceNumber(), pe.getMessage());
                }
                emailService.sendPaymentReceiptToResident(
                        resident.getEmail(),
                        resident.getFullName(),
                        household.getFlatNumber(),
                        household.getApartment().getName(),
                        invoice.getInvoiceNumber(),
                        invoice.getTotalAmount(),
                        invoice.getPaymentMethod(),
                        "OFFLINE-" + invoice.getId(),
                        invoice.getPaidAt(),
                        invoice.getBillingMonth(),
                        pdfBytes
                );
            }
        } catch (Exception e) {
            log.warn("Could not dispatch offline payment receipt email for invoice {}: {}", invoice.getInvoiceNumber(), e.getMessage());
        }

        TariffPlan tariff = tariffService.getOrCreateActiveTariff(apartmentId);
        return mapToResponse(invoice, tariff);
    }

    @Transactional(readOnly = true)
    public BillingDtos.BillingStatsResponse getBillingStats(Long apartmentId, String month) {
        List<Invoice> invoices;
        if (month != null && !month.trim().isEmpty()) {
            invoices = invoiceRepository.findByApartmentIdAndBillingMonth(apartmentId, month.trim());
        } else {
            invoices = invoiceRepository.findByApartmentId(apartmentId);
        }

        double totalInvoiced = 0.0;
        double totalCollected = 0.0;
        double totalPending = 0.0;
        double totalOverdue = 0.0;
        int paidCount = 0;
        int pendingCount = 0;
        int overdueCount = 0;

        LocalDate today = LocalDate.now();

        for (Invoice inv : invoices) {
            double amt = inv.getTotalAmount() != null ? inv.getTotalAmount() : 0.0;
            totalInvoiced += amt;

            if (inv.getStatus() == InvoiceStatus.PAID) {
                totalCollected += amt;
                paidCount++;
            } else if (inv.getDueDate() != null && inv.getDueDate().isBefore(today)) {
                totalOverdue += amt;
                overdueCount++;
            } else {
                totalPending += amt;
                pendingCount++;
            }
        }

        double collectionRate = totalInvoiced > 0 ? (totalCollected / totalInvoiced) * 100.0 : 0.0;

        return BillingDtos.BillingStatsResponse.builder()
                .billingMonth(month != null ? month : "ALL")
                .totalInvoicedAmount(round2(totalInvoiced))
                .totalCollectedAmount(round2(totalCollected))
                .totalPendingAmount(round2(totalPending))
                .totalOverdueAmount(round2(totalOverdue))
                .totalInvoicesCount(invoices.size())
                .paidInvoicesCount(paidCount)
                .pendingInvoicesCount(pendingCount)
                .overdueInvoicesCount(overdueCount)
                .collectionRatePercentage(round2(collectionRate))
                .build();
    }

    private BillingDtos.InvoiceResponse mapToResponse(Invoice inv, TariffPlan tariff) {
        Household h = inv.getHousehold();
        double consumption = inv.getConsumptionKl() != null ? inv.getConsumptionKl() : 0.0;
        TariffService.TierCalculationResult tierResult = tariffService.calculateTieredCost(tariff, consumption);

        Optional<User> userOpt = userRepository.findFirstByHouseholdId(h.getId());
        String resName = userOpt.map(User::getFullName).orElse(null);
        String resEmail = userOpt.map(User::getEmail).orElse(null);
        String resPhone = userOpt.map(User::getPhoneNumber).orElse(null);

        String appMethodName = tariff.getApportionmentMethod() != null ? tariff.getApportionmentMethod().name() : "BY_FLAT_AREA";
        String appDetails = String.format("Shared cost contribution for %s according to society %s rules.",
                inv.getBillingMonth(), appMethodName);

        return BillingDtos.InvoiceResponse.builder()
                .id(inv.getId())
                .invoiceNumber(inv.getInvoiceNumber())
                .householdId(h.getId())
                .flatNumber(h.getFlatNumber())
                .residentName(resName)
                .residentEmail(resEmail)
                .residentPhone(resPhone)
                .meterSerialNumber(h.getMeterSerialNumber())
                .billingMonth(inv.getBillingMonth())
                .meterReadingStartKl(inv.getMeterReadingStartKl() != null ? inv.getMeterReadingStartKl() : 0.0)
                .meterReadingEndKl(inv.getMeterReadingEndKl() != null ? inv.getMeterReadingEndKl() : 0.0)
                .consumptionKl(consumption)
                .baseCharge(inv.getBaseCharge() != null ? inv.getBaseCharge() : 0.0)
                .meteredCharge(inv.getMeteredCharge() != null ? inv.getMeteredCharge() : 0.0)
                .sharedCharge(inv.getSharedCharge() != null ? inv.getSharedCharge() : 0.0)
                .adjustments(inv.getAdjustments() != null ? inv.getAdjustments() : 0.0)
                .totalAmount(inv.getTotalAmount() != null ? inv.getTotalAmount() : 0.0)
                .dueDate(inv.getDueDate())
                .status(inv.getStatus() != null ? inv.getStatus() : InvoiceStatus.PENDING)
                .paymentMethod(inv.getPaymentMethod())
                .razorpayOrderId(inv.getRazorpayOrderId())
                .razorpayPaymentId(inv.getRazorpayPaymentId())
                .paidAt(inv.getPaidAt())
                .generatedAt(inv.getGeneratedAt())
                .slabBreakdown(tierResult.getBreakdown())
                .apportionmentDetails(appDetails)
                .build();
    }

    @Transactional
    public boolean emailInvoiceToResident(Long apartmentId, Long invoiceId, String overrideEmail) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with ID: " + invoiceId));

        if (!invoice.getHousehold().getApartment().getId().equals(apartmentId)) {
            throw new BadRequestException("Invoice does not belong to your apartment community");
        }

        Household household = invoice.getHousehold();
        Optional<User> userOpt = userRepository.findFirstByHouseholdId(household.getId());
        String email = (overrideEmail != null && !overrideEmail.trim().isEmpty())
                ? overrideEmail.trim()
                : userOpt.map(User::getEmail).orElse(null);

        if (email == null || email.trim().isEmpty()) {
            throw new BadRequestException("No recipient email address available for Flat " + household.getFlatNumber());
        }

        String name = userOpt.map(User::getFullName).orElse("Resident Flat " + household.getFlatNumber());
        byte[] pdfBytes = invoicePdfService.generateInvoicePdf(invoice);

        return emailService.sendMonthlyBillNotificationEmail(
                email,
                name,
                household.getApartment().getName(),
                household.getFlatNumber(),
                invoice.getInvoiceNumber(),
                invoice.getBillingMonth(),
                invoice.getTotalAmount(),
                invoice.getDueDate(),
                invoice.getConsumptionKl(),
                pdfBytes
        );
    }

    private double round2(double val) {
        return Math.round(val * 100.0) / 100.0;
    }
}
