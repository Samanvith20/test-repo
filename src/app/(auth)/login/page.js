"use client";
import Image from "next/image";
import { useState, useEffect, Suspense } from "react";
import { Poppins } from "next/font/google";
import { Toaster } from "react-hot-toast";
import LoginAsStudent from "@/app/components/LoginAsStudent";
import LoginAsTutor from "@/app/components/LoginAsTutor";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const LoginForm = () => {
  const [activeTab, setActiveTab] = useState("student");
  const searchParams = useSearchParams(); // Get search params here
  useEffect(() => {
    const callbackUrl = searchParams.get("callbackUrl"); // Get the 'callbackUrl' parameter from the URL

    if (callbackUrl && callbackUrl.includes("/tutor/tutor-dashboard")) {
      setActiveTab("tutor"); // Correctly set the active tab to 'tutor'
    }
  }, [searchParams]);

  return (
    <div
      className={`flex justify-center items-center min-h-[95vh] ${poppins.className}`}
    >
      <Toaster />
      {/* Left-hand side (image) */}
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

      <div className="bg-[#E7E7E7] w-full h-fit py-4 lg:h-[85%] lg:w-[30%] md:w-[60%] sm:w-full px-4 rounded-2xl">
        {/* Tab Switcher */}
        <div className="flex items-center place-content-evenly mb-2 mt-3">
          <div
            className={`relative cursor-pointer ${
              activeTab === "student" ? "font-bold" : ""
            }`}
            onClick={() => setActiveTab("student")}
          >
            👨‍🎓 Log in as Student
            {activeTab === "student" && (
              <span className="absolute left-[10px] right-[10px] -bottom-[9px] rounded-lg h-1 bg-primary-500"></span>
            )}
          </div>
          <div
            className={`relative cursor-pointer ${
              activeTab === "tutor" ? "font-bold" : ""
            }`}
            onClick={() => setActiveTab("tutor")}
          >
            👨‍🏫 Log in as Tutor
            {activeTab === "tutor" && (
              <span className="absolute left-[10px] right-[10px] -bottom-[9px] rounded-lg h-1 bg-primary-500"></span>
            )}
          </div>
        </div>

        <div className="rounded-lg shadow-md px-4 lg:px-14 flex flex-col justify-center py-10 bg-[#FFF] mx-auto h-[90%]">
          {/* Conditional rendering of form components based on the active tab */}
          {activeTab === "student" ? <LoginAsStudent /> : <LoginAsTutor />}
          <p className="text-[rgba(0,0,0,0.48)] font-[500] text-center text-[13px] leading-normal mt-4">
            Don&apos;t have an account?{" "}
            <Link
              href={activeTab === "student" ? "/sign-up" : "/tutor-sign-up"}
            >
              <span className="text-primary-400 font-[700]">Sign Up</span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const SuspenseWrapper = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
};

export default SuspenseWrapper;
