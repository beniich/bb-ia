import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_sample');

function CheckoutButton({ plan }: { plan: string }) {
    const [loading, setLoading] = useState(false);

    const onBuy = async () => {
        setLoading(true);
        try {
            const res = await api.post('/subscription/create-checkout-session', {
                priceId: plan,
                successUrl: window.location.href,
                cancelUrl: window.location.href
            });
            if (res.data.url) window.location.href = res.data.url;
        } catch (e) {
            console.error(e);
            alert('Checkout failed');
        } finally {
            setLoading(false);
        }
    };
    return (
        <Button onClick={onBuy} disabled={loading} className="w-full">
            {loading ? 'Redirecting...' : 'Subscribe'}
        </Button>
    );
}

function ElementsForm() {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);

    const pay = async () => {
        setLoading(true);
        try {
            const r = await api.post('/subscription/create-payment-intent', { amount: 1999 });
            const clientSecret = r.data.clientSecret;

            if (!stripe || !elements) return;

            const result = await stripe.confirmCardPayment(clientSecret, {
                payment_method: { card: elements.getElement(CardElement)! }
            });

            if (result.error) {
                alert(result.error.message);
            } else if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
                alert('Payment success!');
            }
        } catch (e: unknown) {
            console.error(e);
            let msg = 'Payment failed';
            if (e instanceof Error) msg += ': ' + e.message;
            // @ts-ignore - response logic
            if ((e as any)?.response?.data?.error) msg = (e as any).response.data.error;
            alert(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4 border p-4 rounded-lg bg-card">
            <h4 className="font-semibold mb-3">Or pay directly with Card</h4>
            <div className="p-3 border rounded bg-background">
                <CardElement options={{
                    style: {
                        base: {
                            color: '#e2e8f0', // Adjust for dark mode if needed
                            fontSize: '16px',
                        }
                    }
                }} />
            </div>
            <Button onClick={pay} disabled={loading || !stripe} className="w-full">
                {loading ? 'Processing...' : 'Pay $19.99'}
            </Button>
        </div>
    );
}

export default function Subscription() {
    const [plans, setPlans] = useState<any[]>([]);

    useEffect(() => {
        // In a real app, fetch plans from backend
        // For now we use the static ones from the previous step + Stripe integration
        setPlans([
            { id: import.meta.env.VITE_STRIPE_PRICE_BASIC_ID || 'price_basic', name: 'Basic', price: 'Free' },
            { id: import.meta.env.VITE_STRIPE_PRICE_PRO_ID || 'price_pro', name: 'Pro', price: '$19.99/mo' },
        ]);
    }, []);

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold">Subscription Plans</h1>
                <p className="text-muted-foreground">Choose the plan that fits your needs</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {plans.map((p) => (
                    <Card key={p.id}>
                        <CardHeader>
                            <CardTitle>{p.name}</CardTitle>
                            <CardDescription className="text-2xl font-bold text-foreground">{p.price}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <CheckoutButton plan={p.id} />
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Elements stripe={stripePromise}>
                <ElementsForm />
            </Elements>
        </div>
    );
}
