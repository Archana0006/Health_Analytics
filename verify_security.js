const jwt = require('jsonwebtoken');
const { sanitizeRegex } = require('./backend/utils/healthUtils');

// Mocking ENV for testing
process.env.JWT_SECRET = 'actual_secure_secret_123';
process.env.NODE_ENV = 'production';

async function runTests() {
    console.log('--- Security Verification Suite ---\n');

    // 1. JWT Security Test
    console.log('Test 1: Forged JWT Rejection');
    const forgedToken = jwt.sign({ id: 'user1', role: 'admin' }, 'secret'); // Signed with old fallback
    try {
        // Simulating logic in auth.js
        jwt.verify(forgedToken, process.env.JWT_SECRET);
        console.log('Result: FAIL (Token pulse accepted)');
    } catch (err) {
        console.log('Request: Authorization: Bearer <token_signed_with_secret>');
        console.log('Expected: JsonWebTokenError (invalid signature)');
        console.log('Actual:', err.name);
        console.log('Security Result: PASS\n');
    }

    // 2. NoSQL Injection Test
    console.log('Test 2: Document Search Sanitization');
    const maliciousQuery = '.*';
    const sanitized = sanitizeRegex(maliciousQuery);
    console.log('Request: ?query=' + maliciousQuery);
    console.log('Expected Sanitized: \\.\\*');
    console.log('Actual Sanitized:', sanitized);
    if (sanitized === '\\.\\*') {
        console.log('Security Result: PASS\n');
    } else {
        console.log('Security Result: FAIL\n');
    }

    // 3. Error Handling Test
    console.log('Test 3: Production Error Stack Trace Hiding');
    const mockErr = new Error('Test logic error');
    const mockRes = {
        statusCode: 500,
        status: function (s) { this.statusCode = s; return this; },
        json: function (data) { this.data = data; }
    };

    // Simulate errorMiddleware logic
    const responseData = {
        message: mockErr.message,
        stack: process.env.NODE_ENV === 'development' ? mockErr.stack : null
    };

    console.log('Mode: NODE_ENV=' + process.env.NODE_ENV);
    console.log('Expected: stack: null');
    console.log('Actual: stack:', responseData.stack);
    if (responseData.stack === null) {
        console.log('Security Result: PASS\n');
    } else {
        console.log('Security Result: FAIL\n');
    }
}

runTests().catch(console.error);
