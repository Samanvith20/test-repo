"use client";
import Image from "next/image";
import { Poppins } from "next/font/google";
import { useEffect } from "react";
import Aos from "aos";
import "aos/dist/aos.css";
import Link from "next/link";

const poppins = Poppins({subsets: ['latin'], weight: ["400", "500", "600", "700"]})

const Page = () => {
  useEffect(() => {
    Aos.init({
      once: true, // Animation will happen only once
    });
  }, []);
  return (
    <div className={`${poppins.className}`}>
      <div
        className="w-full h-[400px] bg-cover bg-center"
        style={{
          backgroundImage: 'url("/images/about-hero-1.png")',
        }}
      >
        <div className="flex items-center justify-center h-full">
          <h2 className="text-[#FFF] font-bold	text-5xl">
            Where Learning Meets Excellence.
          </h2>
        </div>
      </div>
      <div className="text-center my-32 ">
        <h1 className="text-[#E77B3E] font-poppins font-semibold	non-italic text-2xl	  ">
          Our Vision For Future
        </h1>
        <div className="flex justify-center">
          <p className="w-[600px] flex justify-center mt-8 ">
            We strive to create a learning platform that bridges gaps in
            education, making quality tutoring accessible to everyone,
            everywhere.
          </p>
        </div>
      </div>

      <div
        className="w-full  text-center bg-cover bg-center"
        style={{
          backgroundImage: 'url("/images/ourmission.png")',
        }}
      >
        <div className="py-12 flex flex-col gap-6">
          <h1 className="text-[#E77B3E] font-poppins font-semibold	non-italic text-2xl	  ">
            Our Mission{" "}
          </h1>
          <div className="flex justify-center">
            <p className="w-[650px]">
              Our mission is to provide students with the resources, guidance,
              and support they need to succeed academically by connecting them
              with qualified tutors
            </p>
          </div>
          <div className="">
            <Link href="/find-tutor">
            <button 
           
            className="text-[#FFF]  w-32  p-2  text-md font-semibold non-italic bg-[#1E8D8F] shadow-custom-shadow  rounded-lg	 ">
              Find a Tutor
            </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="text-center  py-32">
        <h1 className="text-[#E77B3E] font-poppins font-bold	non-italic text-[30px]	  ">
          What Sets Us Apart{" "}
        </h1>
        <p className=" my-2 ">
          we are dedicated to making education both effective and enjoyable{" "}
        </p>
        <div className="flex gap-6 flex-wrap justify-center mt-5 ">
          <div className="relative overflow-hidden flex justify-center items-center">
            <Image
              src="/images/wsa1.png"
              width={350}
              height={350}
              alt="Picture of the author"
              className="object-cover"
            />
            <h1
              className="absolute text-[#FDF6EF] text-center"
              data-aos="fade-up"
              style={{ padding: "10px" }}
            >
              Tailored learning experience
            </h1>
          </div>
          <div className="relative overflow-hidden flex justify-center items-center">
            <Image
              src="/images/wsa2.png"
              width={350}
              height={350}
              alt="Picture of the author"
              className="object-cover"
            />
            <h1
              className="absolute text-[#FDF6EF]  text-center"
              data-aos="fade-up"
              style={{ padding: "10px" }}
            >
              Secure Payment System
            </h1>
          </div>
          <div className="relative overflow-hidden flex justify-center items-center">
            <Image
              src="/images/wsa3.png"
              width={350}
              height={350}
              alt="Picture of the author"
              className="object-cover"
            />
            <h1
              className="absolute text-[#FDF6EF]  text-center"
              data-aos="fade-up"
              style={{ padding: "10px" }}
            >
              Seamless Online Interaction{" "}
            </h1>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
