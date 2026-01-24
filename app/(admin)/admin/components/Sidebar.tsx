'use client';

import React, { useState, useEffect, useCallback } from 'react';
 import Link from 'next/link';
 import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Package, FileText, 
  Globe, Settings, ChevronRight, X, LogOut,
  ChevronsLeft, ChevronsRight
} from 'lucide-react';
 import { cn } from '@/lib/utils';
 import { fetchSettings } from '@/lib/api/settings';
 
 interface SidebarItemProps {
   icon: React.ElementType;
   label: string;
   href: string;
   active: boolean;
   subItems?: { label: string; href: string }[];
   isCollapsed: boolean;
   isExpanded: boolean;
   onToggle: () => void;
   pathname: string;
 }
 
 const SidebarItem: React.FC<SidebarItemProps> = ({ 
   icon: Icon, 
   label, 
   href, 
   active, 
   subItems, 
   isCollapsed, 
   isExpanded, 
   onToggle,
   pathname
 }) => {
   const hasSub = subItems && subItems.length > 0;
 
   const handleClick = (e: React.MouseEvent) => {
     if (hasSub) {
       e.preventDefault();
       onToggle();
     }
   };
 
   return (
     <div className="mb-1 group relative">
       {hasSub ? (
         <button 
           onClick={handleClick}
           className={cn(
             "w-full flex items-center transition-all duration-200 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
             isCollapsed ? "justify-center p-3" : "justify-between px-3 py-2.5",
             active ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
           )}
           title={isCollapsed ? label : undefined}
           aria-label={label}
         >
           <div className={cn("flex items-center", isCollapsed ? "gap-0" : "gap-3")}>
             <Icon size={isCollapsed ? 22 : 20} className="shrink-0 transition-transform duration-200 group-hover:scale-105" />
             <span className={cn("text-sm font-medium whitespace-nowrap transition-all duration-300 origin-left", isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100")}>
               {label}
             </span>
           </div>
           {!isCollapsed && (
             <ChevronRight size={16} className={cn("transition-transform duration-200 opacity-70", isExpanded && "rotate-90")} />
           )}
         </button>
       ) : (
         <Link 
           href={href} 
           className={cn(
             "flex items-center transition-all duration-200 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
             isCollapsed ? "justify-center p-3" : "gap-3 px-3 py-2.5",
             active ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
           )}
           title={isCollapsed ? label : undefined}
         >
           <Icon size={isCollapsed ? 22 : 20} className="shrink-0 transition-transform duration-200 group-hover:scale-105" />
           <span className={cn("text-sm font-medium whitespace-nowrap transition-all duration-300 origin-left", isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100")}>
             {label}
           </span>
         </Link>
       )}
       
       {hasSub && (
         <div className={cn(
           "overflow-hidden transition-all duration-300 ease-in-out",
           isExpanded && !isCollapsed ? "max-h-[500px] opacity-100 mt-1" : "max-h-0 opacity-0"
         )}>
           <div className="ml-4 border-l-2 border-slate-100 dark:border-slate-800 pl-3 space-y-1 my-1">
             {subItems.map((sub) => (
               <Link 
                 key={sub.href} 
                 href={sub.href}
                 className={cn(
                   "block px-3 py-2 rounded-md text-sm transition-colors duration-150 truncate",
                   pathname === sub.href || pathname.startsWith(sub.href + '/')
                     ? "text-blue-600 bg-blue-500/5 font-medium dark:text-blue-400" 
                     : "text-slate-500 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                 )}
               >
                 {sub.label}
               </Link>
             ))}
           </div>
         </div>
       )}
     </div>
   );
 };
 
 interface SidebarProps {
   mobileMenuOpen: boolean;
   setMobileMenuOpen: (open: boolean) => void;
 }
 
 export const Sidebar: React.FC<SidebarProps> = ({ mobileMenuOpen, setMobileMenuOpen }) => {
   const [isCollapsed, setIsCollapsed] = useState(false);
   const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
   const [siteName, setSiteName] = useState<string>('Thương Hiệu');
   const pathname = usePathname();
 
  const isActive = useCallback((route: string) => pathname.startsWith(route), [pathname]);
 
  useEffect(() => {
    fetchSettings()
      .then((settings) => {
        if (settings.site_name) {
          setSiteName(settings.site_name);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (isActive('/admin/products') || isActive('/admin/categories') || isActive('/admin/product-types')) {
      setExpandedMenu('Sản phẩm');
    } else if (isActive('/admin/menus') || isActive('/admin/home-components') || isActive('/admin/social-links') || isActive('/admin/footer-config') || isActive('/admin/contact-config')) {
      setExpandedMenu('Website');
    } else if (isActive('/admin/settings')) {
      setExpandedMenu('Hệ thống');
    }
  }, [isActive]);
 
   const handleMenuToggle = (label: string) => {
     if (isCollapsed) {
       setIsCollapsed(false);
       setExpandedMenu(label);
     } else {
       setExpandedMenu(expandedMenu === label ? null : label);
     }
   };
 
   const navItems = [
     {
       section: '',
       items: [
         { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
         { 
           icon: Package, 
           label: 'Sản phẩm', 
           href: '/admin/products',
           subItems: [
             { label: 'Tất cả sản phẩm', href: '/admin/products' },
             { label: 'Danh mục', href: '/admin/categories' },
             { label: 'Nhóm sản phẩm', href: '/admin/product-types' },
             { label: 'Nhóm thuộc tính', href: '/admin/attribute-groups' },
           ]
         },
         { 
           icon: FileText, 
           label: 'Nội dung', 
           href: '/admin/articles',
           subItems: [
             { label: 'Bài viết', href: '/admin/articles' },
             { label: 'Thư viện ảnh', href: '/admin/images' },
           ]
         },
         { 
           icon: Globe, 
           label: 'Website', 
           href: '/admin/home-components',
           subItems: [
             { label: 'Trang chủ', href: '/admin/home-components' },
            { label: 'Menu', href: '/admin/menus' },
             { label: 'Mạng xã hội', href: '/admin/social-links' },
             { label: 'Cấu hình Liên hệ', href: '/admin/contact-config' },
             { label: 'Cấu hình Footer', href: '/admin/footer-config' },
           ]
         },
        { 
          icon: Settings, 
          label: 'Hệ thống', 
          href: '/admin/settings',
          subItems: [
            { label: 'Cấu hình chung', href: '/admin/settings' },
          ]
        },
       ]
     },
   ];
 
   return (
     <>
       {mobileMenuOpen && (
         <div 
           className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity duration-200"
           onClick={() => setMobileMenuOpen(false)}
         />
       )}
 
       <aside className={cn(
         "fixed lg:sticky top-0 left-0 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-50 transition-all duration-300 ease-in-out flex flex-col shadow-lg lg:shadow-none",
         isCollapsed ? "lg:w-[80px]" : "lg:w-[280px]",
         mobileMenuOpen ? "translate-x-0 w-[280px]" : "-translate-x-full lg:translate-x-0"
       )}>
         <div className={cn("h-16 flex items-center border-b border-slate-100 dark:border-slate-800 transition-all duration-300", isCollapsed ? "justify-center px-0" : "px-6 justify-between")}>
           <div className="flex items-center gap-3 overflow-hidden">
             <div className="w-9 h-9 bg-gradient-to-br from-amber-600 to-amber-500 rounded-xl flex items-center justify-center text-white shadow-md shrink-0">
               <span className="font-bold text-lg">{siteName.charAt(0).toUpperCase()}</span>
             </div>
             <span className={cn("font-bold text-xl text-slate-800 dark:text-slate-100 whitespace-nowrap transition-opacity duration-300", isCollapsed ? "opacity-0 w-0 hidden" : "opacity-100 w-auto")}>
               {siteName}
             </span>
           </div>
           <button className="lg:hidden" onClick={() => setMobileMenuOpen(false)} aria-label="Close menu">
             <X size={20} className="text-slate-500" />
           </button>
         </div>
 
         <div className="flex-1 py-6 px-3 space-y-6 overflow-y-auto admin-scrollbar">
           {navItems.map((section) => (
             <div key={section.section} className="space-y-1">
               {!isCollapsed && (
                 <div className="px-3 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                   {section.section}
                 </div>
               )}
               {section.items.map((item) => (
                 <SidebarItem
                   key={item.href}
                   icon={item.icon}
                   label={item.label}
                   href={item.href}
                   active={isActive(item.href)}
                   subItems={item.subItems}
                   isCollapsed={isCollapsed}
                   isExpanded={expandedMenu === item.label}
                   onToggle={() => handleMenuToggle(item.label)}
                   pathname={pathname}
                 />
               ))}
             </div>
           ))}
         </div>
 
         <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
           <button 
             onClick={() => setIsCollapsed(!isCollapsed)}
             className="hidden lg:flex items-center justify-center w-full h-9 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-blue-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-200"
             title={isCollapsed ? "Mở rộng" : "Thu gọn"}
             aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
           >
             {isCollapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
           </button>
 
           <div className={cn("flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-200 cursor-pointer", isCollapsed ? "justify-center" : "")}>
             <div className="relative">
               <div className="w-9 h-9 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 font-medium">
                 A
               </div>
               <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-slate-800"></div>
             </div>
             
             {!isCollapsed && (
               <div className="flex-1 overflow-hidden">
                 <div className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">Admin</div>
                 <div className="text-xs text-slate-500 dark:text-slate-400 truncate">admin@winecellar.com</div>
               </div>
             )}
             {!isCollapsed && <LogOut size={16} className="text-slate-400 hover:text-red-500 transition-colors duration-200" />}
           </div>
         </div>
       </aside>
     </>
   );
 };
