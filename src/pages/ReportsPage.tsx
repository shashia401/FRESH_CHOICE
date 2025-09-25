import React, { useState } from 'react';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Download, TrendingUp, AlertTriangle, DollarSign } from 'lucide-react';
import { formatDate } from '../utils/dateUtils';

export const ReportsPage: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState('consumption');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Mock data for charts
  const consumptionData = [
    { name: 'Organic Apples', sales: 45, stock: 5, category: 'Produce' },
    { name: 'Whole Milk', sales: 32, stock: 8, category: 'Dairy' },
    { name: 'Wheat Bread', sales: 28, stock: 15, category: 'Bakery' },
    { name: 'Greek Yogurt', sales: 25, stock: 12, category: 'Dairy' },
    { name: 'Bananas', sales: 22, stock: 20, category: 'Produce' },
    { name: 'Orange Juice', sales: 18, stock: 6, category: 'Beverages' },
    { name: 'Chicken Breast', sales: 15, stock: 10, category: 'Meat' },
    { name: 'Pasta', sales: 12, stock: 25, category: 'Pantry' },
  ];

  // Categories for filtering
  const categories = ['All', 'Produce', 'Dairy', 'Bakery', 'Meat', 'Beverages', 'Pantry', 'Frozen', 'Deli'];

  // Filter consumption data based on selected category
  const filteredConsumptionData = selectedCategory === 'All' 
    ? consumptionData 
    : consumptionData.filter(item => item.category === selectedCategory);

  const marginData = [
    { vendor: 'Fresh Farms', items: 45, avgCost: 3.20, avgRetail: 4.80, margin: 33.3 },
    { vendor: 'Dairy Co', items: 32, avgCost: 2.85, avgRetail: 4.25, margin: 32.9 },
    { vendor: 'Local Bakery', items: 28, avgCost: 2.10, avgRetail: 3.49, margin: 39.8 },
    { vendor: 'Meat Suppliers', items: 22, avgCost: 8.50, avgRetail: 12.99, margin: 34.6 },
    { vendor: 'Beverage Inc', items: 18, avgCost: 1.75, avgRetail: 2.99, margin: 41.5 },
  ];

  const wasteData = [
    { id: 1, item: 'Organic Strawberries', quantity: 12, expired: '2025-01-20', value: 48.00 },
    { id: 2, item: 'Greek Yogurt', quantity: 8, expired: '2025-01-19', value: 32.00 },
    { id: 3, item: 'Whole Wheat Bread', quantity: 5, expired: '2025-01-18', value: 17.45 },
    { id: 4, item: 'Fresh Salmon', quantity: 3, expired: '2025-01-17', value: 45.87 },
    { id: 5, item: 'Mixed Greens', quantity: 15, expired: '2025-01-16', value: 37.50 },
  ];

  const salesTrendData = [
    { week: 'Week 1', sales: 8200 },
    { week: 'Week 2', sales: 8650 },
    { week: 'Week 3', sales: 7980 },
    { week: 'Week 4', sales: 9200 },
    { week: 'Week 5', sales: 8640 },
  ];

  const categoryData = [
    { name: 'Produce', value: 35, color: '#10B981' },
    { name: 'Dairy', value: 25, color: '#3B82F6' },
    { name: 'Bakery', value: 20, color: '#F59E0B' },
    { name: 'Meat', value: 12, color: '#EF4444' },
    { name: 'Beverages', value: 8, color: '#8B5CF6' },
  ];

  const totalWasteValue = wasteData.reduce((sum, item) => sum + item.value, 0);

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