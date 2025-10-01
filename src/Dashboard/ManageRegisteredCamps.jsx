import React, { useContext, useState } from "react";
import {
    Card,
    CardContent,
    Typography,
    Button,
    Chip,
    Grid,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    useMediaQuery,
    Stack,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useTheme } from "@mui/material/styles";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "../Hooks/useAxiosSecure";
import { AuthContext } from "../Provider/AuthProvider";
import Swal from "sweetalert2";

const ManageRegisteredCamps = () => {
    const { user } = useContext(AuthContext);
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const [searchTerm, setSearchTerm] = useState("");

    const { data: registered = [], isLoading, error } = useQuery({
        queryKey: ["registered-camps", user?.email],
        queryFn: async () => {
            const res = await axiosSecure.get(`/registered-camps?email=${user?.email}`);
            return res.data;
        },
        enabled: !!user?.email,
    });

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);

    const handleCancelRegistration = (record) => {
        setSelectedRecord(record);
        setIsModalVisible(true);
    };

    const confirmCancel = async () => {
        try {
            await axiosSecure.delete(`/cancel-registration/${selectedRecord._id}`);
            Swal.fire("Success", "Registration cancelled!", "success");
            setIsModalVisible(false);
            queryClient.refetchQueries(["registered-camps", user?.email]);
        } catch (error) {
            Swal.fire("Error", "Failed to cancel registration", "error");
            console.error("Cancel Error:", error);
        }
    };

    const handleConfirmPayment = async (record) => {
        try {
            await axiosSecure.patch(`/update-confirmation/${record._id}`, {
                confirmationStatus: "Confirmed",
            });
            Swal.fire("Success", "Payment confirmed!", "success");
            queryClient.refetchQueries(["registered-camps", user?.email]);
        } catch (error) {
            Swal.fire("Error", "Failed to confirm payment", "error");
            console.error("Confirm Payment Error:", error);
        }
    };

    const filteredRegistered = registered.filter(
        (record) =>
            record.campName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.participantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            String(record.fees)?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) return <p className="text-center py-10">Loading...</p>;
    if (error) return <p className="text-center py-10 text-red-500">Error: {error.message}</p>;

    // Mobile Card View
    const renderMobileCards = () => (
        <Stack spacing={2} alignItems="center">
            {filteredRegistered.map((record) => (
                <Card
                    key={record._id}
                    variant="outlined"
                    sx={{
                        width: "100%",
                        maxWidth: 400,
                        background: "linear-gradient(145deg, #ece9e6, #ffffff)",
                        borderRadius: 2,
                        boxShadow: 3,
                    }}
                >
                    <CardContent>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                            <Typography variant="h6" color="primary">{record.campName}</Typography>
                            <Chip
                                label={record.status}
                                color={record.status === "paid" ? "success" : "error"}
                            />
                        </Stack>
                        <Typography><strong>Participant:</strong> {record.participantName}</Typography>
                        <Typography><strong>Emergency Contact:</strong> {record.emergencyContact}</Typography>
                        <Typography><strong>Fees:</strong> ৳{record.fees}</Typography>
                        <Stack direction="row" spacing={1} mt={1}>
                            <Chip
                                label={record.confirmationStatus}
                                color={record.confirmationStatus === "Confirmed" ? "success" : "warning"}
                            />
                        </Stack>
                        <Stack direction="row" spacing={1} mt={2}>
                            {record.confirmationStatus !== "Confirmed" && (
                                <Button
                                    variant="contained"
                                    size="small"
                                    onClick={() => handleConfirmPayment(record)}
                                >
                                    Confirm
                                </Button>
                            )}
                            <Button
                                variant="contained"
                                size="small"
                                color="error"
                                disabled={
                                    record.status === "paid" && record.confirmationStatus === "Confirmed"
                                }
                                onClick={() => handleCancelRegistration(record)}
                            >
                                Cancel
                            </Button>
                        </Stack>
                    </CardContent>
                </Card>
            ))}
        </Stack>
    );

    // Desktop/Table View
    const renderDesktopTable = () => {
        const columns = [
            { field: "campName", headerName: "Camp Name", flex: 1 },
            { field: "participantName", headerName: "Participant", flex: 1 },
            { field: "emergencyContact", headerName: "Emergency Contact", flex: 1 },
            {
                field: "fees",
                headerName: "Fees",
                flex: 1,
                valueFormatter: ({ value }) => `৳${value}`,
            },
            {
                field: "status",
                headerName: "Payment Status",
                flex: 1,
                renderCell: (params) => (
                    <Chip
                        label={params.value}
                        color={params.value === "paid" ? "success" : "error"}
                    />
                ),
            },
            {
                field: "confirmationStatus",
                headerName: "Confirmation Status",
                flex: 1,
                renderCell: (params) => (
                    <Chip
                        label={params.value}
                        color={params.value === "Confirmed" ? "success" : "warning"}
                    />
                ),
            },
            {
                field: "action",
                headerName: "Action",
                flex: 1.5,
                renderCell: (params) => {
                    const record = params.row;
                    return (
                        <Stack direction="row" spacing={1}>
                            {record.confirmationStatus !== "Confirmed" && (
                                <Button
                                    size="small"
                                    variant="contained"
                                    onClick={() => handleConfirmPayment(record)}
                                >
                                    Confirm
                                </Button>
                            )}
                            <Button
                                size="small"
                                variant="contained"
                                color="error"
                                disabled={
                                    record.status === "paid" && record.confirmationStatus === "Confirmed"
                                }
                                onClick={() => handleCancelRegistration(record)}
                            >
                                Cancel
                            </Button>
                        </Stack>
                    );
                },
            },
        ];

        return (
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <div style={{ height: 500, width: "80%", background: "#f7f7f7", borderRadius: 8, padding: 8 }}>
                    <DataGrid
                        rows={filteredRegistered}
                        columns={columns}
                        getRowId={(row) => row._id}
                        pageSize={10}
                        rowsPerPageOptions={[10]}
                        autoHeight
                        disableSelectionOnClick
                        sx={{
                            "& .MuiDataGrid-cell": {
                                background: "#ffffff",
                                borderRadius: 1,
                                margin: "2px 0",
                            },
                            "& .MuiDataGrid-row:hover": {
                                backgroundColor: "#e0f7fa",
                            },
                        }}
                    />
                </div>
            </div>
        );
    };

    return (
        <div
            style={{
                padding: 24,
                maxWidth: "1250px",
                margin: "0 auto",
                borderRadius: 8,
                background: "linear-gradient(135deg, #cfd9df 0%, #e2ebf0 100%)",
            }}
        >
            <Grid container alignItems="center" justifyContent="space-between" mb={3} spacing={2}>
                <Grid item xs={12} md="auto">
                    <Typography variant="h5" fontWeight="bold" color="#4a148c">
                        Manage Registered Camps
                    </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                    <TextField
                        fullWidth
                        type="text"
                        placeholder="Search by Camp Name, Participant, or Fees..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        sx={{ backgroundColor: "white", borderRadius: 1 }}
                    />
                </Grid>
            </Grid>

            {isMobile ? renderMobileCards() : renderDesktopTable()}

            <Dialog open={isModalVisible} onClose={() => setIsModalVisible(false)}>
                <DialogTitle>Confirm Cancellation</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to cancel this registration?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsModalVisible(false)}>No</Button>
                    <Button onClick={confirmCancel} color="error">
                        Yes, Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default ManageRegisteredCamps;
