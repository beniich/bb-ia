exports.getPlans = async (req, res) => {
    res.json([
        { id: 'free', name: 'Free', price: 0, features: ['Basic Repair', 'Community Support'] },
        { id: 'pro', name: 'Pro', price: 29, features: ['Advanced Repair', 'Priority Support', 'Auto-fix'] },
        { id: 'enterprise', name: 'Enterprise', price: 99, features: ['Custom Solutions', 'Dedicated Agent', 'SLA'] }
    ]);
};

exports.createCheckoutSession = async (req, res) => {
    // Mock Stripe checkout
    const { planId } = req.body;

    if (!planId) {
        return res.status(400).json({ error: 'Plan ID required' });
    }

    // In a real app, this would call Stripe API
    res.json({
        url: `http://localhost:8080/subscription/success?plan=${planId}`,
        mock: true
    });
};
