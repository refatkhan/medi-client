import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import useAuth from '../Hooks/useAuth';
import useUserRole from '../Hooks/useUserRole';
import { CgSpinner } from 'react-icons/cg';
import { toast } from 'react-toastify';
import {
    HiOutlineHome, HiOutlineLogout, HiOutlineViewGrid, HiOutlineUsers, HiOutlineDocumentText,
    HiOutlineCurrencyDollar, HiOutlineAnnotation, HiOutlineUserCircle, HiOutlineMenu, HiX,
    HiOutlineBell
} from 'react-icons/hi';
import { FaRegCalendarCheck } from "react-icons/fa";
import { motion, AnimatePresence } from 'framer-motion';

// --- Sidebar Link Component ---
const SidebarLink = ({ to, icon: Icon, children, end = false }) => (
    <NavLink
        to={to}
        end={end}
        className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${isActive
                ? 'bg-teal-700 text-white font-medium shadow-sm'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`
        }
    >
        <Icon className="w-5 h-5 flex-shrink-0" />
        <span className="flex-1 truncate">{children}</span>
    </NavLink>
);

// --- Main Layout Component ---
const DashboardLayout = () => {
    const { user, logOut } = useAuth();
    const { role, isLoading: roleLoading } = useUserRole();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

    const handleLogOut = () => {
        logOut()
            .then(() => {
                toast.success("Logged out successfully");
                navigate('/');
            })
            .catch((error) => toast.error(error.message));
    };

    // --- Sidebar Links Definitions ---
    const organizerLinks = (
        <>
            <SidebarLink to="/dashboard/add-camp" icon={HiOutlineDocumentText}> Add A Camp </SidebarLink>
            <SidebarLink to="/dashboard/manage-camps" icon={HiOutlineDocumentText}> Manage Camps </SidebarLink>
            <SidebarLink to="/dashboard/manage-registered-camps" icon={HiOutlineUsers}> Manage Registered </SidebarLink>
        </>
    );

    const participantLinks = (
        <>
            <SidebarLink to="/dashboard/registered-camps" icon={FaRegCalendarCheck}> Registered Camps </SidebarLink>
            <SidebarLink to="/dashboard/payment-history" icon={HiOutlineCurrencyDollar}> Payment History </SidebarLink>
            <SidebarLink to="/dashboard/feedback-ratings" icon={HiOutlineAnnotation}> Feedback & Ratings </SidebarLink>
        </>
    );

    // --- Loading State ---
    if (roleLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <CgSpinner className="h-16 w-16 animate-spin text-teal-700" />
            </div>
        );
    }

    // --- Redirection Logic ---
    const defaultDashboardPath = role === 'organizer' ? '/dashboard/overview' : '/dashboard/analytics';
    useEffect(() => {
        if (location.pathname === '/dashboard' || location.pathname === '/dashboard/') {
            navigate(defaultDashboardPath, { replace: true });
        }
    }, [location.pathname, navigate, defaultDashboardPath]);

    // Show loading spinner during redirect
    if (location.pathname === '/dashboard' || location.pathname === '/dashboard/') {
        return (
            <div className="flex h-screen items-center justify-center">
                <CgSpinner className="h-16 w-16 animate-spin text-teal-700" />
            </div>
        );
    }

    // --- Helper to get page title from URL ---
    const getPageTitle = (pathname) => {
        const routeName = pathname.split('/').pop().replace(/-/g, ' ');
        if (!routeName || routeName === 'dashboard') {
            return role === 'organizer' ? 'Overview' : 'Analytics';
        }
        return routeName.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    return (
        <div className="flex h-screen bg-gray-100">
            <Helmet> <title>Dashboard | MediCamp</title> </Helmet>

            {/* --- Sidebar --- */}
            <div className={`fixed inset-0 z-30 bg-black/50 transition-opacity lg:hidden ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsSidebarOpen(false)} />
            <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 transform flex-col border-r border-gray-200 bg-white p-4 transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="mb-6 flex items-center justify-between px-2">
                    <span className="text-2xl font-bold text-gray-800">Medi<span className="text-teal-700">Camp</span></span>
                    <button onClick={() => setIsSidebarOpen(false)} className="rounded p-1 text-gray-500 hover:bg-gray-100 lg:hidden" aria-label="Close sidebar"><HiX className="h-6 w-6" /></button>
                </div>

                <nav className="flex-1 space-y-2 overflow-y-auto">
                    <SidebarLink to={defaultDashboardPath} icon={HiOutlineViewGrid}>
                        {role === 'organizer' ? 'Overview' : 'Analytics'}
                    </SidebarLink>
                    <SidebarLink to="/dashboard/profile" icon={HiOutlineUserCircle}>
                        My Profile
                    </SidebarLink>

                    {role === 'organizer' && organizerLinks}
                    {(role === 'participant' || role === 'user') && participantLinks}
                </nav>

                <div className="mt-auto space-y-2 border-t pt-4">
                    <SidebarLink to="/" icon={HiOutlineHome}> Back to Home </SidebarLink>
                    <button onClick={handleLogOut} className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors">
                        <HiOutlineLogout className="w-5 h-5" /> Logout
                    </button>
                    <div className="flex items-center gap-3 border-t pt-4 mt-2 px-2">
                        <img src={user?.photoURL || 'https://placehold.co/100x100/E2E8F0/4A5568?text=User'} alt={user?.displayName} className="w-9 h-9 rounded-full object-cover bg-gray-200" />
                        <div>
                            <p className="text-sm font-medium text-gray-800 truncate">{user?.displayName}</p>
                            <p className="text-xs text-gray-500 capitalize">{role || 'User'}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* --- Main Content Area --- */}
            <main className="flex flex-1 flex-col overflow-y-auto lg:pl-64">
                <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b bg-white px-4 shadow-sm sm:px-6 lg:px-8">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsSidebarOpen(true)} className="rounded p-2 text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 lg:hidden" aria-label="Open sidebar">
                            <HiOutlineMenu className="h-6 w-6" />
                        </button>
                        <h1 className="hidden text-xl font-semibold text-gray-800 lg:block">
                            {getPageTitle(location.pathname)}
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2">
                            <HiOutlineBell className="h-6 w-6" />
                            <span className="sr-only">Notifications</span>
                        </button>
                        <div className="relative">
                            <button onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} className="flex rounded-full bg-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2">
                                <span className="sr-only">Open user menu</span>
                                <img
                                    className="h-9 w-9 rounded-full object-cover"
                                    src={user?.photoURL || 'https://placehold.co/100x100/E2E8F0/4A5568?text=User'}
                                    alt={user?.displayName}
                                />
                            </button>
                            <AnimatePresence>
                                {isProfileMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                                        onMouseLeave={() => setIsProfileMenuOpen(false)}
                                    >
                                        <NavLink to="/dashboard/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Profile</NavLink>
                                        <button onClick={handleLogOut} className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50">Logout</button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </header>
                <div className="flex-1 p-6 md:p-8">
                    <Outlet />
                </div>
                <footer className="mt-auto border-t bg-white px-6 py-4 text-center text-sm text-gray-500">
                    &copy; {new Date().getFullYear()} MediCamp Management System. All rights reserved.
                </footer>
            </main>
        </div>
    );
};

export default DashboardLayout;

