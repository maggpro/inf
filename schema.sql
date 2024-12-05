-- Удаляем таблицы если они существуют
DROP TABLE IF EXISTS clicks;
DROP TABLE IF EXISTS star_transactions;
DROP TABLE IF EXISTS users;

-- Таблица пользователей
CREATE TABLE users (
    user_id BIGINT PRIMARY KEY,
    username VARCHAR(255),
    inf_balance DECIMAL(20,2) DEFAULT 0,
    referral_code VARCHAR(255) UNIQUE,
    referred_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_click_time TIMESTAMP,
    has_paid BOOLEAN DEFAULT FALSE
);

-- Таблица транзакций Stars
CREATE TABLE star_transactions (
    id SERIAL PRIMARY KEY,
    user_id BIGINT,
    stars_amount INT,
    inf_amount DECIMAL(20,2),
    transaction_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Таблица кликов
CREATE TABLE clicks (
    id SERIAL PRIMARY KEY,
    user_id BIGINT,
    inf_earned DECIMAL(20,2),
    clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Создаем индексы для оптимизации
CREATE INDEX idx_users_referral_code ON users(referral_code);
CREATE INDEX idx_users_inf_balance ON users(inf_balance DESC);
CREATE INDEX idx_transactions_user_id ON star_transactions(user_id);
CREATE INDEX idx_clicks_user_id ON clicks(user_id);

-- Добавляем тестовых пользователей
INSERT INTO users (user_id, username, inf_balance, referral_code, has_paid)
VALUES
    (1273875265, 'ceotonex', 1000, 'CEX123', true),
    (123456789, 'testuser1', 500, 'TEST01', true),
    (987654321, 'testuser2', 750, 'TEST02', true);