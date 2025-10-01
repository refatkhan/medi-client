import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { RouterProvider } from "react-router";
import { router } from "./Router/Route.jsx";
import AuthProvider from "./Provider/AuthProvider.jsx";
import { HelmetProvider } from "react-helmet-async";
import ThemeProvider from "./Provider/ThemeProvider.jsx";
import { ToastContainer } from "react-toastify"; // <- import ToastContainer
import "react-toastify/dist/ReactToastify.css"; // <- import toast styles

const stripePromise = loadStripe(import.meta.env.VITE_payment_key);
const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <Elements stripe={stripePromise}>
              <RouterProvider router={router} />
            </Elements>
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
          </AuthProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </ThemeProvider>
  </StrictMode>
);
