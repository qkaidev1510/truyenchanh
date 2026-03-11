import React from 'react';
import type { MangaStatus } from '@manga/shared';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-800',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  danger: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
};

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variantClasses[variant],
        className,
      ].join(' ')}
    >
      {children}
    </span>
  );
}

const statusVariantMap: Record<MangaStatus, BadgeVariant> = {
  ONGOING: 'success',
  COMPLETED: 'info',
  HIATUS: 'warning',
  CANCELLED: 'danger',
};

export function MangaStatusBadge({ status }: { status: MangaStatus }) {
  return <Badge variant={statusVariantMap[status]}>{status}</Badge>;
}
