import { Router } from 'express';
import { wipeAllData } from '../controllers/dataController.js';

export const dataRoutes = Router();

// Data management routes
dataRoutes.delete('/wipe-all', wipeAllData);