import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "../Hooks/useAxiosSecure";
import Swal from "sweetalert2";
import { Helmet } from 'react-helmet-async';
import { CgSpinner } from 'react-icons/cg';
import { HiPencil, HiPlus, HiTrash } from 'react-icons/hi';
import { motion } from 'framer-motion';

const UpdateCamp = () => {
    // --- State and Hooks ---
    const { campId } = useParams();
    const axiosSecure = useAxiosSecure();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { control, handleSubmit, reset, formState: { errors } } = useForm();
    const [scheduleItems, setScheduleItems] = useState([{ time: '', activity: '' }]);

    // --- Data Fetching ---
    const { data: camp, isLoading, isError } = useQuery({
        queryKey: ["campDetails", campId],
        queryFn: async () => {
            const res = await axiosSecure.get(`/available-camps/${campId}`);
            return res.data;
        },
        enabled: !!campId,
    });

    // --- Pre-populate form when camp data loads ---
    useEffect(() => {
        if (camp) {
            const defaultValues = {
                ...camp,
                detailedServices: camp.detailedServices?.join(', ') || '',
                requiredDocuments: camp.requiredDocuments?.join(', ') || '',
                dateTime: camp.dateTime ? new Date(camp.dateTime).toISOString().slice(0, 16) : ''
            };
            reset(defaultValues);
            if (camp.schedule && camp.schedule.length > 0) {
                setScheduleItems(camp.schedule);
            } else {
                setScheduleItems([{ time: '', activity: '' }]);
            }
        }
    }, [camp, reset]);

    // --- Data Mutation ---
    const { mutate: updateCamp, isPending } = useMutation({
        mutationFn: async (updatedData) => {
            return await axiosSecure.patch(`/update-camp/${campId}`, updatedData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["campDetails", campId] });
            queryClient.invalidateQueries({ queryKey: ["organizer-camps"] });
            Swal.fire({
                icon: "success",
                title: "Camp Updated!",
                text: "Your medical camp has been successfully updated.",
                confirmButtonColor: '#0d9488',
            }).then(() => {
                navigate("/dashboard/manage-camps");
            });
        },
        onError: () => {
            Swal.fire({
                icon: "error",
                title: "Update Failed",
                text: "Something went wrong. Please try again later.",
            });
        },
    });

    const onSubmit = (data) => {
        const detailedServicesArray = data.detailedServices.split(',').map(item => item.trim()).filter(Boolean);
        const requiredDocumentsArray = data.requiredDocuments.split(',').map(item => item.trim()).filter(Boolean);
        const validScheduleItems = scheduleItems.filter(item => item.time && item.activity);

        const updatedData = {
            ...data,
            fees: parseFloat(data.fees),
            detailedServices: detailedServicesArray,
            requiredDocuments: requiredDocumentsArray,
            schedule: validScheduleItems,
        };
        updateCamp(updatedData);
    };

    // --- Schedule Handlers ---
    const handleScheduleChange = (index, event) => {
        const values = [...scheduleItems];
        values[index][event.target.name] = event.target.value;
        setScheduleItems(values);
    };
    const handleAddScheduleItem = () => setScheduleItems([...scheduleItems, { time: '', activity: '' }]);
    const handleRemoveScheduleItem = (index) => {
        if (scheduleItems.length > 1) {
            const values = [...scheduleItems];
            values.splice(index, 1);
            setScheduleItems(values);
        }
    };

    if (isLoading) {
        return <div className="flex h-full items-center justify-center"><CgSpinner className="h-12 w-12 animate-spin text-teal-500" /></div>;
    }
    if (isError) {
        return <div className="text-center text-red-500 dark:text-red-400">Failed to load camp data for editing.</div>;
    }

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Helmet><title>Update Camp | MediCamp Dashboard</title></Helmet>

            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="rounded-lg bg-white dark:bg-slate-800 shadow-sm">
                    {/* Header */}
                    <div className="flex items-center gap-4 border-b border-gray-200 dark:border-slate-700 p-6">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-600 dark:bg-slate-700 dark:text-teal-400">
                            <HiPencil className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">Update Camp</h2>
                            <p className="text-sm text-gray-500 dark:text-slate-400">Editing: <span className="font-medium text-teal-600 dark:text-teal-400">{camp?.campName}</span></p>
                        </div>
                    </div>

                    {/* Form Body */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
                        {/* Left Column */}
                        <div className="md:col-span-2 space-y-6">
                            {/* Camp Name & Description */}
                            <div>
                                <label htmlFor="campName" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Camp Name</label>
                                <Controller name="campName" control={control} render={({ field }) => <input {...field} id="campName" type="text" className="mt-1 block w-full rounded-lg border-none bg-gray-100 p-3 shadow-inner dark:bg-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500" />} />
                            </div>
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Main Description</label>
                                <Controller name="description" control={control} render={({ field }) => <textarea {...field} id="description" rows="4" className="mt-1 block w-full rounded-lg border-none bg-gray-100 p-3 shadow-inner dark:bg-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"></textarea>} />
                            </div>
                            {/* Detailed Services */}
                            <div>
                                <label htmlFor="detailedServices" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Detailed Services</label>
                                <Controller name="detailedServices" control={control} render={({ field }) => <textarea {...field} id="detailedServices" rows="3" className="mt-1 block w-full rounded-lg border-none bg-gray-100 p-3 shadow-inner dark:bg-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="e.g., Blood Pressure Check, Dental Screening"></textarea>} />
                                <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">Separate each service with a comma (,).</p>
                            </div>
                            {/* Schedule */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Camp Schedule</label>
                                <div className="space-y-3 mt-1">
                                    {scheduleItems.map((item, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <input type="text" name="time" placeholder="e.g., 9:00 AM" value={item.time} onChange={e => handleScheduleChange(index, e)} className="block w-1/3 rounded-lg border-none bg-gray-100 p-2 shadow-inner dark:bg-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500" />
                                            <input type="text" name="activity" placeholder="Activity Description" value={item.activity} onChange={e => handleScheduleChange(index, e)} className="block w-2/3 rounded-lg border-none bg-gray-100 p-2 shadow-inner dark:bg-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500" />
                                            <button type="button" onClick={() => handleRemoveScheduleItem(index)} className="p-2 text-red-500 hover:text-red-700 disabled:opacity-50" disabled={scheduleItems.length === 1}><HiTrash className="h-5 w-5" /></button>
                                        </div>
                                    ))}
                                </div>
                                <button type="button" onClick={handleAddScheduleItem} className="mt-2 flex items-center gap-1 text-sm font-medium text-teal-600 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300"><HiPlus className="h-4 w-4" /> Add Item</button>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="md:col-span-1 space-y-6">
                            {/* Image URL */}
                            <div>
                                <label htmlFor="image" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Image URL</label>
                                <Controller name="image" control={control} render={({ field }) => <input {...field} id="image" type="text" className="mt-1 block w-full rounded-lg border-none bg-gray-100 p-3 shadow-inner dark:bg-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500" />} />
                                {camp?.image && <img src={camp.image} alt="Current" className="mt-2 h-24 w-auto rounded-md" />}
                            </div>
                            {/* Fees, Date, Location, Doctor */}
                            <div>
                                <label htmlFor="fees" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Camp Fees ($)</label>
                                <Controller name="fees" control={control} render={({ field }) => <input {...field} id="fees" type="number" step="0.01" className="mt-1 block w-full rounded-lg border-none bg-gray-100 p-3 shadow-inner dark:bg-slate-700" />} />
                            </div>
                            <div>
                                <label htmlFor="dateTime" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Date & Time</label>
                                <Controller name="dateTime" control={control} render={({ field }) => <input {...field} id="dateTime" type="datetime-local" className="mt-1 block w-full rounded-lg border-none bg-gray-100 p-3 shadow-inner dark:bg-slate-700" />} />
                            </div>
                            <div>
                                <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Location</label>
                                <Controller name="location" control={control} render={({ field }) => <input {...field} id="location" type="text" className="mt-1 block w-full rounded-lg border-none bg-gray-100 p-3 shadow-inner dark:bg-slate-700" />} />
                            </div>
                            <div>
                                <label htmlFor="doctorName" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Healthcare Professional</label>
                                <Controller name="doctorName" control={control} render={({ field }) => <input {...field} id="doctorName" type="text" className="mt-1 block w-full rounded-lg border-none bg-gray-100 p-3 shadow-inner dark:bg-slate-700" />} />
                            </div>
                            {/* Target Audience, Docs, Add. Info */}
                            <div>
                                <label htmlFor="targetAudience" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Target Audience</label>
                                <Controller name="targetAudience" control={control} render={({ field }) => <input {...field} id="targetAudience" type="text" className="mt-1 block w-full rounded-lg border-none bg-gray-100 p-3 shadow-inner dark:bg-slate-700" />} />
                            </div>
                            <div>
                                <label htmlFor="requiredDocuments" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Required Documents</label>
                                <Controller name="requiredDocuments" control={control} render={({ field }) => <textarea {...field} id="requiredDocuments" rows="2" className="mt-1 block w-full rounded-lg border-none bg-gray-100 p-3 shadow-inner dark:bg-slate-700" placeholder="e.g., NID Card, Previous records"></textarea>} />
                                <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">Separate each document with a comma (,).</p>
                            </div>
                            <div>
                                <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Additional Information</label>
                                <Controller name="additionalInfo" control={control} render={({ field }) => <textarea {...field} id="additionalInfo" rows="3" className="mt-1 block w-full rounded-lg border-none bg-gray-100 p-3 shadow-inner dark:bg-slate-700" placeholder="e.g., Limited slots available"></textarea>} />
                            </div>
                        </div>
                    </div>
                    {/* Form Footer */}
                    <div className="border-t border-gray-200 dark:border-slate-700 px-6 py-4 flex justify-end items-center gap-4">
                        <button type="button" onClick={() => navigate('/dashboard/manage-camps')} className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600">
                            Cancel
                        </button>
                        <button type="submit" disabled={isPending}
                            className="flex min-w-[180px] items-center justify-center rounded-lg border border-transparent bg-teal-700 px-6 py-3 text-base font-medium text-white shadow-sm transition hover:bg-teal-800 disabled:opacity-60">
                            {isPending ? <CgSpinner className="h-6 w-6 animate-spin" /> : "Save Changes"}
                        </button>
                    </div>
                </div>
            </form>
        </motion.div>
    );
};

export default UpdateCamp;

