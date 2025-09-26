import React, { useState, useEffect } from 'react';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Download, TrendingUp, AlertTriangle, DollarSign } from 'lucide-react';
import { formatDate } from '../utils/dateUtils';
import { inventoryApi, vendorApi, reportsApi } from '../utils/api';
import { InventoryItem } from '../types';

export const ReportsPage: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState('consumption');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([]);
  const [vendorData, setVendorData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [consumptionData, setConsumptionData] = useState<any[]>([]);
  const [marginData, setMarginData] = useState<any[]>([]);
  const [wasteData, setWasteData] = useState<any[]>([]);
  const [salesTrendData, setSalesTrendData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);

  // Load real data from backend
  useEffect(() => {
    const loadReportsData = async () => {
      try {
        setIsLoading(true);
        const [inventory, vendors, weeklyTrend] = await Promise.all([
          inventoryApi.getAll(),
          vendorApi.getAll().catch(() => []), // Fallback to empty array if vendors API fails
          reportsApi.getWeeklySalesTrend().catch(() => []) // Fallback to empty array if API fails
        ]);
        
        setInventoryData(inventory);
        setVendorData(vendors);
        setSalesTrendData(weeklyTrend);
        
        // Calculate consumption data from inventory
        const consumption = inventory.map((item: InventoryItem) => ({
          name: item.description,
          sales: item.sales_weekly || 0,
          stock: item.remaining_stock,
          category: item.category
        })).sort((a: any, b: any) => b.sales - a.sales).slice(0, 10);
        setConsumptionData(consumption);
        
        // Calculate margin data by vendor
        const vendorMargins = vendors.map((vendor: any) => {
          const vendorItems = inventory.filter((item: InventoryItem) => item.vendor_id === vendor.id);
          const avgCost = vendorItems.reduce((sum: number, item: InventoryItem) => sum + (item.unit_cost || 0), 0) / vendorItems.length || 0;
          const avgRetail = vendorItems.reduce((sum: number, item: InventoryItem) => sum + (item.unit_retail || 0), 0) / vendorItems.length || 0;
          const margin = avgRetail > 0 ? ((avgRetail - avgCost) / avgRetail) * 100 : 0;
          
          return {
            vendor: vendor.name,
            items: vendorItems.length,
            avgCost: avgCost,
            avgRetail: avgRetail,
            margin: margin
          };
        }).filter((vendor: any) => vendor.items > 0);
        setMarginData(vendorMargins);
        
        // Calculate waste data (items expiring soon)
        const today = new Date();
        const expired = inventory.filter((item: InventoryItem) => {
          if (!item.expiration_date) return false;
          const expDate = new Date(item.expiration_date);
          return expDate < today;
        }).map((item: InventoryItem) => ({
          id: item.id,
          item: item.description,
          quantity: item.remaining_stock,
          expired: item.expiration_date,
          value: item.remaining_stock * (item.unit_cost || 0)
        }));
        setWasteData(expired);
        
        // Calculate category distribution
        const categoryStats = inventory.reduce((acc: Record<string, number>, item: InventoryItem) => {
          acc[item.category] = (acc[item.category] || 0) + (item.sales_weekly || 0);
          return acc;
        }, {});
        
        const colors = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];
        const categoryChartData = Object.entries(categoryStats).map(([name, value], index) => ({
          name,
          value: Math.round(value || 0),
          color: colors[index % colors.length]
        })).sort((a: any, b: any) => b.value - a.value).slice(0, 8);
        setCategoryData(categoryChartData);
        
      } catch (error) {
        console.error('Failed to load reports data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadReportsData();
  }, []);

  // Categories for filtering - dynamically generated from real data
  const categories = ['All', ...Array.from(new Set(inventoryData.map(item => item.category)))];

  // Filter consumption data based on selected category
  const filteredConsumptionData = selectedCategory === 'All' 
    ? consumptionData 
    : consumptionData.filter(item => item.category === selectedCategory);

  const totalWasteValue = wasteData.reduce((sum: number, item: any) => sum + item.value, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">Insights into your inventory performance</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="primary" size="sm">
            <TrendingUp className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Report Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'consumption', label: 'Consumption Trends' },
          { id: 'waste', label: 'Waste Tracker' },
          { id: 'margins', label: 'Vendor Margins' },
          { id: 'overview', label: 'Overview' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedReport(tab.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedReport === tab.id
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Consumption Trends Report */}
      {selectedReport === 'consumption' && (
        <div className="space-y-6">
          {/* Category Filter */}
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Filter by Category</h3>
                <p className="text-sm text-gray-600">Select a category to view specific consumption trends</p>
              </div>
              <div className="flex items-center space-x-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2 border-2 border-emerald-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400 bg-white hover:border-emerald-300 transition-colors min-w-[150px]"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-emerald-600">
                    {filteredConsumptionData.length}
                  </div>
                  <div className="text-xs text-gray-600">Items</div>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader 
              title={`Top ${filteredConsumptionData.length} Most Consumed Items${selectedCategory !== 'All' ? ` - ${selectedCategory}` : ''}`} 
              subtitle="Weekly sales vs current stock levels" 
            />
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={filteredConsumptionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" name="Weekly Sales" fill="#10B981" />
                <Bar dataKey="stock" name="Current Stock" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
            {filteredConsumptionData.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No items found for the selected category</p>
                <p className="text-sm text-gray-400 mt-1">Try selecting a different category</p>
              </div>
            )}
          </Card>

          <Card>
            <CardHeader title="Sales Trend" subtitle="Weekly performance over time" />
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, 'Sales']} />
                <Line type="monotone" dataKey="sales" stroke="#10B981" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {/* Waste Tracker Report */}
      {selectedReport === 'waste' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{wasteData.length}</div>
                <div className="text-sm text-gray-600">Items Expired</div>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">${totalWasteValue.toFixed(2)}</div>
                <div className="text-sm text-gray-600">Total Waste Value</div>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {((totalWasteValue / 50000) * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Of Total Inventory</div>
              </div>
            </Card>
          </div>

          <Card>
            <CardHeader 
              title="Expired Items" 
              subtitle="Items that have passed their expiration date"
              action={<Badge variant="danger">{wasteData.length} items</Badge>}
            />
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expired Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Value Lost
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {wasteData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="bg-red-100 p-2 rounded-lg mr-3">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                          </div>
                          <div className="text-sm font-medium text-gray-900">{item.item}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(item.expired)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                        ${item.value.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Vendor Margins Report */}
      {selectedReport === 'margins' && (
        <Card>
          <CardHeader title="Vendor Performance" subtitle="Cost analysis and profit margins by vendor" />
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vendor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Cost
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Retail
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Margin
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {marginData.map((vendor, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="bg-blue-100 p-2 rounded-lg mr-3">
                          <DollarSign className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="text-sm font-medium text-gray-900">{vendor.vendor}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {vendor.items}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${vendor.avgCost.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${vendor.avgRetail.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={vendor.margin > 35 ? 'success' : vendor.margin > 25 ? 'warning' : 'danger'}>
                        {vendor.margin}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Overview Report */}
      {selectedReport === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader title="Sales by Category" />
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({name, value}) => `${name}: ${value}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <CardHeader title="Monthly Trends" />
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="sales" stroke="#10B981" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}
    </div>
  );
};
