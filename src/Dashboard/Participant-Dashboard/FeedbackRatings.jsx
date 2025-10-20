import React from 'react';
import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from '../../Hooks/useAxiosSecure';
import useAuth from '../../Hooks/useAuth';
import { Helmet } from 'react-helmet-async';
import { CgSpinner } from 'react-icons/cg';
import { HiOutlineAnnotation, HiOutlineChatAlt2 } from 'react-icons/hi';
import { FaStar } from 'react-icons/fa';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';

// Simple component to display stars (not for input)
const StarDisplay = ({ rating }) => (
    <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, index) => (
            <FaStar
                key={index}
                className={`h-4 w-4 ${index < rating ? "text-yellow-400" : "text-gray-300 dark:text-slate-600"}`}
            />
        ))}
    </div>
);

const FeedbackRatings = () => {
    const { user } = useAuth();
    const axiosSecure = useAxiosSecure();

    // Fetch feedback submitted by the current user
    const { data: feedbacks = [], isLoading, isError, error } = useQuery({
        queryKey: ["my-feedbacks", user?.email],
        queryFn: async () => {
            const res = await axiosSecure.get(`/participant-feedbacks?email=${user.email}`);
            return res.data;
        },
        enabled: !!user?.email,
    });

    if (isLoading) {
        return <div className="flex h-full items-center justify-center"><CgSpinner className="h-12 w-12 animate-spin text-teal-500" /></div>;
    }

    if (isError) {
        return <div className="text-center text-red-500 dark:text-red-400">Error fetching your feedback: {error.message}</div>;
    }

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Helmet>
                <title>My Feedback | MediCamp Dashboard</title>
            </Helmet>

            <div className="rounded-lg bg-white dark:bg-slate-800 shadow-sm">
                {/* Header */}
                <div className="flex items-center gap-4 border-b border-gray-200 dark:border-slate-700 p-6">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-600 dark:bg-slate-700 dark:text-teal-400">
                        <HiOutlineAnnotation className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">My Feedback & Ratings</h2>
                        <p className="text-sm text-gray-500 dark:text-slate-400">A history of all the feedback you've submitted.</p>
                    </div>
                </div>

                {/* Feedback List */}
                <div className="p-6">
                    {feedbacks.length > 0 ? (
                        <div className="space-y-4">
                            {feedbacks.map((feedback) => (
                                <div key={feedback._id} className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-slate-700 dark:bg-slate-700/50">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <p className="font-semibold text-gray-800 dark:text-slate-100">{feedback.campName}</p>
                                            <p className="text-xs text-gray-500 dark:text-slate-400">
                                                Submitted on {dayjs(feedback.submittedAt).format('DD MMM YYYY')}
                                            </p>
                                        </div>
                                        <div className="mt-2 sm:mt-0">
                                            <StarDisplay rating={feedback.rating} />
                                        </div>
                                    </div>
                                    {feedback.comment && (
                                        <p className="mt-3 text-sm text-gray-600 dark:text-slate-300 border-t border-gray-200 dark:border-slate-600 pt-3">
                                            "{feedback.comment}"
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <HiOutlineChatAlt2 className="h-16 w-16 text-gray-300 dark:text-slate-600" />
                            <p className="mt-4 font-semibold text-gray-700 dark:text-slate-200">No Feedback Submitted Yet</p>
                            <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">After attending and paying for a camp, you can submit feedback.</p>
                            <Link to="/dashboard/registered-camps" className="mt-4 rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-teal-700">
                                View My Camps
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default FeedbackRatings;
