const express = require('express');
const proxy = require('http-proxy-middleware').createProxyMiddleware;
const dotenv = require('dotenv');
const logger = require('./logger/logger');

dotenv.config();
const app = express();

// Log every incoming request before it gets proxied
app.use((req, res, next) => {
  logger.info(`Incoming request: ${req.method} ${req.url}`);
  next();
});

// NOTE: express.json() is intentionally omitted here.
// Parsing the body in the gateway would consume the request stream,
// leaving nothing for the proxy to forward to the microservice.

app.use(
  '/api/auth',
  proxy({
    target: process.env.AUTH_SERVICE_URL || 'http://localhost:4001',
    changeOrigin: true,
    // When Express matches '/api/auth', it strips that prefix before passing
    // the path to the proxy. So '/api/auth/login' becomes just '/login'.
    // pathRewrite adds the prefix back so the auth service receives the full
    // path it expects: '/api/auth/login'.
    pathRewrite: (path) => `/api/auth${path}`,
  })
);

app.use(
  '/api/users',
  proxy({
    target: process.env.USER_SERVICE_URL || 'http://localhost:4002',
    changeOrigin: true,
    // Same prefix-restoration as above for the user service.
    pathRewrite: (path) => `/api/users${path}`,
    on: {
      // Explicitly forward the Authorization header so the user service
      // can authenticate the request via authGuard.
      // http-proxy-middleware forwards most headers automatically, but
      // being explicit here ensures it survives any edge cases.
      proxyReq: (proxyReq, req) => {
        if (req.headers.authorization) {
          proxyReq.setHeader('Authorization', req.headers.authorization);
        }
      },
      // Catch network-level proxy errors (e.g. service is down, connection refused)
      // and return a meaningful 502 instead of hanging or crashing.
      error: (err, req, res) => {
        console.error('Proxy error:', err);
        res.status(502).json({ message: 'Proxy error', error: err.message });
      },
    },
  })
);

app.get('/', (req, res) => res.send('API Gateway is running'));

module.exports = app;