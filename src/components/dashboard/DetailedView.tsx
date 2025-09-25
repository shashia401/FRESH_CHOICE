import React, { useState, useEffect } from 'react';
import { Card, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { X, TrendingUp, TrendingDown, Calendar, Package, AlertTriangle, DollarSign } from 'lucide-react';
import { InventoryItem } from '../../types';
import { formatDate, getStockStatusColor, getExpirationStatusColor } from '../../utils/dateUtils';

interface DetailedViewProps {
  type: 'total' | 'lowStock' | 'expiring' | 'sales';
  onClose: () => void;
  items?: InventoryItem[];
}

interface SalesData {
  date: string;
  sales: number;
  forecast?: boolean;
}

interface ProductSalesData {
  id: number;
  name: string;
  salesData: SalesData[];
  totalSales: number;
  trend: number;
  forecastAccuracy: number;
}

export const DetailedView: React.FC<DetailedViewProps> = ({ type, onClose, items = [] }) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('30');
  const [selectedProduct, setSelectedProduct] = useState<ProductSalesData | null>(null);
  const [productSalesData, setProductSalesData] = useState<ProductSalesData[]>([]);

  // Generate mock sales data with forecasting
  useEffect(() => {
    const generateSalesData = (productId: number, productName: string): ProductSalesData => {
      const days = parseInt(selectedTimeframe);
      const salesData: SalesData[] = [];
      
      // Historical data (70% of timeframe)
      const historicalDays = Math.floor(days * 0.7);
      let baseSales = Math.floor(Math.random() * 50) + 10;
      const trend = (Math.random() - 0.5) * 0.1; // -5% to +5% daily trend
      
      for (let i = historicalDays; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const variation = (Math.random() - 0.5) * 0.3; // ±15% daily variation
        const sales = Math.max(0, Math.floor(baseSales * (1 + trend * (historicalDays - i) / historicalDays + variation)));
        salesData.push({
          date: date.toISOString().split('T')[0],
          sales,
          forecast: false
        });
        baseSales = sales;
      }
      
      // Forecast data (30% of timeframe)
      const forecastDays = days - historicalDays;
      for (let i = 1; i <= forecastDays; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        const forecastVariation = (Math.random() - 0.5) * 0.2; // ±10% forecast variation
        const forecastSales = Math.max(0, Math.floor(baseSales * (1 + trend + forecastVariation)));
        salesData.push({
          date: date.toISOString().split('T')[0],
          sales: forecastSales,
          forecast: true
        });
      }
      
      const totalSales = salesData.filter(d => !d.forecast).reduce((sum, d) => sum + d.sales, 0);
      const trendPercentage = trend * 100;
      const forecastAccuracy = 85 + Math.random() * 10; // 85-95% accuracy
      
      return {
        id: productId,
        name: productName,
        salesData,
        totalSales,
        trend: trendPercentage,
        forecastAccuracy
      };
    };

    const mockProductData = items.slice(0, 10).map((item, index) => 
      generateSalesData(item.id, item.description)
    );
    setProductSalesData(mockProductData);
  }, [selectedTimeframe, items]);

  const getTitle = () => {
    switch (type) {
      case 'total': return 'All Inventory Items';
      case 'lowStock': return 'Low Stock Items';
      case 'expiring': return 'Items Expiring Soon';
      case 'sales': return 'Sales Analysis';
      default: return 'Details';
    }
  };

  const getFilteredItems = () => {
    switch (type) {
      case 'lowStock':
        return items.filter(item => item.remaining_stock <= 10 && item.remaining_stock > 0);
      case 'expiring':
        return items.filter(item => {
          if (!item.expiration_date) return false;
          const expiry = new Date(item.expiration_date);
          const today = new Date();
          const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          return daysUntilExpiry <= 3 && daysUntilExpiry >= 0;
        });
      default:
        return items;
    }
  };

  const filteredItems = getFilteredItems();

  const handleProductClick = (item: InventoryItem) => {
    const productData = productSalesData.find(p => p.id === item.id);
    if (productData) {
      setSelectedProduct(productData);
    }
  };

  if (selectedProduct) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedProduct.name}</h2>
                <p className="text-gray-600 mt-1">Sales Analysis & Forecasting</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setSelectedProduct(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {/* Controls */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time Frame</label>
                  <select
                    value={selectedTimeframe}
                    onChange={(e) => setSelectedTimeframe(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="7">7 Days</option>
                    <option value="30">30 Days</option>
                    <option value="90">90 Days</option>
                    <option value="180">6 Months</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600">{selectedProduct.totalSales}</div>
                  <div className="text-sm text-gray-600">Total Sales</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${selectedProduct.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedProduct.trend >= 0 ? '+' : ''}{selectedProduct.trend.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Trend</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{selectedProduct.forecastAccuracy.toFixed(0)}%</div>
                  <div className="text-sm text-gray-600">Forecast Accuracy</div>
                </div>
              </div>
            </div>

            {/* Sales Chart */}
            <Card className="mb-6">
              <CardHeader title="Sales Trend & Forecast" subtitle="Historical data and AI-powered predictions" />
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={selectedProduct.salesData}>
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
                    strokeDasharray={(props) => {
                      // This won't work directly, but we can use two separate lines
                      return undefined;
                    }}
                  />
                  {/* Forecast line with dashed style */}
                  <Line 
                    type="monotone" 
                    dataKey={(data) => data.forecast ? data.sales : null}
                    stroke="#F59E0B"
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    connectNulls={false}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
              
              <div className="flex items-center justify-center space-x-6 mt-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-1 bg-emerald-500 rounded"></div>
                  <span>Historical Data</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-1 bg-amber-500 rounded" style={{ backgroundImage: 'repeating-linear-gradient(to right, #F59E0B 0, #F59E0B 3px, transparent 3px, transparent 6px)' }}></div>
                  <span>AI Forecast</span>
                </div>
              </div>
            </Card>

            {/* Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    {selectedProduct.trend >= 0 ? (
                      <TrendingUp className="h-8 w-8 text-green-600" />
                    ) : (
                      <TrendingDown className="h-8 w-8 text-red-600" />
                    )}
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    {selectedProduct.trend >= 0 ? 'Growing' : 'Declining'} Trend
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {Math.abs(selectedProduct.trend).toFixed(1)}% {selectedProduct.trend >= 0 ? 'increase' : 'decrease'} trend
                  </div>
                </div>
              </Card>

              <Card>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Calendar className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="text-lg font-semibold text-gray-900">Peak Days</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Weekends show 23% higher sales
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
                    ${(selectedProduct.totalSales * 4.99).toFixed(0)} total revenue
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{getTitle()}</h2>
              <p className="text-gray-600 mt-1">{filteredItems.length} items found</p>
            </div>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {type === 'sales' ? (
            <div className="space-y-6">
              <Card>
                <CardHeader title="Top Performing Products" subtitle="Click on any product to view detailed sales analysis" />
                <div className="space-y-3">
                  {productSalesData.slice(0, 10).map((product) => (
                    <div 
                      key={product.id}
                      onClick={() => setSelectedProduct(product)}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-emerald-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="bg-emerald-100 p-2 rounded-lg">
                          <Package className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-600">{product.totalSales} units sold</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant={product.trend >= 0 ? 'success' : 'danger'}>
                          {product.trend >= 0 ? '+' : ''}{product.trend.toFixed(1)}%
                        </Badge>
                        <div className="text-sm text-gray-500">
                          ${(product.totalSales * 4.99).toFixed(0)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          ) : (
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
                      Stock Level
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    {type === 'expiring' && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Expiration
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredItems.map((item) => (
                    <tr 
                      key={item.id} 
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleProductClick(item)}
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
                          <span className={`text-lg font-bold px-2 py-1 rounded ${getStockStatusColor(item.remaining_stock)}`}>
                            {item.remaining_stock}
                          </span>
                          {type === 'lowStock' && <Badge variant="warning" size="sm">Low Stock</Badge>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {item.aisle && `Aisle ${item.aisle}`}
                          {item.aisle && item.row && `, Row ${item.row}`}
                        </div>
                      </td>
                      {type === 'expiring' && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          {item.expiration_date && (
                            <div>
                              <div className="text-sm text-gray-900">
                                {formatDate(item.expiration_date)}
                              </div>
                              <Badge variant="danger" size="sm">Expires Soon</Badge>
                            </div>
                          )}
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Button variant="outline" size="sm">
                          View Sales
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};