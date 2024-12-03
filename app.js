async requestEntryPayment() {
    const invoice = {
        title: 'Вход в игру Influencer',
        description: '💫 50 Stars\n🎮 Доступ к игре\n💎 Возможность заработка\n🏆 Участие в рейтинге\n💰 Токены в конце сезона',
        payload: 'entry_payment_50',
        currency: 'XTR',
        prices: [
            {
                label: 'Вход в игру',
                amount: 5000 // 50 Stars = 5000 (сумма в минимальных единицах)
            }
        ],
        provider_token: null, // Для Stars должен быть null
        need_name: false,
        send_email_to_provider: false,
        send_phone_number_to_provider: false,
        is_flexible: false,
        max_tip_amount: 0,
        suggested_tip_amounts: [],
        // Убираем лишние поля, которые могут мешать
        start_parameter: 'entry_payment',
        photo_url: null,
        photo_size: 0,
        photo_width: 0,
        photo_height: 0
    };

    try {
        console.log('Showing payment form:', invoice);
        const result = await this.telegram.showPaymentForm(invoice);
        console.log('Payment form result:', result);
    } catch (error) {
        console.error('Entry payment error:', error);
        alert('Для начала игры необходимо оплатить вход. Убедитесь, что у вас есть Telegram Stars.');
    }
}