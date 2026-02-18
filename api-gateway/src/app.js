const express = require('express');
const proxy = require('http-proxy-middleware').createProxyMiddleware;
const dotenv = require('dotenv');
const logger = require('./logger/logger');

dotenv.config();
const app = express();

// Middleware to log all requests
app.use((req, res, next) => {
  logger.info(`Incoming request: ${req.method} ${req.url}`);
  next();
});

// Parse JSON bodies
app.use(express.json());

// Proxy routes
app.use(
  '/api/auth',
  proxy({
    target: process.env.AUTH_SERVICE_URL || 'http://localhost:4001',
    changeOrigin: true,
    pathRewrite: { '^/api/auth': '' },
  })
);

// app.use(
//   '/api/users',
//   proxy({
//     target: process.env.USER_SERVICE_URL || 'http://localhost:4002',
//     changeOrigin: true,
//     pathRewrite: { '^/api/users': '' },
//   })
// );

// You can add more services here (products, cart, order, etc.)

// Default route
app.get('/', (req, res) => {
  res.send('API Gateway is running');
});

module.exports = app;
