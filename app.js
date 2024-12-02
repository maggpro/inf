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
                    payload: JSON.stringify({
                        type: 'entry_payment',
                        referrerId: this.referrerId // Добавляем ID реферера
                    })
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
        const botUsername = 'influenc_bot';
        const referralLink = this.currentUser && this.currentUser.id ?
            `https://t.me/${botUsername}?start=ref_${this.currentUser.id}` :
            'Сначала войдите в игру';

        content.innerHTML = `
            <div class="friends-section">
                <h2> Пригласите друзей</h2>
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
            if (payload.type === 'entry_payment') {
                // Обработка входного платежа
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
                    referred_by: payload.referrerId // Сохраняем кто пригласил
                };

                // Создаем пользователя
                await this.db.collection('users').doc(String(this.telegram.initDataUnsafe.user.id)).set(userData);

                // Если есть реферер, начисляем ему бонус
                if (payload.referrerId) {
                    const refererDoc = await this.db.collection('users').doc(payload.referrerId).get();
                    if (refererDoc.exists) {
                        const refererData = refererDoc.data();
                        await this.db.collection('users').doc(payload.referrerId).update({
                            points: refererData.points + 10,
                            referrals: [...refererData.referrals, this.telegram.initDataUnsafe.user.id]
                        });
                    }
                }

                this.currentUser = userData;
                this.stars = userData.stars;
                this.showPage('rating');
            } else if (payload.type === 'stars_purchase') {
                // Обработка покупки Stars с бонусами
                const amount = payload.amount;
                const bonus = payload.bonus || 0;
                const totalAmount = amount + bonus;

                this.stars += totalAmount;
                this.points += totalAmount;

                await this.db.collection('users').doc(String(this.currentUser.id)).update({
                    stars: this.stars,
                    points: this.points,
                    transactions: firebase.firestore.FieldValue.arrayUnion({
                        type: 'purchase',
                        amount: amount,
                        bonus: bonus,
                        timestamp: firebase.firestore.FieldValue.serverTimestamp()
                    })
                });

                this.updateUI();
                this.showSuccessMessage(`Успешно! +${amount} Stars ${bonus ? `(+${bonus} бонус)` : ''}`);
            }
        }
    }

    async handlePayment() {
        try {
            const content = document.createElement('div');
            content.className = 'payment-modal';
            content.innerHTML = `
                <div class="payment-options">
                    <h3>Выберите количество Stars</h3>
                    <div class="stars-packages">
                        <button class="stars-package" data-amount="100">
                            <span class="amount">100 ⭐️</span>
                            <span class="bonus">+10 бонус</span>
                            <span class="price">100 Stars</span>
                        </button>
                        <button class="stars-package" data-amount="500">
                            <span class="amount">500 ⭐️</span>
                            <span class="bonus">+100 бонус</span>
                            <span class="price">500 Stars</span>
                        </button>
                        <button class="stars-package" data-amount="1000">
                            <span class="amount">1000 ⭐️</span>
                            <span class="bonus">+300 бонус</span>
                            <span class="price">1000 Stars</span>
                        </button>
                    </div>
                    <div class="custom-amount">
                        <input type="number" min="10" placeholder="Или введите своё количество" />
                        <button class="buy-custom">Купить</button>
                    </div>
                </div>
            `;

            document.body.appendChild(content);

            // Обработчики для пакетов
            const handlePackageClick = async (amount) => {
                const bonus = amount >= 1000 ? 300 : amount >= 500 ? 100 : amount >= 100 ? 10 : 0;
                const invoice = {
                    title: "Покупка Stars",
                    description: `Покупка ${amount} Stars ${bonus ? `(+${bonus} бонус)` : ''}`,
                    currency: "XTR",
                    prices: [{label: "Stars", amount: amount}],
                    payload: JSON.stringify({
                        type: 'stars_purchase',
                        amount: amount,
                        bonus: bonus
                    })
                };

                try {
                    await this.telegram.showPaymentForm(invoice);
                    document.body.removeChild(content);
                } catch (error) {
                    console.error('Payment error:', error);
                }
            };

            // Добавляем обработчики событий
            content.querySelectorAll('.stars-package').forEach(btn => {
                btn.addEventListener('click', () => {
                    handlePackageClick(parseInt(btn.dataset.amount));
                });
            });

            const customInput = content.querySelector('input');
            const buyCustomBtn = content.querySelector('.buy-custom');
            buyCustomBtn.addEventListener('click', () => {
                const amount = parseInt(customInput.value);
                if (amount && amount >= 10) {
                    handlePackageClick(amount);
                } else {
                    alert('Минимальная сумма: 10 Stars');
                }
            });

            // Закрытие по клику вне модального окна
            content.addEventListener('click', (e) => {
                if (e.target === content) {
                    document.body.removeChild(content);
                }
            });
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

    showSuccessMessage(message) {
        const notification = document.createElement('div');
        notification.className = 'success-notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => {
                    document.body.removeChild(notification);
                }, 300);
            }, 2000);
        }, 100);
    }
}

// Инициализация игры
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, creating game instance...');
    window.game = new InfluencerGame();
});
