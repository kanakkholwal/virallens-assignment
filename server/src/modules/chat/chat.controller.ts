import { NextFunction, Response } from 'express';
import * as chatService from './chat.service';
import { RateLimitError } from './chat.service';

const sendSSEError = (res: Response, code: string, message: string) => {
    res.write(`data: ${JSON.stringify({ error: true, code, message })}\n\n`);
    res.end();
};

// Conversations - CRUD                 

export const createConversation = async (req: any, res: Response, next: NextFunction) => {
    try {
        const userId = req.user._id;
        const conversation = await chatService.createConversation(userId);
        res.status(201).json(conversation);
    } catch (error) {
        next(error);
    }
};

export const listConversations = async (req: any, res: Response, next: NextFunction) => {
    try {
        const userId = req.user._id;
        const conversations = await chatService.getConversations(userId);
        res.status(200).json(conversations);
    } catch (error) {
        next(error);
    }
};

export const deleteConversation = async (req: any, res: Response, next: NextFunction) => {
    try {
        const userId = req.user._id;
        const { id } = req.params;
        const deleted = await chatService.deleteConversation(userId, id);
        if (!deleted) return res.status(404).json({ message: 'Conversation not found' });
        res.status(200).json({ message: 'Conversation deleted' });
    } catch (error) {
        next(error);
    }
};

export const renameConversation = async (req: any, res: Response, next: NextFunction) => {
    try {
        const userId = req.user._id;
        const { id } = req.params;
        const { title } = req.body;
        const updated = await chatService.updateConversationTitle(userId, id, title);
        if (!updated) return res.status(404).json({ message: 'Conversation not found' });
        res.status(200).json(updated);
    } catch (error) {
        next(error);
    }
};

// Messaging                       

export const send = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { message } = req.body;
        const userId = req.user._id;
        const { id: conversationId } = req.params;

        // Commit to SSE — no going back to HTTP errors after this point
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders();

        await chatService.streamMessage(
            userId,
            conversationId,
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
        next(error);
    }
};

export const history = async (req: any, res: Response, next: NextFunction) => {
    try {
        const userId = req.user._id;
        const { id: conversationId } = req.params;
        const chatHistory = await chatService.getHistory(userId, conversationId);
        res.status(200).json(chatHistory);
    } catch (error) {
        next(error);
    }
};
