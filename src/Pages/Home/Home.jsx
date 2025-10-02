import React from 'react';
import { Helmet } from 'react-helmet-async';
import Slider from '../../Components/Slider/Slider';
import AboutUs from '../../Components/AboutUs/AboutUs';
import CampCard from '../../Components/CampCard/CampCard';
import Feedback from '../../Components/Feedback/Feedback';
import Accordian from '../../Components/Accordian/Accordian';

const Home = () => {
    return (
        <div>
            <Helmet>
                <title>Home | Medical Camp </title>
                <meta
                    name="description"
                    content="Welcome to your dashboard. Browse camps, feedback, and more."
                />
            </Helmet>

            <Slider />
            <CampCard />
            <Feedback />
            <AboutUs />
            <Accordian />
        </div>
    );
};

export default Home;
