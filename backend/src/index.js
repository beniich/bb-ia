require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./db');
const { logAudit } = require('./services/auditService');
const User = require('./models/user');

// Import Routes
const authRoutes = require('./routes/auth');
const repairRoutes = require('./routes/repair');
const subscriptionRoutes = require('./routes/subscription');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 4001;

app.use(cors());

// Stripe Webhook (needs raw body)
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        // In production: event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
        // For manual/mock testing without secret:
        event = JSON.parse(req.body);
    } catch (err) {
        console.error('Webhook Error:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const userId = Number(session.client_reference_id);
        if (userId) {
            const user = await User.findByPk(userId);
            if (user) {
                user.subscriptionPlan = 'pro';
                await user.save();
                await logAudit('subscription.created', { sessionId: session.id }, userId);
            }
        }
    }

    res.json({ received: true });
});

app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Register Routes
app.use('/api/auth', authRoutes);
app.use('/api/repair', repairRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/admin', adminRoutes);

// Sync DB and Start Server
sequelize.sync({ alter: true }).then(() => {
    console.log('Database synced');
}).catch(err => {
    console.error('Database sync error:', err);
});

app.listen(PORT, () => {
    console.log(`🔧 Repair Agent Backend running on http://localhost:${PORT}`);
});
