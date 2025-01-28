import Image from "next/image";
import HeroSection from "./components/HeroSection_Section1";
import ContentStrip from "./components/ContentStrip_Section2";
import Discover from "./components/Discover_Section3";
import WhyChooseUs from "./components/WhyChooseUs_Section4";
import FeaturedTutors from "./components/FeaturedTutors_Section5";
import LandingBanner from "./components/LandingBanner_Section6";

export default function Home() {
  return (
    <div className="">
      <HeroSection />
      <ContentStrip />
      <Discover />
      <WhyChooseUs />
      <FeaturedTutors />
      <LandingBanner />
    </div>
  );
}
