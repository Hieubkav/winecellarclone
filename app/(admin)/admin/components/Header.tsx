 'use client';
 
 import React from 'react';
 import Link from 'next/link';
 import { usePathname } from 'next/navigation';
 import { Menu as MenuIcon, Search as SearchIcon, Sun, Moon, ChevronRight, Home } from 'lucide-react';
 import { cn } from '@/lib/utils';
 
 interface HeaderProps {
   isDarkMode: boolean;
   toggleTheme: () => void;
   setMobileMenuOpen: (open: boolean) => void;
 }
 
 export const Header: React.FC<HeaderProps> = ({ isDarkMode, toggleTheme, setMobileMenuOpen }) => {
   const pathname = usePathname();
 
   const getBreadcrumbs = () => {
     const segments = pathname.replace('/admin', '').split('/').filter(Boolean);
     return segments.map((segment, index, array) => {
       if (segment === 'dashboard' && index === 0) return null;
       const to = `/admin/${array.slice(0, index + 1).join('/')}`;
       const isLast = index === array.length - 1;
       const label = segment
         .replace(/-/g, ' ')
         .replace(/\b\w/g, (c) => c.toUpperCase());
       
       return { to, label, isLast };
     }).filter(Boolean);
   };
 
   const breadcrumbs = getBreadcrumbs();
 
   return (
     <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8 transition-colors duration-200">
       <div className="flex items-center gap-4">
         <button 
           className="lg:hidden p-2 -ml-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors duration-200" 
           onClick={() => setMobileMenuOpen(true)}
           aria-label="Open menu"
         >
           <MenuIcon size={24} />
         </button>
         
         <nav className="hidden md:flex items-center text-sm text-slate-500 dark:text-slate-400">
           <Link 
             href="/admin/dashboard" 
             className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
           >
             Home
           </Link>
           {breadcrumbs.map((item) => item && (
             <React.Fragment key={item.to}>
               <ChevronRight size={14} className="mx-2 text-slate-300 dark:text-slate-600" />
               <Link 
                 href={item.to} 
                 className={cn(
                   "hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200",
                   item.isLast && "font-medium text-slate-900 dark:text-slate-100"
                 )}
               >
                 {item.label}
               </Link>
             </React.Fragment>
           ))}
         </nav>
       </div>
 
       <div className="flex items-center gap-2">
         <div className="relative hidden md:block group">
           <SearchIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors duration-200" />
           <input 
             type="text" 
             placeholder="Tìm kiếm..." 
             className="pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 dark:text-slate-200 border border-transparent focus:border-blue-500/50 rounded-full text-sm w-64 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200"
           />
         </div>
         
         <Link
           href="/"
           target="_blank"
           className="p-2.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded-full transition-colors duration-200"
           title="Mở trang chủ"
           aria-label="Open homepage"
         >
           <Home size={20} />
         </Link>
         
         <button 
           onClick={toggleTheme}
           className="p-2.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
           title={isDarkMode ? "Chế độ sáng" : "Chế độ tối"}
           aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
         >
           {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
         </button>
       </div>
     </header>
   );
 };
