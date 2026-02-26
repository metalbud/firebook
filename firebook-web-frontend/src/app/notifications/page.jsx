'use client';

import NotificationList from '../../components/social/NotificationList';

export default function NotificationsPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#ffffff',
        padding: '24px 20px',
        borderBottom: '1px solid #e0e0e0',
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: '700',
          margin: 0,
          color: '#ff6b35',
        }}>
          🔔 Notifications
        </h1>
      </div>

      {/* Notification List Component */}
      <div style={{ maxWidth: '800px', margin: '20px auto' }}>
        <NotificationList />
      </div>
    </div>
  );
}
