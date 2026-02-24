import { AISDKError } from 'ai';
import Chat from '../../models/Chat';
import Conversation from '../../models/Conversation';
import { streamAIResponse } from '../../services/ai.service';

export class RateLimitError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'RateLimitError';
    }
}

const RATE_LIMIT_PHRASES = [
    'rate limit',
    'daily limit',
    'quota exceeded',
    'too many requests',
    'credits',
    'usage limit',
];

const isRateLimitError = (err: unknown): boolean => {
    if (!(err instanceof Error)) return false;
    const msg = err.message.toLowerCase();
    if ('statusCode' in err && (err as any).statusCode === 429) return true;
    if ('status' in err && (err as any).status === 429) return true;
    return RATE_LIMIT_PHRASES.some(phrase => msg.includes(phrase));
};

//  Conversation CRUD 

export const createConversation = async (userId: string) => {
    return await Conversation.create({ userId, title: 'New Chat' });
};

export const getConversations = async (userId: string) => {
    return await Conversation.find({ userId }).sort({ updatedAt: -1 });
};

export const deleteConversation = async (userId: string, conversationId: string) => {
    const conversation = await Conversation.findOneAndDelete({ _id: conversationId, userId });
    if (!conversation) return null;
    await Chat.deleteMany({ conversationId });
    return conversation;
};

export const updateConversationTitle = async (
    userId: string,
    conversationId: string,
    title: string,
) => {
    return await Conversation.findOneAndUpdate(
        { _id: conversationId, userId },
        { title },
        { new: true },
    );
};

//  Messaging 

export const streamMessage = async (
    userId: string,
    conversationId: string,
    message: string,
    onChunk: (chunk: string) => void,
    onDone: (fullText: string) => void,
    onError: (err: RateLimitError | Error) => void,
) => {
    // Validate conversation belongs to user
    const conversation = await Conversation.findOne({ _id: conversationId, userId });
    if (!conversation) {
        onError(new Error('Conversation not found'));
        return;
    }

    await Chat.create({ userId, conversationId, role: 'user', message });

    try {
        const result = streamAIResponse(message);
        let fullText = '';

        for await (const chunk of result.textStream) {
            fullText += chunk;
            onChunk(chunk);
        }

        await Chat.create({ userId, conversationId, role: 'assistant', message: fullText });

        // Auto-generate title from first user message if still "New Chat"
        if (conversation.title === 'New Chat') {
            const autoTitle = message.slice(0, 60).trim() + (message.length > 60 ? '…' : '');
            await Conversation.findByIdAndUpdate(conversationId, { title: autoTitle });
        }

        // Bump updatedAt so conversations sort by last activity
        await Conversation.findByIdAndUpdate(conversationId, { updatedAt: new Date() });

        onDone(fullText);
    } catch (err) {
        if (isRateLimitError(err)) {
            onError(new RateLimitError('OpenRouter daily free limit reached. Try again tomorrow or add credits.'));
        } else if (err instanceof AISDKError) {
            onError(new Error(`AI provider error: ${err.message}`));
        } else {
            onError(err instanceof Error ? err : new Error('Unexpected AI error'));
        }
    }
};

export const getHistory = async (userId: string, conversationId: string) => {
    return await Chat.find({ userId, conversationId }).sort({ createdAt: 1 });
};
