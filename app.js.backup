async requestEntryPayment() {
    const invoice = {
        title: "Вход в игру Influencer",
        description: "Единоразовый взнос для начала игры",
        currency: "XTR",
        prices: [{
            label: "Вход",
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
        provider_token: "",
        photo_url: null,
        photo_size: 0,
        photo_width: 0,
        photo_height: 0
    };

    try {
        console.log('Showing payment form:', invoice);
        await this.telegram.showPaymentForm(invoice);
    } catch (error) {
        console.error('Entry payment error:', error);
        alert('Для начала игры необходимо оплатить вход. Убедитесь, что у вас есть Telegram Stars.');
    }
}

