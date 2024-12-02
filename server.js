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
        await ctx.answerPreCheckoutQuery(true);
    } catch (error) {
        console.error('Pre-checkout error:', error);
    }
});

// Обработка успешных платежей
bot.on('successful_payment', async (ctx) => {
    const userId = ctx.from.id;
    const userRef = db.collection('users').doc(String(userId));

    try {
        await db.runTransaction(async (transaction) => {
            const userDoc = await transaction.get(userRef);
            const userData = userDoc.data() || { points: 0, stars: 0 };

            // Обновляем количество звезд и очков
            const newStars = userData.stars + ctx.message.successful_payment.total_amount;
            const newPoints = userData.points + ctx.message.successful_payment.total_amount;

            transaction.set(userRef, {
                ...userData,
                stars: newStars,
                points: newPoints
            }, { merge: true });
        });

        await ctx.reply('Платеж успешно обработан! Ваши очки обновлены.');
    } catch (error) {
        console.error('Payment processing error:', error);
        await ctx.reply('Произошла ошибка при обработке платежа.');
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

bot.launch();