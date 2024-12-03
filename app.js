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
                document.querySelector('.navigation').style.display = 'none';
                this.showEntryScreen();
            } else {
                console.log('Existing user, loading data');
                this.currentUser = userDoc.data();
                this.points = this.currentUser.points;
                this.stars = this.currentUser.stars;
                this.referrals = this.currentUser.referrals || [];
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
            case 'shop':
                this.showShopPage();
                break;
        }
    }

    async showRatingPage() {
        const content = document.getElementById('content');
        content.innerHTML = `
            <div class="user-stats">
                <h2>${this.points.toLocaleString()} influencer</h2>
                <div class="stars-count">💫 ${this.stars} Stars</div>
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

    showFriendsPage() {
        const content = document.getElementById('content');
        const botUsername = 'influenc_bot';
        const referralLink = this.currentUser && this.currentUser.id ?
            `https://t.me/${botUsername}?start=ref_${this.currentUser.id}` :
            'Сначала войдите в игру';

        content.innerHTML = `
            <div class="friends-section">
                <h2>👥 Пригласите друзей</h2>
                <div class="rewards-info">
                    <p>🎁 За каждого приглашенного друга:</p>
                    <ul>
                        <li>+10 influencer сразу</li>
                        <li>5% от всех его покупок</li>
                    </ul>
                </div>
                <div class="referral-link">
                    <p>🔗 Ваша реферальная ссылка:</p>
                    ${this.currentUser && this.currentUser.id ? `
                        <div class="link-container">
                            <input type="text" readonly value="${referralLink}" />
                            <button onclick="navigator.clipboard.writeText(this.previousElementSibling.value)">
                                <span>📋</span>
                            </button>
                        </div>
                        <p class="copy-hint">Нажмите кнопку справа, чтобы скопировать</p>
                    ` : '<p class="no-link">Реферальная ссылка будет доступна после входа в игру</p>'}
                </div>
                <div class="referrals-list">
                    <h3>🤝 Ваши рефералы</h3>
                    ${this.referrals.length ?
                        `<div class="referrals-grid">
                            ${this.referrals.map(ref => `
                                <div class="referral-item">
                                    <div class="ref-avatar">👤</div>
                                    <div class="ref-info">
                                        <span class="username">${ref.username || 'Аноним'}</span>
                                        <span class="points">💎 ${ref.points || 0}</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>` :
                        '<p class="no-referrals">У вас пока нет рефералов</p>'
                    }
                </div>
            </div>
        `;
    }

    showShopPage() {
        const content = document.getElementById('content');
        content.innerHTML = `
            <div class="shop-section">
                <h2>💫 Магазин Stars</h2>
                <div class="stars-packages">
                    <div class="stars-package" onclick="game.buyStars(50)">
                        <div class="amount">50 Stars</div>
                        <div class="bonus">+5 бонус</div>
                        <div class="price">50 XTR</div>
                    </div>
                    <div class="stars-package" onclick="game.buyStars(100)">
                        <div class="amount">100 Stars</div>
                        <div class="bonus">+15 бонус</div>
                        <div class="price">100 XTR</div>
                    </div>
                    <div class="stars-package" onclick="game.buyStars(500)">
                        <div class="amount">500 Stars</div>
                        <div class="bonus">+100 бонус</div>
                        <div class="price">500 XTR</div>
                    </div>
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

                <div class="season-info">
                    <h3>О текущем сезоне</h3>
                    <p>🎮 Сезон 1 продлится до 31 января 2024</p>
                    <p>💎 После окончания сезона все участники получат токены influencer пропорционально набранным очкам!</p>
                    <p>🔥 Топ-10 игроков получат специальные награды</p>
                </div>

                <div class="buy-stars-section">
                    <h3>Купить Stars</h3>
                    <p>💫 Моментально получайте influencer очки за каждую звезду!</p>
                    <button class="buy-stars-btn" onclick="game.showShopPage()">
                        Купить Stars
                    </button>
                </div>
            </div>
        `;
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
                        Оплатить 50 Stars
                    </button>
                </div>
            </div>
        `;
        console.log('Entry screen rendered');
    }

    async requestEntryPayment() {
        const invoice = {
            title: 'Вход в игру Influencer',
            description: '💫 Единоразовый взнос 50 Stars для начала игры',
            currency: 'XTR',
            prices: [{
                label: '50 Stars',
                amount: 5000
            }],
            payload: JSON.stringify({
                type: 'entry_payment',
                referrerId: this.referrerId
            }),
            provider_token: '',
            need_name: false,
            need_phone_number: false,
            need_email: false,
            need_shipping_address: false,
            send_phone_number_to_provider: false,
            send_email_to_provider: false,
            is_flexible: false
        };

        try {
            console.log('Showing payment form:', invoice);
            await this.telegram.showPaymentForm(invoice);
        } catch (error) {
            console.error('Entry payment error:', error);
            alert('Для начала игры необходимо оплатить вход. Убедитесь, что у вас есть Telegram Stars.');
        }
    }

    async handleInvoiceClosed(event) {
        console.log('Invoice closed:', event);
        if (event.status === 'paid') {
            try {
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

                document.querySelector('.navigation').style.display = 'flex';
                await this.showPage('rating');
            } catch (error) {
                console.error('Error processing payment:', error);
                alert('Произошла ошибка при обработке платежа. Пожалуйста, обратитесь в поддержку.');
            }
        }
    }

    async buyStars(amount) {
        const invoice = {
            title: `Покупка ${amount} Stars`,
            description: `💫 ${amount} Stars\n🎁 Бонус: +${Math.floor(amount * 0.1)} Stars`,
            currency: 'XTR',
            prices: [{
                label: `${amount} Stars`,
                amount: amount * 100
            }],
            payload: JSON.stringify({
                type: 'stars_purchase',
                amount: amount
            }),
            provider_token: '',
            need_name: false,
            need_phone_number: false,
            need_email: false,
            need_shipping_address: false,
            send_phone_number_to_provider: false,
            send_email_to_provider: false,
            is_flexible: false
        };

        try {
            await this.telegram.showPaymentForm(invoice);
        } catch (error) {
            console.error('Stars purchase error:', error);
            alert('Произошла ошибка при покупке Stars. Попробуйте позже.');
        }
    }
}

// Инициализация игры
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, creating game instance...');
    window.game = new InfluencerGame();
});