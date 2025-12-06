const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAuth } = require('../middleware/authMiddleware');

router.post('/signup', authController.signup);
router.post('/signin', authController.signin);
router.post('/refresh', authController.refreshToken);
router.get('/me', requireAuth, authController.me);

module.exports = router;
