import express, { Application, Request, Response } from 'express';
import productRoutes from './routes/product.routes';
import { errorHandler } from './middlewares/errorHandler';

const app: Application = express();

// Middleware
app.use(express.json());

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// Application routes
app.use('/api/products', productRoutes);

// 404 Catch-all handler for undefined routes
app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: 'fail',
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Centralized Error Handler
app.use(errorHandler);

export default app;
export { app };
