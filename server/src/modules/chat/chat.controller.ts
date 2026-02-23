import { NextFunction, Response } from 'express';
import * as chatService from './chat.service';
import { RateLimitError } from './chat.service';

// Helper: write an SSE error event then close the stream.
// We must do this (instead of next(error)) because flushHeaders() has already
// committed us to an SSE response — HTTP status can no longer be changed.
const sendSSEError = (res: Response, code: string, message: string) => {
    res.write(`data: ${JSON.stringify({ error: true, code, message })}\n\n`);
    res.end();
};

export const send = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { message } = req.body;
        const userId = req.user._id;

        // Commit to SSE — no going back to HTTP errors after this point
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders();

        await chatService.streamMessage(
            userId,
            message,
            (chunk) => {
                res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
            },
            () => {
                res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
                res.end();
            },
            (err) => {
                if (err instanceof RateLimitError) {
                    sendSSEError(res, 'RATE_LIMIT', err.message);
                } else {
                    sendSSEError(res, 'AI_ERROR', 'The AI service failed to respond. Please try again.');
                }
            },
        );
    } catch (error) {
        // Only reached if error occurs before flushHeaders() (e.g. bad userId)
        next(error);
    }
};

export const history = async (req: any, res: Response, next: NextFunction) => {
    try {
        const userId = req.user._id;
        const chatHistory = await chatService.getHistory(userId);
        res.status(200).json(chatHistory);
    } catch (error) {
        next(error);
    }
};
