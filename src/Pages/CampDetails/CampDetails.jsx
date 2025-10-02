import React, { useContext, useState, useEffect } from "react";
import {
    Button,
    Card,
    CardContent,
    CardMedia,
    Typography,
    CircularProgress,
    Box,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import useAxiosSecure from "../../Hooks/useAxiosSecure";
import CampsJoinModal from "../../Components/Modal/CampsJoinModal";
import { AuthContext } from "../../Provider/AuthProvider";

const CampDetails = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [hasJoined, setHasJoined] = useState(false);
    const { user } = useContext(AuthContext);
    const { id } = useParams();
    const axiosSecure = useAxiosSecure();

    // Fetch camp details
    const { data: camp = {}, isLoading: campLoading } = useQuery({
        queryKey: ["campDetails", id],
        queryFn: async () => {
            const res = await axiosSecure.get(`/available-camps/${id}`);
            return res.data;
        },
    });

    // Fetch user role
    const { data: userRole, isLoading: roleLoading } = useQuery({
        queryKey: ["userRole", user?.email],
        queryFn: async () => {
            const res = await axiosSecure.get(`/users/role/${user?.email}`);
            return res.data;
        },
        enabled: !!user?.email,
    });

    // Check if user has joined
    useEffect(() => {
        const checkJoinStatus = async () => {
            if (!user?.email || !id) return;
            try {
                const res = await axiosSecure.get(
                    `/check-join-status?email=${user.email}&campId=${id}`
                );
                setHasJoined(res.data.joined);
            } catch {
                setHasJoined(false);
            }
        };
        checkJoinStatus();
    }, [user?.email, id, axiosSecure]);

    if (campLoading || roleLoading) {
        return (
            <Box display="flex" justifyContent="center" py={10}>
                <CircularProgress size={60} />
            </Box>
        );
    }

    const isOrganizer = userRole?.role === "organizer";
    const isDisabled = hasJoined || isOrganizer;

    // Linear gradient based on button state
    const buttonGradient = hasJoined
        ? "linear-gradient(to right, #9ca3af, #6b7280)" // gray
        : isOrganizer
            ? "linear-gradient(to right, #f87171, #ef4444)" // red
            : "linear-gradient(to right, #3b82f6, #6366f1)"; // blue-indigo

    const buttonHoverGradient = hasJoined
        ? "linear-gradient(to right, #6b7280, #4b5563)"
        : isOrganizer
            ? "linear-gradient(to right, #ef4444, #dc2626)"
            : "linear-gradient(to right, #2563eb, #4f46e5)";

    return (
        <Box maxWidth="800px" mx="auto" p={2}>
            <Card>
                {camp.image && (
                    <CardMedia component="img" height="300" image={camp.image} alt="camp" />
                )}
                <CardContent>
                    <Typography variant="h5" gutterBottom>
                        {camp.campName}
                    </Typography>
                    <Typography variant="body1">
                        <strong>Fees:</strong> ${camp.fees}
                    </Typography>
                    <Typography variant="body1">
                        <strong>Date:</strong> {camp.dateTime}
                    </Typography>
                    <Typography variant="body1">
                        <strong>Location:</strong> {camp.location}
                    </Typography>
                    <Typography variant="body1">
                        <strong>Doctor:</strong> {camp.doctorName}
                    </Typography>
                    <Typography variant="body1">
                        <strong>Participants:</strong> {camp.participants}
                    </Typography>
                    <Typography variant="body1">
                        <strong>Description:</strong> {camp.description}
                    </Typography>

                    <Button
                        variant="contained"
                        onClick={() => setIsModalOpen(true)}
                        disabled={isDisabled}
                        sx={{
                            mt: 3,
                            background: buttonGradient,
                            color: "white",
                            textTransform: "none",
                            borderRadius: "8px",
                            px: 2.5,
                            py: 1,
                            fontSize: "0.9rem",
                            "&:hover": { background: buttonHoverGradient },
                        }}
                    >
                        {hasJoined
                            ? "Already Joined"
                            : isOrganizer
                                ? "Organizer cannot join"
                                : "Join Camp"}
                    </Button>
                </CardContent>
            </Card>

            <CampsJoinModal
                visible={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                camp={camp}
                user={user}
                onJoined={() => setHasJoined(true)} // update button immediately
            />
        </Box>
    );
};

export default CampDetails;
