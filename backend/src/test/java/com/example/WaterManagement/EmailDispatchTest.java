package com.example.WaterManagement;

import com.example.WaterManagement.service.EmailService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
public class EmailDispatchTest {

    @Autowired
    private EmailService emailService;

    @Test
    public void testOfficialCredentialsEmailDispatch() {
        System.out.println("🚀 Dispatching official HTML Credentials Email to jainakshay0804@gmail.com...");

        boolean sent = emailService.sendResidentCredentialsEmail(
                "test_resident@aquatrack.com",
                "Akshay Jain",
                "Paras Garden Residences",
                "A-103",
                "MTR-A103-5120",
                "Resident@123"
        );

        System.out.println("📬 Official Email Delivery Result: " + sent);
        assertTrue(sent, "Email should be dispatched successfully over Gmail SMTP");
    }

    @Test
    public void testLeakAnomalyAlertEmailDispatch() {
        System.out.println("🚨 Dispatching Statistical 2σ Leak Anomaly Alert Email to jainakshay0804@gmail.com...");

        boolean sent = emailService.sendLeakAnomalyAlertEmail(
                "test_resident@aquatrack.com",
                "Akshay Jain",
                "Paras Garden Apartments",
                "PG-201",
                4.85,
                0.80,
                0.15,
                22.5
        );

        System.out.println("🚨 Leak Alert Delivery Result: " + sent);
        assertTrue(sent, "Leak alert email should be dispatched successfully over Gmail SMTP");
    }

    @Test
    public void testSupportTicketEmailsDispatch() {
        System.out.println("🎫 Testing Support Ticket Email Flows...");

        // 1. Admin Alert
        boolean adminNotified = emailService.sendNewTicketNotificationToAdmin(
                "test_resident@aquatrack.com",
                "Akshay Jain (Admin)",
                "Paras Garden Apartments",
                "PG-101",
                "PLUMBING",
                "HIGH",
                "Main pipeline leaking near kitchen valve",
                "Water is continuously dripping and pressure has dropped significantly.",
                101L
        );
        assertTrue(adminNotified, "Admin ticket notification email should succeed");

        // 2. Resident Acknowledgment
        boolean residentAck = emailService.sendTicketCreatedAcknowledgment(
                "test_resident@aquatrack.com",
                "Arjun Sharma",
                "PG-101",
                "Paras Garden Apartments",
                101L,
                "Main pipeline leaking near kitchen valve",
                "HIGH"
        );
        assertTrue(residentAck, "Resident ticket acknowledgment email should succeed");

        // 3. Escalated Concern to Main Admin
        boolean concernNotified = emailService.sendCommunityConcernToMainAdmin(
                "test_resident@aquatrack.com",
                "Akshay Jain (Admin)",
                "admin@parasgarden.in",
                "Paras Garden Apartments",
                101L,
                "Main Inlet Flow Sensor Failure",
                "Society main inlet ultrasonic meter not sending pulses since 06:00.",
                "Requires vendor technician visit."
        );
        assertTrue(concernNotified, "Main admin concern escalation email should succeed");

        // 4. Ticket Resolution Notice
        boolean resolvedNotice = emailService.sendTicketResolutionNotification(
                "test_resident@aquatrack.com",
                "Arjun Sharma",
                101L,
                "Main pipeline leaking near kitchen valve",
                "Technician replaced the rubber washer and tightened valve union. Zero leakage verified.",
                "COMMUNITY_ADMIN"
        );
        assertTrue(resolvedNotice, "Ticket resolution email should succeed");
    }

    @Test
    public void testBillingAndPaymentEmailsDispatch() {
        System.out.println("💳 Testing Billing & Payment Email Flows...");

        // 1. Payment Receipt to Resident
        boolean receiptSent = emailService.sendPaymentReceiptToResident(
                "test_resident@aquatrack.com",
                "Arjun Sharma",
                "D-100",
                "Paras Garden Apartments",
                "INV-202609-D100-0033",
                450.00,
                "Razorpay UPI (GPay)",
                "pay_OmkX89aZvLt1",
                java.time.LocalDateTime.now(),
                "2026-09"
        );
        assertTrue(receiptSent, "Resident payment receipt email should succeed");

        // 2. Payment Notice to Community Admin
        boolean adminNotice = emailService.sendPaymentReceivedNoticeToAdmin(
                "test_resident@aquatrack.com",
                "Akshay Jain (Admin)",
                "Paras Garden Apartments",
                "D-100",
                "INV-202609-D100-0033",
                450.00,
                "Razorpay UPI (GPay)",
                "pay_OmkX89aZvLt1"
        );
        assertTrue(adminNotice, "Admin payment notice email should succeed");

        // 3. Due / Overdue Bill Reminder with PDF attachment
        byte[] samplePdf = "Sample PDF content for JalSetu Invoice".getBytes(java.nio.charset.StandardCharsets.UTF_8);
        boolean reminderSent = emailService.sendPendingDueBillReminder(
                "test_resident@aquatrack.com",
                "Arjun Sharma",
                "D-100",
                "Paras Garden Apartments",
                "INV-202609-D100-0033",
                450.00,
                java.time.LocalDate.now().plusDays(3),
                false,
                "2026-09",
                samplePdf
        );
        assertTrue(reminderSent, "Pending due bill reminder email with PDF should succeed");

        // 4. Monthly Bill Notification with PDF attachment
        boolean monthlyBillSent = emailService.sendMonthlyBillNotificationEmail(
                "test_resident@aquatrack.com",
                "Arjun Sharma",
                "Paras Garden Apartments",
                "D-100",
                "INV-202609-D100-0033",
                "2026-09",
                450.00,
                java.time.LocalDate.now().plusDays(15),
                8.50,
                samplePdf
        );
        assertTrue(monthlyBillSent, "Monthly bill notification email with attached PDF should succeed");
    }

    @Test
    public void testAnnouncementBroadcastEmailDispatch() {
        System.out.println("📢 Testing Announcement & Notice Email Broadcast...");

        boolean sent = emailService.sendAnnouncementBroadcastEmail(
                "test_resident@aquatrack.com",
                "Arjun Sharma",
                "Paras Garden Apartments",
                "Scheduled Water Pipeline Maintenance",
                "MAINTENANCE",
                "IMPORTANT",
                "Dear Residents,\n\nPlease be informed that quarterly overhead tank cleaning will occur tomorrow from 10:00 AM to 02:00 PM. Water supply will remain temporarily suspended.\n\nThank you for your cooperation."
        );
        assertTrue(sent, "Announcement broadcast email should succeed");
    }
}
