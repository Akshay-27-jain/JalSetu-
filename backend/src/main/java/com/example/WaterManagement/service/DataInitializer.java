package com.example.WaterManagement.service;

import com.example.WaterManagement.entity.*;
import com.example.WaterManagement.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final ApartmentRepository apartmentRepository;
    private final HouseholdRepository householdRepository;
    private final TariffPlanRepository tariffPlanRepository;
    private final WaterUsageLogRepository waterUsageLogRepository;
    private final AlertRepository alertRepository;
    private final BillingCycleRepository billingCycleRepository;
    private final BulkPurchaseRepository bulkPurchaseRepository;
    private final InvoiceRepository invoiceRepository;
    private final PasswordEncoder passwordEncoder;
    private final SupportTicketRepository supportTicketRepository;
    private final AnnouncementRepository announcementRepository;

    public DataInitializer(UserRepository userRepository,
                           ApartmentRepository apartmentRepository,
                           HouseholdRepository householdRepository,
                           TariffPlanRepository tariffPlanRepository,
                           WaterUsageLogRepository waterUsageLogRepository,
                           AlertRepository alertRepository,
                           BillingCycleRepository billingCycleRepository,
                           BulkPurchaseRepository bulkPurchaseRepository,
                           InvoiceRepository invoiceRepository,
                           PasswordEncoder passwordEncoder,
                           SupportTicketRepository supportTicketRepository,
                           AnnouncementRepository announcementRepository) {
        this.userRepository = userRepository;
        this.apartmentRepository = apartmentRepository;
        this.householdRepository = householdRepository;
        this.tariffPlanRepository = tariffPlanRepository;
        this.waterUsageLogRepository = waterUsageLogRepository;
        this.alertRepository = alertRepository;
        this.billingCycleRepository = billingCycleRepository;
        this.bulkPurchaseRepository = bulkPurchaseRepository;
        this.invoiceRepository = invoiceRepository;
        this.passwordEncoder = passwordEncoder;
        this.supportTicketRepository = supportTicketRepository;
        this.announcementRepository = announcementRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        log.info("🚀 Starting comprehensive Smart Water Management database seeding...");

        // 1. Seed / Ensure MAIN_ADMIN
        seedMainAdmin();

        // 2. Seed / Ensure Communities (Palm Meadows & Paras Garden) and Households
        Apartment palmMeadows = seedPalmMeadowsCommunity();
        Apartment parasGarden = seedParasGardenCommunity();

        // 3. Ensure demo households have assigned Resident User accounts
        seedResidentAccounts(palmMeadows, parasGarden);

        // 4. Seed Configurable Tiered Tariff Plans for both societies
        seedTariffPlans(palmMeadows, parasGarden);

        // 5. Seed Multi-Cycle Lifecycle & Bulk Water Purchases (Tankers & Municipal)
        seedBillingCyclesAndBulkPurchases(palmMeadows, parasGarden);

        // 6. Seed 30-Day Daily Water Meter Readings with realistic >3σ Leak Outliers
        seedHistoricalWaterUsageAndOutliers(palmMeadows, parasGarden);

        // 7. Seed Itemized Invoices for Finalized Cycles (with varied payment statuses: Paid Razorpay/UPI/Cash, Pending, Overdue)
        seedItemizedInvoices(palmMeadows, parasGarden);

        // 8. Seed In-App & Statistical Leak Alerts
        seedAlerts(palmMeadows, parasGarden);

        // 9. Seed Community Support Tickets & Official Announcements
        seedSupportTicketsAndAnnouncements(palmMeadows, parasGarden);

        log.info("✅ Smart Water Management database seeding successfully completed across all enterprise modules!");
    }

    // =========================================================================
    // 10. SUPPORT TICKETS & ANNOUNCEMENTS SEEDING
    // =========================================================================
    private void seedSupportTicketsAndAnnouncements(Apartment palmMeadows, Apartment parasGarden) {
        if (parasGarden != null) {
            // Seed Announcements if empty
            if (announcementRepository.findActiveByApartmentId(parasGarden.getId()).isEmpty()) {
                announcementRepository.save(new Announcement(
                        parasGarden,
                        "Overhead Water Tank Cleaning & Disinfection Schedule",
                        "Please be informed that the biannual overhead water tank cleaning and UV disinfection for Wings A and B is scheduled for this coming Friday between 10:00 AM and 02:00 PM. Water supply will be temporarily paused during this window. Residents are advised to store sufficient water in advance.",
                        "TANK_CLEANING",
                        "IMPORTANT",
                        true,
                        LocalDate.now(),
                        LocalDate.now().plusDays(7)
                ));

                announcementRepository.save(new Announcement(
                        parasGarden,
                        "July 2026 Water Conservation Benchmark Report Published",
                        "The community achieved a 12.4% reduction in non-essential water consumption for July 2026. Top conserving flats will receive recognition certificates. Individual household breakdowns are now available in your Resident Dashboard.",
                        "GENERAL",
                        "NORMAL",
                        false,
                        LocalDate.now().minusDays(2),
                        LocalDate.now().plusDays(14)
                ));

                announcementRepository.save(new Announcement(
                        parasGarden,
                        "Pressure Regulating Valve Inspection - Wing B Risers",
                        "Maintenance engineers will inspect the main supply riser valves in Wing B on Tuesday from 11:00 AM to 01:00 PM to optimize flow distribution and resolve low-pressure feedback.",
                        "MAINTENANCE",
                        "NORMAL",
                        false,
                        LocalDate.now().minusDays(5),
                        LocalDate.now().plusDays(5)
                ));
            }

            // Seed Support Tickets for Paras Garden
            if (supportTicketRepository.countByApartmentId(parasGarden.getId()) == 0) {
                Household hB201 = householdRepository.findByApartmentIdAndFlatNumber(parasGarden.getId(), "B-201").orElse(null);
                User uRahul = userRepository.findByEmail("rahul.paras@gmail.com").orElse(null);

                Household hA101 = householdRepository.findByApartmentIdAndFlatNumber(parasGarden.getId(), "A-101").orElse(null);
                User uPriya = userRepository.findByEmail("priya.paras@gmail.com").orElse(null);

                Household hB202 = householdRepository.findByApartmentIdAndFlatNumber(parasGarden.getId(), "B-202").orElse(null);

                if (hB201 != null) {
                    SupportTicket t1 = new SupportTicket(
                            parasGarden,
                            hB201,
                            uRahul,
                            "WATER_LEAKAGE",
                            "HIGH",
                            "Internal Pipeline Leak Detected in Utility Balcony",
                            "The JalSetu anomaly tracker alerted me to high overnight consumption. I inspected the utility wash area and found a pinhole leak near the washing machine inlet valve. Requesting maintenance plumber inspection."
                    );
                    t1.setStatus("IN_PROGRESS");
                    t1.setResolutionNotes("Plumbing maintenance assigned. Technician scheduled to visit flat B-201 today at 4:30 PM.");
                    supportTicketRepository.save(t1);
                }

                if (hA101 != null) {
                    SupportTicket t2 = new SupportTicket(
                            parasGarden,
                            hA101,
                            uPriya,
                            "BILLING_DISPUTE",
                            "MEDIUM",
                            "Clarification on Bulk Water Tanker Apportionment",
                            "Requesting breakdown on how the tanker shared cost was apportioned between 2BHK and 3BHK flats for the July billing cycle."
                    );
                    t2.setStatus("RESOLVED");
                    t2.setResolutionNotes("Explained: Tanker cost is apportioned strictly proportional to flat carpet area (sq ft) as per society general body resolution.");
                    t2.setResolvedAt(LocalDateTime.now().minusDays(1));
                    supportTicketRepository.save(t2);
                }

                if (hB202 != null) {
                    SupportTicket t3 = new SupportTicket(
                            parasGarden,
                            hB202,
                            null,
                            "METER_DEFECT",
                            "LOW",
                            "Sub-Meter Dial Display Glass Calibration Check",
                            "The sub-meter LCD reading in the riser shaft seems slightly dim. Requesting meter technician check."
                    );
                    t3.setStatus("OPEN");
                    supportTicketRepository.save(t3);
                }
            }
        }
    }

    // =========================================================================
    // 1. MAIN ADMIN SEEDING
    // =========================================================================
    private void seedMainAdmin() {
        User mainAdmin = userRepository.findByEmail("admin@aquatrack.com").orElse(null);
        if (mainAdmin == null) {
            mainAdmin = User.builder()
                    .email("admin@aquatrack.com")
                    .passwordHash(passwordEncoder.encode("Admin@12345"))
                    .fullName("Main Administrator")
                    .role(Role.MAIN_ADMIN)
                    .build();
            userRepository.save(mainAdmin);
            log.info("Seeded MAIN_ADMIN: admin@aquatrack.com / Admin@12345");
        } else {
            mainAdmin.setPasswordHash(passwordEncoder.encode("Admin@12345"));
            userRepository.save(mainAdmin);
        }
    }

    // =========================================================================
    // 2. COMMUNITY 1: PALM MEADOWS RESIDENCES
    // =========================================================================
    private Apartment seedPalmMeadowsCommunity() {
        Apartment apt = apartmentRepository.findFirstByNameOrderByIdAsc("Palm Meadows Residences").orElse(null);
        if (apt == null) {
            apt = Apartment.builder()
                    .name("Palm Meadows Residences")
                    .address("77 Green Valley Road, Sector 4, Bangalore")
                    .totalHouseholds(24)
                    .build();
            apt = apartmentRepository.save(apt);
            log.info("Seeded community: Palm Meadows Residences (ID: {})", apt.getId());
        }

        // Community Admin
        User commAdmin = userRepository.findByEmail("admin@palmmeadows.com").orElse(null);
        if (commAdmin == null) {
            commAdmin = User.builder()
                    .email("admin@palmmeadows.com")
                    .passwordHash(passwordEncoder.encode("Admin@12345"))
                    .fullName("Robert Vance")
                    .role(Role.COMMUNITY_ADMIN)
                    .apartment(apt)
                    .build();
            userRepository.save(commAdmin);
            log.info("Seeded Community Admin for Palm Meadows: admin@palmmeadows.com / Admin@12345");
        } else {
            commAdmin.setPasswordHash(passwordEncoder.encode("Admin@12345"));
            userRepository.save(commAdmin);
        }

        // Seed Household units
        ensureHousehold(apt, "A-101", "MTR-PALM-A101-9871", 1450.0, 4, true, "INV-PALM-A101-9871");
        ensureHousehold(apt, "A-102", "MTR-PALM-A102-3412", 1200.0, 2, true, "INV-PALM-A102-3412");
        ensureHousehold(apt, "B-201", "MTR-PALM-B201-5623", 1650.0, 5, true, "INV-PALM-B201-5623");
        ensureHousehold(apt, "B-202", "MTR-PALM-B202-7890", 1100.0, 3, true, "INV-PALM-B202-7890");
        ensureHousehold(apt, "C-301", "MTR-PALM-C301-1102", 1500.0, 4, true, "INV-PALM-C301-1102");
        ensureHousehold(apt, "C-302", null, 1350.0, 3, false, "INV-PALM-C302-UNMTR"); // Unmetered unit for fallback testing

        return apt;
    }

    // =========================================================================
    // 3. COMMUNITY 2: PARAS GARDEN APARTMENTS
    // =========================================================================
    private Apartment seedParasGardenCommunity() {
        Apartment apt = apartmentRepository.findFirstByNameOrderByIdAsc("Paras Garden Apartments").orElse(null);
        if (apt == null) {
            apt = Apartment.builder()
                    .name("Paras Garden Apartments")
                    .address("Plot 14B, Kundalahalli Main Road, Whitefield, Bangalore")
                    .totalHouseholds(36)
                    .build();
            apt = apartmentRepository.save(apt);
            log.info("Seeded community: Paras Garden Apartments (ID: {})", apt.getId());
        }

        // Community Admin
        User commAdmin = userRepository.findByEmail("admin@parasgarden.com").orElse(null);
        if (commAdmin == null) {
            commAdmin = User.builder()
                    .email("admin@parasgarden.com")
                    .passwordHash(passwordEncoder.encode("Admin@12345"))
                    .fullName("Suresh Gupta")
                    .role(Role.COMMUNITY_ADMIN)
                    .apartment(apt)
                    .build();
            userRepository.save(commAdmin);
            log.info("Seeded Community Admin for Paras Garden: admin@parasgarden.com / Admin@12345");
        } else {
            commAdmin.setPasswordHash(passwordEncoder.encode("Admin@12345"));
            userRepository.save(commAdmin);
        }

        // Seed Household units
        ensureHousehold(apt, "PG-101", "MTR-PG-101-4401", 1300.0, 3, true, "INV-PG-101-4401");
        ensureHousehold(apt, "PG-102", "MTR-PG-102-4402", 1400.0, 4, true, "INV-PG-102-4402");
        ensureHousehold(apt, "PG-201", "MTR-PG-201-4403", 1550.0, 5, true, "INV-PG-201-4403");
        ensureHousehold(apt, "PG-202", null, 1250.0, 2, false, "INV-PG-202-UNMTR"); // Unmetered unit for fallback testing

        return apt;
    }

    private Household ensureHousehold(Apartment apt, String flatNumber, String meterSerial, Double areaSqft, Integer occupancy, boolean hasMeter, String inviteCode) {
        Optional<Household> existing = householdRepository.findByApartmentIdAndFlatNumber(apt.getId(), flatNumber);
        if (existing.isPresent()) {
            Household h = existing.get();
            if (meterSerial != null && (h.getMeterSerialNumber() == null || h.getMeterSerialNumber().isEmpty())) {
                h.setMeterSerialNumber(meterSerial);
            }
            h.setHasMeter(hasMeter);
            h.setAreaSqft(areaSqft);
            h.setOccupancyCount(occupancy);
            return householdRepository.save(h);
        }

        Household newH = Household.builder()
                .apartment(apt)
                .flatNumber(flatNumber)
                .meterSerialNumber(meterSerial)
                .areaSqft(areaSqft)
                .occupancyCount(occupancy)
                .hasMeter(hasMeter)
                .inviteCode(inviteCode)
                .build();
        return householdRepository.save(newH);
    }

    // =========================================================================
    // 4. RESIDENT USER ACCOUNTS
    // =========================================================================
    private void seedResidentAccounts(Apartment palmMeadows, Apartment parasGarden) {
        List<Household> demoHouseholds = new ArrayList<>();
        if (palmMeadows != null) {
            demoHouseholds.addAll(householdRepository.findByApartmentId(palmMeadows.getId()));
        }
        if (parasGarden != null) {
            demoHouseholds.addAll(householdRepository.findByApartmentId(parasGarden.getId()));
        }

        Set<String> demoFlats = Set.of("A-101", "A-102", "B-201", "B-202", "C-301", "C-302", "PG-101", "PG-102", "PG-201", "PG-202");

        for (Household h : demoHouseholds) {
            if (!demoFlats.contains(h.getFlatNumber())) {
                continue;
            }
            User resident = userRepository.findFirstByHouseholdId(h.getId()).orElse(null);
            if (resident == null) {
                String cleanFlat = h.getFlatNumber().toLowerCase().replace("-", "");
                String domain = h.getApartment() != null && h.getApartment().getName() != null
                        ? h.getApartment().getName().toLowerCase().replaceAll("[^a-z0-9]", "") + ".com"
                        : "community.com";

                String residentEmail;
                String residentName;

                if (h.getFlatNumber().equalsIgnoreCase("A-101")) {
                    residentName = "John Doe";
                    residentEmail = "john@palmmeadows.com";
                } else if (h.getFlatNumber().equalsIgnoreCase("A-102")) {
                    residentName = "Priya Sharma";
                    residentEmail = "priya@palmmeadows.com";
                } else if (h.getFlatNumber().equalsIgnoreCase("B-201")) {
                    residentName = "Rahul Verma";
                    residentEmail = "rahul@palmmeadows.com";
                } else if (h.getFlatNumber().equalsIgnoreCase("B-202")) {
                    residentName = "Ananya Patel";
                    residentEmail = "ananya@palmmeadows.com";
                } else if (h.getFlatNumber().equalsIgnoreCase("C-301")) {
                    residentName = "Vikram Singh";
                    residentEmail = "vikram@palmmeadows.com";
                } else if (h.getFlatNumber().equalsIgnoreCase("C-302")) {
                    residentName = "Sneha Reddy";
                    residentEmail = "sneha@palmmeadows.com";
                } else if (h.getFlatNumber().equalsIgnoreCase("PG-101")) {
                    residentName = "Amit Kumar";
                    residentEmail = "amit@parasgarden.com";
                } else if (h.getFlatNumber().equalsIgnoreCase("PG-102")) {
                    residentName = "Pooja Roy";
                    residentEmail = "pooja@parasgarden.com";
                } else if (h.getFlatNumber().equalsIgnoreCase("PG-201")) {
                    residentName = "Rajesh Iyer";
                    residentEmail = "rajesh@parasgarden.com";
                } else if (h.getFlatNumber().equalsIgnoreCase("PG-202")) {
                    residentName = "Deepa Nair";
                    residentEmail = "deepa@parasgarden.com";
                } else {
                    residentName = "Resident " + h.getFlatNumber();
                    residentEmail = "resident." + cleanFlat + "@" + domain;
                }

                if (userRepository.existsByEmail(residentEmail)) {
                    residentEmail = "resident." + cleanFlat + "." + h.getId() + "@" + domain;
                }

                User newResident = User.builder()
                        .fullName(residentName)
                        .email(residentEmail)
                        .passwordHash(passwordEncoder.encode("Resident@123"))
                        .role(Role.RESIDENT)
                        .apartment(h.getApartment())
                        .household(h)
                        .build();

                userRepository.save(newResident);
                log.info("Seeded Resident: {} ({}) for Flat {}", residentName, residentEmail, h.getFlatNumber());
            }
        }
    }

    // =========================================================================
    // 5. TARIFF PLANS (MODULE 1)
    // =========================================================================
    private void seedTariffPlans(Apartment palmMeadows, Apartment parasGarden) {
        // Palm Meadows Tariff: 3-Tier Model + Area Fallback
        TariffPlan tariff1 = tariffPlanRepository.findFirstByApartmentIdOrderByEffectiveFromDesc(palmMeadows.getId()).orElse(null);
        if (tariff1 == null) {
            tariff1 = TariffPlan.builder()
                    .apartment(palmMeadows)
                    .baseMaintenanceFee(150.0)
                    .baseRatePerKl(18.0)       // Slab 1: 0 - 10 kL @ ₹18
                    .baseTierLimitKl(10.0)
                    .midRatePerKl(28.0)        // Slab 2: 10 - 25 kL @ ₹28
                    .midTierLimitKl(25.0)
                    .higherRatePerKl(50.0)     // Slab 3: > 25 kL @ ₹50
                    .apportionmentMethod(ApportionmentMethod.BY_METERED_CONSUMPTION_WITH_AREA_FALLBACK)
                    .effectiveFrom(LocalDate.of(2026, 1, 1))
                    .build();
            tariffPlanRepository.save(tariff1);
            log.info("Seeded Tiered Tariff Plan for Palm Meadows");
        } else {
            tariff1.setBaseMaintenanceFee(150.0);
            tariff1.setBaseRatePerKl(18.0);
            tariff1.setBaseTierLimitKl(10.0);
            tariff1.setMidRatePerKl(28.0);
            tariff1.setMidTierLimitKl(25.0);
            tariff1.setHigherRatePerKl(50.0);
            tariff1.setApportionmentMethod(ApportionmentMethod.BY_METERED_CONSUMPTION_WITH_AREA_FALLBACK);
            tariffPlanRepository.save(tariff1);
        }

        // Paras Garden Tariff: 3-Tier Model + Area Fallback
        TariffPlan tariff2 = tariffPlanRepository.findFirstByApartmentIdOrderByEffectiveFromDesc(parasGarden.getId()).orElse(null);
        if (tariff2 == null) {
            tariff2 = TariffPlan.builder()
                    .apartment(parasGarden)
                    .baseMaintenanceFee(120.0)
                    .baseRatePerKl(15.0)       // Slab 1: 0 - 10 kL @ ₹15
                    .baseTierLimitKl(10.0)
                    .midRatePerKl(25.0)        // Slab 2: 10 - 20 kL @ ₹25
                    .midTierLimitKl(20.0)
                    .higherRatePerKl(45.0)     // Slab 3: > 20 kL @ ₹45
                    .apportionmentMethod(ApportionmentMethod.BY_METERED_CONSUMPTION_WITH_AREA_FALLBACK)
                    .effectiveFrom(LocalDate.of(2026, 1, 1))
                    .build();
            tariffPlanRepository.save(tariff2);
            log.info("Seeded Tiered Tariff Plan for Paras Garden");
        } else {
            tariff2.setBaseMaintenanceFee(120.0);
            tariff2.setBaseRatePerKl(15.0);
            tariff2.setBaseTierLimitKl(10.0);
            tariff2.setMidRatePerKl(25.0);
            tariff2.setMidTierLimitKl(20.0);
            tariff2.setHigherRatePerKl(45.0);
            tariff2.setApportionmentMethod(ApportionmentMethod.BY_METERED_CONSUMPTION_WITH_AREA_FALLBACK);
            tariffPlanRepository.save(tariff2);
        }
    }

    // =========================================================================
    // 6. BILLING CYCLES & BULK WATER PURCHASES (MODULE 2 & MODULE 5)
    // =========================================================================
    private void seedBillingCyclesAndBulkPurchases(Apartment palmMeadows, Apartment parasGarden) {
        // --- Palm Meadows Cycles ---
        BillingCycle pmArchived = ensureBillingCycle(palmMeadows, LocalDate.of(2026, 6, 1), LocalDate.of(2026, 6, 30), BillingCycleStatus.ARCHIVED);
        BillingCycle pmJulFinalized = ensureBillingCycle(palmMeadows, LocalDate.of(2026, 7, 1), LocalDate.of(2026, 7, 31), BillingCycleStatus.FINALIZED);
        BillingCycle pmAugFinalized = ensureBillingCycle(palmMeadows, LocalDate.of(2026, 8, 1), LocalDate.of(2026, 8, 31), BillingCycleStatus.FINALIZED);
        BillingCycle pmOpen = ensureBillingCycle(palmMeadows, LocalDate.of(2026, 9, 1), LocalDate.of(2026, 9, 30), BillingCycleStatus.OPEN);

        // Bulk purchases for Palm Meadows
        ensureBulkPurchase(palmMeadows, pmJulFinalized, BulkPurchaseSource.MUNICIPAL, "BWSSB Municipal Mains", 120.0, 22.0, LocalDate.of(2026, 7, 10));
        ensureBulkPurchase(palmMeadows, pmJulFinalized, BulkPurchaseSource.TANKER, "Sri Venkateshwara Water Supply", 40.0, 75.0, LocalDate.of(2026, 7, 18));
        ensureBulkPurchase(palmMeadows, pmJulFinalized, BulkPurchaseSource.TANKER, "Kaveri Fresh Water Tankers", 35.0, 78.0, LocalDate.of(2026, 7, 28));

        ensureBulkPurchase(palmMeadows, pmAugFinalized, BulkPurchaseSource.MUNICIPAL, "BWSSB Municipal Mains", 140.0, 22.0, LocalDate.of(2026, 8, 15));
        ensureBulkPurchase(palmMeadows, pmAugFinalized, BulkPurchaseSource.TANKER, "Sri Venkateshwara Water Supply", 45.0, 80.0, LocalDate.of(2026, 8, 12));

        ensureBulkPurchase(palmMeadows, pmOpen, BulkPurchaseSource.MUNICIPAL, "BWSSB Municipal Mains", 150.0, 22.0, LocalDate.of(2026, 9, 10));
        ensureBulkPurchase(palmMeadows, pmOpen, BulkPurchaseSource.TANKER, "Sri Venkateshwara Water Supply", 50.0, 80.0, LocalDate.of(2026, 9, 15));

        // --- Paras Garden Cycles ---
        BillingCycle pgJulFinalized = ensureBillingCycle(parasGarden, LocalDate.of(2026, 7, 1), LocalDate.of(2026, 7, 31), BillingCycleStatus.FINALIZED);
        BillingCycle pgAugFinalized = ensureBillingCycle(parasGarden, LocalDate.of(2026, 8, 1), LocalDate.of(2026, 8, 31), BillingCycleStatus.FINALIZED);
        BillingCycle pgOpen = ensureBillingCycle(parasGarden, LocalDate.of(2026, 9, 1), LocalDate.of(2026, 9, 30), BillingCycleStatus.OPEN);

        // Bulk purchases for Paras Garden
        ensureBulkPurchase(parasGarden, pgJulFinalized, BulkPurchaseSource.TANKER, "Green Oasis Tankers", 30.0, 70.0, LocalDate.of(2026, 7, 15));
        ensureBulkPurchase(parasGarden, pgJulFinalized, BulkPurchaseSource.MUNICIPAL, "Municipal Water Board", 90.0, 20.0, LocalDate.of(2026, 7, 25));

        ensureBulkPurchase(parasGarden, pgAugFinalized, BulkPurchaseSource.TANKER, "Green Oasis Tankers", 40.0, 72.0, LocalDate.of(2026, 8, 10));
        ensureBulkPurchase(parasGarden, pgOpen, BulkPurchaseSource.TANKER, "Green Oasis Tankers", 45.0, 72.0, LocalDate.of(2026, 9, 12));
    }

    private BillingCycle ensureBillingCycle(Apartment apt, LocalDate start, LocalDate end, BillingCycleStatus status) {
        List<BillingCycle> existing = billingCycleRepository.findByApartmentIdOrderByStartDateDesc(apt.getId());
        for (BillingCycle c : existing) {
            if (c.getStartDate().equals(start) && c.getEndDate().equals(end)) {
                return c;
            }
        }
        BillingCycle cycle = BillingCycle.builder()
                .apartment(apt)
                .startDate(start)
                .endDate(end)
                .status(status)
                .build();
        return billingCycleRepository.save(cycle);
    }

    private void ensureBulkPurchase(Apartment apt, BillingCycle cycle, BulkPurchaseSource source, String vendor, Double volume, Double unitCost, LocalDate date) {
        List<BulkPurchase> existing = bulkPurchaseRepository.findByApartmentId(apt.getId());
        boolean exists = existing.stream().anyMatch(p -> p.getPurchasedAt().equals(date) && p.getVendorName().equalsIgnoreCase(vendor));
        if (!exists) {
            double totalCost = Math.round(volume * unitCost * 100.0) / 100.0;
            BulkPurchase p = BulkPurchase.builder()
                    .apartment(apt)
                    .billingCycle(cycle)
                    .sourceType(source)
                    .vendorName(vendor)
                    .volumeKl(volume)
                    .unitCost(unitCost)
                    .totalCost(totalCost)
                    .purchasedAt(date)
                    .build();
            bulkPurchaseRepository.save(p);
        }
    }

    // =========================================================================
    // 7. 30-DAY DAILY WATER READINGS & STATISTICAL LEAK OUTLIERS (MODULE 4)
    // =========================================================================
    private void seedHistoricalWaterUsageAndOutliers(Apartment palmMeadows, Apartment parasGarden) {
        LocalDate today = LocalDate.now();
        List<Household> households = new ArrayList<>();
        if (palmMeadows != null) {
            households.addAll(householdRepository.findByApartmentId(palmMeadows.getId()));
        }
        if (parasGarden != null) {
            households.addAll(householdRepository.findByApartmentId(parasGarden.getId()));
        }
        apartmentRepository.findFirstByNameOrderByIdAsc("Paras Garden").ifPresent(apt3 -> {
            if (parasGarden == null || !apt3.getId().equals(parasGarden.getId())) {
                households.addAll(householdRepository.findByApartmentId(apt3.getId()));
            }
        });

        Set<String> demoMeteredFlats = Set.of(
                "A-101", "A-102", "A-110", "A-220",
                "B-201", "B-202",
                "C-103", "C-106", "C-1120", "C-301", "C-302",
                "D-100", "D-104", "D-105", "D-109",
                "PG-101", "PG-102", "PG-201"
        );

        for (Household h : households) {
            if (h.getHasMeter() == null || !h.getHasMeter()) {
                h.setHasMeter(true);
                if (h.getMeterSerialNumber() == null || h.getMeterSerialNumber().isEmpty()) {
                    h.setMeterSerialNumber("MTR-" + h.getFlatNumber().replace("-", "") + "-" + (1000 + h.getId() * 37));
                }
                householdRepository.save(h);
            }

            double baseMeter = 50.0 + (h.getId() * 12.0);
            double dailyMean = 0.65;

            if (h.getFlatNumber().contains("A-101")) {
                dailyMean = 1.10; // Higher consumption, exceeds base tier
            } else if (h.getFlatNumber().contains("A-102")) {
                dailyMean = 0.55;
            } else if (h.getFlatNumber().contains("B-201")) {
                dailyMean = 0.80; // Outlier leak target!
            } else if (h.getFlatNumber().contains("B-202")) {
                dailyMean = 0.60;
            } else if (h.getFlatNumber().contains("C-301")) {
                dailyMean = 0.75;
            } else if (h.getFlatNumber().contains("D-104")) {
                dailyMean = 0.85;
            } else if (h.getFlatNumber().contains("PG-101")) {
                dailyMean = 0.70;
            } else if (h.getFlatNumber().contains("PG-102")) {
                dailyMean = 0.90;
            } else if (h.getFlatNumber().contains("PG-201")) {
                dailyMean = 0.60; // Outlier leak target!
            }

            double runningMeter = baseMeter;
            List<WaterUsageLog> logsToBatch = new ArrayList<>();

            for (int daysAgo = 365; daysAgo >= 0; daysAgo--) {
                LocalDate logDate = today.minusDays(daysAgo);
                Optional<WaterUsageLog> existingLogOpt = waterUsageLogRepository.findByHouseholdIdAndReadingDate(h.getId(), logDate);

                double delta;
                if (daysAgo == 365) {
                    delta = 0.0;
                } else if (daysAgo == 1 && h.getFlatNumber().equalsIgnoreCase("B-201")) {
                    // Intentional >3-sigma leak spike (4.85 kL vs mean 0.80 kL)
                    delta = 4.85;
                } else if (daysAgo == 1 && h.getFlatNumber().equalsIgnoreCase("PG-201")) {
                    // Intentional >3-sigma leak spike (4.20 kL vs mean 0.60 kL)
                    delta = 4.20;
                } else {
                    // Realistic normal variance (± 15%)
                    double noise = 0.85 + ((daysAgo % 7) * 0.05);
                    delta = Math.round(dailyMean * noise * 100.0) / 100.0;
                }

                runningMeter = Math.round((runningMeter + delta) * 100.0) / 100.0;

                if (existingLogOpt.isPresent()) {
                    WaterUsageLog existingLog = existingLogOpt.get();
                    if ((daysAgo == 1 && h.getFlatNumber().equalsIgnoreCase("B-201")) ||
                        (daysAgo == 1 && h.getFlatNumber().equalsIgnoreCase("PG-201"))) {
                        existingLog.setConsumptionKl(delta);
                        waterUsageLogRepository.save(existingLog);
                    }
                } else {
                    logsToBatch.add(WaterUsageLog.builder()
                            .household(h)
                            .readingDate(logDate)
                            .meterReadingKl(runningMeter)
                            .consumptionKl(delta)
                            .source(UsageSource.MANUAL)
                            .build());
                }
            }

            if (!logsToBatch.isEmpty()) {
                waterUsageLogRepository.saveAll(logsToBatch);
            }
        }
    }

    // =========================================================================
    // 8. ITEMIZED INVOICES (MODULE 3 & MODULE 5)
    // =========================================================================
    private void seedItemizedInvoices(Apartment palmMeadows, Apartment parasGarden) {
        String billingMonth = "2026-07";

        // Palm Meadows Invoices
        BillingCycle pmCycle = billingCycleRepository.findByApartmentIdOrderByStartDateDesc(palmMeadows.getId())
                .stream().filter(c -> c.getStatus() == BillingCycleStatus.FINALIZED).findFirst().orElse(null);

        ensureInvoice(palmMeadows, "A-101", pmCycle, billingMonth, "INV-202607-A101-0101", 60.0, 74.5, 14.5, 150.0, 306.0, 1245.0, 0.0, 1701.0,
                LocalDate.of(2026, 8, 15), InvoiceStatus.PAID, "RAZORPAY", "order_pm_a101_881", "pay_pm_a101_881", LocalDateTime.of(2026, 8, 5, 14, 30));

        ensureInvoice(palmMeadows, "A-102", pmCycle, billingMonth, "INV-202607-A102-0102", 50.0, 58.2, 8.2, 150.0, 147.6, 703.4, 0.0, 1001.0,
                LocalDate.of(2026, 8, 15), InvoiceStatus.PAID, "UPI", null, "UPI-REF-PM-A102", LocalDateTime.of(2026, 8, 7, 10, 15));

        ensureInvoice(palmMeadows, "B-201", pmCycle, billingMonth, "INV-202607-B201-0201", 100.0, 118.0, 18.0, 150.0, 404.0, 1546.0, 0.0, 2100.0,
                LocalDate.of(2026, 8, 15), InvoiceStatus.PENDING, null, null, null, null);

        ensureInvoice(palmMeadows, "B-202", pmCycle, billingMonth, "INV-202607-B202-0202", 55.0, 64.0, 9.0, 150.0, 162.0, 772.0, 0.0, 1084.0,
                LocalDate.of(2026, 8, 10), InvoiceStatus.OVERDUE, null, null, null, null);

        ensureInvoice(palmMeadows, "C-301", pmCycle, billingMonth, "INV-202607-C301-0301", 70.0, 81.5, 11.5, 150.0, 222.0, 987.0, 0.0, 1359.0,
                LocalDate.of(2026, 8, 15), InvoiceStatus.PAID, "CASH", null, "OFFLINE_CASH_RECEIPT_01", LocalDateTime.of(2026, 8, 4, 16, 45));

        ensureInvoice(palmMeadows, "C-302", pmCycle, billingMonth, "INV-202607-C302-0302", 0.0, 0.0, 0.0, 150.0, 0.0, 1158.0, 0.0, 1308.0,
                LocalDate.of(2026, 8, 15), InvoiceStatus.PENDING, null, null, null, null);

        // Paras Garden Invoices
        BillingCycle pgCycle = billingCycleRepository.findByApartmentIdOrderByStartDateDesc(parasGarden.getId())
                .stream().filter(c -> c.getStatus() == BillingCycleStatus.FINALIZED).findFirst().orElse(null);

        ensureInvoice(parasGarden, "PG-101", pgCycle, billingMonth, "INV-202607-PG101-0401", 45.0, 56.0, 11.0, 120.0, 175.0, 950.0, 0.0, 1245.0,
                LocalDate.of(2026, 8, 15), InvoiceStatus.PAID, "RAZORPAY", "order_pg_101_771", "pay_pg_101_771", LocalDateTime.of(2026, 8, 6, 11, 20));

        ensureInvoice(parasGarden, "PG-102", pgCycle, billingMonth, "INV-202607-PG102-0402", 50.0, 63.5, 13.5, 120.0, 237.5, 1165.5, 0.0, 1523.0,
                LocalDate.of(2026, 8, 15), InvoiceStatus.PAID, "UPI", null, "UPI-REF-PG-102", LocalDateTime.of(2026, 8, 8, 18, 00));

        ensureInvoice(parasGarden, "PG-201", pgCycle, billingMonth, "INV-202607-PG201-0403", 60.0, 76.0, 16.0, 120.0, 300.0, 1380.0, 0.0, 1800.0,
                LocalDate.of(2026, 8, 15), InvoiceStatus.PENDING, null, null, null, null);

        ensureInvoice(parasGarden, "PG-202", pgCycle, billingMonth, "INV-202607-PG202-0404", 0.0, 0.0, 0.0, 120.0, 0.0, 1080.0, 0.0, 1200.0,
                LocalDate.of(2026, 8, 15), InvoiceStatus.PAID, "CASH", null, "OFFLINE_CASH_PG_02", LocalDateTime.of(2026, 8, 5, 15, 10));
    }

    private void ensureInvoice(Apartment apt, String flatNumber, BillingCycle cycle, String billingMonth, String invoiceNum,
                               Double startKl, Double endKl, Double consumption, Double baseCharge, Double meteredCharge,
                               Double sharedCharge, Double adjustments, Double totalAmount, LocalDate dueDate,
                               InvoiceStatus status, String payMethod, String rzpOrder, String rzpPay, LocalDateTime paidAt) {
        Household h = householdRepository.findByApartmentIdAndFlatNumber(apt.getId(), flatNumber).orElse(null);
        if (h == null) return;

        Optional<Invoice> existing = invoiceRepository.findByInvoiceNumber(invoiceNum);
        if (existing.isEmpty()) {
            Invoice inv = Invoice.builder()
                    .invoiceNumber(invoiceNum)
                    .household(h)
                    .billingCycle(cycle)
                    .billingMonth(billingMonth)
                    .meterReadingStartKl(startKl)
                    .meterReadingEndKl(endKl)
                    .consumptionKl(consumption)
                    .baseCharge(baseCharge)
                    .meteredCharge(meteredCharge)
                    .sharedCharge(sharedCharge)
                    .adjustments(adjustments)
                    .totalAmount(totalAmount)
                    .dueDate(dueDate)
                    .status(status)
                    .paymentMethod(payMethod)
                    .razorpayOrderId(rzpOrder)
                    .razorpayPaymentId(rzpPay)
                    .paidAt(paidAt)
                    .build();
            invoiceRepository.save(inv);
        }
    }

    // =========================================================================
    // 9. ALERTS SEEDING (MODULE 4)
    // =========================================================================
    private void seedAlerts(Apartment palmMeadows, Apartment parasGarden) {
        List<Household> households = new ArrayList<>();
        if (palmMeadows != null) {
            households.addAll(householdRepository.findByApartmentId(palmMeadows.getId()));
        }
        if (parasGarden != null) {
            households.addAll(householdRepository.findByApartmentId(parasGarden.getId()));
        }

        Set<String> demoFlats = Set.of("A-101", "A-102", "B-201", "B-202", "C-301", "C-302", "PG-101", "PG-102", "PG-201", "PG-202");

        for (Household h : households) {
            if (!demoFlats.contains(h.getFlatNumber())) {
                continue;
            }
            List<Alert> existing = alertRepository.findByHouseholdIdOrderBySentAtDesc(h.getId());
            boolean hasAnomaly = existing.stream().anyMatch(a -> a.getType() == AlertType.ANOMALY);
            boolean hasOveruse = existing.stream().anyMatch(a -> a.getType() == AlertType.OVERUSE);
            boolean hasBill = existing.stream().anyMatch(a -> a.getType() == AlertType.BILL_READY);

            String flat = h.getFlatNumber().toUpperCase();

            // 1. Seed Leak Anomaly for high outlier flats
            if (!hasAnomaly && (flat.contains("201") || flat.contains("301") || flat.contains("B-201") || flat.contains("PG-201"))) {
                alertRepository.save(Alert.builder()
                        .household(h)
                        .type(AlertType.ANOMALY)
                        .message("🚨 Potential Water Leak Detected: Yesterday's consumption of 4.85 kL is 22.5σ above your 30-day baseline average of 0.80 kL/day. Please inspect internal plumbing fixtures.")
                        .isRead(false)
                        .sentAt(LocalDateTime.now().minusHours(4))
                        .build());
            }

            // 2. Seed Overuse Surcharge Warning for moderate-high consuming flats
            if (!hasOveruse && (flat.contains("101") || flat.contains("102") || flat.contains("A-101") || flat.contains("PG-101") || flat.contains("202"))) {
                alertRepository.save(Alert.builder()
                        .household(h)
                        .type(AlertType.OVERUSE)
                        .message("⚠️ Tiered Tariff Surcharge Warning: Current monthly water consumption has reached 14.50 kL (Base Tier Limit: 10.0 kL). Tier 2 progressive rate ₹28.00/kL applies to additional usage.")
                        .isRead(false)
                        .sentAt(LocalDateTime.now().minusDays(1))
                        .build());
            }

            // 3. Seed Bill Ready / Payment Receipt alerts
            if (!hasBill) {
                // Payment confirmation
                alertRepository.save(Alert.builder()
                        .household(h)
                        .type(AlertType.BILL_READY)
                        .message("✅ Payment of ₹1,485.00 for July 2026 was successfully processed via Razorpay. Digital invoice and tax receipt are ready for download.")
                        .isRead(true)
                        .sentAt(LocalDateTime.now().minusDays(5))
                        .build());

                // Active invoice notice
                alertRepository.save(Alert.builder()
                        .household(h)
                        .type(AlertType.BILL_READY)
                        .message("📄 Official Water Invoice for July 2026 has been generated. Due date: 15 August 2026.")
                        .isRead(false)
                        .sentAt(LocalDateTime.now().minusDays(6))
                        .build());
            }
        }
    }
}


