updateUI() {
    const userStats = document.querySelector('.user-stats');
    if (userStats) {
        userStats.innerHTML = `
            <h2>Ваш счет: ${this.points} influencer</h2>
            <p>Звезды: ${this.stars} ⭐️</p>
        `;
    }
}