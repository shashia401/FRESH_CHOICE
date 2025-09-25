import React, { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import { AuthPage } from '../pages/AuthPage';

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return <AuthPage />;
  }

  return <>{children}</>;
};