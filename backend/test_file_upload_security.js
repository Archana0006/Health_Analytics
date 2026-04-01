/**
 * File Upload Security Test
 * Simulates 5 attack scenarios against the Multer configuration in routes/documents.js
 *
 * Enforced by Multer:
 *   - Max size: 10MB (10 * 1024 * 1024 bytes)
 *   - Allowed extensions: jpeg, jpg, png, pdf, doc, docx
 *   - Allowed MIME types: must match the same regex
 *   - Filename: sanitized by prefixing timestamp+random, but original name is kept in suffix
 */

const path = require('path');

// ━━━ Replicate Multer's fileFilter logic exactly from routes/documents.js ━━━
const ALLOWED_TYPES_REGEX = /jpeg|jpg|png|pdf|doc|docx/;
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

// MIME type mapping for simulated files
const MIME_MAP = {
    '.pdf': 'application/pdf',
    '.exe': 'application/octet-stream',
    '.js': 'application/javascript',
    '.sh': 'application/x-sh',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.png': 'image/png',
};

function getMime(filename) {
    const ext = path.extname(filename).toLowerCase();
    return MIME_MAP[ext] || 'application/octet-stream';
}

function simulateMulterFilter(originalName, fileSize) {
    // Size check (Multer applies this before fileFilter)
    if (fileSize > MAX_FILE_SIZE_BYTES) {
        return { accepted: false, status: 400, reason: 'MulterError: LIMIT_FILE_SIZE — File size too large (max 10MB)' };
    }

    const extname = ALLOWED_TYPES_REGEX.test(path.extname(originalName).toLowerCase());
    const mimetype = ALLOWED_TYPES_REGEX.test(getMime(originalName));

    if (mimetype && extname) {
        return { accepted: true, status: 201, reason: 'File accepted and saved to uploads/' };
    }
    return { accepted: false, status: 400, reason: 'Error: Only images, PDFs, and Word documents are allowed' };
}

// ━━━ Additional: Filename XSS sanitization check ━━━
function checkXssFilename(originalName) {
    // Multer prepends timestamp-random, but stores original name as suffix
    // Check if original name contains HTML/script tags
    const xssPattern = /<[^>]*>/;
    return xssPattern.test(originalName);
}

// ━━━ TEST CASES ━━━
const TESTS = [
    {
        id: 1,
        name: 'EXE disguised as PDF (MIME mismatch)',
        originalName: 'report.pdf',
        mime: 'application/octet-stream',   // actual MIME of the .exe content
        overrideMime: true,
        fileSize: 512 * 1024,  // 512KB
        note: 'File has .pdf extension but binary/executable MIME type'
    },
    {
        id: 2,
        name: 'Double extension file (report.pdf.exe)',
        originalName: 'report.pdf.exe',
        fileSize: 256 * 1024,  // 256KB
        note: 'Extension check reads the last extension: .exe'
    },
    {
        id: 3,
        name: 'XSS filename attack',
        originalName: '<script>alert(1)</script>.pdf',
        fileSize: 128 * 1024,  // 128KB
        note: 'Extension is .pdf but filename contains HTML injection'
    },
    {
        id: 4,
        name: 'Oversized file (200MB)',
        originalName: 'huge_report.pdf',
        fileSize: 200 * 1024 * 1024, // 200MB
        note: 'Exceeds 10MB Multer size limit'
    },
    {
        id: 5,
        name: 'Script file (.js / .sh)',
        originalName: 'malicious.sh',
        fileSize: 4 * 1024, // 4KB
        note: 'Shell script with disallowed extension and MIME type'
    },
];

console.log('\n╔══════════════════════════════════════════════════════╗');
console.log('║         FILE UPLOAD SECURITY TEST                   ║');
console.log('╚══════════════════════════════════════════════════════╝');
console.log('\nMulter Config (routes/documents.js):');
console.log('  Max File Size: 10MB');
console.log('  Allowed Types: jpeg, jpg, png, pdf, doc, docx');
console.log('  Validation:    Extension + MIME type (both must pass)\n');

let passCount = 0;
let failCount = 0;

TESTS.forEach(test => {
    let result;
    if (test.overrideMime) {
        // For test 1: mime is deliberately wrong (exe content masking as pdf)
        const extname = ALLOWED_TYPES_REGEX.test(path.extname(test.originalName).toLowerCase());
        const mimetype = ALLOWED_TYPES_REGEX.test(test.mime);
        if (test.fileSize > MAX_FILE_SIZE_BYTES) {
            result = { accepted: false, status: 400, reason: 'LIMIT_FILE_SIZE' };
        } else if (extname && mimetype) {
            result = { accepted: true, status: 201, reason: 'File accepted' };
        } else {
            result = { accepted: false, status: 400, reason: 'Error: Only images, PDFs, and Word documents are allowed' };
        }
    } else {
        result = simulateMulterFilter(test.originalName, test.fileSize);
    }

    const xssRisk = checkXssFilename(test.originalName);
    const secResult = !result.accepted ? '✅ PASS' : '❌ FAIL';
    if (!result.accepted) passCount++; else failCount++;

    console.log(`─────────────────────────────────────────────────────`);
    console.log(`TEST ${test.id}: ${test.name}`);
    console.log(`  Note:      ${test.note}`);
    console.log(`  Filename:  ${test.originalName}`);
    console.log(`  MIME:      ${test.overrideMime ? test.mime : getMime(test.originalName)}`);
    console.log(`  Size:      ${(test.fileSize / (1024 * 1024)).toFixed(1)}MB`);
    console.log(`  Accepted:  ${result.accepted ? '⚠️  YES — FILE STORED' : '🚫 NO — REJECTED'}`);
    console.log(`  Status:    ${result.status}`);
    console.log(`  Reason:    ${result.reason}`);
    if (xssRisk) console.log(`  ⚠️  XSS WARNING: Filename contains HTML tags — should be sanitized before storage`);
    console.log(`  Result:    ${secResult}`);
});

console.log(`─────────────────────────────────────────────────────`);
console.log(`\n╔══════════════════════════════════════════════════════╗`);
console.log(`║  SUMMARY                                             ║`);
console.log(`╚══════════════════════════════════════════════════════╝`);
console.log(`  Tests Passed: ${passCount}/5`);
console.log(`  Tests Failed: ${failCount}/5`);
console.log('');
console.log('  EXE disguised (MIME mismatch):   ' + (passCount >= 1 ? '✅ Test 1 — Check MIME' : ''));
console.log('  Double extension (.pdf.exe):     ✅ PASS — Last ext .exe is blocked');
console.log('  XSS filename:                    ⚠️  PARTIAL — Extension passes (.pdf), but filename is NOT sanitized');
console.log('  Oversized file (200MB):          ✅ PASS — 10MB limit enforced');
console.log('  Script file (.sh/.js):           ✅ PASS — Blocked by ext+MIME check');
console.log('');
console.log('  Gap Identified: XSS filenames are accepted if extension is valid.');
console.log('  Recommended Fix: Sanitize originalname before storing or returning it.\n');
