import React, { useState, useEffect } from 'react';
import { User, Transaction } from '../../types';

interface GameInterfaceProps {
    user: User;
}

export const GameInterface: React.FC<GameInterfaceProps> = ({ user }) => {
    const [balance, setBalance] = useState(user.inf_balance);
    const [canClick, setCanClick] = useState(true);
    const [timeLeft, setTimeLeft] = useState(0);
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    const handleClick = async () => {
        if (!canClick) return;

        try {
            const response = await fetch('/api/click', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.user_id })
            });

            const result = await response.json();
            setBalance(result.newBalance);
            setCanClick(false);
            setTimeLeft(50);
        } catch (error) {
            console.error('Error clicking:', error);
        }
    };

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (!canClick && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setCanClick(true);
        }
        return () => clearInterval(timer);
    }, [canClick, timeLeft]);

    return (
        <div className="game-container">
            <div className="inf-balance">
                <h1>Your INF: {balance}</h1>
            </div>

            <button
                className="click-button"
                disabled={!canClick}
                onClick={handleClick}
            >
                Click for INF
                {!canClick && <span>({timeLeft}s)</span>}
            </button>

            <div className="transactions-list">
                {transactions.map(tx => (
                    <div key={tx.id} className="transaction-item">
                        +{tx.inf_amount} INF
                    </div>
                ))}
            </div>
        </div>
    );
};