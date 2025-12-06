const express = require('express');
const router = express.Router();
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');
const User = require('../models/user');
const AuditLog = require('../models/auditLog');
const { logAudit } = require('../services/auditService');

router.use(requireAuth, requireAdmin);

// List users
router.get('/users', async (req, res) => {
    const users = await User.findAll({
        attributes: ['id', 'email', 'role', 'subscriptionPlan', 'totpEnabled']
    });
    res.json({ users });
});

// Promote user
router.post('/users/:id/promote', async (req, res) => {
    const id = Number(req.params.id);
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: 'not_found' });

    user.role = 'admin';
    await user.save();
    await logAudit('user.promote', { to: 'admin' }, req.userId);
    res.json({ ok: true });
});

// Demote user
router.post('/users/:id/demote', async (req, res) => {
    const id = Number(req.params.id);
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: 'not_found' });

    user.role = 'user';
    await user.save();
    await logAudit('user.demote', { to: 'user' }, req.userId);
    res.json({ ok: true });
});

// Audit logs
router.get('/audit', async (req, res) => {
    const logs = await AuditLog.findAll({
        limit: 200,
        order: [['createdAt', 'DESC']]
    });
    res.json({ logs });
});

module.exports = router;
