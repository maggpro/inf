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

        // Создаем MainButton
        const MainButton = window.Telegram.WebApp.MainButton;
        MainButton.setText('Оплатить 50 Stars');
        MainButton.show();

        const invoice = {
            title: "Вход в игру",
            description: "50 Stars",
            currency: "XTR",
            prices: [{
                label: "Вход",
                amount: 5000
            }]
        };

        try {
            console.log('Setting up payment...');

            // Добавляем обработчик нажатия на кнопку
            MainButton.onClick(async () => {
                try {
                    console.log('Button clicked, showing payment form');
                    const result = await window.Telegram.WebApp.showPopup({
                        title: 'Оплата Stars',
                        message: 'Подтвердите оплату 50 Stars',
                        buttons: [{
                            type: 'pay',
                            text: 'Оплатить',
                            params: invoice
                        }]
                    });
                    console.log('Popup result:', result);
                } catch (e) {
                    console.error('Payment popup error:', e);
                    alert('Ошибка при открытии формы оплаты: ' + e.message);
                }
            });

            console.log('Payment setup complete');
        } catch (error) {
            console.error('Payment setup error:', error);
            MainButton.hide();
            alert('Ошибка при настройке оплаты: ' + error.message);
        }
    }
}

// Инициализация игры
document.addEventListener('DOMContentLoaded', () => {
    window.game = new InfluencerGame();
});