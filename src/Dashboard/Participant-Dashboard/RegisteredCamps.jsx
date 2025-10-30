import React, { useState, useContext } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import Swal from 'sweetalert2';
import useAxiosSecure from '../../Hooks/useAxiosSecure';
import { AuthContext } from '../../Provider/AuthProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { CgSpinner } from 'react-icons/cg';
import { HiOutlineSearch, HiX, HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { FaStar } from 'react-icons/fa';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';

// --- Reusable Status Chip component ---
const StatusChip = ({ status, type }) => {
    let colors = '';
    if (type === 'payment') {
        colors = status === 'paid'
            ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
            : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
    } else { // confirmation
        colors = status === 'Confirmed'
            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300';
    }
    return <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full capitalize ${colors}`}>{status}</span>;
};

// --- Interactive Star Rating Component for the Form ---
const StarRatingInput = ({ value, onChange }) => {
    const [hover, setHover] = useState(0);
    return (
        <div className="flex items-center justify-center space-x-1">
            {[...Array(5)].map((_, index) => {
                const ratingValue = index + 1;
                return (
                    <button
                        type="button"
                        key={ratingValue}
                        className="transform transition-transform duration-200 hover:scale-125 focus:outline-none"
                        onClick={() => onChange(ratingValue)}
                        onMouseEnter={() => setHover(ratingValue)}
                        onMouseLeave={() => setHover(0)}
                    >
                        <FaStar
                            className="h-8 w-8"
                            color={ratingValue <= (hover || value) ? "#ffc107" : "#e4e5e9"}
                        />
                    </button>
                );
            })}
        </div>
    );
};


const RegisteredCamps = () => {
    const { user } = useContext(AuthContext);
    const axiosSecure = useAxiosSecure();
    const stripe = useStripe();
    const elements = useElements();
    const queryClient = useQueryClient();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const [selectedCamp, setSelectedCamp] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const { data: registeredCamps = [], refetch, isLoading } = useQuery({
        queryKey: ["registered-camps", user?.email],
        queryFn: async () => {
            const res = await axiosSecure.get(`/user-registered-camps?email=${user?.email}`);
            return res.data;
        },
        enabled: !!user?.email,
    });

    const { control, handleSubmit: handleFeedbackSubmit, reset: resetFeedbackForm, formState: { errors: feedbackErrors } } = useForm({
        defaultValues: { rating: 0, comment: "" },
    });

    const updatePaymentMutation = useMutation({
        mutationFn: async (data) => axiosSecure.patch(`/update-payment-status/${selectedCamp._id}`, data),
        onSuccess: () => {
            refetch();
            setIsModalOpen(false);
        },
        onError: (error) => Swal.fire("Error", error.message || "Payment update failed", "error"),
    });

    const cancelRegistrationMutation = useMutation({
        mutationFn: async (campId) => axiosSecure.delete(`/cancel-registration/${campId}`),
        onSuccess: () => {
            refetch();
            Swal.fire("Cancelled", "Your registration has been cancelled.", "success");
        },
        onError: (error) => Swal.fire("Error", error.response?.data?.message || "Cancellation failed", "error"),
    });

    const submitFeedbackMutation = useMutation({
        mutationFn: async (data) => axiosSecure.post("/submit-feedback", {
            campId: selectedCamp.campId,
            campName: selectedCamp.campName,
            participantEmail: user?.email,
            ...data,
        }),
        onSuccess: () => {
            Swal.fire("Success", "Thank you for your feedback!", "success");
            refetch();
            setIsFeedbackModalOpen(false);
            resetFeedbackForm();
        },
        onError: (error) => Swal.fire("Error", error.message || "Feedback submission failed", "error"),
    });

    const handlePay = (camp) => {
        if (camp.status !== "unpaid") {
            Swal.fire("Info", "This camp has already been paid for.", "info");
            return;
        }
        setSelectedCamp(camp);
        setIsModalOpen(true);
    };

    const onFinishPayment = async () => {
        if (!stripe || !elements) {
            Swal.fire("Initialization Error", "Stripe has not loaded yet. Please wait a moment and try again.", "error");
            return;
        }

        try {
            const { data: paymentIntentData } = await axiosSecure.post("/create-payment-intent", { amount: selectedCamp.fees });
            const clientSecret = paymentIntentData.clientSecret;
            const card = elements.getElement(CardElement);

            if (!card) {
                Swal.fire("Error", "Card element not found. Please refresh the page.", "error");
                return;
            }

            const { paymentIntent, error } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card,
                    billing_details: { name: user?.displayName || "N/A", email: user?.email || "N/A" },
                },
            });

            if (error) {
                Swal.fire("Payment Error", error.message, "error");
            } else if (paymentIntent.status === "succeeded") {
                await updatePaymentMutation.mutateAsync({
                    status: "paid",
                    transactionId: paymentIntent.id,
                });
                 Swal.fire("Payment Success!", `Your payment was successful. Transaction ID: ${paymentIntent.id}`, "success");
            }
        } catch (err) {
            console.error("Payment process error:", err);
            Swal.fire("Error", "An unexpected error occurred during the payment process.", "error");
        }
    };

    const handleCancel = (camp) => {
        if (camp.status === "paid") {
            Swal.fire("Info", "Cannot cancel a registration that has already been paid.", "info");
            return;
        }
        Swal.fire({
            title: 'Are you sure?',
            text: "Do you want to cancel your registration for this camp?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3b82f6',
            confirmButtonText: 'Yes, cancel it!',
        }).then((result) => {
            if (result.isConfirmed) {
                cancelRegistrationMutation.mutate(camp._id);
            }
        });
    };

    const handleFeedback = (camp) => {
        if (camp.status !== "paid") {
            Swal.fire("Info", "You can only submit feedback for paid and attended camps.", "info");
            return;
        }
        setSelectedCamp(camp);
        setIsFeedbackModalOpen(true);
    };

    const onFeedbackSubmit = (formData) => submitFeedbackMutation.mutate(formData);

    const filteredCamps = registeredCamps.filter(
        (camp) => camp.campName?.toLowerCase().includes(searchTerm.toLowerCase()) || camp.status?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };
    const paginatedCamps = filteredCamps.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    if (isLoading) {
        return <div className="flex h-full items-center justify-center"><CgSpinner className="h-12 w-12 animate-spin text-teal-500" /></div>;
    }

    return (
        <>
            <Helmet><title>Registered Camps | MediCamp Dashboard</title></Helmet>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                 <div className="rounded-lg bg-white dark:bg-slate-800 shadow-sm">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-gray-200 dark:border-slate-700 p-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">My Registered Camps</h2>
                            <p className="text-sm text-gray-500 dark:text-slate-400">Manage your payments, cancellations, and feedback.</p>
                        </div>
                        <div className="relative w-full md:w-auto">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><HiOutlineSearch className="h-5 w-5 text-gray-400 dark:text-slate-500" /></div>
                            <input type="text" placeholder="Search by name or status..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                                className="block w-full md:w-72 rounded-lg border-none bg-gray-100 py-2.5 pl-10 pr-3 shadow-inner dark:bg-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 sm:text-sm" />
                        </div>
                    </div>
                    
                    {/* --- DESKTOP TABLE VIEW --- */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                            <thead className="bg-gray-50 dark:bg-slate-700/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-slate-400">Camp Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-slate-400">Fees</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-slate-400">Payment Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-slate-400">Confirmation</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-slate-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                                {paginatedCamps.length > 0 ? (
                                    paginatedCamps.map((camp) => (
                                        <tr key={camp._id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-slate-200">{camp.campName}</td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-slate-400">${camp.fees}</td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm"><StatusChip status={camp.status} type="payment" /></td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm"><StatusChip status={camp.confirmationStatus} type="confirmation" /></td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                                                <div className="flex items-center gap-2">
                                                    {camp.status === "unpaid" ? (
                                                        <>
                                                            <button onClick={() => handlePay(camp)} className="rounded-md bg-teal-600 px-3 py-1 text-xs text-white shadow-sm transition hover:bg-teal-700">Pay</button>
                                                            <button onClick={() => handleCancel(camp)} className="rounded-md bg-red-600 px-3 py-1 text-xs text-white shadow-sm transition hover:bg-red-700">Cancel</button>
                                                        </>
                                                    ) : (
                                                        <button onClick={() => handleFeedback(camp)} className="rounded-md bg-blue-600 px-3 py-1 text-xs text-white shadow-sm transition hover:bg-blue-700">Feedback</button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="5" className="px-6 py-16 text-center text-sm text-gray-500 dark:text-slate-400">You haven't registered for any camps yet.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* --- MOBILE CARD VIEW --- */}
                    <div className="md:hidden p-4 space-y-4">
                         {paginatedCamps.length > 0 ? (
                            paginatedCamps.map((camp) => (
                                <div key={camp._id} className="rounded-lg bg-gray-50 dark:bg-slate-700/50 p-4 shadow-sm">
                                    <div className="flex justify-between items-start">
                                        <p className="font-bold text-gray-800 dark:text-slate-100">{camp.campName}</p>
                                        <p className="font-semibold text-gray-700 dark:text-slate-300">${camp.fees}</p>
                                    </div>
                                    <div className="mt-4 space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500 dark:text-slate-400">Payment:</span>
                                            <StatusChip status={camp.status} type="payment" />
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500 dark:text-slate-400">Confirmation:</span>
                                            <StatusChip status={camp.confirmationStatus} type="confirmation" />
                                        </div>
                                    </div>
                                    <div className="mt-4 border-t border-gray-200 dark:border-slate-600 pt-3 flex items-center gap-2">
                                        {camp.status === "unpaid" ? (
                                            <>
                                                <button onClick={() => handlePay(camp)} className="flex-1 rounded-md bg-teal-600 px-3 py-2 text-sm text-white shadow-sm transition hover:bg-teal-700">Pay</button>
                                                <button onClick={() => handleCancel(camp)} className="flex-1 rounded-md bg-red-600 px-3 py-2 text-sm text-white shadow-sm transition hover:bg-red-700">Cancel</button>
                                            </>
                                        ) : (
                                            <button onClick={() => handleFeedback(camp)} className="flex-1 rounded-md bg-blue-600 px-3 py-2 text-sm text-white shadow-sm transition hover:bg-blue-700">Feedback</button>
                                        )}
                                    </div>
                                </div>
                            ))
                         ) : (
                             <div className="py-16 text-center text-sm text-gray-500 dark:text-slate-400">You haven't registered for any camps yet.</div>
                         )}
                    </div>
                    
                    {/* --- Pagination --- */}
                    {filteredCamps.length > rowsPerPage && (
                         <div className="flex items-center justify-between border-t border-gray-200 dark:border-slate-700 px-4 py-3 sm:px-6">
                             {/* Mobile Pagination */}
                             <div className="flex flex-1 justify-between sm:hidden">
                                <button onClick={() => setPage(page - 1)} disabled={page === 0} className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-600">Previous</button>
                                <button onClick={() => setPage(page + 1)} disabled={page >= Math.ceil(filteredCamps.length / rowsPerPage) - 1} className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-600">Next</button>
                            </div>
                            {/* Desktop Pagination */}
                            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700 dark:text-slate-400">
                                        Showing <span className="font-medium">{page * rowsPerPage + 1}</span> to <span className="font-medium">{Math.min((page + 1) * rowsPerPage, filteredCamps.length)}</span> of{' '}
                                        <span className="font-medium">{filteredCamps.length}</span> results
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <select value={rowsPerPage} onChange={handleChangeRowsPerPage} className="rounded-md border-gray-300 bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300 focus:ring-teal-500">
                                        {[5, 10, 25].map(size => (<option key={size} value={size}>Show {size}</option>))}
                                    </select>
                                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                        <button onClick={() => setPage(page - 1)} disabled={page === 0} className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 dark:ring-slate-600 dark:text-slate-400 dark:hover:bg-slate-700"><HiChevronLeft className="h-5 w-5" /></button>
                                        <button onClick={() => setPage(page + 1)} disabled={page >= Math.ceil(filteredCamps.length / rowsPerPage) - 1} className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 dark:ring-slate-600 dark:text-slate-400 dark:hover:bg-slate-700"><HiChevronRight className="h-5 w-5" /></button>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    )}
                 </div>
            </motion.div>

            {/* --- Modals (Payment & Feedback) --- */}
            <AnimatePresence>
                {isModalOpen && ( <motion.div> {/* Payment Modal JSX */} </motion.div> )}
            </AnimatePresence>
            <AnimatePresence>
                {isFeedbackModalOpen && ( <motion.div> {/* Feedback Modal JSX */} </motion.div> )}
            </AnimatePresence>
        </>
    );
};

export default RegisteredCamps;

