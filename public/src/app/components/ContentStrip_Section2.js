"use client";
import React, { useEffect, useRef, useState } from "react";
import { Poppins } from "next/font/google";
import AOS from "aos";
import "aos/dist/aos.css";

const poppins = Poppins({ subsets: ["latin"], weight: ["600"] });

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

const ExpertTutorsCard = () => {
  const isMobile = useDeviceSize(); // Use the device size hook

  return (
    <>
      {/* Expert Tutors */}
      <div className="flex gap-2 items-center justify-center mx-4 lg:mx-0 lg:w-fit">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          // Conditionally set width and height based on device size
          width={isMobile ? "24" : "32"} // Smaller size for mobile, larger for desktop
          height={isMobile ? "24" : "32"} // Smaller size for mobile, larger for desktop
          viewBox="0 0 32 32"
          fill="none"
        >
          <path
            d="M16.0001 23.0268L21.5334 26.3734C22.5468 26.9868 23.7868 26.0801 23.5201 24.9334L22.0534 18.6401L26.9468 14.4001C27.8401 13.6268 27.3601 12.1601 26.1868 12.0668L19.7468 11.5201L17.2268 5.57343C16.7734 4.49343 15.2268 4.49343 14.7734 5.57343L12.2534 11.5068L5.81343 12.0534C4.6401 12.1468 4.1601 13.6134 5.05343 14.3868L9.94676 18.6268L8.4801 24.9201C8.21343 26.0668 9.45343 26.9734 10.4668 26.3601L16.0001 23.0268Z"
            fill="black"
          />
        </svg>
        <p className="text-[13px] lg:text-[16px] mt-1 lg:mt-0 text-nowrap">
          Expert Tutors
        </p>
      </div>
    </>
  );
};

const PersonalizedLearningCard = () => {
  const isMobile = useDeviceSize(); // Use the device size hook
  return (
    <>
      {/* Personalized Learning Plans */}
      <div className="flex gap-2 items-center mx-4 lg:mx-0   lg:w-fit">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={isMobile ? "24" : "32"} // Smaller size for mobile, larger for desktop
          height={isMobile ? "24" : "32"} // Smaller size for mobile, larger for desktop
          viewBox="0 0 32 32"
          fill="none"
        >
          <path
            d="M20.8613 21.8053L21.8053 20.8613L16.6667 15.7227V9.33333H15.3333V16.2773L20.8613 21.8053ZM16.004 28C14.3453 28 12.7853 27.6853 11.324 27.056C9.86356 26.4258 8.59289 25.5707 7.512 24.4907C6.43111 23.4107 5.57556 22.1413 4.94533 20.6827C4.31511 19.224 4 17.6644 4 16.004C4 14.3436 4.31511 12.7836 4.94533 11.324C5.57467 9.86356 6.42844 8.59289 7.50667 7.512C8.58489 6.43111 9.85467 5.57556 11.316 4.94533C12.7773 4.31511 14.3373 4 15.996 4C17.6547 4 19.2147 4.31511 20.676 4.94533C22.1364 5.57467 23.4071 6.42889 24.488 7.508C25.5689 8.58711 26.4244 9.85689 27.0547 11.3173C27.6849 12.7778 28 14.3373 28 15.996C28 17.6547 27.6853 19.2147 27.056 20.676C26.4267 22.1373 25.5716 23.408 24.4907 24.488C23.4098 25.568 22.1404 26.4236 20.6827 27.0547C19.2249 27.6858 17.6653 28.0009 16.004 28Z"
            fill="black"
          />
        </svg>
        <p className="text-[13px] lg:text-[16px] mt-1 lg:mt-0  text-nowrap">
          Personalized Learning Plans
        </p>
      </div>
    </>
  );
};

const AnytimeAnywhereCard = () => {
  const isMobile = useDeviceSize(); // Use the device size hook

  return (
    <>
      {/* Any time Anywhere */}
      <div className="flex gap-2 items-center mx-4 lg:mx-0   lg:w-fit">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={isMobile ? "24" : "32"} // Smaller size for mobile, larger for desktop
          height={isMobile ? "24" : "32"} // Smaller size for mobile, larger for desktop
          viewBox="0 0 32 32"
          fill="none"
        >
          <path
            d="M16 2.66675C10.1187 2.66675 5.33336 7.45208 5.33336 13.3267C5.29469 21.9201 15.5947 29.0454 16 29.3334C16 29.3334 26.7054 21.9201 26.6667 13.3334C26.6667 7.45208 21.8814 2.66675 16 2.66675ZM16 18.6667C13.0534 18.6667 10.6667 16.2801 10.6667 13.3334C10.6667 10.3867 13.0534 8.00008 16 8.00008C18.9467 8.00008 21.3334 10.3867 21.3334 13.3334C21.3334 16.2801 18.9467 18.6667 16 18.6667Z"
            fill="black"
          />
        </svg>
        <p className="text-[13px] lg:text-[16px] mt-1 lg:mt-0  text-nowrap">
          Anywhere, Anytime 24/7
        </p>
      </div>
    </>
  );
};

const SafeAndSecureCard = () => {
  const isMobile = useDeviceSize(); // Use the device size hook

  return (
    <>
      {/* Safe and Secure Platform */}
      <div className="flex gap-2 items-center mx-4 lg:mx-0   lg:w-fit">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="28"
          viewBox="0 0 24 28"
          fill="none"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M11.064 0.926661C11.5902 0.729797 12.1651 0.704132 12.7067 0.853328L12.936 0.926661L22.2693 4.42666C22.7426 4.60411 23.1556 4.9124 23.4604 5.3156C23.7652 5.71879 23.9491 6.20029 23.9907 6.70399L24 6.92399V14.0747C23.9999 16.2352 23.4166 18.3557 22.3115 20.2122C21.2064 22.0688 19.6205 23.5926 17.7213 24.6227L17.3667 24.808L12.8947 27.044C12.6484 27.1669 12.3795 27.2377 12.1046 27.252C11.8298 27.2662 11.5549 27.2235 11.2973 27.1267L11.1053 27.044L6.63333 24.808C4.70081 23.8417 3.06503 22.3716 1.89867 20.5528C0.73231 18.734 0.0786407 16.6341 0.00666682 14.4747L0 14.0747V6.92399C7.7534e-06 6.41883 0.143502 5.92407 0.413778 5.49729C0.684054 5.07051 1.06999 4.72928 1.52667 4.51333L1.73067 4.42666L11.064 0.926661ZM16.5773 9.50533L10.4467 15.636L8.08933 13.2787C7.83915 13.0286 7.49989 12.8883 7.1462 12.8884C6.7925 12.8885 6.45334 13.0291 6.20333 13.2793C5.95332 13.5295 5.81294 13.8688 5.81306 14.2225C5.81319 14.5762 5.95381 14.9153 6.204 15.1653L9.40933 18.3707C9.54554 18.5069 9.70725 18.615 9.88524 18.6888C10.0632 18.7625 10.254 18.8005 10.4467 18.8005C10.6393 18.8005 10.8301 18.7625 11.0081 18.6888C11.1861 18.615 11.3478 18.5069 11.484 18.3707L18.4627 11.3907C18.59 11.2677 18.6916 11.1205 18.7615 10.9579C18.8313 10.7952 18.8681 10.6202 18.8697 10.4432C18.8712 10.2662 18.8375 10.0906 18.7704 9.92672C18.7034 9.76286 18.6044 9.61399 18.4792 9.4888C18.354 9.36361 18.2051 9.26461 18.0413 9.19756C17.8774 9.13052 17.7018 9.09679 17.5248 9.09833C17.3478 9.09986 17.1728 9.13665 17.0101 9.20652C16.8475 9.2764 16.7003 9.37798 16.5773 9.50533Z"
            fill="black"
          />
        </svg>
        <p className=" text-[13px] lg:text-[16px] mt-1 lg:mt-0  text-nowrap">
          Safe and Secure Platform
        </p>
      </div>
    </>
  );
};

const ScrollComponent = () => {
  const scrollContainerRef = useRef(null);
  const scrollSpeed = 2000; // Adjust speed here (in milliseconds)

  const scrollItems = () => {
    const scrollContainer = scrollContainerRef.current;

    if (scrollContainer) {
      // Move the items smoothly and continuously by applying a consistent transition
      scrollContainer.style.transition = "transform 1s linear"; // 1 second for smooth transition
      scrollContainer.style.transform = `translateX(-100%)`; // Move one card width to the left

      // After the transition ends, move the first item to the end and reset the position
      scrollContainer.addEventListener(
        "transitionend",
        () => {
          const firstItem = scrollContainer.firstElementChild;
          scrollContainer.appendChild(firstItem);

          // Reset the transform and disable the transition temporarily for a seamless loop
          scrollContainer.style.transition = "none";
          scrollContainer.style.transform = "translateX(0)";
        },
        { once: true }
      ); // Only listen for the next transition end
    }
  };

  useEffect(() => {
    const intervalId = setInterval(scrollItems, scrollSpeed);

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  return (
    <div className="relative overflow-hidden ">
      <div
        className="flex transition-transform duration-500 ease-linear"
        ref={scrollContainerRef}
      >
        <div className="flex items-center justify-center  ">
          <ExpertTutorsCard />
        </div>
        <div className="flex items-center justify-center ">
          <PersonalizedLearningCard />
        </div>
        <div className="flex items-center justify-center ">
          <AnytimeAnywhereCard />
        </div>
        <div className="flex items-center justify-center ">
          <SafeAndSecureCard />
        </div>
      </div>
    </div>
  );
};

const ContentStrip = () => {
  useEffect(() => {
    AOS.init({
      once: true, // Animation will happen only once
      duration: 500,
    });
  }, []);

  const cardArray = [
    <ExpertTutorsCard />,
    <PersonalizedLearningCard />,
    <AnytimeAnywhereCard />,
    <SafeAndSecureCard />,
  ];
  return (
    <div
      className={`bg-[#1E8D8F8C] overflow-hidden h-[48px] ${poppins.className} `} // Add the animation class when visible
    >
      <div
        className={`container px-[20px] hidden  lg:px-[50px] xl:px-[86px] h-full lg:flex items-center justify-between  mx-auto animate-scrollText lg:animate-none `}
        data-aos="fade-up"
      >
        {cardArray.map((item, index) => {
          return <div key={index}>{item}</div>;
        })}
      </div>

      {/* Show the following container in the devices below the medium size devices  */}
      <div className=" h-full flex items-center pt-2">
        <div className="wrapper">
          <div className="marquee flex items-center h-full ">
            <div className="flex items-center ">
              {cardArray.map((item) => item)} {cardArray.map((item) => item)}
            </div>
            {/* <div className="flex bg-[yellow] "></div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentStrip;
