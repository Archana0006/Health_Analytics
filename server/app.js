const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Routes Placeholder
app.get('/', (req, res) => {
    res.send('Digital Health API is running...');
});

module.exports = app;
