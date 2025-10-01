import React from "react";
import Lottie from "lottie-react";
import { useNavigate } from "react-router";
import animationData from "../../assets/error.json" // download from LottieFiles

export default function ErrorPage() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen  bg-gradient-to-br from-yellow-100 via-yellow-200 to-orange-200 p-4">
      <div className="w-full max-w-md">
        <Lottie animationData={animationData} loop={true} />
      </div>
      <h1 className="text-3xl font-bold mt-6 text-gray-800">Oops! Page Not Found</h1>
      <p className="text-gray-600 mt-2 text-center">
        The page you are looking for does not exist or has been moved.
      </p>
      <button
        onClick={() => navigate("/")}
        className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Go Home
      </button>
    </div>
  );
}
