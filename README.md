# Fresh Choice Inventory Management System

A comprehensive, production-ready inventory management solution built with React, TypeScript, and Supabase, specifically designed for grocery stores and food retailers. This system provides complete inventory tracking, vendor management, automated shopping lists, and advanced analytics with AI-powered forecasting.

## 🌟 Key Features

### 📦 Advanced Inventory Management
- **Complete Product Tracking** - Detailed inventory with UPC/SKU codes, categories, brands, and precise warehouse locations
- **Real-time Stock Monitoring** - Live stock levels with customizable low stock alerts and automated reorder points
- **Smart Expiration Management** - Automated expiration date tracking with multi-level alerts and waste prevention
- **Barcode Scanning Integration** - Built-in camera-based barcode scanner supporting UPC, EAN, Code 128, and QR codes
- **Bulk Import/Export** - Comprehensive CSV/Excel import for invoices and inventory data with error handling
- **Multi-location Support** - Track items across multiple warehouses, aisles, rows, and bins

### 🏢 Vendor & Invoice Management
- **Comprehensive Vendor Database** - Complete supplier profiles with contact information, payment terms, and performance metrics
- **Automated Invoice Processing** - Upload and process supplier invoices with automatic inventory updates and reconciliation
- **Payment Status Tracking** - Monitor invoice status (paid, pending, overdue) with automated reminders
- **Document Management** - Attach and manage original invoice documents with secure cloud storage
- **Vendor Performance Analytics** - Track margins, delivery times, and product quality metrics

### 🛒 Intelligent Shopping Lists
- **Auto-Generation** - Automatically create shopping lists based on low stock items, sales velocity, and seasonal patterns
- **Priority Management** - Smart prioritization system (urgent, high, medium, low) based on stock levels and sales data
- **Purchase Tracking** - Mark items as purchased with completion tracking and vendor assignment
- **Predictive Ordering** - AI-powered suggestions for optimal order quantities based on historical data

### 📊 Advanced Analytics & Reporting
- **Sales Trend Analysis** - AI-powered sales forecasting with seasonal pattern recognition
- **Waste Tracking & Prevention** - Monitor expired items, calculate value loss, and identify waste patterns
- **Vendor Performance Reports** - Analyze vendor margins, delivery performance, and product quality
- **Comprehensive Export Options** - Generate detailed reports in Excel/CSV/PDF formats
- **Real-time Dashboards** - Live analytics with customizable KPI tracking

### 🎨 Superior User Experience
- **Responsive Design** - Seamless experience across desktop, tablet, and mobile devices
- **Real-time Synchronization** - Live data updates across all connected devices
- **Advanced Search & Filtering** - Powerful search capabilities with multi-criteria filtering
- **Beautiful Modern UI** - Intuitive interface with smooth animations and micro-interactions
- **Accessibility Compliant** - WCAG 2.1 AA compliant design for inclusive access

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Full type safety and enhanced developer experience
- **Tailwind CSS** - Utility-first CSS framework for rapid UI development
- **React Router DOM** - Client-side routing with nested routes
- **React Hook Form** - Performant forms with built-in validation

### Backend & Database
- **Supabase** - PostgreSQL database with real-time subscriptions
- **Row Level Security (RLS)** - Database-level security for multi-tenant data isolation
- **Real-time Subscriptions** - Live data synchronization across clients
- **Edge Functions** - Serverless functions for complex business logic

### Data Visualization & Analytics
- **Recharts** - Responsive charts and data visualization
- **AI-Powered Forecasting** - Machine learning algorithms for demand prediction
- **Advanced Filtering** - Multi-dimensional data analysis

### File Processing & Integration
- **XLSX** - Excel file import/export with advanced parsing
- **File-saver** - Client-side file downloads
- **HTML5-QRCode** - Camera-based barcode scanning
- **Date-fns** - Comprehensive date manipulation and formatting

### Development Tools
- **Vite** - Lightning-fast build tool and development server
- **ESLint** - Code quality and consistency enforcement
- **TypeScript ESLint** - TypeScript-specific linting rules

## 📋 Prerequisites

- **Node.js 18+** and npm
- **Supabase account** (free tier available)
- **Modern web browser** with camera access for barcode scanning
- **SSL certificate** (for production deployment with camera access)

## 🚀 Quick Start Guide

### 1. Project Setup
```bash
# Clone the repository
git clone <repository-url>
cd fresh-choice-inventory

# Install dependencies
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Setup
1. **Create Supabase Project**
   - Visit [Supabase Dashboard](https://app.supabase.com)
   - Create a new project
   - Note your project URL and anon key

2. **Run Database Migration**
   - Navigate to SQL Editor in Supabase Dashboard
   - Copy and paste the contents of `supabase/migrations/20250925154753_smooth_torch.sql`
   - Execute the migration to create all tables and security policies

3. **Verify Setup**
   - Check that all tables are created in the Table Editor
   - Verify RLS policies are enabled

### 4. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:5173` to access the application.

### 5. Initial Login
Use the default credentials or create a new account:
- **Email**: admin@freshchoice.com
- **Password**: password123

## 📊 Database Architecture

### Core Tables Overview
- **`inventory_items`** - Central inventory table with comprehensive product details
- **`vendors`** - Supplier information and relationship management
- **`invoices`** - Invoice tracking with payment status
- **`invoice_items`** - Line items for detailed invoice management
- **`shopping_list_items`** - Automated and manual shopping list management
- **`waste_items`** - Expired item tracking for waste analysis
- **`user_settings`** - User preferences and system configuration

### Security Features
- **Row Level Security (RLS)** - Enabled on all tables for data isolation
- **User-based Access Control** - Users can only access their own data
- **Authenticated Policies** - Comprehensive CRUD policies for all operations
- **Data Encryption** - All sensitive data encrypted at rest and in transit

## 🔧 Configuration & Customization

### User Settings
Access the Settings page to configure:
- **Stock Thresholds** - Customize low stock alerts (default: 10 items)
- **Expiry Warnings** - Set expiration alert period (default: 3 days)
- **Default Categories** - Set preferred product categories
- **Location Settings** - Configure default warehouse locations
- **Notification Preferences** - Email alerts and system notifications

### Inventory Categories
Pre-configured categories include:
- **Produce** - Fresh fruits and vegetables
- **Dairy** - Milk, cheese, yogurt products
- **Bakery** - Bread, pastries, baked goods
- **Meat** - Fresh and processed meats
- **Beverages** - Drinks and liquid products
- **Pantry** - Dry goods and shelf-stable items
- **Frozen** - Frozen food products
- **Deli** - Prepared foods and deli items

## 📱 Detailed Usage Guide

### Inventory Management

#### Adding Items
1. **Manual Entry**
   - Click "Add Item" button
   - Fill in product details across three tabs:
     - Basic Info: Description, category, brand, UPC/SKU
     - Stock & Location: Quantities, warehouse location
     - Pricing: Costs, retail prices, vendor information

2. **Barcode Scanning**
   - Click "Scan Product" to activate camera
   - Point camera at barcode for automatic recognition
   - System will search for existing items or create new entry

3. **Bulk Import**
   - Use "Import CSV" for large inventory uploads
   - Download template for proper formatting
   - System validates and processes all entries with error reporting

#### Managing Stock
- **Real-time Updates** - Stock levels update automatically
- **Location Tracking** - Track items by aisle, row, and bin
- **Expiration Monitoring** - Visual alerts for items nearing expiration
- **Batch Operations** - Update multiple items simultaneously

### Invoice Processing

#### Upload Process
1. Navigate to Invoices page
2. Click "Upload Invoice"
3. Select CSV/Excel file from supplier
4. System automatically:
   - Matches products by UPC code
   - Updates inventory quantities
   - Creates invoice record
   - Flags any discrepancies

#### Invoice Management
- **Status Tracking** - Monitor payment status
- **Document Attachment** - Link original invoice files
- **Vendor Association** - Automatic vendor matching
- **Line Item Details** - View individual product entries

### Shopping List Automation

#### Automatic Generation
- Items automatically added when stock falls below threshold
- Priority assignment based on urgency:
  - **Urgent** - Out of stock items
  - **High** - Critical low stock (≤5 items)
  - **Medium** - Low stock (≤10 items)
  - **Low** - Planned restocking

#### Manual Management
- Add items directly from inventory
- Create custom items not in inventory
- Set custom quantities and priorities
- Track purchase completion

### Analytics & Reporting

#### Available Reports
1. **Consumption Trends**
   - Sales velocity analysis
   - Seasonal pattern recognition
   - Demand forecasting

2. **Waste Tracker**
   - Expired item monitoring
   - Value loss calculation
   - Waste pattern analysis

3. **Vendor Performance**
   - Margin analysis by supplier
   - Delivery performance metrics
   - Cost comparison reports

4. **Inventory Overview**
   - Stock level summaries
   - Category performance
   - Location utilization

#### Export Options
- **PDF Reports** - Professional formatted reports
- **Excel Exports** - Detailed data for analysis
- **CSV Downloads** - Raw data for external systems

## 🔍 Advanced Features

### Barcode Scanning
- **Multi-format Support** - UPC, EAN, Code 128, QR codes
- **Real-time Recognition** - Instant barcode detection
- **Visual Feedback** - Clear scanning indicators
- **Error Handling** - Graceful failure management

### AI-Powered Analytics
- **Demand Forecasting** - Predict future inventory needs
- **Seasonal Analysis** - Identify seasonal buying patterns
- **Anomaly Detection** - Flag unusual consumption patterns
- **Optimization Suggestions** - Recommend inventory improvements

### Automated Workflows
- **Smart Reordering** - Automatic shopping list generation
- **Expiration Alerts** - Proactive waste prevention
- **Low Stock Notifications** - Prevent stockouts
- **Vendor Performance Tracking** - Monitor supplier reliability

### Mobile Optimization
- **Responsive Design** - Works on all screen sizes
- **Touch-friendly Interface** - Optimized for mobile interaction
- **Offline Capability** - Basic functionality without internet
- **Camera Integration** - Mobile barcode scanning

## 🚀 Deployment Guide

### Production Build
```bash
# Create optimized production build
npm run build

# Preview production build locally
npm run preview
```

### Deployment Options

#### Vercel (Recommended)
1. Connect repository to Vercel
2. Set environment variables in dashboard
3. Deploy with automatic builds on git push

#### Netlify
1. Connect repository to Netlify
2. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Set environment variables

#### Self-hosted
1. Build the application: `npm run build`
2. Serve the `dist` folder with any web server
3. Ensure HTTPS for camera access

### Environment Variables
Ensure these are set in your deployment platform:
```env
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_anon_key
```

### Supabase Production Setup
1. **Database Configuration**
   - Apply all migrations to production database
   - Verify RLS policies are active
   - Set up automated backups

2. **Security Settings**
   - Configure allowed origins for your domain
   - Set up proper CORS policies
   - Enable email confirmation if needed

3. **Performance Optimization**
   - Set up database indexes
   - Configure connection pooling
   - Monitor query performance

## 🔒 Security Considerations

### Data Protection
- **Row Level Security** - Database-level access control
- **User Isolation** - Complete data separation between users
- **Encrypted Storage** - All data encrypted at rest
- **Secure Transmission** - HTTPS/TLS for all communications

### Authentication
- **Email/Password** - Secure user authentication
- **Session Management** - Automatic session expiration
- **Password Requirements** - Enforced strong passwords
- **Account Recovery** - Secure password reset process

### Privacy Compliance
- **GDPR Ready** - Data export and deletion capabilities
- **Audit Trails** - Complete action logging
- **Data Minimization** - Only collect necessary information
- **User Consent** - Clear privacy policy and terms

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes with proper TypeScript types
4. Add tests for new functionality
5. Ensure all tests pass: `npm run test`
6. Commit with descriptive messages: `git commit -m 'Add amazing feature'`
7. Push to your branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

### Code Standards
- **TypeScript** - All code must be properly typed
- **ESLint** - Follow established linting rules
- **Component Structure** - Use consistent file organization
- **Documentation** - Comment complex logic and APIs

### Testing
- Write unit tests for utilities and hooks
- Add integration tests for complex workflows
- Test responsive design on multiple devices
- Verify accessibility compliance

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support & Documentation

### Getting Help
- **Documentation** - Comprehensive guides in this README
- **Code Comments** - Detailed inline documentation
- **Issue Tracker** - Report bugs and request features
- **Community** - Join our discussions

### Troubleshooting

#### Common Issues
1. **Camera not working**
   - Ensure HTTPS in production
   - Check browser permissions
   - Verify camera hardware

2. **Database connection errors**
   - Verify Supabase credentials
   - Check network connectivity
   - Confirm RLS policies

3. **Import/Export issues**
   - Validate file format
   - Check column mappings
   - Review error messages

#### Performance Optimization
- **Database Indexes** - Ensure proper indexing
- **Image Optimization** - Compress uploaded images
- **Caching Strategy** - Implement browser caching
- **Bundle Size** - Monitor and optimize bundle size

## 🔄 Version History & Roadmap

### Current Version: 1.3.0
- ✅ Core inventory management
- ✅ Barcode scanning integration
- ✅ Advanced reporting and analytics
- ✅ AI-powered forecasting
- ✅ Automated workflows

### Upcoming Features (v1.4.0)
- 🔄 Multi-location support
- 🔄 Advanced user roles and permissions
- 🔄 API integrations with suppliers
- 🔄 Mobile app development
- 🔄 Advanced analytics dashboard

### Future Roadmap
- 📱 Native mobile applications
- 🤖 Enhanced AI features
- 🔗 ERP system integrations
- 📊 Advanced business intelligence
- 🌐 Multi-language support

---

**Built with ❤️ for efficient inventory management**

*Fresh Choice Inventory Management System - Transforming how businesses manage their inventory with modern technology and intelligent automation.*