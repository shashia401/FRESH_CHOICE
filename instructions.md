 # Fresh Choice Inventory Management System - Setup Instructions

A comprehensive inventory management system designed for grocery stores and food retailers with real-time tracking, vendor management, and automated shopping list generation.

## Prerequisites

- **Node.js**: Version 18.0 or higher
- **npm**: Version 8.0 or higher
- **Git**: For cloning the repository

## Installation

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd fresh-choice-inventory
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup (Optional)
Create a `.env` file in the root directory for custom configuration:
```bash
# Optional: Custom database location
DATA_DIR=/path/to/your/database/directory

# Optional: Custom JWT secret (auto-generated if not provided)
JWT_SECRET=your-custom-jwt-secret-here

# Optional: Custom port (defaults to 3000)
PORT=3000
```

## Running the Application

### Method 1: Full Development Setup (Recommended)
Start both backend and frontend simultaneously:
```bash
npm run dev
```
This starts:
- **Backend API**: http://localhost:3000
- **Frontend App**: http://localhost:5173

### Method 2: Backend Only
To run just the backend server:
```bash
npm run backend
# or
npm start
```

### Method 3: Production Build
Build and preview the production version:
```bash
npm run build
npm run preview
```

## Database Setup

The application uses SQLite and automatically initializes the database on first run:

- **Database Location**: `server/freshchoice-data/freshchoice.db`
- **Auto-initialization**: Creates all tables and default vendor on startup
- **No manual setup required**

### Database Tables Created:
- `users` - User authentication and profiles
- `inventory` - Product inventory items
- `vendors` - Supplier information
- `shopping_list` - Auto-generated shopping lists

## First Time Setup

### 1. Create Your Admin Account
1. Open http://localhost:5173
2. Click "Sign Up" to create your admin account
3. Use your email and create a secure password

### 2. Start Adding Inventory
1. Navigate to "Inventory" page
2. Click "Add Item" to start building your inventory
3. Use barcode scanner for quick item entry

### 3. Manage Vendors
1. Go to "Vendors" page
2. Add your suppliers with contact information
3. Link inventory items to vendors

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server (frontend + backend) |
| `npm run backend` | Start backend API server only |
| `npm start` | Alias for backend server |
| `npm run build` | Build production frontend |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint code checks |

## Project Structure

```
fresh-choice-inventory/
├── server/                 # Backend API (Express.js)
│   ├── routes/            # API route handlers
│   ├── middleware/        # Authentication & security
│   ├── freshchoice-data/  # SQLite database directory
│   ├── database.js        # Database setup & schemas
│   └── index.js          # Main server file
├── src/                   # Frontend application (React)
│   ├── components/        # Reusable UI components
│   ├── pages/            # Application pages
│   ├── utils/            # Utilities and API client
│   └── types/            # TypeScript type definitions
├── package.json          # Dependencies and scripts
└── instructions.md       # This file
```

## Features

- **📦 Inventory Management**: Track stock levels, locations, and expiration dates
- **🏪 Vendor Management**: Manage supplier relationships and contact information
- **📋 Smart Shopping Lists**: Auto-generated based on low stock and sales patterns
- **📊 Analytics Dashboard**: Real-time insights into inventory and sales
- **📱 Barcode Scanning**: Quick product entry and lookup
- **🔐 User Authentication**: Secure login with JWT tokens
- **📈 Reports**: Inventory reports and analytics

## Default Configuration

- **Frontend Port**: 5173 (development)
- **Backend Port**: 3000
- **Database**: SQLite (local file)
- **Authentication**: JWT with secure password hashing
- **CORS**: Enabled for development

## Troubleshooting

### Common Issues

**❌ Port 3000 already in use**
```bash
# Kill existing process
lsof -ti:3000 | xargs kill -9
# Or change port in .env file
echo "PORT=3001" >> .env
```

**❌ Database permission errors**
```bash
# Ensure directory exists and has write permissions
mkdir -p server/freshchoice-data
chmod 755 server/freshchoice-data
```

**❌ npm install fails**
```bash
# Clear npm cache and retry
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**❌ Frontend not connecting to backend**
- Ensure backend is running on port 3000
- Check browser console for CORS errors
- Verify API endpoints in `src/utils/api.ts`

### Development Notes

- **Hot Reload**: Frontend automatically reloads on changes
- **Database**: Automatically created in `server/freshchoice-data/`
- **Authentication**: Use signup page to create your first user
- **API Endpoints**: Available at http://localhost:3000/api/

### Database Management

**Backup Database:**
```bash
cp server/freshchoice-data/freshchoice.db backup-$(date +%Y%m%d).db
```

**Reset Database:**
```bash
rm server/freshchoice-data/freshchoice.db
npm run backend  # Will recreate on startup
```

## Production Deployment

For production deployment:

1. Build the frontend: `npm run build`
2. Set production environment variables
3. Use a process manager like PM2 for the backend
4. Consider upgrading to PostgreSQL for larger deployments
5. Set up proper SSL/TLS certificates

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the console logs for error messages
3. Ensure all prerequisites are installed correctly

---

**Fresh Choice Inventory Management System** - Built with React, Express.js, and SQLite