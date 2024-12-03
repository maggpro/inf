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
                            <li>v. 0.0.7</li>
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

        // Проверяем доступность WebApp
        if (!this.telegram) {
            console.error('Telegram WebApp not available');
            alert('Пожалуйста, откройте в Telegram');
            return;
        }

        // Логируем версию
        console.log('WebApp version:', this.telegram.version);

        try {
            // Формируем URL для оплаты Stars
            const botUsername = 'influenc_bot';
            const amount = 50;
            const paymentUrl = `tg://resolve?domain=${botUsername}&start=buy_stars_${amount}`;

            // Открываем URL через Telegram
            this.telegram.openTelegramLink(paymentUrl);

            // Добавляем обработчик возврата
            this.telegram.onEvent('viewportChanged', () => {
                console.log('Returned from payment');
                // Здесь можно обновить статус после оплаты
            });
        } catch (error) {
            console.error('Payment error:', error);
            alert('Ошибка при оплате: ' + error.message + '\nВерсия: ' + this.telegram.version);
        }
    }
}

// Инициализация игры
document.addEventListener('DOMContentLoaded', () => {
    window.game = new InfluencerGame();
});