import express from 'express';
import { protect } from '../../middleware/auth.middleware';
import { chatLimiter } from '../../middleware/rate-limit.middleware';
import * as chatController from './chat.controller';

const router = express.Router();

// chatLimiter runs after protect so req.user is available for per-user keying
router.post('/send', protect, chatLimiter, chatController.send);
router.get('/history', protect, chatController.history);

export default router;
