import express from 'express';
import { Database } from '../database';
import { GameLogic } from '../game/GameLogic';

export function setupRoutes(db: Database) {
    const router = express.Router();
    const gameLogic = new GameLogic(db);

    // Получение баланса и статистики
    router.get('/user/:userId', async (req, res) => {
        try {
            const user = await db.getUserStats(Number(req.params.userId));
            res.json(user);
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    // Обработка клика
    router.post('/click', async (req, res) => {
        try {
            const { userId } = req.body;
            const result = await gameLogic.handleClick(userId);
            res.json(result);
        } catch (error: any) {
            res.status(400).json({
                error: error?.message || 'Unknown error occurred'
            });
        }
    });

    // Получение рейтинга
    router.get('/leaderboard', async (req, res) => {
        try {
            const leaderboard = await db.getLeaderboard();
            res.json(leaderboard);
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    return router;
}