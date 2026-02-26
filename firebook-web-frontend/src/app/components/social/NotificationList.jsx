'use client';

import { useState } from 'react';
import Avatar from './Avatar';
import { deleteNotification } from '../../lib/api';
import { useUser } from '../../contexts/UserContext';

export default function NotificationList({ onRead }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [markingAll, setMarkingAll] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'like', 'comment', 'follow'
  const { profile: userProfile } = useUser();

  useEffect(() => {
    fetchNotifications(1);
  }, []);

  const fetchNotifications = async (pageNum = 1) => {
    setLoading(true);
    setNotifications([]);

    try {
      // For now, mock data - in production this would call the API
      const mockNotifications = [
        {
          id: 1,
          type: 'like',
          actor_id: 2,
          actor_username: 'chef_jane',
          actor_avatar_url: null,
          post_id: 1,
          created_at: new Date(Date.now() - 300000).toISOString(),
          read: false,
        },
        {
          id: 2,
          type: 'comment',
          actor_id: 2,
          actor_username: 'chef_jane',
          actor_avatar_url: null,
          post_id: 1,
          comment_id: 101,
          comment_content: 'This looks amazing! Can you share the recipe?',
          created_at: new Date(Date.now() - 600000).toISOString(),
          read: false,
        },
        {
          id: 3,
          type: 'follow',
          actor_id: 3,
          actor_username: 'chef_mike',
          actor_avatar_url: null,
          created_at: new Date(Date.now() - 900000).toISOString(),
          read: false,
        },
      ];

      const filteredNotifications = filterNotifications(mockNotifications, filter);

      setNotifications(filteredNotifications);
      setPage(pageNum);
      setHasMore(filteredNotifications.length === 20);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterNotifications = (notifList, filterType) => {
    switch (filterType) {
      case 'like':
        return notifList.filter(n => n.type === 'like');
      case 'comment':
        return notifList.filter(n => n.type === 'comment');
      case 'follow':
        return notifList.filter(n => n.type === 'follow');
      case 'all':
      default:
        return notifList;
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await deleteNotification(notificationId);
      setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
      if (onRead) onRead();
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleDelete = async (notificationId) => {
    if (!confirm('Are you sure you want to delete this notification?')) {
      return;
    }

    try {
      await deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    setMarkingAll(true);
    try {
      // In production, this would call the API to mark all as read
      // For now, just update local state
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setTimeout(() => {
        setMarkingAll(false);
        if (onRead) onRead();
      }, 500);
    } catch (err) {
      console.error('Error marking all as read:', err);
      setMarkingAll(false);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return '❤️';
      case 'comment':
        return '💬';
      case 'follow':
        return '👥';
      default:
        return '🔔';
    }
  };

  const getNotificationMessage = (notification) => {
    if (notification.type === 'like') {
      return `${notification.actor_username || 'Someone'} liked your post`;
    } else if (notification.type === 'comment') {
      return `${notification.actor_username || 'Someone'} commented: "${notification.comment_content || ''}"`;
    } else if (notification.type === 'follow') {
      return `${notification.actor_username || 'Someone'} started following you`;
    }
    return 'New notification';
  };

  const canDelete = (notification) => {
    return userProfile && notification.actor_id !== userProfile.id;
  };

  return (
    <div style={{
      position: 'relative',
      maxHeight: '600px',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 20px',
        borderBottom: '1px solid #e0e0e0',
      }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#333' }}>
          Notifications
        </h2>

        <div style={{ display: 'flex', gap: '12px' }}>
          {/* Filter Tabs */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {['all', 'like', 'comment', 'follow'].map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '6px',
                  backgroundColor: filter === filterType ? '#ff6b35' : '#e0e0e0',
                  color: filter === filterType ? '#ffffff' : '#666',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {filterType}
              </button>
            ))}
          </div>

          {/* Mark All as Read */}
          <button
            onClick={handleMarkAllAsRead}
            disabled={markingAll || notifications.every(n => n.read)}
            style={{
              padding: '8px 16px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              backgroundColor: '#ffffff',
              color: '#666',
              fontSize: '14px',
              fontWeight: '600',
              cursor: notifications.every(n => n.read) ? 'not-allowed' : 'pointer',
            }}
          >
            {markingAll ? '⏳' : 'Mark All as Read'}
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
      }}>
        {loading && (
          <div style={{
            textAlign: 'center',
            padding: '60px',
            color: '#999',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
            <p>Loading notifications...</p>
          </div>
        )}

        {!loading && notifications.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '60px',
            color: '#999',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔔</div>
            <p>No notifications yet</p>
            <p style={{ fontSize: '14px', fontStyle: 'italic', color: '#999' }}>
              When you receive likes, comments, or follows, they'll appear here.
            </p>
          </div>
        )}

        {!loading && notifications.length > 0 && (
          <>
            {notifications.map((notification) => (
              <div
                key={notification.id}
                style={{
                  backgroundColor: notification.read ? '#f9fafb' : '#ffffff',
                  padding: '16px',
                  borderBottom: '1px solid #f0f0f0',
                  transition: 'background-color 0.2s',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f0f0f0'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#f9fafb'; }}
              >
                {/* Notification Icon */}
                <div
                  onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                  style={{
                    fontSize: '24px',
                    minWidth: '44px',
                    cursor: !notification.read ? 'pointer' : 'default',
                  }}
                >
                  {getNotificationIcon(notification.type)}
                </div>

                {/* Actor Info */}
                <div style={{ flex: 1 }}>
                  <Avatar
                    user={{
                      username: notification.actor_username,
                      avatar_url: notification.actor_avatar_url,
                    }}
                    size="small"
                  />

                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontWeight: '600',
                      fontSize: '16px',
                      color: '#333',
                    }}>
                      {notification.actor_username}
                    </div>

                    <div style={{
                      fontSize: '14px',
                      color: '#999',
                      marginTop: '4px',
                    }}>
                      {getNotificationMessage(notification)}
                    </div>

                    <div style={{
                      fontSize: '12px',
                      color: '#999',
                      marginTop: '4px',
                    }}>
                      • {new Date(notification.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'center',
                }}>
                  {!notification.read && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      style={{
                        padding: '6px 12px',
                        border: 'none',
                        borderRadius: '4px',
                        backgroundColor: '#f3f4f6',
                        color: '#666',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                      }}
                    >
                      Mark as Read
                    </button>
                  )}

                  {canDelete(notification) && (
                    <button
                      onClick={() => handleDelete(notification.id)}
                      style={{
                        padding: '6px 12px',
                        border: 'none',
                        borderRadius: '4px',
                        backgroundColor: '#fee',
                        color: '#666',
                        fontSize: '12px',
                        cursor: 'pointer',
                      }}
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Load More */}
      {hasMore && !loading && (
        <button
          onClick={() => fetchNotifications(page + 1)}
          disabled={loading}
          style={{
            width: '100%',
            padding: '16px',
            border: 'none',
            borderRadius: '8px',
            backgroundColor: '#f9fafb',
            color: '#666',
            fontSize: '14px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginTop: '16px',
          }}
        >
          {loading ? '⏳ Loading...' : 'Load More Notifications'}
        </button>
      )}
    </div>
  );
}
