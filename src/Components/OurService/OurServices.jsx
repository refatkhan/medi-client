import React from "react";
import { motion } from "framer-motion";
import { FaStethoscope, FaTooth, FaRegEye, FaHandHoldingHeart } from "react-icons/fa";
import { HiOutlineShieldCheck } from "react-icons/hi";
import { IoIosNutrition } from "react-icons/io";

// --- Data for the services ---
// This makes it easy to manage your content
const servicesList = [
    {
        icon: FaStethoscope,
        title: "Free Health Check-ups",
        description: "Comprehensive general health assessments to monitor and maintain your well-being."
    },
    {
        icon: FaTooth,
        title: "Dental Care",
        description: "Basic dental screenings, cleanings, and consultations for oral health."
    },
    {
        icon: FaRegEye,
        title: "Eye Examinations",
        description: "Vision tests and screenings for common eye conditions by certified optometrists."
    },
    {
        icon: HiOutlineShieldCheck,
        title: "Vaccinations",
        description: "Providing essential immunizations to protect against preventable diseases."
    },
    {
        icon: FaHandHoldingHeart,
        title: "Blood Donation Drive",
        description: "Organized drives for voluntary blood donation to support local hospitals and save lives."
    },
    {
        icon: IoIosNutrition,
        title: "Nutritional Counseling",
        description: "Guidance from dietitians on healthy eating habits and managing dietary needs."
    }
];

// --- Animation Variants ---
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1, // Each card will animate 0.1s after the previous
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: "spring", stiffness: 100 }
    },
};

const OurServices = () => {
    return (
        // Section wrapper with a light grey background to alternate
        <div id="services" className="bg-gray-50 py-16 sm:py-20">
            {/* --- CONTENT ALIGNMENT WRAPPER --- */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* --- Title and Subtitle --- */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-800 sm:text-4xl">
                        Our Services
                    </h2>
                    <p className="mt-4 text-lg leading-6 text-gray-600">
                        Comprehensive care provided at every camp.
                    </p>
                </div>

                {/* --- 6-Card Grid (using the same consistent style) --- */}
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                >
                    {servicesList.map((service) => (
                        <motion.div
                            key={service.title}
                            className="p-6 bg-white rounded-lg shadow-lg text-center"
                            variants={itemVariants}
                        >
                            {/* --- Icon (with theme color) --- */}
                            <div className="flex justify-center mb-4">
                                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-teal-50 text-teal-700">
                                    <service.icon className="w-7 h-7" aria-hidden="true" />
                                </div>
                            </div>

                            {/* --- Title --- */}
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                {service.title}
                            </h3>

                            {/* --- Description --- */}
                            <p className="text-base text-gray-600">
                                {service.description}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>

            </div>
        </div>
    );
};

export default OurServices;