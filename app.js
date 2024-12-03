async requestEntryPayment() {
    console.log('Requesting entry payment...');

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
        need_name: false,
        need_phone_number: false,
        need_email: false,
        need_shipping_address: false,
        send_phone_number_to_provider: false,
        send_email_to_provider: false,
        is_flexible: false,
        provider_data: {
            name: 'Influencer Game',
            photo_url: null,
            start_parameter: 'entry_payment'
        }
    };

    try {
        if (!this.telegram.showPaymentForm) {
            console.error('Payment method not available');
            alert('Платежи не поддерживаются в вашей версии Telegram');
            return;
        }

        console.log('Showing payment form with invoice:', invoice);
        const result = await this.telegram.showPaymentForm(invoice);
        console.log('Payment form result:', result);
    } catch (error) {
        console.error('Payment error:', error);
        alert('Произошла ошибка при открытии формы оплаты. Убедитесь, что у вас есть Telegram Stars.');
    }
}