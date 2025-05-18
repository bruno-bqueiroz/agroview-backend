import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();
const app = express();
const prisma = new PrismaClient();
const PORT = +process.env.PORT!;

app.use(cors());
app.use(express.json());

// Health‑check
app.get('/', (_req, res) => {
  res.json({ status: 'ok trouxinildo', timestamp: new Date() });
});

// Rota sem genéricos explícitos


app.listen(PORT, () => {
  console.log(`🚀 Backend listening on http://localhost:${PORT}`);
});
