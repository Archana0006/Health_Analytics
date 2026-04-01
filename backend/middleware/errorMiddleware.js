const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message;

    // Handle Mongoose Validation Errors
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = Object.values(err.errors).map(val => val.message).join(', ');
    }

    // Handle Mongoose Cast Errors (Invalid IDs)
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        statusCode = 400;
        message = 'Invalid ID format';
    }

    // Handle JWT Errors
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Not authorized, token failed';
    }

    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Not authorized, token expired';
    }

    // Handle Multer Errors
    if (err.name === 'MulterError') {
        statusCode = 400;
        if (err.code === 'LIMIT_FILE_SIZE') {
            message = 'File size too large';
        }
    }

    // Log the error with more context
    logger.error(`${message} - ${req.method} ${req.originalUrl} - ${req.ip}${process.env.NODE_ENV !== 'production' ? ` - Stack: ${err.stack}` : ''}`);

    res.status(statusCode).json({
        message,
        error: message, // Add this for consistency with frontend
        errors: err.errors || null,
        stack: process.env.NODE_ENV === 'development' ? (err.stack || null) : null,
    });
};

const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

module.exports = { errorHandler, notFound };
