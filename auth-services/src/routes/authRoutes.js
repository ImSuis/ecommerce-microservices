const express = require('express');
const { register, login, getUserById } = require('../controllers/authController');
const { internalGuard } = require('../middleware/internalGuard');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/users/:id', internalGuard, getUserById);

module.exports = router;
