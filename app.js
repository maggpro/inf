async requestEntryPayment() {
    const invoice = {
        title: 'Вход в игру',
        description: '💫 50 Stars',
        payload: 'stars_entry_50',
        currency: 'XTR',
        prices: [{
            label: '50 Stars',
            amount: 5000
        }],
        provider_token: null,
        need_name: false,
        send_email_to_provider: false,
        send_phone_number_to_provider: false,
        is_flexible: false,
        max_tip_amount: 0,
        suggested_tip_amounts: []
    };

    try {
        console.log('Showing payment form:', invoice);
        const result = await this.telegram.showPaymentForm(invoice);
        console.log('Payment form result:', result);
    } catch (error) {
        console.error('Entry payment error:', error);
        alert('Для начала игры необходимо оплатить вход');
    }
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

async init() {
    console.log('Starting initialization...');
    await this.initUser();

    // Инициализируем навигацию только если пользователь уже оплатил вход
    if (this.currentUser) {
        this.initNavigation();
        await this.showPage('rating');
    }
    console.log('Initialization complete');
}