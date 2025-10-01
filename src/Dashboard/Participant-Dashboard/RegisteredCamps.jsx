import React, { useState, useContext } from "react";
import {
    Typography,
    Box,
    Grid,
    Card,
    CardContent,
    CardActions,
    Button,
    TextField,
    Modal,
    CircularProgress,
    InputAdornment,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import Swal from "sweetalert2";

import useAxiosSecure from "../../Hooks/useAxiosSecure";
import { AuthContext } from "../../Provider/AuthProvider";

const RegisteredCamps = () => {
    const { user } = useContext(AuthContext);
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    const stripe = useStripe();
    const elements = useElements();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const [selectedCamp, setSelectedCamp] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    const {
        data: registeredCamps = [],
        refetch,
        isLoading,
    } = useQuery({
        queryKey: ["registered-camps", user?.email],
        queryFn: async () => {
            const res = await axiosSecure.get(
                `/user-registered-camps?email=${user?.email}`
            );
            return res.data.map((camp) => ({
                ...camp,
                confirmationStatus: camp.confirmationStatus || "Pending",
            }));
        },
        enabled: !!user?.email,
    });

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: { cardDetails: "", rating: "", comment: "" },
    });

    const updatePaymentMutation = useMutation({
        mutationFn: async (data) =>
            axiosSecure.patch(`/update-payment-status/${selectedCamp._id}`, data),
        onSuccess: () => {
            refetch();
            setIsModalOpen(false);
        },
        onError: (error) =>
            Swal.fire("Error", error.message || "Payment failed", "error"),
    });

    const cancelRegistrationMutation = useMutation({
        mutationFn: async (campId) =>
            axiosSecure.delete(`/cancel-registration/${campId}`),
        onSuccess: () => {
            refetch();
            Swal.fire("Cancelled", "Registration cancelled.", "success");
        },
        onError: (error) =>
            Swal.fire("Error", error.message || "Cancellation failed", "error"),
    });

    const submitFeedbackMutation = useMutation({
        mutationFn: async (data) =>
            axiosSecure.post("/submit-feedback", {
                campId: selectedCamp._id,
                participantEmail: user?.displayName,
                ...data,
            }),
        onSuccess: () => {
            Swal.fire("Success", "Feedback submitted!", "success");
            refetch();
            setIsFeedbackModalOpen(false);
        },
        onError: (error) =>
            Swal.fire("Error", error.message || "Feedback failed", "error"),
    });

    const handlePay = (camp) => {
        if (camp.status !== "unpaid") {
            Swal.fire("Error", "This camp is already paid!", "error");
            return;
        }
        setSelectedCamp(camp);
        setIsModalOpen(true);
    };

    const onFinish = async () => {
        if (!stripe || !elements) {
            Swal.fire("Error", "Stripe failed to load", "error");
            return;
        }

        const { data: paymentIntentData } = await axiosSecure.post(
            "/create-payment-intent",
            { amount: selectedCamp.fees * 100 }
        );

        const clientSecret = paymentIntentData.clientSecret;
        const card = elements.getElement(CardElement);

        if (!card) {
            Swal.fire("Error", "Card details not found", "error");
            return;
        }

        const { paymentIntent, error } = await stripe.confirmCardPayment(
            clientSecret,
            {
                payment_method: {
                    card,
                    billing_details: {
                        name: user?.displayName || "Unknown",
                        email: user?.email || "Unknown",
                    },
                },
            }
        );

        if (error) {
            Swal.fire("Error", error.message, "error");
        } else if (paymentIntent.status === "succeeded") {
            await updatePaymentMutation.mutate({
                status: "paid",
                transactionId: paymentIntent.id,
                confirmationStatus: "Confirmed",
            });
            Swal.fire(
                "Success",
                `Payment successful! Transaction ID: ${paymentIntent.id}`,
                "success"
            );
        }
    };

    const handleCancel = (camp) => {
        if (camp.status === "paid") {
            Swal.fire("Error", "Cannot cancel a paid camp!", "error");
            return;
        }
        cancelRegistrationMutation.mutate(camp._id);
    };

    const handleFeedback = (camp) => {
        if (camp.status !== "paid") {
            Swal.fire("Error", "Payment required to submit feedback!", "error");
            return;
        }
        setSelectedCamp(camp);
        setIsFeedbackModalOpen(true);
    };

    const onFeedbackSubmit = (formData) => {
        submitFeedbackMutation.mutate(formData);
    };

    const filteredCamps = registeredCamps.filter(
        (camp) =>
            camp.campName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            camp.status?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const tableColumns = [
        { field: "campName", headerName: "Camp Name", flex: 1 },
        {
            field: "fees",
            headerName: "Fees",
            flex: 1,
            valueFormatter: (params) => `৳${params.value}`,
        },
        { field: "status", headerName: "Status", flex: 1 },
        { field: "confirmationStatus", headerName: "Confirmation", flex: 1 },
        {
            field: "actions",
            headerName: "Actions",
            flex: 1.5,
            renderCell: (params) => {
                const record = params.row;
                return (
                    <Box sx={{ display: "flex", gap: 1 }}>
                        {record.status === "unpaid" ? (
                            <>
                                <Button
                                    variant="contained"
                                    size="small"
                                    onClick={() => handlePay(record)}
                                >
                                    Pay
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="error"
                                    size="small"
                                    onClick={() => handleCancel(record)}
                                >
                                    Cancel
                                </Button>
                            </>
                        ) : (
                            <Button
                                variant="contained"
                                size="small"
                                onClick={() => handleFeedback(record)}
                            >
                                Feedback
                            </Button>
                        )}
                    </Box>
                );
            },
        },
    ];

    return (
        <Box sx={{ p: { xs: 2, sm: 4 } }}>
            <Typography variant="h4" align="center" mb={4}>
                Registered Camps
            </Typography>

            {/* Search Bar */}
            <Box mb={3} display="flex" justifyContent="center">
                <TextField
                    placeholder="Search by Camp Name or Status..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ width: { xs: "100%", sm: "50%", md: "33%" } }}
                />
            </Box>

            {isLoading ? (
                <Box textAlign="center" py={10}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    {/* Desktop/Table View */}
                    <Box sx={{ display: { xs: "none", sm: "block" }, height: 500 }}>
                        <DataGrid
                            rows={filteredCamps}
                            columns={tableColumns}
                            getRowId={(row) => row._id || Math.random()}
                            pageSize={10}
                            rowsPerPageOptions={[10]}
                            autoHeight
                            sx={{ boxShadow: 2, borderRadius: 2 }}
                        />
                    </Box>

                    {/* Mobile/Card View */}
                    <Grid container spacing={2} sx={{ display: { xs: "flex", sm: "none" } }}>
                        {filteredCamps.map((camp) => (
                            <Grid item xs={12} key={camp._id}>
                                <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
                                    <CardContent>
                                        <Typography variant="h6">{camp.campName}</Typography>
                                        <Typography>
                                            <strong>Participant:</strong> {camp.participantName}
                                        </Typography>
                                        <Typography>
                                            <strong>Status:</strong> {camp.status}
                                        </Typography>
                                        <Typography mb={1}>
                                            <strong>Confirmation:</strong> {camp.confirmationStatus}
                                        </Typography>
                                        <Typography>
                                            <strong>Fees:</strong> ৳{camp.fees}
                                        </Typography>
                                    </CardContent>
                                    <CardActions>
                                        {camp.status === "unpaid" ? (
                                            <>
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    onClick={() => handlePay(camp)}
                                                >
                                                    Pay
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    color="error"
                                                    size="small"
                                                    onClick={() => handleCancel(camp)}
                                                >
                                                    Cancel
                                                </Button>
                                            </>
                                        ) : (
                                            <Button
                                                variant="contained"
                                                size="small"
                                                onClick={() => handleFeedback(camp)}
                                            >
                                                Feedback
                                            </Button>
                                        )}
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </>
            )}

            {/* Payment Modal */}
            <Modal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                aria-labelledby="payment-modal"
            >
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: 400,
                        bgcolor: "background.paper",
                        borderRadius: 2,
                        boxShadow: 24,
                        p: 4,
                    }}
                >
                    <Typography variant="h6" mb={2}>
                        Pay for Camp
                    </Typography>
                    <Typography>
                        <strong>Camp:</strong> {selectedCamp?.campName}
                    </Typography>
                    <Typography mb={2}>
                        <strong>Fees:</strong> ৳{selectedCamp?.fees}
                    </Typography>

                    <form onSubmit={handleSubmit(onFinish)}>
                        <Controller
                            name="cardDetails"
                            control={control}
                            render={({ field }) => (
                                <Box
                                    sx={{
                                        border: "1px solid #ccc",
                                        borderRadius: 1,
                                        p: 2,
                                        mb: 3,
                                    }}
                                >
                                    <CardElement {...field} />
                                </Box>
                            )}
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            disabled={updatePaymentMutation.isPending}
                        >
                            Pay Now
                        </Button>
                    </form>
                </Box>
            </Modal>

            {/* Feedback Modal */}
            <Modal
                open={isFeedbackModalOpen}
                onClose={() => setIsFeedbackModalOpen(false)}
                aria-labelledby="feedback-modal"
            >
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: 400,
                        bgcolor: "background.paper",
                        borderRadius: 2,
                        boxShadow: 24,
                        p: 4,
                    }}
                >
                    <Typography variant="h6" mb={2}>
                        Submit Feedback
                    </Typography>
                    <form onSubmit={handleSubmit(onFeedbackSubmit)}>
                        <Controller
                            name="rating"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    type="number"
                                    label="Rating (1-5)"
                                    fullWidth
                                    margin="normal"
                                    inputProps={{ min: 1, max: 5 }}
                                    error={!!errors.rating}
                                    helperText={errors.rating?.message}
                                />
                            )}
                        />
                        <Controller
                            name="comment"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Comment"
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
                            fullWidth
                            disabled={submitFeedbackMutation.isPending}
                        >
                            Submit Feedback
                        </Button>
                    </form>
                </Box>
            </Modal>
        </Box>
    );
};

export default RegisteredCamps;
