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

        content.innerHTML = `
            <div class="entry-screen">
                <div class="entry-card">
                    <h2> Добро пожаловать в Influencer</h2>
                    <div class="entry-info">
                        <p>Для начала игры необходимо внести:</p>
                        <div class="entry-amount">50 ⭐️</div>
                        <ul class="entry-benefits">
                            <li>🎮 Доступ к игре</li>
                            <li>💎 Возможность заработка</li>
                            <li>🏆 Участие в рейтинге</li>
                            <li>💰 Токены в конце сезона</li>
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
        // Проверяем доступность WebApp
        if (!window.Telegram || !window.Telegram.WebApp) {
            console.error('Telegram WebApp not available');
            alert('Пожалуйста, откройте в Telegram');
            return;
        }

        // Логируем информацию о WebApp
        console.log('WebApp Info:', {
            version: window.Telegram.WebApp.version,
            platform: window.Telegram.WebApp.platform,
            methods: Object.keys(window.Telegram.WebApp)
        });

        const invoice = {
            title: "Вход в игру",
            description: "50 Stars",
            currency: "XTR",
            prices: [{
                label: "Вход",
                amount: 5000
            }],
            payload: "entry_payment"
        };

        try {
            if (typeof window.Telegram.WebApp.openInvoice !== 'function') {
                throw new Error('Метод openInvoice недоступен');
            }

            console.log('Opening invoice:', invoice);
            await window.Telegram.WebApp.openInvoice(invoice);
        } catch (error) {
            console.error('Payment error:', error);
            alert('Ошибка оплаты: ' + error.message);
        }
    }
}

// Инициализация игры
document.addEventListener('DOMContentLoaded', () => {
    window.game = new InfluencerGame();
});