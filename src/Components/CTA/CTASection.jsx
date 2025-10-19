import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom"; // Assuming you use React Router for navigation
import { HiArrowRight, HiOutlineUserGroup } from "react-icons/hi";

const CTASection = () => {
    return (
        // Section wrapper with our primary theme color for high impact
        <div className="bg-teal-700">
            {/* --- CONTENT ALIGNMENT WRAPPER --- */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                <motion.div 
                    className="py-16 sm:py-20 flex flex-col lg:flex-row justify-between items-center gap-8 text-center lg:text-left"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* --- Text Content --- */}
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                            Join Us in Making a Difference
                        </h2>
                        <p className="mt-4 text-lg leading-6 text-teal-100">
                            Whether you're a patient seeking care or a professional 
                            <br className="hidden sm:block" />
                            ready to volunteer, your journey starts here.
                        </p>
                    </div>

                    {/* --- Buttons --- */}
                    <div className="flex-shrink-0 flex flex-col sm:flex-row gap-4">
                        {/* Primary Button (for volunteers) */}
                        <Link
                            to="/sign-up" // Or your volunteer registration page
                            className="flex items-center justify-center gap-2 px-6 py-3 text-base font-medium rounded-lg shadow-md text-teal-700 bg-white hover:bg-gray-50 transition-colors"
                        >
                            <HiOutlineUserGroup className="w-5 h-5" />
                            Become a Volunteer
                        </Link>
                        
                        {/* Secondary Button (for participants) */}
                        <Link
                            to="/available-camps"
                            className="flex items-center justify-center gap-2 px-6 py-3 text-base font-medium rounded-lg text-white bg-teal-600 hover:bg-teal-500 transition-colors"
                        >
                            Find a Camp
                            <HiArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </motion.div>

            </div>
        </div>
    );
};

export default CTASection;