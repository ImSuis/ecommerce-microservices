const Redis = require('ioredis');
const logger = require('../logger/logger');

const redis = new Redis(process.env.REDIS_URL);

redis.on('connect', () => logger.info('Connected to Redis'));
redis.on('error', (err) => logger.error(`Redis error: ${err.message}`));

module.exports = redis;