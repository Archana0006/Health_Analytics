const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

exports.generateHealthReport = (patient, records, outputPath, extraData) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const writeStream = fs.createWriteStream(outputPath);

        doc.pipe(writeStream);

        // ── Header: Hospital Info ──
        doc.rect(0, 0, doc.page.width, 100).fill('#f8faff');
        
        doc.fillColor('#4338ca').fontSize(22).text("ST. MARY'S DIGITAL HOSPITAL", 50, 40);
        doc.fillColor('#64748b').fontSize(10).text('123 Health Innovation Way, Digital City', 50, 70);
        doc.text('Phone: (555) 012-3456 | Email: clinical@healthanalytics.com', 50, 82);
        
        doc.moveTo(0, 100).lineTo(doc.page.width, 100).strokeColor('#4338ca').lineWidth(2).stroke();
        doc.moveDown(3);

        // ── Report Title ──
        doc.fillColor('#1e293b').fontSize(20).text('Official Health Summary Report', { align: 'left' });
        doc.moveDown(1);

        // ── Patient Info Section ──
        doc.fontSize(12).fillColor('#475569');
        doc.text(`Patient: `, { continued: true }).fillColor('#1e293b').text((patient.name || 'Unknown Patient').toUpperCase());
        doc.fillColor('#475569').text(`ID: `, { continued: true }).fillColor('#1e293b').text(patient.hospitalPatientId || 'N/A');
        doc.fillColor('#475569').text(`Date of Birth: `, { continued: true }).fillColor('#1e293b').text(patient.dob ? new Date(patient.dob).toLocaleDateString() : 'N/A');
        doc.fillColor('#475569').text(`Gender: `, { continued: true }).fillColor('#1e293b').text(patient.gender || 'N/A');
        doc.fillColor('#475569').text(`Generated On: `, { continued: true }).fillColor('#1e293b').text(new Date().toLocaleString());
        doc.moveDown(2);

        // ── Vitals Section ──
        doc.fontSize(16).fillColor('#4338ca').text('Vitals & Observations', { underline: true });
        doc.moveDown(1);

        if (records.length === 0) {
            doc.fontSize(11).fillColor('#94a3b8').text('No clinical records have been recorded yet. Please consult your physician to begin tracking your health vitals.');
        } else {
            records.forEach((record, index) => {
                doc.fontSize(11).fillColor('#1e293b').text(`Date: ${new Date(record.date).toLocaleDateString()}`, { oblique: true });
                doc.fontSize(10).fillColor('#475569');
                doc.text(`Blood Pressure: `, { continued: true }).fillColor('#1e293b').text(`${record.bloodPressure?.systolic || '--'}/${record.bloodPressure?.diastolic || '--'} mmHg`);
                doc.fillColor('#475569').text(`Sugar Level: `, { continued: true }).fillColor('#1e293b').text(`${record.sugarLevel || '--'} mg/dL`);
                doc.fillColor('#475569').text(`Diagnosis: `, { continued: true }).fillColor('#1e293b').text(record.diagnosis || 'General Checkup');
                doc.moveDown(0.5);
            });
        }

        // ── Lab Results ──
        if (extraData?.labTests?.length > 0) {
            doc.moveDown(1.5);
            doc.fontSize(16).fillColor('#4338ca').text('Lab Diagnostic Results', { underline: true });
            doc.moveDown(1);
            extraData.labTests.forEach(test => {
                doc.fontSize(11).fillColor('#1e293b').text(`${test.testName}: `, { continued: true })
                   .fillColor(test.resultId?.flag !== 'Normal' ? '#ef4444' : '#1e293b')
                   .text(`${test.resultId?.value || 'Pending'} ${test.resultId?.unit || ''}`);
            });
        }

        // ── Signatures ──
        const signatureY = doc.page.height - 150;
        doc.moveTo(350, signatureY).lineTo(520, signatureY).strokeColor('#cbd5e1').lineWidth(1).stroke();
        
        doc.fontSize(12).fillColor('#4338ca').font('Times-Italic').text('Dr. Sarah Johnson, MD', 355, signatureY - 20);
        doc.fontSize(10).fillColor('#1e293b').font('Helvetica-Bold').text('Digitally Signed', 350, signatureY + 10);
        doc.fontSize(8).fillColor('#94a3b8').font('Helvetica').text('Chief Medical Officer', 350, signatureY + 22);

        // ── Footer ──
        doc.fontSize(8).fillColor('#94a3b8').text('Confidential Medical Record - For Professional Use Only', 50, doc.page.height - 50, { align: 'center' });

        doc.end();

        writeStream.on('finish', () => resolve());
        writeStream.on('error', (err) => reject(err));
    });
};
