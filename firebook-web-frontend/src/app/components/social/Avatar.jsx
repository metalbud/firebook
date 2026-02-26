'use client';

import { useRouter } from 'next/navigation';

export default function Avatar({ user, size = 'medium', onClick }) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (user) {
      router.push(`/profile/${user.id}`);
    }
  };

  const sizes = {
    small: { width: '32px', height: '32px', fontSize: '14px' },
    medium: { width: '48px', height: '48px', fontSize: '18px' },
    large: { width: '64px', height: '64px', fontSize: '24px' },
  };

  const sizeConfig = sizes[size] || sizes.medium;

  return (
    <div
      onClick={onClick || handleClick}
      style={{
        width: sizeConfig.width,
        height: sizeConfig.height,
        borderRadius: '50%',
        backgroundColor: user?.avatar_url ? '#e0e0e0' : '#ff6b35',
        backgroundImage: user?.avatar_url
          ? `url(${user.avatar_url})`
          : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        cursor: onClick ? 'pointer' : 'default',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: user?.avatar_url ? '2px solid #fff' : 'none',
        transition: 'transform 0.2s',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
    >
      {user?.avatar_url ? (
        null
      ) : (
        <div style={{ fontSize: sizeConfig.fontSize }}>
          {user?.username?.charAt(0)?.toUpperCase() || 'U'}
        </div>
      )}
    </div>
  );
}
