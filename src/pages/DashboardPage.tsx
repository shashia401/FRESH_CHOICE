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
  Edit,
  Trash2
} from 'lucide-react';
import { DashboardStats, InventoryItem } from '../types';
import { formatDate } from '../utils/dateUtils';
import { inventoryApi, dashboardApi } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalItems: 0,
    lowStockItems: 0,
    expiringItems: 0,
    weeklySales: 0
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  const [showDetailedView, setShowDetailedView] = useState<'total' | 'lowStock' | 'expiring' | 'sales' | null>(null);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Load real dashboard data from backend
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoadingStats(true);
        
        // Load all data in parallel
        const [items, dashboardStats, dashboardAlerts, activity] = await Promise.all([
          inventoryApi.getAll(),
          dashboardApi.getStats(),
          dashboardApi.getAlerts(),
          dashboardApi.getRecentActivity()
        ]);
        
        setInventoryItems(items);
        setStats(dashboardStats);
        setAlerts(dashboardAlerts);
        setRecentActivity(activity);
        
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        // Fallback to calculating stats from inventory data
        try {
          const items = await inventoryApi.getAll();
          setInventoryItems(items);
          
          const today = new Date();
          const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
          
          const totalItems = items.length;
          const lowStockItems = items.filter((item: InventoryItem) => item.remaining_stock <= 10).length;
          const expiringItems = items.filter((item: InventoryItem) => {
            if (!item.expiration_date) return false;
            const expDate = new Date(item.expiration_date);
            return expDate <= nextWeek;
          }).length;
          const weeklySales = items.reduce((sum: number, item: InventoryItem) => sum + (item.sales_weekly || 0), 0);
          
          setStats({
            totalItems,
            lowStockItems,
            expiringItems,
            weeklySales
          });
        } catch (fallbackError) {
          console.error('Fallback data loading failed:', fallbackError);
        }
      } finally {
        setIsLoadingStats(false);
      }
    };
    
    loadDashboardData();
  }, []);

  const handleCloseDetailedView = () => {
    setShowDetailedView(null);
  };

  const handleAddItem = async (item: Omit<InventoryItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      // Add item via API
      await inventoryApi.create(item);
      setShowAddModal(false);
      
      // Refresh dashboard data
      const [items, dashboardStats, dashboardAlerts, activity] = await Promise.all([
        inventoryApi.getAll(),
        dashboardApi.getStats(),
        dashboardApi.getAlerts(),
        dashboardApi.getRecentActivity()
      ]);
      
      setInventoryItems(items);
      setStats(dashboardStats);
      setAlerts(dashboardAlerts);
      setRecentActivity(activity);
      
    } catch (error) {
      console.error('Failed to add item:', error);
    }
  };

  const handleExport = (data: any) => {
    console.log('Exporting data:', data);
    setShowExportModal(false);
  };

  const filteredItems = () => {
    if (showDetailedView === 'lowStock') {
      return inventoryItems.filter((item: InventoryItem) => item.remaining_stock <= 10);
    } else if (showDetailedView === 'expiring') {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      return inventoryItems.filter((item: InventoryItem) => {
        if (!item.expiration_date) return false;
        const expDate = new Date(item.expiration_date);
        return expDate <= nextWeek;
      });
    }
    return inventoryItems;
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'low-stock':
      case 'out-of-stock':
        return <Package className="w-4 h-4" />;
      case 'expiring':
        return <Clock className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'out-of-stock':
        return 'text-red-600 bg-red-50';
      case 'low-stock':
        return 'text-orange-600 bg-orange-50';
      case 'expiring':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'add':
        return <Plus className="w-4 h-4 text-green-600" />;
      case 'update':
        return <Edit className="w-4 h-4 text-blue-600" />;
      case 'delete':
        return <Trash2 className="w-4 h-4 text-red-600" />;
      default:
        return <Package className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of your inventory status</p>
        </div>
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowExportModal(true)}
          >
            Export Data
          </Button>
          <Button 
            variant="primary" 
            size="sm" 
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Items"
          value={isLoadingStats ? "..." : stats.totalItems.toString()}
          icon={Package}
          color="emerald"
          trend={{ value: 12, isPositive: true }}
          onClick={() => setShowDetailedView('total')}
        />
        <StatCard
          title="Low Stock"
          value={isLoadingStats ? "..." : stats.lowStockItems.toString()}
          icon={AlertTriangle}
          color="yellow"
          trend={{ value: 5, isPositive: false }}
          onClick={() => setShowDetailedView('lowStock')}
        />
        <StatCard
          title="Expiring Soon"
          value={isLoadingStats ? "..." : stats.expiringItems.toString()}
          icon={Calendar}
          color="red"
          trend={{ value: 2, isPositive: false }}
          onClick={() => setShowDetailedView('expiring')}
        />
        <StatCard
          title="Weekly Sales"
          value={isLoadingStats ? "..." : `$${stats.weeklySales.toLocaleString()}`}
          icon={DollarSign}
          color="blue"
          trend={{ value: 8, isPositive: true }}
          onClick={() => setShowDetailedView('sales')}
        />
      </div>

      {/* Detailed View Modal */}
      {showDetailedView && (
        <DetailedView
          type={showDetailedView}
          items={filteredItems()}
          onClose={handleCloseDetailedView}
        />
      )}

      {/* Quick Actions & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card className="p-6">
          <div className="pb-4">
            <h3 className="text-lg font-semibold">Quick Actions</h3>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/inventory')}
              className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <Package className="w-5 h-5 text-blue-600 mr-3" />
                <span className="font-medium">Manage Inventory</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </button>
            <button
              onClick={() => navigate('/shopping-list')}
              className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <ShoppingCart className="w-5 h-5 text-green-600 mr-3" />
                <span className="font-medium">Shopping List</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </button>
            <button
              onClick={() => navigate('/reports')}
              className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <TrendingUp className="w-5 h-5 text-purple-600 mr-3" />
                <span className="font-medium">View Reports</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </Card>

        {/* Alerts */}
        <Card className="p-6">
          <div className="pb-4">
            <h3 className="text-lg font-semibold">Alerts</h3>
          </div>
          <div className="space-y-3">
            {alerts.slice(0, 4).map((alert) => (
              <div key={alert.id} className={`p-3 rounded-lg flex items-start space-x-3 ${getAlertColor(alert.type)}`}>
                {getAlertIcon(alert.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{alert.item}</p>
                  <p className="text-xs opacity-75">
                    {alert.type === 'low-stock' && `Stock: ${alert.stock} (Threshold: ${alert.threshold})`}
                    {alert.type === 'out-of-stock' && 'Out of stock'}
                    {alert.type === 'expiring' && `Expires: ${formatDate(alert.expiry)}`}
                  </p>
                </div>
              </div>
            ))}
            {alerts.length === 0 && (
              <div className="text-center py-4 text-gray-500 text-sm">
                No alerts at the moment
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <div className="pb-4">
          <h3 className="text-lg font-semibold">Recent Activity</h3>
        </div>
        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.action}: {activity.item}
                  </p>
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{activity.details}</p>
                <p className="text-xs text-gray-500 mt-1">By: {activity.user}</p>
              </div>
            </div>
          ))}
          {recentActivity.length === 0 && (
            <div className="text-center py-4 text-gray-500 text-sm">
              No recent activity
            </div>
          )}
        </div>
      </Card>

      {/* Modals */}
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
    </div>
  );
};
