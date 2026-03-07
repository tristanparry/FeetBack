import cors from 'cors';
import express, { Response, json } from 'express';
import healthInsightRouter from './routes/healthInsightRouter.ts';
import insoleRouter from './routes/insoleRouter.ts';
import sensorReadingRouter from './routes/sensorReadingRouter.ts';
import userRouter from './routes/userRouter.ts';

const app = express();

// Middleware
app.use(cors());
app.use(json());
app.use((req, res, next) => {
  const startedAt = Date.now();

  res.on('finish', () => {
    const durationMs = Date.now() - startedAt;
    console.info(
      `${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs}ms`,
    );
  });

  next();
});

// Routes
app.use('/users', userRouter);
app.use('/insoles', insoleRouter);
app.use('/sensorReadings', sensorReadingRouter);
app.use('/healthInsights', healthInsightRouter);

app.get('/healthz', (_, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/', (_, res: Response) => {
  res.status(200).json({ message: 'FeetBack API' });
});

export default app;
