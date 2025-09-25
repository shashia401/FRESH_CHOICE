import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { Package, LogOut, User, Menu } from 'lucide-react';

interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 shadow-xl border-b border-emerald-800/20 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            {/* Mobile menu button */}
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-lg text-white hover:bg-white/20 transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm border border-white/30">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Fresh Choice</h1>
              <p className="text-xs text-emerald-100">Inventory Management</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-white">
              <User className="h-4 w-4 text-emerald-100" />
              <span className="font-medium">{user?.username}</span>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-white/20 border-white/30 text-white hover:bg-white/30"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};