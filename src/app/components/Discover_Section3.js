"use client";
import Image from "next/image";
import React, { useEffect } from "react";
import { Poppins } from "next/font/google";
import AOS from "aos";
import "aos/dist/aos.css";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600"] });

const Discover = () => {
  useEffect(() => {
    AOS.init({
      once: true, // Animation will happen only once
    });
  }, []);

  return (
    <div className={` h-fit lg:h-[80vh]  lg:max-h-[700px] ${poppins.className}`}>
      <div className="container mx-auto  text-center px-[20px] lg:px-[50px] xl:px-[86px] pt-[80px] pb-40 ">
        {/* Discover Heading */}
        <h1 className="text-text-950 text-center text-[27px] font-[600]  ">
          Discover Your Perfect Tutor with Ease
        </h1>

        <div className="flex lg:flex-row  justify-center flex-col items-center gap-14 lg:gap-8 mt-10">
          {/* Search Tutor Card Container  */}
          <div className="max-w-[290px] p-4">
            <div className="relative w-[276px]  h-[252px]">
              {/* border strip */}
              <div
                className="w-[276px] h-[252px] rounded-tl-[48px] rounded-br-[48px] 
          border-[3px] border-solid border-secondary-700
          shadow-[0px_4px_4px_0px_rgba(0,0,0,0.10)]
          absolute  right-[16px] top-4
          "
              ></div>
              <div
                className="w-[276px] h-[252px] rounded-tl-[48px] rounded-br-[48px] 
          shadow-[0px_4px_4px_rgba(0,0,0,0.1)]
          bg-gradient-to-b from-[#FFF8EF] to-[#F8E0C2]
          flex flex-col items-center gap-4 p-6 justify-center z-20 absolute top-0  "
              >
                <h2 className="text-primary-500  text-lg font-[600]">
                  Search Tutor
                </h2>
                <Image
                  src={"/images/landing-page-section-3-search-tutor.png"}
                  width={97}
                  height={97}
                  alt="Landing page Search Tutors Image"
                  // layout="responsive"
                  quality={100}
                  priority
                  // unoptimized
                  sizes="(max-width: 640px) 50px, 
         (max-width: 768px) 75px, 
         (max-width: 1024px) 85px, 
         97px"
                />
                <p className="text-[13px] font-[400] ">
                  Use the search bar to find the perfect tutor based on your
                  needs.
                </p>
              </div>
            </div>
          </div>

          {/* Storked Line */}
          <svg
            className="xl:block hidden"
            xmlns="http://www.w3.org/2000/svg"
            width="139"
            height="4"
            viewBox="0 0 139 4"
            fill="none"
            data-aos="fade-right"
            data-aos-offset="1000"
            data-aos-delay="800"
            data-aos-easing="ease-in-sine"
          >
            <path
              d="M2 2H137"
              stroke="#E77B3E"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="6 6"
            />
          </svg>

          {/* Select and schedule Card Container  */}
          <div
            className="max-w-[290px] p-4"
            data-aos="fade-right"
            data-aos-duration="1200"
            data-aos-delay="1200"
          >
            <div className="relative w-[276px]  h-[252px]">
              {/* border strip */}
              <div
                className="w-[276px] h-[252px] rounded-tl-[48px] rounded-br-[48px] 
          border-[3px] border-solid border-secondary-700
          shadow-[0px_4px_4px_0px_rgba(0,0,0,0.10)]
          absolute  right-[16px] top-4
          "
              ></div>
              <div
                className="w-[276px] h-[252px] rounded-tl-[48px] rounded-br-[48px] 
          shadow-[0px_4px_4px_rgba(0,0,0,0.1)]
          bg-gradient-to-b from-[#FFF8EF] to-[#F8E0C2]
          flex flex-col items-center gap-4 p-6 justify-center z-20 absolute top-0  "
              >
                <h2 className="text-primary-500  text-lg font-[600]">
                  Select and Schedule
                </h2>
                <Image
                  src={"/images/landing-page-section-3-select-schedule.png"}
                  width={97}
                  height={97}
                  quality={100}
                  priority
                  // unoptimized
                  alt="Landing page Search Tutors Image"
                  sizes="(max-width: 640px) 50px, 
         (max-width: 768px) 75px, 
         (max-width: 1024px) 85px, 
         97px"
                />
                <p className="text-[13px] font-[400] ">
                  Choose a tutor and schedule a session at your convenience.
                </p>
              </div>
            </div>
          </div>

          {/* Storked Line */}
          <svg
            className="xl:block hidden"
            xmlns="http://www.w3.org/2000/svg"
            width="139"
            height="4"
            viewBox="0 0 139 4"
            fill="none"
            data-aos="fade-right"
            // data-aos-offset="1000"
            data-aos-duration="1200"
            data-aos-delay="1300"
            data-aos-easing="ease-in-sine"
          >
            <path
              d="M2 2H137"
              stroke="#E77B3E"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="6 6"
            />
          </svg>

          {/* Start Learning Card Container  */}
          <div
            className="max-w-[290px] p-4 "
            data-aos="fade-right"
            data-aos-duration="1200"
            data-aos-delay="1600"

          >
            <div className="relative w-[276px] h-[252px]">
              {/* border strip */}
              <div
                className="w-[276px] h-[252px] rounded-tl-[48px] rounded-br-[48px] 
          border-[3px] border-solid border-secondary-700
          shadow-[0px_4px_4px_0px_rgba(0,0,0,0.10)]
          absolute  right-[16px] top-4
          "
              ></div>
              <div
                className="w-[276px] h-[252px] rounded-tl-[48px] rounded-br-[48px] 
          shadow-[0px_4px_4px_rgba(0,0,0,0.1)]
          bg-gradient-to-b from-[#FFF8EF] to-[#F8E0C2]
          flex flex-col items-center gap-4 p-6 justify-center z-20 absolute top-0  "
              >
                <h2 className="text-primary-500  text-lg font-[600]">
                  Start Learning
                </h2>
                <Image
                  src={"/images/landing-page-section-3-start-studying.png"}
                  width={97}
                  height={97}
                  alt="Landing page Search Tutors Image"
                  // className="h-auto w-auto"
                  // unoptimized
                  sizes="(max-width: 640px) 50px, 
         (max-width: 768px) 75px, 
         (max-width: 1024px) 85px, 
         97px"
                  priority
                />

                <p className="text-[13px] font-[400] ">
                  Start your personalized learning journey with expert guidance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Discover;
