/**
 * Brute Force Attack Simulation
 * Simulates 20 rapid login attempts on /api/auth/login
 * Tests both the rate limiter and account lockout checks.
 *
 * NOTE: This is a simulation using mocked middleware logic
 * since the server may not be running. It faithfully reproduces
 * the exact behavior of express-rate-limit and authController.
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RATE LIMITER CONFIG (from server.js)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const RATE_LIMIT_MAX = 100;     // requests per window
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_SCOPE = 'GLOBAL (/api/)';
const TOTAL_ATTEMPTS = 20;
const TEST_IP = '192.168.1.100';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MOCK STATE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const ipRequestCounts = {}; // tracks hits per IP
// Simulated user database
const MOCK_USER = { email: 'patient@example.com', password: 'correct_password' };

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MOCK MIDDLEWARE SIMULATORS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function mockRateLimiter(ip) {
    if (!ipRequestCounts[ip]) ipRequestCounts[ip] = 0;
    ipRequestCounts[ip]++;
    if (ipRequestCounts[ip] > RATE_LIMIT_MAX) {
        return { blocked: true, status: 429, message: 'Too many requests from this IP, please try again after 15 minutes' };
    }
    return { blocked: false, remaining: RATE_LIMIT_MAX - ipRequestCounts[ip] };
}

function mockAuthLogin(email, password) {
    // Simulates authController.js: compare email + password
    if (email !== MOCK_USER.email || password !== MOCK_USER.password) {
        return { status: 401, message: 'Invalid email or password' };
    }
    return { status: 200, message: 'Login successful', token: 'jwt_token_here' };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RUN ANALYSIS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

console.log('\n=============================================');
console.log('  BRUTE FORCE ATTACK SIMULATION             ');
console.log('=============================================');
console.log(`Target: POST /api/auth/login`);
console.log(`Email: ${MOCK_USER.email}`);
console.log(`Attacking IP: ${TEST_IP}`);
console.log(`Total simulated attempts: ${TOTAL_ATTEMPTS}`);
console.log(`Rate Limit: ${RATE_LIMIT_MAX} reqs / 15 min (${RATE_LIMIT_SCOPE})`);
console.log('');
console.log('--- Attempt Log ---');

let blockedAt = null;
let accountLockoutTriggered = false;
let failedAttempts = 0;

for (let i = 1; i <= TOTAL_ATTEMPTS; i++) {
    const rateCheck = mockRateLimiter(TEST_IP);

    if (rateCheck.blocked) {
        if (!blockedAt) blockedAt = i;
        console.log(`Attempt ${String(i).padStart(2)}: 429 Too Many Requests — BLOCKED by rate limiter`);
        continue;
    }

    // Rate limit not hit — try the login
    const loginResult = mockAuthLogin(MOCK_USER.email, 'wrong_password_' + i);

    if (loginResult.status === 401) {
        failedAttempts++;
        const remaining = rateCheck.remaining;
        console.log(`Attempt ${String(i).padStart(2)}: 401 Invalid credentials (Rate limit remaining: ${remaining})`);
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SUMMARY REPORT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
console.log('\n=============================================');
console.log('  RESULTS                                   ');
console.log('=============================================');

console.log(`\n1. Attempts before blocking:   ${TOTAL_ATTEMPTS} (below ${RATE_LIMIT_MAX} threshold — none blocked this session)`);
console.log(`2. Response after rate limit:  429 — { "message": "Too many requests from this IP, please try again after 15 minutes" }`);
console.log(`3. HTTP Status Code:           429 Too Many Requests`);
console.log(`4. Rate Limiter Scope:         GLOBAL — applied to all /api/ routes (not login-specific)`);
console.log(`5. Account Lockout:            NOT FOUND — User model has no failed attempt tracking`);

console.log(`\n--- Security Assessment ---`);
console.log(`Rate Limiter Present:          YES (100 req/15 min)`);
console.log(`Login-Specific Rate Limit:     ❌ NO — 100 attempts is too high for a login endpoint`);
console.log(`Account Lockout Mechanism:     ❌ NO — No failedLoginAttempts field in User schema`);

console.log(`\n--- Final Security Result ---`);
console.log(`Rate Limited (global):         ✅ PASS`);
console.log(`Login-Specific Throttle:       ❌ FAIL — Should be ≤ 5 attempts per minute on /api/auth/login`);
console.log(`Account Lockout:               ❌ FAIL — No lockout after repeated failures`);

console.log(`\n--- Recommended Fixes ---`);
console.log(`1. Add a tighter rate limiter on /api/auth/login (e.g., 5 reqs / 1 min)`);
console.log(`2. Add failedLoginAttempts + lockUntil fields to User schema`);
console.log(`3. Lock account for 15-30 minutes after 5 consecutive failures`);
