"use client";
import React, { useEffect, useState } from "react";
import { Poppins } from "next/font/google";
import Link from "next/link";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "800"],
});

const useDeviceSize = () => {
  const [isMobile, setIsMobile] = useState(false);

  const handleResize = () => {
    setIsMobile(window.innerWidth < 768); // Adjust the breakpoint as needed
  };

  useEffect(() => {
    handleResize(); // Check on mount
    window.addEventListener("resize", handleResize); // Add event listener
    return () => window.removeEventListener("resize", handleResize); // Cleanup
  }, []);

  return isMobile;
};

const LandingBanner = () => {
  const isMobile = useDeviceSize();

  return (
    <div className={`${poppins.className} mb-16 lg:mb-28 mt-20`}>
      {/* Container with responsive height */}
      <div className="max-w-[1536px] relative overflow-hidden flex items-center justify-center h-[460px] sm:h-[400px] lg:h-[292px] mx-auto bg-gradient-to-r from-[#FFF3EC] to-[#FFBB95]">
        {/* Top Polygon */}
        <div className="absolute right-0 -top-1 ">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={isMobile ? "150" : "229"} // Adjusted width for mobile
            height={isMobile ? "50" : "78"} // Adjusted height for mobile
            viewBox="0 0 229 78"
            className="sm:w-[150px] sm:h-[50px] lg:w-[229px] lg:h-[78px]"
            fill="none"
          >
            <path
              d="M156.684 77.5624C156.383 77.8779 155.912 77.9615 155.52 77.769L1.35874 1.96677C0.40857 1.49956 0.741152 0.0693938 1.79999 0.0693941L228.386 0.0689384C229.266 0.0689322 229.717 1.12351 229.109 1.75975L156.684 77.5624Z"
              fill="url(#paint0_linear_569_284)"
            />
            <defs>
              <linearGradient
                id="paint0_linear_569_284"
                x1="155.581"
                y1="-25.3621"
                x2="156.178"
                y2="78.0929"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#4ED2D5" />
                <stop offset="1" stopColor="#157577" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Side Polygon */}
        <div className="absolute right-0 top-0 overflow-visible">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={isMobile ? "50" : "68"} // Adjusted width for mobile
            height={isMobile ? "100" : "140"} // Adjusted height for mobile
            viewBox="0 0 68 140"
            className="sm:w-[50px] sm:h-[100px] lg:w-[68px] lg:h-[140px]"
            fill="none"
          >
            <path
              d="M0.0451229 72.9169L69.5781 0.590165L69.5777 139.555L0.0451229 72.9169Z"
              fill="url(#paint0_linear_569_285)"
            />
            <defs>
              <linearGradient
                id="paint0_linear_569_285"
                x1="34.6614"
                y1="0.735774"
                x2="35.2409"
                y2="139.698"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#4AB7B9" />
                <stop offset="1" stopColor="#147577" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Bottom Polygon */}
        <div className="absolute bottom-0 left-0 overflow-visible">
          <svg
            width={isMobile ? "204" : "408"} // Adjusted width
            height={isMobile ? "51" : "102"} // Adjusted height
            viewBox={isMobile ? "0 0 204 51" : "0 0 408 102"}
            className="sm:w-[204px] sm:h-[51px] lg:w-[408px] lg:h-[102px]"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M134.5 0.595703L407.731 101.846H-138.731L134.5 0.595703Z"
              fill="url(#paint0_linear_569_287)"
              transform={
                isMobile
                  ? "scale(-1, 1) translate(-204, 0)"
                  : "scale(1, 1) translate(0, 0)"
              } // Flipping horizontally
            />
            <defs>
              <linearGradient
                id="paint0_linear_569_287"
                x1="-181"
                y1="68.0957"
                x2="450"
                y2="68.0957"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#A7F3F4" />
                <stop offset="1" stopColor="#0E8688" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Content Container */}
        <div className="text-center w-[80%] sm:w-[80%] lg:w-[52%] flex flex-col items-center gap-4">
          <h1 className="text-secondary-800 text-[20px] sm:text-[22px] lg:text-[27px] font-[600]">
            Your Perfect Tutor is Just a Few Clicks Away
          </h1>
          <p className="sm:text-sm  text-center ">
            With our easy-to-use search tools, you can browse tutor profiles,
            filter by subject, availability, and reviews, schedule a session as
            per your need.
          </p>
          <Link href={'/find-tutor'}>
            <button className="text-white font-[600] mt-8 lg:mt-0 w-[207px] h-[31px] sm:w-[180px] sm:h-[28px] lg:w-[207px] lg:h-[31px] rounded-[4px] hover:text-[17px] text-[16px] bg-[#168386] hover:bg-gradient-to-r hover:from-[#0EACB0] hover:to-[#0A6D70]">
              Explore Tutors
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingBanner;
