import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatCard } from '../components/dashboard/StatCard';
import { DetailedView } from '../components/dashboard/DetailedView';
import { AddItemModal } from '../components/inventory/AddItemModal';
import { ExportModal } from '../components/inventory/ExportModal';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  Package,
  AlertTriangle,
  Calendar,
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle,
  XCircle,
  Edit,
  Trash2
} from 'lucide-react';
import { DashboardStats, InventoryItem } from '../types';
import { formatDate, getExpirationStatusColor } from '../utils/dateUtils';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalItems: 1247,
    lowStockItems: 23,
    expiringItems: 7,
    weeklySales: 8640
  });

  const [showDetailedView, setShowDetailedView] = useState<'total' | 'lowStock' | 'expiring' | 'sales' | null>(null);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showShoppingListModal, setShowShoppingListModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);

  // Mock inventory data for detailed views
  useEffect(() => {
    const mockItems: InventoryItem[] = [
      {
        id: 1,
        user_id: 1,
        category: 'Dairy',
        brand: 'Organic Valley',
        department: 'Refrigerated',
        item_sku: 'OV-MILK-001',
        item_upc: '123456789012',
        description: 'Whole Milk - Organic',
        pack_size: '1 Gallon',
        qty_shipped: 50,
        remaining_stock: 5,
        sales_weekly: 10,
        aisle: 'A1',
        row: '2',
        bin: 'B3',
        expiration_date: '2025-01-28',
        unit_cost: 4.50,
        vendor_cost: 3.80,
        cust_cost_each: 5.99,
        unit_retail: 5.99,
        gross_margin: 0.25,
        advertising_flag: false,
        order_type: 'Regular',
        vendor_id: 1,
        created_at: '2024-12-01T10:00:00Z',
        updated_at: '2024-12-15T14:30:00Z'
      },
      {
        id: 2,
        user_id: 1,
        category: 'Produce',
        brand: 'Fresh Farms',
        department: 'Produce',
        item_sku: 'FF-APPLE-001',
        item_upc: '234567890123',
        description: 'Organic Apples - Honeycrisp',
        pack_size: '3 lb bag',
        qty_shipped: 100,
        remaining_stock: 8,
        sales_weekly: 25,
        aisle: 'P1',
        row: '1',
        bin: 'A1',
        expiration_date: '2025-01-25',
        unit_cost: 3.25,
        vendor_cost: 2.80,
        cust_cost_each: 4.99,
        unit_retail: 4.99,
        gross_margin: 0.35,
        advertising_flag: true,
        order_type: 'Premium',
        vendor_id: 2,
        created_at: '2024-12-05T09:15:00Z',
        updated_at: '2024-12-20T16:45:00Z'
      },
      {
        id: 3,
        user_id: 1,
        category: 'Bakery',
        brand: 'Local Bakery',
        department: 'Bakery',
        item_sku: 'LB-BREAD-001',
        item_upc: '345678901234',
        description: 'Whole Wheat Bread',
        pack_size: '24 oz loaf',
        qty_shipped: 30,
        remaining_stock: 15,
        sales_weekly: 8,
        aisle: 'B2',
        row: '3',
        bin: 'C2',
        expiration_date: '2025-01-24',
        unit_cost: 2.20,
        vendor_cost: 1.80,
        cust_cost_each: 3.49,
        unit_retail: 3.49,
        gross_margin: 0.37,
        advertising_flag: false,
        order_type: 'Regular',
        vendor_id: 3,
        created_at: '2024-12-10T11:20:00Z',
        updated_at: '2024-12-18T13:10:00Z'
      },
      // Add more mock items for better demonstration
      ...Array.from({ length: 20 }, (_, i) => ({
        id: i + 4,
        user_id: 1,
        category: ['Produce', 'Dairy', 'Bakery', 'Meat', 'Beverages'][i % 5],
        brand: ['Fresh Farms', 'Organic Valley', 'Local Bakery', 'Premium Meats', 'Pure Beverages'][i % 5],
        department: 'General',
        item_sku: `ITEM-${String(i + 4).padStart(3, '0')}`,
        item_upc: `${123456789000 + i + 4}`,
        description: `Product ${i + 4}`,
        pack_size: '1 unit',
        qty_shipped: Math.floor(Math.random() * 100) + 10,
        remaining_stock: Math.floor(Math.random() * 20),
        sales_weekly: Math.floor(Math.random() * 30) + 5,
        aisle: `${String.fromCharCode(65 + (i % 5))}${Math.floor(i / 5) + 1}`,
        row: String(Math.floor(Math.random() * 5) + 1),
        bin: `B${Math.floor(Math.random() * 10) + 1}`,
        expiration_date: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        unit_cost: Math.random() * 10 + 1,
        vendor_cost: Math.random() * 8 + 1,
        cust_cost_each: Math.random() * 15 + 2,
        unit_retail: Math.random() * 15 + 2,
        gross_margin: Math.random() * 0.5 + 0.1,
        advertising_flag: Math.random() > 0.5,
        order_type: 'Regular',
        vendor_id: Math.floor(Math.random() * 3) + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }))
    ];
    setInventoryItems(mockItems);
  }, []);

  // Mock data for alerts and recent activity
  const alerts = [
    { id: 1, item: 'Organic Apples', stock: 5, threshold: 20, type: 'low-stock' },
    { id: 2, item: 'Milk - Whole', expiry: '2025-01-25', type: 'expiring' },
    { id: 3, item: 'Bread - Wheat', stock: 0, type: 'out-of-stock' },
    { id: 4, item: 'Yogurt - Greek', expiry: '2025-01-24', type: 'expiring' },
  ];

  const recentActivity = [
    { 
      id: 1, 
      action: 'Added new item', 
      item: 'Premium Coffee Beans', 
      time: '2 hours ago',
      type: 'add',
      user: 'admin',
      details: 'Added to Beverages category with 50 units'
    },
    { 
      id: 2, 
      action: 'Stock updated', 
      item: 'Organic Bananas', 
      time: '4 hours ago',
      type: 'update',
      user: 'admin',
      details: 'Stock increased from 15 to 45 units'
    },
    { 
      id: 3, 
      action: 'Item removed', 
      item: 'Expired Yogurt', 
      time: '6 hours ago',
      type: 'delete',
      user: 'admin',
      details: 'Removed due to expiration (12 units wasted)'
    },
    { 
      id: 4, 
      action: 'Vendor added', 
      item: 'Fresh Farms Co.', 
      time: '1 day ago',
      type: 'vendor',
      user: 'admin',
      details: 'New vendor added with contact info'
    },
    { 
      id: 5, 
      action: 'Price updated', 
      item: 'Whole Wheat Bread', 
      time: '1 day ago',
      type: 'update',
      user: 'admin',
      details: 'Retail price changed from $3.49 to $3.99'
    },
    { 
      id: 6, 
      action: 'Stock alert', 
      item: 'Organic Milk', 
      time: '2 days ago',
      type: 'alert',
      user: 'system',
      details: 'Low stock alert triggered (5 units remaining)'
    }
  ];

  // Mock shopping list data
  const shoppingListPreview = [
    { id: 1, item: 'Organic Apples', quantity: 50, priority: 'high', reason: 'Low stock (5 remaining)' },
    { id: 2, item: 'Whole Milk', quantity: 30, priority: 'high', reason: 'Low stock (8 remaining)' },
    { id: 3, item: 'Bread - Wheat', quantity: 25, priority: 'urgent', reason: 'Out of stock' },
    { id: 4, item: 'Greek Yogurt', quantity: 20, priority: 'medium', reason: 'Expiring soon' },
    { id: 5, item: 'Orange Juice', quantity: 15, priority: 'medium', reason: 'Low stock (6 remaining)' }
  ];

  const handleAddItem = (newItemData: Omit<InventoryItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    const newItem: InventoryItem = {
      ...newItemData,
      id: Date.now(),
      user_id: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    setInventoryItems([...inventoryItems, newItem]);
    // Update stats
    setStats(prev => ({
      ...prev,
      totalItems: prev.totalItems + 1,
      lowStockItems: newItem.remaining_stock <= 10 ? prev.lowStockItems + 1 : prev.lowStockItems
    }));
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'add': return <Plus className="h-4 w-4 text-green-600" />;
      case 'update': return <Edit className="h-4 w-4 text-blue-600" />;
      case 'delete': return <Trash2 className="h-4 w-4 text-red-600" />;
      case 'vendor': return <Package className="h-4 w-4 text-purple-600" />;
      case 'alert': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent': return <Badge variant="danger" size="sm">Urgent</Badge>;
      case 'high': return <Badge variant="warning" size="sm">High</Badge>;
      case 'medium': return <Badge variant="info" size="sm">Medium</Badge>;
      default: return <Badge variant="neutral" size="sm">Low</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your inventory.</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" size="sm" onClick={() => setShowExportModal(true)}>
            <TrendingUp className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
          <Button variant="primary" size="sm" onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          title="Total Items"
          value={stats.totalItems.toLocaleString()}
          icon={Package}
          color="emerald"
          trend={{ value: 5.2, isPositive: true }}
          subtitle="Active inventory"
          onClick={() => {
            console.log('Total Items clicked');
            setShowDetailedView('total');
          }}
        />
        <StatCard
          title="Low Stock Items"
          value={stats.lowStockItems}
          icon={AlertTriangle}
          color="yellow"
          subtitle="Need attention"
          onClick={() => {
            console.log('Low Stock clicked');
            setShowDetailedView('lowStock');
          }}
        />
        <StatCard
          title="Expiring Soon"
          value={stats.expiringItems}
          icon={Calendar}
          color="red"
          subtitle="Within 3 days"
          onClick={() => {
            console.log('Expiring clicked');
            setShowDetailedView('expiring');
          }}
        />
        <StatCard
          title="Weekly Sales"
          value={`$${stats.weeklySales.toLocaleString()}`}
          icon={DollarSign}
          color="blue"
          trend={{ value: 12.3, isPositive: true }}
          subtitle="Revenue this week"
          onClick={() => {
            console.log('Sales clicked');
            setShowDetailedView('sales');
          }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alerts */}
        <Card>
          <CardHeader
            title="Alerts"
            subtitle="Items that need immediate attention"
            action={
              <Badge variant="warning" size="sm">
                {alerts.length} active
              </Badge>
            }
          />
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{alert.item}</p>
                  <p className="text-sm text-gray-600">
                    {alert.type === 'low-stock' && `Stock: ${alert.stock} (threshold: ${alert.threshold})`}
                    {alert.type === 'expiring' && `Expires: ${formatDate(alert.expiry!)}`}
                    {alert.type === 'out-of-stock' && 'Out of stock'}
                  </p>
                </div>
                <div className="ml-4">
                  {alert.type === 'low-stock' && <Badge variant="warning" size="sm">Low Stock</Badge>}
                  {alert.type === 'expiring' && <Badge variant="danger" size="sm">Expiring</Badge>}
                  {alert.type === 'out-of-stock' && <Badge variant="danger" size="sm">Out of Stock</Badge>}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => setShowShoppingListModal(true)}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              View Full Shopping List
            </Button>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader title="Recent Activity" subtitle="Latest updates to your inventory" />
          <div className="space-y-3">
            {recentActivity.slice(0, 4).map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="mt-1 flex-shrink-0">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-600">{activity.item}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {activity.time} • by {activity.user}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => setShowActivityModal(true)}
            >
              <Clock className="h-4 w-4 mr-2" />
              View All Activity ({recentActivity.length})
            </Button>
          </div>
        </Card>
      </div>

      {/* Detailed View Modal */}
      {showDetailedView && (
        <DetailedView
          type={showDetailedView}
          onClose={() => setShowDetailedView(null)}
          items={inventoryItems}
        />
      )}

      <AddItemModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddItem}
      />

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        inventoryItems={inventoryItems}
      />

      {/* Shopping List Modal */}
      {showShoppingListModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-emerald-100 p-2 rounded-lg">
                    <ShoppingCart className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Shopping List Preview</h2>
                    <p className="text-gray-600 mt-1">Items that need to be restocked</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowShoppingListModal(false)}>
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="space-y-4">
                {shoppingListPreview.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="font-medium text-gray-900">{item.item}</div>
                        {getPriorityBadge(item.priority)}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">{item.reason}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-emerald-600">Qty: {item.quantity}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    Total items: {shoppingListPreview.length}
                  </div>
                  <Button 
                    variant="primary" 
                    onClick={() => {
                      setShowShoppingListModal(false);
                      navigate('/shopping-list');
                    }}
                  >
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Go to Full Shopping List
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activity Modal */}
      {showActivityModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-emerald-100 p-2 rounded-lg">
                    <Clock className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
                    <p className="text-gray-600 mt-1">Complete history of inventory changes</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowActivityModal(false)}>
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="mt-1 flex-shrink-0">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                          <p className="text-sm text-gray-600">{activity.item}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">{activity.time}</p>
                          <p className="text-xs text-gray-400">by {activity.user}</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2 bg-white p-2 rounded border">
                        {activity.details}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-4">
                    Showing {recentActivity.length} recent activities
                  </p>
                  <Button variant="outline" size="sm">
                    Load More Activities
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};