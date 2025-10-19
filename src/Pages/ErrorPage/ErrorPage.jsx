import React from "react";
import Lottie from "lottie-react";
// Corrected import from 'react-router-dom'
import { useNavigate } from "react-router-dom";
import animationData from "../../assets/error.json" // Assumes this path is correct
import { Helmet } from "react-helmet-async";

export default function ErrorPage() {
  const navigate = useNavigate();

  return (
    // --- 1. CHANGED BACKGROUND ---
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4">
      <Helmet>
        <title>404 - Page Not Found | MediCamp</title>
        <meta name="description" content="The page you are looking for does not exist." />
      </Helmet>

      <div className="w-full max-w-md">
        <Lottie animationData={animationData} loop={true} />
      </div>

      <h1 className="text-3xl font-bold mt-6 text-gray-800">Oops! Page Not Found</h1>
      <p className="text-gray-600 mt-2 text-center">
        The page you are looking for does not exist or has been moved.
      </p>

      {/* --- 2. CHANGED BUTTON COLOR --- */}
      <button
        onClick={() => navigate("/")}
        className="mt-8 cursor-pointer px-8 py-3 bg-teal-700 text-white rounded-lg font-medium hover:bg-teal-800 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
      >
        Go Back Home
      </button>
    </div>
  );
}