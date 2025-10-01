import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link as RouterLink } from "react-router";
import useAxiosSecure from "../../Hooks/useAxiosSecure";
import { Helmet } from "react-helmet-async";
import {
    Box,
    Grid,
    Card,
    CardMedia,
    CardContent,
    Typography,
    TextField,
    MenuItem,
    Button,
    InputAdornment,
    ToggleButton,
    ToggleButtonGroup,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import ViewListIcon from "@mui/icons-material/ViewList";

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
                                        px: 3, // horizontal padding for fancy look
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

            {/* Camps Grid */}
            <Grid container spacing={4}>
                {filteredCamps.map((camp) => (
                    <Grid
                        item
                        key={camp._id}
                        xs={12}
                        sm={6}
                        md={layoutColumns === 3 ? 4 : 6}
                    >
                        <Card
                            sx={{
                                height: "100%",
                                display: "flex",
                                flexDirection: "column",
                                transition: "0.3s",
                                "&:hover": { boxShadow: 6 },
                            }}
                        >
                            <CardMedia
                                component="img"
                                height="200"
                                image={camp.image}
                                alt={camp.campName}
                            />
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Typography variant="h6" color="primary" fontWeight="bold">
                                    {camp.campName}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    📍 {camp.location}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    💰 ${camp.fees}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    🗓️ {camp.dateTime}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    👨‍⚕️ {camp.doctorName}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="success.main"
                                    fontWeight="medium"
                                >
                                    👥 {camp.participants || 0} Participants
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                        mt: 1,
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        display: "-webkit-box",
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: "vertical",
                                    }}
                                >
                                    {camp.description}
                                </Typography>

                                <Box mt={2}>
                                    <Button
                                        component={RouterLink}
                                        to={`/camp-details/${camp._id}`}
                                        variant="contained"
                                        color="primary"
                                        size="small"
                                    >
                                        View Details
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {filteredCamps.length === 0 && (
                <Typography textAlign="center" color="text.secondary" mt={4}>
                    No camps found.
                </Typography>
            )}
        </Box>
    );
};

export default AvailableCamps;
