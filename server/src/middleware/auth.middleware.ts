import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import User from '../models/User';

interface DecodedToken {
    id: string;
}

export const protect = async (req: any, res: Response, next: NextFunction) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(
                token,
                config.jwtSecret
            ) as DecodedToken;

            req.user = await User.findById(decoded.id).select('-password');
            next();
        } catch (error) {
            res.status(401);
            next(new Error('Not authorized, token failed'));
        }
    }

    if (!token) {
        res.status(401);
        next(new Error('Not authorized, no token'));
    }
};
