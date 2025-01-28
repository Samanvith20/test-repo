"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import AgoraRTC, { AgoraRTCProvider } from "agora-rtc-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Videos from "./Videos";




function Call(props) {
  const client = useRef(AgoraRTC.createClient({ codec: "vp8", mode: "rtc" }));
  const [token, setToken] = useState(null);
  console.log("token:::",token);
  const { data: session } = useSession();
  const [uid, setUid] = useState(null);
  const [studentUid, setStudentUid] = useState(null);
  const [tutorUid, setTutorUid] = useState(null);
  const [hasJoined, setHasJoined] = useState(false);
  const [whiteboardData, setWhiteboardData] = useState(null); // For whiteboard roomUuid and roomToken
  const [loading, setLoading] = useState(true);
  const[sdktoken,setsdkToken]=useState(null);
  console.log("sdk token in call", sdktoken);
  const router = useRouter();

  // useEffect(() => {
  //   if (session?.role === "tutor") {
  //     client.current.setClientRole("host");
  //   } else {
  //     client.current.setClientRole("audience");
  //   }
  // }, [session]);

  const logUserEvent = useCallback(
    async (appId, channelName, uid, action) => {
      if (!uid) return;
  
      const userId = session.id;
      const role = session.role;
  
      try {
        // Check the last actions for both tutor and student roles
        const response = await fetch("/api/video/check-last-action", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ channelName, userId }),
        });
  
        const lastActionData = await response.json();
        const lastTutorAction = lastActionData?.lastTutorAction;
        const lastStudentAction = lastActionData?.lastStudentAction;
  
        // Check if the current action for the role is already logged
        if (
          (role === "tutor" && lastTutorAction === action) ||
          (role === "student" && lastStudentAction === action)
        ) {
          console.log(`Action "${action}" already logged for role: ${role}.`);
          return; // Prevent duplicate logging
        }
  
        // Log the new action
        await fetch("/api/video/user-events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            scheduledClassId: props.scheduledClassId,
            appId,
            channelName,
            userId,
            role,
            uid,
            tutorUid, // Include tutorUid
            studentUid, // Include studentUid
            action,
          }),
        });
  
        console.log(`User ${action} event logged successfully.`);
      } catch (error) {
        console.error(`Failed to log user event (${action}):`, error);
        toast.error(`Failed to log user event: ${error.message}`);
      }
    },
    [session, tutorUid, studentUid]
  );
  

  const fetchToken = async () => {
    // if(!token &&session.role==="student"){
    //   toast.error("Tutor has not joined the call yet. Please wait.");
    //   return router.push("/");
    // }
    if (!session || !props.appId || !props.channelName || token ) return; 
    try {
      const uniqueUid = `${session.id}-${session.role}`;
      setUid(uniqueUid);
      const response = await fetch("/api/video/generate-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheduledClassId: props.scheduledClassId,
          channelName: props.channelName,
          uid: uniqueUid,
          role: session.role,
          tutorId: props.tutorId,
          date: props.date,
          time: props.time,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Token fetch failed");
      }
      const data = await response.json();
      setToken(data.token);
       
         
      if (!hasJoined) {
        await logUserEvent(props.appId, props.channelName, uniqueUid, "join");
        setHasJoined(true);

      }
    } catch (error) {
      console.error("Failed to fetch token:", error);
      toast.error(`Error fetching token: ${error.message}`);
      router.push("/");
    }
  };

  const fetchsdkToken = async () => {
    if(sdktoken) return;
    try {
      const response = await fetch("/api/whiteboard/generate-sdk-token", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch whiteboard data");
      }
  
      const data = await response.json();
      setsdkToken(data);
      console.log("sdk token", data);
    } catch (error) {
      console.error("Failed to fetch whiteboard data:", error);
      toast.error(`Error: ${error.message}`);
      router.push("/");
    }

  }

  


  const fetchWhiteboardData = async () => {
    if (whiteboardData || !sdktoken) return;
  
    try {
      console.log("Fetching whiteboard data...");
      const response = await fetch
      (
        `/api/whiteboard/create-room?scheduledClassId=${props.scheduledClassId}&sdktoken=${sdktoken}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch whiteboard data");
      }
  
      const data = await response.json();
      setWhiteboardData(data);
      console.log("Whiteboard Data:", data);
    } catch (error) {
      console.error("Failed to fetch whiteboard data:", error);
      toast.error(`Error: ${error.message}`);
      router.push("/");
    }
  };
  

  useEffect(() => {
     
    const handleJoining = async () => {
      // Check if the student can join
      if (session.role === "student") {
        try {
          const response = await fetch("/api/video/classexists", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ channelName: props.channelName }),
          });
  
          const tutorCheck = await response.json();
          console.log("Tutor Check Response:", tutorCheck);
  
          if (!tutorCheck.success) {
            toast.error("Tutor has not joined the call yet. Please wait.");
            router.push("/");
            return; // Exit early if the tutor is not present
          }
  
          console.log("Student can join the session.");
        } catch (error) {
          console.error("Error during student joining:", error);
          toast.error("An error occurred while checking tutor status.");
          return; // Exit early if an error occurs
        }
      }
      await fetchsdkToken();
  
      // If student joining is successful or role is tutor, proceed with fetching token
      await fetchToken();
  
      // Fetch whiteboard data only for tutors
      if (session.role === "tutor") {
        await fetchWhiteboardData();
      }
    };
  
    handleJoining();
  }, [session, props.appId, props.channelName]);

  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (uid) {
        await logUserEvent(props.appId, props.channelName, uid, "leave");
        client.current.leave();
        setHasJoined(false);
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [uid, props.appId, props.channelName, client, logUserEvent]);

  useEffect(() => {
    if (token) {
      setLoading(false);
    }
  }, [token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen w-full">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-secondary-600"></div>
      </div>
    );
  }

  return (
    <AgoraRTCProvider client={client.current}>
      <Videos
        channelName={props.channelName}
        username={props.username}
        tutorId={props.tutorId}
        date={props.date}
        time={props.time}
        appId={props.appId}
        token={token}
        id={uid}
        // whiteboardData={whiteboardData} // Pass whiteboard data
        logUserEvent={logUserEvent}
        client={client.current}
        router={router}
        studentUid={studentUid}
        tutorUid={tutorUid}
        setStudentUid={setStudentUid}
        setTutorUid={setTutorUid}
        setHasJoined={setHasJoined}
        scheduledClassId={props.scheduledClassId}
      />
    </AgoraRTCProvider>
  );
}

export default Call;
