import { NextFunction, Request, Response } from 'express';
import * as authService from './auth.service';

export const signup = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;
        const user = await authService.register(email, password);
        res.status(201).json(user);
    } catch (error) {
        res.status(400);
        next(error);
    }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;
        const user = await authService.login(email, password);
        res.status(200).json(user);
    } catch (error) {
        res.status(401);
        next(error);
    }
};
