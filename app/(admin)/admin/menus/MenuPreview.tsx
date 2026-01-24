'use client';

import React, { useMemo } from 'react';
import { ChevronDown, Monitor, Tablet, Smartphone, Eye } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, cn } from '../components/ui';
import type { AdminMenuDetail } from '@/lib/api/admin';

interface MenuPreviewProps {
  menus: AdminMenuDetail[];
}

type DeviceType = 'desktop' | 'tablet' | 'mobile';

// Brand colors từ Header.tsx
const BRAND_COLORS = {
  base: '#1C1C1C',
  accent: '#ECAA4D',
  highlight: '#9B2C3B',
};

export function MenuPreview({ menus }: MenuPreviewProps) {
  const [device, setDevice] = React.useState<DeviceType>('desktop');
  const [hoveredMenu, setHoveredMenu] = React.useState<number | null>(null);

  // Chỉ hiển thị active menus
  const activeMenus = useMemo(() => 
    menus.filter(m => m.active).sort((a, b) => a.order - b.order),
    [menus]
  );

  const devices = [
    { id: 'desktop' as const, icon: Monitor, label: 'Desktop' },
    { id: 'tablet' as const, icon: Tablet, label: 'Tablet' },
    { id: 'mobile' as const, icon: Smartphone, label: 'Mobile' },
  ];

  const deviceWidths = {
    desktop: 'w-full',
    tablet: 'w-[768px] max-w-full',
    mobile: 'w-[375px] max-w-full',
  };

  if (activeMenus.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Eye className="w-12 h-12 mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
            Không có menu hiển thị
          </h3>
          <p className="text-slate-500 text-sm">
            Bật hiển thị ít nhất 1 menu để xem preview
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Eye size={18} />
            Preview Header Menu
          </CardTitle>
          <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            {devices.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setDevice(id)}
                className={cn(
                  'px-2 py-1.5 rounded-md text-xs font-medium flex items-center gap-1 transition-all',
                  device === id
                    ? 'bg-white dark:bg-slate-900 shadow-sm text-slate-900 dark:text-slate-100'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                )}
                title={label}
              >
                <Icon size={14} />
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className={cn(
          'mx-auto border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden shadow-sm',
          deviceWidths[device]
        )}>
          {/* Header Bar */}
          <div 
            className="border-b shadow-sm"
            style={{ backgroundColor: BRAND_COLORS.accent }}
          >
            <div className="mx-auto max-w-7xl px-4">
              {device !== 'mobile' ? (
                // Desktop/Tablet Navigation
                <nav className="flex items-center justify-center gap-1 py-2">
                  {activeMenus.map((menu) => {
                    const hasBlocks = menu.blocks && menu.blocks.length > 0;
                    const activeBlocks = menu.blocks?.filter(b => b.active) || [];

                    return (
                      <div
                        key={menu.id}
                        className="relative group"
                        onMouseEnter={() => setHoveredMenu(menu.id)}
                        onMouseLeave={() => setHoveredMenu(null)}
                      >
                        <button
                          className={cn(
                            'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all',
                            hoveredMenu === menu.id
                              ? 'bg-black/10 text-black'
                              : 'text-black/80 hover:bg-black/5 hover:text-black'
                          )}
                        >
                          <span>{menu.title}</span>
                          {hasBlocks && (
                            <ChevronDown
                              size={12}
                              className={cn(
                                'transition-transform',
                                hoveredMenu === menu.id && 'rotate-180'
                              )}
                            />
                          )}
                        </button>

                        {/* Dropdown Menu */}
                        {hasBlocks && hoveredMenu === menu.id && (
                          <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2 z-50">
                            <div className="bg-white rounded-lg shadow-xl border border-amber-200 p-4 min-w-[500px]">
                              <div
                                className="grid gap-6"
                                style={{
                                  gridTemplateColumns: `repeat(${Math.min(activeBlocks.length, 4)}, minmax(0, 1fr))`,
                                }}
                              >
                                {activeBlocks.map((block, idx) => {
                                  const activeItems = block.items?.filter(i => i.active) || [];
                                  if (activeItems.length === 0) return null;

                                  return (
                                    <div
                                      key={block.id}
                                      className={cn(idx > 0 && 'border-l border-amber-200 pl-4')}
                                    >
                                      <h4
                                        className="text-xs font-bold uppercase tracking-wider mb-2"
                                        style={{ color: BRAND_COLORS.accent }}
                                      >
                                        {block.title}
                                      </h4>
                                      <ul className="space-y-1">
                                        {activeItems.map((item) => (
                                          <li key={item.id}>
                                            <span className="block text-xs text-slate-600 hover:text-black transition-colors cursor-pointer py-0.5 px-1 rounded hover:bg-amber-50">
                                              {item.badge && (
                                                <span
                                                  className="mr-1 inline-block rounded px-1 py-0.5 text-[10px] font-bold text-white"
                                                  style={{ backgroundColor: BRAND_COLORS.highlight }}
                                                >
                                                  {item.badge}
                                                </span>
                                              )}
                                              {item.label}
                                            </span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </nav>
              ) : (
                // Mobile - Just show hamburger placeholder
                <div className="flex items-center justify-between py-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-black">
                    Menu
                  </span>
                  <div className="w-5 h-4 flex flex-col justify-between">
                    <span className="w-full h-0.5 bg-black rounded" />
                    <span className="w-full h-0.5 bg-black rounded" />
                    <span className="w-full h-0.5 bg-black rounded" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Content placeholder */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 min-h-[100px]">
            <div className="h-16 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center">
              <span className="text-slate-400 text-xs">Content Area</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
          <span>
            {activeMenus.length} menu • {activeMenus.reduce((acc, m) => acc + (m.blocks?.filter(b => b.active).length || 0), 0)} blocks • {activeMenus.reduce((acc, m) => acc + (m.blocks?.reduce((a, b) => a + (b.items?.filter(i => i.active).length || 0), 0) || 0), 0)} items hiển thị
          </span>
          <span>
            {device === 'desktop' && '1920px'}
            {device === 'tablet' && '768px'}
            {device === 'mobile' && '375px'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
