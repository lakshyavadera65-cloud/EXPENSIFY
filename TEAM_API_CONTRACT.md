# EXPENSIFY Backend API Contract

Base URL: `/api`

## Auth
- POST `/auth/register`
- POST `/auth/login`

## Expenses
- POST `/expenses/user/{userId}`
- GET `/expenses/user/{userId}`
- GET `/expenses/{id}`
- DELETE `/expenses/{id}`

## Budgets
- POST `/budgets/user/{userId}`
- GET `/budgets/user/{userId}`
- PUT `/budgets/{budgetId}/limit`

## Dashboard
- GET `/dashboard/{userId}/daily`
- GET `/dashboard/{userId}/monthly`

## Manager
- POST `/managers/{managerId}/customers/{customerId}`
- GET `/managers/{managerId}/customers`

## Notifications
- GET `/notifications/user/{userId}`

## Location alerts
- GET `/location-alerts/user/{userId}`
- POST `/location-alerts/coordinates`
- POST `/location-alerts/payment-disruption`
- POST `/location-alerts/user/{userId}/email`

## Health
- GET `/health`
