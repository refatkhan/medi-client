import React from "react";
import { useForm, Controller } from "react-hook-form";
import { useParams, useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "../Hooks/useAxiosSecure";
import Swal from "sweetalert2";
import {
    Box,
    Typography,
    TextField,
    Button,
    CircularProgress,
} from "@mui/material";

const UpdateCamp = () => {
    const { campId } = useParams();
    const axiosSecure = useAxiosSecure();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm();

    // Fetch current camp data
    const { data: camp, isLoading } = useQuery({
        queryKey: ["campDetails", campId],
        queryFn: async () => {
            const res = await axiosSecure.get(`/available-camps/${campId}`);
            reset(res.data); // preload form
            return res.data;
        },
    });

    // Mutation for update
    const mutation = useMutation({
        mutationFn: async (updatedData) => {
            return await axiosSecure.patch(`/update-camp/${campId}`, updatedData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["campDetails", campId]);
            Swal.fire({
                icon: "success",
                title: "Camp Updated!",
                text: "Your medical camp has been successfully updated.",
                confirmButtonColor: "#3085d6",
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
        mutation.mutate(data);
    };

    if (isLoading)
        return (
            <Box textAlign="center" py={10}>
                <CircularProgress />
            </Box>
        );

    return (
        <Box
            maxWidth={600}
            mx="auto"
            p={4}
            mt={8}
            bgcolor="white"
            boxShadow={3}
            borderRadius={2}
        >
            <Typography
                variant="h4"
                component="h2"
                align="center"
                mb={4}
                color="primary"
            >
                Update Camp
            </Typography>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <Controller
                    name="campName"
                    control={control}
                    rules={{ required: "Camp Name is required" }}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            label="Camp Name"
                            fullWidth
                            margin="normal"
                            error={!!errors.campName}
                            helperText={errors.campName?.message}
                        />
                    )}
                />

                <Controller
                    name="image"
                    control={control}
                    render={({ field }) => (
                        <TextField {...field} label="Image URL" fullWidth margin="normal" />
                    )}
                />

                <Controller
                    name="fees"
                    control={control}
                    rules={{ required: "Fees are required" }}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            label="Camp Fees"
                            type="number"
                            fullWidth
                            margin="normal"
                            error={!!errors.fees}
                            helperText={errors.fees?.message}
                        />
                    )}
                />

                <Controller
                    name="dateTime"
                    control={control}
                    rules={{ required: "Date & Time is required" }}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            type="datetime-local"
                            fullWidth
                            margin="normal"
                            error={!!errors.dateTime}
                            helperText={errors.dateTime?.message}
                            InputLabelProps={{ shrink: true }}
                        />
                    )}
                />

                <Controller
                    name="location"
                    control={control}
                    rules={{ required: "Location is required" }}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            label="Location"
                            fullWidth
                            margin="normal"
                            error={!!errors.location}
                            helperText={errors.location?.message}
                        />
                    )}
                />

                <Controller
                    name="doctorName"
                    control={control}
                    rules={{ required: "Doctor Name is required" }}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            label="Doctor Name"
                            fullWidth
                            margin="normal"
                            error={!!errors.doctorName}
                            helperText={errors.doctorName?.message}
                        />
                    )}
                />

                <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            label="Description"
                            fullWidth
                            margin="normal"
                            multiline
                            rows={4}
                        />
                    )}
                />

                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{ mt: 2 }}
                >
                    Update Camp
                </Button>
            </form>
        </Box>
    );
};

export default UpdateCamp;
