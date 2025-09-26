import express from 'express';
import db from '../database.js';

const router = express.Router();

// Get all inventory items
router.get('/', (req, res) => {
  db.all('SELECT * FROM inventory ORDER BY created_at DESC', (err, items) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(items);
  });
});

// Get single inventory item
router.get('/:id', (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT * FROM inventory WHERE id = ?', [id], (err, item) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json(item);
  });
});

// Create new inventory item
router.post('/', (req, res) => {
  const {
    invoice_no, invoice_delivery_date, description, category, brand,
    department, item_sku, item_upc, pack_size, qty_shipped, remaining_stock,
    sales_weekly, location, aisle, row, bin, expiration_date, unit_cost,
    vendor_cost, cust_cost_each, cust_cost_extended, unit_retail, gross_margin,
    burd_unit_cost, burd_gross_margin, discount_allowance, advertising_flag,
    order_type, vendor_id
  } = req.body;

  if (!description) {
    return res.status(400).json({ error: 'Description is required' });
  }

  const query = `
    INSERT INTO inventory (
      invoice_no, invoice_delivery_date, description, category, brand,
      department, item_sku, item_upc, pack_size, qty_shipped, remaining_stock,
      sales_weekly, location, aisle, row, bin, expiration_date, unit_cost,
      vendor_cost, cust_cost_each, cust_cost_extended, unit_retail, gross_margin,
      burd_unit_cost, burd_gross_margin, discount_allowance, advertising_flag,
      order_type, vendor_id, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `;

  const values = [
    invoice_no, invoice_delivery_date, description, category, brand,
    department, item_sku, item_upc, pack_size, qty_shipped || 0, remaining_stock || 0,
    sales_weekly || 0, location, aisle, row, bin, expiration_date, unit_cost || 0,
    vendor_cost || 0, cust_cost_each || 0, cust_cost_extended || 0, unit_retail || 0, 
    gross_margin || 0, burd_unit_cost || 0, burd_gross_margin || 0, discount_allowance || 0, 
    advertising_flag || 0, order_type || 'Regular', vendor_id || 1
  ];

  db.run(query, values, function(err) {
    if (err) {
      console.error('Database error:', err);
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ error: 'Item with this UPC already exists' });
      }
      return res.status(500).json({ error: 'Database error' });
    }

    // Return the created item
    db.get('SELECT * FROM inventory WHERE id = ?', [this.lastID], (err, item) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.status(201).json(item);
    });
  });
});

// Update inventory item
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const {
    invoice_no, invoice_delivery_date, description, category, brand,
    department, item_sku, item_upc, pack_size, qty_shipped, remaining_stock,
    sales_weekly, location, aisle, row, bin, expiration_date, unit_cost,
    vendor_cost, cust_cost_each, cust_cost_extended, unit_retail, gross_margin,
    burd_unit_cost, burd_gross_margin, discount_allowance, advertising_flag,
    order_type, vendor_id
  } = req.body;

  const query = `
    UPDATE inventory SET
      invoice_no = ?, invoice_delivery_date = ?, description = ?, category = ?, brand = ?,
      department = ?, item_sku = ?, item_upc = ?, pack_size = ?, qty_shipped = ?, 
      remaining_stock = ?, sales_weekly = ?, location = ?, aisle = ?, row = ?, bin = ?, 
      expiration_date = ?, unit_cost = ?, vendor_cost = ?, cust_cost_each = ?, 
      cust_cost_extended = ?, unit_retail = ?, gross_margin = ?, burd_unit_cost = ?, 
      burd_gross_margin = ?, discount_allowance = ?, advertising_flag = ?, order_type = ?, 
      vendor_id = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  const values = [
    invoice_no, invoice_delivery_date, description, category, brand,
    department, item_sku, item_upc, pack_size, qty_shipped || 0, remaining_stock || 0,
    sales_weekly || 0, location, aisle, row, bin, expiration_date, unit_cost || 0,
    vendor_cost || 0, cust_cost_each || 0, cust_cost_extended || 0, unit_retail || 0, 
    gross_margin || 0, burd_unit_cost || 0, burd_gross_margin || 0, discount_allowance || 0, 
    advertising_flag || 0, order_type || 'Regular', vendor_id || 1, id
  ];

  db.run(query, values, function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Return the updated item
    db.get('SELECT * FROM inventory WHERE id = ?', [id], (err, item) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(item);
    });
  });
});

// Bulk import inventory items
router.post('/bulk', (req, res) => {
  const items = req.body.items;
  
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Items array is required' });
  }

  const results = {
    success: 0,
    errors: [],
    total: items.length
  };

  let processed = 0;

  const processItem = (item, index) => {
    return new Promise((resolve) => {
      const {
        invoice_no, invoice_delivery_date, description, category, brand,
        department, item_sku, item_upc, pack_size, qty_shipped, remaining_stock,
        sales_weekly, location, aisle, row, bin, expiration_date, unit_cost,
        vendor_cost, cust_cost_each, cust_cost_extended, unit_retail, gross_margin,
        burd_unit_cost, burd_gross_margin, discount_allowance, advertising_flag,
        order_type, vendor_id
      } = item;

      if (!description) {
        results.errors.push({ index, error: 'Description is required' });
        return resolve();
      }

      const query = `
        INSERT INTO inventory (
          invoice_no, invoice_delivery_date, description, category, brand,
          department, item_sku, item_upc, pack_size, qty_shipped, remaining_stock,
          sales_weekly, location, aisle, row, bin, expiration_date, unit_cost,
          vendor_cost, cust_cost_each, cust_cost_extended, unit_retail, gross_margin,
          burd_unit_cost, burd_gross_margin, discount_allowance, advertising_flag,
          order_type, vendor_id, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `;

      const values = [
        invoice_no, invoice_delivery_date, description, category, brand,
        department, item_sku, item_upc, pack_size, qty_shipped || 0, remaining_stock || 0,
        sales_weekly || 0, location, aisle, row, bin, expiration_date, unit_cost || 0,
        vendor_cost || 0, cust_cost_each || 0, cust_cost_extended || 0, unit_retail || 0, 
        gross_margin || 0, burd_unit_cost || 0, burd_gross_margin || 0, discount_allowance || 0, 
        advertising_flag || 0, order_type || 'Regular', vendor_id || 1
      ];

      db.run(query, values, function(err) {
        if (err) {
          console.error('Database error for item', index, ':', err);
          if (err.message.includes('UNIQUE constraint failed')) {
            results.errors.push({ index, error: 'Item with this UPC already exists' });
          } else {
            results.errors.push({ index, error: 'Database error: ' + err.message });
          }
        } else {
          results.success++;
        }
        processed++;
        resolve();
      });
    });
  };

  // Process items sequentially to avoid database locks
  const processSequentially = async () => {
    for (let i = 0; i < items.length; i++) {
      await processItem(items[i], i);
    }
    
    res.json(results);
  };

  processSequentially();
});

// Delete inventory item
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM inventory WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json({ message: 'Item deleted successfully' });
  });
});

export default router;
