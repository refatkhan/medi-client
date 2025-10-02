import React from "react";
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Typography,
    Box,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { motion } from "framer-motion";

const Accordian = ({ items }) => {
    // Default data if none provided
    const defaultItems = [
        {
            title: "Camp Details",
            content:
                "This camp is held in Dhaka from 10 AM to 4 PM. Make sure to carry your ID and registration confirmation.",
        },
        {
            title: "Payment Information",
            content:
                "You can pay via Stripe, Bkash, or Rocket. Payments must be completed 24 hours before joining the camp.",
        },
        {
            title: "Feedback",
            content:
                "Your feedback matters! Please provide feedback after attending to help us improve future camps.",
        },
        {
            title: "Guidelines",
            content:
                "Follow all safety protocols, wear masks if required, and maintain social distancing during the camp.",
        },
    ];

    const displayItems = items && items.length > 0 ? items : defaultItems;

    return (
        <Box
            sx={{
                width: "85%",
                mx: "auto", // centers horizontally
                mt: 5,
            }}
        >
            {/* FAQ Header */}
            <Typography
                variant="h4"
                fontWeight="bold"
                textAlign="center"
                sx={{ mb: 4 }}
            >
                Frequently Asked Questions
            </Typography>

            {/* Accordions */}
            {displayItems.map((item, index) => (
                <Accordion
                    key={index}
                    sx={{
                        mb: 1,
                        border: "1px solid #ccc",
                        borderRadius: 1,
                        boxShadow: "none", // remove any shadow
                    }}
                >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="subtitle1" fontWeight={500}>
                            {item.title}
                        </Typography>
                    </AccordionSummary>

                    <AccordionDetails>
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Typography variant="body2">{item.content}</Typography>
                        </motion.div>
                    </AccordionDetails>
                </Accordion>
            ))}
        </Box>
    );
};

export default Accordian;
