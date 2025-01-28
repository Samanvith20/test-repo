"use client";
import React, { useEffect, useState } from "react";
import { Poppins } from "next/font/google";
import { VscEye } from "react-icons/vsc";
import Link from "next/link";
import { useTutor } from "@/app/components/TutorContext";
import { useRouter } from "next/navigation";
import Image from "next/image";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600"] });
const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    zipCode: "",
  });

  // destructure the required values from the useTutur custom hook
  const {
    tutorInitialDetails,
    setTutorInitialDetails,
    setStepsCleared,
    stepsCleared,
  } = useTutor();

  // router for redirecting the page to the next step
  const router = useRouter();

  useEffect(() => {
    setFormData({ ...tutorInitialDetails });
  }, []);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTutorInitialDetails({ ...formData });
    setStepsCleared({ ...stepsCleared, step1: true });
    router.push("/tutor-sign-up/step-1");
  };

  return (
    <div className="container px-[20px] lg:px-[50px] xl:px-[86px] mx-auto">
      <div className={`flex justify-center items-center  ${poppins.className}`}>
        {/* Left Section */}
        <div className="hidden lg:block relative md:min-w-[700px] md:min-h-[460px] mt-16">
          <Image
            src={"/images/login_page_big-image.png"}
            width={344}
            height={328}
            alt="login page big image"
            quality={100}
            unoptimized
            className="absolute top-0 left-16 z-2"
          />
          <div className="absolute bottom-12 right-[160px] z-19 p-1 bg-white flex items-center justify-center rounded-full">
            <Image
              src={"/images/login-page_small-image.png"}
              width={224}
              height={170}
              alt="login page small image"
              quality={100}
              unoptimized
            />
          </div>
          <div className="absolute bottom-[24px] right-[185px]">
            {/* Orange curve graphic */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="195"
              height="60"
              viewBox="0 0 195 60"
              fill="none"
            >
              <path
                d="M194.528 19.1079L182.371 17.6234L180.887 29.7805L193.044 31.265L194.528 19.1079ZM3.55157 1.97741C3.29376 1.19012 2.44653 0.760897 1.65924 1.01871C0.871956 1.27652 0.442731 2.12375 0.700544 2.91103L3.55157 1.97741ZM186.783 23.2628C144.64 56.234 102.237 61.3753 68.6833 53.051C35.018 44.6991 10.3869 22.8507 3.55157 1.97741L0.700544 2.91103C7.94646 25.0381 33.606 47.4397 67.961 55.9627C102.427 64.5135 145.775 59.1546 188.632 25.6256L186.783 23.2628Z"
                fill="#E77B3E"
              />
            </svg>
          </div>
        </div>

        {/* Right Section */}
        <div className="bg-[#E7E7E7] h-fit flex px-4 py-6 items-center  justify-center w-[300px] sm:w-[408px] md:w-[560px] rounded-2xl ">
          <div className="rounded-lg flex flex-col items-center py-6  shadow-md bg-[white] w-[355px] sm:w-[380px] md:w-[503px] h-fit">
            <div className="h-[90%] flex flex-col gap-4 justify-center bg-[white] w-[90%]">
              <div className=" text-center  ">
                <div className="mb-2 ">
                  <h1 className=" text-lg lg:text-2xl font-semibold">
                    Apply Now
                  </h1>
                </div>
                <p className=" text-xs  font-light w-full ">
                  Easily connect with students needing help in your subjects
                </p>
              </div>
              <form
                onSubmit={handleSubmit}
                className=" flex flex-col px-4 py-2 gap-4 "
              >
                <div className="shadow-[0px_2px_4px_0px_rgba(0,0,0,0.05)] ">
                  <label className=" text-sm font-semibold" htmlFor="firstName">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    onChange={handleInputChange}
                    value={formData["firstName"]}
                    className=" w-full px-4 text-xs py-2 focus-within:outline focus-within:outline-2 focus-within:outline-primary-400 rounded-sm"
                    placeholder="Enter Your First Name"
                  />
                </div>
                <div className="shadow-[0px_2px_4px_0px_rgba(0,0,0,0.05)] ">
                  <label className="text-sm font-semibold" htmlFor="lastName">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    onChange={handleInputChange}
                    value={formData["lastName"]}
                    className="w-full px-4 py-2 text-xs focus-within:outline focus-within:outline-2 focus-within:outline-primary-400 rounded-sm"
                    placeholder="Enter Your Last Name"
                  />
                </div>
                <div className=" shadow-[0px_2px_4px_0px_rgba(0,0,0,0.05)] ">
                  <label className=" text-sm font-semibold" htmlFor="email">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    onChange={handleInputChange}
                    value={formData["email"]}
                    className="w-full px-4 py-2 text-xs  rounded-sm focus-within:outline focus-within:outline-2 focus-within:outline-primary-400"
                    placeholder="Enter Your Email Address"
                  />
                </div>
                <div>
                  <label className=" text-sm font-semibold" htmlFor="password">
                    Create Password
                  </label>
                  <div className="flex justify-between shadow-[0px_2px_4px_0px_rgba(0,0,0,0.05)] focus-within:outline focus-within:outline-2 focus-within:outline-primary-400 items-center rounded-sm">
                    <input
                      type="password"
                      id="password"
                      onChange={handleInputChange}
                      value={formData["password"]}
                      placeholder="Create Password"
                      className="w-full px-4 py-2 text-xs focus:outline-none outline-none "
                    />
                    <VscEye />
                  </div>
                </div>
                <div className="shadow-[0px_2px_4px_0px_rgba(0,0,0,0.05)] ">
                  <label className=" text-sm font-semibold" htmlFor="zipCode">
                    Zip Code
                  </label>

                  <input
                    type="text"
                    id="zipCode"
                    onChange={handleInputChange}
                    value={formData["zipCode"]}
                    className="w-full px-4 py-2 focus:border focus-within:outline focus-within:outline-2 focus-within:outline-primary-400 text-xs rounded-sm"
                    placeholder="Enter Zip Code"
                  />
                </div>
                <div className="mt-4 ">
                  <button
                    type="submit"
                    className="w-full  text-center py-2 bg-orange-500 outline-secondary-400 text-white rounded-[8px] font-semibold text-sm"
                  >
                    Next
                  </button>
                </div>
              </form>
              <div className="mt-4 justify-center flex ">
                <p className="text-[rgba(0,0,0,0.48)]  text-sm font-semibold ">
                  Already have an account? &nbsp;
                  <Link href={"/login"}>
                    <span className="text-[#E77B3E] text-sm cursor-pointer font-semibold ">
                      Login
                    </span>
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
