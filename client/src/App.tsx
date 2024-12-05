import React from 'react';
import { Game } from './components/Game';
import { Leaderboard } from './components/Leaderboard';
import './App.css';

function App() {
    // Получаем userId из Telegram WebApp
    const userId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;

    if (!userId) {
        return <div>Please open this app from Telegram</div>;
    }

    return (
        <div className="App">
            <Game userId={userId} />
            <Leaderboard />
        </div>
    );
}

export default App;