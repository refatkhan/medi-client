import React, { useContext, useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, Navigate, useLocation } from "react-router-dom"; // Added useLocation
import useAxiosSecure from "../../Hooks/useAxiosSecure";
import CampsJoinModal from "../../Components/Modal/CampsJoinModal"; // Verify this path
import { AuthContext } from "../../Provider/AuthProvider";
import { Helmet } from "react-helmet-async";
import { CgSpinner } from "react-icons/cg";
import {
    HiOutlineCalendar, HiOutlineLocationMarker, HiOutlineUsers,
    HiOutlineCurrencyDollar, HiOutlineInformationCircle, HiOutlineClipboardList,
    HiOutlineClock, HiOutlineDocumentText, HiOutlineUserCircle, HiOutlineExclamationCircle
} from "react-icons/hi";
import { FaStethoscope } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

// Main Component
const CampDetails = () => {
    // --- State & Hooks ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { user } = useContext(AuthContext); // User from context
    const { id } = useParams(); // Get camp ID from URL
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    const location = useLocation(); // Get location for potential redirects
    const [activeTab, setActiveTab] = useState('overview'); // Default tab

    // --- Data Fetching ---
    // Fetch Camp Details
    const { data: camp, isLoading: campLoading, isError: campError, refetch: refetchCamp } = useQuery({
        queryKey: ["campDetails", id],
        queryFn: async () => {
            if (!id) return null;
            const res = await axiosSecure.get(`/available-camps/${id}`);
            return res.data;
        },
        enabled: !!id,
    });

    // Fetch User Role (only if user is logged in)
    const { data: userRole, isLoading: roleLoading, isError: roleError } = useQuery({
        queryKey: ["userRole", user?.email],
        queryFn: async () => {
            if (!user?.email) return null;
            try {
                const res = await axiosSecure.get(`/users/role/${user?.email}`);
                return res.data; // e.g., { role: 'organizer' } or { role: 'user' }
            } catch (error) {
                console.error("Error fetching user role:", error);
                return null; // Handle error case
            }
        },
        enabled: !!user?.email,
    });

    // Fetch Join Status (only if user is logged in and camp details loaded)
    const { data: hasJoinedQueryData, isLoading: joinStatusLoading, isError: joinStatusError } = useQuery({
        queryKey: ['joinStatus', user?.email, id],
        queryFn: async () => {
            if (!user?.email || !id) return false;
            try {
                const res = await axiosSecure.get(`/check-join-status?email=${user.email}&campId=${id}`);
                return res.data.joined; // true or false
            } catch (error) {
                console.error("Error checking join status:", error);
                return false;
            }
        },
        enabled: !!user?.email && !!id && !campLoading, // Only run when all prerequisites met
        initialData: false, // Default assumption
    });

    // --- Combined Loading State ---
    const isLoading = campLoading || (!!user && (roleLoading || joinStatusLoading));

    // --- Combined Error State ---
    const isError = campError || (!!user && (roleError || joinStatusError));

    // --- Loading Display ---
    if (isLoading) {
        return (
            <div className="flex min-h-[calc(100vh-200px)] items-center justify-center py-20"> {/* Adjusted min-height */}
                <CgSpinner className="h-16 w-16 animate-spin text-teal-700" /> {/* Larger spinner */}
            </div>
        );
    }

    // --- Error Display ---
    if (isError || !camp?._id) {
        return (
            <div className="flex min-h-[calc(100vh-200px)] flex-col items-center justify-center py-20 text-center px-4"> {/* Adjusted min-height */}
                <HiOutlineExclamationCircle className="h-20 w-20 text-red-400 mb-4" />
                <p className="text-2xl font-semibold text-red-600 mb-2">Could Not Load Camp Details</p>
                <p className="text-gray-600 max-w-md">
                    We couldn't fetch the details for this camp. It might not exist, or there might have been a network issue. Please try again later or contact support.
                </p>
                {/* Optional button to go back */}
                <button
                    onClick={() => window.history.back()} // Simple back navigation
                    className="mt-6 rounded-md bg-teal-700 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                >
                    Go Back
                </button>
            </div>
        );
    }

    // --- Button Logic ---
    const isOrganizer = userRole?.role === "organizer";
    const hasJoined = hasJoinedQueryData === true;
    const isDisabled = hasJoined || isOrganizer || !user; // Disable if not logged in too

    let buttonText = "Join Camp";
    let buttonClasses = "bg-teal-700 hover:bg-teal-800 focus:ring-teal-500"; // Default style
    if (!user) {
        buttonText = "Login to Join";
        buttonClasses = "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"; // Style for login prompt
        // Make the button navigate to login instead of opening modal
    } else if (hasJoined) {
        buttonText = "Already Joined";
        buttonClasses = "bg-gray-400 cursor-not-allowed";
    } else if (isOrganizer) {
        buttonText = "Organizer View (Cannot Join)";
        buttonClasses = "bg-red-500 cursor-not-allowed";
    }

    const handleJoinClick = () => {
        if (!user) {
            // Redirect to login page, passing the current page as 'from' state
            navigate('/sign-in', { state: { from: location } });
        } else if (!isDisabled) {
            setIsModalOpen(true);
        }
    }

    // --- Tab Data & Animation ---
    const tabs = [
        { id: 'overview', label: 'Overview', icon: HiOutlineInformationCircle },
        { id: 'services', label: 'Services', icon: HiOutlineClipboardList },
        { id: 'schedule', label: 'Schedule', icon: HiOutlineClock },
        { id: 'requirements', label: 'Requirements', icon: HiOutlineDocumentText },
    ];

    const tabContentVariants = {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeInOut" } },
        exit: { opacity: 0, y: -10, transition: { duration: 0.2, ease: "easeInOut" } }
    };

    return (
        <div className="bg-gray-50 py-16 sm:py-20">
            <Helmet>
                <title>{camp.campName} | MediCamp</title>
                <meta name="description" content={`Details for the ${camp.campName} medical camp including date, location, services, and how to join.`} />
            </Helmet>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    className="bg-white rounded-xl shadow-xl overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* --- Image --- */}
                    {camp.image && (
                        <div className="h-64 md:h-80 w-full">
                            <img src={camp.image} alt={camp.campName} className="w-full h-full object-cover" />
                        </div>
                    )}

                    {/* --- Top Details Section --- */}
                    <div className="p-6 md:p-8 border-b border-gray-200">
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-6">{camp.campName}</h1>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 text-gray-700"> {/* Increased gap-y */}
                            {/* Date & Time */}
                            <div className="flex items-start gap-3">
                                <HiOutlineCalendar className="w-6 h-6 text-teal-600 flex-shrink-0 mt-0.5" />
                                <div><span className="font-semibold block text-gray-800">Date & Time</span><span className="text-gray-600">{new Date(camp.dateTime).toLocaleString([], { dateStyle: 'long', timeStyle: 'short' })}</span></div>
                            </div>
                            {/* Location */}
                            <div className="flex items-start gap-3">
                                <HiOutlineLocationMarker className="w-6 h-6 text-teal-600 flex-shrink-0 mt-0.5" />
                                <div><span className="font-semibold block text-gray-800">Location</span><span className="text-gray-600">{camp.location}</span></div>
                            </div>
                            {/* Fees */}
                            <div className="flex items-start gap-3">
                                <HiOutlineCurrencyDollar className="w-6 h-6 text-teal-600 flex-shrink-0 mt-0.5" />
                                <div><span className="font-semibold block text-gray-800">Fees</span><span className="text-gray-600">${camp.fees}</span></div>
                            </div>
                            {/* Doctor */}
                            <div className="flex items-start gap-3">
                                <FaStethoscope className="w-6 h-6 text-teal-600 flex-shrink-0 mt-0.5" />
                                <div><span className="font-semibold block text-gray-800">Specialized Doctor</span><span className="text-gray-600">{camp.doctorName}</span></div>
                            </div>
                            {/* Participants */}
                            <div className="flex items-start gap-3 sm:col-span-2"> {/* Span across columns */}
                                <HiOutlineUsers className="w-6 h-6 text-teal-600 flex-shrink-0 mt-0.5" />
                                <div><span className="font-semibold block text-gray-800">Registered Participants</span><span className="text-gray-600">{camp.participants || 0}</span></div>
                            </div>
                        </div>
                    </div>

                    {/* --- Tab Navigation --- */}
                    <div className="border-b border-gray-200 bg-gray-50">
                        <nav className="flex space-x-1 px-4 sm:px-6 lg:px-8 -mb-px overflow-x-auto" aria-label="Tabs">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`group flex items-center gap-2 whitespace-nowrap py-3 px-4 rounded-t-md font-medium text-sm transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1 cursor-pointer ${activeTab === tab.id
                                            ? 'bg-white text-teal-700 shadow-sm'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-teal-600' : 'text-gray-400 group-hover:text-gray-500'}`} />
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* --- Tab Content --- */}
                    <div className="p-6 md:p-8 min-h-[250px]"> {/* Increased min-height */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab} // Animate when the active tab changes
                                variants={tabContentVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                            >
                                {/* Overview Tab */}
                                {activeTab === 'overview' && (
                                    <div className="space-y-5 text-gray-600 leading-relaxed">
                                        <h2 className="text-xl font-semibold text-gray-800 -mt-1 mb-3">Overview</h2>
                                        <p className="whitespace-pre-wrap">{camp.description || "No description available."}</p>
                                        {camp.targetAudience && (<div><h3 className="text-md font-semibold text-gray-700 mt-4 mb-1">Target Audience:</h3><p>{camp.targetAudience}</p></div>)}
                                        {camp.organizerInfo?.name && (<div><h3 className="text-md font-semibold text-gray-700 mt-4 mb-1">Organized By:</h3><p>{camp.organizerInfo.name} ({camp.organizerInfo.contact})</p></div>)}
                                        {camp.additionalInfo && (<div><h3 className="text-md font-semibold text-gray-700 mt-4 mb-1">Important Notes:</h3><p className="whitespace-pre-wrap">{camp.additionalInfo}</p></div>)}
                                    </div>
                                )}
                                {/* Services Tab */}
                                {activeTab === 'services' && (
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Services Offered</h2>
                                        {camp.detailedServices && camp.detailedServices.length > 0 ? (
                                            <ul className="list-disc list-outside text-gray-600 space-y-2 pl-5">
                                                {camp.detailedServices.map((service, index) => (<li key={index}>{service}</li>))}
                                            </ul>
                                        ) : (<p className="text-gray-500 italic">Specific services list not provided for this camp.</p>)}
                                    </div>
                                )}
                                {/* Schedule Tab */}
                                {activeTab === 'schedule' && (
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Camp Schedule</h2>
                                        {camp.schedule && camp.schedule.length > 0 ? (
                                            <ul className="space-y-3 text-gray-600 border-l-2 border-teal-200 pl-4">
                                                {camp.schedule.map((item, index) => (
                                                    <li key={index} className="flex flex-col sm:flex-row sm:gap-4 relative before:absolute before:left-[-1.1rem] before:top-2 before:w-3 before:h-3 before:bg-teal-600 before:rounded-full">
                                                        <span className="font-semibold text-gray-800 w-28 flex-shrink-0">{item.time}</span>
                                                        <span>{item.activity}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (<p className="text-gray-500 italic">Detailed schedule not available for this camp.</p>)}
                                    </div>
                                )}
                                {/* Requirements Tab */}
                                {activeTab === 'requirements' && (
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Requirements</h2>
                                        {camp.requiredDocuments && camp.requiredDocuments.length > 0 ? (
                                            <ul className="list-disc list-outside text-gray-600 space-y-2 pl-5">
                                                {camp.requiredDocuments.map((doc, index) => (<li key={index}>{doc}</li>))}
                                            </ul>
                                        ) : (<p className="text-gray-500 italic">No specific requirements listed for participants.</p>)}
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* --- Join Button Section --- */}
                    <div className="p-6 md:p-8 border-t border-gray-200 text-center">
                        <button
                            onClick={handleJoinClick} // Use unified click handler
                            disabled={isDisabled && user} // Disable only if logged in and conditions met
                            className={`inline-flex items-center justify-center rounded-lg border border-transparent px-8 py-3 text-base font-medium text-white shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${buttonClasses} ${isDisabled && user ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {buttonText}
                        </button>
                        {/* Helper text for why button might be disabled */}
                        {isDisabled && user && (
                            <p className="mt-2 text-xs text-gray-500">
                                {hasJoined ? "You have already registered for this camp." : "Organizers cannot join camps."}
                            </p>
                        )}
                        {!user && (
                            <p className="mt-2 text-xs text-gray-500">
                                Please log in to register for this camp.
                            </p>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* --- Modal --- */}
            {camp?._id && user && (
                <CampsJoinModal
                    visible={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    camp={camp}
                    user={user} // Pass the user object
                    onJoined={() => {
                        setIsModalOpen(false);
                        // Invalidate queries to refetch data after joining
                        queryClient.invalidateQueries({ queryKey: ['joinStatus', user?.email, id] });
                        queryClient.invalidateQueries({ queryKey: ["campDetails", id] });
                    }}
                />
            )}
        </div>
    );
};

export default CampDetails;