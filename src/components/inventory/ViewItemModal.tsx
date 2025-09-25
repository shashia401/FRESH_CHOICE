import React, { useState, useEffect } from 'react';
import { Card, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { X, Package, TrendingUp, TrendingDown, Calendar, DollarSign, BarChart3 } from 'lucide-react';
import { InventoryItem } from '../../types';

interface ViewItemModalProps {
  isOpen: boolean;
  onClose: () => void;
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

export const ViewItemModal: React.FC<ViewItemModalProps> = ({
  isOpen,
  onClose,
  item
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'sales' | 'movement'>('details');
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [movementData, setMovementData] = useState<MovementData[]>([]);
  const [salesStats, setSalesStats] = useState({
    totalSales: 0,
    trend: 0,
    forecastAccuracy: 0,
    avgWeeklySales: 0
  });

  // Generate mock sales data when item changes
  useEffect(() => {
    if (item) {
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
  }, [item]);

  const handleClose = () => {
    setActiveTab('details');
    onClose();
  };

  if (!isOpen || !item) return null;

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
                <h2 className="text-2xl font-bold text-gray-900">Product Details</h2>
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
              { id: 'details', label: 'Product Details', icon: Package },
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

          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Information */}
              <Card>
                <CardHeader title="Basic Information" />
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Product Name</label>
                      <div className="mt-1 text-sm text-gray-900">{item.description}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Category</label>
                      <div className="mt-1">
                        <Badge variant="info">{item.category}</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Brand</label>
                      <div className="mt-1 text-sm text-gray-900">{item.brand}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Department</label>
                      <div className="mt-1 text-sm text-gray-900">{item.department}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">SKU</label>
                      <div className="mt-1 text-sm text-gray-900 font-mono">{item.item_sku || 'N/A'}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">UPC</label>
                      <div className="mt-1 text-sm text-gray-900 font-mono">{item.item_upc || 'N/A'}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Pack Size</label>
                      <div className="mt-1 text-sm text-gray-900">{item.pack_size || 'N/A'}</div>
                    </div>
                  </div>

                  {item.expiration_date && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Expiration Date</label>
                      <div className="mt-1 text-sm text-gray-900">{new Date(item.expiration_date).toLocaleDateString()}</div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Stock & Location */}
              <Card>
                <CardHeader title="Stock & Location" />
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Quantity Shipped</label>
                      <div className="mt-1 text-lg font-bold text-gray-900">{item.qty_shipped}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Current Stock</label>
                      <div className="mt-1 text-lg font-bold text-emerald-600">{item.remaining_stock}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Location</label>
                      <div className="mt-1 text-sm text-gray-900">{item.location || 'N/A'}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Aisle</label>
                      <div className="mt-1 text-sm text-gray-900">{item.aisle || 'N/A'}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Row</label>
                      <div className="mt-1 text-sm text-gray-900">{item.row || 'N/A'}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Bin</label>
                      <div className="mt-1 text-sm text-gray-900">{item.bin || 'N/A'}</div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Weekly Sales</label>
                    <div className="mt-1 text-lg font-bold text-blue-600">{item.sales_weekly}</div>
                  </div>
                </div>
              </Card>

              {/* Pricing Information */}
              <Card className="lg:col-span-2">
                <CardHeader title="Pricing Information" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Unit Cost</label>
                    <div className="mt-1 text-lg font-bold text-gray-900">
                      ${item.unit_cost?.toFixed(2) || '0.00'}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Vendor Cost</label>
                    <div className="mt-1 text-lg font-bold text-gray-900">
                      ${item.vendor_cost?.toFixed(2) || '0.00'}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Customer Cost</label>
                    <div className="mt-1 text-lg font-bold text-gray-900">
                      ${item.cust_cost_each?.toFixed(2) || '0.00'}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Retail Price</label>
                    <div className="mt-1 text-lg font-bold text-emerald-600">
                      ${item.unit_retail?.toFixed(2) || '0.00'}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Gross Margin</label>
                    <div className="mt-1">
                      <Badge variant="success">
                        {((item.gross_margin || 0) * 100).toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Vendor ID</label>
                    <div className="mt-1 text-sm text-gray-900">{item.vendor_id}</div>
                  </div>
                </div>
              </Card>
            </div>
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