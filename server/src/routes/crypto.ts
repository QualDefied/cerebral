import { Router } from 'express';
import {
  getCryptoAssets,
  createCryptoAsset,
  updateCryptoAsset,
  deleteCryptoAsset
} from '../controllers/cryptoController.js';

export const cryptoRoutes = Router();

// No authentication required - direct access enabled

cryptoRoutes.get('/', getCryptoAssets);
cryptoRoutes.post('/', createCryptoAsset);
cryptoRoutes.put('/:id', updateCryptoAsset);
cryptoRoutes.delete('/:id', deleteCryptoAsset);