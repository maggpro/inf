// Конфигурация Firebase
const firebaseConfig = {
    apiKey: "AIzaSyD37QLRUg3rsT5upQddh7JquYsAjDb35Pk",
    authDomain: "testwf-cd5ad.firebaseapp.com",
    projectId: "testwf-cd5ad",
    storageBucket: "testwf-cd5ad.appspot.com",
    messagingSenderId: "68921357629",
    appId: "1:68921357629:web:xxxxxxxxxxxxxx"
};

// Инициализируем Firebase
firebase.initializeApp(firebaseConfig);

// Весь остальной код интерфейса из старого app.js
// ... (тут будет весь код класса InfluencerGame, кроме методов оплаты)

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
        console.log('Starting initialization...');
        // Для тестирования всегда показываем экран входа
        this.showEntryScreen();
    }

    showEntryScreen() {
        console.log('Rendering entry screen');
        const content = document.getElementById('content');

        // Скрываем навигацию
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
        console.log('Entry screen rendered');
    }

    async requestEntryPayment() {
        console.log('Requesting entry payment...');

        const invoice = {
            title: 'Вход в игру Influencer',
            description: ' Единоразовый взнос 50 Stars для начала игры',
            currency: 'XTR',
            prices: [{
                label: '50 Stars',
                amount: 5000
            }],
            payload: JSON.stringify({
                type: 'entry_payment',
                referrerId: this.referrerId
            })
        };

        try {
            if (!this.telegram.showPaymentForm) {
                console.error('Payment method not available');
                alert('Платежи не поддерживаются в вашей версии Telegram');
                return;
            }

            console.log('Showing payment form with invoice:', invoice);
            const result = await this.telegram.showPaymentForm(invoice);
            console.log('Payment form result:', result);
        } catch (error) {
            console.error('Payment error:', error);
            alert('Произошла ошибка при открытии формы оплаты. Убедитесь, что у вас есть Telegram Stars.');
        }
    }
}

// Инициализация игры
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, creating game instance...');
    window.game = new InfluencerGame();
});