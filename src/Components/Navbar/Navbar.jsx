import React, { useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router"; // Corrected import
import { AuthContext } from "../../Provider/AuthProvider";
import { toast } from "react-toastify";
import {
    AppBar,
    Toolbar,
    IconButton,
    Avatar,
    Button,
    Menu,
    MenuItem,
    Typography,
    Box,
} from "@mui/material";
import { Logout, Login, Menu as MenuIcon, AccountCircle } from "@mui/icons-material";
import useUserRole from "../../Hooks/useUserRole";

const Navbar = () => {
    const { role } = useUserRole();
    const { user, logOut } = useContext(AuthContext);
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogOut = () => {
        logOut()
            .then(() => toast.success("Sign out successfully"))
            .catch((error) => toast.error(error.message));
    };

    const handleDashboardNavigate = () => {
        if (role === "user") {
            navigate("/dashboard/analytics");
        } else {
            navigate("/dashboard/organizer-profile");
        }
        handleMenuClose();
    };

    const navLinkClass = (path) =>
        `transition duration-200 ${pathname === path
            ? "text-blue-800 font-semibold "
            : "text-gray-700 hover:text-blue-600"
        }`;

    return (
        <AppBar
            position="sticky"
            color="default"
            elevation={1}
            sx={{ bgcolor: "white", px: 2 }}
        >
            <Toolbar className="flex justify-between items-center">
                {/* Logo */}
                <Box
                    onClick={() => navigate("/")}
                    sx={{ cursor: "pointer" }}
                    className="flex items-center gap-2"
                >
                    {/* <img className="h-10 w-10" src={} alt="logo" /> */}
                    <Typography variant="h6" color="primary" fontWeight="bold">
                        MediCamp
                    </Typography>
                </Box>

                {/* Nav Links */}
                <Box className="hidden md:flex items-center gap-6">
                    <Link to="/" className={navLinkClass("/")}>
                        Home
                    </Link>
                    {user && (
                        <Link
                            to="/available-camps"
                            className={navLinkClass("/available-camps")}
                        >
                            Available Camps
                        </Link>
                    )}
                    {!user && (
                        <Link to="/sign-in" className={navLinkClass("/sign-in")}>
                            Join Us
                        </Link>
                    )}
                </Box>

                {/* Auth buttons */}
                <Box className="flex items-center gap-4">
                    {user ? (
                        <>
                            <IconButton onClick={handleMenuOpen} size="small">
                                <Avatar
                                    src={user.photoURL}
                                    alt={user.displayName || "User"}
                                    sx={{ width: 40, height: 40 }}
                                >
                                    <AccountCircle />
                                </Avatar>
                            </IconButton>
                            <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={handleMenuClose}
                                anchorOrigin={{
                                    vertical: "bottom",
                                    horizontal: "right",
                                }}
                                transformOrigin={{
                                    vertical: "top",
                                    horizontal: "right",
                                }}
                            >
                                <MenuItem disabled>
                                    {user?.displayName || "User"}
                                </MenuItem>
                                <MenuItem onClick={handleDashboardNavigate}>
                                    Dashboard
                                </MenuItem>
                                <MenuItem
                                    onClick={handleLogOut}
                                    sx={{ color: "red" }}
                                >
                                    <Logout fontSize="small" sx={{ mr: 1 }} />
                                    Logout
                                </MenuItem>
                            </Menu>
                        </>
                    ) : (
                        <Box className="flex gap-2">
                            <Button
                                variant={pathname === "/sign-in" ? "contained" : "outlined"}
                                onClick={() => navigate("/sign-in")}
                                startIcon={<Login />}
                            >
                                Sign In
                            </Button>
                            <Button
                                variant={pathname === "/sign-up" ? "contained" : "outlined"}
                                onClick={() => navigate("/sign-up")}
                            >
                                Sign Up
                            </Button>
                        </Box>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
