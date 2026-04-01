const { Patient, Appointment, MedicalRecord, HealthRecord } = require('../models');

/**
 * Service for Doctor-related clinical analytics
 */
const doctorService = {
    /**
     * Fetch comprehensive clinical statistics for a doctor
     */
    getDoctorStats: async (doctorId) => {
        const [totalPatients, appointmentsToday, criticalPatients, recentReports] = await Promise.all([
            Patient.countDocuments(),
            Appointment.countDocuments({ 
                doctorId, 
                date: { $gte: new Date().setHours(0,0,0,0), $lt: new Date().setHours(23,59,59,999) }
            }),
            Patient.find({ 'vitals.bloodPressure.systolic': { $gt: 140 } }).limit(5),
            MedicalRecord.countDocuments({ doctorId })
        ]);

        return {
            totalPatients,
            appointmentsToday,
            criticalAlerts: criticalPatients.length,
            recentReports,
            criticalPatientsList: criticalPatients
        };
    },

    /**
     * Logic for identifying high-risk patients (Clinical Triage)
     */
    getCriticalPatients: async () => {
        // Find patients with hypertensive or diabetic stress markers
        return await Patient.find({
            $or: [
                { 'vitals.bloodPressure.systolic': { $gt: 140 } },
                { 'vitals.bloodPressure.diastolic': { $gt: 90 } },
                { 'vitals.sugarLevel': { $gt: 126 } }
            ]
        }).sort({ updatedAt: -1 }).limit(10);
    }
};

module.exports = doctorService;
