"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

import { Poppins } from "next/font/google";

// Import the font as you originally did
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600"] });

// ProfileSubmitted Component (remains the same)
const ProfileSubmitted = () => {
  return (
    <div className="w-full max-w-3xl mx-auto bg-white shadow-lg rounded-md h-fit sm:h-[200px] p-8 text-center">
      <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-orange-500 mb-4">
        Profile Submitted For Review
      </h1>
      <p className="text-gray-700 text-[13px] sm:text-[16px] md:text-[18px]">
        Thanks for applying to be listed on EduEliteConnect! We will review your
        profile and get back to you by email within 3-5 business days.
      </p>
    </div>
  );
};

// The actual component where email verification logic resides
function VerifyEmailContent() {
  const searchParams = useSearchParams(); // Get the search parameters (including token)
  const router = useRouter();
  const token = searchParams.get("token"); // Extract the token from the URL query parameter

  const [status, setStatus] = useState("Verifying..."); // Default status
  const [isSuccess, setIsSuccess] = useState(null); // Track success/failure state

  // Effect hook to run the token verification when available
  useEffect(() => {
    if (token) {
      verifyToken(token); // Call the function to verify token when token is available
    }
  }, [token]);

  // Token verification function
  const verifyToken = async (token) => {
    try {
      const response = await fetch(
        `/api/tutors/emailVerification?token=${token}`,
        {
          method: "GET",
        }
      );

      const data = await response.json();
      if (response.ok) {
        setStatus("Email verified successfully!"); // Success case
        setIsSuccess(true);
      } else {
        setStatus(`Verification failed: ${data.message}`); // Failure case
        setIsSuccess(false);
      }
    } catch (error) {
      setStatus("An error occurred during verification.");
      setIsSuccess(false); // Handle error case
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${poppins.className}`}>
      <div className=" w-full bg-white rounded-lg p-8 text-center">
        {isSuccess === null && (
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        )}

        {isSuccess === true && (
          <>
            <div className="max-w-lg mx-auto my-10 text-center">
              <h2 className="text-2xl font-semibold text-green-600">
                Success!
              </h2>
              <p className="text-gray-600 mt-4">{status}</p>
            </div>
            <ProfileSubmitted />
          </>
        )}

        {isSuccess === false && (
          <div className="text-center">
            <svg
              className="w-16 h-16 text-primary-500 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01M19 9a7 7 0 10-14 0 7 7 0 0014 0zm-7 7a7 7 0 110-14 7 7 0 010 14z"
              />
            </svg>
            <h2 className="text-2xl font-semibold text-primary-600">
              Verification Failed!
            </h2>
            <p className="text-gray-600 mt-4">{status}</p>
            <Link
              href="/support"
              className="mt-6 inline-block px-6 py-2 text-sm font-medium leading-6 text-center text-white bg-primary-500 hover:bg-primary-600 rounded-full"
            >
              Contact Support
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

// Main VerifyEmail component with Suspense and fallback
export default function VerifyEmail() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}

// Mark the page as dynamic to avoid pre-rendering errors
export const dynamic = 'force-dynamic';
