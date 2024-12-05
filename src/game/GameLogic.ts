import { Database } from '../database';

export class GameLogic {
    constructor(private db: Database) {}

    async handleClick(userId: number): Promise<{ newBalance: number }> {
        const user = await this.db.getUserStats(userId);
        if (!user) {
            throw new Error('User not found');
        }

        const now = new Date();
        const lastClick = user.last_click_time ? new Date(user.last_click_time) : new Date(0);
        const timeDiff = now.getTime() - lastClick.getTime();

        if (timeDiff < 50000) { // 50 секунд
            throw new Error('Too soon to click again');
        }

        const earnedInf = 1; // За каждый клик даем 1 INF
        await this.db.addInfToUser(userId, earnedInf);
        await this.db.updateLastClickTime(userId, now);

        return {
            newBalance: user.inf_balance + earnedInf
        };
    }
}