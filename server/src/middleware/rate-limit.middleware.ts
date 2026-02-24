import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { config } from '../config/env';

// Global limiter
export const globalLimiter = rateLimit({
    windowMs: config.rateLimit.global.windowMs,
    max: config.rateLimit.global.max,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    message: {
        status: 429,
        message: 'Too many requests. Please slow down and try again later.',
    },
    handler: (req, res, _next, options) => {
        if (config.isDev) {
            console.warn(`[rate-limit] ${req.ip} hit global limit on ${req.path}`);
        }
        res.status(options.statusCode).json(options.message);
    },
});

// Chat-specific limiter
export const chatLimiter = rateLimit({
    windowMs: config.rateLimit.chat.windowMs,
    max: config.rateLimit.chat.max,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    // INFO: back to ipKeyGenerator — required by express-rate-limit v8 for proper IPv6 handling.
    keyGenerator: (req: any) => req.user?._id?.toString() ?? ipKeyGenerator(req),
    message: {
        status: 429,
        message: `You're sending messages too fast. Please wait a moment before trying again.`,
    },
    handler: (req: any, res, _next, options) => {
        if (config.isDev) {
            console.warn(`[rate-limit] user ${req.user?._id ?? req.ip} hit chat limit`);
        }
        res.status(options.statusCode).json(options.message);
    },
});
