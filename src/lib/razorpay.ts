import Razorpay from 'razorpay';

// Initialize Razorpay instance
export const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// Subscription plans configuration
export const SUBSCRIPTION_PLANS = {
    starter: {
        name: 'Starter',
        description: '1-20 Rooms',
        price: 4900, // ₹49.00 in paise
        currency: 'INR',
        period: 'monthly',
        interval: 1,
        roomLimit: 20,
        features: [
            'Up to 20 rooms',
            'QR code access',
            'Basic service requests',
            'Email support',
            'Basic analytics'
        ]
    },
    growth: {
        name: 'Growth',
        description: '21-50 Rooms',
        price: 12900, // ₹129.00 in paise
        currency: 'INR',
        period: 'monthly',
        interval: 1,
        roomLimit: 50,
        features: [
            'Up to 50 rooms',
            'QR code access',
            'Full service requests',
            'Priority support',
            'Advanced analytics',
            'Custom branding'
        ]
    },
    professional: {
        name: 'Professional',
        description: '51-100 Rooms',
        price: 24900, // ₹249.00 in paise
        currency: 'INR',
        period: 'monthly',
        interval: 1,
        roomLimit: 100,
        features: [
            'Up to 100 rooms',
            'QR code access',
            'Premium service suite',
            'Phone & chat support',
            'Full analytics dashboard',
            'Multi-location support',
            'API access'
        ]
    },
    enterprise: {
        name: 'Enterprise',
        description: '100+ Rooms',
        price: 44900, // ₹449.00 in paise
        currency: 'INR',
        period: 'monthly',
        interval: 1,
        roomLimit: -1, // Unlimited
        features: [
            'Unlimited rooms',
            'White-label solution',
            'Enterprise integrations',
            '24/7 dedicated support',
            'Custom analytics',
            'Multi-property management',
            'SLA guarantee'
        ]
    }
};

// Helper function to create payment order (for one-time payments)
export async function createPaymentOrder(amount: number, currency: string = 'INR', receipt?: string) {
    try {
        const order = await razorpay.orders.create({
            amount,
            currency,
            receipt: receipt || `order_${Date.now()}`,
            payment_capture: true,
        });
        
        return order;
    } catch (error) {
        console.error('Error creating payment order:', error);
        throw error;
    }
}

// Helper function to verify payment signature
export function verifyPaymentSignature(
    paymentId: string,
    orderId: string,
    signature: string
): boolean {
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!);
    hmac.update(orderId + '|' + paymentId);
    const generated_signature = hmac.digest('hex');
    
    return generated_signature === signature;
}

// Helper function to verify subscription signature
export function verifySubscriptionSignature(
    subscriptionId: string,
    paymentId: string,
    signature: string
): boolean {
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!);
    hmac.update(subscriptionId + '|' + paymentId);
    const generated_signature = hmac.digest('hex');
    
    return generated_signature === signature;
}