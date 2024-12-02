// Обновляем конфигурацию Firebase
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
        this.telegram = window.Telegram.WebApp;
        this.currentUser = null;
        this.db = firebase.firestore();
        this.points = 0;
        this.referrals = [];
        this.stars = 0;

        this.init();
    }

    async init() {
        await this.initUser();
        this.initNavigation();
        this.checkDailyBonus();
        this.showPage('rating');
    }

    async initUser() {
        const tgUser = this.telegram.initDataUnsafe.user;
        if (!tgUser) return;

        try {
            const userDoc = await this.db.collection('users').doc(String(tgUser.id)).get();

            if (!userDoc.exists) {
                // Создаем нового пользователя
                const userData = {
                    id: tgUser.id,
                    username: tgUser.username,
                    first_name: tgUser.first_name,
                    points: 0,
                    stars: 0,
                    referrals: [],
                    created_at: firebase.firestore.FieldValue.serverTimestamp(),
                    last_bonus: null
                };

                await this.db.collection('users').doc(String(tgUser.id)).set(userData);
                this.currentUser = userData;
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

    async saveUserData() {
        if (!this.currentUser) return;

        await this.db.collection('users').doc(String(this.currentUser.id)).set({
            id: this.currentUser.id,
            username: this.currentUser.username,
            points: this.points,
            stars: this.stars,
            referrals: this.referrals,
            lastBonus: this.currentUser.lastBonus
        });
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
        const users = await this.db.collection('users')
            .orderBy('points', 'desc')
            .limit(100)
            .get();

        let html = `
            <div class="user-stats">
                <h2>Ваш счет: ${this.points} influencer</h2>
                <p>Звезды: ${this.stars} ⭐️</p>
            </div>
            <div class="rating-list">
                <h3>Топ игроков</h3>
        `;

        users.forEach((doc, index) => {
            const user = doc.data();
            html += `
                <div class="rating-item ${user.id === this.currentUser?.id ? 'current-user' : ''}">
                    <span class="position">${index + 1}</span>
                    <span class="username">${user.username || 'Аноним'}</span>
                    <span class="points">${user.points}</span>
                </div>
            `;
        });

        content.innerHTML = html + '</div>';
    }

    async showFriendsPage() {
        const content = document.getElementById('content');
        let html = `
            <div class="friends-section">
                <h2>Пригласите друзей</h2>
                <p>За каждого приглашенного друга вы получите 10 influencer!</p>
                <div class="referral-link">
                    <p>Ваша реферальная ссылка:</p>
                    <input type="text" readonly value="https://t.me/influenc_bot?start=${this.currentUser.id}" />
                    <button onclick="navigator.clipboard.writeText(this.previousElementSibling.value)">
                        Копировать
                    </button>
                </div>
                <div class="referrals-list">
                    <h3>Ваши рефералы:</h3>
                    ${await this.getReferralsList()}
                </div>
            </div>
        `;
        content.innerHTML = html;
    }

    async getReferralsList() {
        if (!this.referrals.length) {
            return '<p>У вас пока нет рефералов</p>';
        }

        let html = '';
        for (const referralId of this.referrals) {
            const referralDoc = await this.db.collection('users').doc(String(referralId)).get();
            const referralData = referralDoc.data();
            html += `
                <div class="referral-item">
                    <span class="username">${referralData.username || 'Аноним'}</span>
                    <span class="points">${referralData.points} points</span>
                </div>
            `;
        }
        return html;
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
                <button class="buy-stars-btn" onclick="game.showPaymentForm()">
                    Купить Stars
                </button>
            </div>
        `;
    }

    async showPaymentForm() {
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

// Добавляем стили для рейтинга

// Инициализация игры
const game = new InfluencerGame();