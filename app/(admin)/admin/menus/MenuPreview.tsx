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
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [expandedMobileMenu, setExpandedMobileMenu] = React.useState<number | null>(null);

  // Chỉ hiển thị active menus
  const activeMenus = useMemo(() => 
    menus.filter(m => m.active).sort((a, b) => a.order - b.order),
    [menus]
  );

  const devices = [
    { id: 'desktop' as const, icon: Monitor, label: 'Desktop', width: '100%' },
    { id: 'tablet' as const, icon: Tablet, label: 'Tablet', width: '768px' },
    { id: 'mobile' as const, icon: Smartphone, label: 'Mobile', width: '375px' },
  ];

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
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Eye size={18} />
            Preview Header Menu
          </CardTitle>
          <div className="flex items-center gap-4">
            {/* Device Switcher */}
            <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              {devices.map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setDevice(id);
                    setMobileMenuOpen(false);
                    setExpandedMobileMenu(null);
                  }}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all',
                    device === id
                      ? 'bg-white dark:bg-slate-900 shadow-sm text-slate-900 dark:text-slate-100'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  )}
                  title={label}
                >
                  <Icon size={14} />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>

            {/* Stats */}
            <div className="text-xs text-slate-500 hidden sm:block">
              {activeMenus.length} menu • {activeMenus.reduce((acc, m) => acc + (m.blocks?.filter(b => b.active).length || 0), 0)} blocks
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Preview Container */}
        <div 
          className="mx-auto border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden shadow-lg transition-all duration-300"
          style={{ 
            maxWidth: device === 'desktop' ? '100%' : device === 'tablet' ? '768px' : '375px',
          }}
        >
          {/* Main Header Bar */}
          <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between px-4 py-3">
              {/* Logo */}
              <div className="flex items-center gap-2">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: BRAND_COLORS.accent }}
                >
                  W
                </div>
                {device !== 'mobile' && (
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: BRAND_COLORS.accent }}>
                    Wine Cellar
                  </span>
                )}
              </div>

              {/* Search (Desktop/Tablet only) */}
              {device !== 'mobile' && (
                <div className="flex-1 max-w-md mx-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Tìm kiếm sản phẩm..."
                      className="w-full pl-4 pr-16 py-2 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                      readOnly
                    />
                    <button 
                      className="absolute right-1 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-full text-xs font-bold text-black"
                      style={{ backgroundColor: BRAND_COLORS.accent }}
                    >
                      Tìm
                    </button>
                  </div>
                </div>
              )}

              {/* Mobile hamburger */}
              {device === 'mobile' && (
                <button 
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: BRAND_COLORS.highlight }}
                >
                  <div className="w-5 h-4 flex flex-col justify-between">
                    <span className={cn(
                      "w-full h-0.5 bg-white rounded transition-all",
                      mobileMenuOpen && "rotate-45 translate-y-1.5"
                    )} />
                    <span className={cn(
                      "w-full h-0.5 bg-white rounded transition-all",
                      mobileMenuOpen && "opacity-0"
                    )} />
                    <span className={cn(
                      "w-full h-0.5 bg-white rounded transition-all",
                      mobileMenuOpen && "-rotate-45 -translate-y-1.5"
                    )} />
                  </div>
                </button>
              )}

              {/* Contact button (Desktop only) */}
              {device === 'desktop' && (
                <button 
                  className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider"
                  style={{ backgroundColor: BRAND_COLORS.accent, color: BRAND_COLORS.base }}
                >
                  Liên hệ
                </button>
              )}
            </div>
          </div>

          {/* Navigation Bar */}
          <div 
            className="border-b shadow-sm"
            style={{ backgroundColor: BRAND_COLORS.accent }}
          >
            {device !== 'mobile' ? (
              // Desktop/Tablet Navigation
              <div className="px-4">
                <nav className="flex items-center justify-center gap-1 py-2 flex-wrap">
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
                          {hasBlocks && activeBlocks.length > 0 && (
                            <ChevronDown
                              size={12}
                              className={cn(
                                'transition-transform',
                                hoveredMenu === menu.id && 'rotate-180'
                              )}
                            />
                          )}
                        </button>

                        {/* Mega Dropdown */}
                        {hasBlocks && activeBlocks.length > 0 && hoveredMenu === menu.id && (
                          <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2 z-50">
                            <div className="bg-white rounded-lg shadow-xl border border-amber-200 p-4" style={{ minWidth: `${Math.min(activeBlocks.length * 180, 600)}px` }}>
                              <div
                                className="grid gap-6"
                                style={{
                                  gridTemplateColumns: `repeat(${Math.min(activeBlocks.length, 4)}, minmax(150px, 1fr))`,
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
                                        {activeItems.slice(0, 8).map((item) => (
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
                                        {activeItems.length > 8 && (
                                          <li className="text-[10px] text-slate-400 pl-1">
                                            +{activeItems.length - 8} more...
                                          </li>
                                        )}
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
              </div>
            ) : (
              // Mobile - collapsed nav
              <div className="px-4 py-2 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-black/80">
                  Menu
                </span>
                <span className="text-[10px] text-black/60">
                  {activeMenus.length} mục
                </span>
              </div>
            )}
          </div>

          {/* Mobile Menu Drawer */}
          {device === 'mobile' && mobileMenuOpen && (
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
              {activeMenus.map((menu) => {
                const activeBlocks = menu.blocks?.filter(b => b.active) || [];
                const hasBlocks = activeBlocks.length > 0;
                const isExpanded = expandedMobileMenu === menu.id;

                return (
                  <div key={menu.id} className="border-b border-slate-100 dark:border-slate-800 last:border-b-0">
                    <button
                      onClick={() => setExpandedMobileMenu(isExpanded ? null : menu.id)}
                      className="w-full px-4 py-3 flex items-center justify-between text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
                      <span>{menu.title}</span>
                      {hasBlocks && (
                        <ChevronDown
                          size={16}
                          className={cn('transition-transform', isExpanded && 'rotate-180')}
                        />
                      )}
                    </button>
                    {hasBlocks && isExpanded && (
                      <div className="bg-slate-50 dark:bg-slate-800/50 pb-2">
                        {activeBlocks.map((block) => {
                          const activeItems = block.items?.filter(i => i.active) || [];
                          return (
                            <div key={block.id} className="px-4 py-2">
                              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                                {block.title}
                              </div>
                              {activeItems.slice(0, 5).map((item) => (
                                <div key={item.id} className="text-xs text-slate-600 py-1 pl-2">
                                  {item.label}
                                </div>
                              ))}
                              {activeItems.length > 5 && (
                                <div className="text-[10px] text-slate-400 pl-2">
                                  +{activeItems.length - 5} more
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Content Placeholder */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 min-h-[120px]">
            <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center mb-3">
              <span className="text-slate-400 text-sm">Hero Banner</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-slate-200 dark:bg-slate-700 rounded" />
              ))}
            </div>
          </div>
        </div>

        {/* Help text */}
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
          <p className="text-xs text-blue-600 dark:text-blue-400">
            <strong>Tip:</strong> Hover vào các menu (Desktop/Tablet) để xem dropdown. 
            Trên Mobile, nhấn icon ≡ để mở menu.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
