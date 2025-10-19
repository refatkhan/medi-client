import React from "react";
import { useNavigate } from "react-router-dom"; // Corrected import to react-router-dom
import { motion } from "framer-motion";
import { HiOutlineShieldCheck, HiOutlineHeart } from "react-icons/hi";
import { FaRegHospital } from "react-icons/fa"; // A good replacement for LocalHospitalIcon

// --- Feature List ---
// This makes the component cleaner by separating data from markup
const features = [
    {
        icon: HiOutlineShieldCheck,
        title: "Free Check-ups",
        description: "Early detection and comprehensive care for all.",
    },
    {
        icon: FaRegHospital,
        title: "Vaccinations",
        description: "Protecting communities with essential vaccines.",
    },
    {
        icon: HiOutlineHeart,
        title: "Health Awareness",
        description: "Promoting healthy lifestyles and well-being.",
    },
];

const AboutUs = () => {
    // --- Your Logic (UNCHANGED) ---
    const navigate = useNavigate();

    return (
        // Section wrapper with a clean white background
        <div className="bg-white py-16 sm:py-20">
            {/* --- CONTENT ALIGNMENT WRAPPER --- */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* --- 2-Column Grid Layout --- */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                    {/* --- Left Column: Text Content --- */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.6 }}
                    >
                        {/* Title */}
                        <h2 className="text-3xl font-bold tracking-tight text-gray-800 sm:text-4xl">
                            About MediCamp
                        </h2>

                        {/* --- New Subtitle (as requested) --- */}
                        <p className="mt-4 text-xl text-gray-600">
                            Bringing healthcare directly to communities that need it most.
                        </p>

                        {/* Main Paragraph (from your code, left-aligned for readability) */}
                        <p className="mt-6 text-lg leading-7 text-gray-700">
                            Our medical camps provide check-ups, vaccinations, and
                            life-saving treatments — giving hope and smiles to
                            thousands every year. We are committed to making a difference,
                            one camp at a time.
                        </p>

                        {/* --- CTA Button (Restyled) --- */}
                        <motion.button
                            onClick={() => navigate("/available-camps")} // Your logic
                            className="mt-10 inline-flex items-center gap-2 px-8 py-3 text-base font-medium text-white bg-teal-700 rounded-lg shadow-sm hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Join Our Next Camp
                        </motion.button>
                    </motion.div>

                    {/* --- Right Column: Features --- */}
                    <motion.div
                        className="space-y-8"
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        {features.map((feature) => (
                            // Feature Item
                            <div key={feature.title} className="flex gap-4">
                                {/* Icon (Restyled) */}
                                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                                    <feature.icon className="w-6 h-6" aria-hidden="true" />
                                </div>
                                {/* Text */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800">
                                        {feature.title}
                                    </h3>
                                    <p className="mt-1 text-base text-gray-600">
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </motion.div>

                </div>
            </div>
        </div>
    );
};

export default AboutUs;