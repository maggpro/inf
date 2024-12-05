import { Request, Response, NextFunction } from 'express';

export const corsMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const allowedOrigins = ['https://maggpro.github.io', 'http://localhost:3000'];
    const origin = req.headers.origin;

    if (origin && allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    }

    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    next();
};