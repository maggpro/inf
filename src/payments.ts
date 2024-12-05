import { Telegraf } from 'telegraf';
import { Database } from './database';
import { StarPackage } from './types';

export class PaymentsHandler {
    constructor(private bot: Telegraf, private db: Database) {}

    async handleInitialPayment(userId: number) {
        try {
            // Используем метод для создания платежа Stars
            const message = `
🌟 Для начала игры необходимо отправить 1 Star

Чтобы отправить Star:
1. Нажмите на кнопку Star под этим сообщением
2. Выберите количество: 1 Star
3. Нажмите "Отправить"
            `;

            await this.bot.telegram.sendMessage(userId, message, {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [[
                        { text: '⭐️ Отправить 1 Star', callback_data: 'send_initial_star' }
                    ]]
                }
            });
        } catch (error) {
            console.error('Error creating initial payment:', error);
            throw error;
        }
    }

    async handleStarsPurchase(userId: number, starsPack: StarPackage) {
        try {
            const message = `
🌟 Покупка ${starsPack.inf} INF за ${starsPack.stars} Stars

Чтобы отправить Stars:
1. Нажмите на кнопку Star под этим сообщением
2. Выберите количество: ${starsPack.stars} Stars
3. Нажмите "Отправить"
            `;

            await this.bot.telegram.sendMessage(userId, message, {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [[
                        { text: `⭐️ Отправить ${starsPack.stars} Stars`, callback_data: `send_stars_${starsPack.stars}` }
                    ]]
                }
            });
        } catch (error) {
            console.error('Error creating stars payment:', error);
            throw error;
        }
    }
}