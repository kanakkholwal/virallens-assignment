import express from 'express';
import { protect } from '../../middleware/auth.middleware';
import { chatLimiter } from '../../middleware/rate-limit.middleware';
import * as chatController from './chat.controller';

const router = express.Router();

// Conversation routes 
router.get('/history', protect, chatController.listConversations); // for assignment requirements
router.post('/conversations', protect, chatController.createConversation);
router.get('/conversations', protect, chatController.listConversations);
router.delete('/conversations/:id', protect, chatController.deleteConversation);
router.patch('/conversations/:id', protect, chatController.renameConversation);

// Messaging routes
router.post('/conversations/:id/send', protect, chatLimiter, chatController.send);
router.get('/conversations/:id/history', protect, chatController.history);

export default router;
