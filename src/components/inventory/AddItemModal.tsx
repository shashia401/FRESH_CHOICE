import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { X, Package, Scan } from 'lucide-react';
import { InventoryItem } from '../../types';

interface AddItemFormData {
  description: string;
  category: string;
  brand: string;
  department: string;
  item_sku?: string;
  item_upc?: string;
  pack_size?: string;
  qty_shipped: number;
  remaining_stock: number;
  items_per_carton?: number;
  location?: string;
  aisle?: string;
  row?: string;
  bin?: string;
  expiration_date?: string;
  unit_cost?: number;
  vendor_cost?: number;
  cust_cost_each?: number;
  unit_retail?: number;
  vendor_id?: number;
  vendor_name?: string;
  advertising_flag: boolean;
  order_type: string;
}

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: Omit<InventoryItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void;
  scannedBarcode?: string;
}

export const AddItemModal: React.FC<AddItemModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  scannedBarcode
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'location' | 'pricing'>('basic');

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<AddItemFormData>({
    defaultValues: {
      qty_shipped: 0,
      remaining_stock: 0,
      advertising_flag: false,
      order_type: 'Regular',
      item_upc: scannedBarcode || ''
    }
  });

  React.useEffect(() => {
    if (scannedBarcode) {
      setValue('item_upc', scannedBarcode);
    }
  }, [scannedBarcode, setValue]);

  const onSubmit = async (data: AddItemFormData) => {
    setIsLoading(true);
    
    try {
      // Calculate derived fields
      const grossMargin = data.unit_cost && data.unit_retail 
        ? (data.unit_retail - data.unit_cost) / data.unit_retail 
        : 0;

      const newItem: Omit<InventoryItem, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
        ...data,
        sales_weekly: 0, // Default to 0 for new items
        gross_margin: grossMargin,
        burd_unit_cost: data.unit_cost,
        burd_gross_margin: grossMargin,
        discount_allowance: 0,
        cust_cost_extended: data.cust_cost_each ? data.cust_cost_each * data.remaining_stock : undefined
      };

      onAdd(newItem);
      reset();
      onClose();
    } catch (error) {
      console.error('Error adding item:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  const categories = ['Produce', 'Dairy', 'Bakery', 'Meat', 'Beverages', 'Pantry', 'Frozen', 'Deli', 'Other'];
  const departments = ['Produce', 'Refrigerated', 'Bakery', 'Meat', 'Beverages', 'Pantry', 'Frozen', 'Deli', 'General'];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-emerald-100 p-2 rounded-lg">
                <Package className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Add New Item</h2>
                <p className="text-gray-600 mt-1">Add a new product to your inventory</p>
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
              { id: 'basic', label: 'Basic Info' },
              { id: 'location', label: 'Stock Info & Location' },
              { id: 'pricing', label: 'Pricing & Vendor' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-emerald-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Product Description *"
                    placeholder="e.g., Organic Whole Milk"
                    {...register('description', { required: 'Product description is required' })}
                    error={errors.description?.message}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                    <select
                      {...register('category', { required: 'Category is required' })}
                      className="block w-full px-4 py-3 border-2 border-emerald-200 rounded-xl text-sm bg-emerald-50/30 placeholder-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400 transition-all duration-300 hover:border-emerald-300 focus:bg-white"
                    >
                      <option value="">Select category</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    {errors.category && <p className="text-sm text-red-600 mt-1">{errors.category.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Brand"
                    placeholder="e.g., Organic Valley"
                    {...register('brand')}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <select
                      {...register('department')}
                      className="block w-full px-4 py-3 border-2 border-emerald-200 rounded-xl text-sm bg-emerald-50/30 placeholder-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400 transition-all duration-300 hover:border-emerald-300 focus:bg-white"
                    >
                      <option value="">Select department</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="SKU"
                    placeholder="e.g., OV-MILK-001"
                    {...register('item_sku')}
                  />
                  <div className="relative">
                    <Input
                      label="UPC/Barcode *"
                      placeholder="e.g., 123456789012"
                      {...register('item_upc', { 
                        required: 'UPC Code is required',
                        pattern: {
                          value: /^\d{8,14}$/,
                          message: 'UPC must be 8-14 digits'
                        }
                      })}
                      error={errors.item_upc?.message}
                    />
                    {scannedBarcode && (
                      <div className="absolute right-3 top-8 text-emerald-600">
                        <Scan className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                  <Input
                    label="Pack Size"
                    placeholder="e.g., 1 Gallon"
                    {...register('pack_size')}
                  />
                </div>

                <Input
                  label="Expiration Date"
                  type="date"
                  {...register('expiration_date')}
                />
              </div>
            )}

            {/* Location & Stock Tab */}
            {activeTab === 'location' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Quantity Shipped *"
                    type="number"
                    min="0"
                    {...register('qty_shipped', { 
                      required: 'Quantity shipped is required',
                      min: { value: 0, message: 'Quantity must be 0 or greater' }
                    })}
                    error={errors.qty_shipped?.message}
                  />
                  <Input
                    label="Current Stock *"
                    type="number"
                    min="0"
                    {...register('remaining_stock', { 
                      required: 'Current stock is required',
                      min: { value: 0, message: 'Stock must be 0 or greater' }
                    })}
                    error={errors.remaining_stock?.message}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Items per Carton"
                    type="number"
                    min="1"
                    placeholder="e.g., 12"
                    {...register('items_per_carton', { 
                      min: { value: 1, message: 'Items per carton must be 1 or greater' }
                    })}
                    error={errors.items_per_carton?.message}
                  />
                  <div className="flex items-end">
                    <div className="text-sm text-gray-600">
                      <div className="font-medium">Stock Summary</div>
                      <div className="mt-1">Total units available for sale</div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Input
                    label="Location"
                    placeholder="e.g., Warehouse A"
                    {...register('location')}
                  />
                  <Input
                    label="Aisle"
                    placeholder="e.g., A1"
                    {...register('aisle')}
                  />
                  <Input
                    label="Row"
                    placeholder="e.g., 2"
                    {...register('row')}
                  />
                  <Input
                    label="Bin"
                    placeholder="e.g., B3"
                    {...register('bin')}
                  />
                </div>
              </div>
            )}

            {/* Pricing & Vendor Tab */}
            {activeTab === 'pricing' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Unit Cost"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    {...register('unit_cost', { 
                      min: { value: 0, message: 'Cost must be 0 or greater' }
                    })}
                    error={errors.unit_cost?.message}
                  />
                  <Input
                    label="Vendor Cost"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    {...register('vendor_cost', { 
                      min: { value: 0, message: 'Cost must be 0 or greater' }
                    })}
                    error={errors.vendor_cost?.message}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Customer Cost (Each)"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    {...register('cust_cost_each', { 
                      min: { value: 0, message: 'Price must be 0 or greater' }
                    })}
                    error={errors.cust_cost_each?.message}
                  />
                  <Input
                    label="Unit Retail Price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    {...register('unit_retail', { 
                      min: { value: 0, message: 'Price must be 0 or greater' }
                    })}
                    error={errors.unit_retail?.message}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Vendor ID"
                    type="number"
                    min="1"
                    placeholder="1"
                    {...register('vendor_id', { 
                      min: { value: 1, message: 'Vendor ID must be 1 or greater' }
                    })}
                    error={errors.vendor_id?.message}
                  />
                  <Input
                    label="Vendor Name"
                    placeholder="e.g., Fresh Farms Co."
                    {...register('vendor_name')}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Order Type</label>
                    <select
                      {...register('order_type')}
                      className="block w-full px-4 py-3 border-2 border-emerald-200 rounded-xl text-sm bg-emerald-50/30 placeholder-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400 transition-all duration-300 hover:border-emerald-300 focus:bg-white"
                    >
                      <option value="Regular">Regular</option>
                      <option value="Premium">Premium</option>
                      <option value="Bulk">Bulk</option>
                      <option value="Special">Special</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="advertising_flag"
                        {...register('advertising_flag')}
                        className="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500 focus:ring-2"
                      />
                      <label htmlFor="advertising_flag" className="text-sm font-medium text-gray-700">
                        Featured in advertising
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-between pt-6 border-t border-gray-200">
              <div className="flex space-x-3">
                {activeTab !== 'basic' && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (activeTab === 'location') setActiveTab('basic');
                      if (activeTab === 'pricing') setActiveTab('location');
                    }}
                  >
                    Previous
                  </Button>
                )}
              </div>
              
              <div className="flex space-x-3">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                
                {activeTab !== 'pricing' ? (
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => {
                      if (activeTab === 'basic') setActiveTab('location');
                      if (activeTab === 'location') setActiveTab('pricing');
                    }}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isLoading}
                  >
                    Add Item
                  </Button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};