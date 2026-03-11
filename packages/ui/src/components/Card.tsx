import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className = '', onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={[
        'bg-white rounded-lg shadow-sm border border-gray-200',
        'overflow-hidden',
        onClick ? 'cursor-pointer hover:shadow-md transition-shadow duration-200' : '',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`px-4 py-3 border-b border-gray-200 ${className}`}>{children}</div>;
}

export function CardBody({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`px-4 py-4 ${className}`}>{children}</div>;
}
