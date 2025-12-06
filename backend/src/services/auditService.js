const AuditLog = require('../models/auditLog');

exports.logAudit = async (action, meta, userId) => {
    try {
        await AuditLog.create({
            userId: userId || null,
            action,
            meta: meta || null
        });
    } catch (e) {
        console.error('Audit log failed:', e);
    }
};
