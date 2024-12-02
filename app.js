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
        this.db = firebase.firestore();
        this.points = 0;
        this.referrals = [];
        this.stars = 0;

        // Расширяем приложение на весь экран
        this.telegram.expand();

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
        this.initNavigation();

        // Если пользователь не авторизован, показываем экран входа
        if (!this.currentUser) {
            this.showEntryScreen();
        } else {
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
                console.log('New user, requesting entry payment');
                this.showEntryScreen();
            } else {
                this.currentUser = userDoc.data();
                this.points = this.currentUser.points;
                this.stars = this.currentUser.stars;
                this.referrals = this.currentUser.referrals || [];
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

    async showRatingPage() {
        const content = document.getElementById('content');
        content.innerHTML = `
            <div class="user-stats">
                <h2>${this.points.toLocaleString()} influencer</h2>
            </div>
            <div class="rating-list">
                <h3>Топ игроков</h3>
                <div class="rating-item">
                    <span class="position">1</span>
                    <span class="username">Вы</span>
                    <span class="points">${this.points.toLocaleString()}</span>
                </div>
            </div>
        `;
    }

    showEntryScreen() {
        const content = document.getElementById('content');
        content.innerHTML = `
            <div class="entry-screen">
                <div class="entry-card">
                    <h2>👋 Добро пожаловать в Influencer</h2>
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
                        Оплатить вход
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
            prices: [{label: "Вход", amount: 50}],
            payload: JSON.stringify({
                type: 'entry_payment',
                referrerId: this.referrerId
            })
        };

        try {
            await this.telegram.showPaymentForm(invoice);
        } catch (error) {
            console.error('Entry payment error:', error);
            alert('Для начала игры необходимо оплатить вход');
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
                    referred_by: payload.referrerId
                };

                await this.db.collection('users').doc(String(this.telegram.initDataUnsafe.user.id)).set(userData);
                this.currentUser = userData;
                this.stars = userData.stars;
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
