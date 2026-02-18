const express = require('express');
const authRoutes = require('./routes/authRoutes');
const logger = require('./logger/logger');

const app = express();

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Default route
app.get('/', (req, res) => res.send('Auth Service Running'));

// Error middleware
app.use((err, req, res, next) => {
  logger.error(err.message);
  res.status(500).json({ message: 'Server error' });
});

module.exports = app;
