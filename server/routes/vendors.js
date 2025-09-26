import express from 'express';
import db from '../database.js';

const router = express.Router();

// Get all vendors
router.get('/', (req, res) => {
  const query = `
    SELECT 
      id,
      name,
      contact_person,
      email,
      phone,
      address,
      payment_terms,
      active,
      created_at,
      updated_at
    FROM vendors
    ORDER BY name ASC
  `;

  db.all(query, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    const vendors = results.map(row => ({
      id: row.id,
      name: row.name,
      contact_person: row.contact_person,
      email: row.email,
      phone: row.phone,
      address: row.address,
      payment_terms: row.payment_terms,
      active: row.active === 1,
      created_at: row.created_at,
      updated_at: row.updated_at
    }));

    res.json(vendors);
  });
});

// Get vendor by ID
router.get('/:id', (req, res) => {
  const vendorId = req.params.id;
  
  const query = `
    SELECT 
      id,
      name,
      contact_person,
      email,
      phone,
      address,
      payment_terms,
      active,
      created_at,
      updated_at
    FROM vendors
    WHERE id = ?
  `;

  db.get(query, [vendorId], (err, row) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    const vendor = {
      id: row.id,
      name: row.name,
      contact_person: row.contact_person,
      email: row.email,
      phone: row.phone,
      address: row.address,
      payment_terms: row.payment_terms,
      active: row.active === 1,
      created_at: row.created_at,
      updated_at: row.updated_at
    };

    res.json(vendor);
  });
});

// Create new vendor
router.post('/', (req, res) => {
  const { name, contact_person, email, phone, address, payment_terms } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Vendor name is required' });
  }

  db.run(
    `INSERT INTO vendors (name, contact_person, email, phone, address, payment_terms) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [name, contact_person, email, phone, address, payment_terms],
    function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      res.status(201).json({
        id: this.lastID,
        name,
        contact_person,
        email,
        phone,
        address,
        payment_terms,
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
  );
});

// Update vendor
router.put('/:id', (req, res) => {
  const vendorId = req.params.id;
  const { name, contact_person, email, phone, address, payment_terms, active } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Vendor name is required' });
  }

  db.run(
    `UPDATE vendors 
     SET name = ?, contact_person = ?, email = ?, phone = ?, address = ?, payment_terms = ?, active = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [name, contact_person, email, phone, address, payment_terms, active ? 1 : 0, vendorId],
    function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Vendor not found' });
      }

      res.json({ message: 'Vendor updated successfully' });
    }
  );
});

// Delete vendor
router.delete('/:id', (req, res) => {
  const vendorId = req.params.id;

  db.run(
    'DELETE FROM vendors WHERE id = ?',
    [vendorId],
    function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Vendor not found' });
      }

      res.json({ message: 'Vendor deleted successfully' });
    }
  );
});

// Get vendor invoices
router.get('/:id/invoices', (req, res) => {
  const vendorId = req.params.id;
  
  const query = `
    SELECT 
      i.id,
      i.invoice_number,
      i.invoice_date,
      i.due_date,
      i.total_amount,
      i.status,
      i.item_count,
      i.created_at
    FROM invoices i
    WHERE i.vendor_id = ?
    ORDER BY i.invoice_date DESC
  `;

  db.all(query, [vendorId], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    const invoices = results.map(row => ({
      id: row.id,
      invoice_no: row.invoice_number,
      date: row.invoice_date,
      due_date: row.due_date,
      amount: parseFloat((row.total_amount || 0).toFixed(2)),
      status: row.status || 'pending',
      items_count: row.item_count || 0,
      created_at: row.created_at
    }));

    res.json(invoices);
  });
});

// Get vendor invoice items
router.get('/:vendorId/invoices/:invoiceId/items', (req, res) => {
  const { vendorId, invoiceId } = req.params;
  
  const query = `
    SELECT 
      ii.id,
      ii.invoice_id,
      ii.description,
      ii.quantity,
      ii.unit_cost,
      ii.total_cost,
      ii.category,
      ii.upc,
      ii.sku,
      ii.created_at
    FROM invoice_items ii
    INNER JOIN invoices i ON ii.invoice_id = i.id
    WHERE i.id = ? AND i.vendor_id = ?
    ORDER BY ii.id
  `;

  db.all(query, [invoiceId, vendorId], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    const items = results.map(row => ({
      id: row.id,
      invoice_id: row.invoice_id,
      description: row.description,
      quantity: row.quantity,
      unit_cost: parseFloat((row.unit_cost || 0).toFixed(2)),
      total_cost: parseFloat((row.total_cost || 0).toFixed(2)),
      category: row.category,
      upc: row.upc,
      sku: row.sku,
      created_at: row.created_at
    }));

    res.json(items);
  });
});

// Get vendor products
router.get('/:id/products', (req, res) => {
  const vendorId = req.params.id;
  
  const query = `
    SELECT 
      i.id,
      i.description as name,
      i.category,
      i.unit_cost,
      i.created_at,
      COUNT(ii.id) as total_ordered,
      MAX(ii.created_at) as last_ordered
    FROM inventory i
    LEFT JOIN invoice_items ii ON i.id = ii.item_id
    WHERE i.vendor_id = ?
    GROUP BY i.id
    ORDER BY i.description ASC
  `;

  db.all(query, [vendorId], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    const products = results.map(row => ({
      id: row.id,
      name: row.name,
      category: row.category,
      unit_cost: parseFloat((row.unit_cost || 0).toFixed(2)),
      last_ordered: row.last_ordered,
      total_ordered: row.total_ordered || 0
    }));

    res.json(products);
  });
});

export default router;
