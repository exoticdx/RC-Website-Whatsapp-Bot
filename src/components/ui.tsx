import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export function Button({ className, variant = 'primary', size = 'md', ...props }: ButtonProps) {
  const variants = {
    primary: 'bg-zinc-900 text-white hover:bg-zinc-800 shadow-sm active:scale-95',
    secondary: 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200 active:scale-95',
    outline: 'border-2 border-zinc-200 bg-transparent hover:bg-zinc-50 hover:border-zinc-300 text-zinc-800 active:scale-95',
    danger: 'bg-red-500 text-white hover:bg-red-600 shadow-sm active:scale-95',
    ghost: 'bg-transparent text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 active:scale-95',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs font-semibold rounded-lg',
    md: 'px-4 py-2 text-sm font-semibold rounded-xl',
    lg: 'px-6 py-3 text-base font-semibold rounded-xl',
    icon: 'p-2 rounded-xl flex items-center justify-center',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={cn(
        'bg-white border border-zinc-100 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]', 
        className
      )} 
      {...props} 
    />
  );
}

export function Badge({ children, className, variant = 'default' }: { children: React.ReactNode, className?: string, variant?: 'default' | 'success' | 'danger' }) {
  const variants = {
    default: 'bg-zinc-100 text-zinc-800',
    success: 'bg-emerald-100 text-emerald-800',
    danger: 'bg-red-100 text-red-800'
  };
  
  return (
    <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide uppercase', variants[variant], className)}>
      {children}
    </span>
  );
}
