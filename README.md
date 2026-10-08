# EXPENSIFY Backend - Beginner Version

This is the **simple Java/Spring Boot backend** for EXPENSIFY.

The code is intentionally written so a beginner can understand the main logic.

## Main idea

Frontend -> Controller -> Service -> Repository -> Database

- **Controller:** receives requests from the frontend.
- **Service:** contains the actual business logic.
- **Repository:** talks to the database.
- **Model:** represents database tables.

## Features

- Register and login for Customer, Employee, Manager, Head and Admin.
- Add, view and delete expenses.
- Daily/weekly/monthly/yearly budgets.
- Change a budget limit after password verification.
- Budget alerts at 80%, 85%, 90%, 95% and 100%.
- Manager can manage up to 1000 customers.
- Dashboard data for daily and monthly charts.
- Weather/location alert integration.
- Payment-disruption alerts can be added by an admin endpoint.
- Optional email alerts.
- Docker/Render deployment files.

## Important

The SQL/database teammate creates the PostgreSQL database and tables. This backend uses `spring.jpa.hibernate.ddl-auto=validate`, so it checks that the database schema matches the Java models instead of creating the tables itself.

No frontend code is included.

## Run locally

1. Install Java 21 and Maven.
2. Put your PostgreSQL values in environment variables or `.env`.
3. Make sure the database tables match `DATABASE_CONTRACT.md`.
4. Run:

```bash
mvn spring-boot:run
```

Backend: `http://localhost:8080`

Health check: `GET /api/health`

## Beginner viva sentence

> "The controller receives the request, the service does the work, the repository communicates with the database, and the model represents the table."
