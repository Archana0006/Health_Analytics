const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    action: { type: String, required: true }, // e.g., 'create', 'update', 'delete', 'read'
    entity: { type: String, required: true }, // collection name, e.g., 'Patient'
    entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    timestamp: { type: Date, default: Date.now },
    details: { type: mongoose.Schema.Types.Mixed } // additional info, could be object or string
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
