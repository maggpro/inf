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

// Добавим новые интерфейсы для платежей
interface PaymentForm {
    form_id: string;
    bot_id: number;
    title: string;
    description: string;
    invoice: {
        currency: string;
        amount: number;
        native_currency: string;
        native_amount: number;
    };
    provider_id: number;
    url: string;
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

                // Проверяем, что это пересланное сообщение от @donate
                if (message.forward_from?.username === 'donate' && message.forward_date) {
                    const userId = ctx.from.id;

                    // Активируем аккаунт и начисляем INF
                    await this.db.updateUserPaid(userId, true);
                    await this.db.addInfToUser(userId, 1);

                    // Отправляем подтверждение
                    await ctx.reply('Спасибо за Star! Теперь вы можете начать игру. Вам начислен 1 INF.');

                    // Отправляем кнопку для входа в игру
                    await ctx.reply('Нажмите кнопку ниже, чтобы начать играть:', {
                        reply_markup: {
                            inline_keyboard: [[
                                {
                                    text: '🎮 Играть',
                                    web_app: {
                                        url: `https://maggpro.github.io/inf/?v=${Date.now()}`
                                    }
                                }
                            ]]
                        }
                    });
                }

                // Обработка других сообщений от веб-приложения
                if (message?.web_app_data?.data) {
                    const data = JSON.parse(message.web_app_data.data);

                    if (data.method === 'starPaymentStarted') {
                        // Создаем платежную форму для Stars
                        const paymentForm: PaymentForm = {
                            form_id: Date.now().toString(),
                            bot_id: ctx.botInfo.id,
                            title: "Вход в INF Game",
                            description: "Оплата 1 Star для начала игры",
                            invoice: {
                                currency: "XTR",
                                amount: 100, // 1 Star = 100
                                native_currency: "STAR",
                                native_amount: 1
                            },
                            provider_id: Number(process.env.PROVIDER_ID), // ID провайдера Stars
                            url: "https://t.me/donate" // URL для оплаты Stars
                        };

                        // Отправляем форму оплаты
                        await ctx.reply('Для начала игры отправьте Star:', {
                            reply_markup: {
                                inline_keyboard: [[{
                                    text: '💫 Отправить 1 Star',
                                    callback_data: 'pay_stars'
                                }]]
                            }
                        });

                        // Сохраняем форму в контексте для последующей обработки
                        ctx.session.paymentForm = paymentForm;
                    }
                }
            } catch (error) {
                console.error('Error handling message:', error);
                await ctx.reply('Произошла ошибка. Пожалуйста, попробуйте позже.');
            }
        });

        this.bot.on('successful_payment', async (ctx) => {
            try {
                const userId = ctx.from.id;
                const payment = ctx.message.successful_payment;

                if (payment.currency === 'XTR' && payment.invoice_payload === 'initial_payment') {
                    await this.db.updateUserPaid(userId, true);
                    await this.db.addInfToUser(userId, 1);

                    await ctx.reply('Спасибо за Star! Теперь вы можете начать игру. Вам начислен 1 INF.');

                    await ctx.reply('Нажмите кнопку ниже, чтобы начать играть:', {
                        reply_markup: {
                            inline_keyboard: [[
                                {
                                    text: '🎮 Играть',
                                    web_app: {
                                        url: `https://maggpro.github.io/inf/?v=${Date.now()}`
                                    }
                                }
                            ]]
                        }
                    });
                }
            } catch (error) {
                console.error('Error handling successful payment:', error);
                await ctx.reply('Произошла ошибка при обработке платежа');
            }
        });

        // Обработчик нажатия на кнопку оплаты
        this.bot.action('pay_stars', async (ctx) => {
            try {
                // Используем answerCbQuery вместо answerCallbackQuery
                await ctx.answerCbQuery();

                // Отправляем прямую ссылку для отправки Stars
                await ctx.reply('Для оплаты отправьте Star:', {
                    reply_markup: {
                        inline_keyboard: [[{
                            text: '💫 Отправить 1 Star',
                            url: `tg://stars/send?amount=1&message=${encodeURIComponent('Оплата за вход в INF Game')}`
                        }]]
                    }
                });

                // Добавляем инструкцию
                await ctx.reply('После отправки Star, перешлите сообщение от @donate в этот чат');

            } catch (error) {
                console.error('Error processing payment:', error);
                await ctx.reply('Произошла ошибка. Пожалуйста, попробуйте позже.');
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
                await ctx.reply('Спасибо за оплату! Теперь вы можете наать игру.');
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