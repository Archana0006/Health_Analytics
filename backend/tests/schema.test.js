const mongoose = require('mongoose');
const models = require('../models');

describe('Mongoose model imports', () => {
    test('All models should be defined', () => {
        const expected = ['User', 'Patient', 'Appointment', 'HealthRecord', 'MedicalRecord', 'Prescription', 'LabTest', 'LabResult', 'AuditLog'];
        expected.forEach(name => {
            expect(models[name]).toBeDefined();
        });
    });
});
