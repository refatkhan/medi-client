import { createBrowserRouter } from "react-router-dom"; // Use 'react-router-dom'

// --- Layouts ---
import RootLayout from "../RootLayout/RootLayout.jsx"; // Main site layout
import DashboardLayout from "../Dashboard/Dashboard.jsx"; // Your new dashboard layout

// --- Public Pages ---
import Home from "../Pages/Home/Home.jsx";
import SignIn from "../Pages/SignIn/SignIn.jsx"; // Corrected name
import SignUp from "../Pages/SignUp/SignUp.jsx"; // Corrected name
import AvailableCamps from "../Pages/Available-Camp/AvailableCamps.jsx";
import CampDetails from "../Pages/CampDetails/CampDetails.jsx";
import ErrorPage from "../Pages/ErrorPage/ErrorPage.jsx";

// --- Dashboard Pages ---
import OrganizerProfile from "../Dashboard/OrganizerProfile.jsx";
import AddCamp from "../Dashboard/AddCamp.jsx";
import ManageCamps from "../Dashboard/ManageCamps.jsx";
import UpdateCamp from "../Dashboard/UpdateCamp.jsx";
import ManageRegisteredCamps from "../Dashboard/ManageRegisteredCamps.jsx";
import ParticipantProfile from "../Dashboard/Participant-Dashboard/ParticipantProfile.jsx";
import ParticipantAnalytics from "../Dashboard/Participant-Dashboard/ParticipantAnalytics.jsx";
import RegisteredCamps from "../Dashboard/Participant-Dashboard/RegisteredCamps.jsx";
import PaymentHistory from "../Dashboard/Participant-Dashboard/PaymentHistory.jsx";
import FeedbackRatings from "../Dashboard/Participant-Dashboard/FeedbackRatings.jsx"; // Added for the link

// --- Auth & Route Protection ---
import PrivateRoute from "./PrivateRoute.jsx";
import OrganizerOverview from "../Dashboard/OrganizerOverview.jsx";
import PaymentPage from "../Dashboard/Participant-Dashboard/PaymentPage.jsx";

export const router = createBrowserRouter([
    {
        // --- Main Public Website ---
        path: "/",
        element: <RootLayout />,
        errorElement: <ErrorPage />,
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
            // Catch-all for any other invalid public routes
            { path: "*", element: <ErrorPage /> },
        ],
    },
    {
        // --- Dashboard Section ---
        // This is a separate route tree, so it does NOT use RootLayout
        path: "/dashboard",
        element: (
            <PrivateRoute>
                <DashboardLayout />
            </PrivateRoute>
        ),
        errorElement: <ErrorPage />,
        children: [
            // Note: The DashboardLayout now handles redirection from "/dashboard"
            // to the correct default page, so an index route is not strictly needed.

            // --- Organizer Routes ---
            { path: "profile", element: <OrganizerProfile /> },
            { path: "add-camp", element: <AddCamp /> },
            { path: "manage-camps", element: <ManageCamps /> },
            { path: "overview", element: <OrganizerOverview /> },
            { path: "update-camp/:campId", element: <UpdateCamp /> },
            { path: "manage-registered-camps", element: <ManageRegisteredCamps /> },

            // --- Participant/User Routes ---
            { path: "profile", element: <ParticipantProfile /> },
            { path: "analytics", element: <ParticipantAnalytics /> },
            { path: "registered-camps", element: <RegisteredCamps /> },
            { path: "payment-history", element: <PaymentHistory /> },
            { path: "feedback-ratings", element: <FeedbackRatings /> },
            { path: "payment/:registrationId", element: <PaymentPage /> },
            // Catch-all for any invalid dashboard routes (e.g., /dashboard/invalidpage)
            { path: "*", element: <ErrorPage /> },
        ],
    },
]);
