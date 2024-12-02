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

        this.init();
    }

    async init() {
        console.log('Starting initialization...');
        await this.initUser();
        this.initNavigation();
        await this.showPage('rating');
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
                // Запрашиваем входной платеж
                const invoice = {
                    title: "Вход в игру Influencer",
                    description: "Единоразовый взнос для начала игры",
                    currency: "XTR",
                    prices: [{label: "Вход", amount: 50}],
                    payload: "entry_payment"
                };

                try {
                    await this.telegram.showPaymentForm(invoice);
                    // После успешной оплаты создаем пользователя
                    const userData = {
                        id: tgUser.id,
                        username: tgUser.username,
                        first_name: tgUser.first_name,
                        points: 0,
                        stars: 0,
                        referrals: [],
                        created_at: firebase.firestore.FieldValue.serverTimestamp(),
                        last_bonus: null,
                        has_paid_entry: true
                    };
                    await this.db.collection('users').doc(String(tgUser.id)).set(userData);
                    this.currentUser = userData;
                } catch (error) {
                    console.error('Entry payment error:', error);
                    alert('Для начала игры необходимо оплатить вход');
                    return;
                }
            } else {
                this.currentUser = userDoc.data();
                this.points = this.currentUser.points;
                this.stars = this.currentUser.stars;
                this.referrals = this.currentUser.referrals;
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
                <h2>Ваш счет: ${this.points} influencer</h2>
                <p>Звезды: ${this.stars} ⭐️</p>
            </div>
            <div class="rating-list">
                <h3>Топ игроков</h3>
                <div class="rating-item">
                    <span class="position">1</span>
                    <span class="username">Вы</span>
                    <span class="points">${this.points}</span>
                </div>
            </div>
        `;
    }

    showFriendsPage() {
        const content = document.getElementById('content');
        content.innerHTML = `
            <div class="friends-section">
                <h2>Пригласите друзей</h2>
                <p>За каждого приглашенного друга вы получите 10 influencer!</p>
                <div class="referral-link">
                    <p>Ваша реферальная ссылка:</p>
                    <input type="text" readonly value="https://t.me/influenc_bot?start=ref" />
                    <button onclick="navigator.clipboard.writeText(this.previousElementSibling.value)">
                        Копировать
                    </button>
                </div>
            </div>
        `;
    }

    showAboutPage() {
        const content = document.getElementById('content');
        content.innerHTML = `
            <div class="about-section">
                <h2>Об игре Influencer</h2>
                <div class="game-rules">
                    <h3>Как играть:</h3>
                    <ul>
                        <li>Входной взнос: 50 Telegram Stars</li>
                        <li>Ежедневный бонус: 10 influencer</li>
                        <li>За каждого реферала: 10 influencer</li>
                        <li>1 Telegram Star = 1 influencer</li>
                    </ul>
                </div>
                <div class="season-info">
                    <h3>О сезоне</h3>
                    <p>После окончания сезона все участники получат токены influencer пропорционально набранным очкам!</p>
                </div>
                <button class="buy-stars-btn" onclick="game.handlePayment()">
                    Купить Stars
                </button>
            </div>
        `;
    }

    async handlePayment() {
        try {
            const amount = parseInt(prompt('Введите количество Stars для покупки:'));
            if (isNaN(amount) || amount <= 0) return;

            const invoice = {
                title: "Покупка Stars",
                description: `Покупка ${amount} Telegram Stars`,
                currency: "XTR",
                prices: [{label: "Stars", amount: amount}],
                payload: "stars_purchase"
            };

            await this.telegram.showPaymentForm(invoice);
        } catch (error) {
            console.error('Payment error:', error);
            alert('Ошибка при создании платежа');
        }
    }
}

// Инициализация игры
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, creating game instance...');
    window.game = new InfluencerGame();
});
