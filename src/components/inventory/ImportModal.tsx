import React, { useState, useRef } from 'react';
import { Card, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { X, Upload, FileSpreadsheet, CheckCircle, AlertCircle, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { InventoryItem } from '../../types';
import { settingsApi } from '../../utils/api';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (items: Omit<InventoryItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>[]) => void;
}

interface ImportResult {
  success: number;
  errors: { row: number; error: string }[];
  items: Omit<InventoryItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>[];
}

export const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onImport }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      alert('Please select a valid Excel or CSV file');
      return;
    }

    setIsProcessing(true);
    setImportResult(null);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { 
        type: 'array',
        // Enhanced CSV parsing options
        raw: false,
        cellDates: true,
        dateNF: 'yyyy-mm-dd'
      });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        // Better handling of empty cells and data types
        defval: '',
        blankrows: false,
        raw: false
      });

      // Use real API validation instead of mock validation
      const result = await validateImportData(jsonData);
      setImportResult(result);
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Error processing file. Please check the format and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const validateImportData = async (data: any[]): Promise<ImportResult> => {
    try {
      // Use real API validation
      const validationResult = await settingsApi.validateImport(data);
      
      if (validationResult.errors && validationResult.errors.length > 0) {
        return {
          success: validationResult.validItems?.length || 0,
          errors: validationResult.errors,
          items: validationResult.validItems || []
        };
      }
      
      // If API validation succeeds, return the processed items
      return {
        success: validationResult.validItems?.length || 0,
        errors: [],
        items: validationResult.validItems || []
      };
    } catch (error) {
      console.error('API validation failed, falling back to local validation:', error);
      // Fallback to local validation if API fails
      return processImportData(data);
    }
  };

  const processImportData = (data: any[]): ImportResult => {
    const items: Omit<InventoryItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>[] = [];
    const errors: { row: number; error: string }[] = [];

    data.forEach((row, index) => {
      try {
        // Skip empty rows or header-like rows
        if (!row || Object.values(row).every(val => !val || val === '')) {
          return;
        }

        // Skip rows that appear to be category headers (like "PRODUCE" row)
        if (row['Category'] === '0' || !row['Item_UPC'] || row['Item_UPC'].toString().trim() === '') {
          return;
        }

        // Map Excel columns to our inventory fields (flexible column mapping)
        const item: Omit<InventoryItem, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
          // Handle invoice CSV format
          invoice_no: row['Invoice_No'] || '',
          invoice_delivery_date: row['Invoice_Delivery_Date'] || '',
          description: row['Description'] || row['Product Name'] || row['description'] || row['DESCRIPTION'] || row['Item Name'] || row['Product'] || '',
          category: getCategoryName(row['Category']) || row['category'] || row['CATEGORY'] || row['Cat'] || 'General',
          brand: row['Brand'] || row['brand'] || row['BRAND'] || row['Manufacturer'] || '',
          department: row['Department'] || row['department'] || row['DEPARTMENT'] || row['Dept'] || 'General',
          item_sku: row['Item_SKU'] || row['SKU'] || row['sku'] || row['Item SKU'] || row['ITEM_SKU'] || row['Code'] || '',
          item_upc: row['Item_UPC'] || row['UPC'] || row['upc'] || row['Barcode'] || row['BARCODE'] || row['UPC Code'] || '',
          pack_size: (row['Pack'] && row['Size']) ? `${row['Pack']} ${row['Size']}` : row['Pack Size'] || row['pack_size'] || row['PACK_SIZE'] || row['Size'] || '',
          qty_shipped: parseInt(row['Qty_Shipped'] || row['Qty Shipped'] || row['qty_shipped'] || '0') || 0,
          remaining_stock: parseInt(row['Qty_Shipped'] || row['Stock'] || row['remaining_stock'] || row['Current Stock'] || row['STOCK'] || row['Inventory'] || '0') || 0,
          sales_weekly: parseInt(row['Weekly Sales'] || row['sales_weekly'] || row['WEEKLY_SALES'] || row['Sales'] || '0') || 0,
          location: row['Location'] || row['location'] || row['LOCATION'] || row['Warehouse'] || '',
          aisle: row['Aisle'] || row['aisle'] || row['AISLE'] || '',
          row: row['Row'] || row['row'] || row['ROW'] || '',
          bin: row['Bin'] || row['bin'] || row['BIN'] || '',
          expiration_date: row['Expiration Date'] || row['expiration_date'] || row['EXPIRATION_DATE'] || row['Expiry'] || row['Exp Date'] || '',
          // Invoice-specific fields
          unit_cost: parseFloat(String(row['Unit_Cost'] || row['Unit Cost'] || row['unit_cost'] || row['UNIT_COST'] || row['Cost'] || '0').replace(/[$,]/g, '')) || 0,
          vendor_cost: parseFloat(String(row['Vendor_Cost'] || row['Vendor Cost'] || row['vendor_cost'] || row['VENDOR_COST'] || '0').replace(/[$,]/g, '')) || 0,
          cust_cost_each: parseFloat(String(row['Cust_Cost_Each'] || row['Customer Cost'] || row['cust_cost_each'] || row['CUSTOMER_COST'] || row['Price'] || '0').replace(/[$,]/g, '')) || 0,
          cust_cost_extended: parseFloat(String(row['Cust_Cost_Extended'] || row['Extended Cost'] || row['cust_cost_extended'] || '0').replace(/[$,]/g, '')) || 0,
          unit_retail: parseFloat(String(row['Unit_Retail'] || row['Retail Price'] || row['unit_retail'] || row['RETAIL_PRICE'] || row['Retail'] || '0').replace(/[$,]/g, '')) || 0,
          gross_margin: parseFloat(String(row['Gross_Margin'] || row['Gross Margin'] || row['gross_margin'] || '0').replace(/[%]/g, '')) / 100 || 0,
          burd_unit_cost: parseFloat(String(row['Burd_Unit_Cost'] || row['Burd Unit Cost'] || row['burd_unit_cost'] || '0').replace(/[$,]/g, '')) || 0,
          burd_gross_margin: parseFloat(String(row['Burd_Gross_Margin'] || row['Burd Gross Margin'] || row['burd_gross_margin'] || '0').replace(/[%]/g, '')) / 100 || 0,
          discount_allowance: parseFloat(String(row['Discount/Allowance'] || row['Discount Allowance'] || row['discount_allowance'] || '0').replace(/[$,]/g, '')) || 0,
          advertising_flag: Boolean(row['Advertising_Flag'] || row['Advertising'] || row['advertising_flag'] || row['ADVERTISING'] || row['Featured'] || false),
          order_type: row['Order_Type'] || row['Order Type'] || row['order_type'] || row['ORDER_TYPE'] || row['Type'] || 'Regular',
          vendor_id: parseInt(row['Customer_No'] || row['Vendor ID'] || row['vendor_id'] || row['VENDOR_ID'] || row['Vendor'] || '1') || 1
        };

        // Clean up UPC - remove spaces and ensure it's a string
        if (item.item_upc) {
          item.item_upc = item.item_upc.toString().trim();
        }

        // Validate required fields - Product Name and UPC Code are mandatory
        if (!item.description) {
          errors.push({ row: index + 2, error: 'Product Name/Description is required' });
          return;
        }

        if (!item.item_upc || item.item_upc === '') {
          errors.push({ row: index + 2, error: 'UPC Code is required' });
          return;
        }

        // Validate UPC format (basic check for numeric and length)
        const cleanUPC = item.item_upc.replace(/\D/g, '');
        if (cleanUPC.length < 8 || cleanUPC.length > 14) {
          errors.push({ row: index + 2, error: 'UPC Code must be 8-14 digits' });
          return;
        }

        // Use the extended cost from CSV or calculate it
        if (!item.cust_cost_extended && item.cust_cost_each && item.remaining_stock) {
          item.cust_cost_extended = item.cust_cost_each * item.remaining_stock;
        }

        // Use gross margin from CSV or calculate it
        if (item.gross_margin === 0 && item.unit_cost && item.unit_retail) {
          item.gross_margin = (item.unit_retail - item.unit_cost) / item.unit_retail;
        }

        items.push(item);
      } catch (error) {
        errors.push({ row: index + 2, error: `Error processing row: ${error}` });
      }
    });

    return {
      success: items.length,
      errors,
      items
    };
  };

  // Helper function to convert category codes to names
  // Helper function to convert category codes to names
  const getCategoryName = (categoryCode: string): string => {
    const categoryMap: { [key: string]: string } = {
      '460': 'Produce',
      '470': 'Dairy',
      '480': 'Meat',
      '490': 'Bakery',
      '500': 'Beverages',
      '510': 'Frozen',
      '520': 'Pantry',
      '530': 'Deli',
      // Add more category mappings as needed
    };
    
    return categoryMap[categoryCode] || 'General';
  };

  const handleImport = () => {
    if (importResult && importResult.items.length > 0) {
      onImport(importResult.items);
      onClose();
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        'Product Name': 'Organic Whole Milk',
        'Category': 'Dairy',
        'Brand': 'Organic Valley',
        'Department': 'Refrigerated',
        'SKU': 'OV-MILK-001',
        'UPC Code': '123456789012',
        'Pack Size': '1 Gallon',
        'Qty Shipped': 50,
        'Current Stock': 25,
        'Weekly Sales': 10,
        'Location': 'Warehouse A',
        'Aisle': 'A1',
        'Row': '2',
        'Bin': 'B3',
        'Expiration Date': '2025-02-15',
        'Unit Cost': 4.50,
        'Vendor Cost': 3.80,
        'Customer Cost': 5.99,
        'Retail Price': 5.99,
        'Gross Margin': 0.25,
        'Advertising': false,
        'Order Type': 'Regular',
        'Vendor ID': 1
      }
    ];

    // Create both Excel and CSV templates
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inventory Template');
    
    // Download Excel template
    XLSX.writeFile(wb, 'inventory_import_template.xlsx');
    
    // Also create CSV template
    setTimeout(() => {
      const csv = XLSX.utils.sheet_to_csv(ws);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'inventory_import_template.csv';
      link.click();
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-emerald-100 p-2 rounded-lg">
                <Upload className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Import Inventory</h2>
                <p className="text-gray-600 mt-1">Upload Excel or CSV file to bulk import items</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {!importResult ? (
            <div className="space-y-6">
              {/* File Upload Area */}
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  dragActive
                    ? 'border-emerald-400 bg-emerald-50'
                    : 'border-gray-300 hover:border-emerald-400 hover:bg-emerald-50/50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Drop your file here or click to browse
                </h3>
                <p className="text-gray-600 mb-4">
                  Supports Excel (.xlsx, .xls) and CSV files
                </p>
                <Button
                  variant="primary"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : 'Choose File'}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileInput}
                  className="hidden"
                />
              </div>

              {/* Template Download */}
              <Card>
                <CardHeader title="Need a template?" subtitle="Download our Excel template to get started" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                      Use our pre-formatted template with all the required columns
                    </p>
                  </div>
                  <Button variant="outline" onClick={downloadTemplate}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Template
                  </Button>
                </div>
              </Card>

              {/* Supported Columns */}
              <Card>
                <CardHeader title="Supported Columns" subtitle="Your Excel file can include any of these columns" />
               <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                 <p className="text-sm text-blue-800 font-medium">📋 CSV Import Tips:</p>
                 <ul className="text-xs text-blue-700 mt-1 space-y-1">
                   <li>• Use comma-separated values (.csv format)</li>
                   <li>• First row should contain column headers</li>
                   <li>• Supports various column name formats (Description, DESCRIPTION, description)</li>
                   <li>• Currency values can include $ and commas (e.g., $1,234.56)</li>
                   <li>• Boolean fields: true/false, yes/no, 1/0</li>
                 </ul>
               </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                  {[
                    'Product Name*', 'UPC Code*', 'Category', 'Brand', 'Department', 'SKU',
                    'Pack Size', 'Qty Shipped', 'Current Stock', 'Weekly Sales',
                    'Location', 'Aisle', 'Row', 'Bin', 'Expiration Date',
                    'Unit Cost', 'Vendor Cost', 'Customer Cost', 'Retail Price',
                    'Gross Margin', 'Advertising', 'Order Type', 'Vendor ID'
                  ].map((column) => (
                    <Badge
                      key={column}
                      variant={column.includes('*') ? 'danger' : 'neutral'}
                      size="sm"
                    >
                      {column}
                    </Badge>
                  ))}
                </div>
               <p className="text-xs text-gray-500 mt-2">
                 * Required fields: Product Name and UPC Code are mandatory | Column names are case-insensitive and flexible
               </p>
              </Card>
            </div>
          ) : (
            /* Import Results */
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <div className="text-center">
                    <CheckCircle className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-emerald-600">{importResult.success}</div>
                    <div className="text-sm text-gray-600">Items Ready to Import</div>
                  </div>
                </Card>
                <Card>
                  <div className="text-center">
                    <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-red-600">{importResult.errors.length}</div>
                    <div className="text-sm text-gray-600">Errors Found</div>
                  </div>
                </Card>
              </div>

              {importResult.errors.length > 0 && (
                <Card>
                  <CardHeader title="Import Errors" subtitle="Please fix these issues in your file" />
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {importResult.errors.map((error, index) => (
                      <div key={index} className="flex items-start space-x-2 text-sm">
                        <Badge variant="danger" size="sm">Row {error.row}</Badge>
                        <span className="text-red-600">{error.error}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {importResult.success > 0 && (
                <Card>
                  <CardHeader title="Preview" subtitle="First 5 items to be imported" />
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Description</th>
                          <th className="text-left py-2">Category</th>
                          <th className="text-left py-2">Stock</th>
                          <th className="text-left py-2">Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importResult.items.slice(0, 5).map((item, index) => (
                          <tr key={index} className="border-b">
                            <td className="py-2">{item.description}</td>
                            <td className="py-2">{item.category}</td>
                            <td className="py-2">{item.remaining_stock}</td>
                            <td className="py-2">${item.unit_retail?.toFixed(2) || '0.00'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setImportResult(null)}>
                  Upload Different File
                </Button>
                <div className="space-x-3">
                  <Button variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleImport}
                    disabled={importResult.success === 0}
                  >
                    Import {importResult.success} Items
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
