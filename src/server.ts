import express from 'express';
import dotenv from 'dotenv';
import router from './routes/index';

dotenv.config();

const app = express();
app.use(express.json());


app.get('/', (req, res) => {
  res.send('Welcome to reclaim rewards');
});

app.use('/api', router);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
