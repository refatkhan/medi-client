import React from "react";
import { useNavigate } from "react-router";
import { Box, Typography, Button, Stack } from "@mui/material";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import FavoriteIcon from "@mui/icons-material/Favorite";

const AboutUs = () => {
    const navigate = useNavigate();

    return (
        <Box sx={{ py: 12 }}>
            <Box sx={{ maxWidth: 1000, mx: "auto", px: { xs: 2, sm: 4 } }}>
                {/* Header */}
                <Typography
                    variant="h3"
                    align="center"
                    sx={{ fontWeight: "bold", mb: 4, color: "primary.main" }}
                >
                    About MediCamp
                </Typography>

                {/* Intro Text */}
                <Typography
                    align="center"
                    sx={{
                        mb: 8,
                        color: "grey.800",
                        fontSize: { xs: "1rem", md: "1.2rem" },
                        lineHeight: 1.6,
                    }}
                >
                    We bring healthcare to communities that need it most. Our medical camps
                    provide check-ups, vaccinations, and life-saving treatments — giving hope
                    and smiles to thousands every year.
                </Typography>

                {/* Highlights Row */}
                <Stack
                    direction={{ xs: "column", md: "row" }}
                    spacing={4}
                    justifyContent="space-between"
                    alignItems={{ xs: "center", md: "flex-start" }}
                    textAlign="center"
                    mb={8}
                >
                    {/* Highlight 1 */}
                    <Box>
                        <HealthAndSafetyIcon color="primary" sx={{ fontSize: 50, mb: 2 }} />
                        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                            Free Check-ups
                        </Typography>
                        <Typography color="grey.700">
                            Early detection and care for all.
                        </Typography>
                    </Box>

                    {/* Highlight 2 */}
                    <Box>
                        <LocalHospitalIcon color="primary" sx={{ fontSize: 50, mb: 2 }} />
                        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                            Vaccinations
                        </Typography>
                        <Typography color="grey.700">
                            Protecting communities with essential vaccines.
                        </Typography>
                    </Box>

                    {/* Highlight 3 */}
                    <Box>
                        <FavoriteIcon color="primary" sx={{ fontSize: 50, mb: 2 }} />
                        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                            Health Awareness
                        </Typography>
                        <Typography color="grey.700">
                            Promoting healthy lifestyles and well-being.
                        </Typography>
                    </Box>
                </Stack>

                {/* Call-to-Action Button */}
                <Box textAlign="center">
                    <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        onClick={() => navigate("/available-camps")}
                    >
                        Join Our Next Camp
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};

export default AboutUs;
