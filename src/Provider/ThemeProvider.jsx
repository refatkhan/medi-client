// src/providers/ThemeProvider.jsx
import React from "react";
import { ThemeProvider as MuiThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

const theme = createTheme({
    palette: {
        mode: "light", // can switch to "dark" if needed
        primary: {
            main: "#4f46e5", // Indigo-600
        },
        secondary: {
            main: "#f43f5e", // Pink-500
        },
    },
});

const ThemeProvider = ({ children }) => {
    return (
        <MuiThemeProvider theme={theme}>
            <CssBaseline />
            {children}
        </MuiThemeProvider>
    );
};

export default ThemeProvider;
