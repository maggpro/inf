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
        start_parameter: "",
        provider_data: JSON.stringify({}),
        need_name: false,
        need_phone_number: false,
        need_email: false,
        need_shipping_address: false,
        send_phone_number_to_provider: false,
        send_email_to_provider: false,
        is_flexible: false,
        disable_notification: false,
        protect_content: false,
        provider_token: "",
        photo_url: null,
        photo_size: 0,
        photo_width: 0,
        photo_height: 0,
        max_tip_amount: 0,
        suggested_tip_amounts: [],
        reply_markup: null
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
