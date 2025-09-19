import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './utils/database.js';
import { errorHandler } from './middleware/errorHandler.js';
import { creditCardRoutes } from './routes/creditCards.js';
import { cryptoRoutes } from './routes/crypto.js';
import { dataRoutes } from './routes/data.js';
import { financialProfileRoutes } from './routes/financialProfile.js';
import { userGoalsRoutes } from './routes/userGoals.js';

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
app.use('/api/credit-cards', creditCardRoutes);
app.use('/api/crypto-assets', cryptoRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/financial-profile', financialProfileRoutes);
app.use('/api/user-goals', userGoalsRoutes);

// Health Check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK', message: 'Full Prisma server running' });
});

// Root route
app.get('/', (_req, res) => {
  res.json({
    message: 'Cerebral Finance API Server',
    status: 'running',
    endpoints: {
      health: '/api/health',
      creditCards: '/api/credit-cards',
      cryptoAssets: '/api/crypto-assets',
      data: '/api/data',
      financialProfile: '/api/financial-profile',
      userGoals: '/api/user-goals'
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