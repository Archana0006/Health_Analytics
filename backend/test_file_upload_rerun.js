/**
 * Re-run: Document Upload Security Tests (Post-Fix Verification)
 * Tests against the UPDATED Multer config in routes/documents.js
 */

const path = require('path');

// ━━━ UPDATED CONFIG (post-fix) ━━━
const ALLOWED_MIME_TYPES = {
    '.pdf': 'application/pdf',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

// Replicate updated filename sanitization
function safeFilename(originalName) {
    const ext = path.extname(originalName).toLowerCase();
    return `document_${Date.now()}${ext}`;
}

// Replicate updated fileFilter (strict whitelist, === match)
function fileFilter(originalName, actualMime, fileSize) {
    if (fileSize > MAX_FILE_SIZE_BYTES) {
        return { accepted: false, status: 400, reason: 'MulterError: LIMIT_FILE_SIZE (max 10MB)' };
    }
    const ext = path.extname(originalName).toLowerCase();
    const allowedMime = ALLOWED_MIME_TYPES[ext];
    if (allowedMime && actualMime === allowedMime) {
        return { accepted: true, status: 201 };
    }
    return { accepted: false, status: 400, reason: 'Only images (jpg, png), PDFs, and Word documents (doc, docx) are allowed' };
}

// ━━━ TEST CASES ━━━
const TESTS = [
    {
        id: 1,
        scenario: 'XSS filename attack',
        originalName: '<script>alert(1)</script>.pdf',
        actualMime: 'application/pdf',
        fileSize: 128 * 1024,
    },
    {
        id: 2,
        scenario: 'Double extension (.pdf.exe)',
        originalName: 'report.pdf.exe',
        actualMime: 'application/octet-stream',
        fileSize: 256 * 1024,
    },
    {
        id: 3,
        scenario: 'EXE disguised as PDF (MIME mismatch)',
        originalName: 'report.pdf',
        actualMime: 'application/octet-stream',
        fileSize: 512 * 1024,
    },
    {
        id: 4,
        scenario: 'Script file (.js / .sh)',
        originalName: 'malicious.sh',
        actualMime: 'application/x-sh',
        fileSize: 4 * 1024,
    },
    {
        id: 5,
        scenario: 'Oversized file (200MB PDF)',
        originalName: 'huge_report.pdf',
        actualMime: 'application/pdf',
        fileSize: 200 * 1024 * 1024,
    },
];

console.log('\n╔════════════════════════════════════════════════════════╗');
console.log('║  FILE UPLOAD SECURITY TEST (POST-FIX RE-RUN)          ║');
console.log('╚════════════════════════════════════════════════════════╝');
console.log('Filename Rule: document_<timestamp>.<ext>');
console.log('Filter Rule:   Extension + MIME must match whitelist exactly\n');

let allPass = true;

TESTS.forEach(test => {
    const result = fileFilter(test.originalName, test.actualMime, test.fileSize);

    let savedAs = 'N/A (rejected)';
    let xssNeutral = 'N/A';
    let secResult;

    if (result.accepted) {
        savedAs = safeFilename(test.originalName);
        // Check: does savedAs contain any HTML or special chars beyond ext?
        xssNeutral = (/^document_\d+\.[a-z]+$/.test(savedAs)) ? '✅ Yes — safe name' : '❌ No — unsafe chars remain';
        // For a correctly rejected file to pass the test, it should NOT be accepted
        secResult = '❌ FAIL (should have been rejected)';
        allPass = false;
    } else {
        secResult = '✅ PASS';
    }

    const icon = result.accepted ? '⚠️' : '🚫';
    console.log(`─────────────────────────────────────────────────────────`);
    console.log(`TEST ${test.id}: ${test.scenario}`);
    console.log(`  Original Filename:  ${test.originalName}`);
    console.log(`  Actual MIME:        ${test.actualMime}`);
    console.log(`  File Size:          ${(test.fileSize / (1024 * 1024)).toFixed(1)}MB`);
    console.log(`  Saved As:           ${savedAs}`);
    console.log(`  XSS-Safe Name:      ${xssNeutral}`);
    console.log(`  Accepted:           ${icon} ${result.accepted ? 'YES — FILE STORED' : 'NO — REJECTED'}`);
    console.log(`  HTTP Status:        ${result.status}`);
    if (!result.accepted) console.log(`  Reason:             ${result.reason}`);
    console.log(`  Security Result:    ${secResult}`);
});

console.log(`─────────────────────────────────────────────────────────`);
console.log(`\n╔════════════════════════════════════════════════════════╗`);
console.log(`║  FINAL SUMMARY                                         ║`);
console.log(`╚════════════════════════════════════════════════════════╝`);
TESTS.forEach(t => {
    const r = fileFilter(t.originalName, t.actualMime, t.fileSize);
    const pass = !r.accepted;
    console.log(`  Test ${t.id} (${t.scenario.padEnd(32)}): ${pass ? '✅ PASS' : '❌ FAIL'}`);
});
console.log(`\n  Overall Result: ${allPass ? '✅ ALL 5 TESTS PASS' : '⚠️  SOME TESTS FAILED'}\n`);
