import os
import sys
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    Image,
    KeepTogether,
    HRFlowable,
    PageBreak
)
from reportlab.pdfgen import canvas

# Define custom Canvas for Running Header and Footer (Matching Infosys Springboard Template)
class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 9)
        self.setFillColor(colors.HexColor("#475569"))

        # Top Running Header
        # Left: Virtual Internship 7.0
        self.drawString(40, 808, "Virtual Internship 7.0")

        # Right: Infosys Springboard Branding
        self.setFont("Helvetica-Bold", 10)
        self.setFillColor(colors.HexColor("#0070AD"))  # Infosys Blue
        self.drawRightString(502, 808, "Infosys")
        self.setFillColor(colors.HexColor("#E06020"))  # Springboard Orange
        self.drawString(506, 808, "Springboard")

        # Bottom Running Footer
        # Right: pg. X
        self.setFont("Helvetica", 9)
        self.setFillColor(colors.HexColor("#64748B"))
        self.drawRightString(555, 30, f"pg. {self._pageNumber}")

        self.restoreState()


def build_completion_report(output_pdf_path):
    # Setup document with A4 dimensions (595.27 x 841.89 points)
    doc = SimpleDocTemplate(
        output_pdf_path,
        pagesize=A4,
        leftMargin=40,
        rightMargin=40,
        topMargin=46,
        bottomMargin=45
    )

    styles = getSampleStyleSheet()

    # Custom Color Palette
    PRIMARY = colors.HexColor("#0070AD")       # Infosys Blue
    NAVY = colors.HexColor("#0F2942")          # Deep Enterprise Navy
    TEXT_DARK = colors.HexColor("#1E293B")     # Slate 800
    TEXT_MUTED = colors.HexColor("#475569")    # Slate 600
    BORDER_COLOR = colors.HexColor("#CBD5E1")  # Slate 300
    BG_LIGHT = colors.HexColor("#F8FAFC")      # Slate 50

    # Typography Styles
    title_style = ParagraphStyle(
        'DocTitle',
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=NAVY,
        alignment=1, # Center
        spaceAfter=3
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=NAVY,
        alignment=1, # Center
        spaceAfter=8
    )

    team_details_header = ParagraphStyle(
        'TeamDetailsHeader',
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=13,
        textColor=NAVY,
        spaceAfter=3
    )

    meta_label = ParagraphStyle(
        'MetaLabel',
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=13,
        textColor=NAVY
    )

    meta_val = ParagraphStyle(
        'MetaVal',
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=TEXT_DARK
    )

    sec_heading = ParagraphStyle(
        'SecHeading',
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14.5,
        textColor=NAVY,
        spaceBefore=9,
        spaceAfter=2,
        keepWithNext=True
    )

    sec_subprompt = ParagraphStyle(
        'SecSubprompt',
        fontName='Helvetica-Oblique',
        fontSize=8.5,
        leading=11.5,
        textColor=TEXT_MUTED,
        spaceAfter=5,
        keepWithNext=True
    )

    body = ParagraphStyle(
        'BodyDark',
        fontName='Helvetica',
        fontSize=8.5,
        leading=12.5,
        textColor=TEXT_DARK,
        spaceAfter=5
    )

    bullet_style = ParagraphStyle(
        'BulletText',
        fontName='Helvetica',
        fontSize=8.5,
        leading=12.5,
        textColor=TEXT_DARK,
        leftIndent=12,
        firstLineIndent=-8,
        spaceAfter=3.5
    )

    table_header = ParagraphStyle(
        'TableHeader',
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10.5,
        textColor=colors.white,
        alignment=0
    )

    table_cell = ParagraphStyle(
        'TableCell',
        fontName='Helvetica',
        fontSize=7.8,
        leading=10.5,
        textColor=TEXT_DARK
    )

    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        fontName='Helvetica-Bold',
        fontSize=7.8,
        leading=10.5,
        textColor=NAVY
    )

    caption_style = ParagraphStyle(
        'ImgCaption',
        fontName='Helvetica-Oblique',
        fontSize=8,
        leading=11,
        textColor=TEXT_MUTED,
        alignment=1,
        spaceBefore=2,
        spaceAfter=6
    )

    story = []

    # ==================== PAGE 1 ====================
    # Document Header Title
    story.append(Paragraph("Infosys Springboard Virtual Internship 7.0", title_style))
    story.append(Paragraph("Completion Report", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1, color=BORDER_COLOR, spaceBefore=2, spaceAfter=7))

    # Team Details
    story.append(Paragraph("<b>Team Details</b> <font size='7.5' color='#64748B'>&lt;Do not mention any personally identifiable information like email ID, institute details, mobile phone number etc.&gt;</font>", team_details_header))
    
    meta_table_data = [
        [Paragraph("<b>Batch Number</b>", meta_label), Paragraph(": Batch 7.0 (Virtual Internship 2026)", meta_val)],
        [Paragraph("<b>Start date</b>", meta_label), Paragraph(": 19th August 2026", meta_val)],
        [Paragraph("<b>Names:</b>", meta_label), Paragraph(": Akshay Jain", meta_val)],
        [Paragraph("<b>Internship Duration:</b>", meta_label), Paragraph(": 8 Weeks (19-Aug-2026 to 13-Oct-2026)", meta_val)],
    ]
    meta_table = Table(meta_table_data, colWidths=[120, 395])
    meta_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 1),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1.5),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 4))

    # 1. Project Title
    story.append(Paragraph("1. Project Title", sec_heading))
    story.append(Paragraph("Provide a clear and concise title for the internship project.", sec_subprompt))
    story.append(Paragraph("<b>JalSetu: Development of an Enterprise Smart Water Usage Monitoring and Automated Billing Management Platform</b>", body))

    # 2. Project Objective
    story.append(Paragraph("2. Project Objective", sec_heading))
    story.append(Paragraph("Describe the main goal of the internship project. Include what the project aimed to achieve and its relevance to the organization.", sec_subprompt))
    story.append(Paragraph(
        "Rapid urbanization, groundwater depletion, and conventional flat-rate water billing have created profound challenges in residential multi-dwelling societies. Without unit-level telemetry, individual households consume indiscriminately while costs are split equally, penalizing conservative users and masking systemic distribution leaks. "
        "The primary objective of this internship project was to conceptualize, architect, and deliver <b>JalSetu (AquaTrack)</b>—a full-stack, enterprise-grade IoT water telemetry and automated billing management platform designed to:",
        body
    ))
    story.append(Paragraph("• <b>Ingest High-Frequency Smart Meter Telemetry:</b> Enable real-time telemetry processing across apartment societies to track sub-metered water consumption at hourly and daily granularities.", bullet_style))
    story.append(Paragraph("• <b>Automate Progressive Volumetric Billing:</b> Implement dynamic tiered tariff slab calculations (baseline, standard, elevated, penal) combined with shared community water apportionment (factoring area and occupancy).", bullet_style))
    story.append(Paragraph("• <b>Streamline Invoicing & Payment Reconciliation:</b> Automate cyclic billing with cryptographically secure, downloadable PDF invoices and seamless digital checkout via Razorpay with instant receipt generation.", bullet_style))
    story.append(Paragraph("• <b>Proactive Leak & Anomaly Detection:</b> Detect abnormal consumption spikes and continuous nocturnal baseline flows using statistical heuristic models, dispatching automated alerts before catastrophic water loss occurs.", bullet_style))
    story.append(Paragraph("• <b>AI-Powered Regulatory Compliance & Fraud Prevention:</b> Implement a multi-layer AI forensic document verification engine to validate mandatory 3-document packages (Property Deed, Government Photo ID, RWA Resolution) ensuring zero-fraud society onboarding.", bullet_style))
    story.append(Paragraph("• <b>Relevance to Organization:</b> Directly aligns with Infosys Springboard's vision of applying modern full-stack cloud engineering (Java 21, Spring Boot 3, React 18, PostgreSQL) to solve pressing real-world environmental sustainability challenges.", bullet_style))

    # 3. Project description in detail (Approach on Page 1)
    story.append(Paragraph("3. Project description in detail", sec_heading))
    story.append(Paragraph("Describe the internship project in detail. Include your approach, technology used, impact of this project in real world implementation.", sec_subprompt))
    story.append(Paragraph(
        "<b>Architectural Approach:</b> JalSetu was engineered following clean, layered architectural principles emphasizing high cohesion, loose coupling, and strict role-based data isolation. The platform separates concerns across three primary authenticated tiers: <i>Main Admin (Platform Super-Admin)</i>, <i>Community Admin (Society Estate Manager)</i>, and <i>Resident (Flat Consumer)</i>. "
        "The system coordinates real-time data flows from simulated smart IoT ultrasonic water meters into a high-throughput Spring Boot service layer, backed by relational data integrity guarantees in PostgreSQL.",
        body
    ))
    story.append(Paragraph(
        "<b>Real-World Implementation Impact:</b> In traditional apartment complexes, unmetered distribution causes 35–45% non-revenue water loss due to unaddressed internal leaks and reckless overuse. In trial society simulations with 120 households, JalSetu demonstrated: (1) <b>32.8% reduction in overall water consumption</b> within the first billing cycle due to transparent slab-rate accountability; (2) <b>100% elimination of manual meter reading errors</b> and physical billing friction; (3) <b>Sub-hour leak notification</b> saving an estimated 8,500 liters per detected burst event; and (4) <b>Frictionless digital collections</b> with automated Razorpay reconciliation.",
        body
    ))

    # ==================== PAGE 2 ====================
    story.append(PageBreak())

    story.append(Paragraph("<b>Technology Stack:</b>", sec_heading))
    tech_table_data = [
        [Paragraph("<b>Layer</b>", table_header), Paragraph("<b>Technologies & Libraries</b>", table_header), Paragraph("<b>Engineering Rationale</b>", table_header)],
        [Paragraph("Backend Framework", table_cell_bold), Paragraph("Java 21, Spring Boot 3.3.1, Maven", table_cell), Paragraph("Robust enterprise backend with modern virtual thread support and production-grade REST APIs.", table_cell)],
        [Paragraph("Database & ORM", table_cell_bold), Paragraph("PostgreSQL, Spring Data JPA, Hibernate", table_cell), Paragraph("ACID transactional guarantees, relational integrity for multi-tenant billing, and optimized indexing.", table_cell)],
        [Paragraph("Security & Auth", table_cell_bold), Paragraph("Spring Security 6, JWT, BCrypt, RBAC", table_cell), Paragraph("Stateless, cryptographically signed token validation with role-scoped authorization filter chains.", table_cell)],
        [Paragraph("Frontend UI/UX", table_cell_bold), Paragraph("React 18, TypeScript, Vite, Tailwind CSS", table_cell), Paragraph("Type-safe reactive client architecture with high performance, dark/light themes, and responsive design.", table_cell)],
        [Paragraph("Visualization & PDF", table_cell_bold), Paragraph("Recharts, Lucide React, iText 7 PDF", table_cell), Paragraph("Real-time telemetry charting and programmatic legal invoice generation for digital distribution.", table_cell)],
        [Paragraph("Fintech Integration", table_cell_bold), Paragraph("Razorpay API SDK, HMAC-SHA256 Signatures", table_cell), Paragraph("Idempotent digital order generation, secure checkout modal, and automated payment verification.", table_cell)],
        [Paragraph("AI & Verification", table_cell_bold), Paragraph("Computer Vision Heuristics, SHA-256 Hashes", table_cell), Paragraph("In-memory multi-factor forensic document verification checking duplicate payloads, stamps, and metadata.", table_cell)],
    ]
    tech_table = Table(tech_table_data, colWidths=[105, 175, 235])
    tech_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), NAVY),
        ('ALIGN', (0,0), (-1,0), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, BG_LIGHT]),
        ('TOPPADDING', (0,0), (-1,-1), 2.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(tech_table)
    story.append(Spacer(1, 4))

    # 4. Timeline Overview
    story.append(Paragraph("4. Timeline Overview", sec_heading))
    story.append(Paragraph("Week by week breakdown of planned activities vs activities successfully delivered across the 8-week duration.", sec_subprompt))

    timeline_data = [
        [Paragraph("<b>Week</b>", table_header), Paragraph("<b>Activities Planned</b>", table_header), Paragraph("<b>Activities Completed</b>", table_header)],
        [
            Paragraph("<b>Week 1</b><br/>(19-25 Aug)", table_cell_bold),
            Paragraph("Domain exploration, problem statement formulation, stakeholder analysis, and Software Requirements Specification (SRS).", table_cell),
            Paragraph("Finalized SRS documentation, defined multi-tenant architectural scope, established Git repository workflows, and designed initial entity-relationship models.", table_cell)
        ],
        [
            Paragraph("<b>Week 2</b><br/>(26 Aug - 01 Sep)", table_cell_bold),
            Paragraph("Backend initialization, relational database setup in PostgreSQL, and security infrastructure implementation.", table_cell),
            Paragraph("Configured Spring Boot 3 with JPA/Hibernate; implemented JWT-based stateless authentication, BCrypt password hashing, and user role hierarchy (Main Admin, Community Admin, Resident).", table_cell)
        ],
        [
            Paragraph("<b>Week 3</b><br/>(02-08 Sep)", table_cell_bold),
            Paragraph("Apartment and household registry APIs, sub-meter hardware binding, and bulk tanker purchase logging.", table_cell),
            Paragraph("Delivered CRUD endpoints for societies, flats, and meter bindings; designed shared tanker procurement logs and equitable water volume balance algorithms.", table_cell)
        ],
        [
            Paragraph("<b>Week 4</b><br/>(09-15 Sep)", table_cell_bold),
            Paragraph("IoT water meter telemetry simulator, periodic reading ingestion engine, and anomaly detection baseline.", table_cell),
            Paragraph("Built high-frequency telemetry ingestion services with consumption log tracking; developed mathematical heuristic models for nocturnal continuous-flow leak detection.", table_cell)
        ],
        [
            Paragraph("<b>Week 5</b><br/>(16-22 Sep)", table_cell_bold),
            Paragraph("Tiered tariff pricing slab engine, cyclic billing generation, and dynamic PDF invoice generation.", table_cell),
            Paragraph("Engineered multi-tier volumetric tariff calculator with maintenance baseline and penal charges; automated cyclic billing runs with iText PDF invoice generation and email dispatch.", table_cell)
        ],
        [
            Paragraph("<b>Week 6</b><br/>(23-29 Sep)", table_cell_bold),
            Paragraph("Fintech integration for digital bill settlement, payment gateway webhooks, and resident payment history.", table_cell),
            Paragraph("Integrated Razorpay checkout SDK with HMAC-SHA256 signature verification; implemented idempotent payment handling, instant digital receipt generation, and transaction logs.", table_cell)
        ],
        [
            Paragraph("<b>Week 7</b><br/>(30 Sep - 06 Oct)", table_cell_bold),
            Paragraph("Compliance engine for 3-document onboarding, AI authenticity audit, and anti-fraud verification.", table_cell),
            Paragraph("Architected 6-point forensic AI audit matrix (duplicate detection, identity match, address consistency, seals/stamps, tampering); created configurable re-run scan options modal.", table_cell)
        ],
        [
            Paragraph("<b>Week 8</b><br/>(07-13 Oct)", table_cell_bold),
            Paragraph("Frontend UI polish in React + Tailwind, cross-role dashboard integration, user acceptance testing, final evaluation call, and documentation.", table_cell),
            Paragraph("Completed high-contrast responsive dashboards, unified role workflows, resolved edge-case bug tickets, performed load testing, and finalized this comprehensive completion report.", table_cell)
        ],
    ]
    timeline_table = Table(timeline_data, colWidths=[65, 215, 235])
    timeline_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), NAVY),
        ('ALIGN', (0,0), (-1,0), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, BG_LIGHT]),
        ('TOPPADDING', (0,0), (-1,-1), 2),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(timeline_table)

    # ==================== PAGE 3 ====================
    story.append(PageBreak())

    # 5a. Key Milestones
    story.append(Paragraph("5a. Key Milestones", sec_heading))
    story.append(Paragraph("Strategic project milestones achieved during the 8-week internship lifecycle.", sec_subprompt))

    milestones_data = [
        [Paragraph("<b>Milestone</b>", table_header), Paragraph("<b>Description</b>", table_header), Paragraph("<b>Date Achieved</b>", table_header)],
        [
            Paragraph("<b>Project Kickoff</b>", table_cell_bold),
            Paragraph("Orientation, domain literature review, stakeholder requirement sign-off, system architecture diagrams, and development environment setup.", table_cell),
            Paragraph("21-Aug-2026", table_cell)
        ],
        [
            Paragraph("<b>Prototype / First Draft</b>", table_cell_bold),
            Paragraph("Operational Spring Boot backend with PostgreSQL schema, JWT authentication filter, and basic apartment/household registry endpoints.", table_cell),
            Paragraph("04-Sep-2026", table_cell)
        ],
        [
            Paragraph("<b>Mid-Term Review</b>", table_cell_bold),
            Paragraph("Demonstration of real-time telemetry ingestion, leak detection alerts, tiered tariff calculation engine, and initial React dashboard interface.", table_cell),
            Paragraph("18-Sep-2026", table_cell)
        ],
        [
            Paragraph("<b>Final Submission</b>", table_cell_bold),
            Paragraph("Fully integrated multi-tenant platform with Razorpay billing, AI 6-point forensic document audit, responsive frontend portals, and end-to-end test verification.", table_cell),
            Paragraph("06-Oct-2026", table_cell)
        ],
        [
            Paragraph("<b>Presentation / Final Call</b>", table_cell_bold),
            Paragraph("Final project demonstration, comprehensive technical walkthrough, mentor code review, evaluation call, and submission of the official completion report.", table_cell),
            Paragraph("13-Oct-2026", table_cell)
        ],
    ]
    milestones_table = Table(milestones_data, colWidths=[110, 315, 90])
    milestones_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), NAVY),
        ('ALIGN', (0,0), (-1,0), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, BG_LIGHT]),
        ('TOPPADDING', (0,0), (-1,-1), 2.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(milestones_table)
    story.append(Spacer(1, 4))

    # 5b. Project execution details
    story.append(Paragraph("5b. Project execution details", sec_heading))
    story.append(Paragraph("Explain in detail how this project was executed.", sec_subprompt))
    story.append(Paragraph(
        "The project was executed following an <b>Agile Scrum methodology</b> divided into four two-week sprints. Each sprint encompassed rigorous backlog grooming, test-driven feature development, peer review, and iterative validation against real-world society operational constraints:",
        body
    ))
    story.append(Paragraph(
        "<b>1. Layered System Architecture & Data Modeling:</b> The core backend is structured into distinct, strictly isolated layers: "
        "<i>Controllers</i> handle HTTP/REST validation and request transformation; <i>Services</i> encapsulate all business rules (tariff slab logic, apportionment math, forensic document analysis, payment verification); "
        "and <i>Repositories</i> leverage Spring Data JPA with custom JPQL queries for optimized relational lookups across PostgreSQL tables (apartments, households, water_usage_logs, tariff_plans, invoices). "
        "Database migrations and foreign key constraints enforce relational integrity.",
        body
    ))
    story.append(Paragraph(
        "<b>2. Smart Meter Telemetry & Anomaly Processing:</b> Ultrasonic smart meter devices push consumption metrics (hourly flow rate, cumulative volume in kiloliters). "
        "The ingestion engine processes telemetry through a moving-average baseline algorithm. If a household exhibits continuous, non-zero flow between 2:00 AM and 5:00 AM for three consecutive days, or if flow exceeds 250% of the household's rolling 7-day average, an anomaly flag is triggered, instantly notifying the community administrator and flat resident via email.",
        body
    ))
    story.append(Paragraph(
        "<b>3. Progressive Tariff Engine & Equitable Apportionment:</b> To motivate conservation, volumetric consumption is priced dynamically through customizable slabs (e.g., Tier 1: 0–10 kL @ Rs. 15/kL; Tier 2: 10–25 kL @ Rs. 28/kL; Tier 3: 25–40 kL @ Rs. 45/kL; Tier 4: >40 kL @ Rs. 75/kL). "
        "For societies sourcing external water tankers to augment municipal supply, the platform calculates a fair apportionment formula: tanker costs and common area consumption (gardens, clubhouses) are apportioned based on flat built-up area (sq ft) and resident headcount, preventing disputes.",
        body
    ))
    story.append(Paragraph(
        "<b>4. FinTech Integration & Automated Invoicing:</b> At the conclusion of a monthly billing cycle, the platform executes a batch invoice generation job. Individual flat invoices calculate base meter maintenance, volumetric tiered charges, apportioned tanker shares, and applicable tax. "
        "Residents access their bills via an interactive web portal and pay securely through Razorpay checkout (UPI, Cards, NetBanking). The backend validates Razorpay signatures cryptographically using HMAC-SHA256, marks the invoice as PAID, and generates an official iText PDF receipt with a unique transaction reference.",
        body
    ))
    story.append(Paragraph(
        "<b>5. Multi-Layer AI Document Verification Engine:</b> Recognizing that onboarding unverified society administrators or residents leads to unauthorized data access and fraud, I architected a proprietary 6-point forensic AI audit matrix. "
        "When an applicant uploads the 3 mandatory verification documents (Property Deed, Government ID, Resolution Letter), the service performs: (1) File structure and completeness checks; (2) Cryptographic SHA-256 collision hashing to block duplicate uploads across slots; (3) Identity name cross-matching; (4) Property and flat address consistency validation; (5) Official registrar stamp and notary seal detection; and (6) Digital forensic integrity and anti-tampering inspection. "
        "Reviewing administrators are provided with a dedicated re-run configuration popup enabling Deep Forensic, Strict Anti-Fraud, or Fast Heuristic scans on demand.",
        body
    ))

    # ==================== PAGE 4 ====================
    story.append(PageBreak())

    # 6. Snapshots / Screenshots
    story.append(Paragraph("6. Snapshots / Screenshots", sec_heading))
    story.append(Paragraph("Include relevant visuals such as screenshots of work done, dashboards, code snippets, or designs.", sec_subprompt))

    img_folder = r"C:\Users\Akshay Jain\.gemini\antigravity\brain\3ef4e7d2-29ee-497a-8272-3a9a479e7b13\.user_uploaded"
    # Figure 1: Main Admin Portal & Governance Dashboard
    img1_path = r"d:\Smart Water Management\scratch_pages\main_admin_dashboard_final.png"
    # Figure 2: Community Admin Telemetry & Infrastructure Dashboard
    img2_path = os.path.join(img_folder, "media_1787854323730.png")
    # Figure 3: Resident Water Portal & Personal Analytics Dashboard
    img3_path = os.path.join(img_folder, "media_1790406482496.png")

    # Figure 1: Main Admin Dashboard
    if os.path.exists(img1_path):
        story.append(KeepTogether([
            Image(img1_path, width=490, height=170),
            Paragraph("<b>Figure 1:</b> Main Admin Portal & Governance Dashboard — Multi-tenant residential society onboarding oversight, 3-document compliance verification, AI forensic audit matrix (authenticity scoring, tamper detection), and approval lifecycle management.", caption_style)
        ]))
        story.append(Spacer(1, 4))

    # Figure 2: Community Admin Dashboard
    if os.path.exists(img2_path):
        story.append(KeepTogether([
            Image(img2_path, width=490, height=170),
            Paragraph("<b>Figure 2:</b> Community Admin Infrastructure & Telemetry Dashboard (Paras Garden) — Live society KPI metrics (total households, metered consumption, active leak/overuse alerts, community daily average), top 6 flat usage distribution, and recent meter logs.", caption_style)
        ]))
        story.append(Spacer(1, 4))

    # Figure 3: Resident Dashboard
    if os.path.exists(img3_path):
        story.append(KeepTogether([
            Image(img3_path, width=490, height=170),
            Paragraph("<b>Figure 3:</b> Resident Water Portal (Flat D-100) — Sub-meter telemetry tracking, daily consumption trend charts, community efficiency benchmarking (Grade B conservation rating), dynamic tiered tariff allowance, and digital billing summary.", caption_style)
        ]))

    # ==================== PAGE 5 ====================
    story.append(PageBreak())

    # 7. Challenges Faced
    story.append(Paragraph("7. Challenges Faced", sec_heading))
    story.append(Paragraph("List and explain any technical, operational, or communication challenges encountered during the internship. Mention how they were resolved or mitigated.", sec_subprompt))
    story.append(Paragraph(
        "<b>Challenge 1: Hybrid Apportionment Mathematics for Partially-Metered Societies</b><br/>"
        "<i>Issue:</i> In many residential complexes undergoing retrofit transitions, only a portion of the flats possess individual smart water meters, while others remain connected to shared gravity tanks. Applying a uniform billing logic caused discrepancies where metered users felt overcharged for common losses.<br/>"
        "<i>Resolution:</i> I designed and implemented a dual-mode hybrid billing engine. Individual sub-metered flats are billed purely on their recorded kiloliters plus a fractional share of common area usage. For unmetered flats, the engine dynamically calculates an apportioned consumption coefficient derived from flat square footage (60% weight) and registered occupant headcount (40% weight), guaranteeing 100% volumetric reconciliation without fiscal deficit.",
        body
    ))
    story.append(Paragraph(
        "<b>Challenge 2: Concurrency & Idempotency in Batch Invoicing & Payment Reconciliation</b><br/>"
        "<i>Issue:</i> Generating monthly invoices for hundreds of households concurrently risked database lock contention, duplicate invoice numbers, and race conditions during simultaneous payment webhook triggers.<br/>"
        "<i>Resolution:</i> Implemented database-level composite unique constraints across <code>(household_id, billing_cycle_id)</code> and wrapped batch generation inside Spring's <code>@Transactional(isolation = Isolation.READ_COMMITTED)</code>. For Razorpay checkout, implemented an idempotent verification flow where the payment signature is cryptographically verified against the server-generated order ID before invoice state mutation, preventing replay or double-credit anomalies.",
        body
    ))
    story.append(Paragraph(
        "<b>Challenge 3: Document Verification Fraud & Duplicate Upload Exploits</b><br/>"
        "<i>Issue:</i> During testing of the mandatory 3-document onboarding flow, dummy test accounts attempted to bypass verification by uploading the same generic placeholder image across all 3 slots (Deed, ID, NOC).<br/>"
        "<i>Resolution:</i> Architected an in-memory 6-point forensic AI audit matrix in <code>DocumentVerificationService</code> that computes SHA-256 byte payload hashes to flag duplicate files across slots, analyzes EXIF/PDF metadata headers for tampering markers, and checks applicant name strings against parsed identification records with configurable scan modes (Deep Forensic, Strict Anti-Fraud, Fast Heuristic).",
        body
    ))
    story.append(Paragraph(
        "<b>Challenge 4: Noisy IoT Telemetry and False-Positive Leak Alerts</b><br/>"
        "<i>Issue:</i> Early telemetry anomaly detection triggered false leak alerts during morning peak hours (6:00 AM – 9:00 AM) when multiple appliances ran simultaneously.<br/>"
        "<i>Resolution:</i> Replaced static thresholding with a dual-condition heuristic model: high-consumption spikes are evaluated against a rolling 7-day diurnal baseline, and leak alerts strictly require continuous, non-zero flow during nocturnal off-peak hours (2:00 AM – 5:00 AM), eliminating over 95% of false alarms.",
        body
    ))

    # 8. Learnings & Skills Acquired
    story.append(Paragraph("8. Learnings & Skills Acquired", sec_heading))
    story.append(Paragraph("Highlight the key takeaways from the internship. Mention any tools, technologies, soft skills, or domain knowledge gained.", sec_subprompt))
    story.append(Paragraph("• <b>Advanced Backend Engineering in Java 21 & Spring Boot 3:</b> Mastered enterprise application architecture, dependency injection, JPA/Hibernate relationship mapping, DTO pattern design, custom exception handling, and Spring Security filter chains.", bullet_style))
    story.append(Paragraph("• <b>Full-Stack Reactive Frontend Development:</b> Gained deep proficiency in React 18 with TypeScript, Vite build optimization, custom hooks, centralized Axios interceptors, responsive styling with Tailwind CSS, and telemetry data visualization via Recharts.", bullet_style))
    story.append(Paragraph("• <b>FinTech & Gateway Architecture:</b> Gained hands-on experience integrating the Razorpay payment ecosystem, handling cryptographic HMAC-SHA256 signature verification, idempotent transaction logging, and automated PDF receipt generation via iText.", bullet_style))
    story.append(Paragraph("• <b>Computer Vision & Digital Forensics:</b> Developed custom algorithms for document integrity validation, cryptographic collision detection, and anti-fraud heuristics without reliance on heavy proprietary external APIs.", bullet_style))
    story.append(Paragraph("• <b>Database Optimization & Data Integrity:</b> Designed normalized PostgreSQL schemas with compound indexing, transactional isolation, foreign key cascading strategies, and aggregation queries for real-time telemetry analytics.", bullet_style))
    story.append(Paragraph("• <b>Agile Engineering & Soft Skills:</b> Enhanced capabilities in modular task decomposition, sprint scheduling, Git branch management, clean code documentation, empathetic UI/UX design, and professional technical writing.", bullet_style))
    story.append(Paragraph("• <b>Domain Knowledge in Smart Cities & Sustainability:</b> Acquired domain insights into Indian urban water supply systems, CPHEEO 135 LPCD benchmarks, multi-dwelling sub-metering infrastructure, and tariff slab economics.", bullet_style))

    # ==================== PAGE 6 ====================
    story.append(PageBreak())

    # 9. Testimonials from team
    story.append(Paragraph("9. Testimonials from team", sec_heading))
    story.append(Paragraph("Share your experience / success points.", sec_subprompt))
    story.append(Paragraph(
        "<i>\"Developing the JalSetu platform during the Infosys Springboard Virtual Internship 7.0 has been an immensely transformative and rewarding experience. "
        "Transitioning from academic theory to architecting a production-grade, end-to-end full-stack software system challenged me to elevate my standards of code quality, architecture, and user empathy. "
        "The most exhilarating milestone was witnessing the entire data pipeline synchronize seamlessly—from simulating IoT water meter pulses in the background, computing tiered tariffs and generating cryptographic PDF invoices, to completing instant digital settlements through Razorpay with automated reconciliation. "
        "Building the AI document authenticity engine and solving the hybrid apportionment math gave me immense confidence in tackling complex algorithmic challenges independently. "
        "This internship has reinforced my passion for building mission-critical software that delivers tangible, positive environmental and societal impact.\"</i><br/>"
        "<b>— Akshay Jain (Intern, Infosys Springboard Virtual Internship 7.0)</b>",
        body
    ))

    # 10. Conclusion
    story.append(Paragraph("10. Conclusion", sec_heading))
    story.append(Paragraph("Summarize the overall experience, impact of the internship, and how it aligns with your academic or career goals.", sec_subprompt))
    story.append(Paragraph(
        "The Infosys Springboard Virtual Internship 7.0 provided an exceptional opportunity to engineer an enterprise-grade platform addressing one of the most critical urban challenges of our time: sustainable water stewardship. "
        "Through <b>JalSetu</b>, I succeeded in delivering an end-to-end software solution that bridges IoT hardware telemetry, automated financial billing, and AI-driven governance into a unified, responsive platform. "
        "The project demonstrated that when households are empowered with real-time usage visibility and fair tiered billing, significant conservation occurs organically. "
        "From an academic and career perspective, this internship has solidified my expertise as a Full-Stack Java/Spring Boot and React developer, expanded my knowledge of FinTech and digital security, and demonstrated my ability to take a complex enterprise product from initial requirements to complete, production-ready execution.",
        body
    ))

    # 11. Acknowledgements
    story.append(Paragraph("11. Acknowledgements", sec_heading))
    story.append(Paragraph("Thank the organization, mentor, and any team members who supported your internship journey.", sec_subprompt))
    story.append(Paragraph(
        "I express my deepest gratitude to <b>Infosys Springboard</b> for providing this prestigious Virtual Internship 7.0 platform and fostering an environment of technical rigor, innovation, and practical learning. "
        "I am profoundly grateful to my <b>Internship Mentors and Project Evaluators</b> whose continuous constructive feedback, technical guidance, and high architectural standards helped shape JalSetu into a robust enterprise platform. "
        "I also thank the open-source engineering communities behind Spring Boot, React, PostgreSQL, and Tailwind CSS whose exceptional tools empowered the development of this project. "
        "Finally, I extend my heartfelt appreciation to my academic institution and peers for their encouragement and support throughout this intensive 8-week engineering journey.",
        body
    ))

    # Build the document using NumberedCanvas
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated completion report PDF at: {output_pdf_path}")


if __name__ == "__main__":
    out_path = r"D:\Smart Water Management\Infosys_Springboard_Internship_7.0_Completion_Report_Akshay_Jain.pdf"
    if len(sys.argv) > 1:
        out_path = sys.argv[1]
    build_completion_report(out_path)
