import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/user.routes';
import areaRouter from './routes/area.routes';
import sensorRouter from './routes/sensor.routes';
import { errorMiddleware } from './middlewares/error.middleware';
  

dotenv.config();
const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json());

// Health‑check
app.get('/', (_req, res) => {
  res.json({ status: 'ok trouxinildo', timestamp: new Date() });
});

app.use('/users', userRoutes);
app.use('/areas', areaRouter);
app.use('/sensors', sensorRouter);

app.use(errorMiddleware);

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
