import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { streamText } from 'ai';
import { config } from '../config/env';

const openrouter = createOpenRouter({
    apiKey: config.openRouterApiKey,
});

const MODEL = process.env.AI_MODEL || 'liquid/lfm-2.5-1.2b-instruct:free';

export const streamAIResponse = (userMessage: string) => {
    return streamText({
        model: openrouter.chat(MODEL),
        messages: [{ role: 'user', content: userMessage }],
    });
};
