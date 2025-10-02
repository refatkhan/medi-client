// HealthTips.jsx
import React from "react";
import { Box, Typography, Grid, Card, CardContent } from "@mui/material";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import WaterIcon from "@mui/icons-material/Opacity";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import HandshakeIcon from "@mui/icons-material/Handshake";

const healthTips = [
  {
    title: "Wash Hands Regularly",
    icon: <HandshakeIcon sx={{ fontSize: 40, color: "#fff" }} />,
    gradient: "linear-gradient(135deg, #56ab2f, #a8e063)",
  },
  {
    title: "Stay Hydrated",
    icon: <WaterIcon sx={{ fontSize: 40, color: "#fff" }} />,
    gradient: "linear-gradient(135deg, #36d1dc, #5b86e5)",
  },
  {
    title: "Eat a Balanced Diet",
    icon: <RestaurantIcon sx={{ fontSize: 40, color: "#fff" }} />,
    gradient: "linear-gradient(135deg, #f7971e, #ffd200)",
  },
  {
    title: "Get Regular Checkups",
    icon: <LocalHospitalIcon sx={{ fontSize: 40, color: "#fff" }} />,
    gradient: "linear-gradient(135deg, #ff512f, #dd2476)",
  },
  {
    title: "Exercise Daily",
    icon: <FitnessCenterIcon sx={{ fontSize: 40, color: "#fff" }} />,
    gradient: "linear-gradient(135deg, #00c6ff, #0072ff)",
  },
];

const HealthTips = () => {
  return (
    <Box py={8} px={2} bgcolor="#f5f5f5">
      <Box textAlign="center" mb={6}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          💡 Health Tips & Awareness
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Simple tips to stay healthy and prevent common illnesses
        </Typography>
      </Box>

      <Grid container spacing={3} justifyContent="center">
        {healthTips.map((tip, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              sx={{
                height: "100%",
                background: tip.gradient,
                color: "#fff",
                borderRadius: 3,
                transition: "transform 0.3s, box-shadow 0.3s",
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
                },
              }}
            >
              <CardContent
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  gap: 2,
                  py: 6,
                }}
              >
                {tip.icon}
                <Typography variant="h6" fontWeight="bold">
                  {tip.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default HealthTips;
