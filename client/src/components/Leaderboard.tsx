import React, { useState, useEffect } from 'react';
import { User } from '../types';

export const Leaderboard: React.FC = () => {
    const [leaders, setLeaders] = useState<User[]>([]);

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        try {
            const response = await fetch('/api/leaderboard');
            const data = await response.json();
            setLeaders(data);
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
        }
    };

    return (
        <div className="leaderboard">
            <h2>Top Players</h2>
            <table>
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Username</th>
                        <th>INF Balance</th>
                    </tr>
                </thead>
                <tbody>
                    {leaders.map((user, index) => (
                        <tr key={user.user_id}>
                            <td>{index + 1}</td>
                            <td>{user.username}</td>
                            <td>{user.inf_balance}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};