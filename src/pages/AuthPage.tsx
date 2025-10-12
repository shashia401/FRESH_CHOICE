import React, { useState } from 'react';
import { Package } from 'lucide-react';
import { LoginForm } from '../components/auth/LoginForm';
import { SignupForm } from '../components/auth/SignupForm';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  const toggleMode = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-600 via-teal-600 to-green-700 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }}></div>
      </div>
      
      <div className="w-full max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-2xl mb-4 sm:mb-6 backdrop-blur-lg border border-white/30 shadow-2xl">
            <Package className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 drop-shadow-lg">Fresh Choice</h1>
          <p className="text-emerald-100 text-base sm:text-lg">Inventory Management System</p>
          <div className="mt-4 sm:mt-6 bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
            <p className="text-xs sm:text-sm text-white font-medium mb-2">Demo Login Credentials:</p>
            <div className="space-y-1 text-xs text-emerald-100">
              <p>admin@freshchoice.com / admin123</p>
              <p>manager@freshchoice.com / manager123</p>
              <p>demo@freshchoice.com / demo123</p>
            </div>
          </div>
        </div>

        {isLogin ? (
          <LoginForm onToggleMode={toggleMode} />
        ) : (
          <SignupForm onToggleMode={toggleMode} />
        )}
      </div>
    </div>
  );
};