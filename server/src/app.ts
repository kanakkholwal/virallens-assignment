import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { config } from './config/env';
import { errorHandler } from './middleware/error.middleware';
import { globalLimiter } from './middleware/rate-limit.middleware';
import authRoutes from './modules/auth/auth.routes';
import chatRoutes from './modules/chat/chat.routes';

const app = express();

app.use(helmet());

app.use(cors({
    origin: config.isDev ? true : config.corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}));

if (config.isProd) {
    app.use(globalLimiter);
} else {
    console.log('[rate-limit] global limiter disabled in development');
}

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

//  Routes
app.use('/auth', authRoutes);
app.use('/chat', chatRoutes);

// Health check
app.get('/health', (_req, res) => {
    res.status(200).json({
        status: 'ok',
        env: config.nodeEnv,
        timestamp: new Date().toISOString(),
    });
});

app.use(errorHandler);

export default app;
