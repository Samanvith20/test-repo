"use client";
import React, { useEffect, useState } from "react";
import { MdCheckCircle } from "react-icons/md";
import { useTutor } from "@/app/components/TutorContext";
import { useRouter } from "next/navigation";

const ConfirmationMessage = () => {
  return (
    <>
      <div className="flex items-center space-x-6 bg-green-50 border border-green-200 rounded-md px-4 py-3 w-full md:w-[80%]  mx-auto">
        {/* Success Icon */}
        <MdCheckCircle className="text-green-600 w-[32px] h-[32px] text-xl" />
        {/* Message Content */}
        <div>
          <h2 className="text-[16px] sm:text-[22px] md:text-[24px] font-bold text-gray-900 mb-1">
            Confirmation Email Sent
          </h2>
        </div>
      </div>
      <p className="text-gray-700 md:text-[18px] sm:text-[16px] text-[14px] text-center mt-6">
        Another confirmation email has been sent to your email address. You
        should receive it within a few minutes.
      </p>
    </>
  );
};

// ChangeEmailAddress component
const ChangeEmailAddress = ({ currentEmail, setEmail, handleCancel, handleEmailChange }) => {
  const [newEmail, setNewEmail] = useState(""); 
  const [error, setError] = useState(""); 
console.log("currentEmail:", currentEmail);
console.log("newEmail:", newEmail);


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newEmail) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      // Sending new email to the backend
      const response = await fetch("/api/tutors/change-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({currentEmail, newEmail }),
      });

      const data = await response.json();
      if (response.ok) {
        handleEmailChange(newEmail);
        setError("");
      } else {
        setError(data.message || "Failed to update the email.");
      }
    } catch (error) {
      console.error("Failed to change email:", error);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="">
      <div className="w-full bg-white rounded-md sm:p-4 p-2 md:p-8">
        <h1 className="sm:text-lg text-md md:text-2xl font-bold text-gray-900 mb-4">
          Change Your Email Address
        </h1>
        <p className="text-gray-700 sm:text-[16px] text-[14px] md:text-[18px] mb-6">
          The email address we have on file for you is listed below. If this is
          incorrect, please type your correct email address into the text box
          and click Submit to save your address and generate another
          confirmation email to the new email address.
        </p>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="flex justify-around space-y-4 lg:space-y-0 lg:flex-row flex-col">
            {/* Current Email Address */}
            <div className="flex md:items-center text-[14px] sm:text-[16px] md:text-[18px] flex-col md:flex-row md:space-x-4 w-full lg:w-[42%]">
              <label className="font-semibold text-gray-900">Mail Id:</label>
              <div className="flex-grow p-2 bg-gray-100 rounded-md text-gray-900">
                {currentEmail}
              </div>
            </div>

            {/* New Email Address */}
            <div className="flex md:items-center md:flex-row flex-col text-[14px] sm:text-[16px] md:text-[18px] md:space-x-4 w-full lg:w-[48%]">
              <label className="font-semibold text-secondary-600">
                New Email Address:
              </label>
              <input
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                type="email"
                placeholder="Enter"
                className="flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </div>
          </div>

          {error && <p className="text-red-500">{error}</p>}

          {/* Buttons Section */}
          <div className="flex justify-end md:flex-row flex-col space-y-4 md:space-y-0 md:space-x-4 mt-6">
            <button
              type="button"
              onClick={handleCancel}
              className="px-10 py-1 md:text-[20px] sm:text-[18px] text-[16px] border border-orange-500 text-orange-500 font-semibold rounded-md hover:bg-orange-50 transition duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-10 py-1 bg-orange-500 text-white font-semibold md:text-[20px] sm:text-[18px] text-[16px] rounded-md hover:bg-orange-600 transition duration-300"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Page = () => {
  const { tutorInitialDetails, stepsCleared } = useTutor();
  const router = useRouter();
  const [showChangeEmail, setShowChangeEmail] = useState(false);
  const [email, setEmail] = useState(tutorInitialDetails?.email || ""); // Current email state
  

  // useEffect(()=> {
  //   if(stepsCleared["step5"] === false) {
  //     router.push('/tutor-sign-up/step-4')
  //   }
  // },[])
  
  const handleEmailChange = (newEmail) => {
    setEmail(newEmail);
    setShowChangeEmail(false); // Hide the form once the email is changed
  };

  const handleCancel = () => {
    setShowChangeEmail(false); // Hide the form when canceled
  };

  if (!tutorInitialDetails) {
    return <p>Loading...</p>; // Or some other fallback UI
  }

  return (
    <div className="">
      {/* Step Indicator */}
      <div className="md:flex hidden items-center w-[80%] mx-auto py-4 mb-12">
        {Array(5)
          .fill()
          .map((_, index) => (
            <React.Fragment key={index}>
              <div
                className={`flex items-center justify-center w-[50px] h-[50px] rounded-full ${
                  index < 5
                    ? "bg-primary-400 text-white"
                    : "bg-[#D9D9D9] text-text-400"
                } font-bold text-white`}
              >
                {index + 1}
              </div>
              {index < 4 && (
                <div
                  className={`flex-grow ${
                    index < 4 ? "border-t-2 border-dashed border-text-800" : ""
                  } mx-2`}
                ></div>
              )}
            </React.Fragment>
          ))}
      </div>

      {/* Step Indicator in mobile */}
      <div className="md:hidden mb-4 w-[40px] bg-primary-400 text-white h-[40px] rounded-[50%] flex items-center justify-center">
        <p>5</p>
      </div>

      <div className="w-full bg-white rounded-md p-2 sm:p-4 md:p-8">
        {showChangeEmail ? (
          <ChangeEmailAddress
            currentEmail={email}
            setEmail={setEmail}
            handleCancel={handleCancel}
            handleEmailChange={handleEmailChange}
          />
        ) : (
          <>
            {/* Header Section */}
            <h1 className="text-[18px] sm:text-[20px] md:text-2xl font-bold text-gray-900 mb-4">
              Email Confirmation
            </h1>
            <p className="text-gray-700 sm:text-[16px] text-[14px] md:text-[18px] mb-6">
              An email confirmation has been sent to the address provided. If
              you don&apos;t receive this in a few minutes, please confirm your
              email address below and resend the confirmation email.
            </p>

            {/* Email Confirmation Box */}
            <div className="bg-gray-100 p-6 text-center rounded-md mb-6">
              <p className="sm:text-[16px] text-[14px] md:text-lg font-semibold text-gray-900 mb-2">
                Mail Id:{" "}
                <span className="font-normal">{email}</span>
              </p>
              <p
                className="text-secondary-600 text-[15px] font-[600] leading-normal underline cursor-pointer mb-4"
                onClick={() => setShowChangeEmail(true)} // Show change email form on click
              >
                Not Your Mail Id?
              </p>

              {/* Resend Button */}
              <div className="flex justify-center">
                <button
                  className="px-10 py-1 bg-orange-500 text-white font-semibold sm:text-[14px] text-[12px] md:text-[16px] rounded-lg hover:bg-orange-600 transition duration-300"
                >
                  Resend
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Page;
