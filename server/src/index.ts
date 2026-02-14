import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

import express from 'express';
import cors from 'cors';
import interviewRouter from './routes/interview';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use('/api/interview', interviewRouter);

app.get('/', (_req, res) => {
  res.json({ message: 'Voice Investment Questionnaire API', version: '1.0.0' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Interview API: POST http://localhost:${PORT}/api/interview/next`);
  console.log(`Health check:  GET  http://localhost:${PORT}/api/interview/health`);
});
