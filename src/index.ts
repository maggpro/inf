import { Telegraf } from 'telegraf';
import { Bot } from './bot';
import { Database } from './database';
import { WebServer } from './server';
import dotenv from 'dotenv';

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN!);
const db = new Database();
const gameBot = new Bot(bot, db);
const webServer = new WebServer(db);

async function startApp() {
    try {
        // Запуск бота
        await bot.launch();
        console.log('🤖 Бот успешно запущен');

        // Запуск веб-сервера
        const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
        webServer.start(PORT);
        console.log(`🌐 Веб-сервер запущен на порту ${PORT}`);
    } catch (error) {
        console.error('Ошибка при запуске:', error);
    }
}

startApp();