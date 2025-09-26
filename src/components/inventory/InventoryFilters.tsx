import React, { useState, useEffect } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Search, Filter, Package } from 'lucide-react';
import { settingsApi } from '../../utils/api';

interface InventoryFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
}

export const InventoryFilters: React.FC<InventoryFiltersProps> = ({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedStatus,
  onStatusChange
}) => {
  const [categories, setCategories] = useState<string[]>(['All']);
  const statuses = ['All', 'In Stock', 'Low Stock', 'Out of Stock', 'Expiring Soon'];

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await settingsApi.getCategories();
        setCategories(['All', ...categoriesData]);
      } catch (error) {
        console.error('Error loading categories:', error);
        // Fallback to default categories if API fails
        setCategories(['All', 'Dairy', 'Produce', 'Bakery', 'Meat', 'Beverages', 'Pantry']);
      }
    };
    loadCategories();
  }, []);

  return (
    <div className="bg-gradient-to-r from-white to-emerald-50/50 rounded-2xl shadow-lg border-2 border-emerald-100 p-6 mb-6 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-500 h-5 w-5" />
            <Input
              placeholder="Search items, SKU, or UPC..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-12 bg-white/80 border-2 border-emerald-200 focus:border-emerald-400"
            />
          </div>
        </div>
        
        <div className="flex gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="px-4 py-3 border-2 border-emerald-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400 bg-white/80 hover:border-emerald-300 transition-colors"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category === 'All' ? 'All Categories' : category}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="px-4 py-3 border-2 border-emerald-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400 bg-white/80 hover:border-emerald-300 transition-colors"
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <Button variant="outline" size="md" className="border-2 border-emerald-300 text-emerald-700 hover:bg-emerald-100">
            <Filter className="h-4 w-4 mr-2 text-emerald-600" />
            Filters
          </Button>
        </div>
      </div>
    </div>
  );
};
