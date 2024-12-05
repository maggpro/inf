-- Удаляем таблицы если они существуют
DROP TABLE IF EXISTS referrals;
DROP TABLE IF EXISTS star_purchases;
DROP TABLE IF EXISTS users;

-- Таблица пользователей
CREATE TABLE users (
    user_id BIGINT PRIMARY KEY,
    username VARCHAR(255),
    inf_balance DECIMAL(20,2) DEFAULT 0,
    referral_code VARCHAR(255) UNIQUE,
    referred_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    has_paid BOOLEAN DEFAULT FALSE
);

-- Таблица рефералов
CREATE TABLE referrals (
    id SERIAL PRIMARY KEY,
    referrer_id BIGINT,
    referred_id BIGINT,
    bonus_paid BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (referrer_id) REFERENCES users(user_id),
    FOREIGN KEY (referred_id) REFERENCES users(user_id)
);

-- Таблица покупок Stars
CREATE TABLE star_purchases (
    id SERIAL PRIMARY KEY,
    user_id BIGINT,
    stars_amount INT,
    inf_amount DECIMAL(20,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Создаем индексы
CREATE INDEX idx_users_referral_code ON users(referral_code);
CREATE INDEX idx_users_inf_balance ON users(inf_balance DESC);
CREATE INDEX idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX idx_star_purchases_user ON star_purchases(user_id);

-- Добавляем тестовых пользователей
INSERT INTO users (user_id, username, inf_balance, referral_code, has_paid)
VALUES
    (1273875265, 'ceotonex', 1000, 'CEX123', true),
    (123456789, 'testuser1', 500, 'TEST01', true),
    (987654321, 'testuser2', 750, 'TEST02', true);