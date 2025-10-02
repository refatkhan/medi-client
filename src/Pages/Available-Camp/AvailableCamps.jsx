import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link as RouterLink } from "react-router";
import useAxiosSecure from "../../Hooks/useAxiosSecure";
import { Helmet } from "react-helmet-async";
import {
    Box,
    Grid,
    Typography,
    TextField,
    MenuItem,
    InputAdornment,
    ToggleButton,
    ToggleButtonGroup,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import ViewListIcon from "@mui/icons-material/ViewList";
import { Button } from "@mui/material";
const AvailableCamps = () => {
    const axiosSecure = useAxiosSecure();
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("default");
    const [layoutColumns, setLayoutColumns] = useState(3);

    const {
        data: camps = [],
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["available-camps"],
        queryFn: async () => {
            const res = await axiosSecure.get("/available-camps");
            return res.data;
        },
    });

    // Filter and sort camps
    const filteredCamps = camps
        .filter(
            (camp) =>
                camp.campName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                camp.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                camp.dateTime.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            if (sortBy === "mostRegistered") return (b.participants || 0) - (a.participants || 0);
            if (sortBy === "campFees") return a.fees - b.fees;
            if (sortBy === "alphabetical") return a.campName.localeCompare(b.campName);
            return 0;
        });

    if (isLoading)
        return (
            <Typography textAlign="center" py={10}>
                Loading camps...
            </Typography>
        );
    if (isError)
        return (
            <Typography textAlign="center" py={10} color="error">
                Failed to load camps.
            </Typography>
        );

    return (
        <Box py={10} px={2} maxWidth="1200px" mx="auto">
            <Helmet>
                <title>Medicamp | Available Camp</title>
            </Helmet>

            <Typography
                variant="h4"
                fontWeight="600"
                textAlign="center"
                color="primary"
                mb={4}
            >
                Available Medical Camps
            </Typography>

            {/* Controls: Columns left, Search + Sort right */}
            <Grid container spacing={2} alignItems="center" mb={4}>
                {/* Columns Toggle (Left) */}
                <Grid item xs={12} sm={3}>
                    <ToggleButtonGroup
                        value={layoutColumns}
                        exclusive
                        onChange={(e, val) => val && setLayoutColumns(val)}
                        aria-label="layout toggle"
                        fullWidth
                    >
                        <ToggleButton value={2} aria-label="two columns">
                            <ViewListIcon /> 2 Columns
                        </ToggleButton>
                        <ToggleButton value={3} aria-label="three columns">
                            <ViewModuleIcon /> 3 Columns
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Grid>

                {/* Search + Sort (Right, justify-between) */}
                <Grid item xs={12} sm={9}>
                    <Grid container spacing={2} justifyContent="space-between">
                        {/* Search */}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                placeholder="Search by name, location, or date..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                variant="outlined"
                                size="medium"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon color="primary" />
                                        </InputAdornment>
                                    ),
                                    sx: {
                                        borderRadius: "50px",
                                        backgroundColor: "#f1f3f4",
                                        boxShadow: 1,
                                    },
                                }}
                            />
                        </Grid>

                        {/* Sort */}
                        <Grid item xs={12} sm={5} display="flex" justifyContent="flex-end">
                            <TextField
                                select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                variant="outlined"
                                size="medium"
                                sx={{
                                    borderRadius: "50px",
                                    minWidth: "180px",
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: "50px",
                                        backgroundColor: "#f1f3f4",
                                        px: 3,
                                        fontWeight: 500,
                                    },
                                }}
                            >
                                <MenuItem value="default">Sort By</MenuItem>
                                <MenuItem value="mostRegistered">Most Registered</MenuItem>
                                <MenuItem value="campFees">Camp Fees (Low to High)</MenuItem>
                                <MenuItem value="alphabetical">Alphabetical Order</MenuItem>
                            </TextField>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>

            {/* Camps Grid - Tailwind */}
            <div
                className={`grid gap-6 ${layoutColumns === 3
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                    : "grid-cols-1 sm:grid-cols-2"
                    }`}
            >
                {filteredCamps.map((camp) => (
                    <div
                        key={camp._id}
                        className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 flex flex-col"
                    >
                        <img
                            src={camp.image}
                            alt={camp.campName}
                            className="h-52 w-full object-cover rounded-t-xl"
                        />
                        <div className="p-4 flex flex-col flex-grow">
                            <h3 className="text-lg font-bold text-blue-600">{camp.campName}</h3>
                            <p className="text-sm text-gray-500">📍 {camp.location}</p>
                            <p className="text-sm text-gray-500">💰 ${camp.fees}</p>
                            <p className="text-sm text-gray-500">🗓️ {camp.dateTime}</p>
                            <p className="text-sm text-gray-500">👨‍⚕️ {camp.doctorName}</p>
                            <p className="text-sm text-green-600 font-medium">
                                👥 {camp.participants || 0} Participants
                            </p>
                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                                {camp.description}
                            </p>

                            <div className="mt-auto pt-4">
                                <RouterLink to={`/camp-details/${camp._id}`}>
                                    <Button
                                        variant="contained"
                                        size="small"
                                        sx={{
                                            background: "linear-gradient(to right, #3b82f6, #6366f1)", // blue-500 → indigo-500
                                            textTransform: "none",
                                            borderRadius: "8px",
                                            px: 2.5,
                                            py: 1,
                                            fontSize: "0.85rem",
                                            "&:hover": {
                                                background: "linear-gradient(to right, #2563eb, #4f46e5)", // darker on hover
                                            },
                                        }}
                                    >
                                        View Details
                                    </Button>
                                </RouterLink>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredCamps.length === 0 && (
                <Typography textAlign="center" color="text.secondary" mt={4}>
                    No camps found.
                </Typography>
            )}
        </Box>
    );
};

export default AvailableCamps;
