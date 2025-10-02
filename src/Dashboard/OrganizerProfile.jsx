import React, { useContext, useState, useEffect } from "react";
import {
    Card,
    CardContent,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    Avatar,
    Typography,
    Box,
    CircularProgress,
} from "@mui/material";
import { AuthContext } from "../Provider/AuthProvider";
import Swal from "sweetalert2";
import { updateProfile } from "firebase/auth";
import { auth, db } from "../firebase/firebase-init";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { Helmet } from "react-helmet-async";

const OrganizerProfile = () => {
    const { user } = useContext(AuthContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [profile, setProfile] = useState({
        name: "",
        photoURL: "",
        contact: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch contact from Firestore and sync with Firebase Auth data
    useEffect(() => {
        const fetchProfile = async () => {
            if (user?.uid) {
                try {
                    const docRef = doc(db, "users", user.uid);
                    const docSnap = await getDoc(docRef);
                    const contactFromDB = docSnap.exists() ? docSnap.data().contact : "";

                    setProfile({
                        name: user.displayName || "",
                        photoURL: user.photoURL || "",
                        contact: contactFromDB || "",
                    });
                } catch (err) {
                    console.error("Fetch Profile Error:", err.message);
                    setError(err.message);
                }
            }
        };
        fetchProfile();
    }, [user]);

    const handleFinish = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const name = formData.get("name");
        const photoURL = formData.get("photoURL");
        const contact = formData.get("contact");

        setIsLoading(true);
        setError(null);

        try {
            // Update Firebase Auth profile
            await updateProfile(auth.currentUser, {
                displayName: name,
                photoURL: photoURL,
            });

            // Store contact in Firestore
            await setDoc(
                doc(db, "users", auth.currentUser.uid),
                { contact },
                { merge: true }
            );

            toast.success("Profile Updated Successfully");
            await auth.currentUser.reload();

            // Update local state
            setProfile((prev) => ({ ...prev, name, photoURL, contact }));

            Swal.fire("Success", "Profile updated successfully", "success");
            setIsModalOpen(false);
        } catch (err) {
            console.error("Profile Update Error:", err.message);
            setError(err.message);
            toast.error("Failed to update profile");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <Box textAlign="center" py={5}>
                <CircularProgress />
                <Typography variant="body1" mt={2}>
                    Loading...
                </Typography>
            </Box>
        );
    }

    if (error && error.includes("404")) {
        return (
            <Typography textAlign="center" color="error" py={5}>
                User not found. Please contact admin.
            </Typography>
        );
    }

    if (error) {
        return (
            <Typography textAlign="center" color="error" py={5}>
                Error: {error}
            </Typography>
        );
    }

    return (
        <>
        <Helmet>
            <title>Profile | My Dashboard</title>
            <meta
                name="description"
                content="View and update your user profile information."
            />
        </Helmet>
            <Box px={2} py={4}>
                <Box maxWidth="700px" mx="auto">
                    <Card elevation={3} sx={{ borderRadius: 3 }}>
                        <CardContent>
                            <Box
                                display="flex"
                                flexDirection={{ xs: "column", sm: "row" }}
                                alignItems={{ xs: "center", sm: "flex-start" }}
                                gap={3}
                            >
                                <Avatar
                                    src={profile.photoURL || "/default-avatar.png"}
                                    sx={{ width: 100, height: 100, mx: "auto" }}
                                />
                                <Box textAlign={{ xs: "center", sm: "left" }}>
                                    <Typography variant="h6" fontWeight={600}>
                                        {profile.name || "No Name"}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Contact: {profile.contact || "Not Provided"}
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        size="medium"
                                        onClick={() => setIsModalOpen(true)}
                                        sx={{ mt: 2 }}
                                    >
                                        Update Profile
                                    </Button>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>

                {/* Modal */}
                <Dialog
                    open={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    fullWidth
                    maxWidth="sm"
                >
                    <DialogTitle>Update Profile</DialogTitle>
                    <DialogContent>
                        <Box
                            component="form"
                            onSubmit={handleFinish}
                            noValidate
                            sx={{ mt: 2 }}
                        >
                            <TextField
                                margin="normal"
                                fullWidth
                                label="Full Name"
                                name="name"
                                defaultValue={profile.name}
                                required
                            />
                            <TextField
                                margin="normal"
                                fullWidth
                                label="Photo URL"
                                name="photoURL"
                                defaultValue={profile.photoURL}
                                required
                            />
                            <TextField
                                margin="normal"
                                fullWidth
                                label="Contact"
                                name="contact"
                                defaultValue={profile.contact || ""}
                                required
                            />
                            <Button
                                type="submit"
                                variant="contained"
                                fullWidth
                                sx={{ mt: 3, mb: 2 }}
                                disabled={isLoading}
                            >
                                {isLoading ? "Updating..." : "Update"}
                            </Button>
                        </Box>
                    </DialogContent>
                </Dialog>
            </Box>
        </>

    );
};

export default OrganizerProfile;
