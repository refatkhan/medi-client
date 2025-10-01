import React, { useContext, useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router";
import { AuthContext } from "../Provider/AuthProvider";
import useAxiosSecure from "../Hooks/useAxiosSecure";

import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Box,
    Divider,
    CssBaseline,
    Button,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import PersonIcon from "@mui/icons-material/Person";
import BarChartIcon from "@mui/icons-material/BarChart";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import HistoryIcon from "@mui/icons-material/History";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import HomeIcon from "@mui/icons-material/Home";

import { motion } from "framer-motion";

const drawerWidth = 240;

const Dashboard = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [role, setRole] = useState(null);
    const { user } = useContext(AuthContext);
    const axiosSecure = useAxiosSecure();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserRole = async () => {
            try {
                if (user?.email) {
                    const res = await axiosSecure.get(`/users/role/${user.email}`);
                    setRole(res.data?.role);
                    console.log(setRole);
                    // Redirect based on role
                    if (res.data?.role === "user") {
                        navigate("/dashboard/analytics");
                    } else if (res.data?.role === "organizer") {
                        navigate("/dashboard/add-camp");
                    }
                }
            } catch (error) {
                console.error("Failed to fetch role:", error);
            }
        };

        fetchUserRole();
    }, [user?.email, axiosSecure, navigate]);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // Sidebar Links with Icons
    const organizerLinks = [
        { to: "organizer-profile", label: "Organizer Profile", icon: <AssignmentIndIcon /> },
        { to: "add-camp", label: "Add A Camp", icon: <LocalHospitalIcon /> },
        { to: "manage-camps", label: "Manage Camps", icon: <EventAvailableIcon /> },
        { to: "manage-registered-camps", label: "Manage Registered Camps", icon: <HistoryIcon /> },
    ];

    const userLinks = [
        { to: "analytics", label: "Analytics", icon: <BarChartIcon /> },
        { to: "profile", label: "Participant Profile", icon: <PersonIcon /> },
        { to: "registered-camps", label: "Registered Camps", icon: <EventAvailableIcon /> },
        { to: "payment-history", label: "Payment History", icon: <HistoryIcon /> },
    ];

    const drawerContent = (
        <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
        >
            <Box
                sx={{
                    width: drawerWidth,
                    height: "100%",
                    p: 2,
                    background: "linear-gradient(180deg, #e0f7fa, #ffffff)",
                }}
            >
                <Typography
                    variant="h6"
                    sx={{
                        mb: 2,
                        fontWeight: "bold",
                        color: "primary.main",
                        textAlign: "center",
                    }}
                >
                    Medical Camp
                </Typography>
                <Divider />
                <List>
                    {role === "organizer" &&
                        organizerLinks.map((item) => (
                            <motion.div
                                key={item.to}
                                whileHover={{ scale: 1.05 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                <ListItem disablePadding>
                                    <ListItemButton
                                        component={Link}
                                        to={item.to}
                                        onClick={() => setIsSidebarOpen(false)}
                                        sx={{
                                            borderRadius: 2,
                                            mb: 1,
                                            "&:hover": {
                                                bgcolor: "rgba(0, 150, 136, 0.1)",
                                            },
                                        }}
                                    >
                                        <ListItemIcon sx={{ color: "primary.main" }}>
                                            {item.icon}
                                        </ListItemIcon>
                                        <ListItemText primary={item.label} />
                                    </ListItemButton>
                                </ListItem>
                            </motion.div>
                        ))}

                    {role === "user" &&
                        userLinks.map((item) => (
                            <motion.div
                                key={item.to}
                                whileHover={{ scale: 1.05 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                <ListItem disablePadding>
                                    <ListItemButton
                                        component={Link}
                                        to={item.to}
                                        onClick={() => setIsSidebarOpen(false)}
                                        sx={{
                                            borderRadius: 2,
                                            mb: 1,
                                            "&:hover": {
                                                bgcolor: "rgba(33, 150, 243, 0.1)",
                                            },
                                        }}
                                    >
                                        <ListItemIcon sx={{ color: "primary.main" }}>
                                            {item.icon}
                                        </ListItemIcon>
                                        <ListItemText primary={item.label} />
                                    </ListItemButton>
                                </ListItem>
                            </motion.div>
                        ))}
                </List>
            </Box>
        </motion.div>
    );

    return (
        <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "grey.100" }}>
            <CssBaseline />

            {/* Header */}
            <AppBar
                position="fixed"
                sx={{
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    background: "linear-gradient(90deg, #0288d1, #26c6da)",
                    color: "white",
                }}
            >
                <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                        <IconButton
                            color="inherit"
                            edge="start"
                            onClick={toggleSidebar}
                            sx={{ mr: 2, display: { sm: "none" } }}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography variant="h6" noWrap fontWeight="bold">
                            Dashboard
                        </Typography>
                    </Box>

                    {/* Back to Home Button */}
                    <Button
                        component={Link}
                        to="/"
                        variant="contained"
                        startIcon={<HomeIcon />}
                        sx={{
                            textTransform: "none",
                            fontWeight: "bold",
                            borderRadius: 3,
                            px: 2,
                            background: "linear-gradient(90deg, #26c6da, #00acc1)",
                            "&:hover": {
                                background: "linear-gradient(90deg, #00acc1, #00838f)",
                            },
                        }}
                    >
                        Back to Home
                    </Button>
                </Toolbar>
            </AppBar>

            {/* Sidebar Drawer for Mobile */}
            <Drawer
                variant="temporary"
                open={isSidebarOpen}
                onClose={toggleSidebar}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: "block", sm: "none" },
                    "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
                }}
            >
                {drawerContent}
            </Drawer>

            {/* Sidebar Drawer for Desktop */}
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: "none", sm: "block" },
                    "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
                }}
                open
            >
                {drawerContent}
            </Drawer>

            {/* Main Content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: { xs: 2, md: 3 },
                    mt: 8,
                    bgcolor: "white",
                    minHeight: "100vh",
                }}
            >
                <Outlet />
            </Box>
        </Box>
    );
};

export default Dashboard;
