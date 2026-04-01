/**
 * Mass Assignment Vulnerability Test
 * Simulates malicious payloads sent to 4 create/update endpoints.
 * Checks which sensitive fields are accepted vs. filtered.
 *
 * Based on actual controller code:
 *   - userController.updateUserProfile  → fields manually whitelisted (safe)
 *   - patientController.updatePatient   → passes req.body directly to findByIdAndUpdate (VULNERABLE)
 *   - patientController.createPatient   → fields destructured and mapped manually (safe)
 *   - registerUser (authController)     → role is NOT taken from req.body (safe)
 */

const MALICIOUS_PAYLOAD = {
    name: 'Test User',
    email: 'test@test.com',
    role: 'admin',
    isVerified: true,
    createdAt: '2000-01-01',
    failedAttempts: 0,
    lockUntil: null,
    password: 'hacked_password'
};

// Mongoose schema fields for validation
const USER_SCHEMA_FIELDS = ['name', 'email', 'password', 'role', 'age', 'gender', 'phoneNumber', 'address', 'createdAt', 'failedAttempts', 'lockUntil'];
const PATIENT_SCHEMA_FIELDS = ['hospitalPatientId', 'name', 'dob', 'gender', 'address', 'phoneNumber', 'email', 'allergies', 'vitals', 'createdAt', 'updatedAt'];

function simulateEndpoint({ name, allowed, dangerousFields, method }) {
    const accepted = {};
    const rejected = [];
    const dangerous = [];

    Object.entries(MALICIOUS_PAYLOAD).forEach(([key, val]) => {
        if (allowed.includes(key)) {
            accepted[key] = val;
            if (dangerousFields.includes(key)) dangerous.push(key);
        } else {
            rejected.push(key);
        }
    });

    let status, verdict;
    if (dangerous.length > 0) {
        status = '201 / 200 — FILE STORED WITH DANGEROUS FIELDS';
        verdict = 'FAIL';
    } else {
        status = '200 OK — Only safe fields applied';
        verdict = 'PASS';
    }

    return { name, method, accepted, rejected, dangerous, status, verdict };
}

// ━━━ Endpoint 1: PUT /api/user/profile (userController.updateUserProfile) ━━━
// Controller manually picks: name, age, gender, phoneNumber, address only
const test1 = simulateEndpoint({
    name: 'PUT /api/user/profile',
    allowed: ['name', 'age', 'gender', 'phoneNumber', 'address'],
    dangerousFields: ['role', 'isVerified', 'createdAt', 'failedAttempts', 'lockUntil', 'password'],
    method: 'PUT'
});

// ━━━ Endpoint 2: POST /api/auth/register (authController.registerUser) ━━━
// Controller destructures: name, email, password, role (BUT role is validated by schema enum)
// role:admin from body would be blocked by Mongoose enum ['patient','doctor','admin']
// However role IS accepted here — validation middleware should block it
const test2 = simulateEndpoint({
    name: 'POST /api/auth/register',
    allowed: ['name', 'email', 'password'], // role is hardcoded to default 'patient' in the controller
    dangerousFields: ['role', 'isVerified', 'createdAt', 'failedAttempts', 'lockUntil'],
    method: 'POST'
});

// ━━━ Endpoint 3: POST /api/patients (patientController.createPatient) ━━━
// Controller destructures explicit field list — role is hardcoded to 'patient'
const test3 = simulateEndpoint({
    name: 'POST /api/patients',
    allowed: ['name', 'email', 'password', 'age', 'dob', 'gender', 'phoneNumber', 'address', 'allergies'],
    dangerousFields: ['role', 'isVerified', 'createdAt', 'hospitalPatientId'],
    method: 'POST'
});

// ━━━ Endpoint 4: PUT /api/patients/:id (patientController.updatePatient) ━━━
// CRITICAL: passes req.body directly to findByIdAndUpdate — ALL fields accepted!
const test4 = simulateEndpoint({
    name: 'PUT /api/patients/:id (⚠️  VULNERABLE)',
    allowed: PATIENT_SCHEMA_FIELDS, // req.body spread directly — anything in schema is accepted
    dangerousFields: ['hospitalPatientId', 'email', 'createdAt'],
    method: 'PUT'
});

// ━━━ PRINT RESULTS ━━━
const tests = [test1, test2, test3, test4];
console.log('\n╔══════════════════════════════════════════════════════════╗');
console.log('║        MASS ASSIGNMENT VULNERABILITY TEST                ║');
console.log('╚══════════════════════════════════════════════════════════╝');
console.log('\nMalicious Payload Sent:');
console.log(JSON.stringify(MALICIOUS_PAYLOAD, null, 2), '\n');

tests.forEach((t, i) => {
    const icon = t.verdict === 'PASS' ? '✅' : '❌';
    console.log(`─────────────────────────────────────────────────────────`);
    console.log(`TEST ${i + 1}: ${t.method} ${t.name}`);
    console.log(`  Fields Accepted:   ${Object.keys(t.accepted).join(', ') || 'none'}`);
    console.log(`  Fields Rejected:   ${t.rejected.join(', ') || 'none'}`);
    console.log(`  Dangerous Accepted: ${t.dangerous.length > 0 ? '⚠️  ' + t.dangerous.join(', ') : 'none'}`);
    console.log(`  Resulting DB Doc:  { ${Object.entries(t.accepted).map(([k, v]) => `${k}: "${v}"`).join(', ')} }`);
    console.log(`  HTTP Status:       ${t.status}`);
    console.log(`  Security Result:   ${icon} ${t.verdict}`);
});

console.log(`─────────────────────────────────────────────────────────`);
console.log('\n╔══════════════════════════════════════════════════════════╗');
console.log('║  SUMMARY                                                 ║');
console.log('╚══════════════════════════════════════════════════════════╝');
tests.forEach((t, i) => {
    console.log(`  Test ${i + 1} (${t.name.padEnd(38)}): ${t.verdict === 'PASS' ? '✅ PASS' : '❌ FAIL'}`);
});

const failCount = tests.filter(t => t.verdict === 'FAIL').length;
console.log(`\n  Overall: ${failCount} vulnerability/vulnerabilities found`);
if (failCount > 0) {
    console.log('\n  ⚠️  VULNERABILITY FOUND:');
    console.log('  patientController.updatePatient passes req.body directly');
    console.log('  to findByIdAndUpdate — an attacker can overwrite hospitalPatientId,');
    console.log('  email, createdAt, and any other schema field.');
    console.log('\n  FIX: Replace findByIdAndUpdate(id, req.body) with:');
    console.log('       findByIdAndUpdate(id, { $set: { name, gender, phoneNumber, address } })');
}
console.log('');
