const tg = window.Telegram.WebApp;
const API_URL = 'https://inf-game-api.your-domain.com/api';

let clickTimer = null;
let timeLeft = 0;

// Инициализация Telegram WebApp
tg.ready();
tg.expand();

const userId = tg.initDataUnsafe?.user?.id;
if (!userId) {
    alert('Пожалуйста, откройте приложение через Telegram');
}

// Элементы интерфейса
const clickButton = document.getElementById('clickButton');
const balanceElement = document.getElementById('balance');
const timerElement = document.getElementById('timer');
const referralCodeElement = document.getElementById('referralCode');
const createdAtElement = document.getElementById('createdAt');
const leaderboardBody = document.getElementById('leaderboardBody');

// Загрузка данных пользователя
async function loadUserData() {
    try {
        const response = await fetch(`${API_URL}/user/${userId}`);
        const user = await response.json();

        balanceElement.textContent = user.inf_balance;
        referralCodeElement.textContent = user.referral_code;
        createdAtElement.textContent = new Date(user.created_at).toLocaleString();

        if (user.last_click_time) {
            const lastClick = new Date(user.last_click_time);
            const now = new Date();
            const diff = Math.floor((now - lastClick) / 1000);

            if (diff < 50) {
                timeLeft = 50 - diff;
                startTimer();
                clickButton.disabled = true;
            }
        }
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

// Загрузка таблицы лидеров
async function loadLeaderboard() {
    try {
        const response = await fetch(`${API_URL}/leaderboard`);
        const leaders = await response.json();

        leaderboardBody.innerHTML = leaders.map((user, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${user.username}</td>
                <td>${user.inf_balance}</td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading leaderboard:', error);
    }
}

// Обработка клика
clickButton.addEventListener('click', async () => {
    if (clickButton.disabled) return;

    try {
        const response = await fetch(`${API_URL}/click`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId })
        });

        const result = await response.json();
        balanceElement.textContent = result.newBalance;

        clickButton.disabled = true;
        timeLeft = 50;
        startTimer();

        // Обновляем таблицу лидеров
        loadLeaderboard();
    } catch (error) {
        console.error('Error clicking:', error);
    }
});

function startTimer() {
    if (clickTimer) clearInterval(clickTimer);

    updateTimer();
    clickTimer = setInterval(() => {
        timeLeft--;
        updateTimer();

        if (timeLeft <= 0) {
            clearInterval(clickTimer);
            clickButton.disabled = false;
            timerElement.textContent = '';
        }
    }, 1000);
}

function updateTimer() {
    timerElement.textContent = timeLeft > 0 ? `(${timeLeft}s)` : '';
}

// Загружаем начальные данные
loadUserData();
loadLeaderboard();