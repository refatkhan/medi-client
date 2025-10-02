// src/Layout/RootLayout.jsx
import { Outlet } from "react-router";
import Navbar from "../Components/Navbar/Navbar";
import Footer from "../Components/Footer/Footer";
const RootLayout = () => {
    return (
        <div className="bg-base-100 text-base-content min-h-screen transition-colors duration-300">
            <Navbar></Navbar>
            <main className="min-h-[calc(100vh-136px)] ">
                <Outlet />
            </main>
            <Footer></Footer>
        </div>
    );
};

export default RootLayout;
