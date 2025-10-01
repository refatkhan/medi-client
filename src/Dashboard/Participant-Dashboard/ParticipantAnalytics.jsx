import React from "react";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
} from "@mui/material";
import useParticipantAnalytics from "../../Hooks/useParticipantAnalytics";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#a78bfa", "#f472b6"];

const ParticipantAnalytics = () => {
    const { data = [], isLoading } = useParticipantAnalytics();

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" py={10}>
                <CircularProgress />
            </Box>
        );
    }

    if (!data.length) {
        return (
            <Typography variant="body1" color="textSecondary" align="center" py={10}>
                No registered camp data available to show.
            </Typography>
        );
    }

    return (
        <Paper sx={{ p: { xs: 2, sm: 4, md: 6 }, overflow: "hidden" }} elevation={3}>
            {/* Heading */}
            <Typography
                variant="h5"
                sx={{ color: "primary.main", textAlign: "center", mb: 4 }}
            >
                Camp Registration Analytics (Pie Chart)
            </Typography>

            {/* Chart */}
            <Box sx={{ width: "100%", height: { xs: 300, sm: 400 }, mb: 6 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            dataKey="fees"
                            nameKey="campName"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label={({ name, value }) => `${name}: ৳${value}`}
                        >
                            {data.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value) => `৳${value}`} />
                        <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                </ResponsiveContainer>
            </Box>

            {/* Table */}
            <Typography variant="h6" sx={{ mb: 2 }}>
                Registered Camps Details
            </Typography>
            <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                <Table stickyHeader size="small">
                    <TableHead sx={{ backgroundColor: "grey.100" }}>
                        <TableRow>
                            <TableCell>#</TableCell>
                            <TableCell>Camp Name</TableCell>
                            <TableCell>Fees</TableCell>
                            <TableCell>Location</TableCell>
                            <TableCell>Doctor</TableCell>
                            <TableCell>Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.map((camp, index) => (
                            <TableRow key={camp._id || index} hover>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{camp.campName}</TableCell>
                                <TableCell>৳{camp.fees}</TableCell>
                                <TableCell>{camp.location}</TableCell>
                                <TableCell>{camp.doctorName}</TableCell>
                                <TableCell
                                    sx={{
                                        textTransform: "capitalize",
                                        color: camp.status === "active" ? "green" : "text.primary",
                                        fontWeight: 500,
                                    }}
                                >
                                    {camp.status}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
};
export default ParticipantAnalytics;
