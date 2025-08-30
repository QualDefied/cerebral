import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getCryptoAssets = async (req: Request, res: Response) => {
  try {
    // Use a default user ID since authentication is bypassed
    const userId = 'demo-user';

    const cryptoAssets = await prisma.cryptoAsset.findMany({
      where: { userId, isActive: true },
      orderBy: { createdAt: 'desc' }
    });

    const cryptoAssetsWithCalculations = cryptoAssets.map(asset => {
      const quantity = Number(asset.quantity);
      const averageCost = Number(asset.averageCost);
      const currentPrice = Number(asset.currentPrice);
      
      const totalValue = quantity * currentPrice;
      const totalCost = quantity * averageCost;
      const gainLoss = totalValue - totalCost;
      const gainLossPercentage = totalCost > 0 ? (gainLoss / totalCost) * 100 : 0;
      
      return {
        ...asset,
        quantity: quantity,
        averageCost: averageCost,
        currentPrice: currentPrice,
        totalValue: totalValue,
        totalCost: totalCost,
        gainLoss: gainLoss,
        gainLossPercentage: gainLossPercentage
      };
    });

    res.json(cryptoAssetsWithCalculations);
  } catch (error) {
    console.error('Error fetching crypto assets:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createCryptoAsset = async (req: Request, res: Response) => {
  try {
    // Use a default user ID since authentication is bypassed
    const userId = 'demo-user';

    const {
      symbol,
      quantity = 0,
      averageCost = 0,
      currentPrice = 0,
      platform,
      walletAddress
    } = req.body;

    if (!symbol) {
      return res.status(400).json({ 
        message: 'Missing required field: symbol' 
      });
    }

    const cryptoAsset = await prisma.cryptoAsset.create({
      data: {
        userId,
        symbol: symbol.toUpperCase(),
        quantity,
        averageCost,
        currentPrice,
        platform,
        walletAddress
      }
    });

    const quantity_num = Number(cryptoAsset.quantity);
    const averageCost_num = Number(cryptoAsset.averageCost);
    const currentPrice_num = Number(cryptoAsset.currentPrice);
    
    const totalValue = quantity_num * currentPrice_num;
    const totalCost = quantity_num * averageCost_num;
    const gainLoss = totalValue - totalCost;
    const gainLossPercentage = totalCost > 0 ? (gainLoss / totalCost) * 100 : 0;

    const cryptoAssetWithCalculations = {
      ...cryptoAsset,
      quantity: quantity_num,
      averageCost: averageCost_num,
      currentPrice: currentPrice_num,
      totalValue: totalValue,
      totalCost: totalCost,
      gainLoss: gainLoss,
      gainLossPercentage: gainLossPercentage
    };

    res.status(201).json(cryptoAssetWithCalculations);
  } catch (error) {
    console.error('Error creating crypto asset:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateCryptoAsset = async (req: Request, res: Response) => {
  try {
    // Use a default user ID since authentication is bypassed
    const userId = 'demo-user';
    const { id } = req.params;

    const existingAsset = await prisma.cryptoAsset.findFirst({
      where: { id, userId }
    });

    if (!existingAsset) {
      return res.status(404).json({ message: 'Crypto asset not found' });
    }

    const updateData = { ...req.body };
    if (updateData.symbol) {
      updateData.symbol = updateData.symbol.toUpperCase();
    }
    delete updateData.id;
    delete updateData.userId;

    const cryptoAsset = await prisma.cryptoAsset.update({
      where: { id },
      data: updateData
    });

    const quantity = Number(cryptoAsset.quantity);
    const averageCost = Number(cryptoAsset.averageCost);
    const currentPrice = Number(cryptoAsset.currentPrice);
    
    const totalValue = quantity * currentPrice;
    const totalCost = quantity * averageCost;
    const gainLoss = totalValue - totalCost;
    const gainLossPercentage = totalCost > 0 ? (gainLoss / totalCost) * 100 : 0;

    const cryptoAssetWithCalculations = {
      ...cryptoAsset,
      quantity: quantity,
      averageCost: averageCost,
      currentPrice: currentPrice,
      totalValue: totalValue,
      totalCost: totalCost,
      gainLoss: gainLoss,
      gainLossPercentage: gainLossPercentage
    };

    res.json(cryptoAssetWithCalculations);
  } catch (error) {
    console.error('Error updating crypto asset:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteCryptoAsset = async (req: Request, res: Response) => {
  try {
    // Use a default user ID since authentication is bypassed
    const userId = 'demo-user';
    const { id } = req.params;

    const existingAsset = await prisma.cryptoAsset.findFirst({
      where: { id, userId }
    });

    if (!existingAsset) {
      return res.status(404).json({ message: 'Crypto asset not found' });
    }

    await prisma.cryptoAsset.update({
      where: { id },
      data: { isActive: false }
    });

    res.json({ message: 'Crypto asset deleted successfully' });
  } catch (error) {
    console.error('Error deleting crypto asset:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};