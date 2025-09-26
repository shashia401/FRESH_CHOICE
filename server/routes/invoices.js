import express from 'express';
import db from '../database.js';

const router = express.Router();

// Get all invoices
router.get('/', (req, res) => {
  const query = `
    SELECT 
      i.id,
      i.invoice_number,
      i.vendor_id,
      v.name as vendor_name,
      i.invoice_date,
      i.due_date,
      i.total_amount,
      i.status,
      i.item_count,
      i.created_at,
      i.updated_at
    FROM invoices i
    LEFT JOIN vendors v ON i.vendor_id = v.id
    ORDER BY i.invoice_date DESC
  `;

  db.all(query, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    const invoices = results.map(row => ({
      id: row.id,
      invoice_number: row.invoice_number,
      vendor_id: row.vendor_id,
      vendor_name: row.vendor_name || 'Unknown Vendor',
      invoice_date: row.invoice_date,
      due_date: row.due_date,
      total_amount: parseFloat((row.total_amount || 0).toFixed(2)),
      status: row.status || 'pending',
      item_count: row.item_count || 0,
      created_at: row.created_at,
      updated_at: row.updated_at
    }));

    res.json(invoices);
  });
});

// Get invoice items
router.get('/:id/items', (req, res) => {
  const invoiceId = req.params.id;
  
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
    WHERE ii.invoice_id = ?
    ORDER BY ii.id
  `;

  db.all(query, [invoiceId], (err, results) => {
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

// Create new invoice
router.post('/', (req, res) => {
  const { invoice_number, vendor_id, invoice_date, due_date, total_amount, status, items } = req.body;

  if (!invoice_number || !vendor_id || !invoice_date) {
    return res.status(400).json({ error: 'Invoice number, vendor ID, and invoice date are required' });
  }

  db.serialize(() => {
    // Insert invoice
    db.run(
      `INSERT INTO invoices (invoice_number, vendor_id, invoice_date, due_date, total_amount, status, item_count) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [invoice_number, vendor_id, invoice_date, due_date, total_amount || 0, status || 'pending', items?.length || 0],
      function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error' });
        }

        const invoiceId = this.lastID;

        // Insert invoice items if provided
        if (items && items.length > 0) {
          const itemStmt = db.prepare(`
            INSERT INTO invoice_items (invoice_id, description, quantity, unit_cost, total_cost, category, upc, sku)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `);

          items.forEach(item => {
            itemStmt.run([
              invoiceId,
              item.description,
              item.quantity,
              item.unit_cost,
              item.total_cost,
              item.category,
              item.upc,
              item.sku
            ]);
          });

          itemStmt.finalize();
        }

        res.status(201).json({
          id: invoiceId,
          invoice_number,
          vendor_id,
          invoice_date,
          due_date,
          total_amount: total_amount || 0,
          status: status || 'pending',
          item_count: items?.length || 0
        });
      }
    );
  });
});

// Update invoice status
router.put('/:id/status', (req, res) => {
  const invoiceId = req.params.id;
  const { status } = req.body;

  if (!status || !['pending', 'paid', 'overdue'].includes(status)) {
    return res.status(400).json({ error: 'Valid status is required' });
  }

  db.run(
    'UPDATE invoices SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [status, invoiceId],
    function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Invoice not found' });
      }

      res.json({ message: 'Invoice status updated successfully' });
    }
  );
});

export default router;
