import React, { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router";
import { FcGoogle } from "react-icons/fc";
import { FaStethoscope } from "react-icons/fa";
import { toast } from "react-toastify";
import useAuth from "../../Hooks/useAuth";
import {
    Box,
    Button,
    Card,
    Divider,
    TextField,
    Typography,
    Stack,
    CircularProgress,
} from "@mui/material";
import useAxiosSecure from "../../Hooks/useAxiosSecure";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
const SignIn = () => {
    const { signIn, signInWithGoogle, user } = useAuth();
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location?.state?.from?.pathname || "/";
    const [loading, setLoading] = useState(false);
    const addUserToDB = useMutation({
        mutationFn: async (userInfo) => {
            const res = await axiosSecure.post("/users", userInfo); // use instance here
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
        setLoading(true); // start loading
        try {
            const result = await signIn(email, password);
            console.log("Login Result:", result);
            toast.success("Login Successful! Welcome to MediCamp.");
            navigate(from, { replace: true });
        } catch (err) {
            console.log("Login Error:", err);
            toast.error(err?.message || "Login failed. Please try again.");
            event.target.reset(); // reset form inputs
            setLoading(false); // reset button state
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
    return (
        <div>
            <Helmet>
                <title>Sign In | Medical Camp</title>
                <meta name="description" content="Sign in to access your dashboard and manage your camps." />
            </Helmet>
            <Box
                sx={{
                    minHeight: "100vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    background: "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",
                    p: 2,
                }}
            >
                <Card
                    sx={{
                        width: "100%",
                        maxWidth: 400,
                        p: 4,
                        borderRadius: 3,
                        boxShadow: 8,
                        background: "linear-gradient(180deg, #1c1c1c 0%, #2a2a2a 100%)",
                    }}
                >
                    <Box textAlign="center" mb={3}>
                        <Typography variant="h4" sx={{ color: "#fff", fontWeight: "bold" }} gutterBottom>
                            MediCamp Sign In
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#ccc" }}>
                            Access your medical account
                        </Typography>
                    </Box>

                    <Box component="form" onSubmit={handleSubmit} noValidate>
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Email"
                            name="email"
                            type="email"
                            required
                            sx={{
                                input: { color: "#fff" },
                                label: { color: "#aaa" },
                                "& .MuiOutlinedInput-root": {
                                    "& fieldset": { borderColor: "#555" },
                                    "&:hover fieldset": { borderColor: "#888" },
                                    "&.Mui-focused fieldset": { borderColor: "#4dabf5" },
                                },
                            }}
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Password"
                            name="password"
                            type="password"
                            required
                            sx={{
                                input: { color: "#fff" },
                                label: { color: "#aaa" },
                                "& .MuiOutlinedInput-root": {
                                    "& fieldset": { borderColor: "#555" },
                                    "&:hover fieldset": { borderColor: "#888" },
                                    "&.Mui-focused fieldset": { borderColor: "#4dabf5" },
                                },
                            }}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            sx={{
                                mt: 2,
                                mb: 2,
                                background: "linear-gradient(90deg, #2196f3 0%, #21cbf3 100%)",
                                color: "#fff",
                                fontWeight: "bold",
                                "&:hover": {
                                    background: "linear-gradient(90deg, #21cbf3 0%, #2196f3 100%)",
                                },
                            }}
                            disabled={loading}
                            startIcon={loading ? <CircularProgress size={20} /> : <FaStethoscope />}
                        >
                            {loading ? "Logging in..." : "Login"}
                        </Button>
                    </Box>

                    <Stack direction="row" alignItems="center" spacing={1} my={2}>
                        <Divider flexItem sx={{ bgcolor: "#555" }} />
                        <Typography variant="body2" sx={{ color: "#aaa" }}>
                            or continue with
                        </Typography>
                        <Divider flexItem sx={{ bgcolor: "#555" }} />
                    </Stack>

                    <Button
                        fullWidth
                        variant="contained"
                        startIcon={<FcGoogle size={20} />}
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                        sx={{
                            mb: 1,
                            background: "linear-gradient(90deg, #4285F4 0%, #34A853 50%, #FBBC05 100%)",
                            color: "#fff",
                            fontWeight: "bold",
                            "&:hover": {
                                background: "linear-gradient(90deg, #34A853 0%, #4285F4 50%, #FBBC05 100%)",
                            },
                        }}
                    >
                        Continue with Google
                    </Button>

                    <Typography variant="body2" textAlign="center" mt={3} sx={{ color: "#aaa" }}>
                        Don’t have an account?{" "}
                        <Link to="/sign-up" style={{ color: "#21cbf3", textDecoration: "none" }}>
                            Register
                        </Link>
                    </Typography>
                </Card>
            </Box>
        </div>
    );
};

export default SignIn;
