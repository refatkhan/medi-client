// src/components/Footer.jsx
import React from "react";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";

const Footer = () => {
    return (
        <footer className="bg-gradient-to-r from-green-600 to-teal-500 text-white py-12">
            <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* About */}
                <div>
                    <h3 className="text-xl font-bold mb-4 hover:text-green-200 transition">MCMS</h3>
                    <p className="text-gray-200 hover:text-gray-100 transition">
                        Medical Camp Management System helps organizers and participants manage and join medical camps easily. Stay healthy, stay informed.
                    </p>
                </div>

                {/* Quick Links */}
                <div>
                    <h3 className="text-xl font-bold mb-4">Quick Links</h3>
                    <ul className="space-y-2">
                        {["Home", "Available Camps", "Dashboard", "Contact"].map((link, idx) => (
                            <li key={idx}>
                                <a
                                    href={`/${link.toLowerCase().replace(/\s+/g, "")}`}
                                    className="hover:underline hover:text-green-200 transition duration-300"
                                >
                                    {link}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Contact Info */}
                <div>
                    <h3 className="text-xl font-bold mb-4">Contact</h3>
                    <ul className="space-y-2 text-gray-200">
                        <li className="flex items-center gap-2 hover:text-green-200 transition duration-300">
                            <FaMapMarkerAlt /> Dhaka, Bangladesh
                        </li>
                        <li className="flex items-center gap-2 hover:text-green-200 transition duration-300">
                            <FaPhoneAlt /> +880 1234 567890
                        </li>
                        <li className="flex items-center gap-2 hover:text-green-200 transition duration-300">
                            <FaEnvelope /> support@mcms.com
                        </li>
                    </ul>
                </div>

                {/* Social Media */}
                <div>
                    <h3 className="text-xl font-bold mb-4">Follow Us</h3>
                    <div className="flex gap-4">
                        {[FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn].map((Icon, idx) => (
                            <a
                                key={idx}
                                href="#"
                                className="p-2 rounded-full bg-white text-green-600 hover:bg-green-600 hover:text-white transform hover:scale-110 transition duration-300"
                            >
                                <Icon />
                            </a>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-8 text-center text-gray-200 text-sm hover:text-green-200 transition duration-300">
                &copy; {new Date().getFullYear()} MCMS. All rights reserved.
            </div>
        </footer>
    );
};

export default Footer;
