import { useCallback, useEffect, useRef, useState } from "react";
import AgoraRTC, {
  LocalVideoTrack,
  RemoteUser,
  useLocalMicrophoneTrack,
  useLocalCameraTrack,
  useRemoteUsers,
  useRemoteAudioTracks,
  useJoin,
  usePublish,
} from "agora-rtc-react";
import moment from "moment-timezone";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { createFastboard, mount } from "@netless/fastboard";
import { WhiteWebSdk } from "white-web-sdk";
import { WindowManager } from "@netless/window-manager";

function Videos(props) {
  const {
    appId,
    channelName,
    username,
    tutorId,
    date,
    time,
    logUserEvent,
    token,
    id,
    client,
    tutorUid,
    studentUid,
    setStudentUid,
    setTutorUid,
    router,
    setHasJoined,
    scheduledClassId,
    
  } = props;

  const getScheduledClassDetails=async()=>{
    try{
      const response=await fetch("/api/whiteboard/get-scheduled-class-details",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({scheduledClassId})
      });
      if(response.ok){
        const data=await response.json();
        console.log("Scheduled Class Details:",data);
          setRoomUuid(data.roomUuid);
          setRoomToken(data.roomToken);
        return data;
      }
  }catch(error){
    console.error("Failed to fetch scheduled class details:",response.statusText);
  }
  }
  getScheduledClassDetails();
  

  const fastboardRef = useRef(null);
  const whiteboardRef = useRef(null); // Reference for the whiteboard container
  // State variables
  const { isLoading: isLoadingMic, localMicrophoneTrack } =
    useLocalMicrophoneTrack();
  const { isLoading: isLoadingCam, localCameraTrack } = useLocalCameraTrack();
  const [screenTrack, setScreenTrack] = useState(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [screenClient, setScreenClient] = useState(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isWhiteboardReady, setIsWhiteboardReady] = useState(false); // To track whiteboard readiness
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [classData, setClassData] = useState(null);
  const { data: session } = useSession();
  console.log("Session: ", session);
  const [resourceId, setResourceId] = useState(null);
  const [recordingUid, setRecordingUid] = useState(null);
  const [sid, setSid] = useState(null);
  const[roomUuid,setRoomUuid]=useState(null);
  const[roomToken,setRoomToken]=useState(null);
  const [isRecording, setIsRecording] = useState(false); // Track recording state
  console.log("Room UUID:",roomUuid);
  console.log("Room Token:",roomToken);

  // Remote user tracking
  const remoteUsers = useRemoteUsers();
  const { audioTracks } = useRemoteAudioTracks(remoteUsers);

  console.log("Remote Users: ", remoteUsers);
  console.log("Class Data: ", classData);
  console.log("Scheduled Class Id: ", scheduledClassId);
  console.log("Whiteboard Ref:", whiteboardRef.current);
  const appIdentifier=process.env.NEXT_PUBLIC_APP_IDENTIFIER
  console.log("whiteboardidentifer::",appIdentifier)
 

  
    

    
  
  
  let roomInstance = useRef(null);

  // const activateWhiteboard = useCallback(async () => {
  //   if (!roomUuid || !roomToken || !whiteboardRef.current) {
  //     toast.error("Whiteboard setup incomplete");
  //     return;
  //   }

  //   try {
  //     const whiteWebSdk = new WhiteWebSdk({
  //       appIdentifier: process.env.NEXT_PUBLIC_APP_IDENTIFIER,
  //       region: "us-sv",
  //     });

  //     roomInstance.current = await whiteWebSdk.joinRoom({
  //       uuid: roomUuid,
  //       roomToken: roomToken,
  //       uid: session?.user?.email || "default_user",
  //     });

  //     roomInstance.current.bindHtmlElement(whiteboardRef.current);
  //     setIsWhiteboardReady(true);
  //     toast.success("Whiteboard activated successfully!");
  //   } catch (error) {
  //     console.error("Failed to activate whiteboard:", error);
  //     toast.error("Failed to activate whiteboard. Please try again.");
  //   }
  // }, [roomUuid, roomToken, session]);



  const activateFastboard = useCallback(async () => {
    if (!roomUuid || !roomToken || !fastboardRef.current) {
      toast.error("Fastboard setup incomplete");
      return;
    }
    // if (isWhiteboardReady) {
    //   toast.info("Fastboard is already active");
    //   return;
    // }

    try {
      // Create Fastboard instance
      const app = await createFastboard({
        sdkConfig: {
          appIdentifier: process.env.NEXT_PUBLIC_APP_IDENTIFIER,
          region: "us-sv",
        },
        joinRoom: {
          uuid: roomUuid,
          roomToken: roomToken,
          uid: session?.user?.email || "default_user", // Optional user ID
        },
        managerConfig: {
          cursor: true,
        },
      });

      // Store the instance and mount it
      roomInstance.current = app;
      mount(app, fastboardRef.current);

      setIsWhiteboardReady(true);
      toast.success("Fastboard activated successfully!");
    } catch (error) {
      console.error("Failed to activate Fastboard:", error);
      toast.error("Failed to activate Fastboard. Please try again.");
    }
  }, [roomUuid, roomToken, session]);
  
  const replayWhiteboard = async () => {
    try {
      const replay = await createFastboard({
        sdkConfig: {
          appIdentifier: process.env.NEXT_PUBLIC_APP_IDENTIFIER,
          region: "us-sv",
        },
        replayRoom: {
          uuid: roomUuid,
          roomToken: roomToken,
        },
        managerConfig: {
          cursor: true,
          
        },
      });
    
      console.log("Fastboard replay created:", replay);
    
      if (!replay || !replay.callbacks) {
        console.error("Fastboard replay is missing required properties.");
        return;
      }
    
      // Mount replay into a container
      if (fastboardRef.current) {
        mount(replay, fastboardRef.current);
        console.log("Replay started for Room UUID:", roomUuid);
      } else {
        console.error("Fastboard reference is not initialized.");
      }
    } catch (error) {
      console.error("Failed to replay Fastboard:", error.message, error.stack);
    }
    
  };
  
  

  // const activateFastboard = useCallback(async () => {
  //   if (!roomUuid || !roomToken || !fastboardRef.current) {
  //     toast.error("Fastboard setup incomplete");
  //     return;
  //   }
  
  //   try {
  //     // Create Fastboard instance
  //     const app = await createFastboard({
  //       sdkConfig: {
  //         appIdentifier: process.env.NEXT_PUBLIC_APP_IDENTIFIER,
  //         region: "us-sv",
  //       },
  //       joinRoom: {
  //         uuid: roomUuid,
  //         roomToken: roomToken,
  //         uid: session?.user?.email || "default_user", // Optional user ID
  //       },
  //       managerConfig: {
  //         cursor: true,
  //       },
  //     });
  
  //     // Mount Fastboard to the container
  //     roomInstance.current = app;
  //     mount(app, fastboardRef.current);
  
  //     // Wait for Fastboard's canvas to render
  //     const waitForCanvas = () => {
  //       return new Promise((resolve) => {
  //         const interval = setInterval(() => {
  //           const whiteboardElement = fastboardRef.current.querySelector("canvas");
  //           if (whiteboardElement && whiteboardElement.width > 0 && whiteboardElement.height > 0) {
  //             clearInterval(interval);
  //             resolve(whiteboardElement);
  //           }
  //         }, 100);
  //       });
  //     };
  
  //     const whiteboardElement = await waitForCanvas();
  
  //     // Create a custom canvas to render the whiteboard content
  //     const whiteboardCanvas = document.createElement("canvas");
  //     whiteboardCanvas.width = whiteboardElement.width;
  //     whiteboardCanvas.height = whiteboardElement.height;
  
  //     const ctx = whiteboardCanvas.getContext("2d");
  
  //     const captureWhiteboard = () => {
  //       ctx.clearRect(0, 0, whiteboardCanvas.width, whiteboardCanvas.height); // Clear the canvas
  //       ctx.drawImage(whiteboardElement, 0, 0, whiteboardCanvas.width, whiteboardCanvas.height);
  //       requestAnimationFrame(captureWhiteboard);
  //     };
  //     captureWhiteboard();
  
  //     console.log("Whiteboard Canvas Dimensions:", whiteboardCanvas.width, whiteboardCanvas.height);
          
  //     // Create a custom Agora video track from the whiteboard canvas
  //   const whiteboardTrack = AgoraRTC.createCustomVideoTrack({
  //     mediaStreamTrack: whiteboardCanvas.captureStream().getVideoTracks()[0],
  //   });

  //   // Create a new Agora client for the whiteboard track
  //   const whiteboardClient = AgoraRTC.createClient({
  //     mode: "rtc",
  //     codec: "vp8",
  //   });

  //   // Join the Agora channel with the new client
  //   await whiteboardClient.join(appId, channelName, token, null);

  //   // Publish the whiteboard track using the new client
  //   await whiteboardClient.publish(whiteboardTrack);
  
  //     setIsWhiteboardReady(true);
  //     toast.success("Fastboard activated successfully!");
  //   } catch (error) {
  //     console.error("Failed to activate Fastboard:", error);
  //     toast.error("Failed to activate Fastboard. Please try again.");
  //   }
  // }, [roomUuid, roomToken, session, client]);
  
  
  

  


// const activateWhiteboard = useCallback(async () => {
//   if (!roomUuid || !roomToken || !whiteboardRef.current) {
//     toast.error("Whiteboard setup incomplete");
//     return;
//   }

//   try {
//     // Create Fastboard instance
//     const fastboard = await createFastboard({
//       sdkConfig: {
//         appIdentifier: process.env.NEXT_PUBLIC_APP_IDENTIFIER,
//         region: "us-sv", // Region for your whiteboard
//       },
//       joinRoom: {
//         uid: session?.user?.email || "default_user",
//         uuid: roomUuid,
//         roomToken: roomToken,
//       },
//     });

//     // Mount Fastboard into the container
//     mount(fastboard, whiteboardRef.current);

//     setIsWhiteboardReady(true);
//     toast.success("Fastboard activated successfully!");
//   } catch (error) {
//     console.error("Failed to activate Fastboard:", error);
//     toast.error("Failed to activate Fastboard. Please try again.");
//   }
// }, [roomUuid, roomToken, session]);

  
  // useEffect(() => {
  //   return () => {
  //     if (roomInstance.current) {
  //       roomInstance.current.disconnect().catch((error) => {
  //         console.error("Error during whiteboard disconnection:", error);
  //       });
  //     }
  //   };
  // }, []);
      
    
    
  // Screen sharing logic
  const toggleScreenSharing = async () => {
    try {
      if (!remoteUsers.length) {
        toast.error(
          "Screen sharing is only available when there are participants in the call."
        );
        return;
      }

      if (!isScreenSharing) {
        const screenClientInstance = AgoraRTC.createClient({
          mode: "rtc",
          codec: "vp8",
        });

        await screenClientInstance.join(appId, channelName, token);

        let screenTrackInstance;
        try {
          screenTrackInstance = await AgoraRTC.createScreenVideoTrack({
            encoderConfig: "1080p_1",
            optimizationMode: "detail",
          });

          screenTrackInstance.on("track-ended", async () => {
            console.log("Screen sharing stopped.");
            await screenClientInstance.unpublish(screenTrackInstance);
            screenTrackInstance.stop();
            screenTrackInstance.close();
            await screenClientInstance.leave();
            setScreenTrack(null);
            setScreenClient(null);
            setIsScreenSharing(false);
          });
        } catch (error) {
          console.error("Error creating screen track:", error);
          await screenClientInstance.leave();
          return;
        }

        await screenClientInstance.publish(screenTrackInstance);
        setScreenTrack(screenTrackInstance);
        setScreenClient(screenClientInstance);
        setIsScreenSharing(true);
      } else {
        if (screenClient && screenTrack) {
          await screenClient.unpublish(screenTrack);
          screenTrack.stop();
          screenTrack.close();
          await screenClient.leave();
          setScreenTrack(null);
          setScreenClient(null);
          setIsScreenSharing(false);
        }
      }
    } catch (error) {
      console.error("Error toggling screen sharing:", error);
    }
  };
  useEffect(() => {
   
    const recording = async () => {
      if (session.role === "student" && studentUid !== null && !isRecording) {
        await startRecording();
        setIsRecording(true);
      }
    };
    recording();
    console.log("Recording is started: ", recording);
  }, [session, studentUid]);

  // Audio and video toggle logic
  const toggleMic = () => {
    if (localMicrophoneTrack) {
      localMicrophoneTrack.setEnabled(!isMicOn);
      setIsMicOn(!isMicOn);
    }
  };

  const toggleVideo = () => {
    if (localCameraTrack) {
      localCameraTrack.setEnabled(!isVideoOn);
      setIsVideoOn(!isVideoOn);
    }
  };

  // Join channel

  const joinUid = useJoin({
    appid: appId,
    channel: channelName,
    token: token,
  });
  console.log("Join: ", joinUid);
  const uid = joinUid.data;

  // Keep existing logic to assign tutorUid / studentUid
  if (session.role === "tutor" && joinUid.data && !tutorUid) {
    setTutorUid(joinUid.data);
  } else if (session.role === "student" && joinUid.data && !studentUid) {
    setStudentUid(joinUid.data);
    // toast(`Student UID ${joinUid.data}`)
  }

  // ===> ADDED: Log user event for the actual tutorUid / studentUid
  // This ensures we store them in the database once the correct UID is known.
  useEffect(() => {
    // If the current user is a tutor and we have an actual tutorUid, log "join"
    if (session.role === "tutor" && tutorUid) {
      logUserEvent(appId, channelName, tutorUid, "join");
    }
    // If the current user is a student and we have an actual studentUid, log "join"
    else if (session.role === "student" && studentUid) {
      logUserEvent(appId, channelName, studentUid, "join");
    }
    // Only fire once per actual assignment of tutorUid / studentUid
    // (When we get them for the first time)
  }, [session.role, tutorUid, studentUid, appId, channelName, logUserEvent]);

  // Schedule class on load
  const scheduleClasses = useCallback(async () => {
    try {
      const response = await fetch("/api/video/schedule-class", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tutorId,
          username,
          date,
          time,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setClassData(data?.scheduledClass || {});
      } else {
        console.error("Failed to schedule class:", response.statusText);
      }
    } catch (error) {
      console.error("Error scheduling class:", error);
    }
  }, [tutorId, username, date, time]);

  useEffect(() => {
    scheduleClasses();
  }, [scheduleClasses]);

  // Periodic participant checks
  useEffect(() => {
    if (!classData || !classData.timeslot) return;

    const timezone = classData.timeslot.timezone;
    const classdate = classData.timeslot.date;
    const classtime = classData.timeslot.time;

    const timezoneMap = {
      Alaska: "America/Anchorage",
      Hawaii: "Pacific/Honolulu",
      Eastern: "America/New_York",
      Central: "America/Chicago",
      Mountain: "America/Denver",
      Pacific: "America/Los_Angeles",
    };

    const classTimezone = timezoneMap[timezone?.trim()];

    if (!classTimezone) {
      console.error("Invalid timezone.");
      return;
    }

    const classEndTime = moment.tz(
      `${classdate} ${classtime.split(" - ")[1]}`,
      "MM-DD-YYYY HH:mm",
      classTimezone
    );

    const checkParticipants = async () => {
      try {
        const currentTimestamp = moment.tz(classTimezone);
        if (currentTimestamp.isSameOrAfter(classEndTime)) {
          const tutorResponse = await fetch("/api/video/check-participants", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ channelName, type: "tutor" }),
          });

          const studentResponse = await fetch("/api/video/check-participants", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ channelName, type: "student" }),
          });

          const tutorResult = await tutorResponse.json();
          const studentResult = await studentResponse.json();

          if (tutorResult.success && !studentResult.hasJoined) {
            toast.error(
              " Class Time has Ended and the student has left the call. Ending the call..."
            );
            router.push("/");
            toggleMic();
            toggleVideo();
          }
        }
      } catch (error) {
        console.error("Error checking participants:", error);
      }
    };

    const interval = setInterval(checkParticipants, 60000);
    checkParticipants();

    return () => clearInterval(interval);
  }, [classData, channelName]);

  usePublish([localMicrophoneTrack, localCameraTrack]);
  audioTracks.map((track) => track.play());

  const toggleEndCall = async () => {
    const toastId = toast.loading("Starting to end the call process..");
    if (isRecording || session.role === "tutor") {
      // toast.loading("Stopping the recording", { id: toastId });
      console.log("Stopping recording...");
      await stopRecording(toastId); // Call the API to stop recording
      await replayWhiteboard();
      setIsRecording(false); // Update the recording state
      // toast.loading("Recording Stopped..", { id: toastId });
    }

    toast.loading("Ending the call...", { id: toastId });
    try {
      await logUserEvent(appId, channelName, id, "leave");

      if (localCameraTrack) {
        localCameraTrack.stop();
        localCameraTrack.close();
      }

      if (localMicrophoneTrack) {
        localMicrophoneTrack.stop();
        localMicrophoneTrack.close();
      }

      if (isScreenSharing && screenClient && screenTrack) {
        await screenClient.unpublish(screenTrack);
        screenTrack.stop();
        screenTrack.close();
        await screenClient.leave();
        setScreenTrack(null);
        setScreenClient(null);
        setIsScreenSharing(false);
      }

      await client.leave();
      setHasJoined(false);
      // toast.success("Left the call successfully!");
      toast.success("Left the call successfully. Beginning to redirect..🚀", {
        id: toastId,
      });
      setTimeout(() => {
        router.push(
          session?.role === "tutor"
            ? "/"
            : `/student/add-tutor-review?tutorId=${tutorId}`
        );
      }, 2000);
    } catch (error) {
      console.error("Failed to leave the call:", error);
      toast.error("Error while leaving the call successfully.", {
        id: toastId,
      });
    }
  };

  const startRecording = async () => {
    if (!uid) {
      console.error("UID is null or undefined");
      toast.error("Failed to retrieve UID. Please try again.");
      return;
    }

    try {
      const response = await fetch("/api/video/accquire-recording", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scheduledClassId: scheduledClassId,
          channelName: channelName,
          uid,
          token: token,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to acquire recording resource");
      }

      const acquireData = await response.json();
      console.log("Recording resource acquired:", acquireData);
      let resourceId = acquireData.resourceId;
      setResourceId(acquireData.resourceId);
      setRecordingUid(acquireData.uid);
      const startResponse = await fetch(
        "/api/video/recording/start-recording",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
             "ngrok-skip-browser-warning": "69420"
          },
          
          body: JSON.stringify({
            scheduledClassId: scheduledClassId,
            channelName: channelName,
            uid: acquireData.uid,
            resourceId,
            token: token,
          }),
        }
      );

      if (!startResponse.ok) {
        throw new Error("Failed to start recording");
      }

      const data = await startResponse.json();
      setSid(data.startResponse.sid);
      // console.log('Recording:    UID from join::', startUID)
      console.log("Recording started:", data);
      toast.success("Recording started successfully!");
    } catch (error) {
      console.error("Error starting recording:", error.message);
      toast.error(`Error starting recording: ${error.message}`);
    }
  };

  const querRecording = async () => {
    if (isQuerying) return;

    setIsQuerying(true);
    const toastId = toast.loading("Querying recording status...");
    try {
      const queryResponse = await fetch("/api/queryRecording", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          channelName: "test_channel",
          uid: recordingUid,
          resourceId,
          sid,
        }),
      });

      if (queryResponse.ok) {
        const data = await queryResponse.json();
        console.log("Recording Query Response:", data);
        toast.success("Recording status queried successfully!", {
          id: toastId,
        });
      } else {
        console.error("Failed to query recording status");
        toast.error("Failed to query recording status", { id: toastId });
      }
    } catch (error) {
      console.error("Error querying recording status:", error.message);
      toast.error("Error querying recording status", { id: toastId });
    } finally {
      setIsQuerying(false);
    }
  };

  const stopRecording = async (toastId) => {
    // if (!uid) {
    //   console.error("UID is null or undefined");
    //   toast.error("Failed to retrieve UID. Please try again.");
    //   return;
    // }

    // if (!resourceId || !sid) {
    //   console.error("Resource ID or SID is missing");
    //   toast.error("Unable to stop recording. Please try again.");
    //   return;
    // }
    toast.loading("Stopping the Recording...", { id: toastId });
    try {
      const response = await fetch("/api/video/recording/stop-recording", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scheduledClassId: scheduledClassId,
          // channelName: channelName,
          // uid: recordingUid,
          // resourceId,
          // sid,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to stop recording");
      }

      console.log("Recording stopped:", await response.json());
      toast.success("Recording stopped successfully!", { id: toastId });
    } catch (error) {
      console.error("Error stopping recording:", error.message);
      toast.error(`Error stopping recording: ${error.message}`, {
        id: toastId,
      });
    }
  };
  const deviceLoading = isLoadingMic || isLoadingCam;
  if (deviceLoading)
    return (
      <div className="h-screen flex items-center justify-center">
        Loading devices...
      </div>
    );

  return (
    <>
      <div className="flex flex-row w-full h-screen items-center justify-center">
        {remoteUsers.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl bg-gray-200 w-[90%] h-[90%]">
            <LocalVideoTrack
              track={localCameraTrack}
              play
              className="object-cover"
            />
          </div>
        ) : remoteUsers.length === 1 ? (
          <div className="relative flex flex-col md:flex-row w-full items-center justify-center h-screen">
            <div className="flex flex-col items-center rounded-2xl overflow-hidden h-[90%] w-[90%]">
              <LocalVideoTrack
                track={localCameraTrack}
                play
                className="object-cover w-full h-full"
              />
            </div>
            <div className="absolute bottom-7 right-6 md:right-12 md:bottom-9 lg:right-20 w-[100px] h-[150px] md:w-[300px] md:h-[200px] rounded-2xl overflow-hidden">
              <RemoteUser
                key={remoteUsers[0].uid}
                user={remoteUsers[0]}
                className="object-cover w-full h-full"
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-row w-[90%] h-[96%]">
            <div className="w-[70%] h-[80%]">
              {remoteUsers[1] && (
                <RemoteUser
                  key={remoteUsers[1].uid}
                  user={remoteUsers[1]}
                  className="rounded-xl object-cover"
                />
              )}
            </div>
            <div className="w-[30%] flex flex-col h-[80%]">
              <LocalVideoTrack
                track={localCameraTrack}
                play
                className="w-full h-[30%] border-8 rounded-[20px] m-4 border-red-400 object-cover"
              />
              {remoteUsers[0] && (
                <RemoteUser
                  key={remoteUsers[0].uid}
                  user={remoteUsers[0]}
                  className="w-full h-[30%] border-8 rounded-[20px] m-4 border-blue-400 object-cover"
                />
              )}
              {remoteUsers[2] && (
                <RemoteUser
                  key={remoteUsers[2].uid}
                  user={remoteUsers[2]}
                  className="w-full h-[30%] border-8 rounded-[20px] m-4 border-blue-400 object-cover"
                />
              )}
            </div>
          </div>
        )}
        {/* Whiteboard Section */}
        {/* {isWhiteboardReady ? (
      <div className="w-1/4 h-full bg-white border-l-2 border-gray-300">
        <h3 className="text-center text-lg font-bold my-2">
          Collaborative Whiteboard
        </h3>
        <div
          ref={whiteboardRef}
          className={`w-full h-[90%] ${
            isWhiteboardReady ? "bg-gray-100" : "bg-red-100"
          }`}
        >
          {isWhiteboardReady ? (
            ""
          ) : (
            <p className="text-center mt-4 text-gray-500">Loading whiteboard...</p>
          )}
        </div>
      </div>
      ):(
        null
      )
    } */}
    <div className="w-1/2 h-full  bg-white border-l-2 border-gray-300">
    <h3 className="text-center text-lg font-bold my-2">Collaborative Whiteboard</h3>
    <div
      ref={fastboardRef}
      id="whiteboard-container"
      className="w-full h-[90%]  bg-[green]"
    ></div>
    <button
      className={`bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg ${
        isWhiteboardReady ? "opacity-50 cursor-not-allowed" : ""
      }`}
      onClick={activateFastboard} >
    
      Activate Whiteboard
    </button>
  </div>
      </div>
    

      

      <div className="flex justify-center p-3 space-x-8">
        <div
          className="w-[50px] h-[50px] bg-[#4ABABE] rounded-2xl p-2"
          onClick={toggleScreenSharing}
        >
          {/* SVG for screen sharing */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
          >
            <path
              d="M16.0053 9.4V28M8 17.3333L16 9.33333L24 17.3333M8 4H24"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div
          className="w-[50px] h-[50px] bg-[#F1C64B] rounded-2xl p-2"
          onClick={toggleMic}
        >
          {/* SVG for mic toggle */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
          >
            <path
              d="M16 18.6665C18.2133 18.6665 20 16.8798 20 14.6665V6.6665C20 4.45317 18.2133 2.6665 16 2.6665C13.7867 2.6665 12 4.45317 12 6.6665V14.6665C12 16.8798 13.7867 18.6665 16 18.6665Z"
              fill="white"
            />
            <path
              d="M22.6666 14.6665C22.6666 18.3465 19.68 21.3332 16 21.3332C12.32 21.3332 9.33329 18.3465 9.33329 14.6665H6.66663C6.66663 19.3732 10.1466 23.2398 14.6666 23.8932V27.9998H17.3333V23.8932C21.8533 23.2398 25.3333 19.3732 25.3333 14.6665H22.6666Z"
              fill="white"
            />
          </svg>
        </div>
        <div
          className="w-[50px] h-[50px] bg-[#F1C64B] rounded-2xl p-2"
          onClick={toggleVideo}
        >
          {/* SVG for video toggle */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
          >
            <path
              d="M6.66667 7.3335C5.69421 7.3335 4.76158 7.7198 4.07394 8.40744C3.38631 9.09507 3 10.0277 3 11.0002V21.0002C3 21.9726 3.38631 22.9053 4.07394 23.5929C4.76158 24.2805 5.69421 24.6668 6.66667 24.6668H18C18.9725 24.6668 19.9051 24.2805 20.5927 23.5929C21.2804 22.9053 21.6667 21.9726 21.6667 21.0002V18.8748L26.2253 22.9348C27.2987 23.8908 29 23.1282 29 21.6895V9.82016C29 8.38016 27.2987 7.61883 26.2253 8.57483L21.6667 12.6348V11.0002C21.6667 10.0277 21.2804 9.09507 20.5927 8.40744C19.9051 7.7198 18.9725 7.3335 18 7.3335H6.66667Z"
              fill="white"
            />
          </svg>
        </div>
        <div
          className="w-[50px] h-[50px] bg-[#CC331F] rounded-2xl p-2"
          onClick={toggleEndCall}
        >
          {/* SVG for end call */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="34"
            viewBox="0 0 32 34"
            fill="none"
          >
            <path
              d="M8.82667 14.8506C10.7467 18.7457 13.84 21.9388 17.6133 23.9207L20.5467 20.8928C20.92 20.5074 21.44 20.3973 21.9067 20.5487C23.4 21.0579 25 21.3332 26.6667 21.3332C27.0203 21.3332 27.3594 21.4782 27.6095 21.7363C27.8595 21.9944 28 22.3445 28 22.7096V27.5268C28 27.8918 27.8595 28.2419 27.6095 28.5C27.3594 28.7581 27.0203 28.9031 26.6667 28.9031C20.6551 28.9031 14.8897 26.438 10.6389 22.05C6.38809 17.6621 4 11.7107 4 5.50525C4 5.14022 4.14048 4.79014 4.39052 4.53203C4.64057 4.27391 4.97971 4.12891 5.33333 4.12891H10C10.3536 4.12891 10.6928 4.27391 10.9428 4.53203C11.1929 4.79014 11.3333 5.14022 11.3333 5.50525C11.3333 7.22568 11.6 8.87729 12.0933 10.4188C12.24 10.9005 12.1333 11.4373 11.76 11.8227L8.82667 14.8506Z"
              fill="white"
            />
          </svg>
        </div>
        <div>
           {/* Activate Whiteboard Button */}
        
        </div>

        {/* {session.role === "student" &&  (
          <div>
        <button
        onClick={startRecording}
        className="bg-[yellow] hover:bg-yellow-300 rounded-lg px-4 py-2 mr-2"
      >
        Start Recording
      </button>
      <button
        onClick={stopRecording}
        className="bg-[yellow] hover:bg-yellow-300 rounded-lg px-4 py-2 mr-2"
      >
        Stop Recording
      </button>
      </div>
        )} */}
      </div>
    </>
  );
}

export default Videos;
