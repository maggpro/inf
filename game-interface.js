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
        const invoice = {
            title: "Вход в игру Influencer",
            description: "Единоразовый взнос для начала игры",
            currency: "XTR",
            prices: [{
                label: "Вход",
                amount: 5000
            }],
            provider_token: "",
            photo_url: null,
            photo_size: 0,
            photo_width: 0,
            photo_height: 0,
            need_name: false,
            need_phone_number: false,
            need_email: false,
            need_shipping_address: false,
            send_phone_number_to_provider: false,
            send_email_to_provider: false,
            is_flexible: false,
            max_tip_amount: 0,
            suggested_tip_amounts: [],
            start_parameter: "entry_payment",
            payload: "entry_payment_50"
        };

        try {
            console.log('Showing payment form:', invoice);
            const result = await window.Telegram.WebApp.showPaymentForm(invoice);
            console.log('Payment result:', result);
        } catch (error) {
            console.error('Stars payment error:', error);
            alert('Ошибка при оплате Stars. Проверьте наличие Stars в кошельке.');
        }
    }
}

// Инициализация игры
document.addEventListener('DOMContentLoaded', () => {
    window.game = new InfluencerGame();
});