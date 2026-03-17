"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { useAdminLayout } from '../AdminLayoutContext';

interface AdminStickyActionBarProps {
  leftActions?: React.ReactNode;
  rightActions?: React.ReactNode;
  className?: string;
  sidebarAware?: boolean;
}

export function AdminStickyActionBar({
  leftActions,
  rightActions,
  className,
  sidebarAware = true,
}: AdminStickyActionBarProps) {
  const { isSidebarCollapsed } = useAdminLayout();

  return (
    <div
      className={cn(
        'fixed bottom-0 right-0 left-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95',
        sidebarAware && 'lg:left-[var(--admin-sidebar-offset)]',
        className
      )}
      style={
        sidebarAware
          ? { ['--admin-sidebar-offset' as string]: isSidebarCollapsed ? '80px' : '280px' }
          : undefined
      }
    >
      <div className="w-full px-3 sm:px-4 lg:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3 py-3">
          <div className="flex items-center gap-2">{leftActions}</div>
          <div className="flex items-center gap-3">{rightActions}</div>
        </div>
      </div>
    </div>
  );
}
