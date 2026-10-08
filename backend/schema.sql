-- =====================================================================
-- EXPENSIFY Database Schema & Seed Data
-- =====================================================================

CREATE TABLE IF NOT EXISTS app_users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    city VARCHAR(100),
    country VARCHAR(100),
    latitude DOUBLE,
    longitude DOUBLE,
    email_alerts_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    manager_id BIGINT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_manager FOREIGN KEY (manager_id) REFERENCES app_users (id) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS expenses (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    category VARCHAR(100),
    description VARCHAR(255),
    expense_date DATE NOT NULL,
    CONSTRAINT fk_expense_user FOREIGN KEY (user_id) REFERENCES app_users (id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS budgets (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    budget_type VARCHAR(20) NOT NULL,
    budget_amount DECIMAL(12,2) NOT NULL,
    limit_amount DECIMAL(12,2) NOT NULL,
    start_date DATE NOT NULL,
    CONSTRAINT fk_budget_user FOREIGN KEY (user_id) REFERENCES app_users (id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message VARCHAR(500),
    threshold VARCHAR(50),
    read_status BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES app_users (id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_users_manager_id ON app_users(manager_id);
