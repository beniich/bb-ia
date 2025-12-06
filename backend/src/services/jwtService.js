const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || 'dev-refresh-secret';

exports.signAccessToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
};

exports.signRefreshToken = (payload) => {
    return jwt.sign(payload, REFRESH_SECRET, { expiresIn: '30d' });
};

exports.verifyAccessToken = (token) => {
    return jwt.verify(token, JWT_SECRET);
};

exports.verifyRefreshToken = (token) => {
    return jwt.verify(token, REFRESH_SECRET);
};
