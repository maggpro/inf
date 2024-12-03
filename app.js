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
        is_flexible: false,
        max_tip_amount: 0,
        suggested_tip_amounts: []
    };

    try {
        console.log('Showing payment form:', invoice);
        const result = await this.telegram.showPaymentForm(invoice);
        console.log('Payment form result:', result);
    } catch (error) {
        console.error('Payment error:', error);
    }
}

showEntryScreen() {
    console.log('Rendering entry screen');
    const content = document.getElementById('content');
    if (!content) {
        console.error('Content element not found!');
        return;
    }

    // Убедимся, что навигация скрыта
    const navigation = document.querySelector('.navigation');
    if (navigation) {
        navigation.style.display = 'none';
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

async init() {
    console.log('Starting initialization...');
    await this.initUser();

    if (!this.currentUser) {
        console.log('No user found, showing entry screen');
        this.showEntryScreen();
    } else {
        console.log('User found, initializing navigation');
        this.initNavigation();
        await this.showPage('rating');
    }
    console.log('Initialization complete');
}