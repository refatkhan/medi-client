import { createBrowserRouter } from "react-router"; // Corrected import
import Home from "../Pages/Home/Home.jsx";
import SignIn from "../Pages/SignIn/SIgnIn.jsx"; // Fixed typo
import SignUp from "../Pages/SignUp/SignUp.jsx"; // Fixed typo

import Dashboard from "../Dashboard/Dashboard.jsx";
import AddCamp from "../Dashboard/AddCamp.jsx";
import AvailableCamps from "../Pages/Available-Camp/AvailableCamps.jsx";
import CampDetails from "../Pages/CampDetails/CampDetails.jsx";
import ManageCamps from "../Dashboard/ManageCamps.jsx";
import UpdateCamp from "../Dashboard/UpdateCamp.jsx";
import ManageRegisteredCamps from "../Dashboard/ManageRegisteredCamps.jsx";
import ParticipantProfile from "../Dashboard/Participant-Dashboard/ParticipantProfile.jsx";
import RegisteredCamps from "../Dashboard/Participant-Dashboard/RegisteredCamps.jsx";
import PaymentHistory from "../Dashboard/Participant-Dashboard/PaymentHistory.jsx";
import PrivateRoute from "./PrivateRoute.jsx";
import OrganizerProfile from "../Dashboard/OrganizerProfile.jsx";
import ParticipantAnalytics from "../Dashboard/Participant-Dashboard/ParticipantAnalytics.jsx";
import ErrorPage from "../Pages/ErrorPage/ErrorPage.jsx";
import RootLayout from "../RootLayout/RootLayout.jsx";

export const router = createBrowserRouter([
    {
        path: "/",
        element:<RootLayout/> ,
        errorElement: <ErrorPage />, // This catches route errors
        children: [
            { path: "/", element: <Home /> },
            { path: "sign-in", element: <SignIn /> },
            { path: "sign-up", element: <SignUp /> },
            { path: "available-camps", element: <AvailableCamps /> },
            {
                path: "camp-details/:id",
                element: (
                    <PrivateRoute>
                        <CampDetails />
                    </PrivateRoute>
                ),
            },
            {
                path: "dashboard",
                element: (
                    <PrivateRoute>
                        <Dashboard />
                    </PrivateRoute>
                ),
                children: [
                    { path: "organizer-profile", element: <OrganizerProfile /> },
                    { path: "add-camp", element: <AddCamp /> },
                    { path: "manage-camps", element: <ManageCamps /> },
                    { path: "update-camp/:campId", element: <UpdateCamp /> },
                    { path: "manage-registered-camps", element: <ManageRegisteredCamps /> },
                    { path: "profile", element: <ParticipantProfile /> },
                    { path: "analytics", element: <ParticipantAnalytics /> },
                    { path: "payment-history", element: <PaymentHistory /> },
                    { path: "registered-camps", element: <RegisteredCamps /> },
                    { path: "*", element: <ErrorPage /> }, // catches all invalid dashboard routes
                ],
            },
            { path: "*", element: <ErrorPage /> }, // catches all invalid root routes
        ],
    },
]);

