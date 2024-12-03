const express = require('express');
const { Telegraf } = require('telegraf');
const cors = require('cors');
const path = require('path');

// Инициализация бота с токеном
const bot = new Telegraf('8178546319:AAFRL2n_wTMDr116tXZChFhw9XuKqdUJKQ0');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Статическая раздача файлов
app.use(express.static(path.join(__dirname)));

// Маршрут для главной страницы
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Обработка pre_checkout_query
bot.on('pre_checkout_query', async (ctx) => {
    try {
        console.log('Pre-checkout query received:', ctx.preCheckoutQuery);
        // Всегда подтверждаем возможность оплаты
        await ctx.answerPreCheckoutQuery(true);
    } catch (error) {
        console.error('Pre-checkout error:', error);
        await ctx.answerPreCheckoutQuery(false, 'Ошибка при проверке платежа');
    }
});

// Обработка successful_payment
bot.on('successful_payment', async (ctx) => {
    try {
        console.log('Payment received:', ctx.message.successful_payment);
        const payment = ctx.message.successful_payment;

        // Отправляем подтверждение пользователю
        await ctx.reply('✅ Оплата успешно получена! Спасибо за покупку.');

    } catch (error) {
        console.error('Payment processing error:', error);
        await ctx.reply('❌ Произошла ошибка при обработке платежа.');
    }
});

// Эндпоинт для проверки работы сервера
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Запуск бота
bot.launch().then(() => {
    console.log('Bot is running');
}).catch((error) => {
    console.error('Bot launch error:', error);
});

// Graceful shutdown
process.once('SIGINT', () => {
    bot.stop('SIGINT');
});
process.once('SIGTERM', () => {
    bot.stop('SIGTERM');
});