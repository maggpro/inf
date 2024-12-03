async requestEntryPayment() {
    const invoice = {
        title: 'Вход в игру Influencer',
        description: '💫 50 Stars\n🎮 Доступ к игре\n💎 Возможность заработка\n🏆 Участие в рейтинге\n💰 Токены в конце сезона',
        payload: JSON.stringify({
            type: 'entry_payment',
            referrerId: this.referrerId
        }),
        currency: 'XTR',
        prices: [
            {
                label: 'Вход в игру',
                amount: 5000 // 50 Stars = 5000 (сумма в минимальных единицах)
            }
        ],
        provider_token: null,
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
        const result = await this.telegram.showPaymentForm(invoice);
        console.log('Payment form result:', result);
    } catch (error) {
        console.error('Entry payment error:', error);
        alert('Для начала игры необходимо оплатить вход. Убедитесь, что у вас есть Telegram Stars.');
    }
}