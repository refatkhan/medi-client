import React from "react";
import { motion } from "framer-motion";
import { HiOutlineSearch, HiOutlinePencilAlt, HiOutlineClipboardCheck } from "react-icons/hi";

// --- Data for the steps ---
// This makes it easy to add or change steps later
const steps = [
    {
        icon: HiOutlineSearch,
        title: "1. Find a Camp",
        description: "Browse our list of upcoming medical camps and find one that's convenient for you."
    },
    {
        icon: HiOutlinePencilAlt,
        title: "2. Register Online",
        description: "Sign up with your details to secure your spot. It's quick, easy, and free."
    },
    {
        icon: HiOutlineClipboardCheck,
        title: "3. Attend & Get Care",
        description: "Visit the camp on the scheduled date and get the health services you need."
    }
];

// --- Animation Variants ---
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2, // Each step will animate 0.2s after the previous
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


const HowItWorks = () => {
    return (
        // Section wrapper with a clean white background
        <div className="bg-white py-16 sm:py-20">
            {/* --- CONTENT ALIGNMENT WRAPPER --- */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* --- Title and Subtitle --- */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-800 sm:text-4xl">
                        How It Works
                    </h2>
                    <p className="mt-4 text-lg leading-6 text-gray-600">
                        Get started in just three simple steps.
                    </p>
                </div>

                {/* --- 3-Step Grid --- */}
                {/* This div adds the dotted line connector between cards on desktop
                  It's a pseudo-element, so it won't show on mobile (lg:block)
                */}
                <div className="relative">
                    <div
                        className="hidden lg:block absolute left-0 right-0 top-1/2 -translate-y-1/2"
                        aria-hidden="true"
                    >
                        <div className="border-t-2 border-dashed border-gray-300 w-2/3 mx-auto"></div>
                    </div>

                    <motion.div
                        className="relative grid grid-cols-1 md:grid-cols-3 gap-12"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                    >
                        {steps.map((step) => (
                            <motion.div
                                key={step.title}
                                className="text-center p-6"
                                variants={itemVariants}
                            >
                                {/* --- Icon (with theme color) --- */}
                                <div className="flex justify-center mb-4">
                                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-teal-50 text-teal-700 ring-8 ring-white z-10">
                                        <step.icon className="w-8 h-8" aria-hidden="true" />
                                    </div>
                                </div>

                                {/* --- Title --- */}
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                    {step.title}
                                </h3>

                                {/* --- Description --- */}
                                <p className="text-base text-gray-600">
                                    {step.description}
                                </p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>

            </div>
        </div>
    );
};

export default HowItWorks;