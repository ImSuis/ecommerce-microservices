const express = require('express');
const { register, login, getUserById } = require('../controllers/authController');
const { internalGuard } = require('../middleware/internalGuard');
const validate = require('../middleware/validate');
const { registerSchema, loginSchema } = require('../validators/authValidator');
const router = express.Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/users/:id', internalGuard, getUserById);

module.exports = router;
