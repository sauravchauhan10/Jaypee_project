import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { getUnread, markRead, markAllRead } from './notification.controller.js';

const router: import('express').Router = Router();

router.use(authenticate);

router.get('/unread', getUnread);
router.put('/mark-all-read', markAllRead);
router.put('/:id/read', markRead);

export { router as notificationRouter };
