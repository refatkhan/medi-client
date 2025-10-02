import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
    Box,
    Typography,
    CircularProgress,
    Alert,
    Card,
    CardContent,
    Rating,
} from "@mui/material";
import dayjs from "dayjs";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const Feedback = () => {
    const { data: feedbacks, isLoading, error } = useQuery({
        queryKey: ["feedbacks"],
        queryFn: async () => {
            const res = await axios.get("https://medi-server-ten.vercel.app/feedbacks");
            return res.data;
        },
    });

    if (isLoading)
        return (
            <Box display="flex" justifyContent="center" py={10}>
                <CircularProgress size={60} />
            </Box>
        );

    if (error)
        return (
            <Box display="flex" justifyContent="center" py={10}>
                <Alert severity="error">Error fetching feedbacks</Alert>
            </Box>
        );

    const settings = {
        dots: true,
        infinite: true,
        speed: 800,
        slidesToShow: 3,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3500,
        responsive: [
            { breakpoint: 1200, settings: { slidesToShow: 2 } },
            { breakpoint: 768, settings: { slidesToShow: 1 } },
        ],
    };

    return (
        <Box py={10} px={{ xs: 2, md: 10 }} bgcolor="#f0f4f8">
            {/* Header with linear gradient */}
            <Typography
                variant="h4"
                align="center"
                fontWeight="bold"
                mb={8}
                sx={{
                    background: "linear-gradient(90deg, #74b9ff, #a29bfe)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                }}
            >
                What Participants Say About Our Camps
            </Typography>

            {feedbacks && feedbacks.length > 0 ? (
                <Slider {...settings}>
                    {feedbacks.map((fb) => (
                        <Box key={fb._id} px={2} sx={{ outline: "none" }}>
                            <Card
                                sx={{
                                    maxWidth: 350,
                                    margin: "0 auto",
                                    borderRadius: 4,
                                    boxShadow: 6,
                                    transition: "0.4s ease-in-out",
                                    background: "linear-gradient(135deg, #74b9ff 0%, #a29bfe 100%)",
                                    color: "#fff",
                                    position: "relative",
                                    pt: 4,
                                    pb: 4,
                                    px: 3,
                                }}
                            >
                                {/* Quote Icon */}
                                <Typography
                                    variant="h3"
                                    sx={{
                                        position: "absolute",
                                        top: -20,
                                        left: 20,
                                        opacity: 0.2,
                                    }}
                                >
                                    “
                                </Typography>
                                <CardContent sx={{ pt: 6 }}>
                                    <Typography variant="h6" fontWeight="bold" mb={1}>
                                        {fb.participantEmail}
                                    </Typography>
                                    <Rating
                                        value={fb.rating || 0}
                                        readOnly
                                        precision={0.5}
                                        sx={{ mb: 2, color: "#ffeaa7" }}
                                    />
                                    <Typography
                                        variant="body2"
                                        sx={{ fontStyle: "italic", mb: 2, lineHeight: 1.6 }}
                                    >
                                        "{fb.comment}"
                                    </Typography>

                                    <Typography
                                        variant="caption"
                                        sx={{ opacity: 0.8, display: "block", textAlign: "right" }}
                                    >
                                        {dayjs(fb.submittedAt).format("DD MMM, YYYY")}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Box>
                    ))}
                </Slider>
            ) : (
                <Typography align="center" color="text.secondary">
                    No feedbacks available.
                </Typography>
            )}
        </Box>
    );
};
export default Feedback;
