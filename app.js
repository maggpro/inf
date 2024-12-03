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

class InfluencerGame {
    constructor() {
        console.log('Game initializing...');
        this.telegram = window.Telegram.WebApp;

        // Применяем тему Telegram
        const theme = this.telegram.themeParams;
        console.log('Telegram theme:', theme);
        document.documentElement.style.setProperty('--background-color', theme.bg_color || '#1A1B1F');
        document.documentElement.style.setProperty('--text-color', theme.text_color || '#FFFFFF');
        document.documentElement.style.setProperty('--card-bg', theme.secondary_bg_color || '#242529');

        // Расширяем приложение на весь экран
        this.telegram.expand();
        this.telegram.requestFullscreen();

        this.db = firebase.firestore();
        this.points = 0;
        this.referrals = [];
        this.stars = 0;

        // Добавляем обработчики платежей
        this.telegram.onEvent('invoiceClosed', this.handleInvoiceClosed.bind(this));

        // Проверяем реферальный параметр при запуске
        const startParam = new URLSearchParams(window.location.search).get('start_param');
        if (startParam && startParam.startsWith('ref_')) {
            this.referrerId = startParam.replace('ref_', '');
        }

        this.init();
    }

    async init() {
        console.log('Starting initialization...');
        await this.initUser();

        if (!this.currentUser) {
            console.log('No user found, showing entry screen');
            this.showEntryScreen();
        } else {
            console.log('User found, initializing navigation');
            document.querySelector('.navigation').style.display = 'flex';
            this.initNavigation();
            await this.showPage('rating');
        }
        console.log('Initialization complete');
    }

    async initUser() {
        const tgUser = this.telegram.initDataUnsafe.user;
        if (!tgUser) {
            console.log('No Telegram user data');
            return;
        }

        try {
            const userDoc = await this.db.collection('users').doc(String(tgUser.id)).get();

            if (!userDoc.exists) {
                console.log('New user, showing entry screen');
                // Скрываем меню для новых пользователей
                document.querySelector('.navigation').style.display = 'none';
                // Показываем экран входа
                this.showEntryScreen();
            } else {
                console.log('Existing user, loading data');
                this.currentUser = userDoc.data();
                this.points = this.currentUser.points;
                this.stars = this.currentUser.stars;
                this.referrals = this.currentUser.referrals || [];
                // Показываем меню для существующих пользователей
                document.querySelector('.navigation').style.display = 'flex';
            }
        } catch (error) {
            console.error('Error initializing user:', error);
        }
    }

    initNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.showPage(btn.dataset.page);
                navButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }

    async showPage(pageName) {
        console.log('Showing page:', pageName);
        const content = document.getElementById('content');
        content.innerHTML = '';

        switch(pageName) {
            case 'rating':
                await this.showRatingPage();
                break;
            case 'friends':
                await this.showFriendsPage();
                break;
            case 'about':
                this.showAboutPage();
                break;
        }
    }

    showEntryScreen() {
        console.log('Rendering entry screen');
        const content = document.getElementById('content');
        if (!content) {
            console.error('Content element not found!');
            return;
        }

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
        const amount = 50;
        const invoice = {
            title: `Покупка ${amount} Stars`,
            description: `💫 ${amount} Stars`,
            payload: `stars_${amount}`,
            currency: 'XTR',
            prices: [{
                label: `${amount} Stars`,
                amount: amount * 100
            }],
            provider_token: null,
            need_name: false,
            send_email_to_provider: false,
            send_phone_number_to_provider: false,
            is_flexible: false
        };

        try {
            console.log('Showing payment form:', invoice);
            const result = await this.telegram.showPaymentForm(invoice);
            console.log('Payment form result:', result);
        } catch (error) {
            console.error('Payment error:', error);
        }
    }

    async handleInvoiceClosed(event) {
        console.log('Invoice closed:', event);
        if (event.status === 'paid') {
            const payload = JSON.parse(event.payload);
            if (payload.type === 'entry_payment') {
                const userData = {
                    id: this.telegram.initDataUnsafe.user.id,
                    username: this.telegram.initDataUnsafe.user.username,
                    first_name: this.telegram.initDataUnsafe.user.first_name,
                    points: 0,
                    stars: 50,
                    referrals: [],
                    created_at: firebase.firestore.FieldValue.serverTimestamp(),
                    last_bonus: null,
                    has_paid_entry: true,
                    referred_by: this.referrerId
                };

                await this.db.collection('users').doc(String(this.telegram.initDataUnsafe.user.id)).set(userData);
                this.currentUser = userData;
                this.stars = userData.stars;

                // Показываем навигацию после успешной оплаты
                document.querySelector('.navigation').style.display = 'flex';
                await this.showPage('rating');
            }
        }
    }
}

// Инициализация игры
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, creating game instance...');
    window.game = new InfluencerGame();
});