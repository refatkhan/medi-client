import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const CampCard = () => {
    const [camps, setCamps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchCamps = async () => {
            try {
                const res = await axios.get("https://medi-server-ten.vercel.app/camps");
                setCamps(res.data);
            // eslint-disable-next-line no-unused-vars
            } catch (err) {
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        fetchCamps();
    }, []);

    if (loading) {
        return <p className="text-center py-10">Loading camps...</p>;
    }
    if (error) {
        return <p className="text-center text-red-500 py-10">Failed to load camps.</p>;
    }
    const popularCamps = [...camps]
        .sort((a, b) => b.participants - a.participants)
        .slice(0, 6);

    return (
        <div className="max-w-6xl mx-auto px-4 py-10">
            {/* Gradient Header */}
            <h2 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-pink-500 via-orange-500 to-pink-600 bg-clip-text text-transparent animate-pulse">
                Popular Medical Camps
            </h2>

            {/* Camps Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
                {popularCamps.map((camp, index) => (
                    <div
                        key={camp._id}
                        className="w-full max-w-sm bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden transform transition duration-300 hover:-translate-y-2 hover:shadow-lg"
                        style={{ animationDelay: `${index * 200}ms` }}
                    >
                        {/* Image */}
                        <div className="h-48 overflow-hidden">
                            <img
                                src={camp.image}
                                alt={camp.campName}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Content */}
                        <div className="p-4 flex flex-col h-full">
                            <h3 className="text-lg font-semibold text-blue-600 mb-2">
                                {camp.campName}
                            </h3>
                            <p className="text-sm text-gray-600">📍 {camp.location}</p>
                            <p className="text-sm text-gray-600">💰 ${camp.fees}</p>
                            <p className="text-sm text-gray-600">🗓️ {camp.dateTime}</p>
                            <p className="text-sm text-gray-600">👨‍⚕️ {camp.doctorName}</p>
                            <p className="text-sm font-medium text-green-600">
                                👥 {camp.participants || 0} Participants
                            </p>
                            <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                                {camp.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Button */}
            <div className="text-center mt-8">
                <Link
                    to="/available-camps"
                    className="px-6 py-2 rounded-lg text-white bg-gradient-to-r from-orange-500 to-pink-600 hover:scale-105 transition"
                >
                    See All Camps
                </Link>
            </div>
        </div>
    );
};

export default CampCard;
