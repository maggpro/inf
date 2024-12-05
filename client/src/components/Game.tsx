import React, { useState, useEffect } from 'react';
import { User } from '../types';

interface GameProps {
    userId: number;
}

export const Game: React.FC<GameProps> = ({ userId }) => {
    const [user, setUser] = useState<User | null>(null);
    const [canClick, setCanClick] = useState(true);
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
            const response = await fetch(`/api/user/${userId}`);
            const data = await response.json();
            setUser(data);
        } catch (error) {
            console.error('Error fetching user:', error);
        }
    };

    const handleClick = async () => {
        if (!canClick) return;

        try {
            const response = await fetch('/api/click', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });

            const data = await response.json();
            setUser(prev => prev ? { ...prev, inf_balance: data.newBalance } : null);
            setCanClick(false);
            setTimeLeft(50);
        } catch (error) {
            console.error('Error clicking:', error);
        }
    };

    return (
        <div className="game-container">
            <div className="balance">
                <h2>Your Balance</h2>
                <h1>{user?.inf_balance || 0} INF</h1>
            </div>

            <button
                className="click-button"
                onClick={handleClick}
                disabled={!canClick}
            >
                Click for INF
                {!canClick && <span> ({timeLeft}s)</span>}
            </button>

            <div className="stats">
                <h3>Statistics</h3>
                <p>Referral Code: {user?.referral_code}</p>
                <p>Account Created: {user?.created_at ? new Date(user.created_at).toLocaleString() : '-'}</p>
            </div>
        </div>
    );
};