import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { clsx } from 'clsx';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  Users,
  Settings,
  FileText,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Inventory', href: '/inventory', icon: Package },
  { name: 'Shopping List', href: '/shopping-list', icon: ShoppingCart },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Vendors', href: '/vendors', icon: Users },
  { name: 'Invoices', href: '/invoices', icon: FileText },
  { name: 'Settings', href: '/settings', icon: Settings },
];

interface SidebarProps {
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={clsx(
      'bg-gradient-to-b from-emerald-50 to-teal-50 shadow-xl border-r border-emerald-200/50 h-screen backdrop-blur-sm transition-all duration-300 flex flex-col',
      // Mobile: full width, Desktop: responsive width
      'w-80 lg:w-64',
      isCollapsed && 'lg:w-16'
    )}>
      {/* Header with close/toggle buttons */}
      <div className="flex justify-between items-center p-4">
        {/* Mobile close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-emerald-100 transition-colors duration-200 text-emerald-600 hover:text-emerald-800"
            title="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        )}
        
        {/* Desktop toggle button */}
        <div className="hidden lg:block ml-auto">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-emerald-100 transition-colors duration-200 text-emerald-600 hover:text-emerald-800"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 pb-4">
        <div className="space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={onClose} // Close mobile menu when navigating
              className={({ isActive }) =>
                clsx(
                  'group flex items-center text-sm font-medium rounded-xl transition-all duration-300 transform hover:-translate-y-0.5',
                  isCollapsed && !onClose ? 'px-3 py-3 justify-center' : 'px-4 py-3',
                  isActive
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg border-r-4 border-emerald-800'
                    : 'text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 hover:shadow-md'
                )
              }
              title={(isCollapsed && !onClose) ? item.name : undefined}
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={clsx(
                      'h-5 w-5 flex-shrink-0',
                      (isCollapsed && !onClose) ? '' : 'mr-3',
                      isActive ? 'text-white' : 'text-emerald-500 group-hover:text-emerald-700'
                    )}
                  />
                  {(!isCollapsed || onClose) && (
                    <span className="truncate">{item.name}</span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Footer */}
      {(!isCollapsed || onClose) && (
        <div className="p-4 border-t border-emerald-200/50">
          <div className="text-xs text-emerald-600 text-center">
            <div className="font-medium">Fresh Choice</div>
            <div className="text-emerald-500">v1.0.0</div>
          </div>
        </div>
      )}
    </div>
  );
};