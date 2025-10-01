import React from "react";
import useAuth from "../Hooks/useAuth";
import { Navigate, useLocation } from "react-router";

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();
    const token = localStorage.getItem("token");

    if (loading) {
        return <span className="loading loading-spinner loading-xl"></span>;
    }

    if (!user) {
        return (
            <Navigate state={{ from: location.pathname }} to="/sign-in"></Navigate>
        );
    }

    if (!token) {
        return <Navigate to="/sign-in" />;
    }

    return children;
};

export default PrivateRoute;
