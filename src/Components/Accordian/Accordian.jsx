import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiChevronDown } from "react-icons/hi";

// --- Your Default Data (UNCHANGED) ---
const defaultItems = [
    {
        title: "Camp Details",
        content:
            "This camp is held in Dhaka from 10 AM to 4 PM. Make sure to carry your ID and registration confirmation.",
    },
    {
        title: "Payment Information",
        content:
            "You can pay via Stripe, Bkash, or Rocket. Payments must be completed 24 hours before joining the camp.",
    },
    {
        title: "Feedback",
        content:
            "Your feedback matters! Please provide feedback after attending to help us improve future camps.",
    },
    {
        title: "Guidelines",
        content:
            "Follow all safety protocols, wear masks if required, and maintain social distancing during the camp.",
    },
];

// --- Animation variants for the content panel ---
const panelVariants = {
    open: {
        opacity: 1,
        height: "auto",
        transition: { duration: 0.3, ease: "easeInOut" }
    },
    collapsed: {
        opacity: 0,
        height: 0,
        transition: { duration: 0.3, ease: "easeInOut" }
    }
};


const FAQSection = ({ items }) => {
    // --- Your Data Logic (UNCHANGED) ---
    const displayItems = items && items.length > 0 ? items : defaultItems;

    // --- State and Logic (from the old parent) ---
    // We set the first item (index 0) to be open by default
    const [expanded, setExpanded] = useState(0);

    const handleToggle = (index) => {
        // If the clicked item is already open, close it (set to null)
        // Otherwise, open the clicked item
        setExpanded(expanded === index ? null : index);
    };

    return (
        // Section wrapper with clean white background
        <div className="bg-white py-16 sm:py-20">
            {/* --- CONTENT ALIGNMENT WRAPPER --- */}
            <div className="max-w- mx-auto px-4 sm:px-6 lg:px-8">

                {/* --- Title and Subtitle --- */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-800 sm:text-4xl">
                        Frequently Asked Questions
                    </h2>
                    <p className="mt-4 text-lg leading-6 text-gray-600">
                        Find answers to common questions about our medical camps.
                    </p>
                </div>

                {/* --- Accordion List --- */}
                <motion.div
                    className="max-w-7xl mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* --- We map and render the items directly --- */}
                    {displayItems.map((item, index) => {
                        const isOpen = expanded === index;

                        return (
                            <div key={index} className="border-b border-gray-200">

                                {/* --- Header Button (from old child) --- */}
                                <button
                                    onClick={() => handleToggle(index)} // Logic is now direct
                                    className="flex items-center justify-between w-full py-5"
                                >
                                    <span className={`text-lg font-medium text-left ${isOpen ? 'text-teal-700' : 'text-gray-800'
                                        }`}>
                                        {item.title}
                                    </span>

                                    {/* --- Animated Icon (from old child) --- */}
                                    <motion.div
                                        animate={{ rotate: isOpen ? 180 : 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                    >
                                        <HiChevronDown className={`w-6 h-6 ${isOpen ? 'text-teal-700' : 'text-gray-500'
                                            }`} />
                                    </motion.div>
                                </button>

                                {/* --- Animated Content Panel (from old child) --- */}
                                <AnimatePresence initial={false}>
                                    {isOpen && (
                                        <motion.section
                                            key="content"
                                            initial="collapsed"
                                            animate="open"
                                            exit="collapsed"
                                            variants={panelVariants}
                                            className="overflow-hidden"
                                        >
                                            <div className="pb-6 pr-10 text-base text-gray-700">
                                                {item.content}
                                            </div>
                                        </motion.section>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </motion.div>

            </div>
        </div>
    );
};
export default FAQSection;