const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const logger = require('../logger/logger');

const prisma = require('../prismaClient');

const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      logger.warn(`Registration failed: User already exists (${email})`);
      return res.status(400).json({ message: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({ data: { email, passwordHash } });

    logger.info(`User registered: ${user.id} (${user.email})`);
    res.status(201).json({ id: user.id, email: user.email, role: user.role });
  } catch (err) {
    logger.error(`Register error: ${err.message}`);
    res.status(500).json({ message: 'Server error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      logger.warn(`Login failed: User not found (${email})`);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      logger.warn(`Login failed: Invalid password (${email})`);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    logger.info(`User logged in: ${user.id} (${user.email})`);
    res.json({ token });
  } catch (err) {
    logger.error(`Login error: ${err.message}`);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { register, login };
