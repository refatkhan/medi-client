import React, { useContext, useState, useRef } from "react";
import {
    Box,
    Button,
    Container,
    Divider,
    FormControl,
    IconButton,
    InputAdornment,
    OutlinedInput,
    Stack,
    Typography,
    TextField,
    InputLabel,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { Link, useNavigate } from "react-router";
import { FcGoogle } from "react-icons/fc";
import { FaEye, FaEyeSlash, FaStethoscope } from "react-icons/fa";
import { toast } from "react-toastify";
import { AuthContext } from "../../Provider/AuthProvider";
import { imageUpload } from "../../api/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "../../Hooks/useAxiosSecure";
import { useForm, Controller } from "react-hook-form";
import { motion } from "framer-motion";
import Lottie from "lottie-react";
import animationData from "../../assets/Welcome.json"; // Replace with your Lottie JSON

const SignUp = () => {
    const { createUser, updateUserProfile, signInWithGoogle, loading, setUser } =
        useContext(AuthContext);
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const axiosSecure = useAxiosSecure();

    const {
        handleSubmit,
        control,
        setValue,
        watch,
        formState: { errors },
    } = useForm();

    const [showPass, setShowPass] = useState(false);
    const fileInputRef = useRef(null);
    const selectedFileName = watch("image")?.[0]?.name || "";

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

    const onSubmit = async (data) => {
        const { name, email, password, image } = data;
        if (!image || image.length === 0)
            return toast.error("Please select a profile image!");
        try {
            const imageUrl = await imageUpload(image[0]);
            const result = await createUser(email, password);
            const createdUser = result.user;

            await updateUserProfile(name, imageUrl);
            setUser({ ...createdUser, displayName: name, photoURL: imageUrl });

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
            navigate("/");
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

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, #c3ecb2, #89f7fe)",
                py: 6,
            }}
        >
            <Container
                maxWidth="lg"
                sx={{
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    alignItems: "center",
                    justifyContent: "center",
                    gap: { xs: 4, md: 8 },
                }}
            >
                {/* Lottie Animation */}
                <motion.div
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    style={{ width: "100%", maxWidth: 400 }}
                >
                    <Box display="flex" justifyContent="center" alignItems="center">
                        <Lottie
                            animationData={animationData}
                            loop={true}
                            style={{
                                width: "100%",
                                height: "100%",
                                maxHeight: 400,
                            }}
                        />
                    </Box>
                </motion.div>

                {/* Form */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <Box
                        sx={{
                            flex: 1,
                            p: { xs: 4, md: 5 },
                            borderRadius: 3,
                            boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
                            bgcolor: "rgba(255,255,255,0.25)",
                            background: "linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.3))",
                            backdropFilter: "blur(20px)",
                            border: "1px solid rgba(255,255,255,0.3)",
                            width: { xs: "100%", md: 480 },
                            mt: { xs: 4, md: 0 },
                        }}
                    >
                        <Box textAlign="center" mb={4}>
                            <Typography
                                variant="h4"
                                color="primary"
                                fontWeight="bold"
                                gutterBottom
                                sx={{ textShadow: "1px 1px 3px rgba(0,0,0,0.2)" }}
                            >
                                MediCamp Sign Up
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Join our medical community
                            </Typography>
                        </Box>

                        <form onSubmit={handleSubmit(onSubmit)}>
                            <Stack spacing={3}>
                                <Controller
                                    name="name"
                                    control={control}
                                    defaultValue=""
                                    rules={{ required: "Full Name is required" }}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="Full Name"
                                            error={!!errors.name}
                                            helperText={errors.name?.message}
                                            fullWidth
                                            sx={{
                                                background: "rgba(255,255,255,0.6)",
                                                borderRadius: 2,
                                                "& .MuiOutlinedInput-root": { borderRadius: 2 },
                                            }}
                                        />
                                    )}
                                />

                                {/* File Upload */}
                                <Box>
                                    <input
                                        type="file"
                                        name="image"
                                        accept="image/*"
                                        ref={fileInputRef}
                                        style={{ display: "none" }}
                                        onChange={(e) => setValue("image", e.target.files)}
                                    />
                                    <Button
                                        variant="outlined"
                                        fullWidth
                                        onClick={() => fileInputRef.current.click()}
                                        startIcon={<CloudUploadIcon />}
                                        sx={{
                                            justifyContent: "space-between",
                                            textTransform: "none",
                                            borderRadius: 2,
                                            borderColor: "#1976d2",
                                            color: "#1976d2",
                                            fontWeight: 500,
                                            background: "transparent",
                                            "&:hover": {
                                                background: "linear-gradient(90deg, #1976d2, #42a5f5)",
                                                color: "#fff",
                                                boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                                            },
                                            transition: "all 0.3s ease",
                                        }}
                                    >
                                        {selectedFileName ? selectedFileName : "Upload Profile Image"}
                                    </Button>
                                </Box>

                                <Controller
                                    name="email"
                                    control={control}
                                    defaultValue=""
                                    rules={{
                                        required: "Email is required",
                                        pattern: {
                                            value: /\S+@\S+\.\S+/,
                                            message: "Enter a valid email",
                                        },
                                    }}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="Email"
                                            type="email"
                                            error={!!errors.email}
                                            helperText={errors.email?.message}
                                            fullWidth
                                            sx={{
                                                background: "rgba(255,255,255,0.6)",
                                                borderRadius: 2,
                                                "& .MuiOutlinedInput-root": { borderRadius: 2 },
                                            }}
                                        />
                                    )}
                                />

                                <Controller
                                    name="password"
                                    control={control}
                                    defaultValue=""
                                    rules={{
                                        required: "Password is required",
                                        minLength: { value: 6, message: "Min 6 characters" },
                                    }}
                                    render={({ field }) => (
                                        <FormControl
                                            variant="outlined"
                                            fullWidth
                                            sx={{ background: "rgba(255,255,255,0.6)", borderRadius: 2 }}
                                        >
                                            <InputLabel htmlFor="password">Password</InputLabel>
                                            <OutlinedInput
                                                {...field}
                                                id="password"
                                                type={showPass ? "text" : "password"}
                                                endAdornment={
                                                    <InputAdornment position="end">
                                                        <IconButton
                                                            onClick={() => setShowPass(!showPass)}
                                                            edge="end"
                                                        >
                                                            {showPass ? <FaEyeSlash /> : <FaEye />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                }
                                                label="Password"
                                                sx={{ borderRadius: 2 }}
                                            />
                                            {errors.password && (
                                                <Typography color="error" variant="caption">
                                                    {errors.password.message}
                                                </Typography>
                                            )}
                                        </FormControl>
                                    )}
                                />

                                {/* Register Button */}
                                <Button
                                    type="submit"
                                    variant="contained"
                                    fullWidth
                                    sx={{
                                        background: "linear-gradient(90deg, #1976d2, #42a5f5)",
                                        color: "#fff",
                                        fontWeight: 600,
                                        py: 1.5,
                                        borderRadius: 2,
                                        "&:hover": {
                                            background: "linear-gradient(90deg, #42a5f5, #1976d2)",
                                        },
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                                        transition: "all 0.3s ease",
                                    }}
                                    startIcon={loading && <FaStethoscope className="animate-pulse" />}
                                >
                                    {loading ? "Registering..." : "Register Now"}
                                </Button>

                                {/* Google Sign-In Button */}
                                <Button
                                    variant="contained"
                                    fullWidth
                                    onClick={handleGoogleSignIn}
                                    startIcon={<FcGoogle />}
                                    sx={{
                                        mt: 2,
                                        background: "linear-gradient(90deg, #f44336, #ff7961)",
                                        color: "#fff",
                                        fontWeight: 600,
                                        py: 1.5,
                                        borderRadius: 2,
                                        "&:hover": {
                                            background: "linear-gradient(90deg, #ff7961, #f44336)",
                                        },
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                                        transition: "all 0.3s ease",
                                    }}
                                >
                                    Continue with Google
                                </Button>
                            </Stack>
                        </form>

                        <Box my={3} display="flex" alignItems="center">
                            <Divider sx={{ flexGrow: 1 }} />
                            <Typography sx={{ mx: 2 }} variant="body2" color="text.secondary">
                                or already have an account?
                            </Typography>
                            <Divider sx={{ flexGrow: 1 }} />
                        </Box>

                        <Box
                            display="flex"
                            justifyContent="center"
                            alignItems="center"
                            mt={3}
                            gap={1}
                        >
                            <Typography variant="body2" color="text.secondary">
                                Already have an account ?
                            </Typography>
                            <Button
                                component={Link}
                                to="/sign-in"
                                variant="text"
                                sx={{
                                    color: "primary.main",
                                    fontWeight: 600,
                                    textTransform: "none",
                                    background: "linear-gradient(90deg, #1976d2, #42a5f5)",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    "&:hover": {
                                        opacity: 0.8,
                                        background: "linear-gradient(90deg, #42a5f5, #1976d2)",
                                        WebkitBackgroundClip: "text",
                                        WebkitTextFillColor: "transparent",
                                    },
                                }}
                            >
                                Login
                            </Button>
                        </Box>
                    </Box>
                </motion.div>
            </Container>
        </Box>
    );
};

export default SignUp;
