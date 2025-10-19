import React, { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { HiOutlineKey } from "react-icons/hi"; // --- 1. ICON CHANGED ---
import { CgSpinner } from "react-icons/cg";
import { toast } from "react-toastify";
import useAuth from "../../Hooks/useAuth";
import useAxiosSecure from "../../Hooks/useAxiosSecure";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";

const SignIn = () => {
    // --- All your logic remains unchanged ---
    const { signIn, signInWithGoogle, user } = useAuth();
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location?.state?.from?.pathname || "/";
    const [loading, setLoading] = useState(false);

    const addUserToDB = useMutation({
        mutationFn: async (userInfo) => {
            const res = await axiosSecure.post("/users", userInfo);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["users"]);
        },
    });

    const handleSubmit = async (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const email = data.get("email");
        const password = data.get("password");
        setLoading(true);
        try {
            const result = await signIn(email, password);
            toast.success("Login Successful! Welcome to MediCamp.");
            navigate(from, { replace: true });
        } catch (err) {
            toast.error(err?.message || "Login failed. Please try again.");
            setLoading(false);
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
            navigate(from, { replace: true });
        } catch (err) {
            toast.error(err?.message || "Google Signup failed. Please try again.");
        }
    };

    if (user) {
        return <Navigate to={from} replace={true} />;
    }

    return (
        <div>
            <Helmet>
                <title>Sign In | MediCamp</title>
                <meta name="description" content="Sign in to access your dashboard and manage your camps." />
            </Helmet>

            {/* --- We are keeping bg-gray-50. It's the best choice. --- */}
            <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">

                <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-xl">

                    {/* --- Header with NEW ICON --- */}
                    <div className="text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                            <HiOutlineKey className="h-6 w-6" />
                        </div>
                        <h2 className="mt-4 text-2xl font-bold tracking-tight text-gray-800">
                            Sign in to your account
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Welcome back to MediCamp.
                        </p>
                    </div>

                    {/* Form */}
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>

                        {/* Email Input */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="mt-1 block w-full rounded-lg border-none bg-gray-100 p-3 shadow-inner transition duration-200 ease-in-out focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                        </div>

                        {/* Password Input */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="mt-1 block w-full rounded-lg border-none bg-gray-100 p-3 shadow-inner transition duration-200 ease-in-out focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                        </div>

                        {/* --- Submit Button (NEW HOVER EFFECT) --- */}
                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex w-full justify-center rounded-lg border border-transparent bg-teal-700 px-6 py-3 text-base font-medium text-white shadow-sm transition-all duration-200 hover:bg-teal-800 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-60"
                            >
                                {loading ? (
                                    <CgSpinner className="h-5 w-5 animate-spin" />
                                ) : (
                                    "Sign In"
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
                            <span className="bg-white px-2 text-gray-500">
                                Or continue with
                            </span>
                        </div>
                    </div>

                    {/* --- Google Button (NEW HOVER EFFECT) --- */}
                    <div>
                        <button
                            onClick={handleGoogleSignIn}
                            disabled={loading}
                            className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-50 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-60"
                        >
                            <FcGoogle className="h-5 w-5" />
                            Continue with Google
                        </button>
                    </div>

                    {/* Link to Sign Up */}
                    <p className="mt-6 text-center text-sm text-gray-600">
                        Don’t have an account?{" "}
                        <Link
                            to="/sign-up"
                            className="font-medium text-teal-700 hover:text-teal-600 hover:underline"
                        >
                            Register here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignIn;