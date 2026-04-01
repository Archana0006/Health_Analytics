const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('../routes/auth');
const { errorHandler, notFound } = require('../middleware/errorMiddleware');
const User = require('../models/User');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use(notFound);
app.use(errorHandler);

describe('Auth API', () => {
    beforeAll(async () => {
        const url = process.env.MONGODB_URI || 'mongodb://localhost:27017/health-analytics-test';
        await mongoose.connect(url);
    });

    afterAll(async () => {
        await User.deleteMany({ email: 'test@example.com' });
        await mongoose.connection.close();
    });

    it('should return 422 if registration data is invalid', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                email: 'invalid-email',
                password: '123'
            });
        expect(res.statusCode).toEqual(422);
        expect(res.body).toHaveProperty('errors');
    });

    it('should fail login with wrong credentials', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'nonexistent@example.com',
                password: 'wrongpassword'
            });
        expect(res.statusCode).toEqual(401);
        expect(res.body.message).toEqual('Invalid email or password');
    });
});
