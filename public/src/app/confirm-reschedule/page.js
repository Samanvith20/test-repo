"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useState } from "react";
import { Poppins } from "next/font/google";
import toast, { Toaster } from "react-hot-toast";
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Spinner Component
const Spinner = () => (
  <div className="flex justify-center items-center h-24">
    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4  border-secondary-600"></div>
  </div>
);

const Page = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const studentResponse = searchParams.get("studentResponse");

  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();

  const handleRescheduleResponse = async () => {
    try {
      const toastId = toast.loading("Storing your response...");
      const response = await fetch("/api/student/reschedule-response", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          studentResponse,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Response successfully stored...");
      } else {
        toast.error("There is an error while storing your response..");
      }
    } catch (error) {
      console.log("Error while handling the reschedule Response: ", error);
    }
  };

  useEffect(() => {
    if (!token && !studentResponse) {
      router.push("/");
    } else {
      setIsLoading(false);
      handleRescheduleResponse();
    }
  }, []);

  console.log(
    "Search Parameters: token & response",
    searchParams.get("token"),
    searchParams.get("studentResponse")
  );

  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${poppins.className} flex flex-col items-center justify-center bg-gray-100 px-4`}
    >
      <Toaster />
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-semibold text-orange-500 mb-4">
          Reschedule Response Received
        </h1>
        <p className="text-gray-700 mb-6">
          Thank you for submitting your response. Your decision regarding the
          reschedule request has been successfully received.
        </p>
        <div className="flex flex-col items-center space-y-4">
          <Link
            href="/"
            className="bg-secondary-500 text-white font-medium py-2 px-4 rounded hover:bg-teal-600 transition"
          >
            Go To Home
          </Link>
        </div>
      </div>
    </div>
  );
};

const SuspenseWrapper = () => {
  return (
    <Suspense
      fallback={
        <div className="w-full h-screen">
          <Spinner />
        </div>
      }
    >
      <Page />
    </Suspense>
  );
};

export default SuspenseWrapper;
