'use client';

import { useUser } from '../../contexts/UserContext';

export default function NotificationBadge() {
  const { profile: userProfile } = useUser();

  // In a real implementation, this would fetch unread count from API
  // For now, we'll use a simplified approach
  const [unreadCount, setUnreadCount] = useState(0);

  return (
    <button
      style={{
        position: 'relative',
        padding: '8px',
        border: 'none',
        borderRadius: '50%',
        backgroundColor: 'transparent',
        color: '#666',
        cursor: 'pointer',
      }}
    >
      🔔
      {unreadCount > 0 && (
        <span
          style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            backgroundColor: '#ff4500',
            color: '#ffffff',
            fontSize: '11px',
            fontWeight: '700',
            padding: '2px 6px',
            borderRadius: '10px',
            minWidth: '16px',
          }}
        >
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
}
