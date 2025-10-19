import React, { useContext, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import useAxiosSecure from '../Hooks/useAxiosSecure';
import useAuth from '../Hooks/useAuth'; // Use your consistent auth hook
import Swal from 'sweetalert2';
import { Helmet } from 'react-helmet-async';
import { CgSpinner } from 'react-icons/cg';
import { HiOutlineUsers, HiOutlineSearch, HiCheckCircle, HiXCircle } from 'react-icons/hi';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

// Reusable Status Chip component
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
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors}`}>{status}</span>;
};


const ManageRegisteredCamps = () => {
    const { user } = useAuth();
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState("");

    // --- YOUR DATA FETCHING LOGIC (UNCHANGED) ---
    const { data: registered = [], isLoading, isError, error } = useQuery({
        queryKey: ["registered-camps", user?.email],
        queryFn: async () => {
            const res = await axiosSecure.get(`/registered-camps?email=${user?.email}`);
            return res.data;
        },
        enabled: !!user?.email,
    });

    // --- YOUR MUTATION LOGIC (UNCHANGED) ---
    const handleCancelRegistration = (record) => {
        Swal.fire({
            title: 'Are you sure?',
            text: `This will cancel the registration for ${record.participantName}.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, cancel it!',
            background: document.documentElement.classList.contains('dark') ? '#1f2937' : '#fff',
            color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#000',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axiosSecure.delete(`/cancel-registration/${record._id}`);
                    Swal.fire('Cancelled!', 'The registration has been cancelled.', 'success');
                    queryClient.invalidateQueries({ queryKey: ["registered-camps", user?.email] });
                } catch (error) {
                    Swal.fire('Error!', error.response?.data?.message || 'Failed to cancel registration.', 'error');
                }
            }
        });
    };

    const handleConfirmPayment = async (record) => {
        try {
            await axiosSecure.patch(`/update-confirmation/${record._id}`, { confirmationStatus: "Confirmed" });
            toast.success("Payment confirmed!");
            queryClient.invalidateQueries({ queryKey: ["registered-camps", user?.email] });
        } catch (error) {
            toast.error("Failed to confirm payment.");
        }
    };

    // --- YOUR FILTERING LOGIC (UNCHANGED) ---
    const filteredRegistered = registered.filter(record =>
        record.campName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.participantName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) { return <div className="flex h-full items-center justify-center"><CgSpinner className="h-12 w-12 animate-spin text-teal-500" /></div>; }
    if (isError) { return <div className="text-center text-red-500 dark:text-red-400">Error: {error.message}</div>; }

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Helmet> <title>Manage Registrations | MediCamp Dashboard</title> </Helmet>

            <div className="rounded-lg bg-white dark:bg-slate-800 shadow-sm">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-gray-200 dark:border-slate-700 p-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">Manage Registered Camps</h2>
                        <p className="text-sm text-gray-500 dark:text-slate-400">Confirm payments and manage participant registrations.</p>
                    </div>
                    <div className="relative w-full md:w-auto">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <HiOutlineSearch className="h-5 w-5 text-gray-400 dark:text-slate-500" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by Camp or Participant..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full rounded-lg border-none bg-gray-100 py-2.5 pl-10 pr-3 shadow-inner dark:bg-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 sm:text-sm"
                        />
                    </div>
                </div>

                {/* Responsive Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                        <thead className="bg-gray-50 dark:bg-slate-700/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-slate-400">Camp Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-slate-400">Participant</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-slate-400">Fees</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-slate-400">Payment Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-slate-400">Confirmation</th>
                                <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                            {filteredRegistered.length > 0 ? (
                                filteredRegistered.map((record) => (
                                    <tr key={record._id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-slate-200">{record.campName}</td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-slate-400">{record.participantName}</td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-slate-400">${record.fees}</td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm"><StatusChip status={record.status} type="payment" /></td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm"><StatusChip status={record.confirmationStatus} type="confirmation" /></td>
                                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium space-x-2">
                                            <button
                                                onClick={() => handleConfirmPayment(record)}
                                                disabled={record.confirmationStatus === "Confirmed" || record.status !== 'paid'}
                                                className="group relative inline-flex items-center justify-center rounded-md p-2 text-green-600 hover:bg-green-100 dark:text-green-400 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                                aria-label="Confirm Payment"
                                            >
                                                <HiCheckCircle className="h-5 w-5" />
                                                <span className="absolute -top-8 left-1/2 -translate-x-1/2 scale-0 rounded bg-slate-900 px-2 py-1 text-xs text-white transition-all group-hover:scale-100">Confirm</span>
                                            </button>
                                            <button
                                                onClick={() => handleCancelRegistration(record)}
                                                disabled={record.status === "paid"}
                                                className="group relative inline-flex items-center justify-center rounded-md p-2 text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                                aria-label="Cancel Registration"
                                            >
                                                <HiXCircle className="h-5 w-5" />
                                                <span className="absolute -top-8 left-1/2 -translate-x-1/2 scale-0 rounded bg-slate-900 px-2 py-1 text-xs text-white transition-all group-hover:scale-100">Cancel</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-10 text-center text-sm text-gray-500 dark:text-slate-400">
                                        No registered participants found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
};

export default ManageRegisteredCamps;
