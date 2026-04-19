const express = require('express');
const mongoose = require('mongoose');
const logger = require('./utils/logger');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { swaggerUi, specs } = require('./utils/swagger');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

dotenv.config();

const authRoutes = require('./routes/auth');
const recordRoutes = require('./routes/records');
const notificationRoutes = require('./routes/notifications');
const reminderRoutes = require('./routes/reminders');
const doctorRoutes = require('./routes/doctor');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');
const appointmentRoutes = require('./routes/appointments');
const documentRoutes = require('./routes/documents');
const patientRoutes = require('./routes/patients');
const labRoutes = require('./routes/labs');
const prescriptionRoutes = require('./routes/prescriptions');

const compression = require('compression');

const app = express();

// Trust reverse proxy (e.g., Nginx, AWS ELB, Heroku)
// Essential for express-rate-limit to read the correct client IP via X-Forwarded-For
app.set('trust proxy', 1);

// Performance Middleware
// Compresses JSON responses to significantly reduce bandwidth usage and improve load times
app.use(compression());

// Security Middleware
app.use(helmet());
app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "blob:"],
        connectSrc: ["'self'", "http://localhost:5000", "http://localhost:5001", "https://*.onrender.com", "https://*.vercel.app"],
    },
}));
app.use(helmet.referrerPolicy({ policy: 'same-origin' }));
app.use(helmet.xssFilter());
app.use(helmet.noSniff());
app.use(helmet.frameguard({ action: 'deny' }));
app.use(helmet.hsts({
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
}));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'production' ? 100 : 10000, // Very high limit for local development
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: {
        message: 'Too many requests from this IP, please try again after 15 minutes'
    },
});

// Apply rate limiting to all requests
app.use('/api/', limiter);

// Standard Middleware
const corsOptions = {
    origin: [
        process.env.FRONTEND_URL || 'http://localhost:5176',
        'http://localhost:5173',
        'http://localhost:5176',
        /\.onrender\.com$/,
        /\.vercel\.app$/,
    ],
    credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Routes v1
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/records', recordRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/reminders', reminderRoutes);
app.use('/api/v1/doctor', doctorRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/appointments', appointmentRoutes);
app.use('/api/v1/documents', documentRoutes);
app.use('/api/v1/patients', patientRoutes);
app.use('/api/v1/labs', labRoutes);
app.use('/api/v1/prescriptions', prescriptionRoutes);

// Legacy support (to be deprecated)
app.use('/api/auth', authRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/labs', labRoutes);
app.use('/api/prescriptions', prescriptionRoutes);

app.get('/', (req, res) => {
    res.json({
        status: 'Backend API is Online',
        message: 'Please use the Frontend (usually port 5173) to interact with the application.',
        docs: 'http://localhost:5000/api-docs'
    });
});

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

// Database Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/health-analytics';
mongoose.connect(MONGODB_URI)
    .then(() => logger.info('Connected to MongoDB'))
    .catch(err => logger.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
const server = require('http').createServer(app);

// Initialize Socket.io
require('./utils/socket').init(server);

server.listen(PORT, () => {
    logger.info(`Backend server running on port ${PORT}`);
});
