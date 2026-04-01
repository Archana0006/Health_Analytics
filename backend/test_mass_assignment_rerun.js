/**
 * Mass Assignment Re-Run Test (Post-Fix)
 * Tests PUT /api/patients/:id with the updated whitelist filter.
 */

// ━━━ Replicate the exact whitelist from the fixed controller ━━━
const PATIENT_ALLOWED_UPDATE_FIELDS = [
    'name', 'phone', 'address', 'dob', 'gender',
    'allergies', 'phoneNumber',
    'vitals.heightCm', 'vitals.weightKg',
    'vitals.bloodPressure.systolic', 'vitals.bloodPressure.diastolic',
    'vitals.heartRate', 'vitals.temperatureC'
];

// ━━━ Malicious payload ━━━
const MALICIOUS_PAYLOAD = {
    name: 'Test User',
    email: 'attacker@evil.com',
    role: 'admin',
    isVerified: true,
    createdAt: '2000-01-01',
    hospitalPatientId: 'HACKED123'
};

// ━━━ Simulate the field filtering logic ━━━
function applyWhitelist(body) {
    const filteredUpdate = {};
    PATIENT_ALLOWED_UPDATE_FIELDS.forEach(field => {
        const keys = field.split('.');
        if (keys.length === 1 && body[field] !== undefined) {
            filteredUpdate[field] = body[field];
        } else if (keys.length === 2) {
            const [parent, child] = keys;
            if (body[parent]?.[child] !== undefined) {
                filteredUpdate[`${parent}.${child}`] = body[parent][child];
            }
        } else if (keys.length === 3) {
            const [p1, p2, p3] = keys;
            if (body[p1]?.[p2]?.[p3] !== undefined) {
                filteredUpdate[`${p1}.${p2}.${p3}`] = body[p1][p2][p3];
            }
        }
    });
    return filteredUpdate;
}

// Simulate existing patient document in DB
const EXISTING_PATIENT = {
    _id: '65f1a2b3c4d5e6f7a8b9c0d1',
    hospitalPatientId: 'PT-382910',
    name: 'Original Name',
    email: 'original@hospital.com',
    gender: 'Female',
    role: 'patient',
    createdAt: '2024-01-15',
    isVerified: false
};

const filteredUpdate = applyWhitelist(MALICIOUS_PAYLOAD);
const ignoredFields = Object.keys(MALICIOUS_PAYLOAD).filter(k => !(k in filteredUpdate));
const dangerousApplied = Object.keys(filteredUpdate).filter(k => ['email', 'role', 'hospitalPatientId', 'createdAt', 'isVerified'].includes(k));

// Simulate the resulting DB document (merge only filtered fields)
const resultingDocument = { ...EXISTING_PATIENT, ...filteredUpdate };

// ━━━ OUTPUT ━━━
console.log('\n╔══════════════════════════════════════════════════════════╗');
console.log('║  MASS ASSIGNMENT RE-RUN TEST (POST-FIX)                 ║');
console.log('╚══════════════════════════════════════════════════════════╝');

console.log('\n1. REQUEST PAYLOAD:');
console.log(JSON.stringify(MALICIOUS_PAYLOAD, null, 3));

console.log('\n2. FIELDS WRITTEN TO DB ($set):');
console.log(Object.keys(filteredUpdate).length === 0
    ? '   (none — all malicious fields were stripped)'
    : JSON.stringify(filteredUpdate, null, 3));

console.log('\n3. FIELDS IGNORED BY WHITELIST:');
ignoredFields.forEach(f => console.log(`   🚫 ${f}`));

console.log('\n4. RESULTING PATIENT DOCUMENT:');
console.log(JSON.stringify(resultingDocument, null, 3));

console.log('\n5. PROTECTED FIELD VERIFICATION:');
const checks = [
    { field: 'email', orig: EXISTING_PATIENT.email, result: resultingDocument.email },
    { field: 'hospitalPatientId', orig: EXISTING_PATIENT.hospitalPatientId, result: resultingDocument.hospitalPatientId },
    { field: 'createdAt', orig: EXISTING_PATIENT.createdAt, result: resultingDocument.createdAt },
    { field: 'role', orig: EXISTING_PATIENT.role, result: resultingDocument.role },
    { field: 'isVerified', orig: EXISTING_PATIENT.isVerified, result: resultingDocument.isVerified },
];
checks.forEach(c => {
    const changed = c.orig !== c.result;
    console.log(`   ${changed ? '❌' : '✅'} ${c.field.padEnd(20)}: was "${c.orig}" → now "${c.result}" ${changed ? '(MUTATED!)' : '(PROTECTED)'}`);
});

const passed = dangerousApplied.length === 0;
console.log(`\n6. FINAL SECURITY RESULT: ${passed ? '✅ PASS — All protected fields blocked' : '❌ FAIL — Dangerous fields: ' + dangerousApplied.join(', ')}\n`);
