# JalSetu (जलसेतु) - Smart Water Usage Monitoring & Automated Billing Management Platform

JalSetu is an enterprise-grade IoT-ready water utility, leak anomaly detection, and automated billing management platform built for residential housing societies and apartment communities.

---

## 🏗️ Architecture & Tech Stack

```
JalSetu/
├── backend/                   # Spring Boot REST API Service
│   ├── src/main/java/         # Application controllers, services, repositories, entities
│   ├── src/main/resources/    # Database migrations (Flyway), templates & configs
│   ├── pom.xml                # Maven dependencies & build definitions
│   └── application-local.properties.example
│
├── frontend/                  # React Single-Page Application
│   ├── src/                   # React components, pages, hooks, contexts & services
│   ├── package.json           # Node dependencies
│   ├── vite.config.ts         # Vite bundler & reverse proxy configuration
│   └── .env.example
│
├── .gitignore                 # Strict Git exclusion definitions (secrets & build outputs)
└── README.md                  # System documentation & setup guide
```

### Core Technologies
- **Backend:** Java 21, Spring Boot 3.3.4, Spring Security 6 (JWT stateless authentication), Spring Data JPA / Hibernate, Flyway DB Migrations, PostgreSQL.
- **Frontend:** React 18, Vite 5, TypeScript 5, Tailwind CSS 3.4, Lucide React icons, Recharts data visualization.
- **Integrations:** Google Gemini AI (Water Copilot & Document Verification), Razorpay Payment Gateway, JavaMail SMTP (Automated PDF Billing Statements).

---

## 🚀 Quick Start & Local Setup

### 1. Prerequisites
- **Java:** JDK 21+
- **Maven:** 3.8+ (or use included `./mvnw`)
- **Node.js:** v18+ or v20+
- **PostgreSQL:** v15+ running on port `5432` with database `smartwater_db`

### 2. Backend Setup
1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Configure local credentials:
   ```bash
   cp application-local.properties.example application-local.properties
   ```
   Edit `application-local.properties` with your PostgreSQL password and optional API keys.
3. Build and start the backend service:
   ```bash
   ./mvnw spring-boot:run
   ```
   Backend will start on `http://localhost:8085` (Swagger UI: `http://localhost:8085/swagger-ui.html`).

### 3. Frontend Setup
1. Open a new terminal and navigate to `frontend/`:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
4. Start development server:
   ```bash
   npm run dev
   ```
   Application will be available at `http://localhost:5173`.

---

## 🔒 Security & Privacy Policy
- **Zero Secrets in Git:** All API keys, tokens, passwords, and private certificates are strictly excluded from version control.
- **Config Overrides:** Sensitive local settings reside in `application-local.properties` and `.env`, protected by `.gitignore`.

---

## 📄 Internship Documentation
- **Official Completion Report:** [`Infosys_Springboard_Internship_7.0_Completion_Report_Akshay_Jain.pdf`](./Infosys_Springboard_Internship_7.0_Completion_Report_Akshay_Jain.pdf)
- **Author:** Akshay Jain
- **Program:** Infosys Springboard Virtual Internship 7.0 (19-Aug-2026 to 13-Oct-2026)

