import React, { InputHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={clsx(
            'block w-full px-4 py-3 border-2 border-emerald-200 rounded-xl text-sm bg-emerald-50/30',
            'placeholder-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400',
            'transition-all duration-300 hover:border-emerald-300 focus:bg-white',
            error && 'border-red-300 focus:ring-red-500 bg-red-50/30',
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';