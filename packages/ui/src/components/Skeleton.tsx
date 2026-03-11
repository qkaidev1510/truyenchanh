import React from 'react';

interface SkeletonProps {
  className?: string;
  rounded?: boolean;
}

export function Skeleton({ className = '', rounded = false }: SkeletonProps) {
  return (
    <div
      className={[
        'animate-pulse bg-gray-200',
        rounded ? 'rounded-full' : 'rounded',
        className,
      ].join(' ')}
    />
  );
}

export function MangaCardSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <Skeleton className="w-full aspect-[2/3]" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}
