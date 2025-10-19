import React from "react";
import { Link } from "react-router-dom"; // Use Link for internal navigation
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";

// --- Data arrays for clean mapping ---
const quickLinks = [
    { name: "Home", href: "/" },
    { name: "Available Camps", href: "/available-camps" },
    { name: "Dashboard", href: "/dashboard" }, // Assuming a generic dashboard link
    { name: "Contact", href: "/contact" },
];

const contactInfo = [
    { icon: FaMapMarkerAlt, text: "Dhaka, Bangladesh" },
    { icon: FaPhoneAlt, text: "+880 1234 567890" },
    { icon: FaEnvelope, text: "support@mcms.com" },
];

const socialLinks = [
    { icon: FaFacebookF, href: "#" },
    { icon: FaTwitter, href: "#" },
    { icon: FaInstagram, href: "#" },
    { icon: FaLinkedinIn, href: "#" },
];


const Footer = () => {
    return (
        // Dark background for a professional look
        <footer className="bg-gray-800 text-gray-300">
            {/* --- CONTENT ALIGNMENT WRAPPER --- */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* --- Top Section with Columns --- */}
                <div className="py-16 grid grid-cols-1 md:grid-cols-12 gap-8">

                    {/* Column 1: About (Larger) */}
                    <div className="md:col-span-5">
                        {/* Logo from Navbar for consistency */}
                        <div className="mb-4">
                            <span className="text-2xl font-bold text-white">
                                Medi<span className="text-teal-500">Camp</span>
                            </span>
                        </div>
                        <p className="text-base">
                            Medical Camp Management System helps organizers and participants manage and join medical camps easily. Stay healthy, stay informed.
                        </p>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div className="md:col-span-3 md:justify-self-center">
                        <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            {quickLinks.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        to={link.href}
                                        className="hover:text-teal-500 transition-colors duration-300"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 3: Contact */}
                    <div className="md:col-span-4">
                        <h3 className="text-lg font-semibold text-white mb-4">Contact</h3>
                        <ul className="space-y-3">
                            {contactInfo.map((item, index) => (
                                <li key={index} className="flex items-center gap-3">
                                    <item.icon className="w-5 h-5 text-teal-500 flex-shrink-0" />
                                    <span>{item.text}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                </div>

                {/* --- Bottom Section (Copyright & Socials) --- */}
                <div className="mt-8 py-6 border-t border-gray-700 flex flex-col sm:flex-row justify-between items-center">

                    {/* Copyright */}
                    <p className="text-sm text-gray-400">
                        &copy; {new Date().getFullYear()} MCMS. All rights reserved.
                    </p>

                    {/* Social Icons (Restyled) */}
                    <div className="flex gap-4 mt-4 sm:mt-0">
                        {socialLinks.map((social, index) => (
                            <a
                                key={index}
                                href={social.href}
                                className="text-gray-400 hover:text-teal-500 transition-colors duration-300"
                            >
                                <social.icon className="w-5 h-5" />
                                <span className="sr-only">{social.icon.displayName}</span>
                            </a>
                        ))}
                    </div>
                </div>

            </div>
        </footer>
    );
};

export default Footer;