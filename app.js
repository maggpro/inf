async showRatingPage() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <div class="user-stats">
            <h2>${this.points.toLocaleString()} influencer</h2>
        </div>
        <div class="rating-list">
            <h3>Топ игроков</h3>
            <div class="rating-item">
                <span class="position">1</span>
                <span class="username">Вы</span>
                <span class="points">${this.points.toLocaleString()}</span>
            </div>
        </div>
    `;
}
