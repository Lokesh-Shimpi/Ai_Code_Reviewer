require('dotenv').config();
const express = require('express');
const aiRoutes = require('./routes/ai.routes');
const cors = require('cors');

const app = express();

// Use environment variable for frontend URL, fallback to localhost for local dev
const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL // Set this in your .env and Vercel dashboard
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.use('/ai', aiRoutes);

module.exports = app;
