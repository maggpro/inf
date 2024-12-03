async requestEntryPayment() {
    const invoice = {
        title: 'Вход в игру',
        description: '💫 50 Stars',
        payload: 'entry_payment_50',
        currency: 'XTR',
        prices: [{
            label: '50 Stars',
            amount: 5000 // 50 Stars = 5000 (сумма в минимальных единицах)
        }],
        provider_token: null,
        need_name: false,
        need_phone_number: false,
        need_email: false,
        need_shipping_address: false,
        send_phone_number_to_provider: false,
        send_email_to_provider: false,
        is_flexible: false,
        max_tip_amount: 0,
        suggested_tip_amounts: []
    };

    try {
        console.log('Showing payment form:', invoice);
        await this.telegram.showPaymentForm(invoice);
    } catch (error) {
        console.error('Payment error:', error);
    }
}