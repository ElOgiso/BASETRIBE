// Notification badge component for showing alerts

'use client';

import { Badge } from '@/components/ui/badge';

interface NotificationBadgeProps {
  count: number;
  className?: string;
}

export function NotificationBadge({ count, className = '' }: NotificationBadgeProps) {
  if (count === 0) return null;

  return (
    <Badge
      className={`
        absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0
        bg-red-500 text-white text-xs font-bold rounded-full
        animate-pulse
        ${className}
      `}
    >
      {count > 9 ? '9+' : count}
    </Badge>
  );
}
