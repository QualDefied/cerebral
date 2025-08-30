import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './utils/database.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authRoutes } from './routes/auth.js';
import { accountRoutes } from './routes/accounts.js';
import { transactionRoutes } from './routes/transactions.js';
import { creditCardRoutes } from './routes/creditCards.js';
import { cryptoRoutes } from './routes/crypto.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 9002;

// Configure CORS for local development only
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5180', 'http://127.0.0.1:5180', 'http://localhost:5186', 'http://127.0.0.1:5186'],
  credentials: true
}));

app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/credit-cards', creditCardRoutes);
app.use('/api/crypto-assets', cryptoRoutes);

// Health Check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK', message: 'Full Prisma server running' });
});

// Root route
app.get('/', (_req, res) => {
  res.json({ 
    message: 'TeamShell Finance API Server',
    status: 'running',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      accounts: '/api/accounts',
      transactions: '/api/transactions',
      creditCards: '/api/credit-cards',
      cryptoAssets: '/api/crypto-assets'
    }
  });
});

// Error Handler Middleware
app.use(errorHandler);

const startServer = async () => {
  await connectDB();
  app.listen(PORT, '127.0.0.1', () => {
    console.log(`🚀 Server running on http://127.0.0.1:${PORT}`);
    console.log(`📊 Full Prisma database integration enabled`);
  });
};

startServer();