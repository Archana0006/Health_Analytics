/**
 * Sensitive Data Exposure Audit
 * Simulates API responses from 4 endpoints and checks for sensitive field leakage.
 *
 * Based on actual controller code:
 *   GET /api/users/profile    → User.findById(id).select('-password')
 *   GET /api/patients/:id     → Patient.findById(id) — full document returned
 *   GET /api/records          → MedicalRecord returned as-is
 *   GET /api/appointments     → Appointment.find().populate('doctorId', 'name email address')
 */

const SENSITIVE_FIELDS = [
    'password', 'passwordHash', 'failedAttempts', 'lockUntil',
    'resetToken', '__v', 'salt', 'token'
];

// ━━━ Simulated DB documents (what Mongoose would return) ━━━

// 1. User.findById(id).select('-password') — password is excluded via .select()
const userAPIResponse = {
    _id: '65f1aaa1',
    name: 'John Patient',
    email: 'john@example.com',
    role: 'patient',
    age: 32,
    gender: 'Male',
    phoneNumber: '+91-9876543210',
    address: '12 Main Street',
    createdAt: '2024-01-15T10:00:00Z',
    failedAttempts: 3,      // ⚠️ NOT excluded by .select('-password')
    lockUntil: null,        // ⚠️ NOT excluded by .select('-password')
    __v: 0
};

// 2. Patient.findById(id) — full Patient document, no field exclusion
const patientAPIResponse = {
    _id: '65f2bbb2',
    hospitalPatientId: 'PT-382910',
    name: 'John Patient',
    email: 'john@example.com',
    gender: 'Male',
    dob: '1992-03-15',
    address: '12 Main Street',
    allergies: ['Penicillin'],
    vitals: { heightCm: 175, weightKg: 70, heartRate: 72 },
    createdAt: '2024-01-15T10:00:00Z',
    __v: 0
    // No password fields — Patient model has no password field
};

// 3. MedicalRecord returned as-is
const recordAPIResponse = {
    _id: '65f3ccc3',
    patientId: '65f2bbb2',
    doctorId: '65f4ddd4',
    diagnosis: 'Hypertension',
    bloodPressure: '145/90',
    sugarLevel: 110,
    heartRate: 85,
    date: '2024-03-01T09:00:00Z',
    attachments: [],
    __v: 0
};

// 4. Appointment.find().populate('doctorId', 'name email address')
//    populate limits doctor fields to name, email, address only
const appointmentAPIResponse = {
    _id: '65f5eee5',
    patientId: '65f2bbb2',
    doctorId: {
        _id: '65f4ddd4',
        name: 'Dr. Smith',
        email: 'drsmith@hospital.com',
        address: 'Cardiology Dept, 3rd Floor'
        // password, role, failedAttempts etc. are NOT populated — only name/email/address
    },
    date: '2024-03-10',
    time: '10:30',
    reason: 'Follow-up',
    status: 'confirmed',
    __v: 0
};

function auditResponse(endpointName, response, note) {
    const found = [];
    const flatten = (obj, prefix = '') => {
        Object.entries(obj).forEach(([k, v]) => {
            const key = prefix ? `${prefix}.${k}` : k;
            if (SENSITIVE_FIELDS.includes(k)) found.push(key);
            if (v && typeof v === 'object' && !Array.isArray(v)) flatten(v, key);
        });
    };
    flatten(response);

    const pass = found.length === 0;
    return { endpointName, fields: Object.keys(response), sensitive: found, pass, note };
}

const results = [
    auditResponse(
        'GET /api/users/profile',
        userAPIResponse,
        'Uses .select("-password") — but failedAttempts & lockUntil added in this session are NOT excluded'
    ),
    auditResponse(
        'GET /api/patients/:id',
        patientAPIResponse,
        'Patient model has no password field — clinical fields only'
    ),
    auditResponse(
        'GET /api/records',
        recordAPIResponse,
        'MedicalRecord model contains no auth or security fields'
    ),
    auditResponse(
        'GET /api/appointments',
        appointmentAPIResponse,
        '.populate("doctorId", "name email address") limits doctor fields to 3 safe fields'
    ),
];

console.log('\n╔══════════════════════════════════════════════════════════╗');
console.log('║         SENSITIVE DATA EXPOSURE AUDIT                   ║');
console.log('╚══════════════════════════════════════════════════════════╝');
console.log(`Sensitive fields being checked: ${SENSITIVE_FIELDS.join(', ')}\n`);

results.forEach((r, i) => {
    const icon = r.pass ? '✅' : '❌';
    console.log(`─────────────────────────────────────────────────────────`);
    console.log(`TEST ${i + 1}: ${r.endpointName}`);
    console.log(`  Note:              ${r.note}`);
    console.log(`  Fields Returned:   ${r.fields.join(', ')}`);
    console.log(`  Sensitive Detected: ${r.sensitive.length > 0 ? '⚠️  ' + r.sensitive.join(', ') : 'none'}`);
    console.log(`  Security Result:   ${icon} ${r.pass ? 'PASS' : 'FAIL — sensitive fields exposed'}`);
});

console.log(`─────────────────────────────────────────────────────────`);
console.log('\n╔══════════════════════════════════════════════════════════╗');
console.log('║  SUMMARY                                                 ║');
console.log('╚══════════════════════════════════════════════════════════╝');
results.forEach((r, i) => {
    console.log(`  Test ${i + 1} (${r.endpointName.padEnd(30)}): ${r.pass ? '✅ PASS' : '❌ FAIL — ' + r.sensitive.join(', ')}`);
});

const failedTests = results.filter(r => !r.pass);
if (failedTests.length > 0) {
    console.log('\n  ⚠️  FIX REQUIRED:');
    console.log('  GET /api/users/profile returns failedAttempts and lockUntil');
    console.log('  because .select("-password") only excludes "password".');
    console.log('  Fix: change to .select("-password -failedAttempts -lockUntil -__v")');
}
console.log('');
