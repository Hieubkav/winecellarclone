 'use client';
 
import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
 import { Sidebar } from './components/Sidebar';
 import { Header } from './components/Header';
import { Toaster } from 'sonner';
import { isAuthenticated } from '@/lib/admin-auth';
 
 function AdminLayoutContent({ children }: { children: React.ReactNode }) {
   const pathname = usePathname();
   const router = useRouter();
   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
   const [isDarkMode, setIsDarkMode] = useState(false);
   const [authChecked, setAuthChecked] = useState(false);

   const isLoginPage = pathname === '/admin/login';

   useEffect(() => {
     if (!isLoginPage && !isAuthenticated()) {
       router.replace('/admin/login');
     } else {
       setAuthChecked(true);
     }
   }, [pathname, router, isLoginPage]);

   useEffect(() => {
     const isDark = localStorage.getItem('admin-theme') === 'dark' || 
       (!localStorage.getItem('admin-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
     setIsDarkMode(isDark);
     if (isDark) {
       document.documentElement.classList.add('dark');
     } else {
       document.documentElement.classList.remove('dark');
     }
   }, []);
 
   const toggleTheme = () => {
     const newMode = !isDarkMode;
     setIsDarkMode(newMode);
     localStorage.setItem('admin-theme', newMode ? 'dark' : 'light');
     if (newMode) {
       document.documentElement.classList.add('dark');
     } else {
       document.documentElement.classList.remove('dark');
     }
   };
 
   if (isLoginPage) {
     return (
       <>
         <Toaster position="top-right" richColors closeButton />
         {children}
       </>
     );
   }

   if (!authChecked) {
     return (
       <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
       </div>
     );
   }

   return (
     <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 flex font-sans admin-theme">
       <Toaster position="top-right" richColors closeButton />
       <Sidebar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
 
       <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
         <Header 
           isDarkMode={isDarkMode} 
           toggleTheme={toggleTheme} 
           setMobileMenuOpen={setMobileMenuOpen} 
         />
 
         <main className="flex-1 p-4 lg:p-8 overflow-x-hidden w-full max-w-[1600px] mx-auto">
           {children}
         </main>
       </div>
     </div>
   );
 }
 
 export default function AdminLayout({ children }: { children: React.ReactNode }) {
   return <AdminLayoutContent>{children}</AdminLayoutContent>;
 }
