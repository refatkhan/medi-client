import React from 'react';
import { Helmet } from 'react-helmet-async';
import Slider from '../../Components/Slider/Slider';
import AboutUs from '../../Components/AboutUs/AboutUs';
import CampCard from '../../Components/CampCard/CampCard';
import Feedback from '../../Components/Feedback/Feedback';
import Accordian from '../../Components/Accordian/Accordian';
import HealthTips from '../../Components/HealthTips/HealthTips';
import HowItWorks from '../../Components/HowItWorks/HowItWorks';
import OurServices from '../../Components/OurService/OurServices';
import CTASection from '../../Components/CTA/CTASection';
import ContactSection from '../../Components/Contact/ContactSection';

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
            <OurServices />
             <HowItWorks />
            <CampCard />
            <Feedback />
             <HealthTips />
            <AboutUs />
            <CTASection />
            <Accordian />
            <ContactSection />
        </div>
    );
};

export default Home;
