package com.example.WaterManagement.service;

import com.example.WaterManagement.entity.Household;
import com.example.WaterManagement.entity.Invoice;
import com.example.WaterManagement.entity.TariffPlan;
import com.example.WaterManagement.entity.User;
import com.example.WaterManagement.repository.TariffPlanRepository;
import com.example.WaterManagement.repository.UserRepository;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.Optional;

@Service
public class InvoicePdfService {

    private static final Logger log = LoggerFactory.getLogger(InvoicePdfService.class);

    private final TariffPlanRepository tariffPlanRepository;
    private final UserRepository userRepository;

    public InvoicePdfService(TariffPlanRepository tariffPlanRepository, UserRepository userRepository) {
        this.tariffPlanRepository = tariffPlanRepository;
        this.userRepository = userRepository;
    }

    /**
     * Generates an enterprise-grade, professional PDF invoice matching modern SaaS & utility billing designs
     */
    public byte[] generateInvoicePdf(Invoice invoice) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            // A4 page with clean 28pt margins
            Document document = new Document(PageSize.A4, 28, 28, 28, 28);
            PdfWriter writer = PdfWriter.getInstance(document, out);
            document.open();

            Household household = invoice.getHousehold();
            String apartmentName = household != null && household.getApartment() != null
                    ? household.getApartment().getName()
                    : "Residential Community";
            String apartmentAddress = household != null && household.getApartment() != null && household.getApartment().getAddress() != null
                    ? household.getApartment().getAddress()
                    : "Urban Water Utility District";
            Long apartmentId = household != null && household.getApartment() != null
                    ? household.getApartment().getId()
                    : null;

            TariffPlan tariff = null;
            if (apartmentId != null) {
                Optional<TariffPlan> tariffOpt = tariffPlanRepository.findFirstByApartmentIdOrderByEffectiveFromDesc(apartmentId);
                tariff = tariffOpt.orElse(null);
            }

            // =========================================================================
            // PROFESSIONAL DESIGN PALETTE (Modern Corporate / Utility Theme)
            // =========================================================================
            Color navyDark = new Color(15, 23, 42);       // Slate 900
            Color navyMedium = new Color(30, 41, 59);     // Slate 800
            Color brandPrimary = new Color(2, 132, 199);   // Sky 600 (JalSetu Blue)
            Color brandDeep = new Color(3, 105, 161);      // Sky 700
            Color brandSoft = new Color(224, 242, 254);    // Sky 100
            Color textPrimary = new Color(15, 23, 42);     // Slate 900
            Color textSecondary = new Color(51, 65, 85);   // Slate 700
            Color textMuted = new Color(100, 116, 139);    // Slate 500
            Color cardBg = new Color(248, 250, 252);       // Slate 50
            Color cardBorder = new Color(226, 232, 240);   // Slate 200
            Color rowAltBg = new Color(248, 250, 252);     // Slate 50/White alternating

            // Status Colors
            Color emeraldText = new Color(5, 150, 105);    // Emerald 600
            Color emeraldBg = new Color(236, 253, 245);    // Emerald 50
            Color emeraldBorder = new Color(167, 243, 208);// Emerald 200

            Color amberText = new Color(217, 119, 6);      // Amber 600
            Color amberBg = new Color(254, 243, 199);      // Amber 100
            Color amberBorder = new Color(253, 230, 138);  // Amber 200

            // Professional Fonts
            Font brandNameFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, Color.WHITE);
            Font brandTaglineFont = FontFactory.getFont(FontFactory.HELVETICA, 8, new Color(224, 242, 254));
            Font headerInvTypeFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, Color.WHITE);
            Font headerInvNoFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, new Color(224, 242, 254));

            Font cardTitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, brandDeep);
            Font cardBoldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, textPrimary);
            Font cardRegularFont = FontFactory.getFont(FontFactory.HELVETICA, 8, textSecondary);
            Font cardMutedFont = FontFactory.getFont(FontFactory.HELVETICA, 7, textMuted);

            Font tableHeadFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, Color.WHITE);
            Font tableCellFont = FontFactory.getFont(FontFactory.HELVETICA, 8, textPrimary);
            Font tableCellBoldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, textPrimary);
            Font tableTotalLabelFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, textPrimary);
            Font tableTotalValueFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, brandDeep);

            // =========================================================================
            // 1. TOP CORPORATE BRAND BANNER
            // =========================================================================
            PdfPTable topBanner = new PdfPTable(2);
            topBanner.setWidthPercentage(100);
            topBanner.setWidths(new float[]{62, 38});

            // Left Banner: Brand Identity & Entity
            PdfPCell leftBannerCell = new PdfPCell();
            leftBannerCell.setBackgroundColor(brandDeep);
            leftBannerCell.setBorder(Rectangle.NO_BORDER);
            leftBannerCell.setPaddingTop(12);
            leftBannerCell.setPaddingBottom(12);
            leftBannerCell.setPaddingLeft(14);
            leftBannerCell.setPaddingRight(10);

            Paragraph pBrand = new Paragraph("JalSetu", brandNameFont);
            Paragraph pTagline = new Paragraph("Smart Water Telemetry & Sub-Metered Billing Platform", brandTaglineFont);
            Paragraph pCorporate = new Paragraph("Community Utility Services • " + apartmentName, FontFactory.getFont(FontFactory.HELVETICA, 7, new Color(186, 230, 253)));

            leftBannerCell.addElement(pBrand);
            leftBannerCell.addElement(pTagline);
            leftBannerCell.addElement(pCorporate);

            // Right Banner: Tax Invoice Label & Number
            PdfPCell rightBannerCell = new PdfPCell();
            rightBannerCell.setBackgroundColor(brandDeep);
            rightBannerCell.setBorder(Rectangle.NO_BORDER);
            rightBannerCell.setPaddingTop(12);
            rightBannerCell.setPaddingBottom(12);
            rightBannerCell.setPaddingLeft(10);
            rightBannerCell.setPaddingRight(14);
            rightBannerCell.setHorizontalAlignment(Element.ALIGN_RIGHT);

            Paragraph pInvTitle = new Paragraph("TAX INVOICE & UTILITY BILL", headerInvTypeFont);
            pInvTitle.setAlignment(Element.ALIGN_RIGHT);
            Paragraph pInvId = new Paragraph("# " + invoice.getInvoiceNumber(), headerInvNoFont);
            pInvId.setAlignment(Element.ALIGN_RIGHT);
            Paragraph pCycle = new Paragraph("Billing Cycle: " + invoice.getBillingMonth(), FontFactory.getFont(FontFactory.HELVETICA, 8, new Color(224, 242, 254)));
            pCycle.setAlignment(Element.ALIGN_RIGHT);

            rightBannerCell.addElement(pInvTitle);
            rightBannerCell.addElement(pInvId);
            rightBannerCell.addElement(pCycle);

            topBanner.addCell(leftBannerCell);
            topBanner.addCell(rightBannerCell);
            document.add(topBanner);

            // Spacer
            addVerticalSpace(document, 6);

            // =========================================================================
            // 2. BILLED TO & INVOICE SUMMARY SECTION (2-Column Symmetry Cards)
            // =========================================================================
            PdfPTable metaGrid = new PdfPTable(2);
            metaGrid.setWidthPercentage(100);
            metaGrid.setWidths(new float[]{50, 50});

            Optional<User> userOpt = household != null ? userRepository.findFirstByHouseholdId(household.getId()) : Optional.empty();
            String residentName = userOpt.map(User::getFullName).orElse("Valued Resident");
            String residentEmail = userOpt.map(User::getEmail).orElse("N/A");
            String flatNo = household != null && household.getFlatNumber() != null ? household.getFlatNumber() : "N/A";
            String meterNo = household != null && household.getMeterSerialNumber() != null
                    ? household.getMeterSerialNumber()
                    : "MTR-" + flatNo;

            String statusStr = invoice.getStatus() != null ? invoice.getStatus().name() : "PENDING";
            boolean isPaid = "PAID".equalsIgnoreCase(statusStr);

            // Card 1: Consumer Details
            PdfPCell consumerCard = new PdfPCell();
            consumerCard.setBackgroundColor(cardBg);
            consumerCard.setBorderColor(cardBorder);
            consumerCard.setBorderWidth(1f);
            consumerCard.setPadding(10);

            consumerCard.addElement(new Paragraph("BILLED TO (CONSUMER DETAILS)", cardTitleFont));
            consumerCard.addElement(new Paragraph("Resident: " + residentName, cardBoldFont));
            consumerCard.addElement(new Paragraph("Flat / Unit: Flat " + flatNo + " (" + apartmentName + ")", cardRegularFont));
            consumerCard.addElement(new Paragraph("Community Address: " + apartmentAddress, cardRegularFont));
            consumerCard.addElement(new Paragraph("Registered Email: " + residentEmail, cardRegularFont));

            // Card 2: Supply & Invoice Metadata
            PdfPCell invoiceCard = new PdfPCell();
            invoiceCard.setBackgroundColor(cardBg);
            invoiceCard.setBorderColor(cardBorder);
            invoiceCard.setBorderWidth(1f);
            invoiceCard.setPadding(10);

            invoiceCard.addElement(new Paragraph("INVOICE & SUPPLY SPECIFICATIONS", cardTitleFont));
            invoiceCard.addElement(new Paragraph("Meter Serial No: " + meterNo, cardBoldFont));
            invoiceCard.addElement(new Paragraph("Invoice Issue Date: " + (invoice.getGeneratedAt() != null ? invoice.getGeneratedAt().format(DateTimeFormatter.ofPattern("dd MMM yyyy")) : "N/A"), cardRegularFont));
            invoiceCard.addElement(new Paragraph("Payment Due Date: " + (invoice.getDueDate() != null ? invoice.getDueDate().format(DateTimeFormatter.ofPattern("dd MMM yyyy")) : "N/A"), cardRegularFont));

            // Status Badge
            Paragraph statusLine = new Paragraph();
            statusLine.add(new Chunk("Payment Status: ", cardBoldFont));
            if (isPaid) {
                statusLine.add(new Chunk("PAID (RECEIPT VERIFIED)", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, emeraldText)));
            } else {
                statusLine.add(new Chunk("PAYMENT DUE / PENDING", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, amberText)));
            }
            invoiceCard.addElement(statusLine);

            metaGrid.addCell(consumerCard);
            metaGrid.addCell(invoiceCard);
            document.add(metaGrid);

            // Spacer
            addVerticalSpace(document, 6);

            // =========================================================================
            // 3. METER TELEMETRY SUMMARY (4-Metric Professional Inset)
            // =========================================================================
            PdfPTable telemetryGrid = new PdfPTable(4);
            telemetryGrid.setWidthPercentage(100);
            telemetryGrid.setWidths(new float[]{25, 25, 28, 22});

            double startKl = invoice.getMeterReadingStartKl() != null ? invoice.getMeterReadingStartKl() : 0.0;
            double endKl = invoice.getMeterReadingEndKl() != null ? invoice.getMeterReadingEndKl() : 0.0;
            double consumptionKl = invoice.getConsumptionKl() != null ? invoice.getConsumptionKl() : 0.0;
            double consumptionLiters = consumptionKl * 1000.0;
            double dailyAverage = Math.round((consumptionKl / 30.0) * 100.0) / 100.0;

            addTelemetryCard(telemetryGrid, "PREVIOUS READING", String.format("%.2f kL", startKl), "Meter Start Index", cardBorder, cardBg, cardMutedFont, cardBoldFont);
            addTelemetryCard(telemetryGrid, "CURRENT READING", String.format("%.2f kL", endKl), "Meter End Index", cardBorder, cardBg, cardMutedFont, cardBoldFont);
            addTelemetryCard(telemetryGrid, "NET CONSUMPTION", String.format("%.2f kL (%,d L)", consumptionKl, Math.round(consumptionLiters)), "Sub-Metered Volume", cardBorder, brandSoft, cardMutedFont, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, brandDeep));
            addTelemetryCard(telemetryGrid, "DAILY AVERAGE", String.format("%.2f kL / day", dailyAverage), "30-Day Mean", cardBorder, cardBg, cardMutedFont, cardBoldFont);

            document.add(telemetryGrid);

            // Spacer
            addVerticalSpace(document, 6);

            // =========================================================================
            // 4. ITEMIZED CHARGES BREAKDOWN TABLE
            // =========================================================================
            PdfPTable itemTable = new PdfPTable(5);
            itemTable.setWidthPercentage(100);
            itemTable.setWidths(new float[]{6, 50, 14, 14, 16});

            // Table Header (Dark Navy Theme)
            addTableHeader(itemTable, "#", tableHeadFont, navyDark, Element.ALIGN_CENTER);
            addTableHeader(itemTable, "Charge Category & Tier Breakdown", tableHeadFont, navyDark, Element.ALIGN_LEFT);
            addTableHeader(itemTable, "Billed Volume", tableHeadFont, navyDark, Element.ALIGN_CENTER);
            addTableHeader(itemTable, "Rate (INR/kL)", tableHeadFont, navyDark, Element.ALIGN_RIGHT);
            addTableHeader(itemTable, "Amount (INR)", tableHeadFont, navyDark, Element.ALIGN_RIGHT);

            // Calculate Tier Breakdown
            double tier1Rate = tariff != null && tariff.getBaseRatePerKl() != null ? tariff.getBaseRatePerKl() : 18.0;
            double tier2Rate = tariff != null && tariff.getMidRatePerKl() != null ? tariff.getMidRatePerKl() : 28.0;
            double tier3Rate = tariff != null && tariff.getHigherRatePerKl() != null ? tariff.getHigherRatePerKl() : 50.0;

            double t1Vol = Math.min(consumptionKl, 10.0);
            double t2Vol = Math.max(0.0, Math.min(consumptionKl - 10.0, 15.0));
            double t3Vol = Math.max(0.0, consumptionKl - 25.0);

            double t1Amt = t1Vol * tier1Rate;
            double t2Amt = t2Vol * tier2Rate;
            double t3Amt = t3Vol * tier3Rate;

            int itemIdx = 1;

            // Row 1: Tier 1
            addTableRow(itemTable, String.valueOf(itemIdx++), "Tier 1: Base Essential Allowance (0.00 - 10.00 kL)", String.format("%.2f kL", t1Vol), String.format("%.2f", tier1Rate), String.format("%.2f", t1Amt), tableCellFont, tableCellBoldFont, cardBorder, Color.WHITE);

            // Row 2: Tier 2
            addTableRow(itemTable, String.valueOf(itemIdx++), "Tier 2: Standard Household Consumption (10.01 - 25.00 kL)", String.format("%.2f kL", t2Vol), String.format("%.2f", tier2Rate), String.format("%.2f", t2Amt), tableCellFont, tableCellBoldFont, cardBorder, rowAltBg);

            // Row 3: Tier 3
            addTableRow(itemTable, String.valueOf(itemIdx++), "Tier 3: High-Usage Surge Surcharge (> 25.00 kL)", String.format("%.2f kL", t3Vol), String.format("%.2f", tier3Rate), String.format("%.2f", t3Amt), tableCellFont, tableCellBoldFont, cardBorder, Color.WHITE);

            // Row 4: Common Apportionment
            double sharedAmt = invoice.getSharedCharge() != null ? invoice.getSharedCharge() : 0.0;
            addTableRow(itemTable, String.valueOf(itemIdx++), "Common Facilities & Bulk Tanker Apportionment (Shared)", "Proportional", "-", String.format("%.2f", sharedAmt), tableCellFont, tableCellBoldFont, cardBorder, rowAltBg);

            // Row 5: Fixed Maintenance Fee
            double baseFee = invoice.getBaseCharge() != null ? invoice.getBaseCharge() : 150.0;
            addTableRow(itemTable, String.valueOf(itemIdx++), "Fixed Water Infrastructure & Pipeline Maintenance Fee", "Flat Fee", "-", String.format("%.2f", baseFee), tableCellFont, tableCellBoldFont, cardBorder, Color.WHITE);

            // Adjustments if present
            if (invoice.getAdjustments() != null && Math.abs(invoice.getAdjustments()) > 0.01) {
                addTableRow(itemTable, String.valueOf(itemIdx++), "Billing Adjustments / Resident Rebate Credits", "Adjustment", "-", String.format("%.2f", invoice.getAdjustments()), tableCellFont, tableCellBoldFont, cardBorder, rowAltBg);
            }

            // Subtotal Calculation & Grand Total
            double totalAmt = invoice.getTotalAmount() != null ? invoice.getTotalAmount() : (t1Amt + t2Amt + t3Amt + sharedAmt + baseFee);

            // Summary Subtotal Row
            PdfPCell subtotalLabelCell = new PdfPCell(new Phrase("Subtotal Charges (INR):", cardRegularFont));
            subtotalLabelCell.setColspan(4);
            subtotalLabelCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            subtotalLabelCell.setPadding(6);
            subtotalLabelCell.setBackgroundColor(cardBg);
            subtotalLabelCell.setBorderColor(cardBorder);

            PdfPCell subtotalValCell = new PdfPCell(new Phrase(String.format("%.2f", totalAmt), cardBoldFont));
            subtotalValCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            subtotalValCell.setPadding(6);
            subtotalValCell.setBackgroundColor(cardBg);
            subtotalValCell.setBorderColor(cardBorder);

            itemTable.addCell(subtotalLabelCell);
            itemTable.addCell(subtotalValCell);

            // GST Row (0% for Residential Water Supply)
            PdfPCell gstLabelCell = new PdfPCell(new Phrase("Applicable Goods & Services Tax (GST 0% - Potable Water):", cardMutedFont));
            gstLabelCell.setColspan(4);
            gstLabelCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            gstLabelCell.setPadding(5);
            gstLabelCell.setBackgroundColor(cardBg);
            gstLabelCell.setBorderColor(cardBorder);

            PdfPCell gstValCell = new PdfPCell(new Phrase("0.00", cardMutedFont));
            gstValCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            gstValCell.setPadding(5);
            gstValCell.setBackgroundColor(cardBg);
            gstValCell.setBorderColor(cardBorder);

            itemTable.addCell(gstLabelCell);
            itemTable.addCell(gstValCell);

            // Grand Total Row (Highlighted Executive Style)
            PdfPCell totalLabelCell = new PdfPCell(new Phrase("TOTAL AMOUNT DUE / BILLED:", tableTotalLabelFont));
            totalLabelCell.setColspan(4);
            totalLabelCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            totalLabelCell.setPadding(8);
            totalLabelCell.setBackgroundColor(new Color(241, 245, 249));
            totalLabelCell.setBorderColor(cardBorder);

            PdfPCell totalValueCell = new PdfPCell(new Phrase(String.format("INR %.2f", totalAmt), tableTotalValueFont));
            totalValueCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            totalValueCell.setPadding(8);
            totalValueCell.setBackgroundColor(new Color(241, 245, 249));
            totalValueCell.setBorderColor(cardBorder);

            itemTable.addCell(totalLabelCell);
            itemTable.addCell(totalValueCell);

            document.add(itemTable);

            // Spacer
            addVerticalSpace(document, 6);

            // =========================================================================
            // 5. PAYMENT STATUS / INSTRUCTIONS BOX
            // =========================================================================
            PdfPTable footerNotice = new PdfPTable(1);
            footerNotice.setWidthPercentage(100);

            PdfPCell noticeCell = new PdfPCell();
            noticeCell.setBackgroundColor(isPaid ? emeraldBg : cardBg);
            noticeCell.setBorderColor(isPaid ? emeraldBorder : cardBorder);
            noticeCell.setBorderWidth(1f);
            noticeCell.setPadding(8);

            if (isPaid) {
                String payMethod = invoice.getPaymentMethod() != null ? invoice.getPaymentMethod() : "ONLINE_RAZORPAY";
                String payRef = invoice.getRazorpayPaymentId() != null ? invoice.getRazorpayPaymentId() : "VERIFIED_TXN";
                String paidTime = invoice.getPaidAt() != null ? invoice.getPaidAt().format(DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a")) : "Settled";

                noticeCell.addElement(new Paragraph("PAYMENT RECEIPT & SETTLEMENT CONFIRMATION", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, emeraldText)));
                noticeCell.addElement(new Paragraph("Thank you! This invoice has been settled in full via " + payMethod + " (Payment ID: " + payRef + " | " + paidTime + ").", cardRegularFont));
                noticeCell.addElement(new Paragraph("Digital settlement verified by JalSetu Razorpay Engine. Remaining account balance: INR 0.00.", cardMutedFont));
            } else {
                noticeCell.addElement(new Paragraph("PAYMENT INSTRUCTIONS & REMITTANCE ADVISORY", cardTitleFont));
                noticeCell.addElement(new Paragraph("• Pay online instantly via UPI (Google Pay, PhonePe, Paytm, BHIM), Credit/Debit Card, or Net Banking on the JalSetu Resident Portal.", cardRegularFont));
                noticeCell.addElement(new Paragraph("• Please ensure payment is completed on or before " + (invoice.getDueDate() != null ? invoice.getDueDate().format(DateTimeFormatter.ofPattern("dd MMM yyyy")) : "Due Date") + " to prevent overdue surcharge adjustments.", cardRegularFont));
            }

            noticeCell.addElement(new Paragraph("• For billing questions or meter audit requests, contact your Community Admin or email support@jalsetu.in", cardMutedFont));

            footerNotice.addCell(noticeCell);
            document.add(footerNotice);

            // =========================================================================
            // 6. CONSERVATION TIP & ELECTRONIC VERIFICATION FOOTER
            // =========================================================================
            Paragraph conservationTip = new Paragraph("Conservation Tip: Promptly repairing a leaking faucet or cistern saves up to 4,000 Liters of potable water every month.", FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 7, brandDeep));
            conservationTip.setAlignment(Element.ALIGN_CENTER);
            conservationTip.setSpacingBefore(6);
            document.add(conservationTip);

            Paragraph legalNotice = new Paragraph("This is a computer-generated tax invoice verified by the JalSetu Telemetry Engine. No physical signature is required.", FontFactory.getFont(FontFactory.HELVETICA, 7, textMuted));
            legalNotice.setAlignment(Element.ALIGN_CENTER);
            document.add(legalNotice);

            Paragraph bottomBrand = new Paragraph("JalSetu Technologies Pvt. Ltd. • Smart Water Management Solutions • www.jalsetu.in • support@jalsetu.in", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 7, textMuted));
            bottomBrand.setAlignment(Element.ALIGN_CENTER);
            bottomBrand.setSpacingBefore(3);
            document.add(bottomBrand);

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            log.error("Failed to generate PDF invoice for invoice {}: {}", invoice.getInvoiceNumber(), e.getMessage(), e);
            throw new RuntimeException("Error generating PDF invoice: " + e.getMessage(), e);
        }
    }

    private void addTelemetryCard(PdfPTable table, String title, String mainValue, String subtitle, Color border, Color bg, Font subFont, Font valFont) {
        PdfPCell cell = new PdfPCell();
        cell.setBorderColor(border);
        cell.setBorderWidth(1f);
        cell.setBackgroundColor(bg);
        cell.setPadding(6);

        Paragraph pTitle = new Paragraph(title, subFont);
        Paragraph pVal = new Paragraph(mainValue, valFont);
        Paragraph pSub = new Paragraph(subtitle, FontFactory.getFont(FontFactory.HELVETICA, 6, new Color(100, 116, 139)));

        cell.addElement(pTitle);
        cell.addElement(pVal);
        cell.addElement(pSub);
        table.addCell(cell);
    }

    private void addTableHeader(PdfPTable table, String headerTitle, Font font, Color bgColor, int alignment) {
        PdfPCell cell = new PdfPCell(new Phrase(headerTitle, font));
        cell.setBackgroundColor(bgColor);
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setPadding(6);
        cell.setHorizontalAlignment(alignment);
        table.addCell(cell);
    }

    private void addTableRow(PdfPTable table, String idx, String desc, String vol, String rate, String amt, Font regularFont, Font boldFont, Color border, Color bg) {
        PdfPCell cellIdx = new PdfPCell(new Phrase(idx, regularFont));
        cellIdx.setBorderColor(border);
        cellIdx.setBackgroundColor(bg);
        cellIdx.setPadding(5);
        cellIdx.setHorizontalAlignment(Element.ALIGN_CENTER);

        PdfPCell cellDesc = new PdfPCell(new Phrase(desc, regularFont));
        cellDesc.setBorderColor(border);
        cellDesc.setBackgroundColor(bg);
        cellDesc.setPadding(5);

        PdfPCell cellVol = new PdfPCell(new Phrase(vol, regularFont));
        cellVol.setBorderColor(border);
        cellVol.setBackgroundColor(bg);
        cellVol.setPadding(5);
        cellVol.setHorizontalAlignment(Element.ALIGN_CENTER);

        PdfPCell cellRate = new PdfPCell(new Phrase(rate, regularFont));
        cellRate.setBorderColor(border);
        cellRate.setBackgroundColor(bg);
        cellRate.setPadding(5);
        cellRate.setHorizontalAlignment(Element.ALIGN_RIGHT);

        PdfPCell cellAmt = new PdfPCell(new Phrase(amt, boldFont));
        cellAmt.setBorderColor(border);
        cellAmt.setBackgroundColor(bg);
        cellAmt.setPadding(5);
        cellAmt.setHorizontalAlignment(Element.ALIGN_RIGHT);

        table.addCell(cellIdx);
        table.addCell(cellDesc);
        table.addCell(cellVol);
        table.addCell(cellRate);
        table.addCell(cellAmt);
    }

    private void addVerticalSpace(Document doc, float height) throws DocumentException {
        Paragraph p = new Paragraph(" ");
        p.setSpacingBefore(height);
        p.setSpacingAfter(0);
        p.setLeading(0);
        doc.add(p);
    }
}
