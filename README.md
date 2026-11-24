# PraiseJah HealthCare 🏥

**PraiseJah HealthCare** is a modern, professional-grade Electronic Medical Record (EMR) system designed for high-performance clinical workflows. Built with a "Surgical" aesthetic, it combines robust security, real-time collaboration, and an intuitive interface to streamline patient care.

---

## 🚀 Key Features

### 🩺 Clinical Workflows
- **Encounter Workstation:** Advanced SOAP-based clinical documentation with auto-save and versioning.
- **Clinical Matrix:** Real-time patient queue management using WebSockets.
- **Vitals Monitoring:** Historical tracking and visualization of patient health metrics.
- **Diagnostic Engine:** Lab order management with rich result summaries and status tracking.
- **Prescription Suite:** Medication management with dosage and frequency controls.

### 🔐 Security & Governance
- **Audit Vault:** Audit logs of every clinical and administrative action, designed with HIPAA audit-trail requirements in mind.
- **RBAC (Role-Based Access Control):** Granular permissions for Super Admins, Doctors, Nurses, Secretaries, and Lab Scientists.
- **Session Security:** Hashed refresh tokens, IP tracking, and secure password management.

### 🏢 Administrative Tools
- **Staff Management:** Centralized hub for managing clinical personnel and their active status.
- **Patient Registry:** Efficient patient search and record management with soft-delete protection.

---

## 🛠 Tech Stack

### Frontend
- **React 19** & **Vite** (Optimized with Lazy Loading)
- **TailwindCSS 4** (Surgical/Dark Aesthetic)
- **Framer Motion** (Smooth Clinical Transitions)
- **TanStack Query** (Robust Data Fetching)
- **Zustand** (Lightweight State Management)
- **Lucide React** (Clean Medical Iconography)

### Backend
- **NestJS 11** (Modular Architecture)
- **Prisma 7** (Type-safe ORM)
- **PostgreSQL** (Relational Data)
- **BullMQ & Redis** (Resilient Background Jobs)
- **Swagger/OpenAPI** (Interactive Documentation)
- **Resend** (High-fidelity Transactional Emails)

---

## 📥 Getting Started

### Prerequisites
- **Node.js:** v20+
- **pnpm:** v9+
- **Docker:** For local database and Redis (optional but recommended)

### Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/divineamunega/PraiseJah-HealthCare.git
   cd PraiseJah-HealthCare
   ```

2. **Start Infrastructure (Postgres & Redis):**
   ```bash
   cd backend
   docker-compose up -d
   ```

3. **Install Dependencies:**
   ```bash
   # In backend/
   pnpm install
   
   # In frontend/
   pnpm install
   ```

4. **Environment Setup:**
   - Copy `backend/.env.example` to `backend/.env` and fill in your secrets.
   - Ensure `frontend/.env` points to `http://localhost:3000/api/v1`.

5. **Run the Application:**
   ```bash
   # Terminal 1 (Backend)
   cd backend
   pnpm run start:dev
   
   # Terminal 2 (Frontend)
   cd frontend
   pnpm run dev
   ```

---

## 🌐 Deployment (VM / Production)

The project is optimized for deployment on a VM (Ubuntu/Debian) using Docker Compose and Nginx as a reverse proxy.

### 1. Preparation
- Ensure **Docker** and **Docker Compose** are installed on your VM.
- Allow traffic on **Port 80** (HTTP) in your firewall settings.

### 2. Deployment Steps
1. **Clone the repository:**
   ```bash
   git clone https://github.com/divineamunega/PraiseJah-HealthCare.git
   cd PraiseJah-HealthCare
   ```

2. **Configure Environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your production secrets, IP/Domain, and database credentials
   nano .env
   ```

3. **Launch the Stack:**
   ```bash
   docker-compose up --build -d
   ```

4. **Seed the Database:**
   Set `SEED_PASSWORD` in `.env` to a strong, unique value first. The seed creates a super admin and one demo account per role, and it refuses to run in production with the default password. Then populate the database:
   ```bash
   docker-compose exec backend pnpm run seed
   ```
   Change the super admin password after first login, and remove the demo accounts before real use.

### 3. Why this works (The "Magic")
- **Unified Gateway:** Nginx serves the frontend and proxies `/api/v1` to the backend internally.
- **Zero CORS:** Since everything is on Port 80, no cross-origin configuration is required.
- **Auto-Migrations:** The backend container automatically runs Prisma migrations on startup.
- **Health Checks:** The backend waits for Postgres and Redis to be fully healthy before starting.

---

## 📖 API Documentation
Once the backend is running, you can access the interactive Swagger documentation at:
`http://localhost:3000/api/v1/docs`

---

## 📄 License
This project is licensed under the **UNLICENSED** (Private/Proprietary) license. All rights reserved.

---

**Developed with ❤️ for the healthcare community.**
