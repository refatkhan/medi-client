import React, { useContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../Provider/AuthProvider";
import { toast } from "react-toastify";
import logo from '../../assets/logo.png'; // Your logo import
import useUserRole from "../../Hooks/useUserRole";
import { motion, AnimatePresence } from 'framer-motion';

// --- Icons ---
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
    // --- Existing Logic ---
    const { role } = useUserRole();
    const { user, logOut } = useContext(AuthContext);
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const handleLogOut = () => {
        logOut()
            .then(() => toast.success("Sign out successfully"))
            .catch((error) => toast.error(error.message));
        setIsProfileOpen(false);
    };

    const handleDashboardNavigate = () => {
        // Redirect based on role
        const dashboardPath = (role === "user" || role === "participant")
            ? "/dashboard/analytics"
            : "/dashboard/overview";
        navigate(dashboardPath);
        setIsProfileOpen(false);
    };

    // --- NEW: Defined Link Structure per Requirements ---
    const loggedOutLinks = [
        { text: 'Home', href: '/' },
        { text: 'Available Camps', href: '/available-camps' },
        { text: 'Contact', href: '/contact' },
    ];

    const loggedInLinks = [
        { text: 'Home', href: '/' },
        { text: 'Available Camps', href: '/available-camps' },
        { text: 'Services', href: '/#service' },
        { text: 'About Us', href: '/#about' },
        { text: 'Contact', href: '/#contact' },
    ];

    // Determine which set of links to display
    const linksToDisplay = user ? loggedInLinks : loggedOutLinks;

    // --- Animation Variants (Unchanged) ---
    const dropdownVariants = {
        open: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 20 } },
        closed: { opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.1 } },
    };

    return (
        <nav className="sticky top-0 z-50 w-full bg-white shadow-md dark:bg-slate-800 dark:border-b dark:border-slate-700">
            <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">

                    {/* Logo */}
                    <div onClick={() => navigate("/")} className="flex-shrink-0 flex items-center gap-2 cursor-pointer">
                        <img src={logo} alt="MediCamp Logo" className="w-10 h-10 object-contain" />
                        <span className="text-2xl font-bold text-gray-800 dark:text-white">
                            Medi<span className="text-teal-700 dark:text-teal-500">Camp</span>
                        </span>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-baseline space-x-6">
                        {linksToDisplay.map((link) => (
                            <Link
                                key={link.text}
                                to={link.href}
                                className={`relative px-1 py-2 text-base font-medium transition-colors duration-200 ${pathname === link.href
                                        ? 'text-teal-700 dark:text-teal-500'
                                        : 'text-gray-800 hover:text-teal-700 dark:text-slate-300 dark:hover:text-teal-500'
                                    }`}
                            >
                                {link.text}
                                {pathname === link.href && (
                                    <motion.div
                                        className="absolute bottom-0 left-0 w-full h-0.5 bg-teal-700 dark:bg-teal-500"
                                        layoutId="underline"
                                        transition={{ duration: 0.2 }}
                                    />
                                )}
                            </Link>
                        ))}
                    </div>

                    {/* Auth Buttons & Profile Menu */}
                    <div className="hidden md:flex items-center gap-4">
                        {user ? (
                            <div className="relative">
                                <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex cursor-pointer text-sm bg-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-700 dark:focus:ring-offset-slate-800">
                                    <span className="sr-only">Open user menu</span>
                                    <img className="w-10 h-10 rounded-full object-cover" src={user?.photoURL || 'https://placehold.co/100x100/E2E8F0/4A5568?text=User'} alt={user?.displayName || "User"} />
                                </button>
                                <AnimatePresence>
                                    {isProfileOpen && (
                                        <motion.div initial="closed" animate="open" exit="closed" variants={dropdownVariants} className="absolute right-0 w-56 mt-2 origin-top-right bg-white dark:bg-slate-700 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                            <div className="py-1" role="none">
                                                <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-600">
                                                    <p className="text-sm text-gray-500 dark:text-slate-400">Welcome,</p>
                                                    <p className="font-medium text-gray-800 dark:text-slate-200 truncate">{user?.displayName || "User"}</p>
                                                </div>
                                                <button onClick={handleDashboardNavigate} className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-800 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-600 dark:hover:text-white">
                                                    <BiLayout className="w-5 h-5 mr-2" /> Dashboard
                                                </button>
                                                <button onClick={handleLogOut} className="flex items-center w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-gray-100 dark:text-red-400 dark:hover:bg-slate-600 dark:hover:text-red-300">
                                                    <BiLogOutCircle className="w-5 h-5 mr-2" /> Logout
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link to="/sign-in" className="flex items-center gap-1.5 px-1 py-2 text-base font-medium transition-colors duration-200 text-gray-800 hover:text-teal-700 dark:text-slate-300 dark:hover:text-teal-500">
                                    <HiOutlineLogin /> Sign In
                                </Link>
                                <Link to="/sign-up" className="flex items-center gap-2 px-5 py-2.5 text-base font-medium text-white bg-teal-700 rounded-lg shadow-sm hover:bg-teal-800 transition-transform hover:scale-105">
                                    <HiOutlineUserAdd /> Sign Up
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex -mr-2 md:hidden">
                        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} type="button" className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 dark:text-slate-400 hover:text-teal-700 dark:hover:text-teal-500 hover:bg-gray-100 dark:hover:bg-slate-700 focus:outline-none">
                            <span className="sr-only">Open main menu</span>
                            {isMobileMenuOpen ? <HiX className="block w-6 h-6" /> : <HiMenu className="block w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Panel */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-gray-200 dark:border-slate-700 md:hidden">
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                            {linksToDisplay.map((link) => (
                                <Link key={link.text} to={link.href} onClick={() => setIsMobileMenuOpen(false)} className={`block px-3 py-2 rounded-md text-base font-medium ${pathname === link.href ? 'bg-teal-50 text-teal-700 dark:bg-slate-700 dark:text-teal-400' : 'text-gray-800 hover:bg-gray-50 dark:text-slate-300 dark:hover:bg-slate-700'}`}>
                                    {link.text}
                                </Link>
                            ))}
                        </div>
                        {user ? (
                            <div className="pt-4 pb-3 border-t border-gray-200 dark:border-slate-700 ">
                                <div className="flex items-center px-5 ">
                                    <div className="flex-shrink-0 ">
                                        <img className="w-10 h-10 rounded-full object-cover" src={user.photoURL || 'https://placehold.co/100x100/E2E8F0/4A5568?text=User'} alt={user.displayName} />
                                    </div>
                                    <div className="ml-3">
                                        <div className="text-base font-medium text-gray-800 dark:text-slate-200">{user.displayName}</div>
                                        <div className="text-sm font-medium text-gray-500 dark:text-slate-400">{user.email}</div>
                                    </div>
                                </div>
                                <div className="mt-3 space-y-1 px-2">
                                    <button onClick={() => { handleDashboardNavigate(); setIsMobileMenuOpen(false); }} className="flex items-center w-full px-3 py-2 text-base font-medium rounded-md text-gray-800 hover:bg-gray-50 dark:text-slate-300 dark:hover:bg-slate-700">
                                        <BiLayout className="w-5 h-5 mr-2" /> Dashboard
                                    </button>
                                    <button onClick={() => { handleLogOut(); setIsMobileMenuOpen(false); }} className="flex items-center w-full px-3 py-2 text-base font-medium text-red-600 rounded-md hover:bg-gray-50 dark:text-red-400 dark:hover:bg-slate-700">
                                        <BiLogOutCircle className="w-5 h-5 mr-2" /> Logout
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="px-5 pt-4 pb-3 space-y-3 border-t border-gray-200 dark:border-slate-700">
                                <Link to="/sign-up" onClick={() => setIsMobileMenuOpen(false)} className="flex justify-center w-full items-center gap-2 px-5 py-2.5 text-base font-medium text-white rounded-lg shadow-sm bg-teal-700 hover:bg-teal-800">
                                    <HiOutlineUserAdd /> Sign Up
                                </Link>
                                <Link to="/sign-in" onClick={() => setIsMobileMenuOpen(false)} className="flex justify-center w-full items-center gap-2 px-4 py-2 text-base font-medium rounded-lg text-teal-700 bg-gray-50 hover:bg-gray-100 dark:bg-slate-700 dark:text-teal-400 dark:hover:bg-slate-600">
                                    <HiOutlineLogin /> Sign In
                                </Link>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
