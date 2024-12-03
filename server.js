const express = require('express');
const { Telegraf } = require('telegraf');
const admin = require('firebase-admin');
const serviceAccount = require('./path/to/serviceAccountKey.json');

const bot = new Telegraf('8178546319:AAFRL2n_wTMDr116tXZChFhw9XuKqdUJKQ0');
const app = express();

// Инициализация Firebase Admin
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://testwf-cd5ad.firebaseio.com"
});

const db = admin.firestore();

// Обработка платежей
bot.on('pre_checkout_query', async (ctx) => {
    try {
        console.log('Pre-checkout query:', ctx.preCheckoutQuery);
        await ctx.answerPreCheckoutQuery(true);
    } catch (error) {
        console.error('Pre-checkout error:', error);
        await ctx.answerPreCheckoutQuery(false, 'Ошибка при обработке платежа');
    }
});

// Обработка успешных платежей
bot.on('successful_payment', async (ctx) => {
    try {
        console.log('Successful payment:', ctx.message.successful_payment);
        const payment = ctx.message.successful_payment;
        const payload = JSON.parse(payment.invoice_payload);

        if (payload.type === 'entry_payment') {
            // Обработка входного платежа
            await handleEntryPayment(ctx);
        } else if (payload.type === 'stars_purchase') {
            // Обработка покупки Stars
            await handleStarsPurchase(ctx, payload);
        }
    } catch (error) {
        console.error('Payment processing error:', error);
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

bot.launch();