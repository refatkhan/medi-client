import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import useAxiosSecure from "../../Hooks/useAxiosSecure";
import { CgSpinner } from "react-icons/cg";
import { HiX } from "react-icons/hi";

const CampsJoinModal = ({ visible, onClose, camp, onJoined, user }) => {
    // --- YOUR LOGIC (UNCHANGED) ---
    const { control, handleSubmit, reset, formState: { errors } } = useForm();
    const axiosSecure = useAxiosSecure();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible) {
            reset({ participantName: user?.displayName || "", age: '', phone: '', gender: '', emergencyContact: '' });
        }
    }, [visible, user, camp, reset]);

    const handleOk = async (formData) => {
        if (loading) return;
        setLoading(true);
        // ... (rest of your submission logic remains exactly the same)
        const payload = { /* ... */ };
        try {
            const response = await axiosSecure.post("/camps-join", payload);
            if (response.data.success || response.status === 200 || response.status === 201) {
                Swal.fire("Success!", "Registration successful! Please proceed to payment to confirm.", "success");
                onJoined();
            } else { throw new Error(response.data.message || "Registration failed"); }
        } catch (error) {
            console.error("Join Error:", error);
            if (error.response?.data?.message === "You have already registered for this camp") {
                Swal.fire("Already Registered", "You have already registered for this camp.", "info");
                onJoined();
            } else { Swal.fire("Error", error.response?.data?.message || "Registration failed. Please try again.", "error"); }
        } finally { setLoading(false); }
    };
    // --- END YOUR LOGIC ---

    // --- Animation Variants ---
    const backdropVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.3 } }, // Simple fade for backdrop
        exit: { opacity: 0, transition: { duration: 0.2 } },
    };

    const modalVariants = {
        hidden: { opacity: 0, y: 30, scale: 0.95 }, // Start slightly lower
        visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 25, delay: 0.1 } }, // Spring animation with slight delay
        exit: { opacity: 0, y: 30, scale: 0.95, transition: { duration: 0.2 } }, // Exit slightly lower
    };

    return (
        <AnimatePresence>
            {visible && (
                // --- Backdrop (Lighter with Blur) ---
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/75 p-4 backdrop-blur-sm" // Changed bg, added blur
                    variants={backdropVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    onClick={onClose}
                >
                    {/* --- Modal Container --- */}
                    <motion.div
                        className="relative w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-2xl"
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* --- Header (Lighter) --- */}
                        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 p-5">
                            <h2 className="text-lg font-semibold text-gray-800"> {/* Adjusted size */}
                                Join: <span className="text-teal-700">{camp?.campName}</span>
                            </h2>
                            <button
                                onClick={onClose}
                                className="text-gray-400 transition hover:text-gray-600 focus:outline-none"
                                aria-label="Close modal"
                            >
                                <HiX className="h-6 w-6" />
                            </button>
                        </div>

                        {/* --- Form Content --- */}
                        <form onSubmit={handleSubmit(handleOk)}>
                            <div className="space-y-5 p-6"> {/* Consistent padding */}
                                {/* Participant Name (Read Only) */}
                                <div>
                                    <label htmlFor="participantName" className="block text-sm font-medium text-gray-700">Participant Name</label>
                                    <input
                                        id="participantName" type="text" value={user?.displayName || ""} readOnly
                                        className="mt-1 block w-full cursor-not-allowed rounded-lg border-gray-300 bg-gray-100 p-3 text-gray-500 shadow-inner focus:outline-none sm:text-sm"
                                    />
                                </div>
                                {/* Age */}
                                <div>
                                    <label htmlFor="age" className="block text-sm font-medium text-gray-700">Age</label>
                                    <Controller name="age" control={control} defaultValue="" rules={{ required: "Age is required", min: { value: 1, message: "Age must be positive" } }}
                                        render={({ field }) => (<input {...field} id="age" type="number" required className={`mt-1 block w-full rounded-lg border-none bg-gray-100 p-3 shadow-inner transition duration-200 ease-in-out focus:bg-white focus:outline-none focus:ring-2 ${errors.age ? 'ring-red-500' : 'focus:ring-teal-500'}`} />)}
                                    />
                                    {errors.age && <p className="mt-1 text-xs text-red-600">{errors.age.message}</p>}
                                </div>
                                {/* Phone */}
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                                    <Controller name="phone" control={control} defaultValue="" rules={{ required: "Phone number is required", pattern: { value: /^[0-9+-]+$/, message: "Invalid phone number" } }}
                                        render={({ field }) => (<input {...field} id="phone" type="tel" required className={`mt-1 block w-full rounded-lg border-none bg-gray-100 p-3 shadow-inner transition duration-200 ease-in-out focus:bg-white focus:outline-none focus:ring-2 ${errors.phone ? 'ring-red-500' : 'focus:ring-teal-500'}`} />)}
                                    />
                                    {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
                                </div>
                                {/* Gender */}
                                <div>
                                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender</label>
                                    <Controller name="gender" control={control} defaultValue="" rules={{ required: "Gender is required" }}
                                        render={({ field }) => (
                                            <select {...field} id="gender" required className={`mt-1 block w-full rounded-lg border-gray-300 bg-gray-100 py-3 pl-3 pr-8 shadow-inner focus:border-teal-500 focus:outline-none focus:ring-1 ${errors.gender ? 'ring-red-500' : 'focus:ring-teal-500'} sm:text-sm`} >
                                                <option value="" disabled>Select Gender</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        )}
                                    />
                                    {errors.gender && <p className="mt-1 text-xs text-red-600">{errors.gender.message}</p>}
                                </div>
                                {/* Emergency Contact */}
                                <div>
                                    <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700">Emergency Contact</label>
                                    <Controller name="emergencyContact" control={control} defaultValue="" rules={{ required: "Emergency contact is required", pattern: { value: /^[0-9+-]+$/, message: "Invalid phone number" } }}
                                        render={({ field }) => (<input {...field} id="emergencyContact" type="tel" required className={`mt-1 block w-full rounded-lg border-none bg-gray-100 p-3 shadow-inner transition duration-200 ease-in-out focus:bg-white focus:outline-none focus:ring-2 ${errors.emergencyContact ? 'ring-red-500' : 'focus:ring-teal-500'}`} />)}
                                    />
                                    {errors.emergencyContact && <p className="mt-1 text-xs text-red-600">{errors.emergencyContact.message}</p>}
                                </div>
                            </div>

                            {/* --- Actions --- */}
                            <div className="flex items-center justify-end gap-4 border-t border-gray-200 bg-gray-50 px-6 py-4">
                                <button type="button" onClick={onClose}
                                    className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2" >
                                    Cancel
                                </button>
                                <button type="submit" disabled={loading}
                                    className="flex min-w-[150px] items-center justify-center rounded-lg border border-transparent bg-teal-700 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-teal-800 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed" >
                                    {loading ? (<CgSpinner className="h-5 w-5 animate-spin" />) : ("Register & Proceed")}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CampsJoinModal;