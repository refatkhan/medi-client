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

// --- Sidebar Link Component (Styled for Dark Theme) ---
const SidebarLink = ({ to, icon: Icon, children, end = false }) => (
    <NavLink
        to={to}
        end={end}
        className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${isActive
                ? 'bg-teal-600 text-white font-semibold shadow-lg'
                : 'text-slate-300 hover:bg-slate-700 hover:text-white'
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
        logOut().then(() => toast.success("Logged out successfully")).catch(err => toast.error(err.message));
        navigate('/');
    };

    // --- Sidebar Links Definitions ---
    const organizerLinks = (
        <>
            <SidebarLink to="/dashboard/add-camp" icon={HiOutlineDocumentText}> Add A Camp </SidebarLink>
            <SidebarLink to="/dashboard/manage-camps" icon={HiOutlineDocumentText}> Manage Camps </SidebarLink>
            <SidebarLink to="/dashboard/manage-registered-camps" icon={HiOutlineUsers}> Manage Registered </SidebarLink>
        </>
    );

    // --- UPDATED: Participant links are now active ---
    const participantLinks = (
        <>
            <SidebarLink to="/dashboard/registered-camps" icon={FaRegCalendarCheck}> Registered Camps </SidebarLink>
            <SidebarLink to="/dashboard/payment-history" icon={HiOutlineCurrencyDollar}> Payment History </SidebarLink>
            <SidebarLink to="/dashboard/feedback-ratings" icon={HiOutlineAnnotation}> Feedback & Ratings </SidebarLink>
        </>
    );

    // --- Loading & Redirect Logic ---
    if (roleLoading) {
        return <div className="flex h-screen items-center justify-center bg-slate-900"><CgSpinner className="h-16 w-16 animate-spin text-teal-500" /></div>;
    }
    const defaultDashboardPath = role === 'organizer' ? '/dashboard/overview' : '/dashboard/analytics';
    useEffect(() => {
        if (location.pathname === '/dashboard' || location.pathname === '/dashboard/') {
            navigate(defaultDashboardPath, { replace: true });
        }
    }, [location.pathname, navigate, defaultDashboardPath]);
    if (location.pathname === '/dashboard' || location.pathname === '/dashboard/') {
        return <div className="flex h-screen items-center justify-center bg-slate-900"><CgSpinner className="h-16 w-16 animate-spin text-teal-500" /></div>;
    }

    const getPageTitle = (pathname) => {
        const routeName = pathname.split('/').pop().replace(/-/g, ' ');
        if (!routeName || routeName === 'dashboard') { return role === 'organizer' ? 'Overview' : 'Analytics'; }
        return routeName.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    return (
        <div className="flex h-screen bg-slate-900 text-slate-300">
            <Helmet> <title>Dashboard | MediCamp</title> </Helmet>

            {/* Sidebar Overlay (Mobile) */}
            <div className={`fixed inset-0 z-30 bg-black/60 backdrop-blur-sm transition-opacity lg:hidden ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsSidebarOpen(false)} />

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 transform flex-col border-r border-slate-700 bg-slate-800 p-4 transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="mb-6 flex items-center justify-between px-2">
                    <span className="text-2xl font-bold text-white">Medi<span className="text-teal-500">Camp</span></span>
                    <button onClick={() => setIsSidebarOpen(false)} className="rounded p-1 text-slate-400 hover:bg-slate-700 lg:hidden" aria-label="Close sidebar"><HiX className="h-6 w-6" /></button>
                </div>
                <nav className="flex-1 space-y-2 overflow-y-auto">
                    {/* Common links */}
                    <SidebarLink to={defaultDashboardPath} icon={HiOutlineViewGrid}> {role === 'organizer' ? 'Overview' : 'Analytics'} </SidebarLink>
                    <SidebarLink to="/dashboard/profile" icon={HiOutlineUserCircle}> My Profile </SidebarLink>

                    {/* Role-specific links */}
                    <div className="pt-4 mt-4 border-t border-slate-700">
                        {role === 'organizer' && organizerLinks}
                        {(role === 'participant' || role === 'user') && participantLinks}
                    </div>
                </nav>
                <div className="mt-auto space-y-2 border-t border-slate-700 pt-4">
                    <SidebarLink to="/" icon={HiOutlineHome}> Back to Home </SidebarLink>
                    <button onClick={handleLogOut} className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-900/40 hover:text-red-300 transition-colors">
                        <HiOutlineLogout className="w-5 h-5" /> Logout
                    </button>
                    <div className="flex items-center gap-3 border-t border-slate-700 pt-4 mt-2 px-2">
                        <img src={user?.photoURL || 'https://placehold.co/100x100/475569/E2E8F0?text=User'} alt={user?.displayName} className="w-9 h-9 rounded-full object-cover" />
                        <div>
                            <p className="text-sm font-medium text-slate-200 truncate">{user?.displayName}</p>
                            <p className="text-xs text-slate-400 capitalize">{role || 'User'}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex flex-1 flex-col overflow-y-auto lg:pl-64">
                <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-slate-700 bg-slate-800 px-4 shadow-sm sm:px-6 lg:px-8">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsSidebarOpen(true)} className="rounded p-2 text-slate-300 hover:bg-slate-700 lg:hidden" aria-label="Open sidebar">
                            <HiOutlineMenu className="h-6 w-6" />
                        </button>
                        <h1 className="hidden text-xl font-semibold text-slate-100 lg:block"> {getPageTitle(location.pathname)} </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="rounded-full p-2 text-slate-400 hover:bg-slate-700 hover:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-slate-800">
                            <HiOutlineBell className="h-6 w-6" /> <span className="sr-only">Notifications</span>
                        </button>
                        <div className="relative">
                            <button onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} className="flex rounded-full bg-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-slate-800">
                                <span className="sr-only">Open user menu</span>
                                <img className="h-9 w-9 rounded-full object-cover" src={user?.photoURL || 'https://placehold.co/100x100/475569/E2E8F0?text=User'} alt={user?.displayName} />
                            </button>
                            <AnimatePresence>
                                {isProfileMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-slate-700 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                                        onMouseLeave={() => setIsProfileMenuOpen(false)}
                                    >
                                        <NavLink to="/dashboard/profile" className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-600 hover:text-white">My Profile</NavLink>
                                        <button onClick={handleLogOut} className="block w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-900/40 hover:text-red-300">Logout</button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </header>
                <div className="flex-1 p-6 md:p-8 bg-slate-900"> {/* Set main content background */}
                    <Outlet />
                </div>
                <footer className="mt-auto border-t border-slate-700 bg-slate-800 px-6 py-4 text-center text-sm text-slate-400">
                    &copy; {new Date().getFullYear()} MediCamp Management System. All rights reserved.
                </footer>
            </main>
        </div>
    );
};

export default DashboardLayout;

