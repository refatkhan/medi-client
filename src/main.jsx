import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
//import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { RouterProvider } from "react-router";
import { router } from "./Router/Route.jsx";
import AuthProvider from "./Provider/AuthProvider.jsx";
import { HelmetProvider } from "react-helmet-async";
import ThemeProvider from "./Provider/ThemeProvider.jsx";

//const stripePromise = loadStripe(import.meta.env.VITE_payment_key);
const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <RouterProvider router={router} />
          </AuthProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </ThemeProvider>

  </StrictMode>
);
