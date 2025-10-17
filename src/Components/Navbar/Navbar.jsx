import React, { useContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../Provider/AuthProvider";
import { toast } from "react-toastify";
import logo from '../../assets/logo.png'; // Your logo import
import useUserRole from "../../Hooks/useUserRole";
import { motion, AnimatePresence } from 'framer-motion';

// --- Icons from react-icons ---
import {
    HiMenu,
    HiX,
    HiOutlineLogin,
    HiOutlineUserAdd
} from "react-icons/hi";
import {
    BiLogOutCircle,
    BiLayout,
    BiUserCircle
} from "react-icons/bi";


const Navbar = () => {
    // --- All Your Existing Logic (UNCHANGED) ---
    const { role } = useUserRole();
    const { user, logOut } = useContext(AuthContext);
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const handleLogOut = () => {
        logOut()
            .then(() => toast.success("Sign out successfully"))
            .catch((error) => toast.error(error.message));
        setIsProfileOpen(false); // Close dropdown
    };

    const handleDashboardNavigate = () => {
        if (role === "user") {
            navigate("/dashboard/analytics");
        } else {
            navigate("/dashboard/organizer-profile");
        }
        setIsProfileOpen(false); // Close dropdown
    };

    // --- State for Mobile & Profile Menus ---
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // --- Navigation Links ---
    const navLinks = [
        { text: 'Home', href: '/', show: true },
        { text: 'Available Camps', href: '/available-camps', show: !!user },
        { text: 'Services', href: '/services', show: true },
        { text: 'About Us', href: '/about', show: true },
        { text: 'Contact', href: '/contact', show: true },
        { text: 'Join Us', href: '/sign-in', show: !user }
    ];

    // Animation variants for dropdowns
    const dropdownVariants = {
        open: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { type: 'spring', stiffness: 300, damping: 20 },
        },
        closed: {
            opacity: 0,
            y: -10,
            scale: 0.95,
            transition: { duration: 0.1 },
        },
    };

    // --- Color Classes ---
    const primaryColor = "text-teal-700";
    const primaryBg = "bg-teal-700";
    const primaryBgHover = "hover:bg-teal-800";

    const textColor = "text-gray-800";
    const hoverTextColor = "hover:text-teal-700";
    const activeLinkColor = primaryColor;
    const mutedTextColor = "text-gray-500";

    const hoverBg = "hover:bg-gray-100";
    const activeMobileBg = "bg-teal-50";


    return (
        <nav className="sticky top-0 z-50 w-full bg-white shadow-md">
            <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">

                    {/* === Logo === */}
                    <div
                        onClick={() => navigate("/")}
                        className={`flex-shrink-0 flex items-center gap-2 cursor-pointer ${textColor}`}
                    >
                        <img
                            src={logo} // Your logo
                            alt="MediCamp Logo"
                            style={{ width: "40px", height: "40px", objectFit: "contain" }}
                        />
                        <span className="text-2xl font-bold">
                            Medi<span className={primaryColor}>Camp</span>
                        </span>
                    </div>

                    {/* === Desktop Navigation === */}
                    <div className="hidden md:flex items-baseline space-x-6">
                        {navLinks.map((link) => (
                            link.show && (
                                <Link
                                    key={link.text}
                                    to={link.href}
                                    className={`relative px-1 py-2 text-base font-medium transition-colors duration-200 ${pathname === link.href
                                            ? activeLinkColor
                                            : `${textColor} ${hoverTextColor}`
                                        }`}
                                >
                                    {link.text}
                                    {/* Active link underline */}
                                    {pathname === link.href && (
                                        <motion.div
                                            className={`absolute bottom-0 left-0 w-full h-0.5 ${primaryBg}`}
                                            layoutId="underline"
                                            transition={{ duration: 0.2 }}
                                        />
                                    )}
                                </Link>
                            )
                        ))}
                    </div>

                    {/* === Auth Buttons & Profile Menu === */}
                    <div className="hidden md:flex items-center gap-4">
                        {user ? (
                            // --- Profile Dropdown (If Logged In) ---
                            <div className="relative">
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className={`flex text-sm bg-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-700`}
                                >
                                    <span className="sr-only">Open user menu</span>
                                    <img
                                        className="w-10 h-10 rounded-full object-cover"
                                        src={user?.photoURL}
                                        alt={user?.displayName || "User"}
                                    />
                                    {!user?.photoURL && (
                                        <BiUserCircle className={`w-10 h-10 ${mutedTextColor}`} />
                                    )}
                                </button>

                                <AnimatePresence>
                                    {isProfileOpen && (
                                        <motion.div
                                            initial="closed"
                                            animate="open"
                                            exit="closed"
                                            variants={dropdownVariants}
                                            className="absolute right-0 w-56 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                                        >
                                            <div className="py-1" role="none">
                                                <div className="px-4 py-2 border-b border-gray-100">
                                                    <p className={`text-sm ${mutedTextColor}`}>Welcome,</p>
                                                    <p className={`font-medium ${textColor} truncate`}>
                                                        {user?.displayName || "User"}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={handleDashboardNavigate} // Your logic
                                                    className={`flex items-center w-full px-4 py-2 text-sm text-left ${textColor} ${hoverBg} ${hoverTextColor}`}
                                                >
                                                    <BiLayout className="w-5 h-5 mr-2" />
                                                    Dashboard
                                                </button>
                                                <button
                                                    onClick={handleLogOut} // Your logic
                                                    className={`flex items-center w-full px-4 py-2 text-sm text-left text-red-600 ${hoverBg}`}
                                                >
                                                    <BiLogOutCircle className="w-5 h-5 mr-2" />
                                                    Logout
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            // --- Sign In / Sign Up Buttons (If Logged Out) ---
                            <div className="flex items-center gap-4">
                                <motion.button
                                    onClick={() => navigate("/sign-in")}
                                    className={`flex cursor-pointer items-center gap-1.5 px-1 py-2 text-base font-medium transition-colors duration-200 ${textColor} ${hoverTextColor}`}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <HiOutlineLogin />
                                    Sign In
                                </motion.button>

                                {/* --- Primary "Sign Up" Button --- */}
                                <motion.button
                                    onClick={() => navigate("/sign-up")}
                                    className={`flex cursor-pointer items-center gap-2 px-5 py-2.5 text-base font-medium text-white ${primaryBg} rounded-lg shadow-sm ${primaryBgHover}`}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <HiOutlineUserAdd />
                                    Sign Up
                                </motion.button>
                            </div>
                        )}
                    </div>

                    {/* === Mobile Menu Button === */}
                    <div className="flex -mr-2 md:hidden">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            type="button"
                            className={`inline-flex items-center justify-center p-2 rounded-md ${mutedTextColor} ${hoverTextColor} ${hoverBg} focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-700`}
                        >
                            <span className="sr-only">Open main menu</span>
                            {isMobileMenuOpen ? (
                                <HiX className="block w-6 h-6" />
                            ) : (
                                <HiMenu className="block w-6 h-6" />
                            )}
                        </button>
                    </div>

                </div>
            </div>

            {/* === Mobile Menu Panel === */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-t border-gray-200 md:hidden"
                    >
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                            {navLinks.map((link) => (
                                link.show && (
                                    <Link
                                        key={link.text}
                                        to={link.href}
                                        onClick={() => setIsMobileMenuOpen(false)} // Close menu on click
                                        className={`block px-3 py-2 rounded-md text-base font-medium ${pathname === link.href
                                                ? `${activeMobileBg} ${activeLinkColor}`
                                                : `${textColor} ${hoverBg} ${hoverTextColor}`
                                            }`}
                                    >
                                        {link.text}
                                    </Link>
                                )
                            ))}
                        </div>

                        {/* --- Mobile Auth Buttons --- */}
                        {!user && (
                            <div className="px-5 pt-4 pb-3 space-y-3 border-t border-gray-100">
                                <motion.button
                                    onClick={() => {
                                        navigate("/sign-up");
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className={`flex justify-center w-full items-center gap-2 px-5 py-2.5 text-base font-medium text-white rounded-lg shadow-sm ${primaryBg} ${primaryBgHover}`}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <HiOutlineUserAdd />
                                    Sign Up
                                </motion.button>
                                <motion.button
                                    onClick={() => {
                                        navigate("/sign-in");
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className={`flex justify-center w-full items-center gap-2 px-4 py-2 text-base font-medium transition-colors duration-200 rounded-lg ${primaryColor} bg-gray-50 ${hoverBg}`}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <HiOutlineLogin />
                                    Sign In
                                </motion.button>
                            </div>
                        )}

                        {/* --- Mobile Profile Menu (if logged in) --- */}
                        {user && (
                            <div className="pt-4 pb-3 border-t border-gray-200">
                                <div className="flex items-center px-5">
                                    <div className="flex-shrink-0">
                                        <img
                                            className="w-10 h-10 rounded-full object-cover"
                                            src={user?.photoURL}
                                            alt={user?.displayName || "User"}
                                        />
                                        {!user?.photoURL && (
                                            <BiUserCircle className={`w-10 h-10 ${mutedTextColor}`} />
                                        )}
                                    </div>
                                    <div className="ml-3">
                                        <div className={`text-base font-medium ${textColor}`}>
                                            {user.displayName}
                                        </div>
                                        <div className={`text-sm font-medium ${mutedTextColor}`}>
                                            {user.email}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-3 space-y-1 px-2">
                                    <button
                                        onClick={() => {
                                            handleDashboardNavigate(); // Your logic
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className={`flex items-center w-full px-3 py-2 text-base font-medium rounded-md ${textColor} ${hoverBg} ${hoverTextColor}`}
                                    >
                                        <BiLayout className="w-5 h-5 mr-2" />
                                        Dashboard
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleLogOut(); // Your logic
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className={`flex items-center w-full px-3 py-2 text-base font-medium text-red-600 rounded-md ${hoverBg}`}
                                    >
                                        <BiLogOutCircle className="w-5 h-5 mr-2" />
                                        Logout
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;