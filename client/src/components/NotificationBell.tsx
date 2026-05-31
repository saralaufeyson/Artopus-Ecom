import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../contexts/NotificationsContext';

function formatRelativeTime(dateString: string) {
  const now = Date.now();
  const diffMs = now - new Date(dateString).getTime();
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60000));

  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
  return `${Math.floor(diffMinutes / 1440)}d ago`;
}

export default function NotificationBell() {
  const navigate = useNavigate();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleClick = (event: MouseEvent) => {
      if (!panelRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  const openNotification = async (id: string, link?: string) => {
    await markAsRead(id);
    setIsOpen(false);
    if (link) navigate(link);
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="relative p-2 text-gray-700 transition-colors hover:text-logo-purple dark:text-gray-300"
        aria-label="Notifications"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10 21a2 2 0 0 0 4 0" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-[22rem] overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-logo-purple">Notifications</p>
              <p className="text-xs text-gray-500">{unreadCount} unread</p>
            </div>
            <button
              type="button"
              onClick={() => markAllAsRead()}
              className="text-xs font-bold text-logo-purple disabled:opacity-50"
              disabled={unreadCount === 0}
            >
              Mark all read
            </button>
          </div>

          <div className="max-h-[28rem] overflow-y-auto">
            {loading && notifications.length === 0 && (
              <p className="px-5 py-6 text-sm text-gray-500">Loading notifications...</p>
            )}

            {!loading && notifications.length === 0 && (
              <p className="px-5 py-6 text-sm text-gray-500">No notifications yet.</p>
            )}

            {notifications.map((notification) => (
              <button
                key={notification._id}
                type="button"
                onClick={() => openNotification(notification._id, notification.link)}
                className={`w-full border-b border-gray-100 px-5 py-4 text-left transition hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800 ${
                  notification.isRead ? 'opacity-75' : 'bg-logo-purple/5'
                }`}
              >
                <div className="mb-1 flex items-start justify-between gap-3">
                  <p className="font-bold text-gray-900 dark:text-white">{notification.title}</p>
                  <span className="shrink-0 text-xs text-gray-400">{formatRelativeTime(notification.createdAt)}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">{notification.message}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
