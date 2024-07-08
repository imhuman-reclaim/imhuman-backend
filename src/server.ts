import express from 'express';
import dotenv from 'dotenv';
import router from './routes/index';
import cors from 'cors';
dotenv.config();

const app = express();
app.use(cors());



app.get('/health', (_, res) => {
  return res.json({ status: 'ok' });
});

app.use('/api', router);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
