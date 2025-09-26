import React, { useState } from 'react';
import { Card, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { X, Download, FileSpreadsheet, Calendar, Package, AlertTriangle, TrendingUp, Users, Trash2, BarChart3, ShoppingCart } from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { InventoryItem } from '../../types';
import { settingsApi } from '../../utils/api';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventoryItems: InventoryItem[];
}

interface ExportOption {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  selected: boolean;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, inventoryItems }) => {
  const [exportOptions, setExportOptions] = useState<ExportOption[]>([
    {
      id: 'total_items',
      title: 'All Inventory Items',
      description: 'Complete inventory with all details',
      icon: Package,
      color: 'emerald',
      selected: true
    },
    {
      id: 'low_stock',
      title: 'Low Stock Items',
      description: 'Items with stock below threshold',
      icon: AlertTriangle,
      color: 'yellow',
      selected: false
    },
    {
      id: 'expiring_soon',
      title: 'Expiring Items',
      description: 'Items expiring within 3 days',
      icon: Calendar,
      color: 'red',
      selected: false
    },
    {
      id: 'sales_analysis',
      title: 'Sales Analysis',
      description: 'Top performing products',
      icon: TrendingUp,
      color: 'blue',
      selected: false
    },
    {
      id: 'vendors',
      title: 'Vendor Information',
      description: 'Vendor details and relationships',
      icon: Users,
      color: 'purple',
      selected: false
    },
    {
      id: 'waste_tracker',
      title: 'Waste Tracker',
      description: 'Expired and wasted items',
      icon: Trash2,
      color: 'red',
      selected: false
    },
    {
      id: 'consumption_trends',
      title: 'Consumption Trends',
      description: 'Usage patterns and forecasts',
      icon: BarChart3,
      color: 'green',
      selected: false
    },
    {
      id: 'vendor_margins',
      title: 'Vendor Margins',
      description: 'Profit analysis by vendor',
      icon: TrendingUp,
      color: 'indigo',
      selected: false
    },
    {
      id: 'shopping_list',
      title: 'Shopping List',
      description: 'Items needed for restocking',
      icon: ShoppingCart,
      color: 'teal',
      selected: false
    }
  ]);

  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'xlsx' | 'csv'>('xlsx');

  const toggleOption = (id: string) => {
    setExportOptions(options =>
      options.map(option =>
        option.id === id ? { ...option, selected: !option.selected } : option
      )
    );
  };

  const selectAll = () => {
    setExportOptions(options =>
      options.map(option => ({ ...option, selected: true }))
    );
  };

  const selectNone = () => {
    setExportOptions(options =>
      options.map(option => ({ ...option, selected: false }))
    );
  };

  const getFilteredItems = async (type: string): Promise<any[]> => {
    try {
      switch (type) {
        case 'total_items':
          return inventoryItems.map(item => ({
            'ID': item.id,
            'Description': item.description,
            'Category': item.category,
            'Brand': item.brand,
            'Department': item.department,
            'SKU': item.item_sku,
            'UPC': item.item_upc,
            'Pack Size': item.pack_size,
            'Qty Shipped': item.qty_shipped,
            'Current Stock': item.remaining_stock,
            'Weekly Sales': item.sales_weekly,
            'Location': item.location,
            'Aisle': item.aisle,
            'Row': item.row,
            'Bin': item.bin,
            'Expiration Date': item.expiration_date,
            'Unit Cost': item.unit_cost,
            'Vendor Cost': item.vendor_cost,
            'Customer Cost': item.cust_cost_each,
            'Retail Price': item.unit_retail,
            'Gross Margin': item.gross_margin,
            'Advertising': item.advertising_flag,
            'Order Type': item.order_type,
            'Vendor ID': item.vendor_id,
            'Created At': item.created_at,
            'Updated At': item.updated_at
          }));

        case 'low_stock':
          // Get settings to determine low stock threshold
          const settings = await settingsApi.getSettings();
          const lowStockThreshold = settings.low_stock_threshold?.value || 10;
          
          return inventoryItems
            .filter(item => item.remaining_stock <= lowStockThreshold && item.remaining_stock > 0)
            .map(item => ({
              'Description': item.description,
              'Category': item.category,
              'Current Stock': item.remaining_stock,
              'Weekly Sales': item.sales_weekly,
              'Location': `${item.aisle || ''} ${item.row || ''} ${item.bin || ''}`.trim(),
              'Suggested Reorder': Math.max(item.sales_weekly * 2, 20), // Will be enhanced with real API
              'Priority': item.remaining_stock <= 5 ? 'High' : 'Medium' // Will be enhanced with real API
            }));

        case 'expiring_soon':
          // Get settings to determine expiration warning days
          const expSettings = await settingsApi.getSettings();
          const warningDays = expSettings.expiration_warning_days?.value || 3;
          
          return inventoryItems
            .filter(item => {
              if (!item.expiration_date) return false;
              const expiry = new Date(item.expiration_date);
              const today = new Date();
              const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
              return daysUntilExpiry <= warningDays && daysUntilExpiry >= 0;
            })
            .map(item => ({
              'Description': item.description,
              'Category': item.category,
              'Current Stock': item.remaining_stock,
              'Expiration Date': item.expiration_date,
              'Days Until Expiry': Math.ceil((new Date(item.expiration_date!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
              'Value at Risk': (item.remaining_stock * (item.unit_cost || 0)).toFixed(2),
              'Action Required': 'Discount/Donate'
            }));

        case 'sales_analysis':
          return inventoryItems
            .sort((a, b) => b.sales_weekly - a.sales_weekly)
            .slice(0, 50)
            .map((item, index) => ({
              'Rank': index + 1,
              'Description': item.description,
              'Category': item.category,
              'Weekly Sales': item.sales_weekly,
              'Current Stock': item.remaining_stock,
              'Revenue': (item.sales_weekly * (item.unit_retail || 0)).toFixed(2),
              'Profit': (item.sales_weekly * ((item.unit_retail || 0) - (item.unit_cost || 0))).toFixed(2),
              'Stock Days': item.sales_weekly > 0 ? Math.floor(item.remaining_stock / item.sales_weekly * 7) : 'N/A'
            }));

        case 'vendors':
          const vendorData = inventoryItems.reduce((acc, item) => {
            const vendorId = item.vendor_id || 1;
            if (!acc[vendorId]) {
              acc[vendorId] = {
                'Vendor ID': vendorId,
                'Items Count': 0,
                'Total Stock Value': 0,
                'Average Cost': 0,
                'Average Retail': 0,
                'Total Costs': 0,
                'Total Retail': 0
              };
            }
            acc[vendorId]['Items Count']++;
            acc[vendorId]['Total Stock Value'] += item.remaining_stock * (item.unit_cost || 0);
            acc[vendorId]['Total Costs'] += item.unit_cost || 0;
            acc[vendorId]['Total Retail'] += item.unit_retail || 0;
            return acc;
          }, {} as any);

          return Object.values(vendorData).map((vendor: any) => ({
            ...vendor,
            'Average Cost': (vendor['Total Costs'] / vendor['Items Count']).toFixed(2),
            'Average Retail': (vendor['Total Retail'] / vendor['Items Count']).toFixed(2),
            'Average Margin': (((vendor['Total Retail'] - vendor['Total Costs']) / vendor['Total Retail']) * 100).toFixed(1) + '%'
          }));

        case 'waste_tracker':
          return inventoryItems
            .filter(item => {
              if (!item.expiration_date) return false;
              const expiry = new Date(item.expiration_date);
              return expiry < new Date();
            })
            .map(item => ({
              'Description': item.description,
              'Category': item.category,
              'Expired Date': item.expiration_date,
              'Quantity Wasted': item.remaining_stock,
              'Value Lost': (item.remaining_stock * (item.unit_cost || 0)).toFixed(2),
              'Days Overdue': Math.ceil((new Date().getTime() - new Date(item.expiration_date!).getTime()) / (1000 * 60 * 60 * 24))
            }));

        case 'consumption_trends':
          return inventoryItems.map(item => ({
            'Description': item.description,
            'Category': item.category,
            'Weekly Sales': item.sales_weekly,
            'Current Stock': item.remaining_stock,
            'Stock Turnover': item.sales_weekly > 0 ? (item.remaining_stock / item.sales_weekly).toFixed(1) + ' weeks' : 'No sales',
            'Reorder Point': Math.max(item.sales_weekly * 1.5, 5),
            'Trend': item.sales_weekly > 15 ? 'High Demand' : item.sales_weekly > 5 ? 'Medium Demand' : 'Low Demand'
          }));

        case 'vendor_margins':
          return inventoryItems.map(item => ({
            'Description': item.description,
            'Vendor ID': item.vendor_id,
            'Unit Cost': item.unit_cost,
            'Retail Price': item.unit_retail,
            'Gross Margin': item.gross_margin ? (item.gross_margin * 100).toFixed(1) + '%' : '0%',
            'Profit per Unit': ((item.unit_retail || 0) - (item.unit_cost || 0)).toFixed(2),
            'Weekly Profit': (item.sales_weekly * ((item.unit_retail || 0) - (item.unit_cost || 0))).toFixed(2)
          }));

        case 'shopping_list':
          // Use real reorder calculation API for shopping list
          const shoppingListItems = [];
          for (const item of inventoryItems.filter(item => item.remaining_stock <= 10)) {
            try {
              const calculation = await settingsApi.getReorderCalculation(item.id);
              shoppingListItems.push({
                'Item Name': item.description,
                'Category': item.category,
                'Current Stock': item.remaining_stock,
                'Suggested Quantity': calculation.reorderQuantity,
                'Priority': calculation.priority,
                'Estimated Cost': calculation.estimatedCost,
                'Vendor ID': item.vendor_id
              });
            } catch (error) {
              // Fallback to mock calculation if API fails
              shoppingListItems.push({
                'Item Name': item.description,
                'Category': item.category,
                'Current Stock': item.remaining_stock,
                'Suggested Quantity': Math.max(item.sales_weekly * 2, 20),
                'Priority': item.remaining_stock === 0 ? 'Urgent' : item.remaining_stock <= 5 ? 'High' : 'Medium',
                'Estimated Cost': (Math.max(item.sales_weekly * 2, 20) * (item.unit_cost || 0)).toFixed(2),
                'Vendor ID': item.vendor_id
              });
            }
          }
          return shoppingListItems;

        default:
          return [];
      }
    } catch (error) {
      console.error('Error getting filtered items:', error);
      // Fallback to simple mock data if API fails
      return inventoryItems.map(item => ({
        'Description': item.description,
        'Category': item.category,
        'Current Stock': item.remaining_stock,
        'Weekly Sales': item.sales_weekly
      }));
    }
  };

  const handleExport = async () => {
    const selectedOptions = exportOptions.filter(option => option.selected);
    if (selectedOptions.length === 0) {
      alert('Please select at least one export option');
      return;
    }

    setIsExporting(true);

    try {
      const workbook = XLSX.utils.book_new();

      // Process each selected option asynchronously
      for (const option of selectedOptions) {
        const data = await getFilteredItems(option.id);
        if (data.length > 0) {
          const worksheet = XLSX.utils.json_to_sheet(data);
          XLSX.utils.book_append_sheet(workbook, worksheet, option.title.substring(0, 31));
        }
      }

      const fileName = `fresh_choice_export_${new Date().toISOString().split('T')[0]}`;

      if (exportFormat === 'xlsx') {
        XLSX.writeFile(workbook, `${fileName}.xlsx`);
      } else {
        // For CSV, export the first selected option only
        const firstOption = selectedOptions[0];
        const data = await getFilteredItems(firstOption.id);
        const worksheet = XLSX.utils.json_to_sheet(data);
        const csv = XLSX.utils.sheet_to_csv(worksheet);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, `${fileName}_${firstOption.id}.csv`);
      }

      onClose();
    } catch (error) {
      console.error('Export error:', error);
      alert('Error exporting data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  const selectedCount = exportOptions.filter(option => option.selected).length;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-emerald-100 p-2 rounded-lg">
                <Download className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Export Data</h2>
                <p className="text-gray-600 mt-1">Choose what data to export</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Export Options */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Select Data to Export</h3>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={selectAll}>
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={selectNone}>
                  Select None
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {exportOptions.map((option) => {
                const IconComponent = option.icon;
                return (
                  <div
                    key={option.id}
                    onClick={() => toggleOption(option.id)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      option.selected
                        ? 'border-emerald-400 bg-emerald-50 shadow-md'
                        : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg bg-${option.color}-100`}>
                        <IconComponent className={`h-5 w-5 text-${option.color}-600`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{option.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                        {option.selected && (
                          <div className="mt-2">
                            <Badge variant="success" size="sm">
                              Selected
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Format Selection */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Format</h3>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  value="xlsx"
                  checked={exportFormat === 'xlsx'}
                  onChange={(e) => setExportFormat(e.target.value as 'xlsx')}
                  className="w-4 h-4 text-emerald-600"
                />
                <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
                <span className="text-sm font-medium">Excel (.xlsx)</span>
                <Badge variant="info" size="sm">Recommended</Badge>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  value="csv"
                  checked={exportFormat === 'csv'}
                  onChange={(e) => setExportFormat(e.target.value as 'csv')}
                  className="w-4 h-4 text-emerald-600"
                />
                <FileSpreadsheet className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium">CSV (.csv)</span>
              </label>
            </div>
            {exportFormat === 'csv' && selectedCount > 1 && (
              <p className="text-sm text-amber-600 mt-2">
                ⚠️ CSV format will export only the first selected option. Use Excel for multiple sheets.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {selectedCount} option{selectedCount !== 1 ? 's' : ''} selected
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleExport}
                disabled={selectedCount === 0 || isExporting}
                isLoading={isExporting}
              >
                <Download className="h-4 w-4 mr-2" />
                Export {exportFormat.toUpperCase()}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
