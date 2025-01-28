"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Poppins, Preahvihear } from "next/font/google";
import { FiMenu, FiX } from "react-icons/fi"; // Icons for Hamburger and X
import { useSession, signOut } from "next-auth/react"; // Import signOut
import Image from "next/image";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600", "500"] });
const preahvihear = Preahvihear({ subsets: ["latin"], weight: ["400"] });

const Navbar = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State for mobile menu
  const mobileMenuRef = useRef(null);
  const { data: session } = useSession();
  // console.log("SESSION: ", session);

  // Navigation items
  const navItems = session
    ? session.role === "tutor"
      ? [
          { name: "Dashboard", path: "/tutor/tutor-dashboard" },
          { name: "My Profile", path: "/tutor/my-profile" },
          { name: "Chat", path: "/chat" },
          { name: "About Us", path: "/about" },
          { name: "Contact Us", path: "/contact-us" },
        ]
      : [
          { name: "Dashboard", path: "/student/student-dashboard" },
          { name: "Find Tutor", path: "/find-tutor" },
          { name: "My Profile", path: "/student/student-profile" },
          { name: "Chat", path: "/chat" },
          { name: "About Us", path: "/about" },
          { name: "Contact Us", path: "/contact-us" },
        ]
    : [
        { name: "Find Tutor", path: "/find-tutor" },
        { name: "About Us", path: "/about" },
        { name: "Contact Us", path: "/contact-us" },
      ];

  // Close the mobile menu if user clicks outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target)
      ) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [mobileMenuRef]);

  // Toggle the mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div
      className={`${poppins.className} bg-black text-white fixed flex items-center top-0 left-0 w-full z-50 shadow-md h-[58px]`}
    >
      <div className="container mx-auto flex justify-between bg-[red items-center px-[20px] lg:px-[50px] xl:px-[86px]">
        {/* Logo Section */}
        <div className="text-[18px]">
          <Link 
          className="flex items-center justify-center gap-2" href={"/"}>
            <Image
              src={"/images/logo.png"}
              height={40}
              alt="logo"
              width={40}
              unoptimized
            />
             <h1
              className={`text-white ${preahvihear.className} text-[16px] md:text-[18px]  xl:text-[20px]`}
            >
              EduEliteConnect
               
               
            </h1>
          </Link>

        </div>

        {/* Links Section - Desktop */}
        <ul className="hidden md:flex space-x-[10px] lg:space-x-[15px] xl:space-x-[39px] text-[14px] xl:text-[16px] items-center justify-center h-full">
          {navItems.map((item) => (
            <li key={item.name} className="relative group">
              <Link href={item.path}>
                <p
                  className={`${
                    pathname === item.path ? "text-white" : "text-[#ffffffd6]"
                  } hover:text-white transition-colors duration-300`}
                >
                  {item.name}
                </p>
              </Link>
              {/* Active Link Underline */}
              {pathname === item.path && (
                <span className="absolute left-0 right-0 -bottom-[17px] rounded-lg h-1 bg-primary-500"></span>
              )}
            </li>
          ))}
        </ul>

        {/* Hamburger Icon Section - Mobile */}
        <div className="md:hidden flex items-center">
          <button
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
            className="text-white text-2xl focus:outline-none"
          >
            {isMobileMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>

        {/* User Navigation Button Section - Desktop */}
        <div className="hidden md:flex space-x-4 items-center md:text-[12px] xl:text-[15px]">
          {session ? (
            <button
              className="border border-white text-white py-1 px-4 xl:px-10 rounded-lg hover:bg-white hover:text-black transition duration-300"
              onClick={() => signOut()} // Log out the user
            >
              Log Out
            </button>
          ) : (
            <>
              <Link href="/login">
                <button className="border border-white text-white py-1 px-4 xl:px-10 rounded-lg hover:bg-white hover:text-black transition duration-300">
                  Log In
                </button>
              </Link>
              <Link href="/sign-up">
                <button className="bg-primary-500 text-white py-1 px-4 xl:px-10 rounded-lg hover:bg-primary-600 transition duration-300">
                  Sign Up
                </button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="md:hidden absolute top-[58px] right-0 w-[60%] bg-black z-40 px-4 rounded-bl-[10px]  transition-all duration-300 ease-in-out"
        >
          <ul className="flex flex-col text-left py-6 space-y-6">
            {navItems.map((item) => (
              <li key={item.name} className="relative group">
                <Link href={item.path}>
                  <p
                    className={`${
                      pathname === item.path
                        ? "text-primary-500"
                        : "text-[#ffffffd6]"
                    } hover:text-primary-500 text-[12px] sm:text-[14px]  transition-colors duration-300`}
                    onClick={() => setIsMobileMenuOpen(false)} // Close menu on click
                  >
                    {item.name}
                  </p>
                </Link>
              </li>
            ))}
            {/* Buttons for Login/Signup or Logout */}
            {session ? (
              <li>
                <button
                  className="border border-white text-white py-1 px-8 w-[80%] text-[12px] sm:text-[14px] rounded-lg hover:bg-white hover:text-black transition duration-300"
                  onClick={() => signOut()} // Log out the user
                >
                  Log Out
                </button>
              </li>
            ) : (
              <>
                <li>
                  <Link href="/login">
                    <button className="border border-white text-white py-1 px-8 text-[12px] sm:text-[14px] w-[80%] rounded-lg hover:bg-white hover:text-black transition duration-300">
                      Log In
                    </button>
                  </Link>
                </li>
                <li>
                  <Link href="/sign-up">
                    <button className="bg-primary-500 text-white py-2 px-8 w-[80%] text-[12px] sm:text-[14px] rounded-lg hover:bg-primary-600 transition duration-300">
                      Sign Up
                    </button>
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Navbar;
