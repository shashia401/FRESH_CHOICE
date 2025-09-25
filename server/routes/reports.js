import express from 'express';
import db from '../database.js';

const router = express.Router();

// Get waste report
router.get('/waste', (req, res) => {
  const query = `
    SELECT 
      category,
      COUNT(*) as item_count,
      SUM(remaining_stock) as total_stock,
      SUM(cust_cost_extended) as total_value,
      AVG(JULIANDAY('now') - JULIANDAY(expiration_date)) as avg_days_expired
    FROM inventory 
    WHERE expiration_date < date('now')
    GROUP BY category
    ORDER BY total_value DESC
  `;

  db.all(query, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    // Calculate waste metrics
    const wasteData = results.map(row => ({
      category: row.category || 'Unknown',
      itemCount: row.item_count,
      totalStock: row.total_stock || 0,
      wasteValue: row.total_value || 0,
      avgDaysExpired: Math.round(row.avg_days_expired || 0)
    }));

    res.json({
      wasteByCategory: wasteData,
      totalWasteValue: wasteData.reduce((sum, item) => sum + item.wasteValue, 0),
      totalWasteItems: wasteData.reduce((sum, item) => sum + item.itemCount, 0)
    });
  });
});

// Get consumption report
router.get('/consumption', (req, res) => {
  const query = `
    SELECT 
      category,
      SUM(sales_weekly) as weekly_sales,
      SUM(remaining_stock) as current_stock,
      AVG(unit_retail) as avg_price,
      COUNT(*) as item_count
    FROM inventory 
    GROUP BY category
    ORDER BY weekly_sales DESC
  `;

  db.all(query, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    const consumptionData = results.map(row => ({
      category: row.category || 'Unknown',
      weeklySales: row.weekly_sales || 0,
      currentStock: row.current_stock || 0,
      averagePrice: parseFloat((row.avg_price || 0).toFixed(2)),
      itemCount: row.item_count,
      turnoverRate: row.current_stock > 0 ? 
        parseFloat(((row.weekly_sales || 0) / row.current_stock * 100).toFixed(2)) : 0
    }));

    res.json({
      consumptionByCategory: consumptionData,
      totalWeeklySales: consumptionData.reduce((sum, item) => sum + item.weeklySales, 0),
      totalCurrentStock: consumptionData.reduce((sum, item) => sum + item.currentStock, 0)
    });
  });
});

// Get margins report
router.get('/margins', (req, res) => {
  const query = `
    SELECT 
      category,
      brand,
      description,
      unit_cost,
      unit_retail,
      gross_margin,
      cust_cost_extended,
      remaining_stock,
      sales_weekly
    FROM inventory 
    WHERE unit_cost > 0 AND unit_retail > 0
    ORDER BY gross_margin DESC
  `;

  db.all(query, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    // Calculate margin metrics
    const marginData = results.map(row => {
      const calculatedMargin = row.unit_retail > 0 ? 
        ((row.unit_retail - row.unit_cost) / row.unit_retail) : 0;
      
      return {
        category: row.category || 'Unknown',
        brand: row.brand || 'Unknown',
        description: row.description,
        unitCost: parseFloat((row.unit_cost || 0).toFixed(2)),
        unitRetail: parseFloat((row.unit_retail || 0).toFixed(2)),
        grossMargin: parseFloat((row.gross_margin || calculatedMargin).toFixed(4)),
        totalValue: parseFloat((row.cust_cost_extended || 0).toFixed(2)),
        stock: row.remaining_stock || 0,
        weeklySales: row.sales_weekly || 0
      };
    });

    // Group by category for summary
    const categoryMargins = {};
    marginData.forEach(item => {
      if (!categoryMargins[item.category]) {
        categoryMargins[item.category] = {
          category: item.category,
          items: [],
          avgMargin: 0,
          totalValue: 0,
          itemCount: 0
        };
      }
      categoryMargins[item.category].items.push(item);
      categoryMargins[item.category].totalValue += item.totalValue;
      categoryMargins[item.category].itemCount++;
    });

    // Calculate average margins
    Object.keys(categoryMargins).forEach(category => {
      const items = categoryMargins[category].items;
      categoryMargins[category].avgMargin = items.length > 0 ? 
        parseFloat((items.reduce((sum, item) => sum + item.grossMargin, 0) / items.length).toFixed(4)) : 0;
    });

    res.json({
      itemMargins: marginData,
      categoryMargins: Object.values(categoryMargins),
      overallMargin: marginData.length > 0 ? 
        parseFloat((marginData.reduce((sum, item) => sum + item.grossMargin, 0) / marginData.length).toFixed(4)) : 0
    });
  });
});

export default router;