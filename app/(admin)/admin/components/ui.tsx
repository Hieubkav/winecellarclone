 import React from 'react';
import { cn } from '@/lib/utils';

// Re-export cn for convenience
export { cn };
 
 // Button
 export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
   variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
   size?: 'default' | 'sm' | 'lg' | 'icon';
 }
 
 export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
   ({ className, variant = 'default', size = 'default', ...props }, ref) => {
     return (
       <button
         ref={ref}
         className={cn(
           "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
           {
             "bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200": variant === 'default',
             "bg-red-500 text-white hover:bg-red-600": variant === 'destructive',
             "border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800": variant === 'outline',
             "bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-50 dark:hover:bg-slate-700": variant === 'secondary',
             "hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-50": variant === 'ghost',
             "text-blue-600 underline-offset-4 hover:underline dark:text-blue-400": variant === 'link',
             "h-10 px-4 py-2": size === 'default',
             "h-9 rounded-md px-3": size === 'sm',
             "h-11 rounded-md px-8": size === 'lg',
             "h-10 w-10": size === 'icon',
           },
           className
         )}
         {...props}
       />
     );
   }
 );
 Button.displayName = "Button";
 
 // Input
 export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
   ({ className, type, ...props }, ref) => {
     return (
       <input
         type={type}
         className={cn(
           "flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400 transition-colors duration-200",
           className
         )}
         ref={ref}
         {...props}
       />
     );
   }
 );
 Input.displayName = "Input";
 
 // Label
 export const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
   ({ className, ...props }, ref) => (
     <label
       ref={ref}
       className={cn("text-sm font-medium leading-none text-slate-700 dark:text-slate-300", className)}
       {...props}
     />
   )
 );
 Label.displayName = "Label";
 
 // Badge
 export const Badge = ({ 
   children, 
   variant = "default", 
   className 
 }: { 
   children?: React.ReactNode; 
   variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info'; 
   className?: string;
 }) => {
   return (
     <div className={cn(
       "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors duration-200",
       {
         "border-transparent bg-slate-900 text-white dark:bg-slate-50 dark:text-slate-900": variant === 'default',
         "border-transparent bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50": variant === 'secondary',
         "border-transparent bg-red-500 text-white": variant === 'destructive',
         "text-slate-700 dark:text-slate-300": variant === 'outline',
         "border-transparent bg-green-500 text-white": variant === 'success',
         "border-transparent bg-amber-500 text-white": variant === 'warning',
         "border-transparent bg-blue-500 text-white": variant === 'info',
       },
       className
     )}>
       {children}
     </div>
   );
 };
 
 // Card
 export const Card = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
   <div className={cn("rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900", className)} {...props}>{children}</div>
 );
 
 export const CardHeader = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
   <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props}>{children}</div>
 );
 
 export const CardTitle = ({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
   <h3 className={cn("text-lg font-semibold leading-none tracking-tight text-slate-900 dark:text-slate-100", className)} {...props}>{children}</h3>
 );
 
 export const CardContent = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
   <div className={cn("p-6 pt-0", className)} {...props}>{children}</div>
 );
 
 // Table
 export const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
   ({ className, ...props }, ref) => (
     <div className="relative w-full overflow-auto admin-scrollbar">
       <table ref={ref} className={cn("w-full caption-bottom text-sm", className)} {...props} />
     </div>
   )
 );
 Table.displayName = "Table";
 
 export const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
   ({ className, ...props }, ref) => (
     <thead ref={ref} className={cn("[&_tr]:border-b dark:[&_tr]:border-slate-800", className)} {...props} />
   )
 );
 TableHeader.displayName = "TableHeader";
 
 export const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
   ({ className, ...props }, ref) => (
     <tbody ref={ref} className={cn("[&_tr:last-child]:border-0", className)} {...props} />
   )
 );
 TableBody.displayName = "TableBody";
 
 export const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
   ({ className, ...props }, ref) => (
     <tr ref={ref} className={cn("border-b border-slate-200 dark:border-slate-800 transition-colors duration-150 hover:bg-slate-50 dark:hover:bg-slate-800/50", className)} {...props} />
   )
 );
 TableRow.displayName = "TableRow";
 
 export const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
   ({ className, ...props }, ref) => (
     <th ref={ref} className={cn("h-12 px-4 text-left align-middle font-medium text-slate-500 dark:text-slate-400", className)} {...props} />
   )
 );
 TableHead.displayName = "TableHead";
 
 export const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
   ({ className, ...props }, ref) => (
     <td ref={ref} className={cn("p-4 align-middle text-slate-700 dark:text-slate-300", className)} {...props} />
   )
 );
 TableCell.displayName = "TableCell";
 
 // Skeleton
 export const Skeleton = ({ className }: { className?: string }) => (
   <div className={cn("admin-skeleton rounded-md", className)} />
 );
