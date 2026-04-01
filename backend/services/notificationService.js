const { Notification } = require('../models');
const socketUtil = require('../utils/socket');

/**
 * Professional Notification & Clinical Alert Service
 */
const notificationService = {
    /**
     * Centralized alert dispatcher
     */
    sendClinicalAlert: async (userId, message, type = 'alert') => {
        try {
            const notification = new Notification({
                userId,
                message,
                type
            });
            await notification.save();

            // Real-time broadcast
            socketUtil.sendNotification(userId, {
                message,
                type,
                createdAt: notification.createdAt
            });

            return notification;
        } catch (error) {
            console.error('Notification Service Error:', error);
        }
    },

    /**
     * Rule-based engine for clinical health risks
     */
    processClinicalAlerts: async (patient, currentVitals) => {
        const userId = patient.userId;
        const alerts = [];

        // 1. Hypertension Triage
        if (currentVitals.bloodPressure) {
            const { systolic, diastolic } = currentVitals.bloodPressure;
            if (systolic > 140 || diastolic > 90) {
                alerts.push(`Critical: High blood pressure detected (${systolic}/${diastolic}). Immediate monitoring recommended.`);
            } else if (systolic > 130 || diastolic > 85) {
                alerts.push(`Caution: Elevated blood pressure markers (${systolic}/${diastolic}). Please review patient history.`);
            }
        }

        // 2. Glycemic Stress (Diabetes Risk)
        if (currentVitals.sugarLevel) {
            const sugar = Number(currentVitals.sugarLevel);
            if (sugar > 200) {
                alerts.push(`Critical: Very high glucose level (${sugar} mg/dL). Risk of hyperglycemic episode.`);
            } else if (sugar > 126) {
                alerts.push(`Warning: Fasting glucose level (${sugar} mg/dL) indicates potential pre-diabetic state.`);
            }
        }

        // 3. BMI & Metabolic Stress
        if (currentVitals.heightCm && currentVitals.weightKg) {
            const bmi = currentVitals.weightKg / Math.pow(currentVitals.heightCm / 100, 2);
            if (bmi > 30) {
                alerts.push(`Metabolic Alert: BMI ${bmi.toFixed(1)} indicates obesity. Suggest cardiovascular screening.`);
            } else if (bmi < 18.5) {
                alerts.push(`Nutritional Alert: Low BMI ${bmi.toFixed(1)}. Please evaluate nutritional intake.`);
            }
        }

        // 4. Hematological Indicators (Simulation of Lab Result Integration)
        // If lab results are passed in the future, we add hemogloblin checks here
        
        // Dispatch all generated alerts
        for (const msg of alerts) {
            await notificationService.sendClinicalAlert(userId, msg, 'alert');
        }
    }
};

module.exports = notificationService;
