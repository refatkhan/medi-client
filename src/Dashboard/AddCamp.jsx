import React, { useContext, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AuthContext } from '../Provider/AuthProvider'; // RESTORED
import { imageUpload } from '../api/utils';
import useAxiosSecure from '../Hooks/useAxiosSecure';
import Swal from 'sweetalert2';
import { Helmet } from 'react-helmet-async';
import { CgSpinner } from 'react-icons/cg';
import { HiOutlineDocumentAdd, HiOutlinePhotograph, HiX, HiPlus, HiTrash } from 'react-icons/hi';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

const AddCamp = () => {
    // --- YOUR ORIGINAL LOGIC & STATE (RESTORED) ---
    const { user } = useContext(AuthContext);
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    const [fileName, setFileName] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [uploadedImage, setUploadedImage] = useState(null);
    const [imageUploadError, setImageUploadError] = useState(null);
    const [scheduleItems, setScheduleItems] = useState([{ time: '', activity: '' }]);

    const { mutate, isPending } = useMutation({
        mutationFn: async (campData) => {
            const res = await axiosSecure.post("/camps", campData);
            return res.data;
        },
        onSuccess: () => {
            Swal.fire({
                icon: "success",
                title: "Camp Added!",
                text: "The medical camp has been successfully added.",
                confirmButtonColor: '#0d9488',
            }).then(() => {
                reset();
                setUploadedImage(null);
                setFileName("");
                setScheduleItems([{ time: '', activity: '' }]);
                queryClient.invalidateQueries({ queryKey: ['organizer-camps'] });
            });
        },
        onError: (error) => {
            Swal.fire({
                icon: "error",
                title: "Failed!",
                text: error.response?.data?.message || "Failed to add camp. Please try again.",
            });
        },
    });

    const onSubmit = async (data) => {
        if (!user) {
            toast.error("Authentication error. Please log in again.");
            return;
        }
        setIsUploading(true); // Your original logic
        try {
            let imageUrl = uploadedImage;
            // Your original logic for handling image if not already uploaded from the button's onChange
            if (data.image && data.image[0] && !imageUrl) {
                imageUrl = await imageUpload(data.image[0]);
                setUploadedImage(imageUrl);
            }

            if (!imageUrl) {
                setImageUploadError("A camp image is required.");
                setIsUploading(false); // Make sure to stop loading
                return;
            }

            const detailedServicesArray = data.detailedServices.split(',').map(item => item.trim()).filter(Boolean);
            const requiredDocumentsArray = data.requiredDocuments.split(',').map(item => item.trim()).filter(Boolean);
            const validScheduleItems = scheduleItems.filter(item => item.time && item.activity);

            const newCamp = {
                campName: data.campName,
                image: imageUrl,
                fees: parseFloat(data.fees),
                organizerName: user.displayName,
                organizerEmail: user.email,
                dateTime: data.dateTime,
                location: data.location,
                doctorName: data.doctorName,
                participants: 0,
                detailedServices: detailedServicesArray,
                targetAudience: data.targetAudience,
                schedule: validScheduleItems,
                requiredDocuments: requiredDocumentsArray,
                additionalInfo: data.additionalInfo,
            };
            mutate(newCamp);
        } catch (error) {
            setImageUploadError("Image upload failed");
            toast.error("Failed to process image.");
        } finally {
            setIsUploading(false); // Your original logic
        }
    };

    const handleScheduleChange = (index, event) => {
        const values = [...scheduleItems];
        values[index][event.target.name] = event.target.value;
        setScheduleItems(values);
    };

    const handleAddScheduleItem = () => {
        setScheduleItems([...scheduleItems, { time: '', activity: '' }]);
    };

    const handleRemoveScheduleItem = (index) => {
        if (scheduleItems.length > 1) {
            const values = [...scheduleItems];
            values.splice(index, 1);
            setScheduleItems(values);
        }
    };
    // --- END OF YOUR LOGIC ---

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Helmet>
                <title>Add Camp | MediCamp Dashboard</title>
            </Helmet>

            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="rounded-lg bg-white dark:bg-slate-800 shadow-sm">
                    <div className="flex items-center gap-4 border-b border-gray-200 dark:border-slate-700 p-6">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-600 dark:bg-slate-700 dark:text-teal-400">
                            <HiOutlineDocumentAdd className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">Add a New Camp</h2>
                            <p className="text-sm text-gray-500 dark:text-slate-400">Create and configure a new camp.</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
                        {/* --- LEFT COLUMN --- */}
                        <div className="md:col-span-2 space-y-6">
                            <div>
                                <label htmlFor="campName" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Camp Name</label>
                                <input id="campName" type="text" {...register("campName", { required: "Camp Name is required" })}
                                    className={`mt-1 block w-full rounded-lg border-none bg-gray-100 p-3 shadow-inner transition dark:bg-slate-700 dark:text-slate-200 focus:bg-white focus:outline-none focus:ring-2 ${errors.campName ? 'ring-red-500' : 'focus:ring-teal-500'}`} />
                                {errors.campName && <p className="mt-1 text-xs text-red-600">{errors.campName.message}</p>}
                            </div>
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Main Description</label>
                                <textarea id="description" rows="4" {...register("description", { required: "Description is required" })}
                                    className={`mt-1 block w-full rounded-lg border-none bg-gray-100 p-3 shadow-inner transition dark:bg-slate-700 dark:text-slate-200 focus:bg-white focus:outline-none focus:ring-2 ${errors.description ? 'ring-red-500' : 'focus:ring-teal-500'}`}></textarea>
                                {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>}
                            </div>

                            <div>
                                <label htmlFor="detailedServices" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Detailed Services</label>
                                <textarea id="detailedServices" rows="3" {...register("detailedServices", { required: "List at least one service." })}
                                    placeholder="e.g., Blood Pressure Check, Dental Screening, Eye Test"
                                    className={`mt-1 block w-full rounded-lg border-none bg-gray-100 p-3 shadow-inner transition dark:bg-slate-700 dark:text-slate-200 focus:bg-white focus:outline-none focus:ring-2 ${errors.detailedServices ? 'ring-red-500' : 'focus:ring-teal-500'}`}></textarea>
                                <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">Separate each service with a comma (,).</p>
                                {errors.detailedServices && <p className="mt-1 text-xs text-red-600">{errors.detailedServices.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Camp Schedule</label>
                                <div className="space-y-3 mt-1">
                                    {scheduleItems.map((item, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <input type="text" name="time" placeholder="e.g., 9:00 AM" value={item.time} onChange={e => handleScheduleChange(index, e)} className="block w-1/3 rounded-lg border-none bg-gray-100 p-2 shadow-inner dark:bg-slate-700 dark:text-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500" />
                                            <input type="text" name="activity" placeholder="Activity Description" value={item.activity} onChange={e => handleScheduleChange(index, e)} className="block w-2/3 rounded-lg border-none bg-gray-100 p-2 shadow-inner dark:bg-slate-700 dark:text-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500" />
                                            <button type="button" onClick={() => handleRemoveScheduleItem(index)} className="p-2 text-red-500 hover:text-red-700 disabled:opacity-50" disabled={scheduleItems.length === 1}>
                                                <HiTrash className="h-5 w-5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <button type="button" onClick={handleAddScheduleItem} className="mt-2 flex items-center gap-1 text-sm font-medium text-teal-600 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300">
                                    <HiPlus className="h-4 w-4" /> Add Item
                                </button>
                            </div>
                        </div>

                        {/* --- RIGHT COLUMN --- */}
                        <div className="md:col-span-1 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Camp Image</label>
                                <div className={`mt-1 flex justify-center rounded-lg border-2 border-dashed ${imageUploadError ? 'border-red-400' : 'border-gray-300 dark:border-slate-600'} px-6 pt-5 pb-6`}>
                                    <div className="space-y-1 text-center">
                                        {uploadedImage && !isUploading ? (
                                            <div className="relative group">
                                                <img src={uploadedImage} alt="Preview" className="mx-auto h-24 w-24 rounded-md object-cover" />
                                                <button type="button" onClick={() => { setUploadedImage(null); setFileName(""); reset({ image: null }); }} className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <HiX className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ) : isUploading ? (
                                            <div className="flex flex-col items-center justify-center h-24">
                                                <CgSpinner className="h-8 w-8 animate-spin text-teal-500" />
                                                <p className="text-sm text-gray-500 dark:text-slate-400 mt-2">Uploading...</p>
                                            </div>
                                        ) : (
                                            <>
                                                <HiOutlinePhotograph className="mx-auto h-12 w-12 text-gray-400" />
                                                <div className="flex text-sm text-gray-600 dark:text-slate-400">
                                                    <label htmlFor="image" className="relative cursor-pointer rounded-md font-medium text-teal-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-teal-500 focus-within:ring-offset-2 hover:text-teal-500">
                                                        <span>Upload a file</span>
                                                        <input id="image" type="file" className="sr-only" {...register("image", { required: !uploadedImage })}
                                                            onChange={async (e) => {
                                                                if (e.target.files[0]) {
                                                                    const file = e.target.files[0];
                                                                    setFileName(file.name);
                                                                    setIsUploading(true);
                                                                    setImageUploadError(null);
                                                                    try {
                                                                        const url = await imageUpload(file);
                                                                        setUploadedImage(url);
                                                                    } catch (error) { setImageUploadError("Image upload failed"); }
                                                                    finally { setIsUploading(false); }
                                                                }
                                                            }} />
                                                    </label>
                                                    <p className="pl-1">or drag and drop</p>
                                                </div>
                                                <p className="text-xs text-gray-500 dark:text-slate-500">PNG, JPG up to 10MB</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                                {imageUploadError && <p className="mt-1 text-xs text-red-600">{imageUploadError}</p>}
                            </div>

                            <div>
                                <label htmlFor="fees" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Camp Fees ($)</label>
                                <input id="fees" type="number" step="0.01" {...register("fees", { required: "Fees required", min: { value: 0, message: "Fees cannot be negative" } })} className={`mt-1 block w-full rounded-lg border-none bg-gray-100 p-3 shadow-inner dark:bg-slate-700 ${errors.fees ? 'ring-red-500' : 'focus:ring-teal-500'}`} />
                                {errors.fees && <p className="mt-1 text-xs text-red-600">{errors.fees.message}</p>}
                            </div>
                            <div>
                                <label htmlFor="dateTime" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Date & Time</label>
                                <input id="dateTime" type="datetime-local" {...register("dateTime", { required: "Date and time required" })} className={`mt-1 block w-full rounded-lg border-none bg-gray-100 p-3 shadow-inner dark:bg-slate-700 ${errors.dateTime ? 'ring-red-500' : 'focus:ring-teal-500'}`} />
                                {errors.dateTime && <p className="mt-1 text-xs text-red-600">{errors.dateTime.message}</p>}
                            </div>
                            <div>
                                <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Location</label>
                                <input id="location" type="text" {...register("location", { required: "Location is required" })} className={`mt-1 block w-full rounded-lg border-none bg-gray-100 p-3 shadow-inner dark:bg-slate-700 ${errors.location ? 'ring-red-500' : 'focus:ring-teal-500'}`} />
                                {errors.location && <p className="mt-1 text-xs text-red-600">{errors.location.message}</p>}
                            </div>
                            <div>
                                <label htmlFor="doctorName" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Healthcare Professional</label>
                                <input id="doctorName" type="text" {...register("doctorName", { required: "Doctor's name is required" })} className={`mt-1 block w-full rounded-lg border-none bg-gray-100 p-3 shadow-inner dark:bg-slate-700 ${errors.doctorName ? 'ring-red-500' : 'focus:ring-teal-500'}`} />
                                {errors.doctorName && <p className="mt-1 text-xs text-red-600">{errors.doctorName.message}</p>}
                            </div>
                            <div>
                                <label htmlFor="targetAudience" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Target Audience</label>
                                <input id="targetAudience" type="text" {...register("targetAudience", { required: "Target audience is required" })} placeholder="e.g., General Public, Elderly"
                                    className={`mt-1 block w-full rounded-lg border-none bg-gray-100 p-3 shadow-inner dark:bg-slate-700 ${errors.targetAudience ? 'ring-red-500' : 'focus:ring-teal-500'}`} />
                                {errors.targetAudience && <p className="mt-1 text-xs text-red-600">{errors.targetAudience.message}</p>}
                            </div>
                            <div>
                                <label htmlFor="requiredDocuments" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Required Documents</label>
                                <textarea id="requiredDocuments" rows="2" {...register("requiredDocuments")} placeholder="e.g., NID Card, Previous records"
                                    className="mt-1 block w-full rounded-lg border-none bg-gray-100 p-3 shadow-inner dark:bg-slate-700"></textarea>
                                <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">Separate each document with a comma (,).</p>
                            </div>
                            <div>
                                <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Additional Information</label>
                                <textarea id="additionalInfo" rows="3" {...register("additionalInfo")} placeholder="e.g., Limited slots available"
                                    className="mt-1 block w-full rounded-lg border-none bg-gray-100 p-3 shadow-inner dark:bg-slate-700"></textarea>
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-gray-200 dark:border-slate-700 px-6 py-4 flex justify-end">
                        <button type="submit" disabled={isPending || isUploading}
                            className="flex min-w-[150px] items-center justify-center rounded-lg border border-transparent bg-teal-700 px-6 py-3 text-base font-medium text-white shadow-sm transition hover:bg-teal-800 disabled:opacity-60 disabled:cursor-wait">
                            {isPending || isUploading ? <CgSpinner className="h-6 w-6 animate-spin" /> : "Add Camp"}
                        </button>
                    </div>
                </div>
            </form>
        </motion.div>
    );
};

export default AddCamp;

