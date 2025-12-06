const { verifyAccessToken } = require('../services/jwtService');
const User = require('../models/user');

exports.requireAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'missing_token' });

    const token = authHeader.split(' ')[1];
    try {
        const payload = verifyAccessToken(token);
        req.userId = payload.userId;
        req.userRole = payload.role;

        // Optional: fetch full user
        // req.currentUser = await User.findByPk(payload.userId);

        next();
    } catch (e) {
        return res.status(401).json({ error: 'invalid_token' });
    }
};

exports.requireAdmin = (req, res, next) => {
    if (req.userRole !== 'admin') {
        return res.status(403).json({ error: 'forbidden' });
    }
    next();
};
