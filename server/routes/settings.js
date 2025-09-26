import express from 'express';
import db from '../database.js';

const router = express.Router();

// Get system settings
router.get('/', (req, res) => {
  const query = `
    SELECT 
      setting_key,
      setting_value,
      description,
      data_type,
      created_at,
      updated_at
    FROM system_settings
    ORDER BY setting_key
  `;

  db.all(query, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    // If no settings exist, create default settings
    if (results.length === 0) {
      const defaultSettings = [
        { key: 'low_stock_threshold', value: '10', description: 'Low stock threshold', type: 'number' },
        { key: 'expiration_warning_days', value: '3', description: 'Days before expiration to show warning', type: 'number' },
        { key: 'reorder_multiplier', value: '2', description: 'Reorder quantity multiplier based on weekly sales', type: 'number' },
        { key: 'minimum_reorder_quantity', value: '20', description: 'Minimum reorder quantity', type: 'number' },
        { key: 'safety_stock_days', value: '7', description: 'Safety stock in days', type: 'number' },
        { key: 'lead_time_days', value: '3', description: 'Default vendor lead time in days', type: 'number' }
      ];

      const insertPromises = defaultSettings.map(setting => {
        return new Promise((resolve, reject) => {
          db.run(
            `INSERT INTO system_settings (setting_key, setting_value, description, data_type) 
             VALUES (?, ?, ?, ?)`,
            [setting.key, setting.value, setting.description, setting.type],
            function(err) {
              if (err) reject(err);
              else resolve();
            }
          );
        });
      });

      Promise.all(insertPromises)
        .then(() => {
          // Return default settings after creation
          const settings = defaultSettings.reduce((acc, setting) => {
            acc[setting.key] = {
              value: setting.type === 'number' ? parseFloat(setting.value) : setting.value,
              description: setting.description,
              type: setting.type
            };
            return acc;
          }, {});
          res.json(settings);
        })
        .catch(error => {
          console.error('Database error:', error);
          res.status(500).json({ error: 'Database error' });
        });
    } else {
      // Format existing settings
      const settings = results.reduce((acc, row) => {
        let value;
        switch (row.data_type) {
          case 'number':
            value = parseFloat(row.setting_value);
            break;
          case 'boolean':
            value = row.setting_value === 'true';
            break;
          default:
            value = row.setting_value;
        }
        
        acc[row.setting_key] = {
          value,
          description: row.description,
          type: row.data_type,
          updated_at: row.updated_at
        };
        return acc;
      }, {});
      
      res.json(settings);
    }
  });
});

// Update system setting
router.put('/:key', (req, res) => {
  const { key } = req.params;
  const { value } = req.body;

  if (value === undefined) {
    return res.status(400).json({ error: 'Value is required' });
  }

  db.run(
    `UPDATE system_settings 
     SET setting_value = ?, updated_at = CURRENT_TIMESTAMP
     WHERE setting_key = ?`,
    [value.toString(), key],
    function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Setting not found' });
      }

      res.json({ message: 'Setting updated successfully' });
    }
  );
});

// Get reorder calculation for an item
router.get('/reorder-calculation/:itemId', (req, res) => {
  const itemId = req.params.itemId;

  // Get item details and settings in parallel
  const itemQuery = `
    SELECT 
      i.id,
      i.description,
      i.remaining_stock,
      i.sales_weekly,
      i.unit_cost,
      i.vendor_id,
      v.lead_time_days
    FROM inventory i
    LEFT JOIN vendors v ON i.vendor_id = v.id
    WHERE i.id = ?
  `;

  const settingsQuery = `
    SELECT setting_key, setting_value 
    FROM system_settings 
    WHERE setting_key IN ('reorder_multiplier', 'minimum_reorder_quantity', 'safety_stock_days')
  `;

  db.get(itemQuery, [itemId], (err, item) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    db.all(settingsQuery, (err, settings) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      // Convert settings to object
      const settingsObj = settings.reduce((acc, setting) => {
        acc[setting.setting_key] = parseFloat(setting.setting_value);
        return acc;
      }, {});

      const reorderMultiplier = settingsObj.reorder_multiplier || 2;
      const minimumReorder = settingsObj.minimum_reorder_quantity || 20;
      const safetyStockDays = settingsObj.safety_stock_days || 7;
      const leadTimeDays = item.lead_time_days || 3;

      // Calculate reorder quantity
      const baseReorder = Math.max(item.sales_weekly * reorderMultiplier, minimumReorder);
      
      // Calculate safety stock
      const dailySales = item.sales_weekly / 7;
      const safetyStock = Math.ceil(dailySales * safetyStockDays);
      
      // Calculate reorder point
      const leadTimeStock = Math.ceil(dailySales * leadTimeDays);
      const reorderPoint = safetyStock + leadTimeStock;

      // Determine priority
      let priority;
      if (item.remaining_stock === 0) {
        priority = 'Urgent';
      } else if (item.remaining_stock <= reorderPoint * 0.5) {
        priority = 'High';
      } else if (item.remaining_stock <= reorderPoint) {
        priority = 'Medium';
      } else {
        priority = 'Low';
      }

      const calculation = {
        itemId: item.id,
        description: item.description,
        currentStock: item.remaining_stock,
        weeklySales: item.sales_weekly,
        reorderQuantity: Math.round(baseReorder),
        reorderPoint: Math.round(reorderPoint),
        safetyStock: Math.round(safetyStock),
        leadTimeDays,
        priority,
        estimatedCost: parseFloat((baseReorder * (item.unit_cost || 0)).toFixed(2)),
        parameters: {
          reorderMultiplier,
          minimumReorder,
          safetyStockDays,
          leadTimeDays
        }
      };

      res.json(calculation);
    });
  });
});

// Get all categories from inventory
router.get('/categories', (req, res) => {
  const query = `
    SELECT DISTINCT category 
    FROM inventory 
    WHERE category IS NOT NULL AND category != ''
    ORDER BY category
  `;

  db.all(query, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    const categories = results.map(row => row.category);
    res.json(categories);
  });
});

// Validate import data
router.post('/validate-import', (req, res) => {
  const { items } = req.body;

  if (!Array.isArray(items)) {
    return res.status(400).json({ error: 'Items array is required' });
  }

  const validationResults = {
    valid: [],
    invalid: [],
    summary: {
      total: items.length,
      valid: 0,
      invalid: 0,
      errors: {}
    }
  };

  // Check for existing UPCs
  const upcQuery = 'SELECT item_upc FROM inventory WHERE item_upc IS NOT NULL AND item_upc != ""';
  
  db.all(upcQuery, (err, existingUpcs) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    const existingUpcSet = new Set(existingUpcs.map(row => row.item_upc));

    items.forEach((item, index) => {
      const errors = [];

      // Required field validation
      if (!item.description || item.description.trim() === '') {
        errors.push('Description is required');
      }

      if (!item.category || item.category.trim() === '') {
        errors.push('Category is required');
      }

      // UPC uniqueness validation
      if (item.item_upc && existingUpcSet.has(item.item_upc)) {
        errors.push('UPC already exists in inventory');
      }

      // Numeric field validation
      if (item.unit_cost !== undefined && isNaN(parseFloat(item.unit_cost))) {
        errors.push('Unit cost must be a valid number');
      }

      if (item.remaining_stock !== undefined && isNaN(parseInt(item.remaining_stock))) {
        errors.push('Stock quantity must be a valid number');
      }

      if (errors.length === 0) {
        validationResults.valid.push({
          ...item,
          row: index + 1
        });
        validationResults.summary.valid++;
      } else {
        validationResults.invalid.push({
          ...item,
          row: index + 1,
          errors
        });
        validationResults.summary.invalid++;
        
        // Track error types for summary
        errors.forEach(error => {
          validationResults.summary.errors[error] = (validationResults.summary.errors[error] || 0) + 1;
        });
      }
    });

    res.json(validationResults);
  });
});

export default router;
