import { prisma } from '@prescribeflow/db';
import type { NotificationType } from '@prescribeflow/db';
import { emitToUser } from '../lib/socket.js';

export interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: any;
}

/**
 * Creates a notification in the DB and immediately emits it via socket.
 */
export const createNotification = async (params: CreateNotificationParams) => {
  const notification = await prisma.notification.create({
    data: {
      userId: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      metadata: params.metadata || {},
    },
  });

  // Real-time emit
  emitToUser(params.userId, 'notification:new', notification);

  return notification;
};

export const getUnreadNotifications = async (userId: string) => {
  return prisma.notification.findMany({
    where: {
      userId,
      isRead: false,
      deletedAt: null,
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const markAsRead = async (userId: string, notificationId: string) => {
  return prisma.notification.updateMany({
    where: {
      id: notificationId,
      userId,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });
};

export const markAllAsRead = async (userId: string) => {
  return prisma.notification.updateMany({
    where: {
      userId,
      isRead: false,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });
};
