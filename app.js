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
        // Используем MainButton для инициации платежа
        this.telegram.MainButton.setText('Оплатить 50 Stars');
        this.telegram.MainButton.show();
        this.telegram.MainButton.onClick(() => {
            this.telegram.showPaymentForm(invoice)
                .then(result => {
                    console.log('Payment form result:', result);
                })
                .catch(error => {
                    console.error('Payment error:', error);
                });
        });
    } catch (error) {
        console.error('Payment setup error:', error);
    }
}