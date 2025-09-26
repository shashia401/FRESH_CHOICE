import express from 'express';
import db from '../database.js';

const router = express.Router();

// Get dashboard alerts
router.get('/alerts', (req, res) => {
  const query = `
    SELECT 
      i.id,
      i.description,
      i.remaining_stock,
      i.expiration_date,
      i.category,
      i.unit_cost,
      CASE 
        WHEN i.remaining_stock = 0 THEN 'out-of-stock'
        WHEN i.remaining_stock <= 10 THEN 'low-stock'
        WHEN julianday(i.expiration_date) - julianday('now') <= 7 THEN 'expiring'
        ELSE 'normal'
      END as alert_type
    FROM inventory i
    WHERE i.remaining_stock = 0 
       OR i.remaining_stock <= 10 
       OR julianday(i.expiration_date) - julianday('now') <= 7
    ORDER BY 
      CASE 
        WHEN i.remaining_stock = 0 THEN 1
        WHEN i.remaining_stock <= 10 THEN 2
        WHEN julianday(i.expiration_date) - julianday('now') <= 7 THEN 3
        ELSE 4
      END,
      i.remaining_stock ASC,
      i.expiration_date ASC
    LIMIT 10
  `;

  db.all(query, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    const alerts = results.map(row => ({
      id: row.id,
      item: row.description,
      stock: row.remaining_stock,
      threshold: 10,
      expiry: row.expiration_date,
      category: row.category,
      unit_cost: parseFloat((row.unit_cost || 0).toFixed(2)),
      type: row.alert_type
    }));

    res.json(alerts);
  });
});

// Get recent activity
router.get('/activity', (req, res) => {
  // First, check if activity_log table exists
  const checkTableQuery = `
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name='activity_log'
  `;

  db.get(checkTableQuery, (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (!result) {
      // If activity_log table doesn't exist, create it
      db.run(`
        CREATE TABLE IF NOT EXISTS activity_log (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER REFERENCES users(id),
          action TEXT NOT NULL,
          item_description TEXT,
          item_id INTEGER,
          details TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error' });
        }

        // After creating table, return empty array for now
        res.json([]);
      });
    } else {
      // If table exists, get recent activity
      const activityQuery = `
        SELECT 
          al.id,
          al.action,
          al.item_description as item,
          al.details,
          al.created_at,
          u.username as user
        FROM activity_log al
        LEFT JOIN users u ON al.user_id = u.id
        ORDER BY al.created_at DESC
        LIMIT 10
      `;

      db.all(activityQuery, (err, results) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error' });
        }

        const activities = results.map(row => {
          const timeDiff = Date.now() - new Date(row.created_at).getTime();
          const hoursAgo = Math.floor(timeDiff / (1000 * 60 * 60));
          const timeText = hoursAgo < 24 ? 
            `${hoursAgo} hours ago` : 
            `${Math.floor(hoursAgo / 24)} days ago`;

          return {
            id: row.id,
            action: row.action,
            item: row.item,
            time: timeText,
            type: row.action.toLowerCase().includes('delete') ? 'delete' : 
                  row.action.toLowerCase().includes('add') ? 'add' : 'update',
            user: row.user || 'system',
            details: row.details,
            created_at: row.created_at
          };
        });

        res.json(activities);
      });
    }
  });
});

// Get dashboard statistics
router.get('/stats', (req, res) => {
  const statsQuery = `
    SELECT 
      COUNT(*) as total_items,
      SUM(CASE WHEN remaining_stock <= 10 THEN 1 ELSE 0 END) as low_stock_items,
      SUM(CASE WHEN julianday(expiration_date) - julianday('now') <= 7 THEN 1 ELSE 0 END) as expiring_items,
      COALESCE(SUM(sales_weekly), 0) as weekly_sales
    FROM inventory
  `;

  db.get(statsQuery, (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    const stats = {
      totalItems: result.total_items || 0,
      lowStockItems: result.low_stock_items || 0,
      expiringItems: result.expiring_items || 0,
      weeklySales: parseFloat((result.weekly_sales || 0).toFixed(2))
    };

    res.json(stats);
  });
});

export default router;
