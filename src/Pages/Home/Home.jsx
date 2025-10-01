import React from 'react';
import Slider from '../../Components/Slider/Slider';
import AboutUs from '../../Components/AboutUs/AboutUs';
import CampCard from '../../Components/CampCard/CampCard';

const Home = () => {
    return (
        <div>
            <Slider/>
            <CampCard/>
            <AboutUs/>
        </div>
    );
};

export default Home;