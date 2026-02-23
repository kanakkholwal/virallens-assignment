import express from 'express';
import { protect } from '../../middleware/auth.middleware';
import * as chatController from './chat.controller';

const router = express.Router();

router.post('/send', protect, chatController.send);
router.get('/history', protect, chatController.history);

export default router;
