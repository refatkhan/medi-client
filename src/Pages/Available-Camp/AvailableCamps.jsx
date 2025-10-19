import React, { useState, useEffect } from "react"; // Added useEffect
import { useQuery } from "@tanstack/react-query";
import { Link as RouterLink } from "react-router-dom";
import useAxiosSecure from "../../Hooks/useAxiosSecure";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import {
    HiOutlineSearch,
    HiOutlineViewGrid,
    HiOutlineViewList,
    HiOutlineLocationMarker,
    HiOutlineCalendar,
    HiOutlineUsers,
    HiChevronLeft,
    HiChevronRight
} from "react-icons/hi";
import { CgSpinner } from "react-icons/cg";

// --- Configuration ---
const ITEMS_PER_PAGE = 6;

// --- Reusable Camp Card Component (UNCHANGED) ---
const CampCardDisplay = ({ camp }) => (
    <motion.div
        layout
        className="flex flex-col bg-white rounded-lg shadow-lg overflow-hidden transition-shadow duration-300 hover:shadow-xl h-full"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
    >
        <div className="relative h-56 w-full">
            <img src={camp.image} alt={camp.campName} className="w-full h-full object-cover"/>
            <div className="absolute top-4 left-4 bg-teal-700 text-white py-1 px-3 rounded-full text-sm font-semibold flex items-center gap-1.5">
                <HiOutlineUsers className="w-4 h-4" />
                <span>{camp.participants || 0} Participants</span>
            </div>
        </div>
        <div className="p-5 flex-1 flex flex-col justify-between">
             {/* Content unchanged... */}
             <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">{camp.campName}</h3>
                <div className="space-y-2 text-gray-600 text-sm">
                    <p className="flex items-center gap-2"><HiOutlineLocationMarker className="w-5 h-5 text-teal-700 flex-shrink-0" /><span>{camp.location}</span></p>
                    <p className="flex items-center gap-2"><HiOutlineCalendar className="w-5 h-5 text-teal-700 flex-shrink-0" /><span>{new Date(camp.dateTime).toLocaleDateString()}</span></p>
                    <p className="flex items-center gap-2"><span className="text-teal-700 font-semibold w-5 h-5 flex justify-center items-center flex-shrink-0">$</span><span>{camp.fees}</span></p>
                    <p className="flex items-center gap-2"><span className="text-teal-700 font-semibold w-5 h-5 text-lg flex justify-center items-center flex-shrink-0">👨‍⚕️</span><span>{camp.doctorName}</span></p>
                </div>
            </div>
            <div className="mt-5">
                <RouterLink to={`/camp-details/${camp._id}`} className="inline-block px-4 py-2 rounded-lg text-sm font-medium text-white bg-teal-700 hover:bg-teal-800 transition-colors duration-300 shadow hover:shadow-md">
                    View Details
                </RouterLink>
            </div>
        </div>
    </motion.div>
);

// --- Simple Pagination Component (UNCHANGED) ---
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const handlePrev = () => { if (currentPage > 1) { onPageChange(currentPage - 1); } };
    const handleNext = () => { if (currentPage < totalPages) { onPageChange(currentPage + 1); } };

    if (totalPages <= 1) return null;

    return (
        <div className="mt-10 flex items-center justify-center gap-4">
            <button onClick={handlePrev} disabled={currentPage === 1} className="flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                <HiChevronLeft className="h-4 w-4" /> Previous
            </button>
            <span className="text-sm text-gray-600"> Page {currentPage} of {totalPages} </span>
            <button onClick={handleNext} disabled={currentPage === totalPages} className="flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                Next <HiChevronRight className="h-4 w-4" />
            </button>
        </div>
    );
};

const AvailableCamps = () => {
    // --- State Hooks (Unchanged) ---
    const axiosSecure = useAxiosSecure();
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("default");
    const [layoutColumns, setLayoutColumns] = useState(3);
    const [currentPage, setCurrentPage] = useState(1);

    // --- Data Fetching (Unchanged) ---
    const { data: camps = [], isLoading, isError } = useQuery({
        queryKey: ["available-camps"], // Removed sortBy here if sorting is client-side only
        queryFn: async () => {
            const res = await axiosSecure.get("/available-camps");
            return res.data;
        },
    });

    // --- Filtering and Sorting (Unchanged) ---
    const filteredAndSortedCamps = camps
        .filter(camp =>
            camp.campName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            camp.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
            camp.dateTime.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            if (sortBy === "mostRegistered") return (b.participants || 0) - (a.participants || 0);
            if (sortBy === "campFees") return a.fees - b.fees;
            if (sortBy === "alphabetical") return a.campName.localeCompare(b.campName);
            return 0;
        });

    // --- Pagination Calculations (Slightly more robust) ---
    const totalItems = filteredAndSortedCamps.length;
    // Ensure totalPages is at least 1, prevent NaN if totalItems is 0
    const totalPages = totalItems > 0 ? Math.ceil(totalItems / ITEMS_PER_PAGE) : 1;
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    // Ensure slice doesn't go negative or beyond array length (though slice handles this)
    const paginatedCamps = filteredAndSortedCamps.slice(Math.max(0, startIndex), startIndex + ITEMS_PER_PAGE);

    // --- Effect to Reset Page (More robust check) ---
    useEffect(() => {
        // Calculate potential new total pages based on current filters
        const newTotalPages = Math.ceil(filteredAndSortedCamps.length / ITEMS_PER_PAGE) || 1;
        // If current page is now invalid OR if we are on page 1 already (covers initial load/no results)
        if (currentPage > newTotalPages || currentPage === 1) {
            setCurrentPage(1); // Reset to page 1
        }
        // Dependency array remains the same - runs when filters change
    }, [searchTerm, sortBy, camps]); // Depend on camps data too

    // --- Loading and Error States (Unchanged) ---
    if (isLoading) return (
        <div className="flex min-h-[60vh] items-center justify-center py-20">
            <CgSpinner className="h-12 w-12 animate-spin text-teal-700" />
        </div>
    );
    if (isError) return (
        <div className="flex min-h-[60vh] items-center justify-center py-20">
            <p className="text-lg text-red-600">Failed to load camps.</p>
        </div>
    );

    return (
        <div className="bg-gray-50 py-16 sm:py-20 min-h-screen"> {/* Added min-h-screen */}
            <Helmet>
                <title>Available Camps | MediCamp</title>
                <meta name="description" content="Browse and search for upcoming medical camps organized by MediCamp."/>
            </Helmet>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-800 sm:text-4xl">
                        Available Medical Camps
                    </h2>
                </div>

                {/* --- Controls Section (Unchanged Layout) --- */}
                <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-12 md:items-center">
                     <div className="relative md:col-span-12 lg:col-span-6">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <HiOutlineSearch className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </div>
                        <input type="text" placeholder="Search by name, location, or date..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="block w-full rounded-lg border-gray-300 bg-white py-3 pl-10 pr-3 shadow-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 sm:text-sm"/>
                    </div>
                     <div className="md:col-span-6 lg:col-span-3">
                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="block w-full rounded-lg border-gray-300 bg-white py-3 pl-3 pr-8 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 sm:text-sm">
                            <option value="default">Sort By</option>
                            <option value="mostRegistered">Most Registered</option>
                            <option value="campFees">Camp Fees (Low to High)</option>
                            <option value="alphabetical">Alphabetical Order</option>
                        </select>
                    </div>
                     <div className="flex justify-start md:justify-end space-x-2 md:col-span-6 lg:col-span-3">
                        <button onClick={() => setLayoutColumns(2)} className={`rounded-lg p-2 transition-colors ${ layoutColumns === 2 ? 'bg-teal-700 text-white' : 'bg-white text-gray-500 hover:bg-gray-100 shadow-sm border border-gray-300'}`} aria-label="Set 2 columns"><HiOutlineViewList className="h-6 w-6" /></button>
                        <button onClick={() => setLayoutColumns(3)} className={`rounded-lg p-2 transition-colors ${ layoutColumns === 3 ? 'bg-teal-700 text-white' : 'bg-white text-gray-500 hover:bg-gray-100 shadow-sm border border-gray-300'}`} aria-label="Set 3 columns"><HiOutlineViewGrid className="h-6 w-6" /></button>
                    </div>
                </div>

                {/* --- Camps Grid --- */}
                {/* --- UPDATED: Removed mode="wait" --- */}
                <AnimatePresence>
                    <motion.div
                        key={currentPage} // Animate when page changes
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`grid gap-8 ${
                            layoutColumns === 3
                                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                                : "grid-cols-1 md:grid-cols-2"
                        }`}
                    >
                        {/* Render cards based on pagination */}
                        {paginatedCamps.length > 0 ? (
                             paginatedCamps.map((camp) => (
                                <CampCardDisplay key={camp._id} camp={camp} />
                            ))
                        ) : (
                            // Show message inside the grid area if no results on this page *after* filtering
                            // The main "No camps found" message handles the case of zero results overall
                             !isLoading && filteredAndSortedCamps.length > 0 && currentPage > 1 && (
                                 <p className="text-gray-500 md:col-span-2 lg:col-span-3 text-center py-10">No more camps on this page.</p>
                             )
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* --- No Camps Found Overall Message --- */}
                {!isLoading && filteredAndSortedCamps.length === 0 && (
                    <div className="mt-10 text-center text-gray-500 py-10">
                        No camps found matching your search criteria.
                    </div>
                )}

                {/* --- Pagination Controls --- */}
                {/* Only show pagination if there are items to paginate */}
                {!isLoading && filteredAndSortedCamps.length > 0 && (
                     <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                )}

            </div>
        </div>
    );
};

export default AvailableCamps;