import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { InventoryTable } from '../components/inventory/InventoryTable';
import { InventoryFilters } from '../components/inventory/InventoryFilters';
import { BarcodeScanner } from '../components/inventory/BarcodeScanner';
import { AddItemModal } from '../components/inventory/AddItemModal';
import { EditItemModal } from '../components/inventory/EditItemModal';
import { ImportModal } from '../components/inventory/ImportModal';
import { ExportModal } from '../components/inventory/ExportModal';
import { Plus, Download, Upload, Scan } from 'lucide-react';
import { InventoryItem } from '../types';

export const InventoryPage: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [showScanner, setShowScanner] = useState(false);
  const [scannedCode, setScannedCode] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // Mock data
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
        remaining_stock: 0,
        sales_weekly: 25,
        aisle: 'P1',
        row: '1',
        bin: 'A1',
        expiration_date: '2025-02-15',
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
        expiration_date: '2025-01-25',
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
      }
    ];
    setItems(mockItems);
    setFilteredItems(mockItems);
  }, []);

  // Filter items based on search and filters
  useEffect(() => {
    let filtered = items;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.item_sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.item_upc?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Status filter
    if (selectedStatus !== 'All') {
      filtered = filtered.filter(item => {
        if (selectedStatus === 'Out of Stock') return item.remaining_stock === 0;
        if (selectedStatus === 'Low Stock') return item.remaining_stock <= 10 && item.remaining_stock > 0;
        if (selectedStatus === 'In Stock') return item.remaining_stock > 10;
        if (selectedStatus === 'Expiring Soon') {
          if (!item.expiration_date) return false;
          const expiry = new Date(item.expiration_date);
          const today = new Date();
          const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          return daysUntilExpiry <= 3 && daysUntilExpiry >= 0;
        }
        return true;
      });
    }

    setFilteredItems(filtered);
  }, [items, searchTerm, selectedCategory, selectedStatus]);

  const handleEdit = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowEditModal(true);
  };

  const handleSave = (updatedItem: InventoryItem) => {
    setItems(items.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    ));
  };

  const handleDelete = (id: number) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleScanSuccess = (decodedText: string) => {
    setScannedCode(decodedText);
    setShowScanner(false);
    
    // Search for existing item with this barcode
    const existingItem = items.find(item => 
      item.item_upc === decodedText || item.item_sku === decodedText
    );
    
    if (existingItem) {
      // If item exists, highlight it in the search
      setSearchTerm(decodedText);
      // You could also show a notification here
      console.log('Found existing item:', existingItem.description);
    } else {
      // If item doesn't exist, you could open an "Add Item" form with the barcode pre-filled
      console.log('New barcode scanned:', decodedText);
      // For now, just set it in search to show no results
      setSearchTerm(decodedText);
    }
  };

  const handleAddItem = (newItemData: Omit<InventoryItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    const newItem: InventoryItem = {
      ...newItemData,
      id: Date.now(), // In a real app, this would be generated by the backend
      user_id: 1, // Current user ID
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    setItems([...items, newItem]);
    console.log('New item added:', newItem);
  };

  const handleImportItems = (newItems: Omit<InventoryItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>[]) => {
    const importedItems: InventoryItem[] = newItems.map((itemData, index) => ({
      ...itemData,
      id: Date.now() + index, // In a real app, this would be generated by the backend
      user_id: 1, // Current user ID
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    
    setItems([...items, ...importedItems]);
    console.log(`${importedItems.length} items imported successfully`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600 mt-1">Manage your stock levels and track inventory</p>
        </div>
        <div className="flex space-x-3">
          <Button 
            variant="secondary" 
            size="sm"
            onClick={() => setShowScanner(true)}
            className="bg-gradient-to-r from-teal-600 to-emerald-600"
          >
            <Scan className="h-4 w-4 mr-2" />
            Scan Product
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowImportModal(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Import CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowExportModal(true)}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="primary" size="sm" onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      <InventoryFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-600">
            Showing {filteredItems.length} of {items.length} items
          </p>
        </div>
        
        <InventoryTable
          items={filteredItems}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <BarcodeScanner
        isOpen={showScanner}
        onScanSuccess={handleScanSuccess}
        onClose={() => setShowScanner(false)}
      />

      <AddItemModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddItem}
        scannedBarcode={scannedCode}
      />

      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImportItems}
      />

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        inventoryItems={items}
      />

      <EditItemModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedItem(null);
        }}
        onSave={handleSave}
        item={selectedItem}
      />
    </div>
  );
};