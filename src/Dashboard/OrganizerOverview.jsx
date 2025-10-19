import React from 'react';
import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from '../Hooks/useAxiosSecure';
import useAuth from '../Hooks/useAuth';
import { CgSpinner } from 'react-icons/cg';
import {
    HiOutlineDocumentText, HiOutlineUsers, HiOutlineCurrencyDollar, HiOutlineCalendar
} from 'react-icons/hi';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';

// Reusable Stat Card Component
const StatCard = ({ icon: Icon, title, value, color }) => (
    <div className="flex flex-col justify-between rounded-lg bg-white p-5 shadow-sm">
        <div className="flex items-center">
            <div className={`mr-4 flex h-12 w-12 items-center justify-center rounded-md ${color}`}>
                <Icon className="h-6 w-6 text-white" />
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-2xl font-semibold text-gray-800">{value}</p>
            </div>
        </div>
    </div>
);

const OrganizerOverview = () => {
    const axiosSecure = useAxiosSecure();
    const { user } = useAuth();

    // Fetch the consolidated stats from the new backend route
    const { data: stats, isLoading, isError } = useQuery({
        queryKey: ['organizer-stats', user?.email], // Include user email in key
        queryFn: async () => {
            const res = await axiosSecure.get('/organizer-stats');
            return res.data;
        },
        enabled: !!user, // Only fetch if the user is available
    });

    if (isLoading) {
        return <div className="flex h-[calc(100vh-200px)] items-center justify-center"><CgSpinner className="h-12 w-12 animate-spin text-teal-700" /></div>;
    }

    if (isError || !stats) {
        return <div className="text-center text-red-500">Failed to load overview data. Please check the API endpoint and your network connection.</div>;
    }

    // Colors for the Pie Chart
    const PIE_COLORS = ['#0d9488', '#0f766e', '#115e59', '#134e4a', '#042f2e'];

    return (
        <motion.div className="space-y-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Welcome back, {user?.displayName}!</h1>
                <p className="mt-1 text-gray-600">Here's your real-time analytics overview.</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total Camps" value={stats.totalCamps} icon={HiOutlineDocumentText} color="bg-teal-600" />
                <StatCard title="Total Participants" value={stats.totalParticipants} icon={HiOutlineUsers} color="bg-blue-500" />
                <StatCard title="Total Revenue" value={`$${stats.totalRevenue.toLocaleString()}`} icon={HiOutlineCurrencyDollar} color="bg-green-500" />
                <StatCard title="Upcoming Camps" value={stats.upcomingCampsCount} icon={HiOutlineCalendar} color="bg-indigo-500" />
            </div>

            {/* Main Analytics Row */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                {/* Registrations Over Time Chart */}
                <div className="rounded-lg bg-white p-6 shadow-sm lg:col-span-8">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Registrations (Last 6 Months)</h2>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <LineChart data={stats.registrationsOverTime} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="count" name="New Registrations" stroke="#0d9488" strokeWidth={2} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Camps by Location Pie Chart */}
                <div className="rounded-lg bg-white p-6 shadow-sm lg:col-span-4">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Camps by Location</h2>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie data={stats.campsByLocation} dataKey="count" nameKey="location" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                    {stats.campsByLocation?.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Recent Registrations Table */}
            <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800 p-6">Recent Registrations</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Participant Name</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Camp Name</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Reg. Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {stats.recentRegistrations?.map((reg) => (
                                <tr key={reg._id} className="hover:bg-gray-50">
                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{reg.participantName}</td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{reg.campName}</td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{dayjs(reg.registeredAt).format('DD MMM, YYYY')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
};

export default OrganizerOverview;

