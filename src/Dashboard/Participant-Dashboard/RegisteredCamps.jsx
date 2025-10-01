import React, { useState, useContext } from "react";
import {
  Box,
  Grid,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
} from "@mui/material";
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
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

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
      {
        amount: selectedCamp.fees * 100,
      }
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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box
      sx={{
        px: { xs: 2, sm: 4, lg: 8 },
        py: 4,
        background:
          "linear-gradient(120deg, #fdfbfb 0%, #ebedee 100%)", // soft gradient background
        minHeight: "100vh",
      }}
    >
      <Typography variant="h4" align="center" gutterBottom>
        Registered Camps
      </Typography>

      {/* Search Bar */}
      <Box sx={{ mb: 4, textAlign: "center" }}>
        <TextField
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by Camp Name or Status (paid/unpaid)..."
          variant="outlined"
          size="small"
          sx={{ width: { xs: "100%", sm: "50%", md: "33%" } }}
        />
      </Box>

      {isLoading ? (
        <Box sx={{ textAlign: "center", py: 10 }}>
          <CircularProgress size={50} />
        </Box>
      ) : (
        <Grid container justifyContent="flex-end">
          <Grid item xs={12} md={9}> {/* 75% width */}
            <Paper elevation={5} sx={{ p: 2 }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Camp Name</TableCell>
                      <TableCell>Fees</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Confirmation</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredCamps
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((camp) => (
                        <TableRow key={camp._id}>
                          <TableCell>{camp.campName}</TableCell>
                          <TableCell>৳{camp.fees}</TableCell>
                          <TableCell>{camp.status}</TableCell>
                          <TableCell>{camp.confirmationStatus}</TableCell>
                          <TableCell>
                            {camp.status === "unpaid" ? (
                              <Box sx={{ display: "flex", gap: 1 }}>
                                <Button
                                  variant="contained"
                                  color="primary"
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
                              </Box>
                            ) : (
                              <Button
                                variant="contained"
                                size="small"
                                onClick={() => handleFeedback(camp)}
                              >
                                Feedback
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                component="div"
                count={filteredCamps.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25]}
              />
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Pay Modal */}
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Pay for Camp</DialogTitle>
        <DialogContent>
          <Typography mb={1}>
            <strong>Camp:</strong> {selectedCamp?.campName}
          </Typography>
          <Typography mb={2}>
            <strong>Fees:</strong> ৳{selectedCamp?.fees}
          </Typography>
          <Controller
            name="cardDetails"
            control={control}
            render={({ field }) => <CardElement {...field} />}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit(onFinish)}
            disabled={updatePaymentMutation.isPending}
          >
            Pay Now
          </Button>
        </DialogActions>
      </Dialog>

      {/* Feedback Modal */}
      <Dialog
        open={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Submit Feedback</DialogTitle>
        <DialogContent>
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
                rows={3}
              />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsFeedbackModalOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit(onFeedbackSubmit)}
            disabled={submitFeedbackMutation.isPending}
          >
            Submit Feedback
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RegisteredCamps;
