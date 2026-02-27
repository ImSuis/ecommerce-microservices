const request = require('supertest');
const app = require('../app');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Clean up database before each test
beforeEach(async () => {
  await prisma.user.deleteMany();
});

// Disconnect after all tests
afterAll(async () => {
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

describe('POST /api/auth/register', () => {
  it('should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'password123' });

    expect(res.status).toBe(201);
    expect(res.body.email).toBe('test@example.com');
    expect(res.body.role).toBe('user');
  });

  it('should fail if email is missing', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ password: 'password123' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should fail if email is invalid', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'notanemail', password: 'password123' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation error');
  });

  it('should fail if password is less than 8 characters', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: '123' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation error');
  });

  it('should fail if user already exists', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'password123' });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'password123' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('User already exists');
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'password123' });
  });

  it('should login successfully and return a token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('should fail with wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'wrongpassword' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Invalid credentials');
  });

  it('should fail with non existent email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'password123' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Invalid credentials');
  });

  it('should fail if email is missing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ password: 'password123' });

    expect(res.status).toBe(400);
  });
});