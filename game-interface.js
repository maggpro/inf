class InfluencerGame {
    constructor() {
        console.log('Game initializing...');
        this.telegram = window.Telegram.WebApp;

        // Применяем тему Telegram
        const theme = this.telegram.themeParams;
        document.documentElement.style.setProperty('--background-color', theme.bg_color || '#1A1B1F');
        document.documentElement.style.setProperty('--text-color', theme.text_color || '#FFFFFF');
        document.documentElement.style.setProperty('--card-bg', theme.secondary_bg_color || '#242529');

        this.telegram.expand();
        this.init();
    }

    async init() {
        this.showEntryScreen();
    }

    showEntryScreen() {
        const content = document.getElementById('content');
        document.querySelector('.navigation').style.display = 'none';

        // Получаем данные пользователя из WebApp
        const user = this.telegram.initDataUnsafe?.user || {};
        const username = user.username ? `@${user.username}` : 'Гость';
        const userId = user.id || 'Не определен';

        content.innerHTML = `
            <div class="entry-screen">
                <div class="entry-card">
                    <div class="user-info">
                        <p class="username">👤 ${username}</p>
                        <p class="user-id">🆔 ${userId}</p>
                    </div>
                    <h2>Добро пожаловать в Influencer</h2>
                    <div class="entry-info">
                        <p>Для начала игры необходимо внести:</p>
                        <div class="entry-amount">50 ⭐️</div>
                        <ul class="entry-benefits">
                            <li>🎮 Доступ к игре</li>
                            <li>💎 Возможность заработка</li>
                            <li>🏆 Участие в рейтинге</li>
                            <li>💰 Токены в конце сезона</li>
                            <li>v. 0.0.3</li>
                        </ul>
                    </div>
                    <button class="entry-button" onclick="game.requestEntryPayment()">
                        Оплатить 50 Stars
                    </button>
                </div>
            </div>
        `;
    }

    async requestEntryPayment() {
        console.log('Payment request started');

        // Проверяем доступные методы
        console.log('Available methods:', Object.keys(window.Telegram.WebApp));

        const invoice = {
            title: "Вход в игру",
            description: "50 Stars",
            currency: "XTR",
            prices: [{
                label: "Вход",
                amount: 5000
            }],
            provider_token: "",
            payload: "entry_payment_50"
        };

        try {
            // Пробуем разные методы
            if (window.Telegram.WebApp.showPaymentForm) {
                console.log('Using showPaymentForm');
                await window.Telegram.WebApp.showPaymentForm(invoice);
            } else if (window.Telegram.WebApp.openInvoice) {
                console.log('Using openInvoice');
                await window.Telegram.WebApp.openInvoice(invoice);
            } else if (window.Telegram.WebApp.PaymentForm) {
                console.log('Using PaymentForm');
                await window.Telegram.WebApp.PaymentForm.open(invoice);
            } else {
                throw new Error('No payment methods available');
            }
        } catch (error) {
            console.error('Payment error:', error);
            alert('Ошибка при оплате: ' + error.message);
        }
    }
}

// Инициализация игры
document.addEventListener('DOMContentLoaded', () => {
    window.game = new InfluencerGame();
});