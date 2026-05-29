import type { Request, Response, NextFunction } from 'express';
import * as notificationService from './notification.service.js';
import { sendSuccess } from '../lib/response.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const getUnread = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user!.id;
    const notifications = await notificationService.getUnreadNotifications(userId);
    sendSuccess(res, notifications);
  }
);

export const markRead = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user!.id;
    const { id } = req.params;
    await notificationService.markAsRead(userId, id as string);
    sendSuccess(res, { success: true });
  }
);

export const markAllRead = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user!.id;
    await notificationService.markAllAsRead(userId);
    sendSuccess(res, { success: true });
  }
);
