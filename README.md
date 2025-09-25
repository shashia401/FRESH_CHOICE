# Fresh Choice Inventory Management System

A comprehensive inventory management solution built with React, TypeScript, and Supabase for grocery stores and food retailers.

## 🚀 Features

### Core Inventory Management
- **Product Tracking** - Complete inventory with UPC/SKU codes, categories, brands, and locations
- **Stock Monitoring** - Real-time stock levels with low stock alerts
- **Expiration Management** - Track expiration dates with automated alerts
- **Barcode Scanning** - Built-in barcode scanner for quick product lookup and entry
- **Bulk Import/Export** - CSV/Excel import for invoices and inventory data

### Vendor & Invoice Management
- **Vendor Database** - Comprehensive supplier information and contact management
- **Invoice Processing** - Upload and process supplier invoices with automatic inventory updates
- **Payment Tracking** - Monitor invoice status (paid, pending, overdue)
- **Document Management** - Attach original invoice documents

### Smart Shopping Lists
- **Auto-Generation** - Automatically create shopping lists based on low stock items
- **Priority Management** - Urgent, high, medium, and low priority items
- **Purchase Tracking** - Mark items as purchased and track completion

### Analytics & Reporting
- **Sales Trends** - AI-powered sales forecasting and trend analysis
- **Waste Tracking** - Monitor expired items and calculate value loss
- **Vendor Performance** - Analyze vendor margins and product performance
- **Export Reports** - Generate comprehensive reports in Excel/CSV format

### User Experience
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **Real-time Updates** - Live data synchronization across all devices
- **Advanced Filtering** - Search and filter by category, status, vendor, dates
- **Beautiful UI** - Modern, intuitive interface with smooth animations

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Authentication, Real-time)
- **Charts**: Recharts for analytics and reporting
- **File Processing**: XLSX for Excel import/export
- **Barcode Scanning**: HTML5-QRCode for product scanning
- **Build Tool**: Vite for fast development and building

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier available)
- Modern web browser with camera access (for barcode scanning)

## 🚀 Quick Start

### 1. Clone and Install
```bash
git clone <repository-url>
cd fresh-choice-inventory
npm install
```

### 2. Environment Setup
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Setup
1. Create a new Supabase project
2. Run the migration file in the Supabase SQL editor:
   ```sql
   -- Copy and paste the contents of supabase/migrations/create_complete_schema.sql
   ```

### 4. Start Development
```bash
npm run dev
```

Visit `http://localhost:5173` to access the application.

## 📊 Database Schema

### Core Tables
- **`inventory_items`** - Product inventory with detailed specifications
- **`vendors`** - Supplier information and contact details
- **`invoices`** - Invoice tracking and payment status
- **`invoice_items`** - Individual line items on invoices
- **`shopping_list_items`** - Shopping list management
- **`waste_items`** - Expired item tracking
- **`user_settings`** - User preferences and configuration

### Security Features
- Row Level Security (RLS) enabled on all tables
- User data isolation - users only access their own data
- Authenticated user policies for all operations

## 🔧 Configuration

### User Settings
Access settings through the Settings page to configure:
- Low stock threshold (default: 10 items)
- Expiry warning period (default: 3 days)
- Default category and location
- Email notifications and alerts

### Inventory Categories
Default categories include:
- Produce, Dairy, Bakery, Meat, Beverages
- Pantry, Frozen, Deli, General

## 📱 Usage Guide

### Adding Inventory Items
1. **Manual Entry**: Use the "Add Item" button for detailed product entry
2. **Barcode Scanning**: Click "Scan Product" to use camera for UPC lookup
3. **Bulk Import**: Upload CSV/Excel files via "Import CSV"

### Processing Invoices
1. Navigate to Invoices page
2. Click "Upload Invoice" 
3. Select CSV/Excel file from supplier
4. System automatically matches products by UPC and updates inventory
5. Attach original invoice document for record keeping

### Managing Shopping Lists
- Items automatically added when stock falls below threshold
- Manually add items using "Add from Inventory" or "Add Manual Item"
- Set priorities and track purchase completion
- Export shopping lists for procurement

### Viewing Reports
Access comprehensive analytics:
- **Consumption Trends**: Sales patterns and forecasting
- **Waste Tracker**: Expired items and value loss
- **Vendor Margins**: Supplier performance analysis
- **Export Options**: PDF and Excel report generation

## 🔍 Advanced Features

### Barcode Scanning
- Supports UPC, EAN, Code 128, and QR codes
- Real-time camera scanning with visual feedback
- Automatic product lookup and inventory updates

### AI-Powered Forecasting
- Sales trend analysis with machine learning
- Demand forecasting for optimal stock levels
- Seasonal pattern recognition

### Automated Workflows
- Auto-generate shopping lists for low stock items
- Automatic waste tracking for expired products
- Email alerts for critical inventory levels

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel/Netlify
1. Connect your repository to your hosting platform
2. Set environment variables in the hosting dashboard
3. Deploy with automatic builds on git push

### Supabase Configuration
Ensure your Supabase project has:
- Database migrations applied
- RLS policies enabled
- Authentication configured
- API keys properly set

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the documentation above
- Review the code comments for implementation details
- Open an issue for bugs or feature requests

## 🔄 Version History

- **v1.0.0** - Initial release with core inventory management
- **v1.1.0** - Added barcode scanning and bulk import
- **v1.2.0** - Enhanced reporting and analytics
- **v1.3.0** - AI-powered forecasting and automation

---

Built with ❤️ for efficient inventory management