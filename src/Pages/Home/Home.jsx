import React from 'react';
import Slider from '../../Components/Slider/Slider';
import AboutUs from '../../Components/AboutUs/AboutUs';
import CampCard from '../../Components/CampCard/CampCard';
import Feedback from '../../Components/Feedback/Feedback';
import Accordian from '../../Components/Accordian/Accordian';

const Home = () => {
    return (
        <div>
            <Slider />
            <CampCard />
            <Feedback />
            <AboutUs />
            <Accordian />
        </div>
    );
};

export default Home;