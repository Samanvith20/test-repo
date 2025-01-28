"use client";
import React, { useState, useEffect, useRef } from "react";
import { Poppins, Montserrat_Alternates } from "next/font/google";
import Image from "next/image";
import { CldImage } from "next-cloudinary";
import Link from "next/link";
import { useRouter } from "next/navigation";

const poppins = Poppins({ subsets: ["latin"], weight: ["500"] });
const montserrat_alternates = Montserrat_Alternates({
  subsets: ["latin"],
  weight: ["600"],
});
const HeroSection = () => {
  const router = useRouter();
  const searchInputRef = useRef();

  const [searchText, setSearchText] = useState("");

  const handleHeroSearch = (event) => {
    setSearchText(event.target.value);
    
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "/") {
        e.preventDefault();
        if (searchInputRef.current) {
          searchInputRef.current.focus(); // Focus the search input
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown); // Cleanup on component unmount
    };
  }, []);


  console.log('search Text: ', searchText)

  const handleSearch = () => {
    if (searchText.trim() !== "") {
      router.push(`/find-tutor?search=${encodeURIComponent(searchText)}`);
    }
  };

  const handleKeyDown = (event) => {
    console.log('key: ', event.key)
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div
      className={`${poppins.className} lg:mt-0  mx-auto h-fit mt-3 md:bg-[url('/images/hero-section-bg-image.png')] lg:bg-contain lg:h-[92vh] lg:bg-no-repeat `}
    >
      <div
        className="container  mx-auto px-[20px] lg:px-[50px] xl:px-[86px] h-full 
      flex flex-col lg:flex-row  items-center justify-between
      "
      >
        {/* Content Container */}
        <div className="w-full lg:w-[60%] xl:w-[55%] min-h-fit py-10 md:py-0 md:min-h-[400px] xl:min-h-[500px] flex flex-col  gap-8 px-4 lg:px-0">
          <h1
            className={`${montserrat_alternates.className} text-[28px] lg:text-[42px] xl:text-[50px] 2xl:text-[64px] text-primary-400 text-center`}
          >
            Unlock Your Potential with{" "}
            <span className="inline-block animate-slideUp lg:animate-slideInLeft">
              Expert Tutors
            </span>
          </h1>
          <div className="w-full flex  justify-center items-center bg-[gree ">
          <div className="md:hidden block ">
            <Image
              src="/images/hero-section-teen-boy.png"
              alt="Teenage Boy Image"
              width={174}
              height={192}
              quality={100}
              sizes=""
              priority
              unoptimized
              className="h-auto w-auto object-contain "
            />
          </div>
          </div>

          <div className="flex justify-center">
            <p
              className={`${poppins.className} text-[13px] lg:text-[18px] w-full lg:w-[60%] text-center`}
            >
              Connect To Elite Group Of Educational Experts Anytime, Anywhere
            </p>
          </div>

          <div
            className={`${poppins.className} rounded-[8px] overflow-hidden shadow-lg w-full lg:w-[80%] mx-auto`}
          >
            <input
              placeholder="Search by Subject, Tutor, Topic "
              onChange={handleHeroSearch}
              ref={searchInputRef}
              onKeyDown={handleKeyDown}
              className="py-[8px] lg:py-[16px] px-4 w-[70%] text-[13px] font-[400] lg:w-[80%] border-0 outline-none"
            />
            <button
              onClick={handleSearch}
              className="text-text-950 py-[8px] lg:py-[15px] font-[600] w-[30%] lg:w-[20%] bg-gradient-to-b text-[13px] lg:text-[18px] from-[#FE9E69] to-[rgba(198,81,16,0.76)]"
            >
              Search
            </button>
          </div>

          <div className="flex justify-center ">
            <Link href={"/sign-up"}>
              <div className="btn group text-[16px] shadow-2xl lg:text-[18px] transition-all ease-in-out duration-600">
                <button className="noselect group-hover:text-[20px] lg:group-hover:text-[24px] transition-all ease-in duration-600">
                  Get Started
                </button>
              </div>
            </Link>
          </div>
        </div>

        {/* Image Container */}
        <div className="w-[40%] hidden lg:block  min-h-[540px] relative min-w-[400px] ">
          {/* Book */}
          <div className="p-4 absolute top-28 right-1/2 bg-[#FFE478] w-fit rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="25"
              viewBox="0 0 24 25"
              fill="none"
            >
              <g clipPath="url(#clip0_927_351)">
                <path
                  d="M1.5 4.7771C2.8275 4.2221 4.731 3.6236 6.582 3.4376C8.577 3.2366 10.269 3.5321 11.25 4.5656V19.1846C9.8475 18.3896 8.07 18.2801 6.4305 18.4451C4.6605 18.6251 2.8755 19.1366 1.5 19.6616V4.7771ZM12.75 4.5656C13.731 3.5321 15.423 3.2366 17.418 3.4376C19.269 3.6236 21.1725 4.2221 22.5 4.7771V19.6616C21.123 19.1366 19.3395 18.6236 17.5695 18.4466C15.9285 18.2801 14.1525 18.3881 12.75 19.1846V4.5656ZM12 3.2096C10.5225 1.9391 8.3805 1.7501 6.4305 1.9451C4.1595 2.1746 1.8675 2.9531 0.4395 3.6026C0.308474 3.66219 0.197363 3.75823 0.119432 3.87925C0.0415 4.00027 3.98571e-05 4.14116 0 4.2851L0 20.7851C3.4743e-05 20.9106 0.0315557 21.0341 0.0916756 21.1442C0.151796 21.2544 0.238593 21.3477 0.344116 21.4156C0.44964 21.4835 0.570517 21.5238 0.695675 21.5329C0.820833 21.542 0.946271 21.5196 1.0605 21.4676C2.3835 20.8676 4.515 20.1461 6.5805 19.9376C8.694 19.7246 10.4655 20.0681 11.415 21.2531C11.4853 21.3407 11.5743 21.4114 11.6756 21.46C11.7768 21.5085 11.8877 21.5338 12 21.5338C12.1123 21.5338 12.2232 21.5085 12.3244 21.46C12.4257 21.4114 12.5147 21.3407 12.585 21.2531C13.5345 20.0681 15.306 19.7246 17.418 19.9376C19.485 20.1461 21.618 20.8676 22.9395 21.4676C23.0537 21.5196 23.1792 21.542 23.3043 21.5329C23.4295 21.5238 23.5504 21.4835 23.6559 21.4156C23.7614 21.3477 23.8482 21.2544 23.9083 21.1442C23.9684 21.0341 24 20.9106 24 20.7851V4.2851C24 4.14116 23.9585 4.00027 23.8806 3.87925C23.8026 3.75823 23.6915 3.66219 23.5605 3.6026C22.1325 2.9531 19.8405 2.1746 17.5695 1.9451C15.6195 1.7486 13.4775 1.9391 12 3.2096Z"
                  fill="black"
                />
              </g>
              <defs>
                <clipPath id="clip0_927_351">
                  <rect
                    width="24"
                    height="24"
                    fill="white"
                    transform="translate(0 0.535156)"
                  />
                </clipPath>
              </defs>
            </svg>
          </div>

          {/* Spiral Arrow */}
          <div className=" absolute bottom-[40%] animate-zoomIn  left-2 w-fit z-40 py-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="71"
              height="42"
              viewBox="0 0 71 42"
              fill="none"
            >
              <path
                d="M69.1353 23.5587C69.5416 23.1846 70.1743 23.2109 70.5483 23.6172C70.9223 24.0236 70.8961 24.6562 70.4897 25.0302L69.1353 23.5587ZM60.1866 32.6075L59.5985 31.7987L60.1866 32.6075ZM39.0712 30.3508L39.983 29.9402L39.0712 30.3508ZM40.8162 17.4136L41.1559 18.3541L40.8162 17.4136ZM45.0748 23.7991L46.0748 23.8039L45.0748 23.7991ZM22.7494 31.951L22.1806 32.7735L22.7494 31.951ZM1.90629 0.857489L10.8471 8.16464L0.0485293 12.2541L1.90629 0.857489ZM70.4897 25.0302C67.2982 27.9677 64.4001 30.7801 60.7747 33.4163L59.5985 31.7987C63.1054 29.2487 65.8951 26.5409 69.1353 23.5587L70.4897 25.0302ZM60.7747 33.4163C57.1785 36.0312 52.9863 38.5015 48.9366 38.739C46.8713 38.86 44.8381 38.4012 42.9716 37.1013C41.1196 35.8114 39.502 33.7428 38.1594 30.7615L39.983 29.9402C41.2257 32.6996 42.6435 34.4355 44.1147 35.4601C45.5713 36.4746 47.1489 36.8403 48.8195 36.7424C52.2415 36.5417 56.0216 34.3996 59.5985 31.7987L60.7747 33.4163ZM38.1594 30.7615C37.3016 28.8568 36.5769 25.8792 36.6557 23.1286C36.7329 20.4332 37.6186 17.5051 40.4766 16.473L41.1559 18.3541C39.514 18.947 38.7259 20.7083 38.6549 23.1858C38.5855 25.608 39.2382 28.2866 39.983 29.9402L38.1594 30.7615ZM40.4766 16.473C41.6459 16.0508 42.7 16.2214 43.5465 16.8372C44.3288 17.4063 44.8422 18.2882 45.1865 19.1359C45.8782 20.8389 46.0792 22.8893 46.0748 23.8039L44.0748 23.7943C44.0784 23.054 43.8987 21.2802 43.3335 19.8885C43.0493 19.1888 42.7151 18.7056 42.3699 18.4545C42.0887 18.2499 41.7352 18.1449 41.1559 18.3541L40.4766 16.473ZM46.0748 23.8039C46.0436 30.2887 43.088 34.7131 38.4305 36.3515C33.855 37.961 27.9518 36.7643 22.1806 32.7735L23.3181 31.1285C28.7705 34.8988 34.0004 35.7897 37.7668 34.4648C41.4514 33.1687 44.0467 29.6366 44.0748 23.7943L46.0748 23.8039ZM22.1806 32.7735C14.0464 27.1486 8.10226 18.4087 4.18204 9.68537L6.0063 8.86556C9.83772 17.3913 15.5857 25.7815 23.3181 31.1285L22.1806 32.7735Z"
                fill="black"
              />
            </svg>
          </div>

          {/* Big Star */}
          <div className="absolute top-10 right-16 animate-fadeIn">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="34"
              height="34"
              viewBox="0 0 34 34"
              fill="none"
            >
              <path
                d="M-0.000244141 16.4004C11.4499 11.9229 14.719 8.15849 17.2232 0.0207825C16.9593 11.2319 35.4059 18.2858 33.6028 17.2442C31.7996 16.2026 15.3091 22.7329 16.3794 33.6238C14.7232 24.9147 12.1104 20.7361 -0.000244141 16.4004Z"
                fill="#FFEB33"
              />
            </svg>
          </div>

          {/* Small Star */}
          <div className="absolute top-10 animate-slideFromTopRight right-14">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="9"
              height="9"
              viewBox="0 0 9 9"
              fill="none"
            >
              <path
                d="M-0.000244141 4.19238C2.92688 3.04774 3.7626 2.08541 4.40277 0.00507885C4.33532 2.87111 9.05103 4.67437 8.59007 4.40809C8.12912 4.14182 3.91346 5.81124 4.18706 8.5954C3.76368 6.36899 3.09573 5.30077 -0.000244141 4.19238Z"
                fill="#FFEB33"
              />
            </svg>
          </div>

          {/* Teen Boy Image Container */}
          <div className="absolute top-10 right-10 animate-slideDown">
            <Image
              src="/images/hero-section-teen-boy.png"
              alt="Teenage Boy Image"
              width={174}
              height={192}
              quality={100}
              sizes="(max-width: 768px) 100vw, 174px"
              priority
              unoptimized
              className=""
            />
          </div>

          {/* Teen Girl Image Container */}
          <div className="absolute bottom-10 animate-slideUp left-10 z-20">
            {/* Image of Teenage Girl */}
            <div className="relative z-20">
              <Image
                src="/images/hero-section-teen-girl.png"
                alt="Teenage Girl Image"
                width={291}
                height={348}
                quality={100}
                sizes="(max-width: 768px) 100vw, 291px"
                priority
                unoptimized
                className=""
              />
            </div>
          </div>

          {/* Empowering Card */}
          <div
            className="bg-white w-[236px] text-center 
          drop-shadow-[0px_2px_4px_rgba(0,0,0,0.15)] 
          absolute bottom-20 right-20 z-40
          font-[600] px-4 py-2 rounded-[8px]"
          >
            <p className="text-primary-500">Empowering Minds</p>
            <p className="text-text-900">Shaping Futures</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
