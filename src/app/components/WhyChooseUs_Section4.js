"use client";
import React, { useEffect } from "react";
import { Poppins } from "next/font/google";
import Image from "next/image";
import AOS from "aos";
import "aos/dist/aos.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "800"],
});

// Mobile Points Component with Dashed Circle
const MobilePoints = () => {
  const points = [
    { id: 1, text: "Expert Tutors" },
    { id: 2, text: "24/7 Availability" },
    { id: 3, text: "Personalized Learning" },
    { id: 4, text: "Wide Range of Subjects" },
    { id: 5, text: "Affordable Pricing" },
    { id: 6, text: "Easy Scheduling" },
  ];

  return (
    <div className="relative flex flex-col  gap-6">
      {/* Dashed Circle Line (behind the numbers) */}
      <div className="absolute top-0 bottom-0 left-[21px] w-0.5 border-l-2 border-dashed border-gray-400 z-0" />

      {/* Points List */}
      {points.map((point, index) => (
        <div
          key={point.id}
          className="relative flex items-center gap-4 z-10" // Make sure numbers have higher z-index
          data-aos="fade-down"
          data-aos-delay={`${index * 200}`} // Delay increases by 200ms for each element
        >
          {/* Number Circle */}
          <div
            className="w-[40px] h-[40px] flex items-center justify-center text-[18px] font-[800] rounded-full bg-custom-gradient border-[1px] border-white"
            style={{ zIndex: 1 }} // Ensure higher z-index than the dashed circle
          >
            {point.id}
          </div>

          {/* Point Text */}
          <p className="text-[16px] font-[500]">{point.text}</p>
        </div>
      ))}
    </div>
  );
};


const WhyChooseUs = () => {
  useEffect(() => {
    AOS.init({
      once: true, // Animation will happen only once
    });
  }, []);

  return (
    <div className={`h-fit lg:h-[80vh] lg:max-h-[700px] ${poppins.className} `}>
      <div className="container mx-auto px-[20px] lg:px-[50px] xl:px-[86px] py-[20px] ">
        <h1 className="text-center text-[27px] font-[600]">Why Choose Us?</h1>

        <div className="flex  lg:flex-row flex-col gap-20 justify-center lg:gap-0 items-center   mt-20 lg:mt-10">
          {/* Points Container for Desktop and Above */}
          <div className="hidden md:flex relative justify-center mx-auto  bg-white w-[306px] h-[256px]">
            <div className="border-[4px] border-dashed border-black/40 absolute w-[306px] h-[256px] rounded-[50%]"></div>

            {/* 1st point */}
            <div className="absolute bottom-[90%] left-[35%] flex flex-col items-center">
              <p className="text-[16px] font-[500]">Expert Tutors</p>
              {/* Circle */}
              <div className="w-[56px] h-[56px] flex items-center justify-center  lg:text-[27px] font-[800] rounded-full p-4 bg-custom-gradient border-[1px] bg-cover border-white">
                1
              </div>
            </div>

            {/* 2nd point */}
            <div
              className="absolute top-[12%] left-[84%] w-[180px] flex items-center gap-4 justify-center py-2"
              data-aos="fade-in"
              data-aos-duration="400"
              data-aos-delay="400"
            >
              <div className="w-[56px] h-[56px] flex items-center justify-center text-[26px] font-[800] rounded-full p-4 bg-custom-gradient border-[1px] bg-cover border-white">
                2
              </div>
              <p className="text-[16px] w-[100px] font-[500] text-center">
                24/7 Availability
              </p>
            </div>

            {/* 3rd point */}
            <div className="absolute bottom-[12%] left-[84%] w-[180px] flex items-center gap-4 justify-center py-2">
              <div
                className="w-[56px] h-[56px] flex items-center justify-center text-[26px] font-[800] rounded-full p-4 bg-custom-gradient border-[1px] bg-cover border-white"
                data-aos="fade-right"
                data-aos-delay="800"
              >
                3
              </div>
              <p
                className="text-[16px] w-[100px] font-[500] text-center"
                data-aos="fade-in"
                data-aos-delay="800"
              >
                Personalized Learning
              </p>
            </div>

            {/* 4th point */}
            <div className="absolute top-[88%] left-[19%] flex flex-col items-center">
              <div
                className="w-[56px] h-[56px] flex items-center justify-center text-[27px] font-[800] rounded-full p-4 bg-custom-gradient border-[1px] bg-cover border-white"
                data-aos="zoom-in"
                data-aos-delay="1200"
              >
                4
              </div>
              <p
                className="text-[16px] font-[500]"
                data-aos="fade-down-right"
                data-aos-delay="1200"
              >
                Wide Range of Subjects
              </p>
            </div>

            {/* 5th point */}
            <div className="absolute bottom-[12%] right-[84%] w-[180px] flex items-center gap-4 justify-center py-2 ">
              <p
                className="text-[16px] w-[100px] font-[500] text-center"
                data-aos="fade-right"
                data-aos-delay="1600"
              >
                Affordable Pricing
              </p>
              <div
                className="w-[56px] h-[56px] flex items-center justify-center text-[26px] font-[800] rounded-full p-4 bg-custom-gradient border-[1px] bg-cover border-white"
                data-aos="zoom-in-left"
                data-aos-delay="1600"
              >
                5
              </div>
            </div>

            {/* 6th point */}
            <div className="absolute top-[12%] right-[84%] w-[180px] flex items-center gap-4 justify-center py-2 ">
              <p
                className="text-[16px] w-[100px] font-[500] text-center"
                data-aos="fade-up-right"
                data-aos-delay="2200"
              >
                Easy Scheduling
              </p>
              <div
                className="w-[56px] h-[56px] flex items-center justify-center text-[26px] font-[800] rounded-full p-4 bg-custom-gradient border-[1px] bg-cover border-white"
                data-aos="fade-up-left"
                data-aos-delay="2200"
              >
                6
              </div>
            </div>
          </div>

          {/* Mobile Points Container */}
          <div className="flex md:hidden">
            <MobilePoints />
          </div>

          {/* Image Container */}
          <div className="md:flex hidden justify-center md:justify-self-end lg:ml-auto mr-10 ">
            <Image
              src={"/images/landing-page-section-4-why-choose-us.png"}
              width={316}
              height={376}
              priority
              alt="Girl thinking deeply about a question."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhyChooseUs;
