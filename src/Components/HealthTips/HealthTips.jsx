import React from "react";
import { motion } from "framer-motion";
import {
  FaHandsWash, // Replaces HandshakeIcon
  FaStethoscope, // Replaces LocalHospitalIcon
  FaMoon // New icon for sleep
} from "react-icons/fa";
import {
  IoMdWater, // Replaces WaterIcon
  IoIosNutrition, // Replaces RestaurantIcon
  IoMdFitness // Replaces FitnessCenterIcon
} from "react-icons/io";

// --- New Data Array (6 items for a balanced grid) ---
// Icons are now components, and I've added a short description
const healthTips = [
  {
    title: "Wash Hands Regularly",
    description: "Use soap and water to prevent the spread of germs.",
    icon: FaHandsWash,
  },
  {
    title: "Stay Hydrated",
    description: "Drink plenty of water throughout the day for optimal health.",
    icon: IoMdWater,
  },
  {
    title: "Eat a Balanced Diet",
    description: "Focus on fruits, vegetables, lean proteins, and whole grains.",
    icon: IoIosNutrition,
  },
  {
    title: "Get Regular Checkups",
    description: "Visit your doctor for preventive care and early detection.",
    icon: FaStethoscope,
  },
  {
    title: "Exercise Daily",
    description: "Aim for at least 30 minutes of moderate activity each day.",
    icon: IoMdFitness,
  },
  {
    title: "Get Enough Sleep",
    description: "Aim for 7-9 hours of quality sleep per night for recovery.",
    icon: FaMoon,
  },
];

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
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

const HealthTips = () => {
  return (
    // Section wrapper with light grey background
    <div className="bg-gray-50 py-16 sm:py-20">
      {/* --- CONTENT ALIGNMENT WRAPPER --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* --- Title and Subtitle --- */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-gray-800 sm:text-4xl">
           Health Tips & Awareness
          </h2>
          <p className="mt-4 text-lg leading-6 text-gray-600">
            Simple tips to stay healthy and prevent common illnesses.
          </p>
        </div>

        {/* --- Tips Grid (6 items, 3 per line) --- */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {healthTips.map((tip) => (
            <motion.div
              key={tip.title}
              className="p-6 bg-white rounded-lg shadow-lg text-center"
              variants={cardVariants}
            >
              {/* Icon (Restyled with theme color) */}
              <div className="flex justify-center mb-4">
                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-teal-50 text-teal-700">
                  <tip.icon className="w-7 h-7" aria-hidden="true" />
                </div>
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {tip.title}
              </h3>

              {/* Description (Added for value) */}
              <p className="text-base text-gray-600">
                {tip.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </div>
  );
};

export default HealthTips;