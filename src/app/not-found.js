import React from "react";
import { Poppins } from "next/font/google";
import Image from "next/image";
import Link from "next/link";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const NoFound = () => {
  return (
    <div
      className=" h-fit md:h-screen  bg-cover bg-no-repeat flex items-center justify-center"
      style={{
        background: "linear-gradient(180deg, #F1FCFA 0%, #FFF5F0 100%)",
      }}
    >
      <div
        className={`${poppins.className} container mx-auto px-[20px] lg:px-[50px] xl:px-[86px] flex md:flex-row flex-col items-center justify-between  w-full `}
      >
        {/* Error Message */}
        <div className=" mt-10 md:mt-0 flex items-center flex-col gap-4 xl:gap-6 ">
          <h1 className=" text-primary-400 text-[2rem] sm:text-[3rem] xl:text-[3.5rem] 2xl:text-[4rem] font-semibold leading-normal ">
            Error Page
          </h1>
          <p className="text-[0.7rem] sm:text-[0.9rem] xl:text-[1rem] 2xl:text-[1.25rem] font-normal leading-normal  ">
            The page you are looking for cannot be found.
          </p>
          <Link href={"/"} className="w-[80%] mt-3 sm:mt-6 xl:mt-7 2xl:mt-9">
            <button className="bg-secondary-600 rounded-[8px] w-full  text-[0.7rem] sm:text-[0.9rem] font-semibold leading-normal text-white h-[32px] sm:h-[38px] ">
              Back To Home
            </button>
          </Link>
        </div>

        {/* Error Image */}
        <div className=" my-10 md:my-0  ">
          <div className=" w-[80%] md:w-[333px] md:h-[249px] lg:w-[393px] lg:h-[309px] xl:w-[493px] xl:h-[409px] 2xl:w-[593px] 2xl:h-[509px] mx-auto ">
            <Image
              src={"/images/error-page.png"}
              alt="Error Page Image"
              width={593}
              height={509}
              className="w-auto h-auto object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoFound;
