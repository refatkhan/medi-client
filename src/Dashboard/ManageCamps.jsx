import React, { useState } from "react";
import {
    Box,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TextField,
    InputAdornment,
    Dialog,
    DialogTitle,
    DialogActions,
    Typography,
    CircularProgress,
    TablePagination,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "../Hooks/useAxiosSecure";
import { Helmet } from "react-helmet-async";

const ManageCamps = () => {
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState("");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedCampId, setSelectedCampId] = useState(null);

    // Pagination state
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    // Fetch camps
    const { data: camps = [], isLoading } = useQuery({
        queryKey: ["camps"],
        queryFn: async () => {
            const res = await axiosSecure.get("/camps");
            return res.data;
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: async (id) => axiosSecure.delete(`/delete-camp/${id}`),
        onSuccess: () => {
            alert("Camp deleted successfully!");
            queryClient.invalidateQueries(["camps"]);
        },
        onError: () => {
            alert("Failed to delete the camp.");
        },
    });

    // Filter camps
    const filteredCamps = camps.filter(
        (camp) =>
            camp.campName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            camp.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            camp.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            camp.dateTime?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handle pagination
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleDeleteClick = (id) => {
        setSelectedCampId(id);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = () => {
        deleteMutation.mutate(selectedCampId);
        setDeleteDialogOpen(false);
    };

    const handleCancelDelete = () => {
        setDeleteDialogOpen(false);
    };

    if (isLoading)
        return (
            <Box textAlign="center" py={10}>
                <CircularProgress />
            </Box>
        );

    // Paginated camps
    const paginatedCamps = filteredCamps.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    return (
        <div>
            <Helmet>
                <title>Manage Camp | My Dashboard</title>
                <meta name="description" content="View and edit your user profile information and settings." />
            </Helmet>

            <Box p={{ xs: 2, sm: 4, md: 10 }} maxWidth="1200px" mx="auto">
                {/* Header */}
                <Box
                    display="flex"
                    flexDirection={{ xs: "column", sm: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "start", sm: "center" }}
                    mb={4}
                    gap={2}
                >
                    <Typography
                        variant="h5"
                        component="h2"
                        fontWeight={600}
                        color="primary"
                    >
                        Manage Camps
                    </Typography>

                    {/* Search Bar */}
                    <TextField
                        variant="outlined"
                        size="small"
                        placeholder="Search by Camp, Doctor, Location, Date..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        sx={{
                            width: { xs: "100%", sm: "250px", md: "300px" },
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="action" />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Box>

                {/* Table */}
                <TableContainer
                    component={Paper}
                    sx={{ overflowX: "auto", boxShadow: 3 }}
                >
                    <Table sx={{ minWidth: 650 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell>Camp Name</TableCell>
                                <TableCell>Date & Time</TableCell>
                                <TableCell>Location</TableCell>
                                <TableCell>Doctor</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedCamps.map((camp) => (
                                <TableRow key={camp._id}>
                                    <TableCell>{camp.campName}</TableCell>
                                    <TableCell>{camp.dateTime}</TableCell>
                                    <TableCell>{camp.location}</TableCell>
                                    <TableCell>{camp.doctorName}</TableCell>
                                    <TableCell>
                                        <Box display="flex" flexWrap="wrap" gap={1}>
                                            <Link to={`/dashboard/update-camp/${camp._id}`}>
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    color="primary"
                                                >
                                                    Update
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="contained"
                                                color="error"
                                                size="small"
                                                onClick={() => handleDeleteClick(camp._id)}
                                            >
                                                Delete
                                            </Button>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    <TablePagination
                        component="div"
                        count={filteredCamps.length}
                        page={page}
                        onPageChange={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        rowsPerPageOptions={[5, 10, 25]}
                    />
                </TableContainer>
                {/* Delete Confirmation Dialog */}
                <Dialog open={deleteDialogOpen} onClose={handleCancelDelete}>
                    <DialogTitle>Are you sure to delete this camp?</DialogTitle>
                    <DialogActions>
                        <Button onClick={handleCancelDelete}>No</Button>
                        <Button color="error" onClick={handleConfirmDelete}>
                            Yes
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </div>
    );
};
export default ManageCamps;
