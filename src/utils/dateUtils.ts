import { format, isAfter, isBefore, addDays, parseISO } from 'date-fns';

export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'MMM dd, yyyy');
};

export const isExpiringSoon = (expirationDate: string, days: number = 3): boolean => {
  const expDate = parseISO(expirationDate);
  const threshold = addDays(new Date(), days);
  return isBefore(expDate, threshold) && isAfter(expDate, new Date());
};

export const isExpired = (expirationDate: string): boolean => {
  const expDate = parseISO(expirationDate);
  return isBefore(expDate, new Date());
};

export const getStockStatusColor = (remainingStock: number, threshold: number = 10): string => {
  if (remainingStock === 0) return 'text-red-600 bg-red-50';
  if (remainingStock <= threshold) return 'text-yellow-600 bg-yellow-50';
  return 'text-green-600 bg-green-50';
};

export const getExpirationStatusColor = (expirationDate: string): string => {
  if (!expirationDate) return 'text-gray-600 bg-gray-50';
  if (isExpired(expirationDate)) return 'text-red-600 bg-red-50';
  if (isExpiringSoon(expirationDate)) return 'text-yellow-600 bg-yellow-50';
  return 'text-green-600 bg-green-50';
};