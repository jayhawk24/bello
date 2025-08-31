import { redirect } from 'next/navigation';
import Link from 'next/link';

export default function PaymentPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-yellow-50">
            <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
                <h1 className="text-3xl font-bold text-yellow-600 mb-4">Welcome to Bello!</h1>
                <p className="mb-6 text-gray-700">Choose how you want to get started:</p>
                <div className="flex flex-col gap-4">
                    <Link href="/pricing">
                        <button className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded-xl w-full">Upgrade Now</button>
                    </Link>
                    <form action="/api/auth/continue-free" method="POST">
                        <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-xl w-full">Continue for Free</button>
                    </form>
                </div>
                <p className="mt-6 text-xs text-gray-500 text-center">Free plan: 1 room, 1 staff user. Upgrade anytime.</p>
            </div>
        </div>
    );
}
