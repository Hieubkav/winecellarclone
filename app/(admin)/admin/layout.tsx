 'use client';
 
import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
 import { Sidebar } from './components/Sidebar';
 import { Header } from './components/Header';
import { Toaster } from 'sonner';
import { verifySession } from '@/lib/admin-auth';
 
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

       const isValid = await verifySession();

       if (cancelled) {
         return;
       }

       if (!isValid) {
         router.replace('/admin/login');
         return;
       }

       setAuthChecked(true);
     };

     void checkSession();

     return () => {
       cancelled = true;
     };
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

   useEffect(() => {
     const originalFetch = window.fetch.bind(window);

     window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
       const requestUrl = typeof input === 'string'
         ? input
         : input instanceof URL
           ? input.toString()
           : input.url;

       const shouldAttachAdminToken = requestUrl.includes('/v1/admin/');

       if (!shouldAttachAdminToken) {
         return originalFetch(input, init);
       }

       const token = window.localStorage.getItem('admin_access_token');
       const headers = new Headers(init?.headers ?? (input instanceof Request ? input.headers : undefined));

       if (token && !headers.has('Authorization')) {
         headers.set('Authorization', `Bearer ${token}`);
       }

       return originalFetch(input, {
         ...init,
         headers,
       });
     };

     return () => {
       window.fetch = originalFetch;
     };
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
