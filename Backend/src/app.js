const express = require('express');
const aiRoutes = require('./routes/ai.routes')
const cors = require('cors')
require('dotenv').config();
const app = express()

const allowedOrigins = [
  process.env.FRONTEND_URL
];
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json())

app.get('/', (req, res) => {
    res.send('Hello World')
})

app.use('/ai', aiRoutes)

module.exports = app
