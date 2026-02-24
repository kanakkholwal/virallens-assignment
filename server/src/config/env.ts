import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

const nodeEnv = process.env.NODE_ENV ?? 'development';

dotenv.config({
    path: path.resolve(process.cwd(), nodeEnv === 'production' ? '.env' : '.env.development')
});

const envSchema = z.object({
    PORT: z.string().default('8080'),
    MONGO_URI: z.string().min(1, 'MONGO_URI is required'),
    JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
    OPENROUTER_API_KEY: z.string().min(1, 'OPENROUTER_API_KEY is required'),
    AI_MODEL: z.string().default('liquid/lfm-2.5-1.2b-instruct:free'),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

    RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000),
    RATE_LIMIT_MAX: z.coerce.number().default(100),
    CHAT_RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60 * 1000),
    CHAT_RATE_LIMIT_MAX: z.coerce.number().default(20),

    CORS_ORIGIN: z.string().default('http://localhost:5173'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error('Invalid environment variables:\n', parsed.error.flatten().fieldErrors);
    process.exit(1);
}

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace NodeJS {
        // eslint-disable-next-line @typescript-eslint/no-empty-object-type
        interface ProcessEnv extends z.infer<typeof envSchema> { }
    }
}

const env = parsed.data;
const isDev = env.NODE_ENV === 'development';

const config = {
    port: Number(env.PORT),
    mongoUri: env.MONGO_URI,
    jwtSecret: env.JWT_SECRET,
    openRouterApiKey: env.OPENROUTER_API_KEY,
    aiModel: env.AI_MODEL,
    nodeEnv: env.NODE_ENV,
    isDev,
    isProd: env.NODE_ENV === 'production',
    corsOrigin: env.CORS_ORIGIN,
    rateLimit: {
        global: {
            windowMs: env.RATE_LIMIT_WINDOW_MS,
            max: env.RATE_LIMIT_MAX,
        },
        chat: {
            windowMs: env.CHAT_RATE_LIMIT_WINDOW_MS,
            max: env.CHAT_RATE_LIMIT_MAX,
        },
    },
};

// immutable config
Object.freeze(config)

export { config };

