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