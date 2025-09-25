import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color: 'emerald' | 'blue' | 'yellow' | 'red';
  subtitle?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  color,
  subtitle,
  onClick
}) => {
  const colorClasses = {
    emerald: 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg',
    blue: 'bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-lg',
    yellow: 'bg-gradient-to-br from-amber-500 to-yellow-500 text-white shadow-lg',
    red: 'bg-gradient-to-br from-red-500 to-rose-500 text-white shadow-lg'
  };

  return (
    <Card 
      hover 
      className={`relative overflow-hidden bg-gradient-to-br from-white to-emerald-50/30 border-2 border-emerald-100 group transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:scale-105 hover:shadow-xl' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-emerald-700">{title}</p>
          <p className="text-3xl font-bold text-emerald-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-emerald-600 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-4 rounded-2xl ${colorClasses[color]} transform hover:scale-105 transition-transform duration-200`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      
      {trend && (
        <div className="mt-4 flex items-center">
          <Badge variant={trend.isPositive ? 'success' : 'danger'} size="sm">
            {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
          </Badge>
          <span className="text-xs text-gray-500 ml-2">vs last week</span>
        </div>
      )}
      
      <div className={`absolute bottom-0 left-0 w-full h-2 ${colorClasses[color]} opacity-60`} />
      
      {onClick && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-white/80 rounded-full p-1">
            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      )}
    </Card>
  );
};