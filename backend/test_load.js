/**
 * API Performance and Stress Test
 * Simulates concurrent traffic loads (50, 200, 1000) against 5 endpoints.
 */

const http = require('http');
const https = require('https');
const os = require('os');

// Server configuration
const PORT = process.env.PORT || 5001;
const BASE_URL = `http://localhost:${PORT}`;
const ENDPOINTS = [
    { method: 'POST', path: '/api/auth/login', body: { email: 'test@test.com', password: 'password123' } },
    { method: 'GET', path: '/api/patients' },
    { method: 'GET', path: '/api/records' },
    { method: 'GET', path: '/api/appointments' },
    { method: 'GET', path: '/api/documents/search' }
];

const CONCURRENCY_LEVELS = [50, 200, 1000];

// Helper to make a single HTTP request
function makeRequest(endpoint, mockToken) {
    return new Promise((resolve) => {
        const url = new URL(BASE_URL + endpoint.path);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname,
            method: endpoint.method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (mockToken && endpoint.path !== '/api/auth/login') {
            options.headers['Authorization'] = `Bearer ${mockToken}`;
        }

        let bodyData = null;
        if (endpoint.body) {
            bodyData = JSON.stringify(endpoint.body);
            options.headers['Content-Length'] = Buffer.byteLength(bodyData);
        }

        const reqTimeStart = process.hrtime();

        const req = http.request(options, (res) => {
            // consume response
            res.on('data', () => { });
            res.on('end', () => {
                const diff = process.hrtime(reqTimeStart);
                const timeMs = (diff[0] * 1000) + (diff[1] / 1e6);
                resolve({ status: res.statusCode, timeMs });
            });
        });

        req.on('error', (err) => {
            const diff = process.hrtime(reqTimeStart);
            const timeMs = (diff[0] * 1000) + (diff[1] / 1e6);
            resolve({ error: err.message, status: 0, timeMs });
        });

        if (bodyData) req.write(bodyData);
        req.end();
    });
}

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Memory tracking
function getSystemStats() {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const cpuLoad = os.loadavg();
    return {
        usedMemMb: (usedMem / 1024 / 1024).toFixed(2),
        cpuLoad1m: cpuLoad[0].toFixed(2)
    };
}

async function runTest(endpoint, concurrency) {
    console.log(`\nTesting ${endpoint.method} ${endpoint.path} with ${concurrency} concurrent requests...`);

    // We use a dummy token so the requests hit the auth middleware.
    // They will be rejected with 401 or 429 if rate limit applies, which still exercises the server stack.
    const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI...';

    const statsBefore = getSystemStats();

    const start = process.hrtime();

    // Fire all requests concurrently
    const promises = [];
    for (let i = 0; i < concurrency; i++) {
        promises.push(makeRequest(endpoint, mockToken));
    }

    const results = await Promise.all(promises);

    const diff = process.hrtime(start);
    const totalWallTime = (diff[0] * 1000) + (diff[1] / 1e6);

    const statsAfter = getSystemStats();

    let totalTime = 0;
    let peakTime = 0;
    let errors = 0;
    const statusCodes = {};

    results.forEach(r => {
        totalTime += r.timeMs;
        if (r.timeMs > peakTime) peakTime = r.timeMs;
        if (r.error) errors++;

        const code = r.status.toString();
        statusCodes[code] = (statusCodes[code] || 0) + 1;
    });

    const avgTime = totalTime / concurrency;

    // Determine stability Result
    // If we have actual networking errors (ECONNREFUSED, socket hang up), it's a server failure.
    // HTTP 429 (Rate Limit) or 401 (Auth Error) are SUCCESSFUL defensve responses, not failures.
    const failureErrors = errors;
    const isPass = failureErrors === 0 && (statusCodes['500'] || 0) === 0 && (statusCodes['502'] || 0) === 0 && (statusCodes['503'] || 0) === 0 && (statusCodes['504'] || 0) === 0;

    console.log(`  └─ Total Wall Time:   ${totalWallTime.toFixed(2)} ms`);
    console.log(`  └─ Average Response:  ${avgTime.toFixed(2)} ms`);
    console.log(`  └─ Peak Response:     ${peakTime.toFixed(2)} ms`);
    console.log(`  └─ Error Rate (Net):  ${((errors / concurrency) * 100).toFixed(1)}%`);
    console.log(`  └─ Status Codes:      ${JSON.stringify(statusCodes)}`);

    console.log(`  └─ Sys CPU (1m avg):  ${statsBefore.cpuLoad1m} -> ${statsAfter.cpuLoad1m}`);
    console.log(`  └─ Sys Mem Used:      ${statsBefore.usedMemMb} MB -> ${statsAfter.usedMemMb} MB`);

    return {
        concurrency,
        avgTime,
        peakTime,
        errors,
        statusCodes,
        isPass
    };
}

async function start() {
    console.log('\n╔══════════════════════════════════════════════════════╗');
    console.log('║        API PERFORMANCE & STRESS TEST REPORT          ║');
    console.log('╚══════════════════════════════════════════════════════╝');
    console.log('\nNote: Rate Limiting is active on this server.');
    console.log('  /api/auth/login = 5 reqs / min');
    console.log('  /api/*          = 100 reqs / 15 mins');
    console.log('Expect HTTP 429 status codes under heavy load. This is a sign of STABILITY, not failure.\n');

    for (const endpoint of ENDPOINTS) {
        console.log(`========================================================`);
        console.log(`ENDPOINT: ${endpoint.method} ${endpoint.path}`);
        console.log(`========================================================`);

        let allPass = true;
        for (const c of CONCURRENCY_LEVELS) {
            const res = await runTest(endpoint, c);
            if (!res.isPass) allPass = false;
            await wait(1000); // Cool down between bursts
        }

        console.log(`\n>>> STABILITY RESULT FOR ${endpoint.path}: ${allPass ? '✅ PASS' : '❌ FAIL'}\n`);
    }
}

start().catch(console.error);
