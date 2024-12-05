import express from 'express';
import path from 'path';
import { Database } from './database';
import { setupRoutes } from './api/routes';
import { corsMiddleware } from './middleware/cors';

export class WebServer {
    private app: express.Application;

    constructor(private db: Database) {
        this.app = express();
        this.setupMiddleware();
        this.setupRoutes();
    }

    private setupMiddleware() {
        this.app.use(corsMiddleware);
        this.app.use(express.json());
        this.app.use(express.static(path.join(__dirname, '../client/build')));
    }

    private setupRoutes() {
        // API маршруты
        this.app.use('/api', setupRoutes(this.db));

        // Маршрут для React приложения
        this.app.get('*', (req, res) => {
            res.sendFile(path.join(__dirname, '../client/build/index.html'));
        });
    }

    public start(port: number) {
        this.app.listen(port, () => {
            console.log(`Web server running on port ${port}`);
        });
    }
}