import express from 'express';
import db from '../database.js';

const router = express.Router();

// Get all vendors
router.get('/', (req, res) => {
  db.all('SELECT * FROM vendors ORDER BY name', (err, vendors) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(vendors);
  });
});

// Get single vendor
router.get('/:id', (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT * FROM vendors WHERE id = ?', [id], (err, vendor) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    
    res.json(vendor);
  });
});

// Create new vendor
router.post('/', (req, res) => {
  const { name, contact_person, email, phone, address, payment_terms, active } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Vendor name is required' });
  }

  const query = `
    INSERT INTO vendors (name, contact_person, email, phone, address, payment_terms, active, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `;

  const values = [name, contact_person, email, phone, address, payment_terms, active !== undefined ? active : 1];

  db.run(query, values, function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    // Return the created vendor
    db.get('SELECT * FROM vendors WHERE id = ?', [this.lastID], (err, vendor) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.status(201).json(vendor);
    });
  });
});

// Update vendor
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, contact_person, email, phone, address, payment_terms, active } = req.body;

  const query = `
    UPDATE vendors SET
      name = ?, contact_person = ?, email = ?, phone = ?, address = ?, 
      payment_terms = ?, active = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  const values = [name, contact_person, email, phone, address, payment_terms, active, id];

  db.run(query, values, function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    // Return the updated vendor
    db.get('SELECT * FROM vendors WHERE id = ?', [id], (err, vendor) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(vendor);
    });
  });
});

// Delete vendor
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  // Don't allow deletion of default vendor
  if (id === '1') {
    return res.status(400).json({ error: 'Cannot delete default vendor' });
  }

  db.run('DELETE FROM vendors WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    res.json({ message: 'Vendor deleted successfully' });
  });
});

export default router;