import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Trash2, Package } from 'lucide-react';
import { InventoryItem } from '../../types';
import { formatDate, getStockStatusColor, getExpirationStatusColor } from '../../utils/dateUtils';
import { clsx } from 'clsx';
import { settingsApi } from '../../utils/api';

interface InventoryTableProps {
  items: InventoryItem[];
  onEdit: (item: InventoryItem) => void;
  onDelete: (id: number) => void;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({
  items,
  onEdit,
  onDelete,
}) => {
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settingsData = await settingsApi.getSettings();
        setSettings(settingsData);
      } catch (error) {
        console.error('Error loading settings:', error);
        // Use default settings if API fails
        setSettings({
          low_stock_threshold: { value: 10 },
          expiration_warning_days: { value: 3 }
        });
      }
    };
    loadSettings();
  }, []);

  const getStockBadge = (stock: number) => {
    const lowStockThreshold = settings?.low_stock_threshold?.value || 10;
    
    if (stock === 0) return <Badge variant="danger" size="sm">Out of Stock</Badge>;
    if (stock <= lowStockThreshold) return <Badge variant="warning" size="sm">Low Stock</Badge>;
    return <Badge variant="success" size="sm">In Stock</Badge>;
  };

  const getExpirationBadge = (expirationDate?: string) => {
    if (!expirationDate) return null;
    
    const today = new Date();
    const expiry = new Date(expirationDate);
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const warningDays = settings?.expiration_warning_days?.value || 3;
    
    if (daysUntilExpiry < 0) return <Badge variant="danger" size="sm">Expired</Badge>;
    if (daysUntilExpiry <= warningDays) return <Badge variant="warning" size="sm">Expires Soon</Badge>;
    return <Badge variant="success" size="sm">Fresh</Badge>;
  };

  const handleDeleteClick = (id: number) => {
    setDeleteConfirm(id);
  };

  const handleConfirmDelete = (id: number) => {
    onDelete(id);
    setDeleteConfirm(null);
  };

  const handleCancelDelete = () => {
    setDeleteConfirm(null);
  };

  return (
    <>
      {/* Desktop Table View */}
      <Card className="hidden lg:block">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category/Brand
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expiration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                  onClick={() => onEdit(item)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="bg-gray-100 p-2 rounded-lg mr-3">
                        <Package className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.description}</div>
                        <div className="text-sm text-gray-500">
                          {item.item_sku && `SKU: ${item.item_sku}`}
                          {item.item_sku && item.item_upc && ' • '}
                          {item.item_upc && `UPC: ${item.item_upc}`}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{item.category}</div>
                    <div className="text-sm text-gray-500">{item.brand}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className={clsx(
                        'text-lg font-bold px-2 py-1 rounded',
                        getStockStatusColor(item.remaining_stock)
                      )}>
                        {item.remaining_stock}
                      </span>
                      {getStockBadge(item.remaining_stock)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Shipped: {item.qty_shipped}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {item.aisle && `Aisle ${item.aisle}`}
                      {item.aisle && item.row && `, Row ${item.row}`}
                      {item.bin && `, Bin ${item.bin}`}
                    </div>
                    {item.location && (
                      <div className="text-xs text-gray-500">{item.location}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.expiration_date ? (
                      <div>
                        <div className="text-sm text-gray-900">
                          {formatDate(item.expiration_date)}
                        </div>
                        {getExpirationBadge(item.expiration_date)}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">No expiry</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(item.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-3">
        {items.map((item) => (
          <Card
            key={item.id}
            className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => onEdit(item)}
          >
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="bg-emerald-100 p-2 rounded-lg">
                    <Package className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">{item.description}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {item.category} {item.brand && `• ${item.brand}`}
                    </p>
                  </div>
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(item.id);
                  }}
                  className="ml-2"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Stock Info */}
              <div className="flex items-center justify-between py-2 border-t border-gray-100">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">Stock:</span>
                  <span className={clsx(
                    'text-base font-bold px-2 py-0.5 rounded',
                    getStockStatusColor(item.remaining_stock)
                  )}>
                    {item.remaining_stock}
                  </span>
                  {getStockBadge(item.remaining_stock)}
                </div>
                <div className="text-xs text-gray-500">
                  Shipped: {item.qty_shipped}
                </div>
              </div>

              {/* Location & Expiration */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-500 font-medium">Location:</span>
                  <div className="text-gray-900 mt-0.5">
                    {item.aisle ? (
                      <>
                        {item.aisle && `A${item.aisle}`}
                        {item.row && ` R${item.row}`}
                        {item.bin && ` B${item.bin}`}
                      </>
                    ) : (
                      <span className="text-gray-400">Not set</span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 font-medium">Expiration:</span>
                  <div className="mt-0.5">
                    {item.expiration_date ? (
                      <div className="space-y-1">
                        <div className="text-gray-900">{formatDate(item.expiration_date)}</div>
                        {getExpirationBadge(item.expiration_date)}
                      </div>
                    ) : (
                      <span className="text-gray-400">No expiry</span>
                    )}
                  </div>
                </div>
              </div>

              {/* SKU/UPC */}
              {(item.item_sku || item.item_upc) && (
                <div className="pt-2 border-t border-gray-100 text-xs text-gray-500">
                  {item.item_sku && `SKU: ${item.item_sku}`}
                  {item.item_sku && item.item_upc && ' • '}
                  {item.item_upc && `UPC: ${item.item_upc}`}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-red-100 p-2 rounded-lg">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete Item</h3>
                  <p className="text-sm text-gray-600">This action cannot be undone</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete this item from your inventory? This will permanently remove all associated data.
              </p>
              
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleCancelDelete}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  className="flex-1"
                  onClick={() => handleConfirmDelete(deleteConfirm)}
                >
                  Delete Item
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
