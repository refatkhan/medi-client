import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Select,
    MenuItem,
    Button,
    Box,
    InputLabel,
    FormControl,
    CircularProgress,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import useAxiosSecure from "../../Hooks/useAxiosSecure";

const CampsJoinModal = ({ visible, onClose, camp, onJoined, user }) => {
    const { control, handleSubmit, reset } = useForm();
    const axiosSecure = useAxiosSecure();
    const [loading, setLoading] = useState(false);
    const [hasJoined, setHasJoined] = useState(false);

    useEffect(() => {
        const checkJoinStatus = async () => {
            if (user?.email && camp?._id) {
                try {
                    const res = await axiosSecure.get(
                        `/check-join-status?email=${user.email}&campId=${camp._id}`
                    );
                    setHasJoined(res.data.joined);
                } catch {
                    setHasJoined(false);
                }
            }
        };
        if (visible) checkJoinStatus();
    }, [user?.email, camp?._id, visible, axiosSecure]);

    const handleOk = async (formData) => {
        if (loading || hasJoined) return;
        setLoading(true);

        const payload = {
            email: user.email,
            campId: camp._id,
            status: "unpaid",
            organizerEmail: camp.organizerEmail,
            confirmationStatus: "Pending",
            participantName: user.displayName,
            age: formData.age,
            phone: formData.phone,
            gender: formData.gender,
            emergencyContact: formData.emergencyContact,
        };

        try {
            const response = await axiosSecure.post("/camps-join", payload);
            if (response.data.success) {
                Swal.fire(
                    "Success",
                    "Registration successful! Please pay to confirm.",
                    "success"
                );
                setHasJoined(true);
                onJoined(); // update parent button immediately
                reset();
                onClose();
            }
        } catch (error) {
            if (
                error.response?.data?.message ===
                "You have already registered for this camp"
            ) {
                setHasJoined(true);
                onJoined();
                Swal.fire("Info", "You have already joined this camp", "info");
                onClose();
            } else {
                Swal.fire("Error", "Registration failed", "error");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog
            open={visible}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
            disableEnforceFocus
        >
            <DialogTitle
                sx={{
                    background: "linear-gradient(to right, #6a11cb, #2575fc)",
                    color: "#fff",
                    textAlign: "center",
                    fontWeight: "bold",
                }}
            >
                Join Medical Camp
            </DialogTitle>
            <DialogContent sx={{ p: 0, mt: 2 }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.4 }}
                >
                    <Box
                        sx={{
                            backgroundColor: "#f5f7fa",
                            borderRadius: 3,
                            p: 4,
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                            boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
                        }}
                    >
                        <Controller
                            name="participantName"
                            control={control}
                            defaultValue={user?.displayName || ""}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Your Name"
                                    fullWidth
                                    InputProps={{ readOnly: true }}
                                />
                            )}
                        />
                        <Controller
                            name="age"
                            control={control}
                            defaultValue=""
                            render={({ field }) => (
                                <TextField {...field} label="Age" type="number" fullWidth />
                            )}
                        />
                        <Controller
                            name="phone"
                            control={control}
                            defaultValue=""
                            render={({ field }) => (
                                <TextField {...field} label="Phone Number" fullWidth />
                            )}
                        />
                        <Controller
                            name="gender"
                            control={control}
                            defaultValue=""
                            render={({ field }) => (
                                <FormControl fullWidth>
                                    <InputLabel>Gender</InputLabel>
                                    <Select {...field} label="Gender">
                                        <MenuItem value="Male">Male</MenuItem>
                                        <MenuItem value="Female">Female</MenuItem>
                                        <MenuItem value="Other">Other</MenuItem>
                                    </Select>
                                </FormControl>
                            )}
                        />
                        <Controller
                            name="emergencyContact"
                            control={control}
                            defaultValue=""
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Emergency Contact"
                                    type="number"
                                    fullWidth
                                />
                            )}
                        />
                    </Box>
                </motion.div>
            </DialogContent>
            <DialogActions sx={{ justifyContent: "center", mb: 3 }}>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                        onClick={handleSubmit(handleOk)}
                        disabled={loading || hasJoined}
                        sx={{
                            background: "linear-gradient(to right, #6a11cb, #2575fc)",
                            color: "#fff",
                            px: 6,
                            py: 1.5,
                            borderRadius: 3,
                            fontWeight: "bold",
                            "&:hover": {
                                background: "linear-gradient(to right, #2575fc, #6a11cb)",
                            },
                        }}
                    >
                        {loading ? (
                            <CircularProgress size={24} color="inherit" />
                        ) : hasJoined ? (
                            "Joined"
                        ) : (
                            "Join Now"
                        )}
                    </Button>
                </motion.div>
            </DialogActions>
        </Dialog>
    );
};

export default CampsJoinModal;
