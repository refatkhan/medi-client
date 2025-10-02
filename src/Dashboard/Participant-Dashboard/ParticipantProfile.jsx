import React, { useContext, useState } from "react";
import {
    Card,
    CardContent,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Avatar,
    Typography,
    Stack,
    CircularProgress,
} from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "../../Hooks/useAxiosSecure";
import { AuthContext } from "../../Provider/AuthProvider";
import Swal from "sweetalert2";
import { updateProfile } from "firebase/auth";
import { auth } from "../../firebase/firebase-init"; // Adjust path
import { toast } from "react-toastify";
import { Helmet } from "react-helmet-async";

const ParticipantProfile = () => {
    const { user } = useContext(AuthContext);
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formValues, setFormValues] = useState({
        name: user?.displayName || "",
        photoURL: user?.photoURL || "",
        contact: "",
    });

    const {
        data: profile = {},
        isLoading,
        error,
    } = useQuery({
        queryKey: ["participant-profile", user?.email],
        queryFn: async () => {
            const res = await axiosSecure.get(
                `/participant-profile?email=${user?.email}`
            );
            return res.data || {};
        },
        enabled: !!user?.email,
    });

    const mutation = useMutation({
        mutationFn: async (updatedData) => {
            const res = await axiosSecure.patch("/update-profile", updatedData);
            return res.data;
        },
        onSuccess: () => {
            Swal.fire("Success", "Profile updated successfully", "success");
            queryClient.invalidateQueries(["participant-profile", user?.email]);
            setIsModalOpen(false);
        },
    });

    const handleFinish = async () => {
        const { name, photoURL, contact } = formValues;

        try {
            // Update Firebase Auth profile
            await updateProfile(auth.currentUser, {
                displayName: name,
                photoURL: photoURL,
            });
            toast.success(" Profile Updated Successfully");

            // Update participant profile in backend
            await mutation.mutateAsync({
                email: user?.email,
                name,
                photoURL,
                contact,
            });
        } catch (error) {
            console.error("Profile Update Error:", error.message);
            toast.error("Failed to update profile");
        }
    };

    if (isLoading) {
        return (
            <div className="text-center py-10">
                <CircularProgress />
                <Typography mt={2}>Loading...</Typography>
            </div>
        );
    }

    if (error && error.response?.status === 404) {
        return (
            <Typography className="text-center py-10" color="error">
                User not found. Please contact admin.
            </Typography>
        );
    }

    if (error) {
        return (
            <Typography className="text-center py-10" color="error">
                Error: {error.message}
            </Typography>
        );
    }

    return (
        <div className="px-4 py-6 sm:px-6 lg:px-8">
            <Helmet>
                <title>Participant Profile | My Dashboard</title>
                <meta name="profile" content="view your profile." />
            </Helmet>

            <div className="max-w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto">
                <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
                    <CardContent>
                        <Stack
                            direction={{ xs: "column", sm: "row" }}
                            spacing={4}
                            alignItems="center"
                        >
                            <Avatar
                                src={user?.photoURL}
                                sx={{ width: 100, height: 100 }}
                            />
                            <div style={{ textAlign: "center", smTextAlign: "left" }}>
                                <Typography variant="h6" fontWeight="600" gutterBottom>
                                    {profile?.name || user?.displayName || "No Name"}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Contact: {profile?.contact || "Not Provided"}
                                </Typography>
                                <Button
                                    variant="contained"
                                    sx={{ mt: 2 }}
                                    onClick={() => {
                                        setFormValues({
                                            name: user?.displayName || "",
                                            photoURL: user?.photoURL || "",
                                            contact: profile?.contact || "",
                                        });
                                        setIsModalOpen(true);
                                    }}
                                >
                                    Update Profile
                                </Button>
                            </div>
                        </Stack>
                    </CardContent>
                </Card>
            </div>

            <Dialog
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>Update Profile</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} mt={1}>
                        <TextField
                            label="Full Name"
                            fullWidth
                            required
                            value={formValues.name}
                            onChange={(e) =>
                                setFormValues((prev) => ({ ...prev, name: e.target.value }))
                            }
                        />
                        <TextField
                            label="Photo URL"
                            fullWidth
                            required
                            value={formValues.photoURL}
                            onChange={(e) =>
                                setFormValues((prev) => ({ ...prev, photoURL: e.target.value }))
                            }
                        />
                        <TextField
                            label="Contact"
                            fullWidth
                            required
                            value={formValues.contact}
                            onChange={(e) =>
                                setFormValues((prev) => ({ ...prev, contact: e.target.value }))
                            }
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleFinish}
                        disabled={mutation.isPending}
                    >
                        Update
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default ParticipantProfile;
