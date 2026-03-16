 'use client';
 
import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
 import { Sidebar } from './components/Sidebar';
 import { Header } from './components/Header';
import { Toaster } from 'sonner';
import { verifySession } from '@/lib/admin-auth';
 
 const AUTH_CACHE_KEY = 'admin_auth_verified_at';
 const AUTH_CACHE_TTL_MS = 2 * 60 * 1000;

 function AdminLayoutContent({ children }: { children: React.ReactNode }) {
   const pathname = usePathname();
   const router = useRouter();
   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
   const [isDarkMode, setIsDarkMode] = useState(false);
   const [authChecked, setAuthChecked] = useState(false);

   const isLoginPage = pathname === '/admin/login';

   useEffect(() => {
     let cancelled = false;

     const checkSession = async () => {
       if (isLoginPage) {
         if (!cancelled) {
           setAuthChecked(true);
         }
         return;
       }

       const token = window.localStorage.getItem('admin_access_token');

       if (!token) {
         router.replace('/admin/login');
         return;
       }

       const cachedAt = window.sessionStorage.getItem(AUTH_CACHE_KEY);
       const cachedTime = cachedAt ? Number(cachedAt) : 0;

       if (cachedTime && Date.now() - cachedTime < AUTH_CACHE_TTL_MS) {
         setAuthChecked(true);
         return;
       }

       const isValid = await verifySession();

       if (cancelled) {
         return;
       }

       if (!isValid) {
         router.replace('/admin/login');
         return;
       }

       window.sessionStorage.setItem(AUTH_CACHE_KEY, String(Date.now()));
       setAuthChecked(true);
     };

     void checkSession();

     return () => {
       cancelled = true;
     };
   }, [router, isLoginPage]);

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
