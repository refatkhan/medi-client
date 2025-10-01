import React, { useContext, useState } from "react";
import {
    Button,
    Card,
    CardContent,
    CardMedia,
    Typography,
    CircularProgress,
    Box,
} from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router";
import useAxiosSecure from "../../Hooks/useAxiosSecure";
import CampsJoinModal from "../../Components/Modal/CampsJoinModal";
import { AuthContext } from "../../Provider/AuthProvider";
import Swal from "sweetalert2";

const CampDetails = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { user } = useContext(AuthContext);
    const { id } = useParams();
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();

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

    // Check join status
    const { data: joinStatus, isLoading: joinStatusLoading } = useQuery({
        queryKey: ["joinStatus", user?.email, id],
        queryFn: async () => {
            if (!user?.email || !id) return { joined: false };
            const res = await axiosSecure.get(
                `/check-join-status?email=${user.email}&campId=${id}`
            );
            return res.data;
        },
        enabled: !!user?.email && !!id,
    });

    // Join camp mutation
    const mutation = useMutation({
        mutationFn: async (participantData) => {
            const res = await axiosSecure.post("/camps-join", participantData);
            await axiosSecure.patch(`/camps-update-count/${camp._id}`);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["campDetails", id]);
            queryClient.invalidateQueries(["joinStatus", user?.email, id]);
            Swal.fire(
                "Success",
                "Registration successful! Please pay to confirm.",
                "success"
            );
        },
        onError: (error) => {
            Swal.fire("Error", error.message || "Registration failed", "error");
        },
    });

    const handleJoin = (formData) => {
        mutation.mutate({
            ...formData,
            campId: camp._id,
            organizerEmail: camp.organizerEmail,
        });
    };

    // Show loader while fetching
    if (campLoading || roleLoading || joinStatusLoading) {
        return (
            <Box display="flex" justifyContent="center" py={10}>
                <CircularProgress size={60} />
            </Box>
        );
    }

    const isOrganizer = userRole?.role === "organizer";
    const hasJoined = joinStatus?.joined;
    const isDisabled = hasJoined || isOrganizer;

    return (
        <Box maxWidth="800px" mx="auto" p={2}>
            <Card>
                {camp.image && (
                    <CardMedia
                        component="img"
                        height="300"
                        image={camp.image}
                        alt="camp"
                    />
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
                        color="primary"
                        sx={{ mt: 3 }}
                        onClick={() => setIsModalOpen(true)}
                        disabled={isDisabled}
                    >
                        {hasJoined
                            ? "Already Joined"
                            : isOrganizer
                                ? "Organizer cannot join"
                                : "Join Camp"}
                    </Button>
                </CardContent>
            </Card>

            {/* Join Modal */}
            <CampsJoinModal
                visible={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                camp={camp}
                user={user}
                onSubmit={handleJoin}
            />
        </Box>
    );
};

export default CampDetails;
