import { Request, Response } from 'express';
import { FinancialProfileService } from '../services/financialProfileService.js';

const financialProfileService = new FinancialProfileService();

export const getFinancialProfile = async (req: Request, res: Response) => {
  try {
    const profile = await financialProfileService.generateLLMReadableProfile();
    res.json(profile);
  } catch (error) {
    console.error('Error generating financial profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getFinancialProfileForLLM = async (req: Request, res: Response) => {
  try {
    let narrative: string;
    
    // Check if client data is provided in request body for comprehensive profile
    if (req.method === 'POST' && req.body && req.body.clientData) {
      narrative = await financialProfileService.generateNaturalLanguageProfileWithClientData(req.body.clientData);
    } else {
      narrative = await financialProfileService.generateNaturalLanguageProfile();
    }
    
    // Return as both JSON and plain text based on Accept header
    if (req.headers.accept?.includes('text/plain')) {
      res.setHeader('Content-Type', 'text/plain');
      res.send(narrative);
    } else {
      res.json({
        profile: narrative,
        generatedAt: new Date().toISOString(),
        disclaimer: 'This profile is generated for financial advisory purposes. Verify all data before making financial decisions.'
      });
    }
  } catch (error) {
    console.error('Error generating LLM profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const downloadFinancialProfile = async (req: Request, res: Response) => {
  try {
    const narrative = await financialProfileService.generateNaturalLanguageProfile();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="financial-profile-${timestamp}.txt"`);
    res.send(narrative);
  } catch (error) {
    console.error('Error downloading financial profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};