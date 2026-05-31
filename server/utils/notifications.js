import Notification from '../models/Notification.js';
import User from '../models/User.js';

function uniqueIds(ids = []) {
  return [...new Set(ids.filter(Boolean).map((id) => id.toString()))];
}

export async function createNotifications(notifications = []) {
  const payload = notifications
    .filter((notification) => notification?.user && notification?.title && notification?.message)
    .map((notification) => ({
      user: notification.user,
      role: notification.role,
      type: notification.type || 'general',
      title: notification.title,
      message: notification.message,
      link: notification.link || '',
      metadata: notification.metadata || {},
    }));

  if (payload.length === 0) return [];
  return Notification.insertMany(payload, { ordered: false });
}

export async function notifyUsers(userIds = [], buildNotification) {
  const ids = uniqueIds(userIds);
  if (ids.length === 0) return [];

  const users = await User.find({ _id: { $in: ids } }).select('_id role name');
  const notifications = users
    .map((user) => {
      const descriptor = typeof buildNotification === 'function' ? buildNotification(user) : buildNotification;
      if (!descriptor) return null;

      return {
        user: user._id,
        role: user.role,
        ...descriptor,
      };
    })
    .filter(Boolean);

  return createNotifications(notifications);
}

export async function notifyRole(role, buildNotification) {
  const users = await User.find({ role }).select('_id role name');
  const notifications = users
    .map((user) => {
      const descriptor = typeof buildNotification === 'function' ? buildNotification(user) : buildNotification;
      if (!descriptor) return null;

      return {
        user: user._id,
        role: user.role,
        ...descriptor,
      };
    })
    .filter(Boolean);

  return createNotifications(notifications);
}
