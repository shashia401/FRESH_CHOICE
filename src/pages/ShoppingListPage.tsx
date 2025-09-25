import React, { useState, useEffect } from 'react';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Plus, Check, Trash2, ShoppingCart, Search, Package, X } from 'lucide-react';
import { ShoppingListItem, InventoryItem } from '../types';

export const ShoppingListPage: React.FC = () => {
  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState(1);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [inventorySearch, setInventorySearch] = useState('');
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<InventoryItem | null>(null);
  const [addQuantity, setAddQuantity] = useState(1);

  // Mock shopping list data
  useEffect(() => {
    const mockItems: ShoppingListItem[] = [
      { id: 1, user_id: 1, inventory_id: 1, item_name: 'Whole Milk - Organic', quantity: 20, purchased: false },
      { id: 2, user_id: 1, inventory_id: 2, item_name: 'Organic Apples - Honeycrisp', quantity: 50, purchased: false },
      { id: 3, user_id: 1, item_name: 'Paper Towels', quantity: 12, purchased: true },
      { id: 4, user_id: 1, item_name: 'Cleaning Supplies', quantity: 5, purchased: false },
    ];
    setItems(mockItems);
  }, []);

  // Mock inventory data
  useEffect(() => {
    const mockInventoryItems: InventoryItem[] = [
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
      // Add more mock items
      ...Array.from({ length: 20 }, (_, i) => ({
        id: i + 4,
        user_id: 1,
        category: ['Produce', 'Dairy', 'Bakery', 'Meat', 'Beverages'][i % 5],
        brand: ['Fresh Farms', 'Organic Valley', 'Local Bakery', 'Premium Meats', 'Pure Beverages'][i % 5],
        department: 'General',
        item_sku: `ITEM-${String(i + 4).padStart(3, '0')}`,
        item_upc: `${123456789000 + i + 4}`,
        description: `Product ${i + 4} - ${['Organic', 'Fresh', 'Premium', 'Local', 'Natural'][i % 5]}`,
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
    setInventoryItems(mockInventoryItems);
  }, []);

  const handleAddItem = () => {
    if (newItemName.trim()) {
      const newItem: ShoppingListItem = {
        id: Date.now(),
        user_id: 1,
        item_name: newItemName.trim(),
        quantity: newItemQuantity,
        purchased: false
      };
      setItems([...items, newItem]);
      setNewItemName('');
      setNewItemQuantity(1);
    }
  };

  const handleAddFromInventory = (inventoryItem: InventoryItem, quantity: number) => {
    // Check if item already exists in shopping list
    const existingItem = items.find(item => item.inventory_id === inventoryItem.id);
    
    if (existingItem) {
      // Update quantity if item already exists
      setItems(items.map(item => 
        item.inventory_id === inventoryItem.id 
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      // Add new item to shopping list
      const newItem: ShoppingListItem = {
        id: Date.now(),
        user_id: 1,
        inventory_id: inventoryItem.id,
        item_name: inventoryItem.description,
        quantity: quantity,
        purchased: false
      };
      setItems([...items, newItem]);
    }
    
    setShowInventoryModal(false);
    setSelectedInventoryItem(null);
    setAddQuantity(1);
    setInventorySearch('');
  };

  const handleTogglePurchased = (id: number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, purchased: !item.purchased } : item
    ));
  };

  const handleDeleteItem = (id: number) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleQuantityChange = (id: number, quantity: number) => {
    if (quantity > 0) {
      setItems(items.map(item => 
        item.id === id ? { ...item, quantity } : item
      ));
    }
  };

  // Filter inventory items based on search
  const filteredInventoryItems = inventoryItems.filter(item =>
    item.description.toLowerCase().includes(inventorySearch.toLowerCase()) ||
    item.category.toLowerCase().includes(inventorySearch.toLowerCase()) ||
    item.brand.toLowerCase().includes(inventorySearch.toLowerCase()) ||
    (item.item_sku && item.item_sku.toLowerCase().includes(inventorySearch.toLowerCase()))
  );

  const totalItems = items.length;
  const purchasedItems = items.filter(item => item.purchased).length;
  const remainingItems = totalItems - purchasedItems;
  const completionPercentage = totalItems > 0 ? (purchasedItems / totalItems) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shopping List</h1>
          <p className="text-gray-600 mt-1">Track items you need to purchase</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="secondary" size="sm" onClick={() => setShowInventoryModal(true)}>
            <Package className="h-4 w-4 mr-2" />
            Add from Inventory
          </Button>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-sm text-gray-600">Progress</div>
            <div className="text-lg font-bold text-emerald-600">
              {Math.round(completionPercentage)}%
            </div>
          </div>
          <div className="w-20 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{totalItems}</div>
            <div className="text-sm text-gray-600">Total Items</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600">{purchasedItems}</div>
            <div className="text-sm text-gray-600">Purchased</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{remainingItems}</div>
            <div className="text-sm text-gray-600">Remaining</div>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Add New Item" />
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="Item name"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            className="flex-1"
          />
          <Input
            type="number"
            placeholder="Qty"
            value={newItemQuantity}
            onChange={(e) => setNewItemQuantity(parseInt(e.target.value) || 1)}
            className="w-20"
            min={1}
          />
          <Button onClick={handleAddItem} disabled={!newItemName.trim()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Manual Item
          </Button>
          <Button variant="secondary" onClick={() => setShowInventoryModal(true)}>
            <Package className="h-4 w-4 mr-2" />
            Add from Inventory
          </Button>
        </div>
      </Card>

      <Card>
        <CardHeader 
          title="Shopping List Items" 
          subtitle={`${remainingItems} items remaining`}
          action={
            <Badge variant={remainingItems === 0 ? 'success' : 'neutral'}>
              {remainingItems === 0 ? 'Complete' : `${remainingItems} pending`}
            </Badge>
          }
        />
        <div className="space-y-3">
          {items.map((item) => (
            <div 
              key={item.id}
              className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-200 ${
                item.purchased 
                  ? 'bg-green-50 border-green-200 opacity-75' 
                  : 'bg-white border-gray-200 hover:border-emerald-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleTogglePurchased(item.id)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                    item.purchased
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'border-gray-300 hover:border-emerald-400'
                  }`}
                >
                  {item.purchased && <Check className="h-4 w-4" />}
                </button>
                <div>
                  <div className={`font-medium ${item.purchased ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                    {item.item_name}
                  </div>
                  {item.inventory_id && (
                    <div className="text-xs text-blue-600 mt-1">Auto-generated from inventory</div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                    className="w-16 text-center font-medium border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400"
                    min="1"
                  />
                  <button
                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                    className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteItem(item.id)}
                  className="text-red-600 hover:text-red-700 hover:border-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          
          {items.length === 0 && (
            <div className="text-center py-12">
              <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Your shopping list is empty</p>
              <p className="text-sm text-gray-500 mt-2">Add items manually or they'll be auto-generated from low stock inventory</p>
            </div>
          )}
        </div>
      </Card>

      {/* Inventory Selection Modal */}
      {showInventoryModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-emerald-100 p-2 rounded-lg">
                    <Package className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Add from Inventory</h2>
                    <p className="text-gray-600 mt-1">Select items from your inventory to add to shopping list</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowInventoryModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Search */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-500 h-5 w-5" />
                  <Input
                    placeholder="Search inventory items..."
                    value={inventorySearch}
                    onChange={(e) => setInventorySearch(e.target.value)}
                    className="pl-12"
                  />
                </div>
              </div>

              {/* Inventory Items Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {filteredInventoryItems.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                      selectedInventoryItem?.id === item.id
                        ? 'border-emerald-400 bg-emerald-50 shadow-md'
                        : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50'
                    }`}
                    onClick={() => setSelectedInventoryItem(item)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="bg-gray-100 p-2 rounded-lg">
                        <Package className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.description}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="info" size="sm">{item.category}</Badge>
                          <Badge variant="neutral" size="sm">{item.brand}</Badge>
                        </div>
                        <div className="text-sm text-gray-600 mt-2">
                          <div>Stock: {item.remaining_stock}</div>
                          <div>Location: {item.aisle} {item.row} {item.bin}</div>
                          {item.pack_size && <div>Size: {item.pack_size}</div>}
                        </div>
                        {selectedInventoryItem?.id === item.id && (
                          <Badge variant="success" size="sm" className="mt-2">
                            Selected
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredInventoryItems.length === 0 && (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No inventory items found</p>
                  <p className="text-sm text-gray-500 mt-2">Try adjusting your search terms</p>
                </div>
              )}

              {/* Quantity Selection */}
              {selectedInventoryItem && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                    <h3 className="font-medium text-emerald-800 mb-3">Selected Item</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{selectedInventoryItem.description}</div>
                        <div className="text-sm text-gray-600">
                          {selectedInventoryItem.category} • {selectedInventoryItem.brand}
                        </div>
                        <div className="text-sm text-gray-600">
                          Current Stock: {selectedInventoryItem.remaining_stock}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setAddQuantity(Math.max(1, addQuantity - 1))}
                              className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                            >
                              -
                            </button>
                            <span className="w-12 text-center font-medium">{addQuantity}</span>
                            <button
                              onClick={() => setAddQuantity(addQuantity + 1)}
                              className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setShowInventoryModal(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={() => selectedInventoryItem && handleAddFromInventory(selectedInventoryItem, addQuantity)}
                  disabled={!selectedInventoryItem}
                >
                  Add to Shopping List
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};