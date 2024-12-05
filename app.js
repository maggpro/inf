const tg = window.Telegram.WebApp;
const API_URL = 'http://localhost:3000/api';

// Инициализация
tg.ready();
tg.expand();

const userId = tg.initDataUnsafe?.user?.id;
if (!userId) {
    alert('Пожалуйста, откройте приложение через Telegram');
}

// Проверяем, оплатил ли пользователь
async function checkPayment() {
    try {
        const response = await fetch(`${API_URL}/user/${userId}`);
        const user = await response.json();

        if (user.has_paid) {
            document.getElementById('payment-screen').classList.add('hidden');
            document.getElementById('game-interface').classList.remove('hidden');
            loadUserData();
        } else {
            document.getElementById('payment-screen').classList.remove('hidden');
            document.getElementById('game-interface').classList.add('hidden');
        }
    } catch (error) {
        console.error('Error checking payment:', error);
    }
}

// Обработчик кнопки отправки Star
document.getElementById('sendStarButton').addEventListener('click', () => {
    // Отправляем команду для создания формы оплаты Stars
    tg.sendData(JSON.stringify({
        method: 'sendStarsForm',
        form_id: Date.now().toString(),
        invoice: {
            title: 'Вход в INF Game',
            description: 'Оплата 1 Star для начала игры',
            amount: 1,
            currency: 'STAR'
        }
    }));
});

// Обработка покупок в магазине
document.querySelectorAll('.buy-button').forEach(button => {
    button.addEventListener('click', async () => {
        const stars = button.dataset.stars;
        const inf = button.dataset.inf;

        try {
            // Отправляем запрос на покупку Stars через Telegram
            tg.showPopup({
                title: 'Покупка INF',
                message: `Отправить ${stars} Stars для получения ${inf} INF?`,
                buttons: [{
                    type: 'default',
                    text: 'Отправить Stars',
                    id: 'send_stars'
                }, {
                    type: 'cancel',
                    text: 'Отмена'
                }]
            }, async (buttonId) => {
                if (buttonId === 'send_stars') {
                    // Открываем форму для отправки Stars
                    tg.sendMessage(`/send_stars ${stars}`);

                    // После успе��ной отправки Stars сервер обновит баланс
                    // и мы обновим интерфейс
                    setTimeout(loadUserData, 3000);
                }
            });
        } catch (error) {
            console.error('Error processing purchase:', error);
            tg.showPopup({
                title: 'Ошибка',
                message: 'Произошла ошибка при обработке покупки',
                buttons: [{
                    type: 'close'
                }]
            });
        }
    });
});

// Обновляем функцию загрузки данных пользователя
async function loadUserData() {
    try {
        const response = await fetch(`${API_URL}/user/${userId}`);
        const user = await response.json();

        document.getElementById('starsBalance').textContent = user.stars_balance;
        document.getElementById('infBalance').textContent = user.inf_balance;
        document.getElementById('referralCode').textContent = user.referral_code;
        document.getElementById('totalStars').textContent = user.total_stars || '0';
        document.getElementById('totalInf').textContent = user.total_inf || '0';

        // Проверяем возможность покупки для каждой кн��пки
        document.querySelectorAll('.buy-button').forEach(button => {
            const requiredStars = parseInt(button.dataset.stars);
            button.disabled = user.stars_balance < requiredStars;
        });
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

// Запускаем проверку при загрузке
checkPayment();