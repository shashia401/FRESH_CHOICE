import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { X, Package, TrendingUp, TrendingDown, Calendar, DollarSign, Save, BarChart3 } from 'lucide-react';
import { InventoryItem } from '../../types';

interface EditItemFormData {
  description: string;
  category: string;
  brand: string;
  department: string;
  item_sku?: string;
  item_upc?: string;
  pack_size?: string;
  qty_shipped: number;
  remaining_stock: number;
  location?: string;
  aisle?: string;
  row?: string;
  bin?: string;
  expiration_date?: string;
  unit_cost?: number;
  vendor_cost?: number;
  cust_cost_each?: number;
  unit_retail?: number;
  vendor_id?: number;
  vendor_name?: string;
  advertising_flag: boolean;
  order_type: string;
}

interface EditItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: InventoryItem) => void;
  item: InventoryItem | null;
}

interface SalesData {
  date: string;
  sales: number;
  forecast?: boolean;
}

interface MovementData {
  week: string;
  in: number;
  out: number;
  net: number;
}

export const EditItemModal: React.FC<EditItemModalProps> = ({
  isOpen,
  onClose,
  onSave,
  item
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'sales' | 'movement'>('edit');
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [movementData, setMovementData] = useState<MovementData[]>([]);
  const [salesStats, setSalesStats] = useState({
    totalSales: 0,
    trend: 0,
    forecastAccuracy: 0,
    avgWeeklySales: 0
  });

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<EditItemFormData>();

  // Generate mock sales data when item changes
  useEffect(() => {
    if (item) {
      // Reset form with item data
      reset({
        description: item.description,
        category: item.category,
        brand: item.brand,
        department: item.department,
        item_sku: item.item_sku || '',
        item_upc: item.item_upc || '',
        pack_size: item.pack_size || '',
        qty_shipped: item.qty_shipped,
        remaining_stock: item.remaining_stock,
        location: item.location || '',
        aisle: item.aisle || '',
        row: item.row || '',
        bin: item.bin || '',
        expiration_date: item.expiration_date || '',
        unit_cost: item.unit_cost || 0,
        vendor_cost: item.vendor_cost || 0,
        cust_cost_each: item.cust_cost_each || 0,
        unit_retail: item.unit_retail || 0,
        vendor_id: item.vendor_id || 1,
        vendor_name: item.vendor_name || '',
        advertising_flag: item.advertising_flag,
        order_type: item.order_type || 'Regular'
      });

      // Generate sales data
      const generateSalesData = (): SalesData[] => {
        const data: SalesData[] = [];
        const baseWeeklySales = item.sales_weekly || 10;
        
        // Historical data (last 8 weeks)
        for (let i = 8; i >= 1; i--) {
          const date = new Date();
          date.setDate(date.getDate() - (i * 7));
          const variation = (Math.random() - 0.5) * 0.4; // ±20% variation
          const sales = Math.max(0, Math.floor(baseWeeklySales * (1 + variation)));
          data.push({
            date: date.toISOString().split('T')[0],
            sales,
            forecast: false
          });
        }
        
        // Forecast data (next 4 weeks)
        for (let i = 1; i <= 4; i++) {
          const date = new Date();
          date.setDate(date.getDate() + (i * 7));
          const forecastVariation = (Math.random() - 0.5) * 0.2; // ±10% forecast variation
          const forecastSales = Math.max(0, Math.floor(baseWeeklySales * (1 + forecastVariation)));
          data.push({
            date: date.toISOString().split('T')[0],
            sales: forecastSales,
            forecast: true
          });
        }
        
        return data;
      };

      // Generate movement data
      const generateMovementData = (): MovementData[] => {
        const data: MovementData[] = [];
        const baseMovement = item.sales_weekly || 10;
        
        for (let i = 4; i >= 1; i--) {
          const weekStart = new Date();
          weekStart.setDate(weekStart.getDate() - (i * 7));
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekEnd.getDate() + 6);
          
          const inMovement = Math.floor(baseMovement * (1.2 + Math.random() * 0.3)); // Restocking
          const outMovement = Math.floor(baseMovement * (0.8 + Math.random() * 0.4)); // Sales
          
          data.push({
            week: `${weekStart.getMonth() + 1}/${weekStart.getDate()}`,
            in: inMovement,
            out: outMovement,
            net: inMovement - outMovement
          });
        }
        
        return data;
      };

      const salesData = generateSalesData();
      const movementData = generateMovementData();
      
      setSalesData(salesData);
      setMovementData(movementData);

      // Calculate stats
      const historicalSales = salesData.filter(d => !d.forecast);
      const totalSales = historicalSales.reduce((sum, d) => sum + d.sales, 0);
      const avgWeeklySales = totalSales / historicalSales.length;
      const trend = historicalSales.length > 1 
        ? ((historicalSales[historicalSales.length - 1].sales - historicalSales[0].sales) / historicalSales[0].sales) * 100
        : 0;

      setSalesStats({
        totalSales,
        trend,
        forecastAccuracy: 85 + Math.random() * 10,
        avgWeeklySales
      });
    }
  }, [item, reset]);

  const onSubmit = async (data: EditItemFormData) => {
    if (!item) return;
    
    setIsLoading(true);
    
    try {
      // Calculate derived fields
      const grossMargin = data.unit_cost && data.unit_retail 
        ? (data.unit_retail - data.unit_cost) / data.unit_retail 
        : 0;

      const updatedItem: InventoryItem = {
        ...item,
        ...data,
        gross_margin: grossMargin,
        burd_unit_cost: data.unit_cost,
        burd_gross_margin: grossMargin,
        cust_cost_extended: data.cust_cost_each ? data.cust_cost_each * data.remaining_stock : undefined,
        updated_at: new Date().toISOString()
      };

      onSave(updatedItem);
      onClose();
    } catch (error) {
      console.error('Error updating item:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setActiveTab('edit');
    onClose();
  };

  if (!isOpen || !item) return null;

  const categories = ['Produce', 'Dairy', 'Bakery', 'Meat', 'Beverages', 'Pantry', 'Frozen', 'Deli', 'Other'];
  const departments = ['Produce', 'Refrigerated', 'Bakery', 'Meat', 'Beverages', 'Pantry', 'Frozen', 'Deli', 'General'];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-emerald-100 p-2 rounded-lg">
                <Package className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Edit Item</h2>
                <p className="text-gray-600 mt-1">{item.description}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
            {[
              { id: 'edit', label: 'Edit Details', icon: Package },
              { id: 'sales', label: 'Sales Trends', icon: TrendingUp },
              { id: 'movement', label: 'Movement History', icon: BarChart3 }
            ].map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-white text-emerald-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Edit Tab */}
          {activeTab === 'edit' && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Information */}
                <Card>
                  <CardHeader title="Basic Information" />
                  <div className="space-y-4">
                    <Input
                      label="Product Description *"
                      {...register('description', { required: 'Product description is required' })}
                      error={errors.description?.message}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                        <select
                          {...register('category', { required: 'Category is required' })}
                          className="block w-full px-4 py-3 border-2 border-emerald-200 rounded-xl text-sm bg-emerald-50/30 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400"
                        >
                          {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                        {errors.category && <p className="text-sm text-red-600 mt-1">{errors.category.message}</p>}
                      </div>
                      
                      <Input
                        label="Brand"
                        {...register('brand')}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Input
                        label="SKU"
                        {...register('item_sku')}
                      />
                      <Input
                        label="UPC/Barcode"
                        {...register('item_upc')}
                      />
                      <Input
                        label="Pack Size"
                        {...register('pack_size')}
                      />
                    </div>
                  </div>
                </Card>

                {/* Stock & Location */}
                <Card>
                  <CardHeader title="Stock Info & Location" />
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Quantity Shipped"
                        type="number"
                        min="0"
                        {...register('qty_shipped', { 
                          required: 'Quantity shipped is required',
                          min: { value: 0, message: 'Quantity must be 0 or greater' }
                        })}
                        error={errors.qty_shipped?.message}
                      />
                      <Input
                        label="Current Stock"
                        type="number"
                        min="0"
                        {...register('remaining_stock', { 
                          required: 'Current stock is required',
                          min: { value: 0, message: 'Stock must be 0 or greater' }
                        })}
                        error={errors.remaining_stock?.message}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Items per Carton"
                        type="number"
                        min="1"
                        placeholder="e.g., 12"
                        {...register('items_per_carton', { 
                          min: { value: 1, message: 'Items per carton must be 1 or greater' }
                        })}
                        error={errors.items_per_carton?.message}
                      />
                      <div className="flex items-end">
                        <div className="text-sm text-gray-600">
                          <div className="font-medium">Stock Summary</div>
                          <div className="mt-1">Individual units available</div>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Input
                        label="Location"
                        {...register('location')}
                      />
                      <Input
                        label="Aisle"
                        {...register('aisle')}
                      />
                      <Input
                        label="Row"
                        {...register('row')}
                      />
                      <Input
                        label="Bin"
                        {...register('bin')}
                      />
                    </div>

                    <Input
                      label="Expiration Date"
                      type="date"
                      {...register('expiration_date')}
                    />
                  </div>
                </Card>
              </div>

              {/* Pricing Information */}
              <Card>
                <CardHeader title="Pricing Information" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Input
                    label="Unit Cost"
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('unit_cost')}
                  />
                  <Input
                    label="Vendor Cost"
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('vendor_cost')}
                  />
                  <Input
                    label="Customer Cost"
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('cust_cost_each')}
                  />
                  <Input
                    label="Retail Price"
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('unit_retail')}
                  />
                </div>
                
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="Vendor ID"
                    type="number"
                    min="1"
                    {...register('vendor_id')}
                  />
                  <Input
                    label="Vendor Name"
                    placeholder="e.g., Fresh Farms Co."
                    {...register('vendor_name')}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Order Type</label>
                    <select
                      {...register('order_type')}
                      className="block w-full px-4 py-3 border-2 border-emerald-200 rounded-xl text-sm bg-emerald-50/30 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400"
                    >
                      <option value="Regular">Regular</option>
                      <option value="Premium">Premium</option>
                      <option value="Bulk">Bulk</option>
                      <option value="Special">Special</option>
                    </select>
                  </div>
                </div>
                
                <div className="mt-4 flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="advertising_flag"
                    {...register('advertising_flag')}
                    className="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500 focus:ring-2"
                  />
                  <label htmlFor="advertising_flag" className="text-sm font-medium text-gray-700">
                    Featured in advertising
                  </label>
                </div>
              </Card>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isLoading}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </form>
          )}

          {/* Sales Trends Tab */}
          {activeTab === 'sales' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600">{salesStats.totalSales}</div>
                    <div className="text-sm text-gray-600">Total Sales (8 weeks)</div>
                  </div>
                </Card>
                <Card>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${salesStats.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {salesStats.trend >= 0 ? '+' : ''}{salesStats.trend.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Trend</div>
                  </div>
                </Card>
                <Card>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{salesStats.avgWeeklySales.toFixed(0)}</div>
                    <div className="text-sm text-gray-600">Avg Weekly Sales</div>
                  </div>
                </Card>
                <Card>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{salesStats.forecastAccuracy.toFixed(0)}%</div>
                    <div className="text-sm text-gray-600">Forecast Accuracy</div>
                  </div>
                </Card>
              </div>

              {/* Sales Chart */}
              <Card>
                <CardHeader title="Sales Trend & Forecast" subtitle="Historical data and AI-powered predictions" />
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => new Date(date).toLocaleDateString()}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(date) => new Date(date).toLocaleDateString()}
                      formatter={(value, name, props) => [
                        value,
                        props.payload.forecast ? 'Forecast Sales' : 'Actual Sales'
                      ]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="sales" 
                      stroke="#10B981"
                      strokeWidth={3}
                      dot={(props) => {
                        const { payload } = props;
                        return (
                          <circle
                            cx={props.cx}
                            cy={props.cy}
                            r={4}
                            fill={payload.forecast ? '#F59E0B' : '#10B981'}
                            stroke={payload.forecast ? '#F59E0B' : '#10B981'}
                            strokeWidth={2}
                          />
                        );
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
                
                <div className="flex items-center justify-center space-x-6 mt-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-1 bg-emerald-500 rounded"></div>
                    <span>Historical Data</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-1 bg-amber-500 rounded"></div>
                    <span>AI Forecast</span>
                  </div>
                </div>
              </Card>

              {/* Insights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      {salesStats.trend >= 0 ? (
                        <TrendingUp className="h-8 w-8 text-green-600" />
                      ) : (
                        <TrendingDown className="h-8 w-8 text-red-600" />
                      )}
                    </div>
                    <div className="text-lg font-semibold text-gray-900">
                      {salesStats.trend >= 0 ? 'Growing' : 'Declining'} Trend
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {Math.abs(salesStats.trend).toFixed(1)}% {salesStats.trend >= 0 ? 'increase' : 'decrease'}
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Calendar className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="text-lg font-semibold text-gray-900">Stock Days</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {salesStats.avgWeeklySales > 0 
                        ? Math.floor((item.remaining_stock / salesStats.avgWeeklySales) * 7) + ' days'
                        : 'N/A'
                      }
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <DollarSign className="h-8 w-8 text-emerald-600" />
                    </div>
                    <div className="text-lg font-semibold text-gray-900">Revenue Impact</div>
                    <div className="text-sm text-gray-600 mt-1">
                      ${(salesStats.totalSales * (item.unit_retail || 0)).toFixed(0)} total
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* Movement History Tab */}
          {activeTab === 'movement' && (
            <div className="space-y-6">
              <Card>
                <CardHeader title="Unit Movement by Week" subtitle="Inventory in/out movement tracking" />
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={movementData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="in" name="Units In" fill="#10B981" />
                    <Bar dataKey="out" name="Units Out" fill="#EF4444" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Card>
                <CardHeader title="Movement Summary" />
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Week
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Units In
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Units Out
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Net Movement
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {movementData.map((movement, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {movement.week}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                            +{movement.in}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                            -{movement.out}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={movement.net >= 0 ? 'success' : 'danger'}>
                              {movement.net >= 0 ? '+' : ''}{movement.net}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};