import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAuth from '../Hooks/useAuth';
import useAxiosSecure from '../Hooks/useAxiosSecure';
import { imageUpload } from '../api/utils'; // Your image upload helper
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import { CgSpinner } from 'react-icons/cg';
import { HiOutlineMail, HiOutlinePhone, HiPencil, HiX, HiOutlineDocumentText, HiOutlineUsers } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';
import { updateProfile } from "firebase/auth";
import { auth } from '../firebase/firebase-init';

const OrganizerProfile = () => {
    const { user, setUser } = useAuth();
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // State for the new image file in the modal
    const [newImageFile, setNewImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const { data: profileData, isLoading, isError } = useQuery({
        queryKey: ['userProfile', user?.email],
        queryFn: async () => {
            const res = await axiosSecure.get(`/users/role/${user.email}`);
            return { ...res.data, displayName: user.displayName, photoURL: user.photoURL };
        },
        enabled: !!user?.email,
    });

    const { mutate: updateUser, isPending: isUpdating } = useMutation({
        mutationFn: async (updatedData) => {
            let finalPhotoURL = updatedData.photoURL;
            // If a new image file was selected, upload it first
            if (updatedData.newImageFile) {
                finalPhotoURL = await imageUpload(updatedData.newImageFile);
            }

            // Update Firebase Auth
            await updateProfile(auth.currentUser, { 
                displayName: updatedData.name, 
                photoURL: finalPhotoURL 
            });

            // Update your MongoDB via the backend
            const res = await axiosSecure.patch('/update-profile', { 
                email: user.email, 
                name: updatedData.name, 
                photoURL: finalPhotoURL, 
                contact: updatedData.contact 
            });

            // Return the final data to be used in onSuccess
            return { ...updatedData, photoURL: finalPhotoURL };
        },
        onSuccess: (updatedVariables) => {
            toast.success("Profile updated successfully!");
            queryClient.setQueryData(['userProfile', user?.email], (oldData) => ({
                ...oldData,
                displayName: updatedVariables.name,
                photoURL: updatedVariables.photoURL,
                contact: updatedVariables.contact,
            }));
            if (setUser) { setUser(prevUser => ({ ...prevUser, displayName: updatedVariables.name, photoURL: updatedVariables.photoURL })); }
            queryClient.invalidateQueries({ queryKey: ['userProfile', user?.email] });
            setIsModalOpen(false);
            setNewImageFile(null);
            setImagePreview(null);
        },
        onError: (error) => { toast.error(error.response?.data?.message || "Failed to update profile."); },
    });

    const handleUpdateSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        updateUser({
            name: formData.get("name"),
            photoURL: profileData.photoURL, // Pass the original URL
            contact: formData.get("contact"),
            newImageFile: newImageFile, // Pass the new file if it exists
        });
    };

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    if (isLoading) { return <div className="flex h-full items-center justify-center"><CgSpinner className="h-12 w-12 animate-spin text-teal-500" /></div>; }
    if (isError || !profileData) { return <div className="text-center text-red-500 dark:text-red-400">Failed to load profile data.</div>; }

    return (
        <>
            <Helmet><title>My Profile | MediCamp Dashboard</title></Helmet>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* --- Left Column: Main Profile Card --- */}
                <div className="lg:col-span-1">
                    <div className="rounded-xl bg-white dark:bg-slate-800 shadow-lg relative pb-8">
                        {/* Decorative Banner */}
                        <div className="h-28 rounded-t-xl bg-gradient-to-r from-teal-500 to-blue-500"></div>
                        
                        {/* Overlapping Avatar */}
                        <div className="absolute top-16 left-1/2 -translate-x-1/2">
                             <img src={profileData.photoURL || 'https://placehold.co/128x128/E2E8F0/4A5568?text=User'} alt="Profile" className="h-24 w-24 rounded-full object-cover ring-4 ring-white dark:ring-slate-800" />
                        </div>

                        {/* Profile Info */}
                        <div className="mt-16 text-center px-6">
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-slate-100">{profileData.displayName}</h2>
                            <p className="text-sm capitalize text-gray-500 dark:text-slate-400">{profileData.role} Profile</p>
                            <button onClick={() => setIsModalOpen(true)} className="mt-6 w-full rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800">
                                Edit Profile
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- Right Column: Detail Cards --- */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="rounded-xl bg-white dark:bg-slate-800 p-6 shadow-lg">
                         <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-100 border-b border-gray-200 dark:border-slate-700 pb-3 mb-4">Contact Information</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-slate-700"><HiOutlineMail className="h-6 w-6 text-gray-500 dark:text-slate-400" /></div><div><p className="text-xs text-gray-500 dark:text-slate-400">Email Address</p><p className="font-medium text-gray-800 dark:text-slate-200">{profileData.email}</p></div></div>
                            <div className="flex items-center gap-4"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-slate-700"><HiOutlinePhone className="h-6 w-6 text-gray-500 dark:text-slate-400" /></div><div><p className="text-xs text-gray-500 dark:text-slate-400">Contact Number</p><p className="font-medium text-gray-800 dark:text-slate-200">{profileData.contact || 'Not Provided'}</p></div></div>
                        </div>
                    </div>
                     <div className="rounded-xl bg-white dark:bg-slate-800 p-6 shadow-lg">
                         <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-100 border-b border-gray-200 dark:border-slate-700 pb-3 mb-4">Activity Summary</h3>
                        <div className="space-y-4">
                             <div className="flex items-center gap-4"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-slate-700"><HiOutlineDocumentText className="h-6 w-6 text-gray-500 dark:text-slate-400" /></div><div><p className="text-xs text-gray-500 dark:text-slate-400">Camps Organized</p><p className="font-medium text-gray-800 dark:text-slate-200">12 (Placeholder)</p></div></div>
                              <div className="flex items-center gap-4"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-slate-700"><HiOutlineUsers className="h-6 w-6 text-gray-500 dark:text-slate-400" /></div><div><p className="text-xs text-gray-500 dark:text-slate-400">Total Participants</p><p className="font-medium text-gray-800 dark:text-slate-200">1,450 (Placeholder)</p></div></div>
                        </div>
                    </div>
                </div>
            </motion.div>
            
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} >
                        <motion.div className="relative w-full max-w-md rounded-xl bg-white dark:bg-slate-800 shadow-2xl" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} onClick={(e) => e.stopPropagation()} >
                            <div className="flex items-center justify-between border-b border-gray-200 p-5 dark:border-slate-700">
                                <h2 className="text-lg font-semibold text-gray-800 dark:text-slate-100">Update Your Profile</h2>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 transition hover:text-gray-600 dark:hover:text-slate-200 focus:outline-none"><HiX className="h-6 w-6" /></button>
                            </div>
                            <form onSubmit={handleUpdateSubmit}>
                                <div className="space-y-5 p-6">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Full Name</label>
                                        <input id="name" name="name" type="text" required defaultValue={profileData.displayName} className="mt-1 block w-full rounded-lg border-none bg-gray-100 p-3 shadow-inner dark:bg-slate-700 dark:text-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Profile Photo</label>
                                        <div className="mt-1 flex items-center gap-4">
                                            <img src={imagePreview || profileData.photoURL || 'https://placehold.co/128x128/E2E8F0/4A5568?text=User'} alt="Avatar preview" className="h-16 w-16 rounded-full object-cover"/>
                                            <label htmlFor="photo-upload" className="cursor-pointer rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600">
                                                <span>Change</span>
                                                <input id="photo-upload" name="photo" type="file" className="sr-only" onChange={handleImageSelect} accept="image/*"/>
                                            </label>
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="contact" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Contact Number</label>
                                        <input id="contact" name="contact" type="tel" required defaultValue={profileData.contact || ''} className="mt-1 block w-full rounded-lg border-none bg-gray-100 p-3 shadow-inner dark:bg-slate-700 dark:text-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500" />
                                    </div>
                                </div>
                                <div className="flex items-center justify-end gap-4 border-t border-gray-200 bg-gray-50 px-6 py-4 dark:border-slate-700 dark:bg-slate-800/50">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300">Cancel</button>
                                    <button type="submit" disabled={isUpdating} className="flex min-w-[120px] items-center justify-center rounded-lg border bg-teal-700 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-teal-800 disabled:opacity-60">{isUpdating ? <CgSpinner className="h-5 w-5 animate-spin" /> : "Save Changes"}</button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default OrganizerProfile;

