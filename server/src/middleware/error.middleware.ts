import { NextFunction, Request, Response } from 'express';
import { config } from '../config/env';

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        message: err.message,
        stack: config.isProd ? null : err.stack,
    });
};
