import { useMutation } from "@tanstack/react-query";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { AuthContext } from "../Provider/AuthProvider";
import { imageUpload } from "../api/utils";
import useAxiosSecure from "../Hooks/useAxiosSecure";
import Swal from "sweetalert2";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import {
    Box,
    Button,
    Container,
    TextField,
    Typography,
    CircularProgress,
} from "@mui/material";
import { Helmet } from "react-helmet-async";
const AddCamp = () => {
    const { user } = React.useContext(AuthContext);
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm();
    const axiosSecure = useAxiosSecure();
    const [fileName, setFileName] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [uploadedImage, setUploadedImage] = useState(null);
    const [imageUploadError, setImageUploadError] = useState(null);

    const { mutate, isPending } = useMutation({
        mutationFn: async (campData) => {
            const res = await axiosSecure.post("http://localhost:3000/camps", campData);
            return res.data;
        },
        onSuccess: () => {
            Swal.fire({
                icon: "success",
                title: "Camp Added!",
                text: "The medical camp has been successfully added.",
                confirmButtonText: "OK",
            }).then(() => {
                reset();
                setUploadedImage(null);
            });
        },
        onError: (error) => {
            console.error("Mutation Error:", error);
            Swal.fire({
                icon: "error",
                title: "Failed!",
                text: "Failed to add camp. Please try again.",
                confirmButtonText: "OK",
            });
        },
    });

    const onSubmit = async (data) => {
        setIsUploading(true);
        try {
            let imageUrl = uploadedImage;
            if (data.image && data.image[0]) {
                imageUrl = await imageUpload(data.image[0]);
                setUploadedImage(imageUrl);
            }

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
                description: data.description,
            };

            mutate(newCamp);
        } catch (error) {
            setImageUploadError("Image upload failed");
            toast.error("Failed to process image.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div>
            <Helmet>
                <title>Add Camp | Organizer Dashboard</title>
                <meta name="description" content="Add a new camp to your organizer profile and manage camp details." />
            </Helmet>

            <Container
                maxWidth="md"
                sx={{
                    py: { xs: 3, sm: 4, md: 6 },
                    px: { xs: 2, sm: 3, md: 4 },
                }}
            >
                <Box
                    sx={{
                        p: { xs: 3, sm: 4 },
                        borderRadius: 3,
                        boxShadow: 5,
                        background: "linear-gradient(135deg, #f9fafc, #e8f0fe)", // soft gradient bg
                    }}
                >
                    <Typography
                        variant="h5"
                        fontWeight="bold"
                        align="center"
                        mb={{ xs: 3, sm: 4 }}
                        color="primary"
                    >
                        Add Medical Camp
                    </Typography>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        {/* Camp Name */}
                        <TextField
                            label="Camp Name"
                            fullWidth
                            margin="normal"
                            {...register("campName", { required: "Camp Name is required" })}
                            error={!!errors.campName}
                            helperText={errors.campName?.message}
                        />

                        {/* Image Upload */}
                        <Box mt={2}>
                            <Typography fontWeight="500" mb={1}>
                                Camp Image
                            </Typography>

                            <Button
                                variant="outlined"
                                component="label"
                                startIcon={<CloudUploadIcon />}
                                sx={{
                                    borderRadius: 2,
                                    textTransform: "none",
                                    fontWeight: 500,
                                    px: 3,
                                    py: 1,
                                    bgcolor: "white",
                                    "&:hover": { bgcolor: "#f3f4f6" },
                                }}
                            >
                                {fileName || "Upload Image"}
                                <input
                                    type="file"
                                    hidden
                                    {...register("image", { required: !uploadedImage })}
                                    onChange={async (e) => {
                                        if (e.target.files[0]) {
                                            const file = e.target.files[0];
                                            setFileName(file.name); // show file name

                                            setIsUploading(true);
                                            try {
                                                const url = await imageUpload(file);
                                                setUploadedImage(url);
                                                setImageUploadError(null);
                                            } catch (error) {
                                                setImageUploadError("Image upload failed");

                                            } finally {
                                                setIsUploading(false);
                                            }
                                        }
                                    }}
                                />
                            </Button>

                            {imageUploadError && (
                                <Typography color="error" variant="body2" mt={1}>
                                    {imageUploadError}
                                </Typography>
                            )}
                            {uploadedImage && (
                                <Box mt={2}>
                                    <Typography color="success.main">
                                        Image uploaded successfully!
                                    </Typography>
                                    <Box
                                        component="img"
                                        src={uploadedImage}
                                        alt="Uploaded Camp"
                                        sx={{
                                            width: { xs: "100%", sm: 180 },
                                            height: { xs: "auto", sm: 180 },
                                            mt: 1,
                                            borderRadius: 1,
                                            objectFit: "cover",
                                        }}
                                    />
                                </Box>
                            )}
                        </Box>

                        {/* Fees */}
                        <TextField
                            label="Camp Fees (BDT)"
                            type="number"
                            fullWidth
                            margin="normal"
                            {...register("fees", { required: "Fees required", min: 0 })}
                            error={!!errors.fees}
                            helperText={errors.fees?.message}
                        />

                        {/* Date & Time */}
                        <TextField
                            label="Date & Time"
                            type="datetime-local"
                            fullWidth
                            margin="normal"
                            InputLabelProps={{ shrink: true }}
                            {...register("dateTime", { required: "Date and time required" })}
                            error={!!errors.dateTime}
                            helperText={errors.dateTime?.message}
                        />

                        {/* Location */}
                        <TextField
                            label="Location"
                            fullWidth
                            margin="normal"
                            {...register("location", { required: "Location is required" })}
                            error={!!errors.location}
                            helperText={errors.location?.message}
                        />

                        {/* Doctor Name */}
                        <TextField
                            label="Healthcare Professional Name"
                            fullWidth
                            margin="normal"
                            {...register("doctorName", { required: "Doctor name required" })}
                            error={!!errors.doctorName}
                            helperText={errors.doctorName?.message}
                        />

                        {/* Description */}
                        <TextField
                            label="Description"
                            fullWidth
                            margin="normal"
                            multiline
                            rows={4}
                            {...register("description", { required: "Description is required" })}
                            error={!!errors.description}
                            helperText={errors.description?.message}
                        />

                        {/* Submit */}
                        <Button
                            type="submit"
                            fullWidth
                            sx={{
                                mt: 3,
                                py: 1.5,
                                fontWeight: "bold",
                                borderRadius: 2,
                                background: "linear-gradient(90deg, #4f46e5, #06b6d4)",
                                color: "white",
                                "&:hover": {
                                    background: "linear-gradient(90deg, #4338ca, #0891b2)",
                                },
                            }}
                            disabled={isPending || isUploading}
                        >
                            {isPending || isUploading ? (
                                <CircularProgress size={24} sx={{ color: "white" }} />
                            ) : (
                                "Add Camp"
                            )}
                        </Button>
                    </form>
                </Box>
            </Container>
        </div>
    );
};

export default AddCamp;
