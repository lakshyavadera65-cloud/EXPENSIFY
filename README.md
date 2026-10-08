# EXPENSIFY — Full-Stack Expense & Budget Management

A full-stack enterprise expense tracking and budget monitoring application built with **Spring Boot 3 (Java 21)** and **Next.js 16 (React 19, Tailwind CSS, Shadcn UI)**.

---

## 📁 Repository Structure

```
EXPENSIFY/
├── backend/                  # Java / Spring Boot 3 REST API
│   ├── src/main/java/...     # Controllers, Services, Entities, DTOs, Security
│   ├── src/main/resources/   # application.properties
│   ├── pom.xml               # Maven build file with dependencies
│   ├── Dockerfile            # Container deployment configuration
│   ├── render.yaml           # Render deployment spec
│   ├── DATABASE_CONTRACT.md  # Database schema documentation
│   └── TEAM_API_CONTRACT.md  # REST API specifications
│
├── frontend/                 # Next.js 16 + React 19 Frontend
│   ├── app/                  # Next.js App Router (Dashboard, Expenses, Auth)
│   ├── components/           # UI components (Shadcn, forms, charts)
│   ├── lib/                  # API client, auth context, mock data, utilities
│   ├── public/               # Static assets & icons
│   ├── package.json          # Dependencies & npm scripts
│   └── tsconfig.json         # TypeScript configuration
│
├── .gitignore                # Root gitignore for Java, Node, and IDE files
└── README.md                 # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites
- **Java 21** or higher
- **Maven 3.8+**
- **Node.js 18+** (Node v20+ recommended)
- **PostgreSQL 14+** (for live backend database)

---

### 1. Running the Backend (Spring Boot)

1. Open a terminal and navigate to `backend/`:
   ```bash
   cd backend
   ```
2. Configure your environment variables or update `src/main/resources/application.properties`:
   - `DB_URL`: PostgreSQL connection URL (default: `jdbc:postgresql://localhost:5432/expensify`)
   - `DB_USERNAME`: Database username (default: `postgres`)
   - `DB_PASSWORD`: Database password
   - `WEATHER_API_KEY`: (Optional) Google Weather API key
3. Build and start the backend:
   ```bash
   mvn spring-boot:run
   ```
4. The API server will be available at:
   - **Base URL:** `http://localhost:8080`
   - **Health Check:** `http://localhost:8080/api/health`

---

### 2. Running the Frontend (Next.js)

1. Open a terminal and navigate to `frontend/`:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   # or with pnpm
   pnpm install
   ```
3. Set up environment variables (optional):
   ```bash
   cp .env.example .env.local
   ```
   *Note: If `NEXT_PUBLIC_API_URL` is omitted, the frontend automatically runs in demo mode using fast in-memory mock data.*
4. Start the development server:
   ```bash
   npm run dev
   # or
   pnpm dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔒 Security & Architecture Features

- **JWT Authentication**: Secure stateless token authentication via interceptors.
- **Role-Based Access Control**: Separate privileges for `CUSTOMER`, `EMPLOYEE`, `MANAGER`, `HEAD`, and `ADMIN`.
- **IDOR Protection**: Validated user permissions ensuring users can only read/write their own budgets and expenses.
- **Budget Threshold Alerts**: Real-time automated alerts triggering at 80%, 85%, 90%, 95%, and 100% of defined budget limits.
- **Location & Weather Alerts**: Optional external integration for weather conditions.
- **Responsive Dashboard**: Data visualization with Recharts, dark/light theme support, and accessible UI components.
