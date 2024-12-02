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

        // Добавляем обработчики платежей
        this.telegram.onEvent('invoiceClosed', this.handleInvoiceClosed.bind(this));

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
                // Сразу показываем форму оплаты
                const invoice = {
                    title: "Вход в игру Influencer",
                    description: "Единоразовый взнос для начала игры",
                    currency: "XTR",
                    prices: [{label: "Вход", amount: 50}],
                    payload: JSON.stringify('entry_payment')
                };

                try {
                    await this.telegram.showPaymentForm(invoice);
                } catch (error) {
                    console.error('Entry payment error:', error);
                    alert('Для начала игры необходимо оплатить вход');
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
        const referralCode = this.currentUser?.id ? `ref_${this.currentUser.id}` : '';

        content.innerHTML = `
            <div class="friends-section">
                <h2>Пригласите друзей</h2>
                <p>За каждого приглашенного друга вы получите 10 influencer!</p>
                <div class="referral-link">
                    <p>Ваша реферальная ссылка:</p>
                    <input type="text" readonly value="https://t.me/influenc_bot?start=${referralCode}" />
                    <button onclick="navigator.clipboard.writeText(this.previousElementSibling.value)">
                        Копировать
                    </button>
                </div>
                <div class="referrals-list">
                    <h3>Ваши рефералы:</h3>
                    ${this.referrals.length ?
                        this.referrals.map(ref => `
                            <div class="referral-item">
                                <span class="username">${ref.username || 'Аноним'}</span>
                                <span class="points">${ref.points || 0} points</span>
                            </div>
                        `).join('') :
                        '<p>У вас пока нет рефералов</p>'
                    }
                </div>
            </div>
        `;
    }

    showAboutPage() {
        const content = document.getElementById('content');
        content.innerHTML = `
            <div class="about-section">
                <h2>Об игре Influencer</h2>

                <div class="game-intro">
                    <p>Добро пожаловать в игру Influencer - место, где ваше влияние превращается в реальную ценность!</p>
                </div>

                <div class="game-rules">
                    <h3>Как играть:</h3>
                    <ul>
                        <li>🌟 Входной взнос: 50 Telegram Stars</li>
                        <li>⏰ Ежедневный бонус: 10 influencer</li>
                        <li>👥 За каждого реферала: 10 influencer</li>
                        <li>💫 1 Telegram Star = 1 influencer</li>
                        <li>📈 Чем больше друзей пригласите, тем выше ваш рейтинг</li>
                    </ul>
                </div>

                <div class="earning-ways">
                    <h3>Способы заработка influencer:</h3>
                    <ul>
                        <li>✨ Покупайте Telegram Stars</li>
                        <li>🤝 Приглашайте друзей</li>
                        <li>📅 Получайте ежедневные бонусы</li>
                        <li>🏆 Участвуйте в рейтинге</li>
                    </ul>
                </div>

                <div class="season-info">
                    <h3>О текущем сезоне</h3>
                    <p>🎮 Сезон 1 продлится до 31 января 2024</p>
                    <p>💎 После окончания сезона все участники получат токены influencer пропорционально набранным очкам!</p>
                    <p>🔥 Топ-10 игроков получат специальные награды</p>
                </div>

                <div class="token-info">
                    <h3>О токене Influencer</h3>
                    <p>🪙 Токен Influencer - это ваша награда за активность в игре</p>
                    <p>📊 Распределение токенов после сезона:</p>
                    <ul>
                        <li>70% - пропорционально набранным очкам</li>
                        <li>20% - топ-10 игроков</li>
                        <li>10% - случайные награды активным игрокам</li>
                    </ul>
                </div>

                <div class="buy-stars-section">
                    <h3>Купить Stars</h3>
                    <p>💫 Моментально получайте influencer очки за каждую звезду!</p>
                    <button class="buy-stars-btn" onclick="game.handlePayment()">
                        Купить Stars
                    </button>
                </div>
            </div>
        `;
    }

    async handleInvoiceClosed(event) {
        console.log('Invoice closed:', event);
        if (event.status === 'paid') {
            const payload = JSON.parse(event.payload);
            if (payload === 'entry_payment') {
                // Обработка входного платежа
                const userData = {
                    id: this.telegram.initDataUnsafe.user.id,
                    username: this.telegram.initDataUnsafe.user.username,
                    first_name: this.telegram.initDataUnsafe.user.first_name,
                    points: 0,
                    stars: 50, // Начальные звезды после оплаты входа
                    referrals: [],
                    created_at: firebase.firestore.FieldValue.serverTimestamp(),
                    last_bonus: null,
                    has_paid_entry: true
                };
                await this.db.collection('users').doc(String(this.telegram.initDataUnsafe.user.id)).set(userData);
                this.currentUser = userData;
                this.stars = userData.stars;
                this.telegram.MainButton.hide();
                this.showPage('rating');
            } else if (payload === 'stars_purchase') {
                // Обработка покупки дополнительных звезд
                const amount = event.total_amount;
                this.stars += amount;
                this.points += amount;
                await this.db.collection('users').doc(String(this.currentUser.id)).update({
                    stars: this.stars,
                    points: this.points
                });
                this.updateUI();
            }
        }
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
                payload: JSON.stringify('stars_purchase')
            };

            await this.telegram.showPaymentForm(invoice);
        } catch (error) {
            console.error('Payment error:', error);
            alert('Ошибка при создании платежа');
        }
    }

    updateUI() {
        const userStats = document.querySelector('.user-stats');
        if (userStats) {
            userStats.innerHTML = `
                <h2>Ваш счет: ${this.points} influencer</h2>
                <p>Звезды: ${this.stars} ⭐️</p>
            `;
        }
    }
}

// Инициализация игры
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, creating game instance...');
    window.game = new InfluencerGame();
});
