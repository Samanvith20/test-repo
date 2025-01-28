"use client";
import React, { useState } from "react";
import { Poppins } from "next/font/google";
import toast, { Toaster } from "react-hot-toast";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600"] });
const Contactuspage = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    emailAddress: "",
    query: "",
    phoneNumber: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const toastId = toast.loading("Submitting...");

    try {
      const response = await fetch("/api/tutors/contact-us", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log("DATA: ", data);
      

      if (response.ok) {
        toast.dismiss(toastId);
        toast.success("Form submitted successfully");
        setFormData({
          firstName: "",
          lastName: "",
          emailAddress: "",
          query: "",
          phoneNumber: "",
        });
      } else {
        toast.dismiss(toastId);
        toast.error("Failed to submit. Please try again.");
      }
    } catch (error) {
      toast.dismiss(toastId);
      toast.error("Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`flex md:flex-row flex-col justify-center items-center  ${poppins.className}`}
    >
      <Toaster/>
      <div className="container px-[20px] lg:px-[50px] xl:px-[86px] py-10 gap-10 flex md:flex-row flex-col justify-center items-center ">
        {/* Left Container */}
        <div className="flex flex-col gap-4 items-center">
          <h1 className="sm:text-[18px] text-[16px] md:text-[21px] leading-normal font-bold text-center">
            Get In Touch with Us
          </h1>
          <h3 className="text-center text-[12px] sm:text-[14px] md:text-[17px] font-semibold">
            Reach out to Eduelite Customer Support by email at
            <p>support@eduelite.com</p>
          </h3>
          <p className="text-center text-[12px] sm:text-[14px]  font-medium">
            Our team can typically respond to emails within 1-3 business days.
          </p>
          <div className="flex  items-center  mt-3 justify-center gap-12">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              viewBox="0 0 40 40"
              fill="none"
            >
              <g clipPath="url(#clip0_1097_1432)">
                <path
                  d="M30.625 0H9.375C4.19733 0 0 4.19733 0 9.375V30.625C0 35.8027 4.19733 40 9.375 40H30.625C35.8027 40 40 35.8027 40 30.625V9.375C40 4.19733 35.8027 0 30.625 0Z"
                  fill="url(#paint0_radial_1097_1432)"
                />
                <path
                  d="M30.625 0H9.375C4.19733 0 0 4.19733 0 9.375V30.625C0 35.8027 4.19733 40 9.375 40H30.625C35.8027 40 40 35.8027 40 30.625V9.375C40 4.19733 35.8027 0 30.625 0Z"
                  fill="url(#paint1_radial_1097_1432)"
                />
                <path
                  d="M20.0014 4.375C15.758 4.375 15.2253 4.39359 13.5588 4.46938C11.8953 4.54563 10.7598 4.80891 9.76641 5.19531C8.73859 5.59438 7.86688 6.12828 6.99844 6.99703C6.12922 7.86562 5.59531 8.73734 5.195 9.76469C4.8075 10.7584 4.54391 11.8944 4.46906 13.557C4.39453 15.2238 4.375 15.7566 4.375 20.0002C4.375 24.2438 4.39375 24.7747 4.46938 26.4412C4.54594 28.1047 4.80922 29.2402 5.19531 30.2336C5.59469 31.2614 6.12859 32.1331 6.99734 33.0016C7.86563 33.8708 8.73734 34.4059 9.76438 34.805C10.7586 35.1914 11.8942 35.4547 13.5573 35.5309C15.2241 35.6067 15.7563 35.6253 19.9995 35.6253C24.2434 35.6253 24.7744 35.6067 26.4409 35.5309C28.1044 35.4547 29.2411 35.1914 30.2353 34.805C31.2627 34.4059 32.1331 33.8708 33.0012 33.0016C33.8705 32.1331 34.4042 31.2614 34.8047 30.2341C35.1887 29.2402 35.4525 28.1044 35.5306 26.4416C35.6055 24.775 35.625 24.2438 35.625 20.0002C35.625 15.7566 35.6055 15.2241 35.5306 13.5573C35.4525 11.8939 35.1887 10.7586 34.8047 9.76516C34.4042 8.73734 33.8705 7.86562 33.0012 6.99703C32.1322 6.12797 31.263 5.59406 30.2344 5.19547C29.2383 4.80891 28.1022 4.54547 26.4387 4.46938C24.772 4.39359 24.2414 4.375 19.9966 4.375H20.0014ZM18.5997 7.19078C19.0158 7.19016 19.48 7.19078 20.0014 7.19078C24.1734 7.19078 24.6678 7.20578 26.3153 7.28063C27.8387 7.35031 28.6656 7.60484 29.2164 7.81875C29.9456 8.10188 30.4655 8.44047 31.012 8.9875C31.5589 9.53438 31.8973 10.0552 32.1813 10.7844C32.3952 11.3344 32.65 12.1613 32.7194 13.6847C32.7942 15.3319 32.8105 15.8266 32.8105 19.9966C32.8105 24.1666 32.7942 24.6614 32.7194 26.3084C32.6497 27.8319 32.3952 28.6587 32.1813 29.2089C31.8981 29.9381 31.5589 30.4573 31.012 31.0039C30.4652 31.5508 29.9459 31.8892 29.2164 32.1725C28.6663 32.3873 27.8387 32.6413 26.3153 32.7109C24.6681 32.7858 24.1734 32.802 20.0014 32.802C15.8292 32.802 15.3347 32.7858 13.6877 32.7109C12.1642 32.6406 11.3373 32.3861 10.7861 32.1722C10.057 31.8889 9.53609 31.5505 8.98922 31.0036C8.44234 30.4567 8.10391 29.9372 7.82 29.2077C7.60609 28.6575 7.35125 27.8306 7.28188 26.3072C7.20703 24.66 7.19203 24.1653 7.19203 19.9927C7.19203 15.82 7.20703 15.328 7.28188 13.6808C7.35156 12.1573 7.60609 11.3305 7.82 10.7797C8.10328 10.0505 8.44234 9.52969 8.98938 8.98281C9.53641 8.43594 10.057 8.09734 10.7862 7.81359C11.337 7.59875 12.1642 7.34484 13.6877 7.27484C15.1291 7.20969 15.6877 7.19016 18.5997 7.18687V7.19078ZM28.342 9.78516C27.3069 9.78516 26.467 10.6242 26.467 11.6595C26.467 12.6947 27.3069 13.5345 28.342 13.5345C29.3772 13.5345 30.217 12.6947 30.217 11.6595C30.217 10.6244 29.3772 9.78453 28.342 9.78453V9.78516ZM20.0014 11.9759C15.5702 11.9759 11.9773 15.5688 11.9773 20.0002C11.9773 24.4316 15.5702 28.0227 20.0014 28.0227C24.4328 28.0227 28.0244 24.4316 28.0244 20.0002C28.0244 15.5689 24.4325 11.9759 20.0011 11.9759H20.0014ZM20.0014 14.7917C22.8778 14.7917 25.2098 17.1234 25.2098 20.0002C25.2098 22.8766 22.8778 25.2086 20.0014 25.2086C17.125 25.2086 14.7931 22.8766 14.7931 20.0002C14.7931 17.1234 17.1248 14.7917 20.0014 14.7917Z"
                  fill="#FBE9D9"
                />
              </g>
              <defs>
                <radialGradient
                  id="paint0_radial_1097_1432"
                  cx="0"
                  cy="0"
                  r="1"
                  gradientUnits="userSpaceOnUse"
                  gradientTransform="translate(10.625 43.0808) rotate(-90) scale(39.643 36.8711)"
                >
                  <stop stopColor="#FFDD55" />
                  <stop offset="0.1" stopColor="#FFDD55" />
                  <stop offset="0.5" stopColor="#FF543E" />
                  <stop offset="1" stopColor="#C837AB" />
                </radialGradient>
                <radialGradient
                  id="paint1_radial_1097_1432"
                  cx="0"
                  cy="0"
                  r="1"
                  gradientUnits="userSpaceOnUse"
                  gradientTransform="translate(-6.70016 2.88141) rotate(78.681) scale(17.7206 73.045)"
                >
                  <stop stopColor="#3771C8" />
                  <stop offset="0.128" stopColor="#3771C8" />
                  <stop offset="1" stopColor="#6600FF" stopOpacity="0" />
                </radialGradient>
                <clipPath id="clip0_1097_1432">
                  <rect width="40" height="40" fill="white" />
                </clipPath>
              </defs>
            </svg>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              viewBox="0 0 40 40"
              fill="none"
            >
              <path
                d="M36.453 1.50977H3.5499C2.4229 1.50977 1.50928 2.42338 1.50928 3.55039V36.4535C1.50928 37.5805 2.4229 38.4941 3.5499 38.4941H36.453C37.58 38.4941 38.4937 37.5805 38.4937 36.4535V3.55039C38.4937 2.42338 37.58 1.50977 36.453 1.50977Z"
                fill="#3D5A98"
              />
              <path
                d="M27.0251 38.4902V24.1683H31.8313L32.5501 18.587H27.0251V15.0245C27.0251 13.4089 27.4751 12.3058 29.7907 12.3058H32.747V7.30579C31.3154 7.15687 29.8768 7.08593 28.4376 7.09329C24.1813 7.09329 21.2501 9.68704 21.2501 14.4714V18.587H16.4438V24.1683H21.2501V38.4902H27.0251Z"
                fill="#FBE9D9"
              />
            </svg>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              viewBox="0 0 40 40"
              fill="none"
            >
              <g clipPath="url(#clip0_1097_1440)">
                <path
                  d="M39.9983 4.87072C38.5006 5.6836 36.912 6.21711 35.2853 6.45349C36.9797 5.20948 38.2806 3.23952 38.8932 0.892346C37.2825 2.06317 35.5203 2.88813 33.6827 3.33158C32.1858 1.37809 30.0533 0.157227 27.6931 0.157227C23.1613 0.157227 19.4872 4.6579 19.4872 10.2089C19.4872 10.9968 19.5598 11.7639 19.6996 12.4998C12.88 12.0805 6.83372 8.07876 2.78646 1.99723C2.08028 3.48182 1.67563 5.20871 1.67563 7.05062C1.67563 10.5381 3.12439 13.6146 5.32605 15.4173C4.02296 15.3674 2.74854 14.9363 1.60923 14.1599C1.60881 14.202 1.60865 14.2442 1.60876 14.2864C1.60876 19.1567 4.43723 23.2194 8.19093 24.1429C6.98258 24.5454 5.71513 24.6043 4.48535 24.3151C5.52947 28.3086 8.55996 31.2146 12.1505 31.296C9.34222 33.9919 5.80397 35.5989 1.95966 35.5989C1.29723 35.5989 0.644166 35.5513 0.00219727 35.4585C3.63356 38.3105 7.94673 39.9746 12.5807 39.9746C27.674 39.9746 35.9274 24.6577 35.9274 11.3746C35.9274 10.9387 35.9195 10.5052 35.9037 10.0742C37.51 8.65139 38.8966 6.88937 39.9983 4.87072Z"
                  fill="#55ACEE"
                />
              </g>
              <defs>
                <clipPath id="clip0_1097_1440">
                  <rect width="40" height="40" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </div>
        </div>
        {/* Form Container */}
        <div className="h-[80%] w-full lg:w-[30%] py-4 rounded-2xl px-4 mx-4 lg:ml-12  bg-[#E7E7E7] ">
          <div className="  rounded-lg shadow-md px-4 py-4 lg:px-14 flex flex-col justify-center  bg-[#FFF]  mx-auto h-[100%] ">
            <form
              className="flex flex-col gap-4 w-full max-w-md mx-auto"
              onSubmit={handleSubmit}
            >
              <div className="w-full">
                <label
                  className="font-semibold text-[12px] sm:text-[16px]"
                  htmlFor="name"
                >
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  className="w-full px-3 py-2 border text-[10px] sm:text-[12px] rounded-md font-normal"
                  placeholder="Enter your first name"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="w-full">
                <label
                  htmlFor="last-name"
                  className="font-semibold text-[12px] sm:text-[16px]"
                >
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  className="w-full px-3 py-2 border text-[10px] sm:text-[12px] rounded-md font-normal"
                  placeholder="Enter your last name"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="w-full">
                <label
                  className="font-semibold text-[12px] sm:text-[16px]"
                  htmlFor="email"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="emailAddress"
                  name="emailAddress"
                  className="w-full px-3 py-2 border text-[10px] sm:text-[12px] rounded-md font-normal"
                  placeholder="Enter your email address"
                  value={formData.emailAddress}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="w-full">
                <label
                  className="font-semibold text-[12px] sm:text-[16px]"
                  htmlFor="phone"
                >
                  Phone Number
                </label>
                <input
                  type="number"
                  id="phoneNumber"
                  name="phoneNumber"
                  className="w-full px-3 py-2 border text-[10px] sm:text-[12px] rounded-md font-normal"
                  placeholder="Enter your phone number"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="w-full">
                <textarea
                  id="query"
                  name="query"
                  className="w-full px-3 py-2 border text-[10px] sm:text-[12px] resize-none rounded-md font-normal"
                  placeholder="Enter your query"
                  value={formData.query}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>
              <button
                disabled={isSubmitting}
                type="submit"
                className="w-full py-1 text-[12px] font-[600] md:text-[16px] px-4 bg-[#E77B3E] text-white rounded-md"
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contactuspage;
