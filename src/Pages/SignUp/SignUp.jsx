import React, { useContext, useState, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom"; // Use react-router-dom
import { FcGoogle } from "react-icons/fc";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { HiOutlineUserAdd, HiOutlineCloudUpload } from "react-icons/hi"; // New icons
import { CgSpinner } from "react-icons/cg";
import { toast } from "react-toastify";
import { AuthContext } from "../../Provider/AuthProvider";
import { imageUpload } from "../../api/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "../../Hooks/useAxiosSecure";
import { useForm, Controller } from "react-hook-form";
import { motion } from "framer-motion";
import Lottie from "lottie-react";
import animationData from "../../assets/Welcome.json"; // Your Lottie animation

// --- MUI Imports are removed ---

const SignUp = () => {
    // --- ALL YOUR LOGIC (UNCHANGED) ---
    const { createUser, updateUserProfile, signInWithGoogle, loading, setUser } =
        useContext(AuthContext);
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const axiosSecure = useAxiosSecure();

    const { handleSubmit, control, setValue, watch, formState: { errors } } = useForm();
    const fileInputRef = useRef(null);

    const [showPass, setShowPass] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const selectedFile = watch("image")?.[0]; // Get the actual file object

    const addUserToDB = useMutation({
        mutationFn: async (userInfo) => {
            const res = await axiosSecure.post("/users", userInfo);
            return res.data;
        },
        onSuccess: () => queryClient.invalidateQueries(["users"]),
        onError: (error) => {
            console.error("Add User to DB Error:", error);
            toast.error("Failed to save user to database.");
        },
    });

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setValue("image", e.target.files); // React Hook Form needs the FileList
        if (file) {
            const reader = new FileReader();
            reader.onload = () => setPreviewImage(reader.result);
            reader.readAsDataURL(file);
        } else {
            setPreviewImage(null);
        }
    };

    const onSubmit = async (data) => {
        const { name, email, password, image } = data;
        if (!image || image.length === 0) return toast.error("Please select a profile image!");

        try {
            const imageUrl = await imageUpload(image[0]);
            const result = await createUser(email, password);
            const createdUser = result.user;

            await updateUserProfile(name, imageUrl);
            setUser({ ...createdUser, displayName: name, photoURL: imageUrl }); // Update context user

            const userInfo = {
                name,
                email,
                photoURL: imageUrl,
                role: "user",
                created_at: new Date().toISOString(),
                last_log_in: new Date().toISOString(),
            };
            await addUserToDB.mutateAsync(userInfo);

            toast.success("Registration successful! Welcome to MediCamp.");
            navigate("/"); // Navigate to home after successful registration
        } catch (err) {
            console.error("Signup Error:", err);
            toast.error(err?.message || "Signup failed. Please try again.");
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            const result = await signInWithGoogle();
            const userData = {
                name: result.user.displayName,
                email: result.user.email,
                photoURL: result.user.photoURL,
                role: "user",
                created_at: new Date().toISOString(),
                last_log_in: new Date().toISOString(),
            };
            await addUserToDB.mutateAsync(userData);
            toast.success("Google Signup successful! Welcome to MediCamp.");
            navigate("/");
        } catch (err) {
            console.error("Google Signup Error:", err);
            toast.error(err?.message || "Google Signup failed. Please try again.");
        }
    };
    // --- END OF YOUR LOGIC ---

    return (
        <div>
            <Helmet>
                <title>Sign Up | MediCamp</title>
                <meta name="description" content="Create a new account to access your dashboard and register for camps." />
            </Helmet>

            {/* --- Fullscreen Container (NEW DESIGN - matches SignIn) --- */}
            <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 py-12">

                {/* --- Main Content Area (Lottie + Form) --- */}
                <div className="flex w-full max-w-6xl flex-col items-center justify-center gap-12 md:flex-row">

                    {/* --- Lottie Animation (Left Side on Desktop) --- */}
                    <motion.div
                        className="hidden md:block md:w-1/2 lg:w-2/5"
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <Lottie
                            animationData={animationData}
                            loop={true}
                            style={{ width: "100%", height: "auto" }}
                        />
                    </motion.div>

                    {/* --- Form Card (Right Side on Desktop) --- */}
                    <motion.div
                        className="w-full max-w-lg"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="rounded-xl bg-white p-8 shadow-xl">
                            {/* Header */}
                            <div className="text-center">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                                    <HiOutlineUserAdd className="h-6 w-6" />
                                </div>
                                <h2 className="mt-4 text-2xl font-bold tracking-tight text-gray-800">
                                    Create your account
                                </h2>
                                <p className="mt-2 text-sm text-gray-600">
                                    Join the MediCamp community today.
                                </p>
                            </div>

                            {/* Form */}
                            <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                                {/* Full Name */}
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                                    <Controller
                                        name="name"
                                        control={control}
                                        defaultValue=""
                                        rules={{ required: "Full Name is required" }}
                                        render={({ field }) => (
                                            <input
                                                {...field}
                                                id="name"
                                                type="text"
                                                required
                                                className={`mt-1 block w-full rounded-lg border-none bg-gray-100 p-3 shadow-inner transition duration-200 ease-in-out focus:bg-white focus:outline-none focus:ring-2 ${errors.name ? 'ring-red-500' : 'focus:ring-teal-500'}`}
                                            />
                                        )}
                                    />
                                    {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
                                </div>

                                {/* Profile Image Upload (NEW DESIGN) */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Profile Image</label>
                                    <input
                                        type="file"
                                        name="image"
                                        accept="image/*"
                                        ref={fileInputRef}
                                        style={{ display: "none" }}
                                        onChange={handleImageChange}
                                    />
                                    <button
                                        type="button" // Important: prevents form submission
                                        onClick={() => fileInputRef.current.click()}
                                        className="mt-1 flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                                    >
                                        <span className="truncate pr-2">{selectedFile ? selectedFile.name : "Choose a profile image"}</span>
                                        <HiOutlineCloudUpload className="h-5 w-5 text-gray-500 flex-shrink-0" />
                                    </button>
                                    {/* --- Image Preview --- */}
                                    {previewImage && (
                                        <div className="mt-3 flex justify-center">
                                            <img src={previewImage} alt="Preview" className="h-20 w-20 rounded-full object-cover" />
                                        </div>
                                    )}
                                    {/* Simple validation message */}
                                    {errors.image && <p className="mt-1 text-xs text-red-600">{errors.image.message}</p>}
                                </div>


                                {/* Email */}
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
                                    <Controller
                                        name="email"
                                        control={control}
                                        defaultValue=""
                                        rules={{ required: "Email is required", pattern: { value: /\S+@\S+\.\S+/, message: "Enter a valid email" } }}
                                        render={({ field }) => (
                                            <input
                                                {...field}
                                                id="email"
                                                type="email"
                                                autoComplete="email"
                                                required
                                                className={`mt-1 block w-full rounded-lg border-none bg-gray-100 p-3 shadow-inner transition duration-200 ease-in-out focus:bg-white focus:outline-none focus:ring-2 ${errors.email ? 'ring-red-500' : 'focus:ring-teal-500'}`}
                                            />
                                        )}
                                    />
                                    {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
                                </div>

                                {/* Password */}
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                                    <div className="relative mt-1">
                                        <Controller
                                            name="password"
                                            control={control}
                                            defaultValue=""
                                            rules={{ required: "Password is required", minLength: { value: 6, message: "Password must be at least 6 characters" } }}
                                            render={({ field }) => (
                                                <input
                                                    {...field}
                                                    id="password"
                                                    type={showPass ? "text" : "password"}
                                                    required
                                                    className={`block w-full rounded-lg border-none bg-gray-100 p-3 shadow-inner transition duration-200 ease-in-out focus:bg-white focus:outline-none focus:ring-2 ${errors.password ? 'ring-red-500' : 'focus:ring-teal-500'}`}
                                                />
                                            )}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPass(!showPass)}
                                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                                            aria-label={showPass ? "Hide password" : "Show password"}
                                        >
                                            {showPass ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                    {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
                                </div>

                                {/* Submit Button */}
                                <div>
                                    <button
                                        type="submit"
                                        disabled={loading || addUserToDB.isPending} // Use mutation pending state
                                        className="flex w-full justify-center rounded-lg border border-transparent bg-teal-700 px-6 py-3 text-base font-medium text-white shadow-sm transition-all duration-200 hover:bg-teal-800 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-60"
                                    >
                                        {(loading || addUserToDB.isPending) ? (
                                            <CgSpinner className="h-5 w-5 animate-spin" />
                                        ) : (
                                            "Register Now"
                                        )}
                                    </button>
                                </div>
                            </form>

                            {/* Divider */}
                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="w-full border-t border-gray-300" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="bg-white px-2 text-gray-500">Or continue with</span>
                                </div>
                            </div>

                            {/* Google Button */}
                            <div>
                                <button
                                    onClick={handleGoogleSignIn}
                                    disabled={loading || addUserToDB.isPending}
                                    className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-50 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-60"
                                >
                                    <FcGoogle className="h-5 w-5" />
                                    Continue with Google
                                </button>
                            </div>

                            {/* Link to Sign In */}
                            <p className="mt-6 text-center text-sm text-gray-600">
                                Already have an account?{" "}
                                <Link to="/sign-in" className="font-medium text-teal-700 hover:text-teal-600 hover:underline">
                                    Sign in here
                                </Link>
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default SignUp;