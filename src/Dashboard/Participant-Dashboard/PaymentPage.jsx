import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import useAxiosSecure from '../../Hooks/useAxiosSecure';
import useAuth from '../../Hooks/useAuth';
import Swal from 'sweetalert2';
import { CgSpinner } from 'react-icons/cg';
import { HiOutlineCreditCard, HiArrowLeft } from 'react-icons/hi';
import { motion } from 'framer-motion';

// --- Stripe Promise (must be outside the component) ---
// Make sure your Stripe Publishable Key is in your .env file
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// --- The actual payment form component ---
const CheckoutForm = ({ registration }) => {
    const stripe = useStripe();
    const elements = useElements();
    const { user } = useAuth();
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const { mutate: updatePayment, isPending } = useMutation({
        mutationFn: async (data) => axiosSecure.patch(`/update-payment-status/${registration._id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["registered-camps", user?.email] });
        },
    });

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!stripe || !elements) {
            Swal.fire("Initialization Error", "Stripe is not ready. Please try again.", "error");
            return;
        }

        const card = elements.getElement(CardElement);
        if (card == null) return;

        try {
            const { data: paymentIntentData } = await axiosSecure.post("/create-payment-intent", { amount: registration.fees });
            const clientSecret = paymentIntentData.clientSecret;

            const { paymentIntent, error } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card,
                    billing_details: { name: user?.displayName, email: user?.email },
                },
            });

            if (error) {
                Swal.fire("Payment Failed", error.message, "error");
            } else if (paymentIntent.status === "succeeded") {
                await updatePayment({ status: "paid", transactionId: paymentIntent.id });
                Swal.fire("Payment Success!", `Your payment for ${registration.campName} was successful.`, "success");
                navigate('/dashboard/registered-camps');
            }
        } catch (err) {
            Swal.fire("Error", "An unexpected error occurred during payment.", "error");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="p-4 rounded-md border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700">
                <CardElement
                    options={{
                        style: {
                            base: {
                                fontSize: '16px',
                                color: document.documentElement.classList.contains('dark') ? '#CBD5E1' : '#424770',
                                '::placeholder': { color: '#aab7c4' }
                            },
                            invalid: { color: '#ef4444' }
                        }
                    }}
                />
            </div>
            <button
                type="submit"
                disabled={isPending || !stripe}
                className="flex w-full items-center justify-center rounded-lg border border-transparent bg-teal-700 px-6 py-3 text-base font-medium text-white shadow-sm transition hover:bg-teal-800 disabled:opacity-60"
            >
                {isPending ? <CgSpinner className="h-6 w-6 animate-spin" /> : `Pay $${registration.fees}`}
            </button>
        </form>
    );
};

// --- The Page Wrapper Component ---
const PaymentPage = () => {
    const { registrationId } = useParams();
    const axiosSecure = useAxiosSecure();
    const navigate = useNavigate();

    const { data: registration, isLoading, isError } = useQuery({
        queryKey: ['registration-details', registrationId],
        queryFn: async () => {
            const res = await axiosSecure.get(`/registrations/${registrationId}`);
            return res.data;
        },
        enabled: !!registrationId,
    });

    if (isLoading) {
        return <div className="flex h-full items-center justify-center"><CgSpinner className="h-12 w-12 animate-spin text-teal-500" /></div>;
    }
    if (isError || !registration) {
        return <div className="text-center text-red-500 dark:text-red-400">Failed to load registration details.</div>;
    }

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Helmet><title>Complete Payment | MediCamp Dashboard</title></Helmet>
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700">
                        <HiArrowLeft className="h-6 w-6 text-gray-500 dark:text-slate-400" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100">Complete Your Payment</h1>
                        <p className="text-sm text-gray-500 dark:text-slate-400">Securely pay for your camp registration.</p>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left: Details */}
                    <div className="rounded-lg bg-white dark:bg-slate-800 p-6 shadow-sm">
                        <h2 className="text-lg font-semibold border-b border-gray-200 dark:border-slate-700 pb-3 mb-4">Order Summary</h2>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between"><span className="text-gray-500 dark:text-slate-400">Camp Name:</span><span className="font-medium text-gray-800 dark:text-slate-200 text-right">{registration.campName}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500 dark:text-slate-400">Participant:</span><span className="font-medium text-gray-800 dark:text-slate-200">{registration.participantName}</span></div>
                            <div className="flex justify-between border-t border-gray-200 dark:border-slate-700 pt-3 mt-3 text-lg">
                                <span className="font-bold text-gray-800 dark:text-slate-100">Total Amount:</span>
                                <span className="font-bold text-teal-600 dark:text-teal-400">${registration.fees}</span>
                            </div>
                        </div>
                    </div>
                    {/* Right: Payment Form */}
                    <div className="rounded-lg bg-white dark:bg-slate-800 p-6 shadow-sm">
                        <h2 className="text-lg font-semibold border-b border-gray-200 dark:border-slate-700 pb-3 mb-4 flex items-center gap-2">
                            <HiOutlineCreditCard /> Enter Card Details
                        </h2>
                        {/* --- WRAP THE FORM WITH THE ELEMENTS PROVIDER --- */}
                        <Elements stripe={stripePromise}>
                            <CheckoutForm registration={registration} />
                        </Elements>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default PaymentPage;

