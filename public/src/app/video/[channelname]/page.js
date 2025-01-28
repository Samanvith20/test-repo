"use client";

import { set } from "mongoose";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";

// Dynamically import the Call component with SSR disabled
const Call = dynamic(() => import("@/app/components/Call"), { ssr: false });

export default function Page({ params }) {
  const [isVerified, setIsVerified] = useState(false);
  const [verificationError, setVerificationError] = useState("");
  const [loading, setloading] = useState(true);
  const { data: session } = useSession();
  const[scheduledClassId, setScheduledClassId] = useState("");

  console.log("SESSION: ", session);

  // Decode channel name to extract ID, username, date, and time
  const decodechannelName = decodeURIComponent(params.channelname);
  const channelName = params.channelname ? params.channelname.split("_") : [];
  const id = channelName[0] || "";
  const username = channelName[1] || ""; // Parsed username from channel name
  const date = channelName[2] || "";
  const decodedTime = decodeURIComponent(channelName[3] || "");

  // useEffect hook to verify class details
  useEffect(() => {
    setloading(true);
    const verifyClassDetails = async () => {
      try {
        const response = await fetch("/api/video/verify-class", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id,
            date,
            decodedTime,
            channelName: decodechannelName,
          }),
        });

        const result = await response.json();
        if (result.success) {
          console.log("Class details verified:", result.document);
          setScheduledClassId(result.document._id);
          setIsVerified(true);
          setloading(false);
          // Set verification state to true if successful
        } else {
          toast.error(`Verification failed: ${result.message}`); // Error toast
          console.error("Verification failed:", result.message);
          setVerificationError(result.message); // Set error message if verification fails
          setIsVerified(false);
          setTimeout(() => {
            window.location.href = "/"; // Redirect to home page if verification fails
          }, 2000); // Add delay for toast visibility
        }
      } catch (error) {
        toast.error("Error in verifying class details."); // Error toast
        console.error("Error in verifying class details:", error);
        setVerificationError("Error in verifying class details");
        setIsVerified(false);
        setTimeout(() => {
          window.location.href = "/"; // Redirect to home page on error
        }, 2000); // Add delay for toast visibility
      }
    };

    if (params.channelname) {
      verifyClassDetails();
    }
  }, [params.channelname]);

  // Spinner Component
  const Spinner = () => (
    <div className="flex justify-center items-center h-screen w-full">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4  border-secondary-600"></div>
    </div>
  );
  if (loading) {
    return <Spinner />;
  }

  // Check access based on role
  const canAccessCallComponent =
    (session?.role === "student" && session?.username === username) ||
    session?.role === "tutor"; // Allow tutors access without username check

  // Only render the Call component if verification is successful and user is authorized
  if (!isVerified || !canAccessCallComponent) {
    return (
      <main className="flex w-full flex-col">
        {/* Optional error message */}
        {verificationError && (
          <p className="text-red-500">
            Verification failed: {verificationError}
          </p>
        )}
      </main>
    );
  }

  const sanitizedChannelName = id + date+ decodedTime;
  console.log("Sanitized Channel Name:", sanitizedChannelName);

  return (
    <>
      <Toaster />
      <main className="flex w-full flex-col">
        <Call
          appId={process.env.NEXT_PUBLIC_AGORA_APP_ID}
          username={username}
          channelName={sanitizedChannelName}
          tutorId={id}
          date={date}
          time={decodedTime}
          scheduledClassId={scheduledClassId}
        />
      </main>
    </>
  );
}
