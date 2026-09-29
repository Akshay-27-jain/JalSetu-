package com.example.WaterManagement.service;

import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:jainakshay0804@gmail.com}")
    private String fromEmail;

    @Value("${app.portal.url:http://localhost:5173}")
    private String portalUrl;

    public EmailService(@Autowired(required = false) JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Check if email is a fake, dummy, or test address to prevent live SMTP dispatch and delivery bounces.
     */
    public static boolean isDummyOrTestEmail(String email) {
        if (email == null || email.trim().isEmpty()) return true;
        String lower = email.trim().toLowerCase();
        return lower.endsWith("@aquatrack.com")
                || lower.endsWith("@example.com")
                || lower.endsWith("@test.com")
                || lower.endsWith("@invalid")
                || lower.endsWith("@sample.com")
                || lower.startsWith("ca_test_")
                || lower.startsWith("res_fake_")
                || lower.startsWith("fake_")
                || lower.contains("placeholder")
                || lower.contains("dummy");
    }

    /**
     * Send official onboarding credentials email to newly registered resident
     */
    public boolean sendResidentCredentialsEmail(String toEmail,
                                                String residentName,
                                                String apartmentName,
                                                String flatNumber,
                                                String meterSerialNumber,
                                                String tempPassword) {
        if (isDummyOrTestEmail(toEmail)) {
            log.info("ℹ️ Skipped live SMTP dispatch for test/dummy recipient: {} (Flat {})", toEmail, flatNumber);
            return true;
        }

        String subject = "💧 Welcome to JalSetu — Your Water Portal Login Credentials (Flat " + flatNumber + ")";
        String loginLink = portalUrl + "/login?email=" + URLEncoder.encode(toEmail, StandardCharsets.UTF_8)
                + "&flat=" + URLEncoder.encode(flatNumber, StandardCharsets.UTF_8)
                + "&meter=" + URLEncoder.encode(meterSerialNumber != null ? meterSerialNumber : "MTR-" + flatNumber, StandardCharsets.UTF_8)
                + "&role=resident";

        String htmlContent = buildCredentialsEmailHtml(residentName, apartmentName, flatNumber, meterSerialNumber, toEmail, tempPassword, loginLink);

        try {
            if (mailSender != null && fromEmail != null && !fromEmail.isEmpty()) {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

                helper.setFrom(fromEmail, "JalSetu Water Platform");
                helper.setTo(toEmail);
                helper.setSubject(subject);
                helper.setText(htmlContent, true);

                mailSender.send(message);
                log.info("✅ LIVE EMAIL DISPATCH SUCCESS: Sent credentials email to {} (Flat {})", toEmail, flatNumber);
                return true;
            } else {
                log.info("ℹ️ JavaMailSender not configured. Email preview for {}: \n{}", toEmail, htmlContent);
                return false;
            }
        } catch (Exception e) {
            log.error("❌ Live SMTP dispatch error to {}: {}", toEmail, e.getMessage(), e);
            return false;
        }
    }

    /**
     * Send password change confirmation notice
     */
    public void sendPasswordChangeConfirmation(String toEmail, String residentName) {
        if (isDummyOrTestEmail(toEmail)) {
            log.info("ℹ️ Skipped live SMTP dispatch for test/dummy recipient: {}", toEmail);
            return;
        }

        String subject = "🔒 JalSetu Security Notice — Password Updated Successfully";
        String htmlContent = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;'>"
                + "<div style='text-align: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 15px; margin-bottom: 20px;'>"
                + "  <h2 style='color: #0284c7; margin: 0;'>JalSetu (जलसेतु) Security Notice</h2>"
                + "</div>"
                + "<p style='font-size: 15px; color: #1e293b;'>Dear <strong>" + residentName + "</strong>,</p>"
                + "<p style='font-size: 14px; color: #475569; line-height: 1.6;'>Your account password was successfully updated and encrypted in our database. You can now use your new password for all future sign-ins.</p>"
                + "<div style='background-color: #f8fafc; padding: 15px; border-radius: 10px; border-left: 4px solid #0284c7; margin: 20px 0;'>"
                + "  <p style='margin: 0; font-size: 13px; color: #334155;'>If you did not make this change, please contact your Community Admin immediately to safeguard your account.</p>"
                + "</div>"
                + "<p style='color: #94a3b8; font-size: 12px; text-align: center; margin-top: 30px;'>JalSetu Smart Water Monitoring & Automated Billing Platform</p>"
                + "</div>";

        try {
            if (mailSender != null) {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                helper.setFrom(fromEmail, "JalSetu Security");
                helper.setTo(toEmail);
                helper.setSubject(subject);
                helper.setText(htmlContent, true);
                mailSender.send(message);
                log.info("✅ Password confirmation email sent to: {}", toEmail);
            }
        } catch (Exception e) {
            log.warn("⚠️ Password change email notice error ({}): {}", e.getMessage(), toEmail);
        }
    }

    /**
     * Send Water Overuse Alert Notification Email
     */
    public boolean sendWaterOveruseAlertEmail(String toEmail,
                                             String residentName,
                                             String apartmentName,
                                             String flatNumber,
                                             Double currentUsageKl,
                                             Double thresholdKl,
                                             String billingMonth) {
        String subject = "⚠️ High Water Consumption Alert — Flat " + flatNumber + " (" + apartmentName + ")";
        String htmlContent = "<!DOCTYPE html><html><body style='font-family: Arial, sans-serif; background-color: #f8fafc; padding: 25px; margin: 0;'>"
                + "<div style='max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.05);'>"
                + "  <div style='background: linear-gradient(135deg, #d97706 0%, #b45309 100%); padding: 30px 25px; color: #ffffff; text-align: center;'>"
                + "    <h2 style='margin: 0; font-size: 22px;'>⚠️ Water Overuse Notice</h2>"
                + "    <p style='margin: 5px 0 0 0; opacity: 0.9; font-size: 13px;'>Monthly Consumption Threshold Exceeded</p>"
                + "  </div>"
                + "  <div style='padding: 25px; color: #334155; font-size: 14px; line-height: 1.6;'>"
                + "    <p>Dear <strong>" + residentName + "</strong> (Flat " + flatNumber + "),</p>"
                + "    <p>Your metered water consumption for <strong>" + billingMonth + "</strong> has reached <strong style='color: #b45309;'>" + currentUsageKl + " kL</strong> (" + Math.round(currentUsageKl * 1000) + " Liters), which exceeds your community's base tier threshold of <strong>" + thresholdKl + " kL</strong>.</p>"
                + "    <div style='background: #fffbeb; border: 1.5px solid #fde68a; border-radius: 12px; padding: 15px; margin: 20px 0;'>"
                + "      <p style='margin: 0; font-size: 13px; color: #92400e;'><strong>💡 Conservation Tip:</strong> Subsequent consumption will be billed under higher rate tiers. Please check for running taps, leaking toilet cisterns, or RO purifier discharge.</p>"
                + "    </div>"
                + "    <div style='text-align: center; margin: 25px 0;'>"
                + "      <a href='" + portalUrl + "/resident/dashboard' style='background: #0284c7; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: bold; font-size: 13px;'>View Live Usage Meter &rarr;</a>"
                + "    </div>"
                + "  </div>"
                + "  <div style='background: #f1f5f9; padding: 15px; text-align: center; font-size: 11px; color: #64748b;'>"
                + "    JalSetu Smart Water Management • " + apartmentName
                + "  </div>"
                + "</div></body></html>";

        return dispatchHtmlEmail(toEmail, subject, htmlContent, flatNumber);
    }

    /**
     * Send Statistical Leak Anomaly Warning Email (Usage > 2-Sigma Outlier)
     */
    public boolean sendLeakAnomalyAlertEmail(String toEmail,
                                            String residentName,
                                            String apartmentName,
                                            String flatNumber,
                                            Double currentUsageKl,
                                            Double meanUsageKl,
                                            Double stdDev,
                                            Double zScore) {
        return sendLeakAnomalyAlertEmail(toEmail, residentName, apartmentName, flatNumber, currentUsageKl, meanUsageKl, stdDev, zScore, null);
    }

    public boolean sendLeakAnomalyAlertEmail(String toEmail,
                                            String residentName,
                                            String apartmentName,
                                            String flatNumber,
                                            Double currentUsageKl,
                                            Double meanUsageKl,
                                            Double stdDev,
                                            Double zScore,
                                            String customNote) {
        String subject = "🚨 URGENT: Potential Water Leak Detected (Outlier >2σ) — Flat " + flatNumber;
        String customNoteHtml = (customNote != null && !customNote.trim().isEmpty())
                ? "<div style='background: #f8fafc; border-left: 4px solid #dc2626; border-radius: 8px; padding: 14px 16px; margin: 18px 0; font-size: 13.5px; color: #1e293b;'>"
                + "  <strong style='color: #0f172a; display: block; margin-bottom: 4px;'>📝 Society Admin Advisory Note:</strong>"
                + "  <span style='white-space: pre-wrap;'>" + customNote.trim() + "</span>"
                + "</div>"
                : "";

        String htmlContent = "<!DOCTYPE html><html><body style='font-family: Arial, sans-serif; background-color: #f8fafc; padding: 25px; margin: 0;'>"
                + "<div style='max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #fecaca; box-shadow: 0 4px 20px rgba(220,38,38,0.08);'>"
                + "  <div style='background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 30px 25px; color: #ffffff; text-align: center;'>"
                + "    <h2 style='margin: 0; font-size: 22px;'>🚨 Potential Water Leak Detected</h2>"
                + "    <p style='margin: 5px 0 0 0; opacity: 0.9; font-size: 13px;'>Statistical Outlier Anomaly (Z-Score: " + String.format("%.1f", zScore) + "σ)</p>"
                + "  </div>"
                + "  <div style='padding: 25px; color: #334155; font-size: 14px; line-height: 1.6;'>"
                + "    <p>Dear <strong>" + residentName + "</strong> (Flat " + flatNumber + "),</p>"
                + "    <p>Our automated AI leak engine detected an abnormal spike in your water meter dial. Today's consumption of <strong style='color: #dc2626; font-size: 16px;'>" + currentUsageKl + " kL</strong> is <strong>" + String.format("%.1f", zScore) + " standard deviations</strong> higher than your historical baseline average (" + String.format("%.2f", meanUsageKl) + " kL/day).</p>"
                + customNoteHtml
                + "    <div style='background: #fef2f2; border: 1.5px solid #fecaca; border-radius: 12px; padding: 16px; margin: 20px 0; color: #991b1b; font-size: 13px;'>"
                + "      <p style='margin: 0 0 8px 0; font-weight: bold;'>⚠️ Immediate Steps Recommended:</p>"
                + "      <ul style='margin: 0; padding-left: 20px; line-height: 1.6;'>"
                + "        <li>Inspect internal plumbing, flush tanks, washbasin pipes, and geysers.</li>"
                + "        <li>If taps are closed, check if the meter dial is still spinning (continuous leakage).</li>"
                + "        <li>Contact your building maintenance team if an unseen line fracture is suspected.</li>"
                + "      </ul>"
                + "    </div>"
                + "    <div style='text-align: center; margin: 25px 0;'>"
                + "      <a href='" + portalUrl + "/resident/dashboard' style='background: #dc2626; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: bold; font-size: 13px;'>Inspect Usage Logs Now &rarr;</a>"
                + "    </div>"
                + "  </div>"
                + "  <div style='background: #f1f5f9; padding: 15px; text-align: center; font-size: 11px; color: #64748b;'>"
                + "    JalSetu Automated Anomaly & Leak Detection Engine • " + apartmentName
                + "  </div>"
                + "</div></body></html>";

        return dispatchHtmlEmail(toEmail, subject, htmlContent, flatNumber);
    }

    /**
     * Send Monthly Bill Notification Email with optional PDF Invoice attachment
     */
    public boolean sendMonthlyBillNotificationEmail(String toEmail,
                                                    String residentName,
                                                    String apartmentName,
                                                    String flatNumber,
                                                    String invoiceNumber,
                                                    String billingMonth,
                                                    Double totalAmount,
                                                    java.time.LocalDate dueDate,
                                                    Double consumptionKl,
                                                    byte[] pdfAttachment) {
        String subject = "💧 Your JalSetu Water Bill for " + billingMonth + " (Flat " + flatNumber + ") — ₹" + String.format("%.2f", totalAmount);
        String paymentLink = portalUrl + "/resident/bills";

        String htmlContent = "<!DOCTYPE html><html><body style='font-family: Arial, sans-serif; background-color: #f8fafc; padding: 25px; margin: 0;'>"
                + "<div style='max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.06);'>"
                + "  <div style='background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); padding: 30px 25px; color: #ffffff; text-align: center;'>"
                + "    <h2 style='margin: 0; font-size: 24px; font-weight: 800;'>JalSetu (जलसेतु)</h2>"
                + "    <p style='margin: 6px 0 0 0; opacity: 0.9; font-size: 13px;'>Monthly Household Water Bill • " + billingMonth + "</p>"
                + "  </div>"
                + "  <div style='padding: 30px 25px; color: #334155; font-size: 14px; line-height: 1.6;'>"
                + "    <p style='margin-top: 0;'>Dear <strong>" + residentName + "</strong> (Flat " + flatNumber + "),</p>"
                + "    <p>Your water invoice for the billing period <strong>" + billingMonth + "</strong> at <strong>" + apartmentName + "</strong> has been generated.</p>"
                + "    <div style='background: #f0f9ff; border: 1.5px solid #bae6fd; border-radius: 14px; padding: 18px; margin: 20px 0;'>"
                + "      <table style='width: 100%; font-size: 13.5px; color: #0f172a; border-collapse: collapse;'>"
                + "        <tr><td style='padding: 6px 0; color: #64748b;'>Invoice Number:</td><td><strong style='font-family: monospace;'>" + invoiceNumber + "</strong></td></tr>"
                + "        <tr><td style='padding: 6px 0; color: #64748b;'>Metered Volume:</td><td><strong>" + String.format("%.2f", consumptionKl) + " kL</strong> (" + Math.round(consumptionKl * 1000) + " Liters)</td></tr>"
                + "        <tr><td style='padding: 6px 0; color: #64748b;'>Payment Due Date:</td><td><strong style='color: #b45309;'>" + (dueDate != null ? dueDate.toString() : "N/A") + "</strong></td></tr>"
                + "        <tr style='border-top: 1px solid #bae6fd;'><td style='padding: 10px 0 4px 0; font-size: 15px; font-weight: bold; color: #0369a1;'>Total Amount Payable:</td><td style='padding: 10px 0 4px 0; font-size: 18px; font-weight: 800; color: #0369a1;'>₹" + String.format("%.2f", totalAmount) + "</td></tr>"
                + "      </table>"
                + "    </div>"
                + "    <div style='text-align: center; margin: 28px 0;'>"
                + "      <a href='" + paymentLink + "' style='background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 800; font-size: 14px; display: inline-block; box-shadow: 0 4px 15px rgba(2,132,199,0.3);'>💳 Pay Online via UPI / Card &rarr;</a>"
                + "    </div>"
                + "    <p style='font-size: 12px; color: #64748b; text-align: center;'>An itemized PDF copy of this bill is attached to this email for your records.</p>"
                + "  </div>"
                + "  <div style='background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px; text-align: center; font-size: 11px; color: #94a3b8;'>"
                + "    JalSetu Smart Water Management • " + apartmentName + " • www.jalsetu.in"
                + "  </div>"
                + "</div></body></html>";

        return dispatchEmailWithAttachment(toEmail, subject, htmlContent, flatNumber, "JalSetu_Invoice_" + invoiceNumber + ".pdf", pdfAttachment);
    }

    /**
     * Send Statistical Anomaly Summary Report to Community Administrators
     */
    public boolean sendAdminAnomalySummaryReportEmail(String adminEmail,
                                                      String adminName,
                                                      String apartmentName,
                                                      int outlierCount,
                                                      int highRiskCount,
                                                      java.util.List<String> outlierDetails) {
        String subject = "🚨 JalSetu Admin Alert: " + outlierCount + " Potential Water Leaks (>2σ) Detected in " + apartmentName;
        String dashboardLink = portalUrl + "/community-admin/leakage";

        StringBuilder detailsHtml = new StringBuilder();
        if (outlierDetails != null && !outlierDetails.isEmpty()) {
            detailsHtml.append("<ul style='margin: 10px 0; padding-left: 20px; line-height: 1.6;'>");
            for (String d : outlierDetails) {
                detailsHtml.append("<li style='margin-bottom: 6px;'>").append(d).append("</li>");
            }
            detailsHtml.append("</ul>");
        } else {
            detailsHtml.append("<p>No critical household anomalies detected in this audit cycle.</p>");
        }

        String htmlContent = "<!DOCTYPE html><html><body style='font-family: Arial, sans-serif; background-color: #f8fafc; padding: 25px; margin: 0;'>"
                + "<div style='max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.06);'>"
                + "  <div style='background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 30px 25px; color: #ffffff; text-align: center;'>"
                + "    <h2 style='margin: 0; font-size: 22px;'>🚨 Statistical Anomaly & Leak Audit Report</h2>"
                + "    <p style='margin: 5px 0 0 0; opacity: 0.9; font-size: 13px;'>Community Administrator Digest • " + apartmentName + "</p>"
                + "  </div>"
                + "  <div style='padding: 25px; color: #334155; font-size: 14px; line-height: 1.6;'>"
                + "    <p>Dear <strong>" + adminName + "</strong> (Community Administrator),</p>"
                + "    <p>The JalSetu 2-Sigma (2σ) automated statistical scan detected <strong style='color: #dc2626;'>" + outlierCount + " households</strong> exhibiting abnormal consumption spikes above their 30-day baseline.</p>"
                + "    <div style='background: #fef2f2; border: 1.5px solid #fecaca; border-radius: 12px; padding: 16px; margin: 20px 0; color: #991b1b;'>"
                + "      <p style='margin: 0 0 6px 0; font-weight: bold;'>Flagged Outlier Households:</p>"
                +        detailsHtml.toString()
                + "    </div>"
                + "    <div style='text-align: center; margin: 25px 0;'>"
                + "      <a href='" + dashboardLink + "' style='background: #dc2626; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: bold; font-size: 13px;'>Open Admin Leakage Center &rarr;</a>"
                + "    </div>"
                + "  </div>"
                + "  <div style='background: #f1f5f9; padding: 15px; text-align: center; font-size: 11px; color: #64748b;'>"
                + "    JalSetu Automated Anomaly & Leak Detection Engine • " + apartmentName
                + "  </div>"
                + "</div></body></html>";

        return dispatchHtmlEmail(adminEmail, subject, htmlContent, "ADMIN");
    }

    private boolean dispatchHtmlEmail(String toEmail, String subject, String htmlContent, String targetIdentifier) {
        return dispatchEmailWithAttachment(toEmail, subject, htmlContent, targetIdentifier, null, null);
    }

    private boolean dispatchEmailWithAttachment(String toEmail, String subject, String htmlContent, String targetIdentifier, String attachmentFilename, byte[] attachmentBytes) {
        if (isDummyOrTestEmail(toEmail)) {
            log.info("ℹ️ Skipped live SMTP dispatch for test/dummy recipient: {} ({})", toEmail, targetIdentifier);
            return true;
        }

        try {
            if (mailSender != null && fromEmail != null && !fromEmail.isEmpty()) {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                helper.setFrom(fromEmail, "JalSetu Water Alerts");
                helper.setTo(toEmail);
                helper.setSubject(subject);
                helper.setText(htmlContent, true);

                if (attachmentFilename != null && attachmentBytes != null && attachmentBytes.length > 0) {
                    helper.addAttachment(attachmentFilename, new org.springframework.core.io.ByteArrayResource(attachmentBytes));
                }

                mailSender.send(message);
                log.info("✅ EMAIL DISPATCHED to {} ({})", toEmail, targetIdentifier);
                return true;
            } else {
                log.info("ℹ️ JavaMailSender not configured. Email preview for {}: \n{}", toEmail, subject);
                return false;
            }
        } catch (Exception e) {
            log.error("❌ Email dispatch error to {}: {}", toEmail, e.getMessage());
            return false;
        }
    }

    private String buildCredentialsEmailHtml(String residentName,
                                             String apartmentName,
                                             String flatNumber,
                                             String meterSerialNumber,
                                             String email,
                                             String tempPassword,
                                             String loginLink) {
        return "<!DOCTYPE html>"
                + "<html>"
                + "<head>"
                + "  <meta charset='UTF-8'>"
                + "  <meta name='viewport' content='width=device-width, initial-scale=1.0'>"
                + "</head>"
                + "<body style='font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 30px 10px;'>"
                + "  <div style='max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 15px 35px rgba(15, 23, 42, 0.08); border: 1px solid #e2e8f0;'>"
                
                // Header
                + "    <div style='background: linear-gradient(135deg, #0f172a 0%, #0369a1 50%, #0284c7 100%); padding: 40px 30px; text-align: center; color: #ffffff;'>"
                + "      <div style='display: inline-block; background: rgba(255, 255, 255, 0.15); border: 1px solid rgba(255, 255, 255, 0.25); border-radius: 9999px; padding: 6px 18px; margin-bottom: 12px;'>"
                + "        <span style='font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #bae6fd;'>💧 Community Water Portal</span>"
                + "      </div>"
                + "      <h1 style='margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;'>JalSetu <span style='font-weight: 300; opacity: 0.85;'>| जलसेतु</span></h1>"
                + "      <p style='margin: 8px 0 0; font-size: 14px; opacity: 0.9; color: #e0f2fe;'>Smart Sub-Metered Water Monitoring & Automated Billing</p>"
                + "    </div>"

                // Content Body
                + "    <div style='padding: 35px 30px; color: #334155;'>"
                + "      <p style='font-size: 16px; margin-top: 0; color: #0f172a;'>Hello <strong>" + residentName + "</strong>,</p>"
                + "      <p style='font-size: 14px; line-height: 1.6; color: #475569;'>Your residential flat in <strong>" + apartmentName + "</strong> has been registered on the <strong>JalSetu Smart Water Management Platform</strong>. You can now monitor your daily water consumption, inspect tiered tariffs, receive overuse alerts, and view your monthly invoices.</p>"

                // Credentials Box
                + "      <div style='background: linear-gradient(180deg, #f0fdf4 0%, #ecfdf5 100%); border: 1.5px solid #86efac; border-radius: 18px; padding: 22px; margin: 25px 0; box-shadow: 0 4px 12px rgba(22, 101, 52, 0.05);'>"
                + "        <div style='display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #bbf7d0; padding-bottom: 10px; margin-bottom: 14px;'>"
                + "          <span style='font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #166534;'>🔑 Your Sign-In Credentials</span>"
                + "          <span style='font-size: 11px; background: #dcfce7; color: #15803d; font-weight: 700; padding: 2px 8px; border-radius: 6px;'>Active</span>"
                + "        </div>"
                + "        <table style='width: 100%; font-size: 13.5px; color: #1e293b; border-collapse: collapse;'>"
                + "          <tr><td style='padding: 7px 0; font-weight: 600; color: #64748b; width: 140px;'>Apartment Unit:</td><td><strong style='color: #0f172a;'>Flat " + flatNumber + "</strong></td></tr>"
                + "          <tr><td style='padding: 7px 0; font-weight: 600; color: #64748b;'>Meter Serial No:</td><td><code style='background: #e0f2fe; color: #0369a1; padding: 3px 8px; border-radius: 6px; font-family: ui-monospace, monospace; font-weight: 700; border: 1px solid #bae6fd;'>" + (meterSerialNumber != null ? meterSerialNumber : "MTR-" + flatNumber) + "</code></td></tr>"
                + "          <tr><td style='padding: 7px 0; font-weight: 600; color: #64748b;'>Login Email:</td><td><strong style='color: #0f172a; font-family: ui-monospace, monospace;'>" + email + "</strong></td></tr>"
                + "          <tr><td style='padding: 7px 0; font-weight: 600; color: #64748b;'>Temporary Password:</td><td><code style='background: #fee2e2; color: #b91c1c; padding: 4px 10px; border-radius: 6px; font-family: ui-monospace, monospace; font-weight: 800; font-size: 14px; border: 1px solid #fca5a5;'>" + tempPassword + "</code></td></tr>"
                + "        </table>"
                + "      </div>"

                // Big CTA Button
                + "      <div style='text-align: center; margin: 30px 0;'>"
                + "        <a href='" + loginLink + "' style='display: inline-block; background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); color: #ffffff; text-decoration: none; padding: 14px 34px; border-radius: 12px; font-weight: 800; font-size: 15px; box-shadow: 0 6px 20px rgba(2, 132, 199, 0.35); letter-spacing: 0.2px;'>"
                + "          👉 Sign In to Resident Portal Now &rarr;"
                + "        </a>"
                + "      </div>"

                // Guidance Box
                + "      <div style='background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 14px 18px; border-radius: 10px; font-size: 12.5px; color: #92400e; margin-top: 25px; line-height: 1.5;'>"
                + "        <strong>🔒 Security Notice:</strong> Please sign in using this temporary password and update your password under <em>My Profile &rarr; Security & Password</em>."
                + "      </div>"

                // App Download & Installation Section (Mobile & Desktop)
                + "      <div style='background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 1.5px solid #7dd3fc; border-radius: 18px; padding: 22px; margin: 25px 0; box-shadow: 0 4px 15px rgba(2, 132, 199, 0.08);'>"
                + "        <div style='border-bottom: 1px solid #bae6fd; padding-bottom: 10px; margin-bottom: 12px;'>"
                + "          <span style='font-size: 13.5px; font-weight: 800; color: #0369a1; text-transform: uppercase; letter-spacing: 0.5px;'>📱 Download & Install JalSetu App</span>"
                + "          <p style='margin: 4px 0 0; font-size: 12.5px; color: #475569;'>Install as a native standalone app on your Mobile or Desktop for instant water monitoring and offline support.</p>"
                + "        </div>"
                + "        <div style='background: #ffffff; border-radius: 12px; padding: 14px; border: 1px solid #bae6fd; font-size: 12.5px; color: #1e293b; line-height: 1.6;'>"
                + "          <p style='margin: 0 0 8px 0;'><strong>💻 Desktop App (Windows / Mac / Linux):</strong> Open your portal link in Chrome or Edge &rarr; click <span style='background: #e0f2fe; color: #0284c7; font-weight: 700; padding: 2px 6px; border-radius: 4px;'>⬇ Install App</span> in the top header.</p>"
                + "          <p style='margin: 0 0 8px 0;'><strong>🤖 Android Mobile App:</strong> Open the link in Chrome &rarr; tap <span style='background: #e0f2fe; color: #0284c7; font-weight: 700; padding: 2px 6px; border-radius: 4px;'>Install JalSetu App</span> on the bottom banner.</p>"
                + "          <p style='margin: 0;'><strong>🍏 iPhone / iPad (iOS Safari):</strong> In Safari, tap the <strong>Share button (⎋)</strong> at the bottom &rarr; tap <strong>'Add to Home Screen'</strong>.</p>"
                + "        </div>"
                + "        <div style='text-align: center; margin-top: 16px;'>"
                + "          <a href='" + loginLink + "' style='display: inline-block; background: #0284c7; color: #ffffff; text-decoration: none; padding: 10px 24px; border-radius: 8px; font-weight: 700; font-size: 13px;'>⬇ Launch & Install App Now &rarr;</a>"
                + "        </div>"
                + "      </div>"

                // Features list
                + "      <div style='margin-top: 25px; padding-top: 20px; border-top: 1px solid #f1f5f9;'>"
                + "        <p style='font-size: 12px; font-weight: 700; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.5px; margin-bottom: 10px;'>What you can do in your portal:</p>"
                + "        <ul style='margin: 0; padding-left: 18px; font-size: 13px; color: #64748b; line-height: 1.7;'>"
                + "          <li>Track daily metered water volume (in kL and Liters)</li>"
                + "          <li>Receive immediate notifications if consumption exceeds daily slabs</li>"
                + "          <li>Download monthly community water bills and payment summaries</li>"
                + "        </ul>"
                + "      </div>"
                + "    </div>"

                // Footer
                + "    <div style='background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 22px 30px; text-align: center; font-size: 12px; color: #94a3b8;'>"
                + "      <p style='margin: 0 0 4px 0; font-weight: 600; color: #64748b;'>JalSetu Smart Water Management • " + apartmentName + "</p>"
                + "      <p style='margin: 0;'>Automating fair water billing and conservation across residential societies.</p>"
                + "    </div>"
                + "  </div>"
                + "</body>"
                + "</html>";
    }

    /**
     * Send community broadcast announcement email to residents
     */
    public boolean sendAnnouncementBroadcastEmail(String toEmail,
                                                  String recipientName,
                                                  String apartmentName,
                                                  String title,
                                                  String category,
                                                  String priority,
                                                  String content) {
        String subject = "📢 Community Notice: " + title + " (" + apartmentName + ")";
        String portalLink = portalUrl + "/resident/dashboard";

        String badgeColor = "#0284c7";
        if ("CRITICAL".equalsIgnoreCase(priority)) badgeColor = "#dc2626";
        else if ("IMPORTANT".equalsIgnoreCase(priority)) badgeColor = "#d97706";

        String html = "<!DOCTYPE html>"
                + "<html>"
                + "<head><meta charset='utf-8'></head>"
                + "<body style='font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; padding: 20px 0; margin: 0;'>"
                + "  <div style='max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;'>"
                + "    <div style='background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 28px 30px; color: #ffffff;'>"
                + "      <div style='display: flex; align-items: center; justify-content: space-between;'>"
                + "        <span style='font-size: 20px; font-weight: 800; letter-spacing: -0.5px;'>JalSetu (जलसेतु)</span>"
                + "        <span style='background: " + badgeColor + "; color: #ffffff; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px;'>" + priority + " NOTICE</span>"
                + "      </div>"
                + "      <p style='margin: 8px 0 0 0; color: #94a3b8; font-size: 13px;'>" + apartmentName + " • Official Society Broadcast</p>"
                + "    </div>"
                + "    <div style='padding: 30px; color: #334155;'>"
                + "      <p style='font-size: 15px; margin-top: 0;'>Dear <strong>" + recipientName + "</strong>,</p>"
                + "      <h3 style='color: #0f172a; margin: 15px 0 10px 0; font-size: 18px;'>" + title + "</h3>"
                + "      <div style='background: #f8fafc; border-left: 4px solid " + badgeColor + "; padding: 18px; border-radius: 8px; margin: 20px 0; font-size: 14px; line-height: 1.6; color: #1e293b; white-space: pre-wrap;'>"
                + content
                + "      </div>"
                + "      <div style='text-align: center; margin: 25px 0;'>"
                + "        <a href='" + portalLink + "' style='display: inline-block; background: #0284c7; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: 700; font-size: 14px;'>View in Resident Portal &rarr;</a>"
                + "      </div>"
                + "    </div>"
                + "    <div style='background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px 30px; text-align: center; font-size: 11px; color: #94a3b8;'>"
                + "      <p style='margin: 0;'>Sent by Community Management for " + apartmentName + " via JalSetu Smart Water Platform.</p>"
                + "    </div>"
                + "  </div>"
                + "</body>"
                + "</html>";

        if (isDummyOrTestEmail(toEmail)) {
            log.info("ℹ️ Skipped live SMTP announcement dispatch for test/dummy recipient: {}", toEmail);
            return true;
        }

        try {
            if (mailSender != null && fromEmail != null && !fromEmail.isEmpty()) {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                helper.setFrom(fromEmail, "JalSetu Water Platform");
                helper.setTo(toEmail);
                helper.setSubject(subject);
                helper.setText(html, true);
                mailSender.send(message);
                log.info("✅ LIVE EMAIL DISPATCH SUCCESS: Sent announcement '{}' to {}", title, toEmail);
                return true;
            }
        } catch (Exception e) {
            log.error("❌ Failed to send announcement email to {}: {}", toEmail, e.getMessage());
        }
        return false;
    }

    /**
     * Send official onboarding credentials email to newly onboarded Community Administrator
     */
    public boolean sendCommunityAdminOnboardingEmail(String toEmail,
                                                     String adminName,
                                                     String apartmentName,
                                                     Integer totalHouseholds,
                                                     String tempPassword) {
        String subject = "🏢 Welcome to JalSetu — Community Administrator Portal Access (" + apartmentName + ")";
        String loginLink = portalUrl + "/login?email=" + URLEncoder.encode(toEmail, StandardCharsets.UTF_8) + "&role=community_admin";

        String html = "<!DOCTYPE html>"
                + "<html>"
                + "<head><meta charset='utf-8'></head>"
                + "<body style='font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; padding: 25px 10px; margin: 0;'>"
                + "  <div style='max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 15px 35px rgba(15, 23, 42, 0.08); border: 1px solid #e2e8f0;'>"
                
                // Header
                + "    <div style='background: linear-gradient(135deg, #0f172a 0%, #0284c7 100%); padding: 35px 30px; text-align: center; color: #ffffff;'>"
                + "      <div style='display: inline-block; background: rgba(255, 255, 255, 0.15); border: 1px solid rgba(255, 255, 255, 0.25); border-radius: 9999px; padding: 5px 16px; margin-bottom: 10px;'>"
                + "        <span style='font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #bae6fd;'>🏢 Society Admin Console</span>"
                + "      </div>"
                + "      <h1 style='margin: 0; font-size: 26px; font-weight: 800;'>JalSetu <span style='font-weight: 300; opacity: 0.85;'>| जलसेतु</span></h1>"
                + "      <p style='margin: 6px 0 0; font-size: 13px; color: #e0f2fe;'>Community Management & Automated Meter Apportionment</p>"
                + "    </div>"

                // Content
                + "    <div style='padding: 30px; color: #334155;'>"
                + "      <p style='font-size: 15px; margin-top: 0;'>Hello <strong>" + adminName + "</strong>,</p>"
                + "      <p style='font-size: 14px; line-height: 1.6; color: #475569;'>Your society <strong>" + apartmentName + "</strong> (" + (totalHouseholds != null ? totalHouseholds : "Multiple") + " units) is now active on the <strong>JalSetu Platform</strong>. As the Community Administrator, you can manage digital water meters, log readings, generate tiered bills, resolve resident concerns, and publish broadcasts.</p>"

                // Credentials Box
                + "      <div style='background: #f0f9ff; border: 1.5px solid #bae6fd; border-radius: 16px; padding: 20px; margin: 22px 0;'>"
                + "        <div style='display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #bae6fd; padding-bottom: 8px; margin-bottom: 12px;'>"
                + "          <span style='font-size: 12.5px; font-weight: 800; text-transform: uppercase; color: #0369a1;'>🔑 Your Admin Credentials</span>"
                + "          <span style='font-size: 11px; background: #e0f2fe; color: #0284c7; font-weight: 700; padding: 2px 8px; border-radius: 6px;'>Admin Access</span>"
                + "        </div>"
                + "        <table style='width: 100%; font-size: 13.5px; color: #1e293b; border-collapse: collapse;'>"
                + "          <tr><td style='padding: 6px 0; font-weight: 600; color: #64748b; width: 140px;'>Society:</td><td><strong style='color: #0f172a;'>" + apartmentName + "</strong></td></tr>"
                + "          <tr><td style='padding: 6px 0; font-weight: 600; color: #64748b;'>Admin Email:</td><td><strong style='color: #0f172a; font-family: ui-monospace, monospace;'>" + toEmail + "</strong></td></tr>"
                + "          <tr><td style='padding: 6px 0; font-weight: 600; color: #64748b;'>Temporary Password:</td><td><code style='background: #fee2e2; color: #b91c1c; padding: 3px 8px; border-radius: 6px; font-family: ui-monospace, monospace; font-weight: 800; font-size: 14px;'>" + tempPassword + "</code></td></tr>"
                + "        </table>"
                + "      </div>"

                // CTA Button
                + "      <div style='text-align: center; margin: 25px 0;'>"
                + "        <a href='" + loginLink + "' style='display: inline-block; background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); color: #ffffff; text-decoration: none; padding: 13px 30px; border-radius: 12px; font-weight: 800; font-size: 14px; box-shadow: 0 4px 15px rgba(2, 132, 199, 0.3);'>"
                + "          👉 Sign In to Admin Panel &rarr;"
                + "        </a>"
                + "      </div>"

                // App Installation Guide
                + "      <div style='background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 16px; padding: 20px; margin: 22px 0; font-size: 12.5px; color: #334155; line-height: 1.6;'>"
                + "        <p style='margin: 0 0 8px 0; font-weight: 800; color: #0f172a; font-size: 13px;'>📱 Install JalSetu App on Your Laptop & Phone:</p>"
                + "        <p style='margin: 0 0 6px 0;'>• <strong>Desktop (Chrome/Edge):</strong> Open the link &rarr; click <span style='background: #e0f2fe; color: #0284c7; font-weight: 700; padding: 1px 6px; border-radius: 4px;'>⬇ Install App</span> in the top header.</p>"
                + "        <p style='margin: 0 0 6px 0;'>• <strong>Android Mobile:</strong> Open in Chrome &rarr; tap <strong>'Install JalSetu'</strong> from the top header or 3-dots menu.</p>"
                + "        <p style='margin: 0;'>• <strong>iPhone (iOS Safari):</strong> Tap the <strong>Share icon (⎋)</strong> &rarr; tap <strong>'Add to Home Screen'</strong>.</p>"
                + "      </div>"
                + "    </div>"

                // Footer
                + "    <div style='background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px; text-align: center; font-size: 11px; color: #94a3b8;'>"
                + "      JalSetu Smart Water Management • Platform Operations • www.jalsetu.in"
                + "    </div>"
                + "  </div>"
                + "</body>"
                + "</html>";

        return dispatchHtmlEmail(toEmail, subject, html, "COMMUNITY_ADMIN");
    }

    /**
     * Send Escalation or Resolution notification for Support Tickets
     */
    public boolean sendTicketEscalationEmail(String toEmail,
                                            String recipientName,
                                            Long ticketId,
                                            String subjectText,
                                            String status,
                                            String notes,
                                            boolean isResolved) {
        String emailSubject = (isResolved ? "✅ Resolved by Main Admin: Ticket #" : "⚡ Escalated to Main Admin: Ticket #") + ticketId + " — " + subjectText;
        String portalLink = portalUrl + "/resident/dashboard";

        String html = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;'>"
                + "<div style='background: " + (isResolved ? "#10b981" : "#f59e0b") + "; padding: 15px 20px; border-radius: 10px; color: #ffffff; text-align: center; margin-bottom: 20px;'>"
                + "  <h3 style='margin: 0; font-size: 18px;'>" + (isResolved ? "✅ Ticket Resolved by Main Admin" : "⚡ Ticket Escalated to Main Admin") + "</h3>"
                + "</div>"
                + "<p>Dear <strong>" + recipientName + "</strong>,</p>"
                + "<p>Your support ticket <strong>#" + ticketId + " (" + subjectText + ")</strong> status has been updated to: <strong style='color: #0284c7;'>" + status + "</strong>.</p>"
                + (notes != null && !notes.trim().isEmpty() ? "<div style='background: #f8fafc; border-left: 4px solid #0284c7; padding: 14px; margin: 15px 0; font-size: 13px;'><strong>Main Admin Notes:</strong><br/>" + notes + "</div>" : "")
                + "<div style='text-align: center; margin-top: 25px;'><a href='" + portalLink + "' style='background: #0284c7; color: #ffffff; padding: 10px 22px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 13px;'>View in Portal &rarr;</a></div>"
                + "</div>";

        return dispatchHtmlEmail(toEmail, emailSubject, html, "TICKET_" + ticketId);
    }

    /**
     * Send 'Registration Under Review' confirmation to new Community Admin
     */
    public boolean sendRegistrationUnderReviewEmail(String toEmail, String adminName, String apartmentName, String documentType) {
        String subject = "⏳ JalSetu — Community Registration Received & Under Review (" + apartmentName + ")";
        String statusLink = portalUrl + "/verification-pending?email=" + URLEncoder.encode(toEmail, StandardCharsets.UTF_8);

        String html = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;'>"
                + "<div style='text-align: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 15px; margin-bottom: 20px;'>"
                + "  <h2 style='color: #0284c7; margin: 0;'>JalSetu (जलसेतु)</h2>"
                + "  <p style='color: #64748b; font-size: 13px; margin: 5px 0 0 0;'>Smart Water Monitoring & Automated Billing Platform</p>"
                + "</div>"
                + "<div style='background: #fef3c7; border: 1px solid #fde68a; border-radius: 12px; padding: 15px; text-align: center; margin-bottom: 20px;'>"
                + "  <h3 style='color: #92400e; margin: 0; font-size: 16px;'>⏳ Application Submitted for Verification</h3>"
                + "</div>"
                + "<p style='font-size: 15px; color: #1e293b;'>Dear <strong>" + adminName + "</strong>,</p>"
                + "<p style='font-size: 14px; color: #475569; line-height: 1.6;'>Thank you for registering <strong>" + apartmentName + "</strong> on JalSetu. We have received your society details along with your <strong>" + (documentType != null ? documentType : "verification document") + "</strong>.</p>"
                + "<p style='font-size: 14px; color: #475569; line-height: 1.6;'>Our Platform Administration team is currently reviewing your documents to verify society authorization. Verification is typically completed within <strong>12 to 24 hours</strong>.</p>"
                + "<div style='text-align: center; margin: 25px 0;'>"
                + "  <a href='" + statusLink + "' style='background: #0284c7; color: #ffffff; padding: 12px 26px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 14px;'>Check Application Status &rarr;</a>"
                + "</div>"
                + "<p style='color: #94a3b8; font-size: 12px; text-align: center; margin-top: 30px;'>Once approved, you will receive an official activation email with your dashboard access.</p>"
                + "</div>";

        return dispatchHtmlEmail(toEmail, subject, html, "REGISTRATION_UNDER_REVIEW");
    }

    /**
     * Send 'Verification Approved' email with direct login link, credentials, and app download link
     */
    public boolean sendVerificationApprovedEmail(String toEmail, String adminName, String apartmentName) {
        return sendVerificationApprovedEmail(toEmail, adminName, apartmentName, "COMMUNITY_ADMIN", null, null);
    }

    public boolean sendVerificationApprovedEmail(String toEmail, String fullName, String apartmentName, String role, String flatNumber, String tempPassword) {
        boolean isResident = "RESIDENT".equalsIgnoreCase(role) || (flatNumber != null && !flatNumber.isBlank() && !"ADMIN".equalsIgnoreCase(flatNumber) && !"N/A".equalsIgnoreCase(flatNumber));
        String targetRole = isResident ? "resident" : "community_admin";
        String subject = "🎉 Approved! Welcome to JalSetu — Account Activated (" + apartmentName + (flatNumber != null && !flatNumber.isBlank() ? " Flat " + flatNumber : "") + ")";
        String loginLink = portalUrl + "/login?email=" + URLEncoder.encode(toEmail, StandardCharsets.UTF_8) + "&role=" + targetRole;

        String html = "<!DOCTYPE html>"
                + "<html>"
                + "<head>"
                + "  <meta charset='UTF-8'>"
                + "  <meta name='viewport' content='width=device-width, initial-scale=1.0'>"
                + "</head>"
                + "<body style='font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 25px 10px;'>"
                + "  <div style='max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 15px 35px rgba(15, 23, 42, 0.08); border: 1px solid #e2e8f0;'>"
                
                // Header Banner
                + "    <div style='background: linear-gradient(135deg, #0f172a 0%, #0369a1 50%, #0284c7 100%); padding: 35px 25px; text-align: center; color: #ffffff;'>"
                + "      <div style='display: inline-block; background: rgba(255, 255, 255, 0.15); border: 1px solid rgba(255, 255, 255, 0.25); border-radius: 9999px; padding: 5px 16px; margin-bottom: 10px;'>"
                + "        <span style='font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #bae6fd;'>💧 JalSetu Verification Desk</span>"
                + "      </div>"
                + "      <h1 style='margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;'>JalSetu <span style='font-weight: 300; opacity: 0.85;'>| जलसेतु</span></h1>"
                + "      <p style='margin: 6px 0 0; font-size: 13px; opacity: 0.9; color: #e0f2fe;'>Smart Water Monitoring & Automated Billing Platform</p>"
                + "    </div>"

                // Content Body
                + "    <div style='padding: 30px 25px; color: #334155;'>"
                + "      <div style='background: #dcfce7; border: 1.5px solid #86efac; border-radius: 14px; padding: 14px; text-align: center; margin-bottom: 20px;'>"
                + "        <h3 style='color: #166534; margin: 0; font-size: 17px;'>✅ Verification Approved & Account Activated!</h3>"
                + "      </div>"
                + "      <p style='font-size: 15px; color: #1e293b; margin-top: 0;'>Dear <strong>" + fullName + "</strong>,</p>"
                + "      <p style='font-size: 14px; color: #475569; line-height: 1.6;'>Great news! The Platform Administration team has successfully verified and approved your registration for <strong>" + apartmentName + "</strong>" + (flatNumber != null && !flatNumber.isBlank() ? " (Flat " + flatNumber + ")" : "") + ".</p>"
                + "      <p style='font-size: 14px; color: #475569; line-height: 1.6;'>Your " + (isResident ? "Resident" : "Community Administrator") + " account is now fully <strong>ACTIVE</strong>. You can sign in immediately to access your portal.</p>"

                // Credentials Card
                + "      <div style='background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%); border: 1.5px solid #cbd5e1; border-radius: 16px; padding: 20px; margin: 22px 0; box-shadow: 0 4px 12px rgba(0,0,0,0.03);'>"
                + "        <div style='display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 12px;'>"
                + "          <span style='font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #0284c7;'>🔑 Your Sign-In Credentials</span>"
                + "          <span style='font-size: 11px; background: #dcfce7; color: #15803d; font-weight: 700; padding: 2px 8px; border-radius: 6px;'>Active</span>"
                + "        </div>"
                + "        <table style='width: 100%; font-size: 13.5px; color: #1e293b; border-collapse: collapse;'>"
                + "          <tr><td style='padding: 6px 0; font-weight: 600; color: #64748b; width: 140px;'>Society / Community:</td><td><strong style='color: #0f172a;'>" + apartmentName + "</strong></td></tr>"
                + (flatNumber != null && !flatNumber.isBlank() ? "          <tr><td style='padding: 6px 0; font-weight: 600; color: #64748b;'>Apartment Flat:</td><td><strong style='color: #0f172a;'>Flat " + flatNumber + "</strong></td></tr>" : "")
                + "          <tr><td style='padding: 6px 0; font-weight: 600; color: #64748b;'>Account Role:</td><td><strong style='color: #0284c7;'>" + (isResident ? "Resident Account" : "Community Administrator") + "</strong></td></tr>"
                + "          <tr><td style='padding: 6px 0; font-weight: 600; color: #64748b;'>Login Email ID:</td><td><strong style='color: #0f172a; font-family: ui-monospace, monospace;'>" + toEmail + "</strong></td></tr>"
                + "          <tr><td style='padding: 6px 0; font-weight: 600; color: #64748b;'>Login Password:</td><td><code style='background: #fee2e2; color: #b91c1c; padding: 4px 10px; border-radius: 6px; font-family: ui-monospace, monospace; font-weight: 800; font-size: 14px; border: 1px solid #fca5a5;'>" + (tempPassword != null && !tempPassword.isBlank() ? tempPassword : (isResident ? "Resident@123" : "Admin@12345")) + "</code></td></tr>"
                + "        </table>"
                + "      </div>"

                // Web Portal CTA Button
                + "      <div style='text-align: center; margin: 25px 0;'>"
                + "        <a href='" + loginLink + "' style='display: inline-block; background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); color: #ffffff; padding: 13px 32px; border-radius: 12px; text-decoration: none; font-weight: 800; font-size: 14px; box-shadow: 0 4px 15px rgba(2, 132, 199, 0.35);'>"
                + "          👉 Sign In to " + (isResident ? "Resident Portal" : "Community Dashboard") + " &rarr;"
                + "        </a>"
                + "      </div>"

                // JalSetu Mobile & Desktop App Download Box
                + "      <div style='background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-radius: 18px; padding: 22px; margin: 25px 0; color: #ffffff; box-shadow: 0 6px 20px rgba(15, 23, 42, 0.15);'>"
                + "        <div style='display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 10px; margin-bottom: 12px;'>"
                + "          <span style='font-size: 13px; font-weight: 800; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.5px;'>📱 JalSetu Mobile & Desktop App</span>"
                + "          <span style='font-size: 10px; background: rgba(56, 189, 248, 0.2); color: #38bdf8; font-weight: 700; padding: 2px 8px; border-radius: 9999px;'>Direct Install</span>"
                + "        </div>"
                + "        <p style='margin: 0 0 12px 0; font-size: 13px; color: #cbd5e1; line-height: 1.5;'>Install JalSetu on your Mobile or Desktop for real-time live water tracking, automated leak alarms, and 1-click bill payments.</p>"
                + "        <div style='background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 12px; font-size: 12px; color: #94a3b8; line-height: 1.6; margin-bottom: 14px;'>"
                + "          <p style='margin: 0 0 6px 0;'><strong style='color: #ffffff;'>🤖 Android Mobile:</strong> Open portal link in Chrome &rarr; tap <strong>'Install App'</strong>.</p>"
                + "          <p style='margin: 0 0 6px 0;'><strong style='color: #ffffff;'>💻 Windows / Mac:</strong> Open in Chrome or Edge &rarr; click <strong>'Install App'</strong> icon in the address bar.</p>"
                + "          <p style='margin: 0;'><strong style='color: #ffffff;'>🍏 iPhone (iOS):</strong> Open in Safari &rarr; tap <strong>Share (⎋)</strong> &rarr; <strong>'Add to Home Screen'</strong>.</p>"
                + "        </div>"
                + "        <div style='text-align: center;'>"
                + "          <a href='" + loginLink + "' style='display: inline-block; background: #38bdf8; color: #0f172a; text-decoration: none; padding: 11px 26px; border-radius: 10px; font-weight: 800; font-size: 13px; box-shadow: 0 4px 12px rgba(56, 189, 248, 0.3);'>"
                + "            📲 Launch & Download App Now &rarr;"
                + "          </a>"
                + "        </div>"
                + "      </div>"

                // Guidance Box
                + "      <div style='background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 10px; font-size: 12px; color: #92400e; margin-top: 20px; line-height: 1.5;'>"
                + "        <strong>🔒 Security Notice:</strong> Never share your login credentials with anyone. If you forget your password, you can reset it anytime via the <em>Forgot Password</em> link on the login page."
                + "      </div>"
                + "    </div>"

                // Footer
                + "    <div style='background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px; text-align: center; font-size: 11.5px; color: #94a3b8;'>"
                + "      JalSetu Operations Team • <a href='" + portalUrl + "' style='color: #0284c7; text-decoration: none;'>www.jalsetu.in</a> • Smart Water Platform"
                + "    </div>"
                + "  </div>"
                + "</body>"
                + "</html>";

        return dispatchHtmlEmail(toEmail, subject, html, "VERIFICATION_APPROVED");
    }

    /**
     * Send 'Verification Rejected' email with admin feedback notes
     */
    public boolean sendVerificationRejectedEmail(String toEmail, String adminName, String apartmentName, String notes) {
        String subject = "⚠️ Action Required: JalSetu Verification Update for " + apartmentName;
        String reuploadLink = portalUrl + "/verification-pending?email=" + URLEncoder.encode(toEmail, StandardCharsets.UTF_8);

        String html = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;'>"
                + "<div style='text-align: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 15px; margin-bottom: 20px;'>"
                + "  <h2 style='color: #0284c7; margin: 0;'>JalSetu (जलसेतु)</h2>"
                + "</div>"
                + "<div style='background: #fee2e2; border: 1px solid #fecaca; border-radius: 12px; padding: 16px; text-align: center; margin-bottom: 20px;'>"
                + "  <h3 style='color: #991b1b; margin: 0; font-size: 17px;'>❌ Document Verification Action Required</h3>"
                + "</div>"
                + "<p style='font-size: 15px; color: #1e293b;'>Dear <strong>" + adminName + "</strong>,</p>"
                + "<p style='font-size: 14px; color: #475569; line-height: 1.6;'>During the review of your society registration for <strong>" + apartmentName + "</strong>, our team was unable to verify the submitted documents.</p>"
                + (notes != null && !notes.trim().isEmpty() ? "<div style='background: #f8fafc; border-left: 4px solid #ef4444; padding: 14px; margin: 15px 0; font-size: 13px; color: #334155;'><strong>Admin Feedback / Reason:</strong><br/>" + notes + "</div>" : "")
                + "<p style='font-size: 14px; color: #475569; line-height: 1.6;'>Please review the feedback and re-upload the valid society proof (e.g. Society Registration Certificate, Utility Bill, or RWA Resolution) via the status page:</p>"
                + "<div style='text-align: center; margin: 25px 0;'>"
                + "  <a href='" + reuploadLink + "' style='background: #dc2626; color: #ffffff; padding: 12px 26px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 14px;'>Re-upload Verification Documents &rarr;</a>"
                + "</div>"
                + "<p style='color: #94a3b8; font-size: 12px; text-align: center; margin-top: 30px;'>Need assistance? Reply directly to this email for support.</p>"
                + "</div>";

        return dispatchHtmlEmail(toEmail, subject, html, "VERIFICATION_REJECTED");
    }

    // =========================================================================
    // SUPPORT TICKET TRANSACTIONAL EMAILS
    // =========================================================================

    /**
     * Send email to Community Admin when a resident raises a new support ticket
     */
    public boolean sendNewTicketNotificationToAdmin(String adminEmail,
                                                    String adminName,
                                                    String apartmentName,
                                                    String flatNumber,
                                                    String category,
                                                    String priority,
                                                    String subject,
                                                    String description,
                                                    Long ticketId) {
        String emailSubject = "🎫 New Support Ticket #" + ticketId + " [" + priority + "]: " + subject + " (Flat " + flatNumber + ")";
        String supportLink = portalUrl + "/community-admin/support";

        String priorityColor = "HIGH".equalsIgnoreCase(priority) || "URGENT".equalsIgnoreCase(priority) ? "#dc2626"
                : "MEDIUM".equalsIgnoreCase(priority) ? "#d97706" : "#2563eb";

        String html = "<!DOCTYPE html><html><body style='font-family: Arial, sans-serif; background-color: #f8fafc; padding: 25px; margin: 0;'>"
                + "<div style='max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.06);'>"
                + "  <div style='background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); padding: 30px 25px; color: #ffffff; text-align: center;'>"
                + "    <h2 style='margin: 0; font-size: 22px;'>🎫 New Resident Support Ticket</h2>"
                + "    <p style='margin: 5px 0 0 0; opacity: 0.9; font-size: 13px;'>" + apartmentName + " • Ticket #" + ticketId + "</p>"
                + "  </div>"
                + "  <div style='padding: 25px; color: #334155; font-size: 14px; line-height: 1.6;'>"
                + "    <p>Dear <strong>" + adminName + "</strong>,</p>"
                + "    <p>A new maintenance or billing ticket has been submitted by a resident of your society and is awaiting administrative review.</p>"
                + "    <div style='background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin: 20px 0;'>"
                + "      <table style='width: 100%; font-size: 13px; border-collapse: collapse;'>"
                + "        <tr><td style='padding: 6px 0; color: #64748b; width: 120px;'><strong>Ticket ID:</strong></td><td style='padding: 6px 0; font-weight: bold; color: #0284c7;'>#" + ticketId + "</td></tr>"
                + "        <tr><td style='padding: 6px 0; color: #64748b;'><strong>Household Flat:</strong></td><td style='padding: 6px 0; font-weight: bold; color: #0f172a;'>Flat " + flatNumber + "</td></tr>"
                + "        <tr><td style='padding: 6px 0; color: #64748b;'><strong>Category:</strong></td><td style='padding: 6px 0; font-weight: bold;'>" + category + "</td></tr>"
                + "        <tr><td style='padding: 6px 0; color: #64748b;'><strong>Priority:</strong></td><td style='padding: 6px 0;'><span style='background: " + priorityColor + "; color: #ffffff; padding: 2px 8px; border-radius: 6px; font-weight: bold; font-size: 11px;'>" + priority + "</span></td></tr>"
                + "        <tr><td style='padding: 6px 0; color: #64748b;'><strong>Subject:</strong></td><td style='padding: 6px 0; font-weight: bold; color: #0f172a;'>" + subject + "</td></tr>"
                + "      </table>"
                + "      <div style='margin-top: 12px; padding-top: 12px; border-top: 1px dashed #cbd5e1; font-size: 13px; color: #475569;'>"
                + "        <strong>Resident Description:</strong><br/>"
                + "        <p style='margin: 4px 0 0 0; font-style: italic;'>" + description + "</p>"
                + "      </div>"
                + "    </div>"
                + "    <div style='text-align: center; margin: 25px 0;'>"
                + "      <a href='" + supportLink + "' style='background: #0284c7; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: bold; font-size: 13px; display: inline-block;'>View & Resolve in Admin Portal &rarr;</a>"
                + "    </div>"
                + "  </div>"
                + "  <div style='background: #f1f5f9; padding: 15px; text-align: center; font-size: 11px; color: #64748b;'>"
                + "    JalSetu Support Desk • " + apartmentName + " • <a href='" + portalUrl + "' style='color: #0284c7; text-decoration: none;'>www.jalsetu.in</a>"
                + "  </div>"
                + "</div></body></html>";

        return dispatchHtmlEmail(adminEmail, emailSubject, html, "TICKET_NEW_" + ticketId);
    }

    /**
     * Send ticket creation acknowledgment to Resident
     */
    public boolean sendTicketCreatedAcknowledgment(String residentEmail,
                                                   String residentName,
                                                   String flatNumber,
                                                   String apartmentName,
                                                   Long ticketId,
                                                   String subject,
                                                   String priority) {
        String emailSubject = "💧 Ticket Received: #" + ticketId + " - " + subject + " (JalSetu Support)";
        String residentPortalLink = portalUrl + "/resident/support";

        String html = "<!DOCTYPE html><html><body style='font-family: Arial, sans-serif; background-color: #f8fafc; padding: 25px; margin: 0;'>"
                + "<div style='max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.06);'>"
                + "  <div style='background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); padding: 30px 25px; color: #ffffff; text-align: center;'>"
                + "    <h2 style='margin: 0; font-size: 22px;'>💧 Support Request Received</h2>"
                + "    <p style='margin: 5px 0 0 0; opacity: 0.9; font-size: 13px;'>Reference ID: #" + ticketId + " • " + apartmentName + "</p>"
                + "  </div>"
                + "  <div style='padding: 25px; color: #334155; font-size: 14px; line-height: 1.6;'>"
                + "    <p>Dear <strong>" + residentName + "</strong> (Flat " + flatNumber + "),</p>"
                + "    <p>Thank you for reaching out. Your support request has been logged successfully and routed to your Society Maintenance Team for action.</p>"
                + "    <div style='background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; margin: 20px 0; color: #166534;'>"
                + "      <p style='margin: 0 0 5px 0; font-weight: bold;'>Ticket Summary:</p>"
                + "      <p style='margin: 0; font-size: 13px;'><strong>Subject:</strong> " + subject + "<br/><strong>Priority:</strong> " + priority + "<br/><strong>Status:</strong> OPEN (Under Investigation)</p>"
                + "    </div>"
                + "    <p style='font-size: 13px; color: #64748b;'>Our typical response SLA is within 24 hours. You can track real-time progress and technician updates in your Resident Portal.</p>"
                + "    <div style='text-align: center; margin: 25px 0;'>"
                + "      <a href='" + residentPortalLink + "' style='background: #0284c7; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: bold; font-size: 13px; display: inline-block;'>Track Ticket Status &rarr;</a>"
                + "    </div>"
                + "  </div>"
                + "  <div style='background: #f1f5f9; padding: 15px; text-align: center; font-size: 11px; color: #64748b;'>"
                + "    JalSetu Resident Care • " + apartmentName + ""
                + "  </div>"
                + "</div></body></html>";

        return dispatchHtmlEmail(residentEmail, emailSubject, html, "TICKET_ACK_" + ticketId);
    }

    /**
     * Send email to Main Admin when a Community Admin raises a community concern or escalates an issue
     */
    public boolean sendCommunityConcernToMainAdmin(String mainAdminEmail,
                                                   String adminName,
                                                   String adminEmail,
                                                   String apartmentName,
                                                   Long ticketId,
                                                   String subject,
                                                   String description,
                                                   String escalationReason) {
        String emailSubject = "🏢 Community Escalation: #" + ticketId + " - " + subject + " (" + apartmentName + ")";
        String mainAdminLink = portalUrl + "/main-admin/concerns";

        String html = "<!DOCTYPE html><html><body style='font-family: Arial, sans-serif; background-color: #f8fafc; padding: 25px; margin: 0;'>"
                + "<div style='max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.06);'>"
                + "  <div style='background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); padding: 30px 25px; color: #ffffff; text-align: center;'>"
                + "    <h2 style='margin: 0; font-size: 22px;'>🏢 Escalated Community Concern</h2>"
                + "    <p style='margin: 5px 0 0 0; opacity: 0.9; font-size: 13px;'>Platform Management Notice • " + apartmentName + "</p>"
                + "  </div>"
                + "  <div style='padding: 25px; color: #334155; font-size: 14px; line-height: 1.6;'>"
                + "    <p>Dear <strong>Main Administrator</strong>,</p>"
                + "    <p>A community issue has been escalated to the platform level by Community Administrator <strong>" + adminName + "</strong> (" + adminEmail + ") of <strong>" + apartmentName + "</strong>.</p>"
                + "    <div style='background: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 12px; padding: 18px; margin: 20px 0;'>"
                + "      <p style='margin: 0 0 6px 0; font-weight: bold; color: #5b21b6;'>Ticket #" + ticketId + ": " + subject + "</p>"
                + "      <p style='margin: 0 0 10px 0; font-size: 13px; color: #4b5563;'>" + description + "</p>"
                + (escalationReason != null && !escalationReason.isBlank() ? "<div style='background: #ffffff; padding: 10px; border-left: 3px solid #7c3aed; border-radius: 6px; font-size: 12px; color: #374151;'><strong>Escalation Reason:</strong> " + escalationReason + "</div>" : "")
                + "    </div>"
                + "    <div style='text-align: center; margin: 25px 0;'>"
                + "      <a href='" + mainAdminLink + "' style='background: #7c3aed; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: bold; font-size: 13px; display: inline-block;'>Open Main Admin Console &rarr;</a>"
                + "    </div>"
                + "  </div>"
                + "  <div style='background: #f1f5f9; padding: 15px; text-align: center; font-size: 11px; color: #64748b;'>"
                + "    JalSetu Platform Governance • Smart Water Infrastructure"
                + "  </div>"
                + "</div></body></html>";

        return dispatchHtmlEmail(mainAdminEmail != null ? mainAdminEmail : "admin@aquatrack.com", emailSubject, html, "CONCERN_" + ticketId);
    }

    /**
     * Send ticket resolution notice to resident / user
     */
    public boolean sendTicketResolutionNotification(String toEmail,
                                                    String recipientName,
                                                    Long ticketId,
                                                    String subject,
                                                    String resolutionNotes,
                                                    String resolvedByRole) {
        String emailSubject = "✅ Support Ticket Resolved: #" + ticketId + " - " + subject;
        String portalLink = portalUrl + "/resident/support";

        String html = "<!DOCTYPE html><html><body style='font-family: Arial, sans-serif; background-color: #f8fafc; padding: 25px; margin: 0;'>"
                + "<div style='max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.06);'>"
                + "  <div style='background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 30px 25px; color: #ffffff; text-align: center;'>"
                + "    <h2 style='margin: 0; font-size: 22px;'>✅ Support Request Resolved</h2>"
                + "    <p style='margin: 5px 0 0 0; opacity: 0.9; font-size: 13px;'>Ticket #" + ticketId + " • Status: RESOLVED</p>"
                + "  </div>"
                + "  <div style='padding: 25px; color: #334155; font-size: 14px; line-height: 1.6;'>"
                + "    <p>Dear <strong>" + recipientName + "</strong>,</p>"
                + "    <p>Your support ticket <strong>#" + ticketId + " (" + subject + ")</strong> has been marked as resolved by the " + ("MAIN_ADMIN".equalsIgnoreCase(resolvedByRole) ? "Central Operations Team" : "Community Management") + ".</p>"
                + "    <div style='background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 16px; margin: 20px 0; color: #065f46;'>"
                + "      <p style='margin: 0 0 5px 0; font-weight: bold;'>Resolution Details / Action Taken:</p>"
                + "      <p style='margin: 0; font-size: 13px; font-style: italic;'>" + (resolutionNotes != null && !resolutionNotes.isBlank() ? resolutionNotes : "The reported issue has been inspected and resolved.") + "</p>"
                + "    </div>"
                + "    <p style='font-size: 13px; color: #64748b;'>If the issue persists or if you have any follow-up questions, you can reopen the request directly from your dashboard.</p>"
                + "    <div style='text-align: center; margin: 25px 0;'>"
                + "      <a href='" + portalLink + "' style='background: #059669; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: bold; font-size: 13px; display: inline-block;'>View in Portal &rarr;</a>"
                + "    </div>"
                + "  </div>"
                + "  <div style='background: #f1f5f9; padding: 15px; text-align: center; font-size: 11px; color: #64748b;'>"
                + "    JalSetu Support Desk • Smart Water Monitoring"
                + "  </div>"
                + "</div></body></html>";

        return dispatchHtmlEmail(toEmail, emailSubject, html, "TICKET_RESOLVED_" + ticketId);
    }

    // =========================================================================
    // INVOICE & PAYMENT TRANSACTIONAL EMAILS
    // =========================================================================

    /**
     * Send official payment receipt to Resident after successful bill payment (with optional PDF attachment)
     */
    public boolean sendPaymentReceiptToResident(String residentEmail,
                                                String residentName,
                                                String flatNumber,
                                                String apartmentName,
                                                String invoiceNumber,
                                                Double amountPaid,
                                                String paymentMethod,
                                                String paymentId,
                                                LocalDateTime paymentTime,
                                                String billingMonth) {
        return sendPaymentReceiptToResident(residentEmail, residentName, flatNumber, apartmentName, invoiceNumber,
                amountPaid, paymentMethod, paymentId, paymentTime, billingMonth, null);
    }

    public boolean sendPaymentReceiptToResident(String residentEmail,
                                                String residentName,
                                                String flatNumber,
                                                String apartmentName,
                                                String invoiceNumber,
                                                Double amountPaid,
                                                String paymentMethod,
                                                String paymentId,
                                                LocalDateTime paymentTime,
                                                String billingMonth,
                                                byte[] pdfAttachment) {
        String emailSubject = "🧾 JalSetu Water Bill Payment Receipt — " + invoiceNumber + " (₹" + String.format("%.2f", amountPaid != null ? amountPaid : 0.0) + ")";
        String invoicesLink = portalUrl + "/resident/invoices";

        String formattedDate = paymentTime != null ? paymentTime.toLocalDate().toString() : LocalDate.now().toString();

        String html = "<!DOCTYPE html><html><body style='font-family: Arial, sans-serif; background-color: #f8fafc; padding: 25px; margin: 0;'>"
                + "<div style='max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.06);'>"
                + "  <div style='background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 30px 25px; color: #ffffff; text-align: center;'>"
                + "    <h2 style='margin: 0; font-size: 22px;'>🧾 Payment Receipt Confirmed</h2>"
                + "    <p style='margin: 5px 0 0 0; opacity: 0.9; font-size: 13px;'>Invoice " + invoiceNumber + " • " + apartmentName + "</p>"
                + "  </div>"
                + "  <div style='padding: 25px; color: #334155; font-size: 14px; line-height: 1.6;'>"
                + "    <p>Dear <strong>" + residentName + "</strong> (Flat " + flatNumber + "),</p>"
                + "    <p>We have successfully received your payment for the water billing cycle <strong>" + (billingMonth != null ? billingMonth : "Current Cycle") + "</strong>.</p>"
                + "    <div style='background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0;'>"
                + "      <div style='text-align: center; padding-bottom: 15px; border-bottom: 1px solid #e2e8f0; margin-bottom: 15px;'>"
                + "        <span style='font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: bold;'>Amount Paid</span>"
                + "        <h1 style='margin: 5px 0 0 0; color: #059669; font-size: 32px;'>₹" + String.format("%.2f", amountPaid != null ? amountPaid : 0.0) + "</h1>"
                + "        <span style='background: #dcfce7; color: #166534; font-size: 11px; font-weight: bold; padding: 2px 8px; border-radius: 9999px;'>PAID IN FULL</span>"
                + "      </div>"
                + "      <table style='width: 100%; font-size: 13px; border-collapse: collapse;'>"
                + "        <tr><td style='padding: 6px 0; color: #64748b;'><strong>Invoice Number:</strong></td><td style='padding: 6px 0; font-weight: bold; text-align: right;'>" + invoiceNumber + "</td></tr>"
                + "        <tr><td style='padding: 6px 0; color: #64748b;'><strong>Flat Number:</strong></td><td style='padding: 6px 0; font-weight: bold; text-align: right;'>Flat " + flatNumber + "</td></tr>"
                + "        <tr><td style='padding: 6px 0; color: #64748b;'><strong>Payment Method:</strong></td><td style='padding: 6px 0; font-weight: bold; text-align: right;'>" + (paymentMethod != null ? paymentMethod : "Online Gateway") + "</td></tr>"
                + (paymentId != null ? "<tr><td style='padding: 6px 0; color: #64748b;'><strong>Transaction Ref ID:</strong></td><td style='padding: 6px 0; font-mono; font-size: 11px; text-align: right; color: #0284c7;'>" + paymentId + "</td></tr>" : "")
                + "        <tr><td style='padding: 6px 0; color: #64748b;'><strong>Payment Date:</strong></td><td style='padding: 6px 0; font-weight: bold; text-align: right;'>" + formattedDate + "</td></tr>"
                + "      </table>"
                + "    </div>"
                + (pdfAttachment != null ? "<p style='font-size: 12.5px; color: #64748b; text-align: center;'>📎 An official itemized PDF payment receipt is attached to this email for your records.</p>" : "")
                + "    <div style='text-align: center; margin: 25px 0;'>"
                + "      <a href='" + invoicesLink + "' style='background: #059669; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: bold; font-size: 13px; display: inline-block;'>View Invoices in Portal &rarr;</a>"
                + "    </div>"
                + "  </div>"
                + "  <div style='background: #f1f5f9; padding: 15px; text-align: center; font-size: 11px; color: #64748b;'>"
                + "    JalSetu Automated Billing & Payment Processing • " + apartmentName + ""
                + "  </div>"
                + "</div></body></html>";

        if (pdfAttachment != null && pdfAttachment.length > 0) {
            return dispatchEmailWithAttachment(residentEmail, emailSubject, html, "PAY_RECEIPT_" + invoiceNumber, "JalSetu_Receipt_" + invoiceNumber + ".pdf", pdfAttachment);
        }
        return dispatchHtmlEmail(residentEmail, emailSubject, html, "PAY_RECEIPT_" + invoiceNumber);
    }

    /**
     * Send payment received notification to Community Admin
     */
    public boolean sendPaymentReceivedNoticeToAdmin(String adminEmail,
                                                    String adminName,
                                                    String apartmentName,
                                                    String flatNumber,
                                                    String invoiceNumber,
                                                    Double amountPaid,
                                                    String paymentMethod,
                                                    String paymentId) {
        String emailSubject = "💰 Payment Received: ₹" + String.format("%.2f", amountPaid != null ? amountPaid : 0.0) + " from Flat " + flatNumber + " (" + invoiceNumber + ")";
        String invoicesLink = portalUrl + "/community-admin/invoices";

        String html = "<!DOCTYPE html><html><body style='font-family: Arial, sans-serif; background-color: #f8fafc; padding: 25px; margin: 0;'>"
                + "<div style='max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.06);'>"
                + "  <div style='background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); padding: 30px 25px; color: #ffffff; text-align: center;'>"
                + "    <h2 style='margin: 0; font-size: 22px;'>💰 Bill Collection Settled</h2>"
                + "    <p style='margin: 5px 0 0 0; opacity: 0.9; font-size: 13px;'>Flat " + flatNumber + " • " + apartmentName + "</p>"
                + "  </div>"
                + "  <div style='padding: 25px; color: #334155; font-size: 14px; line-height: 1.6;'>"
                + "    <p>Dear <strong>" + adminName + "</strong>,</p>"
                + "    <p>A water invoice payment has been settled for <strong>Flat " + flatNumber + "</strong>.</p>"
                + "    <div style='background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin: 20px 0;'>"
                + "      <table style='width: 100%; font-size: 13px; border-collapse: collapse;'>"
                + "        <tr><td style='padding: 6px 0; color: #64748b;'><strong>Invoice Number:</strong></td><td style='padding: 6px 0; font-weight: bold; text-align: right;'>" + invoiceNumber + "</td></tr>"
                + "        <tr><td style='padding: 6px 0; color: #64748b;'><strong>Household Flat:</strong></td><td style='padding: 6px 0; font-weight: bold; text-align: right;'>Flat " + flatNumber + "</td></tr>"
                + "        <tr><td style='padding: 6px 0; color: #64748b;'><strong>Amount Collected:</strong></td><td style='padding: 6px 0; font-weight: bold; color: #059669; text-align: right; font-size: 16px;'>₹" + String.format("%.2f", amountPaid != null ? amountPaid : 0.0) + "</td></tr>"
                + "        <tr><td style='padding: 6px 0; color: #64748b;'><strong>Payment Mode:</strong></td><td style='padding: 6px 0; font-weight: bold; text-align: right;'>" + (paymentMethod != null ? paymentMethod : "Online Gateway") + "</td></tr>"
                + (paymentId != null ? "<tr><td style='padding: 6px 0; color: #64748b;'><strong>Transaction Ref ID:</strong></td><td style='padding: 6px 0; font-mono; font-size: 11px; text-align: right; color: #0284c7;'>" + paymentId + "</td></tr>" : "")
                + "      </table>"
                + "    </div>"
                + "    <div style='text-align: center; margin: 25px 0;'>"
                + "      <a href='" + invoicesLink + "' style='background: #0284c7; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: bold; font-size: 13px; display: inline-block;'>View Collections in Admin Portal &rarr;</a>"
                + "    </div>"
                + "  </div>"
                + "  <div style='background: #f1f5f9; padding: 15px; text-align: center; font-size: 11px; color: #64748b;'>"
                + "    JalSetu Billing & Collections Desk • " + apartmentName + ""
                + "  </div>"
                + "</div></body></html>";

        return dispatchHtmlEmail(adminEmail, emailSubject, html, "ADMIN_PAY_NOTICE_" + invoiceNumber);
    }

    /**
     * Send pending / due bill reminder to resident (with optional attached PDF invoice)
     */
    public boolean sendPendingDueBillReminder(String residentEmail,
                                              String residentName,
                                              String flatNumber,
                                              String apartmentName,
                                              String invoiceNumber,
                                              Double amountDue,
                                              LocalDate dueDate,
                                              boolean isOverdue,
                                              String billingMonth) {
        return sendPendingDueBillReminder(residentEmail, residentName, flatNumber, apartmentName, invoiceNumber,
                amountDue, dueDate, isOverdue, billingMonth, null);
    }

    public boolean sendPendingDueBillReminder(String residentEmail,
                                              String residentName,
                                              String flatNumber,
                                              String apartmentName,
                                              String invoiceNumber,
                                              Double amountDue,
                                              LocalDate dueDate,
                                              boolean isOverdue,
                                              String billingMonth,
                                              byte[] pdfAttachment) {
        String emailSubject = (isOverdue ? "🚨 OVERDUE Notice: " : "⚠️ Payment Reminder: ")
                + "Water Bill " + invoiceNumber + " for Flat " + flatNumber + " (₹" + String.format("%.2f", amountDue != null ? amountDue : 0.0) + ")";
        String payLink = portalUrl + "/resident/invoices";

        String bannerColor = isOverdue ? "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)" : "linear-gradient(135deg, #d97706 0%, #b45309 100%)";
        String bannerTitle = isOverdue ? "🚨 OVERDUE Water Invoice Notice" : "⚠️ Upcoming Water Bill Due Date";

        String html = "<!DOCTYPE html><html><body style='font-family: Arial, sans-serif; background-color: #f8fafc; padding: 25px; margin: 0;'>"
                + "<div style='max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.06);'>"
                + "  <div style='background: " + bannerColor + "; padding: 30px 25px; color: #ffffff; text-align: center;'>"
                + "    <h2 style='margin: 0; font-size: 22px;'>" + bannerTitle + "</h2>"
                + "    <p style='margin: 5px 0 0 0; opacity: 0.9; font-size: 13px;'>Flat " + flatNumber + " • " + apartmentName + "</p>"
                + "  </div>"
                + "  <div style='padding: 25px; color: #334155; font-size: 14px; line-height: 1.6;'>"
                + "    <p>Dear <strong>" + residentName + "</strong>,</p>"
                + "    <p>" + (isOverdue
                ? "This is an urgent notice that your water bill for <strong>" + (billingMonth != null ? billingMonth : "the billing cycle") + "</strong> is now <strong style='color: #dc2626;'>OVERDUE</strong>."
                : "This is a friendly reminder that your monthly water bill for <strong>" + (billingMonth != null ? billingMonth : "the billing cycle") + "</strong> is due soon.") + "</p>"
                + "    <div style='background: #fffbeb; border: 1.5px solid #fde68a; border-radius: 12px; padding: 20px; margin: 20px 0;'>"
                + "      <div style='text-align: center; padding-bottom: 12px; border-bottom: 1px solid #fef3c7; margin-bottom: 12px;'>"
                + "        <span style='font-size: 12px; color: #92400e; text-transform: uppercase; font-weight: bold;'>Total Amount Outstanding</span>"
                + "        <h1 style='margin: 4px 0 0 0; color: " + (isOverdue ? "#dc2626" : "#b45309") + "; font-size: 32px;'>₹" + String.format("%.2f", amountDue != null ? amountDue : 0.0) + "</h1>"
                + "      </div>"
                + "      <table style='width: 100%; font-size: 13px; border-collapse: collapse;'>"
                + "        <tr><td style='padding: 5px 0; color: #64748b;'><strong>Invoice Number:</strong></td><td style='padding: 5px 0; font-weight: bold; text-align: right;'>" + invoiceNumber + "</td></tr>"
                + "        <tr><td style='padding: 5px 0; color: #64748b;'><strong>Due Date:</strong></td><td style='padding: 5px 0; font-weight: bold; text-align: right; color: " + (isOverdue ? "#dc2626" : "#0f172a") + ";'>" + (dueDate != null ? dueDate.toString() : "Immediate") + "</td></tr>"
                + "        <tr><td style='padding: 5px 0; color: #64748b;'><strong>Status:</strong></td><td style='padding: 5px 0; font-weight: bold; text-align: right; color: " + (isOverdue ? "#dc2626" : "#d97706") + ";'>" + (isOverdue ? "OVERDUE" : "PENDING") + "</td></tr>"
                + "      </table>"
                + "    </div>"
                + (pdfAttachment != null ? "<p style='font-size: 12.5px; color: #64748b; text-align: center;'>📎 An itemized PDF invoice copy is attached to this email for your reference.</p>" : "")
                + "    <p style='font-size: 13px; color: #64748b;'>Please settle your bill promptly to avoid late fee surcharges or supply disruption. You can pay securely online via UPI, Debit/Credit Card, or Net Banking on our portal.</p>"
                + "    <div style='text-align: center; margin: 25px 0;'>"
                + "      <a href='" + payLink + "' style='background: " + (isOverdue ? "#dc2626" : "#0284c7") + "; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 10px; font-weight: bold; font-size: 14px; display: inline-block;'>Pay Water Bill Online Now &rarr;</a>"
                + "    </div>"
                + "  </div>"
                + "  <div style='background: #f1f5f9; padding: 15px; text-align: center; font-size: 11px; color: #64748b;'>"
                + "    JalSetu Automated Billing Services • " + apartmentName + ""
                + "  </div>"
                + "</div></body></html>";

        if (pdfAttachment != null && pdfAttachment.length > 0) {
            return dispatchEmailWithAttachment(residentEmail, emailSubject, html, "DUE_REMINDER_" + invoiceNumber, "JalSetu_Invoice_" + invoiceNumber + ".pdf", pdfAttachment);
        }
        return dispatchHtmlEmail(residentEmail, emailSubject, html, "DUE_REMINDER_" + invoiceNumber);
    }
}


