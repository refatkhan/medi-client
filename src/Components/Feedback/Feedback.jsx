import React, { useState, useEffect } from "react"; // Added useState, useEffect
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import dayjs from "dayjs";
import { motion, AnimatePresence } from "framer-motion";
import { FaStar, FaQuoteLeft, FaUserAlt } from "react-icons/fa";

// --- NEW: Custom Hook to get responsive card count ---
// (Tailwind breakpoints: md: 768px, lg: 1024px)
const useResponsiveCards = () => {
    const getCardsPerPage = () => {
        // Return 1 by default if window is not defined (e.g., server-side)
        if (typeof window === 'undefined') {
            return 1;
        }
        if (window.innerWidth >= 1024) { // lg
            return 3;
        }
        if (window.innerWidth >= 768) { // md
            return 2;
        }
        return 1; // mobile
    };

    const [cardsPerPage, setCardsPerPage] = useState(1);

    useEffect(() => {
        // Set the correct value on component mount (client-side)
        setCardsPerPage(getCardsPerPage());

        const handleResize = () => {
            setCardsPerPage(getCardsPerPage());
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []); // Empty array ensures this runs only on mount and unmount

    return cardsPerPage;
};

// --- Helper Component for Star Ratings (UNCHANGED) ---
const StarRating = ({ rating }) => (
    <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, index) => (
            <FaStar
                key={index}
                className={index < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"}
            />
        ))}
    </div>
);

// --- Testimonial Card Design (UNCHANGED) ---
const TestimonialCard = ({ fb }) => (
    <div className="flex h-full flex-col rounded-lg bg-white p-6 shadow-lg">
        <div className="flex-1">
            <FaQuoteLeft className="mb-4 h-6 w-6 text-teal-200" />
            <p className="italic text-gray-700">"{fb.comment}"</p>
        </div>
        <div className="mt-6 border-t border-gray-100 pt-4">
            <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                    <FaUserAlt className="h-5 w-5" />
                </div>
                <div>
                    <p className="font-semibold text-gray-800">{fb.participantEmail.split('@')[0]}</p>
                    <StarRating rating={fb.rating || 0} />
                </div>
            </div>
        </div>
    </div>
);

const Feedback = () => {
    // --- Your Data Fetching Logic (UNCHANGED) ---
    const { data: feedbacks, isLoading, error } = useQuery({
        queryKey: ["feedbacks"],
        queryFn: async () => {
            const res = await axios.get("https://medi-server-ten.vercel.app/feedbacks");
            return res.data;
        },
    });

    // --- State for the current page of testimonials ---
    const [page, setPage] = useState(0);

    // --- FIXED: Use the custom hook ---
    const cardsPerPage = useResponsiveCards();

    // --- FIXED: Autoplay Logic now uses dynamic cardsPerPage ---
    useEffect(() => {
        // Don't autoplay if there aren't enough feedbacks to paginate
        if (!feedbacks || feedbacks.length <= cardsPerPage) return;

        const totalPages = Math.ceil(feedbacks.length / cardsPerPage);

        // Reset page if it's out of bounds (e.g., resizing from 1 card to 3)
        if (page >= totalPages) {
            setPage(0);
        }

        const interval = setInterval(() => {
            setPage((prevPage) => (prevPage + 1) % totalPages);
        }, 5000);

        return () => clearInterval(interval);
    }, [feedbacks, cardsPerPage, page]); // Re-run if cardsPerPage changes

    // --- Loading and Error States (UNCHANGED) ---
    if (isLoading) return (
        <div className="flex min-h-[400px] items-center justify-center py-20">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-t-teal-700 border-gray-200"></div>
        </div>
    );
    if (error) return (
        <div className="flex min-h-[400px] items-center justify-center py-20">
            <p className="text-lg text-red-600">Error fetching feedbacks.</p>
        </div>
    );

    // --- Animation Variants (UNCHANGED) ---
    const gridVariants = {
        enter: { x: "100%", opacity: 0 },
        center: { zIndex: 1, x: 0, opacity: 1 },
        exit: { zIndex: 0, x: "-100%", opacity: 0 },
    };

    // --- FIXED: Pagination logic now uses dynamic cardsPerPage ---
    const startIndex = page * cardsPerPage;
    const paginatedFeedbacks = feedbacks?.slice(startIndex, startIndex + cardsPerPage) || [];

    return (
        <div className="bg-gray-50 py-16 sm:py-20">
            {/* --- CONTENT ALIGNMENT WRAPPER (UNCHANGED) --- */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-800 sm:text-4xl">
                        What Participants Say
                    </h2>
                    <p className="mt-4 text-lg leading-6 text-gray-600">
                        Real feedback from our recent camp attendees.
                    </p>
                </div>

                {feedbacks && feedbacks.length > 0 ? (
                    // --- FIXED: Container height is now flexible ---
                    <div className="relative h-auto min-h-[320px] overflow-hidden">
                        <AnimatePresence initial={false}>
                            <motion.div
                                key={page} // The key change triggers the animation
                                // This grid class is already responsive and correct
                                className="grid h-full grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 absolute inset-0"
                                variants={gridVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{
                                    x: { type: "spring", stiffness: 300, damping: 30 },
                                    opacity: { duration: 0.2 },
                                }}
                            >
                                {paginatedFeedbacks.map((fb) => (
                                    <TestimonialCard key={fb._id} fb={fb} />
                                ))}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                ) : (
                    <p className="text-center text-gray-500">
                        No feedbacks available.
                    </p>
                )}
            </div>
        </div>
    );
};

export default Feedback;