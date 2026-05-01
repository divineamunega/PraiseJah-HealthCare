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
- **Audit Vault:** Comprehensive HIPAA-compliant audit logs tracking every clinical and administrative action.
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
   git clone https://github.com/your-username/PraiseJah-HealthCare.git
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

## 🌐 Deployment

### Backend (Render / Railway)
The backend is configured for "Managed Native" hosting.
- **Entry point:** `backend/src/main.ts`
- **Build Command:** `pnpm run build`
- **Start Command:** `pnpm run start:prod` (Automatically handles `prisma migrate deploy`)
- **API Prefix:** `/api/v1`
- **Health Check:** `/api/v1/health`

### Frontend (Vercel)
The frontend uses a Proxy Rewrite to maintain a single-domain experience.
- **Output Directory:** `dist`
- **Build Command:** `pnpm run build`
- **Config:** Managed via `frontend/vercel.json` to route `/api/v1/*` to the backend.

---

## 📖 API Documentation
Once the backend is running, you can access the interactive Swagger documentation at:
`http://localhost:3000/api/v1/docs`

---

## 📄 License
This project is licensed under the **UNLICENSED** (Private/Proprietary) license. All rights reserved.

---

**Developed with ❤️ for the healthcare community.**
