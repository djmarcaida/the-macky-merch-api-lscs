import express, { Application, Request, Response } from 'express';

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

export default app;
export { app };
