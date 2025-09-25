import React from 'react';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Settings, Bell, Shield, Database, Download } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your application preferences and configuration</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Account Settings */}
          <Card>
            <CardHeader title="Account Settings" subtitle="Manage your account information" />
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Username" value="admin_user" />
                <Input label="Email" type="email" value="admin@freshchoice.com" />
              </div>
              <Input label="Company Name" value="Fresh Choice Market" />
              <div className="flex justify-end">
                <Button variant="primary">Update Account</Button>
              </div>
            </div>
          </Card>

          {/* Inventory Settings */}
          <Card>
            <CardHeader title="Inventory Settings" subtitle="Configure stock thresholds and alerts" />
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Low Stock Threshold" type="number" value="10" />
                <Input label="Expiry Warning (days)" type="number" value="3" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Default Category" value="General" />
                <Input label="Default Location" value="Warehouse A" />
              </div>
              <div className="flex justify-end">
                <Button variant="primary">Save Settings</Button>
              </div>
            </div>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader title="Notifications" subtitle="Configure alert preferences" />
            <div className="space-y-4">
              {[
                { label: 'Low Stock Alerts', description: 'Get notified when items fall below threshold' },
                { label: 'Expiry Warnings', description: 'Alert when items are nearing expiration' },
                { label: 'Weekly Reports', description: 'Receive weekly inventory summary' },
                { label: 'Vendor Updates', description: 'Notifications about vendor changes' }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{item.label}</div>
                    <div className="text-sm text-gray-600">{item.description}</div>
                  </div>
                  <Badge variant="success">Enabled</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Quick Actions Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader title="Quick Actions" />
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Database className="h-4 w-4 mr-2" />
                Backup Database
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Bell className="h-4 w-4 mr-2" />
                Test Notifications
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Shield className="h-4 w-4 mr-2" />
                Security Check
              </Button>
            </div>
          </Card>

          <Card>
            <CardHeader title="System Info" />
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Version</span>
                <span className="text-sm font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Database</span>
                <Badge variant="success" size="sm">Connected</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Last Backup</span>
                <span className="text-sm font-medium">2 hours ago</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Storage Used</span>
                <span className="text-sm font-medium">245 MB</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};