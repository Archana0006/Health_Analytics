const AuditLog = require('../models/AuditLog');

/**
 * Middleware to log actions to the AuditLog collection.
 * Usage: logAudit(action, entityGetter)
 * action: string (e.g., 'create', 'update', 'delete', 'read')
 * entityGetter: function(req, res) -> { entity: 'ModelName', entityId: 'id', details: {} }
 */
const logAudit = (action, entityGetter) => {
    return async (req, res, next) => {
        // Intercept res.json to log after successful response
        const originalJson = res.json;
        res.json = async function (data) {
            // Restore original res.json to avoid infinite loops
            res.json = originalJson;

            // Send response to the client
            res.json(data);

            // Only log if the response was successful (2xx)
            if (res.statusCode >= 200 && res.statusCode < 300) {
                try {
                    const auditInfo = entityGetter(req, data);
                    if (auditInfo) {
                        const audit = new AuditLog({
                            action,
                            entity: auditInfo.entity,
                            entityId: auditInfo.entityId,
                            performedBy: req.user.id || req.user._id, // Set by authMiddleware
                            details: auditInfo.details || {}
                        });
                        await audit.save();
                    }
                } catch (err) {
                    console.error('Audit Log Error:', err);
                }
            }
        };
        next();
    };
};

module.exports = { logAudit };
