import React, { useState, useContext } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from '../../Hooks/useAxiosSecure';
import { AuthContext } from '../../Provider/AuthProvider';
import { CgSpinner } from 'react-icons/cg';
import { HiOutlineReceiptRefund, HiOutlineSearch, HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';

// Reusable Status Chip component
const StatusChip = ({ status }) => {
    const colors = status === 'Confirmed'
        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300';
    return <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${colors}`}>{status}</span>;
};

const PaymentHistory = () => {
    // --- YOUR LOGIC (PRESERVED) ---
    const { user } = useContext(AuthContext);
    const axiosSecure = useAxiosSecure();
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const { data: paymentHistory = [], isLoading, error, refetch } = useQuery({
        queryKey: ["payment-history", user?.email],
        queryFn: async () => {
            try {
                const res = await axiosSecure.get(`/payment-history?email=${user?.email}`);
                return Array.isArray(res.data) ? res.data : [];
            } catch (err) {
                // If the API returns a 404, it means no history, so return an empty array.
                if (err.response?.status === 404) {
                    return [];
                }
                throw err;
            }
        },
        enabled: !!user?.email,
    });

    const filteredPaymentHistory = paymentHistory.filter((payment) =>
        payment?.campName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment?.transactionId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };
    const paginatedHistory = filteredPaymentHistory.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    // --- END OF YOUR LOGIC ---


    if (isLoading) {
        return <div className="flex h-full items-center justify-center"><CgSpinner className="h-12 w-12 animate-spin text-teal-500" /></div>;
    }
    if (error) {
        return <div className="text-center text-red-500 dark:text-red-400">Error: {error.message}</div>;
    }

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Helmet><title>Payment History | MediCamp Dashboard</title></Helmet>
            <div className="rounded-lg bg-white dark:bg-slate-800 shadow-sm">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-gray-200 dark:border-slate-700 p-6">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-600 dark:bg-slate-700 dark:text-teal-400">
                            <HiOutlineReceiptRefund className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">Payment History</h2>
                            <p className="text-sm text-gray-500 dark:text-slate-400">A record of all your completed payments.</p>
                        </div>
                    </div>
                    <div className="relative w-full md:w-auto">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><HiOutlineSearch className="h-5 w-5 text-gray-400 dark:text-slate-500" /></div>
                        <input type="text" placeholder="Search by camp or transaction ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full md:w-72 rounded-lg border-none bg-gray-100 py-2.5 pl-10 pr-3 shadow-inner dark:bg-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 sm:text-sm" />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                        <thead className="bg-gray-50 dark:bg-slate-700/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-slate-400">Camp Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-slate-400">Date Paid</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-slate-400">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-slate-400">Confirmation</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-slate-400">Transaction ID</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                            {paginatedHistory.length > 0 ? (
                                paginatedHistory.map((payment) => (
                                    <tr key={payment._id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-slate-200">{payment.campName}</td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-slate-400">{dayjs(payment.registeredAt).format('DD MMM YYYY')}</td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-slate-400">${payment.fees}</td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm"><StatusChip status={payment.confirmationStatus} /></td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-slate-400 font-mono text-xs">{payment.transactionId}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="5" className="px-6 py-16 text-center text-sm text-gray-500 dark:text-slate-400">No payment history found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {filteredPaymentHistory.length > 0 && (
                    <div className="flex items-center justify-between border-t border-gray-200 dark:border-slate-700 px-4 py-3 sm:px-6">
                        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700 dark:text-slate-400">
                                    Showing <span className="font-medium">{page * rowsPerPage + 1}</span> to <span className="font-medium">{Math.min((page + 1) * rowsPerPage, filteredPaymentHistory.length)}</span> of{' '}
                                    <span className="font-medium">{filteredPaymentHistory.length}</span> results
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <select value={rowsPerPage} onChange={handleChangeRowsPerPage} className="rounded-md border-gray-300 bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300 focus:ring-teal-500">
                                    {[5, 10, 25].map(size => (<option key={size} value={size}>Show {size}</option>))}
                                </select>
                                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                    <button onClick={(e) => handleChangePage(e, page - 1)} disabled={page === 0} className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 dark:ring-slate-600 dark:text-slate-400 dark:hover:bg-slate-700"><HiChevronLeft className="h-5 w-5" /></button>
                                    <button onClick={(e) => handleChangePage(e, page + 1)} disabled={page >= Math.ceil(filteredPaymentHistory.length / rowsPerPage) - 1} className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 dark:ring-slate-600 dark:text-slate-400 dark:hover:bg-slate-700"><HiChevronRight className="h-5 w-5" /></button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default PaymentHistory;
