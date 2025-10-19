import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAuth from '../Hooks/useAuth'; // Using your consistent hook
import useAxiosSecure from '../Hooks/useAxiosSecure';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { CgSpinner } from 'react-icons/cg';
import { HiOutlineDocumentAdd, HiPencil, HiTrash, HiOutlineSearch, HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';

const ManageCamps = () => {
    // --- YOUR LOGIC (with minor adaptations for Swal) ---
    const { user } = useAuth(); // Use consistent auth hook
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState("");
    
    // Pagination state
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    // --- FIXED: Fetch only the camps for the logged-in organizer ---
    const { data: camps = [], isLoading } = useQuery({
        queryKey: ["organizer-camps", user?.email], // Changed queryKey for specificity
        queryFn: async () => {
            const res = await axiosSecure.get(`/organizer-camps?email=${user.email}`);
            return res.data;
        },
        enabled: !!user?.email, // Only run query if user email is available
    });

    // Delete mutation
    const { mutate: deleteCamp, isPending: isDeleting } = useMutation({
        mutationFn: async (id) => axiosSecure.delete(`/delete-camp/${id}`),
        onSuccess: () => {
            Swal.fire('Deleted!', 'The camp has been deleted.', 'success');
            queryClient.invalidateQueries({ queryKey: ["organizer-camps", user?.email] });
        },
        onError: (error) => {
            Swal.fire('Error!', error.response?.data?.message || 'Failed to delete camp.', 'error');
        },
    });

    const handleDeleteClick = (camp) => {
        Swal.fire({
            title: 'Are you sure?',
            text: `You are about to delete "${camp.campName}". This cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3b82f6',
            confirmButtonText: 'Yes, delete it!',
            background: document.documentElement.classList.contains('dark') ? '#1f2937' : '#fff',
            color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#000',
        }).then((result) => {
            if (result.isConfirmed) {
                deleteCamp(camp._id);
            }
        });
    };
    
    // --- YOUR FILTERING & PAGINATION LOGIC (Unchanged) ---
    const filteredCamps = camps.filter(
        (camp) =>
            camp.campName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            camp.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            camp.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleChangePage = (newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };
    
    const paginatedCamps = filteredCamps.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );
    // --- END OF YOUR LOGIC ---

    if (isLoading) {
        return <div className="flex h-full items-center justify-center"><CgSpinner className="h-12 w-12 animate-spin text-teal-500" /></div>;
    }

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Helmet><title>Manage Camps | MediCamp Dashboard</title></Helmet>

            <div className="rounded-lg bg-white dark:bg-slate-800 shadow-sm">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-gray-200 dark:border-slate-700 p-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">Manage Your Camps</h2>
                        <p className="text-sm text-gray-500 dark:text-slate-400">View, update, or delete your created camps.</p>
                    </div>
                    <div className="flex w-full md:w-auto items-center gap-4">
                        <div className="relative w-full md:w-64">
                             <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                 <HiOutlineSearch className="h-5 w-5 text-gray-400 dark:text-slate-500" />
                             </div>
                             <input type="text" placeholder="Search camps..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                                className="block w-full rounded-lg border-none bg-gray-100 py-2.5 pl-10 pr-3 shadow-inner dark:bg-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 sm:text-sm"/>
                        </div>
                         <Link to="/dashboard/add-camp" className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-teal-700">
                            <HiOutlineDocumentAdd className="h-5 w-5" />
                            <span className="hidden sm:inline">Add Camp</span>
                        </Link>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                        <thead className="bg-gray-50 dark:bg-slate-700/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-slate-400">Camp Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-slate-400">Date & Time</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-slate-400">Location</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-slate-400">Participants</th>
                                <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                            {paginatedCamps.length > 0 ? (
                                paginatedCamps.map((camp) => (
                                    <tr key={camp._id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-slate-200">{camp.campName}</td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-slate-400">{dayjs(camp.dateTime).format('DD MMM YYYY, h:mm A')}</td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-slate-400">{camp.location}</td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-slate-400">{camp.participants}</td>
                                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium space-x-2">
                                            <Link to={`/dashboard/update-camp/${camp._id}`} className="group relative inline-flex items-center justify-center rounded-md p-2 text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-slate-700">
                                                <HiPencil className="h-5 w-5" />
                                                <span className="absolute -top-8 left-1/2 -translate-x-1/2 scale-0 rounded bg-slate-900 px-2 py-1 text-xs text-white transition-all group-hover:scale-100">Update</span>
                                            </Link>
                                            <button onClick={() => handleDeleteClick(camp)} disabled={isDeleting}
                                                className="group relative inline-flex items-center justify-center rounded-md p-2 text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-slate-700 disabled:opacity-50">
                                                <HiTrash className="h-5 w-5" />
                                                <span className="absolute -top-8 left-1/2 -translate-x-1/2 scale-0 rounded bg-slate-900 px-2 py-1 text-xs text-white transition-all group-hover:scale-100">Delete</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-16 text-center text-sm text-gray-500 dark:text-slate-400">
                                        You haven't added any camps yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {filteredCamps.length > rowsPerPage && (
                    <div className="flex items-center justify-between border-t border-gray-200 dark:border-slate-700 px-4 py-3 sm:px-6">
                         <div className="flex flex-1 justify-between sm:hidden">
                            <button onClick={() => handleChangePage(page - 1)} disabled={page === 0} className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-600">Previous</button>
                            <button onClick={() => handleChangePage(page + 1)} disabled={page >= Math.ceil(filteredCamps.length / rowsPerPage) - 1} className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-600">Next</button>
                        </div>
                        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700 dark:text-slate-400">
                                    Showing <span className="font-medium">{page * rowsPerPage + 1}</span> to <span className="font-medium">{Math.min((page + 1) * rowsPerPage, filteredCamps.length)}</span> of{' '}
                                    <span className="font-medium">{filteredCamps.length}</span> results
                                </p>
                            </div>
                            <div>
                                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                    <button onClick={() => handleChangePage(page - 1)} disabled={page === 0} className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 dark:ring-slate-600 dark:text-slate-400 dark:hover:bg-slate-700">
                                        <span className="sr-only">Previous</span>
                                        <HiChevronLeft className="h-5 w-5" aria-hidden="true" />
                                    </button>
                                    {/* Page numbers could be added here if needed */}
                                    <button onClick={() => handleChangePage(page + 1)} disabled={page >= Math.ceil(filteredCamps.length / rowsPerPage) - 1} className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 dark:ring-slate-600 dark:text-slate-400 dark:hover:bg-slate-700">
                                        <span className="sr-only">Next</span>
                                        <HiChevronRight className="h-5 w-5" aria-hidden="true" />
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default ManageCamps;

