"use client";

import { Poppins } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

// Import Stripe elements
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

// Initialize Stripe with your public key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);
 console.log("stripePublicKey",process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);
 console.log("stripesecretKey",process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY);
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600"] });
console.log("env dummy variable",process.env.NEXT_PUBLIC_DUMMY_VARIABLE);
console.log("production dummy variable::",process.env.NEXT_PUBLIC_DUMMY_VARIABLE);
export default function RootLayout({ children }) {
  const [userData, setUserData] = useState("");
  const [selectedFile, setSelectedFile] = useState("");
  const pathname = usePathname();

  const menuItems = [
    { label: "My Profile", path: "/student/student-profile" },
    { label: "My Classes", path: "/student/student-profile/my-classes" },
    { label: "Payment", path: "/student/student-profile/payment" },
    {
      label: "My Transactions",
      path: "/student/student-profile/my-transcations",
    },
    {
      label: "Class Recording",
      path: "/student/student-profile/class-recording",
    },
    {
      label: "Invite a Friend",
      path: "/student/student-profile/invite-a-friend",
    },
  ];

  const fetchUserDetails = async () => {
    try {
      const response = await fetch("/api/student/studentProfile", {
        method: "GET",
      });
      const data = await response.json();
      console.log("data: ", data.student);
      setUserData(data.student);
    } catch (error) {
      console.log("Error While fetching studentProfileDetails", error);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, [selectedFile]);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
   const toastLoading= toast.loading("Uploading Image...");
    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();
        console.log("data: ", data);

        if (response.ok) {
          setSelectedFile(data.profilePicture);
          toast.dismiss(toastLoading);
          toast.success("Image uploaded successfully!");
        } else {
          toast.dismiss(toastLoading);
          toast.error(data.message || "Error uploading the image.");
          console.error(data.message || "Error uploading the image.");
        }
      } catch (error) {
        toast.dismiss(toastLoading);
        toast.error("Error uploading image");
        console.error("Error uploading image:", error);
      }
    }
  };

  return (
    <Elements stripe={stripePromise}>
      <Toaster />
      <div className={`min-h-fit ${poppins.className}`}>
        <div className="container mx-auto px-4 h-full lg:px-10 xl:px-20 py-6">
          <div className="flex flex-col lg:flex-row bg-[green w-full h-full gap-8">
            {/* Left Side */}
            <div className="bg-white border shadow-md  w-full lg:w-1/4 p-6 rounded-md">
              <div className="relative mx-auto mb-4  w-fit">
                <div className="  w-[82px] h-[82px] drop-shadow-xl overflow-hidden rounded-full  ">
                  <Image
                    src={userData?.profilePicture || "/images/tutorprofile.png"}
                    alt="Profile Image"
                    width={82}
                    height={82}
                    unoptimized
                    priority
                    className="h-full w-full drop-shadow-md object-cover"
                  />
                </div>
                <label className="absolute bottom-0 right-0 drop-shadow-xl bg-white p-1 rounded-full cursor-pointer">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    fill="none"
                  >
                    <path
                      d="M2.99609 12.9051V14.6249C2.99609 14.7243 3.0356 14.8197 3.10593 14.8901C3.17625 14.9604 3.27164 14.9999 3.37109 14.9999H5.09459C5.19386 14.9999 5.28906 14.9605 5.35934 14.8904L12.4453 7.80439L10.1953 5.55439L3.10634 12.6404C3.03597 12.7105 2.99631 12.8058 2.99609 12.9051ZM11.1238 4.62514L13.3738 6.87514L14.4688 5.78014C14.6094 5.63949 14.6884 5.44876 14.6884 5.24989C14.6884 5.05101 14.6094 4.86028 14.4688 4.71964L13.2801 3.53014C13.1394 3.38953 12.9487 3.31055 12.7498 3.31055C12.551 3.31055 12.3602 3.38953 12.2196 3.53014L11.1238 4.62514Z"
                      fill="#888888"
                    />
                  </svg>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
              <div className="flex flex-col items-center mb-6">
                {userData ? (
                  <p className="text-[16px] drop-shadow-lg whitespace-nowrap font-bold max-w-[200px] break-words">
                    {userData?.username}
                  </p>
                ) : (
                  <p className="h-[18px] w-[40%] bg-gray-300 animate-pulse"></p>
                )}

                <span className="text-[14px] text-center font-medium mt-1 max-w-[200px] break-words">
                  Student Id {userData?._id}
                </span>
              </div>

              <nav className="w-full">
                <ul className="space-y-2 flex flex-col">
                  {menuItems.map((item) => (
                    <Link key={item.path} href={item.path}>
                      <li
                        className={`text-center text-[17px] transition-all duration-300 ease-in-out font-semibold px-4 py-2 border rounded-md ${
                          pathname === item.path
                            ? "bg-[#E77B3E] drop-shadow-lg text-white"
                            : ""
                        }`}
                      >
                        {item.label}
                      </li>
                    </Link>
                  ))}
                </ul>
              </nav>
            </div>

            {/* Right Side */}
            <div className="w-full  bg-[red lg:w-3/4 bg-whit rounded-md">
              {children}
            </div>
          </div>
        </div>
      </div>
      
    </Elements>
  );
}
