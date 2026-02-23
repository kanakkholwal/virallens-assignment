import { AISDKError } from 'ai';
import Chat from '../../models/Chat';
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
    // OpenRouter returns 429 — AI SDK wraps it; check status code or message
    if ('statusCode' in err && (err as any).statusCode === 429) return true;
    if ('status' in err && (err as any).status === 429) return true;
    return RATE_LIMIT_PHRASES.some(phrase => msg.includes(phrase));
};

export const streamMessage = async (
    userId: string,
    message: string,
    onChunk: (chunk: string) => void,
    onDone: (fullText: string) => void,
    onError: (err: RateLimitError | Error) => void,
) => {

    await Chat.create({ userId, role: 'user', message });

    try {
        const result = streamAIResponse(message);
        let fullText = '';

        for await (const chunk of result.textStream) {
            fullText += chunk;
            onChunk(chunk);
        }

        await Chat.create({ userId, role: 'assistant', message: fullText });
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

export const getHistory = async (userId: string) => {
    return await Chat.find({ userId }).sort({ createdAt: 1 });
};
