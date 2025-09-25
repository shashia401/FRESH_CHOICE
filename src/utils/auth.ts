import { User } from '../types';

export const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem('auth_token');
};

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('current_user');
  return userStr ? JSON.parse(userStr) : null;
};

export const setCurrentUser = (user: User): void => {
  localStorage.setItem('current_user', JSON.stringify(user));
};

export const removeCurrentUser = (): void => {
  localStorage.removeItem('current_user');
};

export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

export const logout = (): void => {
  removeAuthToken();
  removeCurrentUser();
};