// "use client";

// import { useSession } from "next-auth/react";
// import dynamic from "next/dynamic";
// import { useSearchParams } from "next/navigation";
// import { Suspense, useEffect, useState } from "react";
// import { Toaster, toast } from "react-hot-toast";

// // Dynamically import the Call component with SSR disabled
// const Call = dynamic(() => import("@/app/components/Call"), { ssr: false });

// function Page({ params }) {
//   const [isVerified, setIsVerified] = useState(false);
//   const [verificationError, setVerificationError] = useState("");
//   const [loading, setLoading] = useState(true);
//   const { data: session } = useSession();
//   const [scheduledClassId, setScheduledClassId] = useState("");

//   console.log("SESSION: ", session);
//   const searchParams = useSearchParams();
//   const recorder = searchParams.get("recorder");

//   console.log("searchParams: ", searchParams);
//   console.log("recorder: ", recorder);

//   const urlParams = new URLSearchParams(window.location.search);
//   console.log("urlParams: ", urlParams);
//     const  paramRecorder = urlParams.get("recorder");
//     console.log("paramRecorder: ", paramRecorder);

//   // Decode channel name to extract ID, username, date, and time
//   const decodechannelName = decodeURIComponent(params.channelname);
//   const channelName = params.channelname ? params.channelname.split("_") : [];
//   const id = channelName[0] || "";
//   const username = channelName[1] || ""; // Parsed username from channel name
//   const date = channelName[2] || "";
//   const decodedTime = decodeURIComponent(channelName[3] || "");

//   useEffect(() => {
//     // Skip verification if recorder exists
//     if (recorder) {
//       console.log("Skipping verification as recorder is present.");
//       setIsVerified(true);
//       setLoading(false);
//       return;
//     }

//     if (params.channelname) {
//       setLoading(true);
//       const verifyClassDetails = async () => {
//         try {
//           const response = await fetch("/api/video/verify-class", {
//             method: "POST",
//             headers: {
//               "Content-Type": "application/json",
//             },
//             body: JSON.stringify({
//               id,
//               date,
//               decodedTime,
//               channelName: decodechannelName,
//             }),
//           });

//           const result = await response.json();
//           if (result.success) {
//             console.log("Class details verified:", result.document);
//             setScheduledClassId(result.document._id);
//             setIsVerified(true);
//           } else {
//             toast.error(`Verification failed: ${result.message}`);
//             console.error("Verification failed:", result.message);
//             setVerificationError(result.message);
//             setIsVerified(false);
//             setTimeout(() => {
//               window.location.href = "/";
//             }, 2000);
//           }
//         } catch (error) {
//           toast.error("Error in verifying class details.");
//           console.error("Error in verifying class details:", error);
//           setVerificationError("Error in verifying class details");
//           setIsVerified(false);
//           setTimeout(() => {
//             window.location.href = "/";
//           }, 2000);
//         } finally {
//           setLoading(false);
//         }
//       };

//       verifyClassDetails();
//     }
//   }, [params.channelname, recorder]);

//   // Spinner Component
//   const Spinner = () => (
//     <div className="flex justify-center items-center h-screen w-full">
//       <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-secondary-600"></div>
//     </div>
//   );

//   if (loading) {
//     return <Spinner />;
//   }

//   // Check access based on role
//   const canAccessCallComponent =
//     (session?.role === "student" && session?.username === username) ||
//     session?.role === "tutor"; // Allow tutors access without username check

//   if (!isVerified || !canAccessCallComponent) {
//     return (
//       <main className="flex w-full flex-col">
//         {verificationError && <p className="text-red-500">Verification failed: {verificationError}</p>}
//       </main>
//     );
//   }

//   const sanitizedChannelName = id + date + decodedTime;
//   console.log("Sanitized Channel Name:", sanitizedChannelName);

//   return (
//     <>
//       <Toaster />
//       <main className="flex w-full flex-col">
//         {/* ✅ Use Suspense inside Page instead of wrapping Page itself */}
//         <Suspense fallback={<Spinner />}>
//           <Call
//             appId={process.env.NEXT_PUBLIC_AGORA_APP_ID}
//             username={username}
//             channelName={sanitizedChannelName}
//             tutorId={id}
//             date={date}
//             time={decodedTime}
//             scheduledClassId={scheduledClassId}
//           />
//         </Suspense>
//       </main>
//     </>
//   );
// }

// export default Page;


"use client";

import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { Suspense, useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";

// Dynamically import the Call component with SSR disabled
const Call = dynamic(() => import("@/app/components/Call"), { ssr: false });

function Page({ params }) {
  const [loading, setLoading] = useState(true);
  const [scheduledClassId, setScheduledClassId] = useState("");
  const searchParams = useSearchParams();
  const [recorder, setRecorder] = useState(false);

  // ✅ Get recorder flag from both `useSearchParams()` and `window.location.search`
  useEffect(() => {
    let recorderParam = searchParams.get("recorder");

    // Fallback for local development (only runs in browser)
    if (typeof window !== "undefined" && !recorderParam) {
      const urlParams = new URLSearchParams(window.location.search);
      recorderParam = urlParams.get("recorder");
    }

    setRecorder(recorderParam === "true"); // Convert to boolean
  }, [searchParams]);

  console.log("Recorder:", recorder);

  // Decode channel name to extract ID, username, date, and time
  const decodechannelName = decodeURIComponent(params.channelname);
  const channelName = params.channelname ? params.channelname.split("_") : [];
  const id = channelName[0] || "";
  const username = channelName[1] || "";
  const date = channelName[2] || "";
  const decodedTime = decodeURIComponent(channelName[3] || "");

  useEffect(() => {
    if (recorder) {
      console.log("Recorder detected - skipping verification and session check.");
      setLoading(false);
      return;
    }

    if (params.channelname) {
      setLoading(true);
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
          } else {
            console.error("Verification failed:", result.message);
            window.location.href = "/";
          }
        } catch (error) {
          console.error("Error in verifying class details:", error);
          window.location.href = "/";
        } finally {
          setLoading(false);
        }
      };

      verifyClassDetails();
    }
  }, [params.channelname, recorder]);

  // Loading Spinner
  const Spinner = () => (
    <div className="flex justify-center items-center h-screen w-full">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-secondary-600"></div>
    </div>
  );

  if (loading) {
    return <Spinner />;
  }

  const sanitizedChannelName = id + date + decodedTime;
  console.log("Sanitized Channel Name:", sanitizedChannelName);

  return (
    <>
      <Toaster />
      <main className="flex w-full flex-col">
        {/* ✅ If recorder=true, no restrictions applied */}
        <Suspense fallback={<Spinner />}>
          <Call
            appId={process.env.NEXT_PUBLIC_AGORA_APP_ID}
            username={username}
            channelName={sanitizedChannelName}
            tutorId={id}
            date={date}
            time={decodedTime}
            scheduledClassId={scheduledClassId}
          />
        </Suspense>
      </main>
    </>
  );
}

export default Page;
