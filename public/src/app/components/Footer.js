 "use client"
import React from "react";
import Link from "next/link"; // Import Next.js Link component
import Image from "next/image";
import { Poppins } from "next/font/google";


const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const Footer = () => {
 

  // Define the footer sections and their corresponding links
  const footerLinks = [
    {
      title: "Get To Know Us",
      links: [
        { name: "About Us", path: "/about" },
        { name: "Contact Us", path: "/contact-us" },
        { name: "FAQ", path:""  },
        { name: "Reviews",path:""  },
      ],
    },
    {
      title: "Learn With Us",
      links: [
        { name: "Find a Tutor", path: "/find-tutor" },
        { name: "Request a Tutor", path: "/find-tutor" },
        { name: "Online Tutoring", path:""  },
        { name: "Learning Resources",path:""},
        { name: "Tell Us What You Think ",path:"" },
      ],
    },
    {
      title: "Work With Us",
      links: [
        { name: "Apply as a Tutor",path:""  },
        { name: "Apply Job Board", path:"" },
      ],
    },
  ];

  return (
    <div className={` bg-primary-100 ${poppins.className}`}>
      <div className="container mx-auto px-[20px] lg:px-[50px] xl:px-[86px] flex items-center justify-center h-full">
        <div className=" flex sm:flex-row flex-col items-center sm:items-start gap-10 text-center lg:text-left py-10 w-full justify-between flex-wrap">
          {footerLinks.map((section, index) => (
            <div key={index} className="flex flex-col gap-2">
              <h3 className="font-[700] text-[17px] ">{section.title}</h3>
              <ul className="flex flex-col gap-[10px] text-[14px] font-[500]">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link href={link.path}>
                      <p>{link.name}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="flex flex-col gap-2">
            <h3 className="font-[700] text-[17px] ">Connect With Us</h3>
            <div className="flex gap-4  w-fit mx-auto lg:mx-0">
              <div className="w-[24px] h-[24px]">
                <Image
                  src={"/images/footer-instagram-logo.png"}
                  alt="Footer Instagram Logo"
                  width={24}
                  height={24}
                  className="w-full h-full object-contain" // Ensure image fits within its container
                />
              </div>
              <div className="w-[24px] h-[24px]">
                <Image
                  src={"/images/footer-facebook-logo.png"}
                  alt="Footer Facebook Logo"
                  width={24}
                  height={24}
                  className="w-full h-full object-contain" // Ensure image fits within its container
                />
              </div>
            </div>
          </div>
        </div>
        
      </div>
     
      <div className="mt-8 py-4 text-center text-xs  text-[#000] sm:text-base border-t border-[#000]">
        © 2024 EduEliteConnect developed by{" "}
        <Link href="https://hanvitecsolutions.in/" target="_blank">
          <span className=" font-semibold z-10 cursor-pointer relative group">
            HanviTec Solutions
            {/* Tooltip */}
            <span className="absolute bottom-full w-fit sm:text-nowrap left-1/2 transform 
            -translate-x-1/2 mb-2  px-3 py-2 text-xs text-[#FFFF]
             bg-gray-800 rounded shadow-lg hidden group-hover:block 
             transition-opacity">
              HanviTec Solutions: Shaping tomorrow&apos;s technology!
            </span>
          </span>
        </Link>
      </div>
    </div>
  );
};

export default Footer;
