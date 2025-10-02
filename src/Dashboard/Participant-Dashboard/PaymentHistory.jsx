import React, { useContext, useState } from "react";
import { Helmet } from "react-helmet-async";
import {
    Box,
    Typography,
    TextField,
    CircularProgress,
    Button,
    Paper,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../Hooks/useAxiosSecure";
import { AuthContext } from "../../Provider/AuthProvider";

const PaymentHistory = () => {
    const { user } = useContext(AuthContext);
    const axiosSecure = useAxiosSecure();
    const [searchTerm, setSearchTerm] = useState("");

    const {
        data: paymentHistory = [],
        isLoading,
        error,
        refetch,
    } = useQuery({
        queryKey: ["payment-history", user?.email],
        queryFn: async () => {
            // eslint-disable-next-line no-useless-catch
            try {
                const res = await axiosSecure.get(
                    `/payment-history?email=${user?.email}`
                );
                return Array.isArray(res.data) ? res.data : [];
            } catch (err) {
                throw err;
            }
        },
        enabled: !!user?.email,
    });

    const filteredPaymentHistory = paymentHistory.filter((payment) => {
        const isPaid = payment?.status?.toLowerCase() === "paid";
        const matchesSearch =
            payment?.campName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment?.registeredAt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment?.doctorName?.toLowerCase().includes(searchTerm.toLowerCase());
        return isPaid && matchesSearch;
    });
    const columns = [
        {
            field: "campName",
            headerName: "Camp Name",
            flex: 1,
            valueGetter: (params) => params.row?.campName || "N/A",
        },
        {
            field: "registeredAt",
            headerName: "Date",
            flex: 1,
            valueGetter: (params) =>
                params.row?.registeredAt
                    ? new Date(params.row.registeredAt).toLocaleDateString()
                    : "N/A",
        },
        {
            field: "doctorName",
            headerName: "Healthcare Professional",
            flex: 1,
            valueGetter: (params) => params.row?.doctorName || "N/A",
        },
        {
            field: "fees",
            headerName: "Fees",
            flex: 0.7,
            valueGetter: (params) => (params.row?.fees ? `$${params.row.fees}` : "N/A"),
            type: "number",
        },
        {
            field: "status",
            headerName: "Payment Status",
            flex: 0.8,
            valueGetter: (params) => params.row?.status || "N/A",
        },
        {
            field: "confirmationStatus",
            headerName: "Confirmation Status",
            flex: 0.8,
            valueGetter: (params) => params.row?.confirmationStatus || "N/A",
        },
        {
            field: "transactionId",
            headerName: "Transaction ID",
            flex: 1,
            valueGetter: (params) => params.row?.transactionId || "N/A",
        },
    ];

    if (isLoading)
        return (
            <Box textAlign="center" py={10}>
                <CircularProgress size={60} />
            </Box>
        );

    if (error && error.response?.status === 404)
        return (
            <Box textAlign="center" py={10} color="error.main">
                <Typography>No payment history found.</Typography>
                <Button onClick={refetch} sx={{ mt: 2 }} variant="text">
                    Refresh
                </Button>
            </Box>
        );

    if (error)
        return (
            <Box textAlign="center" py={10} color="error.main">
                <Typography>Error: {error.message}</Typography>
                <Button onClick={refetch} sx={{ mt: 2 }} variant="text">
                    Retry
                </Button>
            </Box>
        );

    return (
        <>
            <Helmet>
                <title>Payment History | My Dashboard</title>
                <meta name="description" content="View all your camp payment transactions and history." />
            </Helmet>
            <div>
                <Box px={{ xs: 2, md: 6, lg: 8 }} maxWidth="1200px" mx="auto">
                    <Typography
                        variant="h4"
                        fontWeight="600"
                        mb={4}
                        textAlign="center"
                        color="text.primary"
                    >
                        Payment History
                    </Typography>

                    <Box mb={4} display="flex" justifyContent="center">
                        <TextField
                            label="Search by Camp Name, Date, or Doctor"
                            variant="outlined"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            sx={{ width: { xs: "100%", md: "50%", lg: "33%" } }}
                        />
                    </Box>

                    <Paper elevation={3}>
                        <DataGrid
                            rows={filteredPaymentHistory.map((row) => ({ ...row, id: row._id || Math.random() }))}
                            columns={columns}
                            autoHeight
                            pageSize={5}
                            rowsPerPageOptions={[5, 10, 20]}
                            disableSelectionOnClick
                        />
                    </Paper>
                </Box>
            </div>
        </>
    );
};

export default PaymentHistory;
