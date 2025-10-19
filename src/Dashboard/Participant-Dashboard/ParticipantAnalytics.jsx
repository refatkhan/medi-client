import React from 'react';
import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from '../../Hooks/useAxiosSecure';
import useAuth from '../../Hooks/useAuth';
import { CgSpinner } from 'react-icons/cg';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { HiOutlineCalendar, HiOutlineCurrencyDollar, HiOutlineClipboardList, HiOutlineLocationMarker } from 'react-icons/hi';

// --- Reusable Stat Card Component (Matches Organizer's Overview) ---
const StatCard = ({ icon: Icon, title, value, colorClass, iconColorClass }) => (
    <div className={`rounded-lg p-5 shadow-sm ${colorClass}`}>
        <div className="flex items-center">
            <div className="mr-4 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-white dark:bg-slate-700">
                <Icon className={`h-6 w-6 ${iconColorClass}`} />
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-slate-400">{title}</p>
                <p className="text-2xl font-semibold text-gray-800 dark:text-slate-100">{value}</p>
            </div>
        </div>
    </div>
);

const ParticipantAnalytics = () => {
    const { user } = useAuth();
    const axiosSecure = useAxiosSecure();

    // --- YOUR DATA FETCHING LOGIC (Adapted) ---
    // This uses the same API route as your useParticipantAnalytics hook
    const { data: analyticsData = [], isLoading, isError } = useQuery({
        queryKey: ['participant-analytics', user?.email],
        queryFn: async () => {
            const res = await axiosSecure.get(`/participant-analytics?email=${user.email}`);
            return res.data;
        },
        enabled: !!user?.email,
    });

    if (isLoading) {
        return <div className="flex h-full items-center justify-center"><CgSpinner className="h-12 w-12 animate-spin text-teal-500" /></div>;
    }
    if (isError) {
        return <div className="text-center text-red-500 dark:text-red-400">Failed to load your analytics data.</div>;
    }

    // --- Process Data for Stats and Charts ---
    const totalRegistered = analyticsData.length;
    const totalPaid = analyticsData
        .filter(camp => camp.status === 'paid')
        .reduce((sum, camp) => sum + (camp.fees || 0), 0);

    const upcomingCamps = analyticsData
        .filter(camp => dayjs(camp.dateTime).isAfter(dayjs()))
        .sort((a, b) => dayjs(a.dateTime).diff(dayjs(b.dateTime)));

    const paidCount = analyticsData.filter(c => c.status === 'paid').length;
    const unpaidCount = totalRegistered - paidCount;
    const paymentStatusData = [
        { name: 'Paid', value: paidCount },
        { name: 'Unpaid', value: unpaidCount },
    ];
    const PIE_COLORS = ['#10b981', '#ef4444']; // Green for Paid, Red for Unpaid

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6">
            <Helmet><title>My Dashboard | MediCamp</title></Helmet>

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100">Welcome, {user?.displayName}!</h1>
                <p className="mt-1 text-gray-600 dark:text-slate-400">Here's a summary of your activity and upcoming camps.</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <StatCard title="Camps Registered" value={totalRegistered} icon={HiOutlineClipboardList} colorClass="bg-blue-50 dark:bg-slate-800" iconColorClass="text-blue-600 dark:text-blue-400" />
                <StatCard title="Total Fees Paid" value={`$${totalPaid.toLocaleString()}`} icon={HiOutlineCurrencyDollar} colorClass="bg-green-50 dark:bg-slate-800" iconColorClass="text-green-600 dark:text-green-400" />
                <StatCard title="Upcoming Camps" value={upcomingCamps.length} icon={HiOutlineCalendar} colorClass="bg-indigo-50 dark:bg-slate-800" iconColorClass="text-indigo-600 dark:text-indigo-400" />
            </div>

            {/* Main Content: Upcoming Camps & Payment Status */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Upcoming Camps List */}
                <div className="lg:col-span-2 rounded-xl bg-white dark:bg-slate-800 p-6 shadow-lg">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-slate-100 mb-4">Your Upcoming Camps</h2>
                    {upcomingCamps.length > 0 ? (
                        <div className="space-y-4">
                            {upcomingCamps.slice(0, 3).map(camp => ( // Show top 3 upcoming
                                <div key={camp._id} className="p-4 rounded-lg bg-gray-50 dark:bg-slate-700/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div>
                                        <p className="font-semibold text-gray-800 dark:text-slate-100">{camp.campName}</p>
                                        <p className="text-sm text-gray-500 dark:text-slate-400 flex items-center gap-2 mt-1">
                                            <HiOutlineCalendar className="h-4 w-4" /> {dayjs(camp.dateTime).format('DD MMM YYYY, h:mm A')}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-slate-400 flex items-center gap-2">
                                            <HiOutlineLocationMarker className="h-4 w-4" /> {camp.location}
                                        </p>
                                    </div>
                                    <Link to={`/camp-details/${camp.campId}`} className="shrink-0 rounded-md bg-teal-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-teal-700">
                                        View Details
                                    </Link>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                            <HiOutlineCalendar className="h-12 w-12 text-gray-300 dark:text-slate-600" />
                            <p className="mt-4 text-gray-500 dark:text-slate-400">You have no upcoming registered camps.</p>
                            <Link to="/available-camps" className="mt-4 rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-teal-700">
                                Find a Camp
                            </Link>
                        </div>
                    )}
                </div>

                {/* Payment Status Chart */}
                <div className="rounded-xl bg-white dark:bg-slate-800 p-6 shadow-lg">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-slate-100 mb-4">Payment Status</h2>
                    {totalRegistered > 0 ? (
                        <div style={{ width: '100%', height: 250 }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie data={paymentStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5} label={({ name, value }) => `${name}: ${value}`}>
                                        {paymentStatusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', border: '1px solid #334155' }} labelStyle={{ color: '#cbd5e1' }} itemStyle={{ color: '#94a3b8' }} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                            <HiOutlineCurrencyDollar className="h-12 w-12 text-gray-300 dark:text-slate-600" />
                            <p className="mt-4 text-gray-500 dark:text-slate-400">No registration data to show.</p>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default ParticipantAnalytics;

