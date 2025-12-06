const bcrypt = require('bcrypt');
const User = require('../models/user');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../services/jwtService');
const { logAudit } = require('../services/auditService');

exports.signup = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'missing' });

    const found = await User.findOne({ where: { email } });
    if (found) return res.status(400).json({ error: 'email_in_use' });

    const user = await User.create({ email, password }); // password hash handled by model hook

    const access = signAccessToken({ userId: user.id, role: user.role });
    const refresh = signRefreshToken({ userId: user.id });

    await logAudit('user.signup', { email }, user.id);

    res.json({
        user: { id: user.id, email: user.email, role: user.role },
        access,
        refresh
    });
};

exports.signin = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'missing' });

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ error: 'invalid' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'invalid' });

    const access = signAccessToken({ userId: user.id, role: user.role });
    const refresh = signRefreshToken({ userId: user.id });

    await logAudit('user.signin', { email }, user.id);

    res.json({
        access,
        refresh,
        user: {
            id: user.id,
            email: user.email,
            role: user.role,
            subscriptionPlan: user.subscriptionPlan
        }
    });
};

exports.me = async (req, res) => {
    const uid = req.userId;
    const user = await User.findByPk(uid, {
        attributes: ['id', 'email', 'role', 'subscriptionPlan', 'totpEnabled']
    });

    if (!user) return res.status(404).json({ error: 'not_found' });
    res.json({ user });
};

exports.refreshToken = async (req, res) => {
    const { refresh } = req.body;
    if (!refresh) return res.status(400).json({ error: 'missing' });

    try {
        const payload = verifyRefreshToken(refresh);
        const access = signAccessToken({ userId: payload.userId, role: payload.role || 'user' });
        return res.json({ access });
    } catch (e) {
        return res.status(401).json({ error: 'invalid_refresh' });
    }
};
