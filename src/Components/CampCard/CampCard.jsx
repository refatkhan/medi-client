import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link as RouterLink } from "react-router-dom";
import axios from "axios";
import {
    Box,
    Typography,
    Grid,
    Card,
    CardMedia,
    CardContent,
    Button,
} from "@mui/material";

const fetchCamps = async () => {
    const res = await axios.get("http://localhost:3000/camps");
    return res.data;
};

const CampCard = () => {
    const { data: camps = [], isLoading, isError } = useQuery({
        queryKey: ["camps"],
        queryFn: fetchCamps,
    });

    if (isLoading)
        return (
            <Typography align="center" sx={{ py: 10 }}>
                Loading camps...
            </Typography>
        );

    if (isError)
        return (
            <Typography align="center" color="error" sx={{ py: 10 }}>
                Failed to load camps.
            </Typography>
        );

    const popularCamps = [...camps]
        .sort((a, b) => b.participants - a.participants)
        .slice(0, 6);

    return (
        <Box py={10} px={2} maxWidth="lg" mx="auto">
            <Typography
                variant="h4"
                component="h2"
                align="center"
                color="primary"
                gutterBottom
            >
                Popular Medical Camps
            </Typography>

            <Grid container spacing={4}>
                {popularCamps.map((camp) => (
                    <Grid item xs={12} sm={6} md={4} key={camp._id}>
                        <Card
                            sx={{
                                height: "100%",
                                display: "flex",
                                flexDirection: "column",
                                border: "2px solid",
                                borderColor: "primary.main",
                                transition: "0.3s",
                                "&:hover": {
                                    boxShadow: 6,
                                },
                            }}
                        >
                            <CardMedia
                                component="img"
                                height="180"
                                image={camp.image}
                                alt={camp.campName}
                            />
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Typography variant="h6" color="primary" gutterBottom>
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
                                <Typography variant="body2" color="success.main" fontWeight="medium">
                                    👥 {camp.participants || 0} Participants
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                        display: "-webkit-box",
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: "vertical",
                                        overflow: "hidden",
                                    }}
                                >
                                    {camp.description}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Box textAlign="center" mt={5}>
                <Button
                    component={RouterLink}
                    to="/available-camps"
                    variant="contained"
                    color="primary"
                >
                    See All Camps
                </Button>
            </Box>
        </Box>
    );
};

export default CampCard;
