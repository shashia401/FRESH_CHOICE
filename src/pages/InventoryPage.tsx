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
import { inventoryApi } from '../utils/api';

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

  // Load inventory data from backend
  useEffect(() => {
    const loadInventoryData = async () => {
      try {
        const data = await inventoryApi.getAll();
        setItems(data);
        setFilteredItems(data);
      } catch (error) {
        console.error('Failed to load inventory:', error);
        // Show empty state if backend fails
        setItems([]);
        setFilteredItems([]);
      }
    };

    loadInventoryData();
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

  const handleSave = async (updatedItem: InventoryItem) => {
    try {
      await inventoryApi.update(updatedItem.id, updatedItem);
      // Reload data from backend
      const data = await inventoryApi.getAll();
      setItems(data);
      setFilteredItems(data);
    } catch (error) {
      console.error('Failed to update item:', error);
      alert('Failed to update item. Please try again.');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await inventoryApi.delete(id);
      // Reload data from backend
      const data = await inventoryApi.getAll();
      setItems(data);
      setFilteredItems(data);
    } catch (error) {
      console.error('Failed to delete item:', error);
      alert('Failed to delete item. Please try again.');
    }
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

  const handleAddItem = async (newItemData: Omit<InventoryItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      await inventoryApi.create(newItemData);
      // Reload data from backend
      const data = await inventoryApi.getAll();
      setItems(data);
      setFilteredItems(data);
      console.log('New item added successfully');
    } catch (error) {
      console.error('Failed to add item:', error);
      alert('Failed to add item. Please try again.');
    }
  };

  const handleImportItems = async (newItems: Omit<InventoryItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>[]) => {
    try {
      // Use bulk import endpoint
      const result = await inventoryApi.bulkCreate(newItems);
      
      if (result.success > 0) {
        // Reload data from backend
        const data = await inventoryApi.getAll();
        setItems(data);
        setFilteredItems(data);
        
        if (result.errors.length > 0) {
          // Show partial success message with error details
          alert(`Successfully imported ${result.success} items. ${result.errors.length} items failed: ${result.errors.map((e: any) => `Row ${e.index + 1}: ${e.error}`).join(', ')}`);
        } else {
          alert(`Successfully imported ${result.success} items.`);
        }
      } else {
        alert('No items were imported. Please check the file format and try again.');
      }
    } catch (error) {
      console.error('Failed to import items:', error);
      alert('Failed to import items. Please try again.');
    }
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
