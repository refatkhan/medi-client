import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { HiOutlineLocationMarker, HiOutlineCalendar, HiOutlineUsers } from "react-icons/hi";

const PopularCampsSection = () => {
    // --- All Your Existing Logic (UNCHANGED) ---
    const [camps, setCamps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchCamps = async () => {
            try {
                const res = await axios.get("https://medi-server-ten.vercel.app/camps");
                setCamps(res.data);
            // eslint-disable-next-line no-unused-vars
            } catch (err) {
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        fetchCamps();
    }, []);

    // --- Restyled Loading/Error States (with consistent alignment) ---
    const wrapperClasses = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center";

    if (loading) {
        return (
            <div className={wrapperClasses}>
                <p className="text-lg text-gray-600">Loading popular camps...</p>
                {/* Optional: Add a spinner here */}
            </div>
        );
    }
    if (error) {
        return (
            <div className={wrapperClasses}>
                <p className="text-lg text-red-600">Failed to load camps. Please try again later.</p>
            </div>
        );
    }

    // --- Your Logic (UNCHANGED) ---
    const popularCamps = [...camps]
        .sort((a, b) => b.participants - a.participants)
        .slice(0, 6);

    // --- Animation Variants for Framer Motion ---
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1, // Each card will appear 0.1s after the previous
            },
        },
    };

    const cardVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: 'spring', stiffness: 100 }
        },
    };

    return (
        // Section wrapper with a light background to separate it
        <div className="bg-gray-50 py-16 sm:py-20">
            {/* --- CONTENT ALIGNMENT WRAPPER --- */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* --- Title and Subtitle (Restyled) --- */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-800 sm:text-4xl">
                        Popular Medical Camps
                    </h2>
                    {/* --- New Subtitle --- */}
                    <p className="mt-4 text-lg leading-6 text-gray-600">
                        Join our most attended camps and be part of a healthy community.
                    </p>
                </div>

                {/* --- Camps Grid (Restyled) --- */}
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {popularCamps.map((camp) => (
                        <motion.div
                            key={camp._id}
                            className="flex flex-col bg-white rounded-lg shadow-sm overflow-hidden transition-shadow duration-300 hover:shadow-xl"
                            variants={cardVariants}
                        >
                            {/* --- Image (Cleaner) --- */}
                            <div className="relative h-56 w-full">
                                <img
                                    src={camp.image}
                                    alt={camp.campName}
                                    className="w-full h-full object-cover"
                                />
                                {/* --- Badge for Participants --- */}
                                <div className="absolute top-4 left-4 bg-teal-700 text-white py-1 px-3 rounded-full text-sm font-semibold flex items-center gap-1.5">
                                    <HiOutlineUsers className="w-4 h-4" />
                                    <span>{camp.participants || 0} Participants</span>
                                </div>
                            </div>

                            {/* --- Content (Cleaner: Less Data) --- */}
                            <div className="p-5 flex-1 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-800 mb-3">
                                        {camp.campName}
                                    </h3>
                                    <div className="space-y-2 text-gray-600">
                                        <p className="flex items-center gap-2">
                                            <HiOutlineLocationMarker className="w-5 h-5 text-teal-700" />
                                            <span>{camp.location}</span>
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <HiOutlineCalendar className="w-5 h-5 text-teal-700" />
                                            {/* Formatting date to be more readable */}
                                            <span>{new Date(camp.dateTime).toLocaleDateString()}</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-5">
                                    {/* --- Assumed Details Link (Restyled) --- */}
                                    <Link
                                        to={`/camp-details/${camp._id}`} // Assuming this is your details route
                                        className="font-medium text-teal-700 transition-colors duration-200 hover:text-teal-800"
                                    >
                                        View Details &rarr;
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* --- "See All" Button (Restyled) --- */}
                <div className="text-center mt-12">
                    <Link
                        to="/available-camps"
                        className="inline-block px-8 py-3 rounded-lg text-white bg-teal-700 hover:bg-teal-800 transition-colors duration-300 font-semibold shadow-md hover:shadow-lg"
                    >
                        See All Camps
                    </Link>
                   
                </div>
            </div>
        </div>
    );
};

// Renamed component to reflect it's a "section"
export default PopularCampsSection;