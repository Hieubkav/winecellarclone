 'use client';
 
import React, { useState, useEffect } from 'react';
 import { Sidebar } from './components/Sidebar';
 import { Header } from './components/Header';
import { Toaster } from 'sonner';
 
 function AdminLayoutContent({ children }: { children: React.ReactNode }) {
   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
   const [isDarkMode, setIsDarkMode] = useState(false);
 
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
