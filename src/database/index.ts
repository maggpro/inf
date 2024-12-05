import { Pool } from 'pg';
import { User, Transaction } from '../types';

export class Database {
    private pool: Pool;

    constructor() {
        this.pool = new Pool({
            connectionString: process.env.DATABASE_URL
        });
    }

    async createUser(userId: number, username: string): Promise<User> {
        const referralCode = this.generateReferralCode();
        const query = `
            INSERT INTO users (user_id, username, referral_code)
            VALUES ($1, $2, $3)
            RETURNING *
        `;
        const result = await this.pool.query(query, [userId, username, referralCode]);
        return result.rows[0];
    }

    async getUserStats(userId: number): Promise<User> {
        const query = 'SELECT * FROM users WHERE user_id = $1';
        const result = await this.pool.query(query, [userId]);
        return result.rows[0];
    }

    async getLeaderboard(): Promise<User[]> {
        const query = `
            SELECT user_id, username, inf_balance
            FROM users
            ORDER BY inf_balance DESC
            LIMIT 100
        `;
        const result = await this.pool.query(query);
        return result.rows;
    }

    private generateReferralCode(): string {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    async updateUserPaid(userId: number, paid: boolean): Promise<void> {
        const query = 'UPDATE users SET has_paid = $1 WHERE user_id = $2';
        await this.pool.query(query, [paid, userId]);
    }

    async addInfToUser(userId: number, amount: number): Promise<void> {
        const query = 'UPDATE users SET inf_balance = inf_balance + $1 WHERE user_id = $2';
        await this.pool.query(query, [amount, userId]);
    }

    async updateLastClickTime(userId: number, time: Date): Promise<void> {
        const query = 'UPDATE users SET last_click_time = $1 WHERE user_id = $2';
        await this.pool.query(query, [time, userId]);
    }
}