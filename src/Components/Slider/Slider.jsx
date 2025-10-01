import React, { useState, useEffect } from "react";
import { Box, Typography, Button } from "@mui/material";
import img1 from "../../assets/banner-1.jpg";
import img2 from "../../assets/banner-2.jpg";
import img3 from "../../assets/banner-3.jpg";

const images = [img1, img2, img3];
const sliderTexts = [
    {
        title: "Thousands Treated, Lives Changed",
        subtitle:
            "Our medical camps have brought healthcare to remote communities.",
        caption: "Over 5,000 patients served across 50+ successful camps.",
    },
    {
        title: "A Step Toward Healthier Futures",
        subtitle:
            "From basic checkups to life-saving treatments, we made a difference.",
        caption: "Smiles returned. Wounds healed. Hope restored.",
    },
    {
        title: "Together, We Care",
        subtitle:
            "Volunteers, doctors, and participants united for a healthier tomorrow.",
        caption: "Every camp is a story of compassion and impact.",
    },
];

const Slider = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? images.length - 1 : prevIndex - 1
        );
    };

    useEffect(() => {
        const interval = setInterval(nextSlide, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <Box
            sx={{
                position: "relative",
                width: "95%",
              
                margin: "auto",
                mt: 4,
            }}
        >
            {/* Slider Images */}
            {images.map((img, index) => (
                <Box
                    key={index}
                    sx={{
                        display: index === currentIndex ? "block" : "none",
                        position: "relative",
                        height: { xs: "250px", md: "500px" },
                        borderRadius: 2,
                        overflow: "hidden",
                    }}
                >
                    <img
                        src={img}
                        alt={`Slide ${index + 1}`}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    {/* Overlay */}
                    <Box
                        sx={{
                            position: "absolute",
                            inset: 0,
                            bgcolor: "rgba(0,0,0,0.6)",
                        }}
                    />

                    {/* Text Content */}
                    <Box
                        sx={{
                            position: "absolute",
                            inset: 0,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            textAlign: "center",
                            px: 2,
                        }}
                    >
                        <Typography
                            variant="h4"
                            component="h2"
                            sx={{ fontWeight: "bold", mb: 1 }}
                        >
                            {sliderTexts[index].title}
                        </Typography>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            {sliderTexts[index].subtitle}
                        </Typography>
                        <Typography variant="body1" sx={{ fontStyle: "italic" }}>
                            {sliderTexts[index].caption}
                        </Typography>
                    </Box>
                </Box>
            ))}

            {/* Previous Button */}
            <Button
                onClick={prevSlide}
                sx={{
                    position: "absolute",
                    top: "50%",
                    left: 16,
                    transform: "translateY(-50%)",
                    bgcolor: "rgba(255,255,255,0.8)",
                    minWidth: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    "&:hover": { bgcolor: "rgba(255,255,255,1)" },
                }}
            >
                ❮
            </Button>

            {/* Next Button */}
            <Button
                onClick={nextSlide}
                sx={{
                    position: "absolute",
                    top: "50%",
                    right: 16,
                    transform: "translateY(-50%)",
                    bgcolor: "rgba(255,255,255,0.8)",
                    minWidth: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    "&:hover": { bgcolor: "rgba(255,255,255,1)" },
                }}
            >
                ❯
            </Button>

            {/* Dots */}
            <Box
                sx={{
                    position: "absolute",
                    bottom: 16,
                    left: "50%",
                    transform: "translateX(-50%)",
                    display: "flex",
                    gap: 1,
                }}
            >
                {images.map((_, index) => (
                    <Box
                        key={index}
                        sx={{
                            width: 12,
                            height: 12,
                            borderRadius: "50%",
                            bgcolor: index === currentIndex ? "purple" : "grey.400",
                            cursor: "pointer",
                        }}
                        onClick={() => setCurrentIndex(index)}
                    />
                ))}
            </Box>
        </Box>
    );
};

export default Slider;
