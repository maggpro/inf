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
    tg.sendMessage('Для начала игры отправьте 1 Star');
});

// ... остальной код ...

// Запускаем проверку при загрузке
checkPayment();