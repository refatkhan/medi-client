import React, { useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router";
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
import { Logout, Login, AccountCircle, PersonAdd } from "@mui/icons-material";
import logo from '../../assets/logo.png'
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
            ? "text-blue-800 font-semibold"
            : "text-gray-700 hover:text-blue-600"
        }`;

    return (
        <AppBar
            position="sticky"
            elevation={1}
            sx={{
                px: 2,
                background: "linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)",
            }}
        >
            <Toolbar className="flex justify-between items-center">
                {/* Logo */}
                <Box
                    onClick={() => navigate("/")}
                    sx={{ cursor: "pointer" }}
                    className="flex items-center gap-2"
                >
                    {/* Logo */}
                    <img
                        src={logo} // replace with your logo path
                        alt="MediCamp Logo"
                        style={{ width: "40px", height: "40px", objectFit: "contain" }}
                    />

                    <Typography variant="h6" color="white" fontWeight="bold">
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
                            <IconButton onClick={handleMenuOpen} size="small" sx={{ ml: 1 }}>
                                <Avatar
                                    src={user.photoURL || undefined}
                                    alt={user.displayName || "User"}
                                    sx={{ width: 40, height: 40 }}
                                >
                                    {!user.photoURL && <AccountCircle />}
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
                            {/* Sign Up Button */}
                            <Button
                                onClick={() => navigate("/sign-up")}
                                startIcon={<PersonAdd />}
                                sx={{
                                    background: "linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)",
                                    color: "white",
                                    fontWeight: "bold",
                                    textTransform: "none",
                                    boxShadow: "0px 4px 15px rgba(0,0,0,0.2)",
                                    "&:hover": {
                                        background: "linear-gradient(135deg, #ff4b2b 0%, #ff416c 100%)",
                                        boxShadow: "0px 6px 20px rgba(0,0,0,0.3)",
                                    },
                                }}
                            >
                                Sign Up
                            </Button>
                            <Button
                                onClick={() => navigate("/sign-in")}
                                startIcon={<Login />}
                                sx={{
                                    background: "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)",
                                    color: "white",
                                    fontWeight: "bold",
                                    textTransform: "none",
                                    boxShadow: "0px 4px 15px rgba(0,0,0,0.2)",
                                    "&:hover": {
                                        background: "linear-gradient(135deg, #2575fc 0%, #6a11cb 100%)",
                                        boxShadow: "0px 6px 20px rgba(0,0,0,0.3)",
                                    },
                                }}
                            >
                                Sign In
                            </Button>

                        </Box>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
