import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import { errorHandler } from './middleware/error.middleware';

import authRoutes from './modules/auth/auth.routes';
import chatRoutes from './modules/chat/chat.routes';

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/chat', chatRoutes);

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.use(errorHandler);

export default app;
