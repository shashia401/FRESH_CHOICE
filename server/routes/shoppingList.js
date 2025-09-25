import express from 'express';
import db from '../database.js';

const router = express.Router();

// Get all shopping list items
router.get('/', (req, res) => {
  db.all('SELECT * FROM shopping_list ORDER BY created_at DESC', (err, items) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(items);
  });
});

// Add item to shopping list
router.post('/', (req, res) => {
  const { item_name, category, quantity, priority, vendor_id, notes } = req.body;

  if (!item_name) {
    return res.status(400).json({ error: 'Item name is required' });
  }

  const query = `
    INSERT INTO shopping_list (item_name, category, quantity, priority, vendor_id, notes, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `;

  const values = [
    item_name, 
    category, 
    quantity || 1, 
    priority || 'Medium', 
    vendor_id || 1, 
    notes
  ];

  db.run(query, values, function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    // Return the created item
    db.get('SELECT * FROM shopping_list WHERE id = ?', [this.lastID], (err, item) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.status(201).json(item);
    });
  });
});

// Mark item as purchased
router.put('/:id/purchase', (req, res) => {
  const { id } = req.params;

  const query = `
    UPDATE shopping_list 
    SET purchased = 1, purchase_date = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  db.run(query, [id], function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Return the updated item
    db.get('SELECT * FROM shopping_list WHERE id = ?', [id], (err, item) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(item);
    });
  });
});

// Update shopping list item
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { item_name, category, quantity, priority, vendor_id, notes } = req.body;

  const query = `
    UPDATE shopping_list 
    SET item_name = ?, category = ?, quantity = ?, priority = ?, vendor_id = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  const values = [item_name, category, quantity, priority, vendor_id, notes, id];

  db.run(query, values, function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Return the updated item
    db.get('SELECT * FROM shopping_list WHERE id = ?', [id], (err, item) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(item);
    });
  });
});

// Delete shopping list item
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM shopping_list WHERE id = ?', [id], function(err) {
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