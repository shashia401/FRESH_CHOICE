import React, { useState, useEffect } from 'react';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { 
  Upload, 
  FileText, 
  Download, 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  X,
  Package,
  DollarSign,
  Calendar,
  User,
  Paperclip,
  Image as ImageIcon,
  Plus
} from 'lucide-react';
import { Invoice, InventoryItem } from '../types';
import { vendorApi } from '../utils/api';
import * as XLSX from 'xlsx';

interface InvoiceItem {
  id: number;
  invoice_id: number;
  description: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  category: string;
  upc?: string;
  sku?: string;
}

export const InvoicesPage: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedVendor, setSelectedVendor] = useState('All');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [originalInvoiceFile, setOriginalInvoiceFile] = useState<File | null>(null);
  const [invoiceDocuments, setInvoiceDocuments] = useState<{[key: number]: string}>({});
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingResult, setProcessingResult] = useState<{
    processed: number;
    updated: number;
    added: number;
    errors: { row: number; error: string }[];
  } | null>(null);

  // Load real invoice data from backend (currently using empty array until invoice API is implemented)
  useEffect(() => {
    const loadInvoices = async () => {
      try {
        // TODO: Implement invoice API calls when backend is ready
        // const data = await invoiceApi.getAll();
        // setInvoices(data);
        
        // For now, keep empty array to show the interface without mock data
        setInvoices([]);
      } catch (error) {
        console.error('Failed to load invoices:', error);
        setInvoices([]);
      }
    };
    
    loadInvoices();
  }, []);


  // Filter invoices
  useEffect(() => {
    let filtered = invoices;

    if (searchTerm) {
      filtered = filtered.filter(invoice =>
        invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.vendor_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedStatus !== 'All') {
      filtered = filtered.filter(invoice => invoice.status === selectedStatus.toLowerCase());
    }

    if (selectedVendor !== 'All') {
      filtered = filtered.filter(invoice => invoice.vendor_name === selectedVendor);
    }

    if (fromDate) {
      filtered = filtered.filter(invoice => invoice.invoice_date >= fromDate);
    }

    if (toDate) {
      filtered = filtered.filter(invoice => invoice.invoice_date <= toDate);
    }

    setFilteredInvoices(filtered);
  }, [invoices, searchTerm, selectedStatus, selectedVendor, fromDate, toDate]);

  // Calculate statistics
  const stats = {
    total: invoices.length,
    paid: invoices.filter(inv => inv.status === 'paid').length,
    pending: invoices.filter(inv => inv.status === 'pending').length,
    overdue: invoices.filter(inv => inv.status === 'overdue').length,
    totalAmount: invoices.reduce((sum, inv) => sum + inv.total_amount, 0),
    paidAmount: invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.total_amount, 0),
    pendingAmount: invoices.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + inv.total_amount, 0),
    overdueAmount: invoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.total_amount, 0)
  };

  // Calculate vendor-specific statistics when vendor is selected
  const vendorStats = selectedVendor !== 'All' ? {
    total: filteredInvoices.length,
    paid: filteredInvoices.filter(inv => inv.status === 'paid').length,
    pending: filteredInvoices.filter(inv => inv.status === 'pending').length,
    overdue: filteredInvoices.filter(inv => inv.status === 'overdue').length,
    totalAmount: filteredInvoices.reduce((sum, inv) => sum + inv.total_amount, 0),
    paidAmount: filteredInvoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.total_amount, 0),
    pendingAmount: filteredInvoices.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + inv.total_amount, 0),
    overdueAmount: filteredInvoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.total_amount, 0)
  } : null;

  // Use vendor-specific stats when available, otherwise use overall stats
  const displayStats = vendorStats || stats;

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadFile(file);
    }
  };

  const handleProcessInvoice = async () => {
    if (!uploadFile) return;

    setIsProcessing(true);
    setProcessingResult(null);

    try {
      // Simulate file processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock processing results
      const result = {
        processed: 25,
        updated: 18,
        added: 7,
        errors: [
          { row: 12, error: 'Invalid UPC code format' },
          { row: 18, error: 'Missing product description' }
        ]
      };

      setProcessingResult(result);
    } catch (error) {
      console.error('Error processing invoice:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="success" size="sm">Paid</Badge>;
      case 'pending':
        return <Badge variant="warning" size="sm">Pending</Badge>;
      case 'overdue':
        return <Badge variant="danger" size="sm">Overdue</Badge>;
      default:
        return <Badge variant="neutral" size="sm">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'overdue':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const vendors = Array.from(new Set(invoices.map(inv => inv.vendor_name)));

  // Mock function to get invoice items
  const getInvoiceItems = (invoiceId: number): InvoiceItem[] => {
    // Generate mock items based on invoice ID
    const itemTemplates = [
      { description: 'Organic Whole Milk', category: 'Dairy', unit_cost: 4.50, upc: '123456789012', sku: 'OV-MILK-001' },
      { description: 'Fresh Bananas', category: 'Produce', unit_cost: 1.25, upc: '234567890123', sku: 'FF-BAN-001' },
      { description: 'Whole Wheat Bread', category: 'Bakery', unit_cost: 2.20, upc: '345678901234', sku: 'LB-BREAD-001' },
      { description: 'Greek Yogurt', category: 'Dairy', unit_cost: 5.99, upc: '456789012345', sku: 'OV-YOG-001' },
      { description: 'Organic Apples', category: 'Produce', unit_cost: 3.25, upc: '567890123456', sku: 'FF-APP-001' },
      { description: 'Ground Beef', category: 'Meat', unit_cost: 8.50, upc: '678901234567', sku: 'MS-BEEF-001' },
      { description: 'Orange Juice', category: 'Beverages', unit_cost: 3.75, upc: '789012345678', sku: 'BV-OJ-001' },
      { description: 'Cheddar Cheese', category: 'Dairy', unit_cost: 6.25, upc: '890123456789', sku: 'DD-CHE-001' },
      { description: 'Chicken Breast', category: 'Meat', unit_cost: 12.99, upc: '901234567890', sku: 'MS-CHI-001' },
      { description: 'Mixed Greens', category: 'Produce', unit_cost: 4.50, upc: '012345678901', sku: 'FF-GRE-001' }
    ];

    const numItems = Math.min(Math.floor(Math.random() * 8) + 5, itemTemplates.length);
    const selectedItems = itemTemplates.slice(0, numItems);
    
    return selectedItems.map((template, index) => {
      const quantity = Math.floor(Math.random() * 20) + 5;
      return {
        id: index + 1,
        invoice_id: invoiceId,
        description: template.description,
        quantity,
        unit_cost: template.unit_cost,
        total_cost: quantity * template.unit_cost,
        category: template.category,
        upc: template.upc,
        sku: template.sku
      };
    });
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setInvoiceItems(getInvoiceItems(invoice.id));
    setShowInvoiceModal(true);
  };

  const handleUploadOriginalInvoice = (event: React.ChangeEvent<HTMLInputElement>, invoiceId: number) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real app, you would upload this to your server
      const fileUrl = URL.createObjectURL(file);
      setInvoiceDocuments(prev => ({
        ...prev,
        [invoiceId]: fileUrl
      }));
      setOriginalInvoiceFile(file);
    }
  };

  return (
    <>
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-600 mt-1">Upload and manage supplier invoices</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="primary" size="sm" onClick={() => setShowUploadModal(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Invoice
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {selectedVendor !== 'All' && (
          <div className="md:col-span-2 xl:col-span-4 mb-4">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-900">
                    Showing invoices for: {selectedVendor}
                  </h3>
                  <p className="text-sm text-blue-700">
                    {displayStats.total} invoices • Total: ${displayStats.totalAmount.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{displayStats.total}</div>
            <div className="text-sm text-gray-600">
              {selectedVendor !== 'All' ? `${selectedVendor} Invoices` : 'Total Invoices'}
            </div>
            <div className="text-xs text-gray-500 mt-1">${displayStats.totalAmount.toFixed(2)}</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{displayStats.paid}</div>
            <div className="text-sm text-gray-600">Paid</div>
            <div className="text-xs text-gray-500 mt-1">${displayStats.paidAmount.toFixed(2)}</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{displayStats.pending}</div>
            <div className="text-sm text-gray-600">Pending</div>
            <div className="text-xs text-gray-500 mt-1">${displayStats.pendingAmount.toFixed(2)}</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{displayStats.overdue}</div>
            <div className="text-sm text-gray-600">Overdue</div>
            <div className="text-xs text-gray-500 mt-1">${displayStats.overdueAmount.toFixed(2)}</div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-500 h-5 w-5" />
                <Input
                  placeholder="Search invoices or vendors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-3 border-2 border-emerald-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400 bg-white hover:border-emerald-300 transition-colors"
              >
                <option value="All">All Status</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Overdue">Overdue</option>
              </select>

              <select
                value={selectedVendor}
                onChange={(e) => setSelectedVendor(e.target.value)}
                className="px-4 py-3 border-2 border-emerald-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400 bg-white hover:border-emerald-300 transition-colors"
              >
                <option value="All">All Vendors</option>
                {vendors.map((vendor) => (
                  <option key={vendor} value={vendor}>{vendor}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Date Filters */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-medium text-gray-700">Date Range:</span>
              </div>
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-600">From:</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="px-3 py-2 border-2 border-emerald-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400 bg-white hover:border-emerald-300 transition-colors"
                />
              </div>
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-600">To:</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="px-3 py-2 border-2 border-emerald-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400 bg-white hover:border-emerald-300 transition-colors"
                />
              </div>
              {(fromDate || toDate) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFromDate('');
                    setToDate('');
                  }}
                  className="text-xs"
                >
                  Clear Dates
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader 
          title="Invoices" 
          subtitle={`${filteredInvoices.length} invoices found`}
        />
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vendor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="bg-gray-100 p-2 rounded-lg mr-3">
                        {getStatusIcon(invoice.status)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{invoice.invoice_number}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(invoice.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{invoice.vendor_name}</div>
                    <div className="text-xs text-gray-500">ID: {invoice.vendor_id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(invoice.invoice_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(invoice.due_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-emerald-600">
                    ${invoice.total_amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(invoice.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {invoice.item_count} items
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewInvoice(invoice)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        PDF
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-emerald-100 p-2 rounded-lg">
                    <Upload className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Upload Invoice</h2>
                    <p className="text-gray-600 mt-1">Upload CSV/Excel file to update inventory</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowUploadModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="p-6">
              {!processingResult ? (
                <div className="space-y-6">
                  {/* File Upload */}
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-emerald-400 transition-colors">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Upload Invoice File
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Supports CSV and Excel files (.csv, .xlsx, .xls)
                    </p>
                    <input
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="invoice-upload"
                    />
                    <label htmlFor="invoice-upload">
                      <Button variant="primary" as="span">
                        Choose File
                      </Button>
                    </label>
                    {uploadFile && (
                      <div className="mt-4 p-3 bg-emerald-50 rounded-lg">
                        <p className="text-sm text-emerald-800">
                          Selected: {uploadFile.name} ({(uploadFile.size / 1024).toFixed(1)} KB)
                        </p>
                      </div>
                    )}
                  </div>

                  {/* How it works */}
                  <Card>
                    <CardHeader title="How it works" />
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium">1</span>
                        </div>
                        <span>Upload your invoice CSV/Excel file</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                          <span className="text-yellow-600 font-medium">2</span>
                        </div>
                        <span>System matches products by UPC code</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600 font-medium">3</span>
                        </div>
                        <span>Updates existing inventory or adds new items</span>
                      </div>
                    </div>
                  </Card>

                  {/* Actions */}
                  <div className="flex justify-end space-x-3">
                    <Button variant="outline" onClick={() => setShowUploadModal(false)}>
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleProcessInvoice}
                      disabled={!uploadFile || isProcessing}
                      isLoading={isProcessing}
                    >
                      {isProcessing ? 'Processing...' : 'Process Invoice'}
                    </Button>
                  </div>
                </div>
              ) : (
                /* Processing Results */
                <div className="space-y-6">
                  <div className="text-center">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900">Invoice Processed Successfully!</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{processingResult.processed}</div>
                        <div className="text-sm text-gray-600">Items Processed</div>
                      </div>
                    </Card>
                    <Card>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{processingResult.updated}</div>
                        <div className="text-sm text-gray-600">Items Updated</div>
                      </div>
                    </Card>
                    <Card>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-emerald-600">{processingResult.added}</div>
                        <div className="text-sm text-gray-600">New Items Added</div>
                      </div>
                    </Card>
                  </div>

                  {processingResult.errors.length > 0 && (
                    <Card>
                      <CardHeader title="Processing Errors" />
                      <div className="space-y-2">
                        {processingResult.errors.map((error, index) => (
                          <div key={index} className="flex items-start space-x-2 text-sm">
                            <Badge variant="danger" size="sm">Row {error.row}</Badge>
                            <span className="text-red-600">{error.error}</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}

                  <div className="flex justify-end space-x-3">
                    <Button variant="outline" onClick={() => {
                      setProcessingResult(null);
                      setUploadFile(null);
                    }}>
                      Upload Another
                    </Button>
                    <Button variant="primary" onClick={() => setShowUploadModal(false)}>
                      Finish
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* View Invoice Modal */}
      {showInvoiceModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-emerald-100 p-2 rounded-lg">
                    <FileText className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedInvoice.invoice_number}</h2>
                    <p className="text-gray-600 mt-1">{selectedInvoice.vendor_name}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowInvoiceModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Invoice Details */}
                <Card>
                  <CardHeader title="Invoice Information" />
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Invoice Number</label>
                        <div className="mt-1 text-sm text-gray-900">{selectedInvoice.invoice_number}</div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Status</label>
                        <div className="mt-1">{getStatusBadge(selectedInvoice.status)}</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Invoice Date</label>
                        <div className="mt-1 text-sm text-gray-900">
                          {new Date(selectedInvoice.invoice_date).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Due Date</label>
                        <div className="mt-1 text-sm text-gray-900">
                          {new Date(selectedInvoice.due_date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Total Amount</label>
                        <div className="mt-1 text-lg font-bold text-emerald-600">
                          ${selectedInvoice.total_amount.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Item Count</label>
                        <div className="mt-1 text-sm text-gray-900">{selectedInvoice.item_count} items</div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Vendor Information */}
                <Card>
                  <CardHeader title="Vendor Information" />
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Vendor Name</label>
                      <div className="mt-1 text-sm text-gray-900">{selectedInvoice.vendor_name}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Vendor ID</label>
                      <div className="mt-1 text-sm text-gray-900">{selectedInvoice.vendor_id}</div>
                    </div>
                    
                    {/* Original Invoice Document */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Original Invoice Document</label>
                      {invoiceDocuments[selectedInvoice.id] ? (
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                            <Paperclip className="h-4 w-4 text-emerald-600" />
                            <span className="text-sm text-emerald-800">Invoice document attached</span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(invoiceDocuments[selectedInvoice.id], '_blank')}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-emerald-400 transition-colors">
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleUploadOriginalInvoice(e, selectedInvoice.id)}
                            className="hidden"
                            id={`invoice-upload-${selectedInvoice.id}`}
                          />
                          <label htmlFor={`invoice-upload-${selectedInvoice.id}`} className="cursor-pointer">
                            <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">Upload original invoice</p>
                            <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG supported</p>
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
                </div>

                {/* Invoice Items */}
                <Card>
                  <CardHeader 
                    title="Invoice Items" 
                    subtitle={`${invoiceItems.length} items on this invoice`}
                    action={
                      <Badge variant="info" size="sm">
                        Total: ${invoiceItems.reduce((sum, item) => sum + item.total_cost, 0).toFixed(2)}
                      </Badge>
                    }
                  />
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Item Details
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Category
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Quantity
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Unit Cost
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total Cost
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {invoiceItems.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="bg-gray-100 p-2 rounded-lg mr-3">
                                  <Package className="h-4 w-4 text-gray-600" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{item.description}</div>
                                  <div className="text-xs text-gray-500">
                                    {item.sku && `SKU: ${item.sku}`}
                                    {item.sku && item.upc && ' • '}
                                    {item.upc && `UPC: ${item.upc}`}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge variant="info" size="sm">{item.category}</Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.quantity}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ${item.unit_cost.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-emerald-600">
                              ${item.total_cost.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>

              {/* Actions */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex justify-between">
                  <div className="flex space-x-3">
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export Items
                    </Button>
                    {selectedInvoice.status === 'pending' && (
                      <Button variant="primary">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark as Paid
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
};