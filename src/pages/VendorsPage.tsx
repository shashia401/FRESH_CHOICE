import React, { useState, useEffect } from 'react';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Plus, CreditCard as Edit, Trash2, Building, Phone, Mail, MapPin, Eye, X, Save, Package, FileText } from 'lucide-react';
import { Download, CheckCircle, Paperclip, Image as ImageIcon } from 'lucide-react';
import { Vendor } from '../types';
import { vendorApi } from '../utils/api';

interface VendorDetails extends Vendor {
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  phone?: string;
  email?: string;
  website?: string;
  contact_person?: string;
  payment_terms?: string;
  tax_id?: string;
}

interface Invoice {
  id: number;
  invoice_no: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  items_count: number;
}

interface VendorProduct {
  id: number;
  name: string;
  category: string;
  unit_cost: number;
  last_ordered: string;
  total_ordered: number;
}

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

export const VendorsPage: React.FC = () => {
  const [vendors, setVendors] = useState<VendorDetails[]>([]);
  const [isAddingVendor, setIsAddingVendor] = useState(false);
  const [newVendorName, setNewVendorName] = useState('');
  const [newVendorContact, setNewVendorContact] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<VendorDetails | null>(null);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [showInvoicesModal, setShowInvoicesModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'products'>('details');
  const [editForm, setEditForm] = useState<VendorDetails | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showInvoiceDetailModal, setShowInvoiceDetailModal] = useState(false);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [invoiceDocuments, setInvoiceDocuments] = useState<{[key: number]: string}>({});
  const [vendorProducts, setVendorProducts] = useState<VendorProduct[]>([]);
  const [vendorInvoices, setVendorInvoices] = useState<Invoice[]>([]);

  // Load vendors from backend
  useEffect(() => {
    const loadVendors = async () => {
      try {
        const data = await vendorApi.getAll();
        setVendors(data);
      } catch (error) {
        console.error('Failed to load vendors:', error);
        // Fallback to empty array if backend fails
        setVendors([]);
      }
    };

    loadVendors();
  }, []);

  // Load vendor products when vendor is selected
  useEffect(() => {
    const loadVendorProducts = async () => {
      if (selectedVendor) {
        try {
          const products = await vendorApi.getProducts(selectedVendor.id);
          setVendorProducts(products);
        } catch (error) {
          console.error('Failed to load vendor products:', error);
          setVendorProducts([]);
        }
      }
    };

    loadVendorProducts();
  }, [selectedVendor]);

  // Load vendor invoices when vendor is selected
  useEffect(() => {
    const loadVendorInvoices = async () => {
      if (selectedVendor) {
        try {
          const invoices = await vendorApi.getInvoices(selectedVendor.id);
          setVendorInvoices(invoices);
        } catch (error) {
          console.error('Failed to load vendor invoices:', error);
          setVendorInvoices([]);
        }
      }
    };

    loadVendorInvoices();
  }, [selectedVendor]);




  const handleAddVendor = () => {
    if (newVendorName.trim()) {
      const newVendor: VendorDetails = {
        id: Date.now(),
        name: newVendorName.trim(),
        contact_info: newVendorContact.trim() || undefined
      };
      setVendors([...vendors, newVendor]);
      setNewVendorName('');
      setNewVendorContact('');
      setIsAddingVendor(false);
    }
  };

  const handleDeleteVendor = (id: number) => {
    setVendors(vendors.filter(vendor => vendor.id !== id));
  };

  const handleViewVendor = (vendor: VendorDetails) => {
    setSelectedVendor(vendor);
    setEditForm(vendor);
    setShowVendorModal(true);
    setIsEditing(false);
    setActiveTab('details');
  };

  const handleViewInvoices = (vendor: VendorDetails) => {
    setSelectedVendor(vendor);
    setShowInvoicesModal(true);
  };


  const handleViewInvoice = async (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    try {
      if (selectedVendor) {
        const items = await vendorApi.getInvoiceItems(selectedVendor.id, invoice.id);
        setInvoiceItems(items);
      } else {
        setInvoiceItems([]);
      }
    } catch (error) {
      console.error('Failed to load invoice items:', error);
      setInvoiceItems([]);
    }
    setShowInvoiceDetailModal(true);
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
    }
  };

  const handleSaveEdit = () => {
    if (editForm && selectedVendor) {
      setVendors(vendors.map(vendor => 
        vendor.id === selectedVendor.id ? editForm : vendor
      ));
      setSelectedVendor(editForm);
      setIsEditing(false);
    }
  };

  const handleEditFormChange = (field: keyof VendorDetails, value: string) => {
    if (editForm) {
      setEditForm({ ...editForm, [field]: value });
    }
  };

  const parseContactInfo = (contactInfo?: string) => {
    if (!contactInfo) return { email: '', phone: '' };
    
    const parts = contactInfo.split(' | ');
    const email = parts[0] || '';
    const phone = parts[1] || '';
    
    return { email, phone };
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid': return <Badge variant="success" size="sm">Paid</Badge>;
      case 'pending': return <Badge variant="warning" size="sm">Pending</Badge>;
      case 'overdue': return <Badge variant="danger" size="sm">Overdue</Badge>;
      default: return <Badge variant="neutral" size="sm">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vendor Management</h1>
          <p className="text-gray-600 mt-1">Manage your supplier relationships and contact information</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setIsAddingVendor(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Vendor
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{vendors.length}</div>
            <div className="text-sm text-gray-600">Total Vendors</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600">{vendors.filter(v => v.contact_info).length}</div>
            <div className="text-sm text-gray-600">With Contact Info</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">245</div>
            <div className="text-sm text-gray-600">Total Products</div>
          </div>
        </Card>
      </div>

      {/* Add Vendor Form */}
      {isAddingVendor && (
        <Card>
          <CardHeader title="Add New Vendor" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Vendor Name"
              placeholder="Enter vendor name"
              value={newVendorName}
              onChange={(e) => setNewVendorName(e.target.value)}
            />
            <Input
              label="Contact Information"
              placeholder="email@example.com | (555) 123-4567"
              value={newVendorContact}
              onChange={(e) => setNewVendorContact(e.target.value)}
            />
          </div>
          <div className="flex justify-end space-x-3 mt-4">
            <Button variant="outline" onClick={() => setIsAddingVendor(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddVendor} disabled={!newVendorName.trim()}>
              Add Vendor
            </Button>
          </div>
        </Card>
      )}

      {/* Vendors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vendors.map((vendor) => {
          const { email, phone } = parseContactInfo(vendor.contact_info);
          return (
            <Card key={vendor.id} hover>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Building className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{vendor.name}</h3>
                      <Badge variant="info" size="sm">Active</Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {email && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Mail className="h-4 w-4" />
                        <span>{email}</span>
                      </div>
                    )}
                    {phone && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span>{phone}</span>
                      </div>
                    )}
                    {vendor.address && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{vendor.city}, {vendor.state}</span>
                      </div>
                    )}
                    {!vendor.contact_info && (
                      <div className="text-sm text-gray-500 italic">No contact information</div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">12</span> products
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewInvoices(vendor)}
                    className="text-xs px-2 py-1"
                  >
                    <FileText className="h-3 w-3 mr-1" />
                    Invoices
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewVendor(vendor)}
                    className="text-xs px-2 py-1"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteVendor(vendor.id)}
                    className="text-xs px-2 py-1"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {vendors.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No vendors added yet</p>
            <p className="text-sm text-gray-500 mt-2">Add your first vendor to start managing supplier relationships</p>
            <Button variant="primary" size="sm" className="mt-4" onClick={() => setIsAddingVendor(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Vendor
            </Button>
          </div>
        </Card>
      )}

      {/* Vendor Details Modal */}
      {showVendorModal && selectedVendor && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Building className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedVendor.name}</h2>
                    <p className="text-gray-600 mt-1">Vendor Details & Management</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {!isEditing ? (
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                      <Button variant="primary" size="sm" onClick={handleSaveEdit}>
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                    </div>
                  )}
                  <Button variant="outline" size="sm" onClick={() => setShowVendorModal(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Tab Navigation */}
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
                {[
                  { id: 'details', label: 'Vendor Details', icon: Building },
                  { id: 'products', label: 'Products Supplied', icon: Package }
                ].map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'bg-white text-blue-700 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <IconComponent className="h-4 w-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Vendor Details Tab */}
              {activeTab === 'details' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader title="Basic Information" />
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Name</label>
                        {isEditing ? (
                          <Input
                            value={editForm?.name || ''}
                            onChange={(e) => handleEditFormChange('name', e.target.value)}
                          />
                        ) : (
                          <div className="text-sm text-gray-900">{selectedVendor.name}</div>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                        {isEditing ? (
                          <Input
                            value={editForm?.contact_person || ''}
                            onChange={(e) => handleEditFormChange('contact_person', e.target.value)}
                            placeholder="Contact person name"
                          />
                        ) : (
                          <div className="text-sm text-gray-900">{selectedVendor.contact_person || 'Not specified'}</div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                          {isEditing ? (
                            <Input
                              value={editForm?.phone || ''}
                              onChange={(e) => handleEditFormChange('phone', e.target.value)}
                              placeholder="(555) 123-4567"
                            />
                          ) : (
                            <div className="text-sm text-gray-900">{selectedVendor.phone || 'Not specified'}</div>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                          {isEditing ? (
                            <Input
                              type="email"
                              value={editForm?.email || ''}
                              onChange={(e) => handleEditFormChange('email', e.target.value)}
                              placeholder="email@example.com"
                            />
                          ) : (
                            <div className="text-sm text-gray-900">{selectedVendor.email || 'Not specified'}</div>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                        {isEditing ? (
                          <Input
                            value={editForm?.website || ''}
                            onChange={(e) => handleEditFormChange('website', e.target.value)}
                            placeholder="www.example.com"
                          />
                        ) : (
                          <div className="text-sm text-gray-900">{selectedVendor.website || 'Not specified'}</div>
                        )}
                      </div>
                    </div>
                  </Card>

                  <Card>
                    <CardHeader title="Address Information" />
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                        {isEditing ? (
                          <Input
                            value={editForm?.address || ''}
                            onChange={(e) => handleEditFormChange('address', e.target.value)}
                            placeholder="1234 Main Street"
                          />
                        ) : (
                          <div className="text-sm text-gray-900">{selectedVendor.address || 'Not specified'}</div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                          {isEditing ? (
                            <Input
                              value={editForm?.city || ''}
                              onChange={(e) => handleEditFormChange('city', e.target.value)}
                              placeholder="City"
                            />
                          ) : (
                            <div className="text-sm text-gray-900">{selectedVendor.city || 'Not specified'}</div>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                          {isEditing ? (
                            <Input
                              value={editForm?.state || ''}
                              onChange={(e) => handleEditFormChange('state', e.target.value)}
                              placeholder="State"
                            />
                          ) : (
                            <div className="text-sm text-gray-900">{selectedVendor.state || 'Not specified'}</div>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                        {isEditing ? (
                          <Input
                            value={editForm?.zip || ''}
                            onChange={(e) => handleEditFormChange('zip', e.target.value)}
                            placeholder="12345"
                          />
                        ) : (
                          <div className="text-sm text-gray-900">{selectedVendor.zip || 'Not specified'}</div>
                        )}
                      </div>
                    </div>
                  </Card>

                  <Card className="lg:col-span-2">
                    <CardHeader title="Business Information" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
                        {isEditing ? (
                          <Input
                            value={editForm?.payment_terms || ''}
                            onChange={(e) => handleEditFormChange('payment_terms', e.target.value)}
                            placeholder="Net 30"
                          />
                        ) : (
                          <div className="text-sm text-gray-900">{selectedVendor.payment_terms || 'Not specified'}</div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tax ID</label>
                        {isEditing ? (
                          <Input
                            value={editForm?.tax_id || ''}
                            onChange={(e) => handleEditFormChange('tax_id', e.target.value)}
                            placeholder="12-3456789"
                          />
                        ) : (
                          <div className="text-sm text-gray-900">{selectedVendor.tax_id || 'Not specified'}</div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <Badge variant="success">Active</Badge>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {/* Products Supplied Tab */}
              {activeTab === 'products' && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader title="Products Supplied" subtitle="Items provided by this vendor" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {vendorProducts.map((product) => (
                        <div key={product.id} className="p-4 border border-gray-200 rounded-lg hover:border-emerald-300 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <Package className="h-4 w-4 text-emerald-600" />
                                <h4 className="font-medium text-gray-900">{product.name}</h4>
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-gray-500">Category:</span>
                                  <Badge variant="info" size="sm">{product.category}</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-gray-500">Unit Cost:</span>
                                  <span className="text-sm font-medium text-gray-900">${product.unit_cost.toFixed(2)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-gray-500">Last Ordered:</span>
                                  <span className="text-xs text-gray-700">{product.last_ordered}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-gray-500">Total Ordered:</span>
                                  <span className="text-xs text-gray-700">{product.total_ordered}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {vendorProducts.length === 0 && (
                        <div className="col-span-full text-center py-8">
                          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">No products found for this vendor</p>
                          <p className="text-sm text-gray-500 mt-1">Products will appear here when inventory items are linked to this vendor</p>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Invoices Modal */}
      {showInvoicesModal && selectedVendor && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-emerald-100 p-2 rounded-lg">
                    <FileText className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Invoices - {selectedVendor.name}</h2>
                    <p className="text-gray-600 mt-1">View and manage vendor invoices</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowInvoicesModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="space-y-4">
                {vendorInvoices.map((invoice) => (
                  <div key={invoice.id} className="p-4 border border-gray-200 rounded-lg hover:border-emerald-300 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-medium text-gray-900">{invoice.invoice_no}</h4>
                          {getStatusBadge(invoice.status)}
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="text-xs text-gray-500">Date:</span>
                            <div className="font-medium">{new Date(invoice.date).toLocaleDateString()}</div>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">Amount:</span>
                            <div className="font-medium">${invoice.amount.toFixed(2)}</div>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">Items:</span>
                            <div className="font-medium">{invoice.items_count}</div>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewInvoice(invoice)}
                          className="text-xs px-2 py-1"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs px-2 py-1"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {vendorInvoices.length === 0 && (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No invoices found for this vendor</p>
                    <p className="text-sm text-gray-500 mt-1">Invoices will appear here when they are created and linked to this vendor</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Detail Modal */}
      {showInvoiceDetailModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedInvoice.invoice_no}</h2>
                    <p className="text-gray-600 mt-1">{selectedVendor?.name}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowInvoiceDetailModal(false)}>
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
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
                        <div className="text-sm text-gray-900">{selectedInvoice.invoice_no}</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <div className="mt-1">{getStatusBadge(selectedInvoice.status)}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <div className="text-sm text-gray-900">{new Date(selectedInvoice.date).toLocaleDateString()}</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                        <div className="text-sm text-gray-900 font-medium">${selectedInvoice.amount.toFixed(2)}</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Items Count</label>
                        <div className="text-sm text-gray-900">{selectedInvoice.items_count}</div>
                      </div>
                    </div>
                  </Card>

                  {/* Vendor Information */}
                  <Card>
                    <CardHeader title="Vendor Information" />
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Vendor Name</label>
                        <div className="mt-1 text-sm text-gray-900">{selectedVendor?.name}</div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Vendor ID</label>
                        <div className="mt-1 text-sm text-gray-900">{selectedVendor?.id}</div>
                      </div>
                      
                      {/* Original Invoice Document */}
                      <div>
                        <label className="text-sm font-medium text-gray-700">Original Invoice</label>
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
                            <label
                              htmlFor={`invoice-upload-${selectedInvoice.id}`}
                              className="cursor-pointer flex flex-col items-center space-y-2"
                            >
                              <ImageIcon className="h-8 w-8 text-gray-400" />
                              <p className="text-sm text-gray-600">Upload original invoice</p>
                              <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG supported</p>
                            </label>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700">Contact</label>
                        <div className="mt-1 text-sm text-gray-900">
                          {selectedVendor?.email && (
                            <div className="flex items-center space-x-2">
                              <Mail className="h-4 w-4 text-gray-400" />
                              <span>{selectedVendor.email}</span>
                            </div>
                          )}
                          {selectedVendor?.phone && (
                            <div className="flex items-center space-x-2 mt-1">
                              <Phone className="h-4 w-4 text-gray-400" />
                              <span>{selectedVendor.phone}</span>
                            </div>
                          )}
                        </div>
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
  );
};
