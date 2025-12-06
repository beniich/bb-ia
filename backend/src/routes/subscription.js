const express = require('express');
const Stripe = require('stripe');
const { requireAuth } = require('../middleware/authMiddleware');
const User = require('../models/user');
const { logAudit } = require('../services/auditService');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', { apiVersion: '2024-11-15' });
const router = express.Router();

router.get('/plans', (req, res) => {
    res.json([
        { id: 'basic', name: 'Basic', price: 0, features: ['Basic Repair'] },
        { id: 'pro', name: 'Pro', price: 1999, features: ['Advanced Repair', 'Priority Support'] },
        { id: 'enterprise', name: 'Enterprise', price: 4999, features: ['All Features'] }
    ]);
});

router.post('/create-checkout-session', requireAuth, async (req, res) => {
    const { priceId, successUrl, cancelUrl } = req.body;
    try {
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            line_items: [{ price: priceId, quantity: 1 }],
            success_url: successUrl || `${req.headers.origin}/subscription?success=1`,
            cancel_url: cancelUrl || `${req.headers.origin}/subscription?canceled=1`,
            client_reference_id: req.userId.toString()
        });
        res.json({ url: session.url });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Mock Create Payment Intent (for Elements demo)
router.post('/create-payment-intent', requireAuth, async (req, res) => {
    const { amount } = req.body;
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: 'usd',
            automatic_payment_methods: {
                enabled: true,
            },
        });
        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;
