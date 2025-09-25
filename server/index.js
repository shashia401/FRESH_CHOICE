import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { initDatabase } from './database.js';
import { authenticateToken } from './middleware/auth.js';
import authRoutes from './routes/auth.js';
import inventoryRoutes from './routes/inventory.js';
import shoppingListRoutes from './routes/shoppingList.js';
import vendorRoutes from './routes/vendors.js';
import reportsRoutes from './routes/reports.js';

dotenv.config();

// Validate required environment variables
if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is required');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy for accurate client IPs behind reverse proxy
app.set('trust proxy', 1);

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: { error: 'Too many authentication attempts, try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(helmet());
app.use(compression());
// Restrict CORS to frontend origin in production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL || 'https://your-frontend-domain.com'
    : ['http://localhost:5000', 'http://127.0.0.1:5000'],
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));

// Initialize database
initDatabase();

// Routes (auth with rate limiting)
app.use('/api', authLimiter, authRoutes);
app.use('/api/inventory', authenticateToken, inventoryRoutes);
app.use('/api/shopping-list', authenticateToken, shoppingListRoutes);
app.use('/api/vendors', authenticateToken, vendorRoutes);
app.use('/api/reports', authenticateToken, reportsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Fresh Choice Inventory Backend is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`🚀 Fresh Choice Backend running on http://127.0.0.1:${PORT}`);
});