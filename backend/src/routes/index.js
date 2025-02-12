import { Router } from 'express';
import { downloadRoutes } from './download.routes.js';

export const setupRoutes = (app) => {
  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // API routes
  app.use('/api/downloads', downloadRoutes);
};