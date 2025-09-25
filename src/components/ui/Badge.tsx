import React, { ReactNode } from 'react';
import { clsx } from 'clsx';

interface BadgeProps {
  children: ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral', size = 'md' }) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full px-2.5 py-0.5';
  
  const variantClasses = {
    success: 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border border-emerald-200 shadow-sm',
    warning: 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border border-amber-200 shadow-sm',
    danger: 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-200 shadow-sm',
    info: 'bg-gradient-to-r from-teal-100 to-cyan-100 text-teal-800 border border-teal-200 shadow-sm',
    neutral: 'bg-gradient-to-r from-slate-100 to-gray-100 text-slate-800 border border-slate-200 shadow-sm'
  };

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm'
  };

  return (
    <span className={clsx(baseClasses, variantClasses[variant], sizeClasses[size])}>
      {children}
    </span>
  );
};