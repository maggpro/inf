import { Telegraf } from 'telegraf';
import { Database } from './database';

if (!process.env.BOT_TOKEN) {
    throw new Error('BOT_TOKEN must be provided!');
}

const bot = new Telegraf(process.env.BOT_TOKEN);
const db = new Database();

// Пакеты Stars
const STAR_PACKAGES = [
    { stars: 50, inf: 50, discount: 0 },
    { stars: 100, inf: 105, discount: 5 },
    { stars: 150, inf: 165, discount: 10 },
    { stars: 500, inf: 575, discount: 15 },
    { stars: 1000, inf: 1200, discount: 20 },
    { stars: 5000, inf: 6250, discount: 25 },
    { stars: 30000, inf: 37500, discount: 25 },
    { stars: 100000, inf: 125000, discount: 25 }
];

export { bot, db, STAR_PACKAGES };