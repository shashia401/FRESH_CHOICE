import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Store database in server directory for easy access and download
const DATA_DIR = process.env.DATA_DIR || join(__dirname, 'freshchoice-data');
if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}

// Create SQLite database in safe location
const db = new sqlite3.Database(join(DATA_DIR, 'freshchoice.db'));

export const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Users table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          username TEXT NOT NULL,
          password TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Note: No default admin user created for security
      // Use signup endpoint or manual database setup to create admin users
      
      // Enable foreign key constraints
      db.run('PRAGMA foreign_keys = ON;');

      // Inventory table
      db.run(`
        CREATE TABLE IF NOT EXISTS inventory (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          invoice_no TEXT,
          invoice_delivery_date TEXT,
          description TEXT NOT NULL,
          category TEXT,
          brand TEXT,
          department TEXT,
          item_sku TEXT,
          item_upc TEXT UNIQUE,
          pack_size TEXT,
          qty_shipped INTEGER DEFAULT 0,
          remaining_stock INTEGER DEFAULT 0,
          sales_weekly INTEGER DEFAULT 0,
          location TEXT,
          aisle TEXT,
          row TEXT,
          bin TEXT,
          expiration_date TEXT,
          unit_cost REAL DEFAULT 0,
          vendor_cost REAL DEFAULT 0,
          cust_cost_each REAL DEFAULT 0,
          cust_cost_extended REAL DEFAULT 0,
          unit_retail REAL DEFAULT 0,
          gross_margin REAL DEFAULT 0,
          burd_unit_cost REAL DEFAULT 0,
          burd_gross_margin REAL DEFAULT 0,
          discount_allowance REAL DEFAULT 0,
          advertising_flag BOOLEAN DEFAULT 0,
          order_type TEXT DEFAULT 'Regular',
          vendor_id INTEGER DEFAULT 1 REFERENCES vendors(id),
          user_id INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Shopping list table
      db.run(`
        CREATE TABLE IF NOT EXISTS shopping_list (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          item_name TEXT NOT NULL,
          category TEXT,
          quantity INTEGER DEFAULT 1,
          priority TEXT DEFAULT 'Medium',
          vendor_id INTEGER REFERENCES vendors(id),
          notes TEXT,
          purchased BOOLEAN DEFAULT 0,
          purchase_date DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Vendors table
      db.run(`
        CREATE TABLE IF NOT EXISTS vendors (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          contact_person TEXT,
          email TEXT,
          phone TEXT,
          address TEXT,
          payment_terms TEXT,
          active BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Insert default vendor
      db.run(`
        INSERT OR IGNORE INTO vendors (id, name, contact_person, email, phone) 
        VALUES (1, 'Default Vendor', 'Contact Person', 'contact@vendor.com', '555-0123')
      `);

      console.log('✅ Database initialized successfully');
      resolve();
    });
  });
};

export default db;