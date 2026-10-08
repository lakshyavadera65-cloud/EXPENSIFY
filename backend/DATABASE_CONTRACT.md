# Database Contract for SQL Teammate

The backend does **not** create SQL tables. The SQL teammate should create tables that match these Java models.

## app_users
id, name, email, password_hash, role, city, country, latitude, longitude, email_alerts_enabled, manager_id, created_at

## expenses
id, user_id, amount, category, description, expense_date

## budgets
id, user_id, budget_type, budget_amount, limit_amount, start_date

## notifications
id, user_id, title, message, threshold, read_status, created_at

Foreign keys:
- expenses.user_id -> app_users.id
- budgets.user_id -> app_users.id
- notifications.user_id -> app_users.id
- app_users.manager_id -> app_users.id

Do not change these names without checking the Java entity classes first.
