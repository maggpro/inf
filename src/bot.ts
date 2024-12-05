import { Telegraf, Context } from 'telegraf';
import { Message, Update } from 'telegraf/types';
import { Database } from './database';
import { PaymentsHandler } from './payments';

interface WebAppData {
    command: string;
    stars: number;
    type: string;
}

interface WebAppContext extends Context {
    webAppData: {
        data: {
            json<T>(): T;
            text(): string;
        };
        button_text: string;
    };
}

export class Bot {
    private payments: PaymentsHandler;

    constructor(private bot: Telegraf, private db: Database) {
        this.payments = new PaymentsHandler(bot, db);
        this.setupHandlers();
    }

    private setupHandlers() {
        this.bot.command('start', this.handleStart.bind(this));
        this.bot.command('balance', this.handleBalance.bind(this));
        this.bot.command('referral', this.handleReferral.bind(this));

        this.bot.on('pre_checkout_query', (ctx) => ctx.answerPreCheckoutQuery(true));
        this.bot.on('successful_payment', this.handleSuccessfulPayment.bind(this));

        this.bot.on('message', async (ctx: any) => {
            try {
                const message = ctx.message;

                if (message.forward_from?.username === 'donate' && message.forward_date) {
                    const userId = ctx.from.id;
                    const starsAmount = 1;

                    await this.db.updateUserPaid(userId, true);
                    await this.db.addInfToUser(userId, starsAmount);

                    await ctx.reply('Спасибо за Star! Теперь вы можете начать игру. Ваш баланс: 1 INF');
                }

                if (message?.web_app_data?.data) {
                    const data = JSON.parse(message.web_app_data.data);

                    if (data.method === 'sendStarsForm') {
                        const userId = ctx.from.id;
                        const invoice = {
                            chat_id: userId,
                            title: data.params.invoice.title,
                            description: data.params.invoice.description,
                            payload: data.params.invoice.payload,
                            currency: 'XTR',
                            prices: [{
                                label: 'Вход в игру',
                                amount: 100 // 1 Star = 100
                            }],
                            start_parameter: 'start_parameter'
                        };

                        await ctx.replyWithInvoice(invoice);
                    }
                }
            } catch (error) {
                console.error('Error handling stars payment:', error);
                await ctx.reply('Произошла ошибка при обработке Stars. Пожалуйста, попробуйте позже.');
            }
        });

        this.bot.on('successful_payment', async (ctx) => {
            try {
                const userId = ctx.from.id;
                const payment = ctx.message.successful_payment;

                if (payment.currency === 'XTR' && payment.invoice_payload === 'initial_payment') {
                    await this.db.updateUserPaid(userId, true);
                    await ctx.reply('Спасибо за Star! Теперь вы можете начать игру.');

                    await ctx.answerWebAppQuery(payment.telegram_payment_charge_id, {
                        type: 'article',
                        id: payment.telegram_payment_charge_id,
                        title: 'Успешная оплата',
                        input_message_content: {
                            message_text: 'Оплата прошла успешно! Теперь вы можете начать игру.'
                        }
                    });
                }
            } catch (error) {
                console.error('Error handling successful payment:', error);
                await ctx.reply('Произошла ошибка при обработке платежа');
            }
        });
    }

    private async handleStart(ctx: any) {
        try {
            const userId = ctx.from.id;
            const username = ctx.from.username;
            console.log(`Пользователь ${username} (${userId}) запустил бота`);

            let user = await this.db.getUserStats(userId);
            if (!user) {
                console.log(`Создаем нового пользователя ${username}`);
                user = await this.db.createUser(userId, username);
                await ctx.reply('Добро пожаловать в INF Game! Для начала игры необходимо отправить 1 Star.', {
                    reply_markup: {
                        inline_keyboard: [[
                            { text: '🎮 Играть', web_app: { url: 'https://maggpro.github.io/inf/' } }
                        ]]
                    }
                });
                await this.payments.handleInitialPayment(userId);
            } else {
                console.log(`Существующий пользователь ${username} вернулся`);
                await ctx.reply(`С возвращением! Ваш баланс: ${user.inf_balance} INF`, {
                    reply_markup: {
                        inline_keyboard: [[
                            { text: '🎮 Играть', web_app: { url: 'https://maggpro.github.io/inf/' } }
                        ]]
                    }
                });
            }
        } catch (error) {
            console.error('Ошибка в handleStart:', error);
            await ctx.reply('Произошла ошибка. Пожалуйста, попробуйте позже.');
        }
    }

    private async handleBalance(ctx: any) {
        const userId = ctx.from.id;
        const user = await this.db.getUserStats(userId);
        await ctx.reply(`Ваш баланс: ${user.inf_balance} INF`);
    }

    private async handleReferral(ctx: any) {
        const userId = ctx.from.id;
        const user = await this.db.getUserStats(userId);
        await ctx.reply(`Ваша реферальная ссылка: https://t.me/your_bot?start=${user.referral_code}`);
    }

    private async handleSuccessfulPayment(ctx: any) {
        try {
            const userId = ctx.from.id;
            const payment = ctx.message.successful_payment;

            if (payment.invoice_payload.startsWith('initial_payment_')) {
                await this.db.updateUserPaid(userId, true);
                await ctx.reply('Спасибо за оплату! Теперь вы можете начать игру.');
            } else if (payment.invoice_payload.startsWith('stars_purchase_')) {
                const [, , , stars] = payment.invoice_payload.split('_');
                await this.db.addInfToUser(userId, Number(stars));
                await ctx.reply(`Спасибо за покупку! На ваш баланс начислено ${stars} INF.`);
            }
        } catch (error) {
            console.error('Error handling successful payment:', error);
            await ctx.reply('Произошла ошибка при обработке платежа. Пожалуйста, свяжитесь с поддержкой.');
        }
    }

    private async handlePayment(ctx: any) {
        try {
            const userId = ctx.from.id;
            const payment = ctx.message.successful_payment;

            if (payment.currency === 'XTR') { // Проверяем что это оплата Stars
                if (payment.payload === 'initial_payment') {
                    // Активируем аккаунт пользователя
                    await this.db.updateUserPaid(userId, true);
                    await ctx.reply('Спасибо за оплату! Теперь вы можете начать игру.');
                }
            }
        } catch (error) {
            console.error('Error handling payment:', error);
            await ctx.reply('Произошла ошибка при обработке платежа. Пожалуйста, свяжитесь с поддержкой.');
        }
    }
}