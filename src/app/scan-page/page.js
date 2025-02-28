// "use client"
// import React, { useState } from "react";
// import Webcam from "react-webcam";

// const FACING_MODE_USER = "user";
// const FACING_MODE_ENVIRONMENT = "environment";

// export default function WebcamCapture() {
//   const webcamRef = React.useRef(null);
//   const [image, setImage] = useState("");

//   const [facingMode, setFacingMode] = React.useState(FACING_MODE_USER);
// console.log("facing",facingMode)
//   const capture = React.useCallback(() => {
//     const imageSrc = webcamRef.current.getScreenshot();
//     setImage(imageSrc);
//   }, [webcamRef]);

//   let videoConstraints = {
//     facingMode: facingMode,
//     width: 270,
//     height: 480
//   };

//   const handleClick = React.useCallback(() => {
//     setFacingMode((prevState) =>
//       prevState === FACING_MODE_USER
//         ? FACING_MODE_ENVIRONMENT
//         : FACING_MODE_USER
//     );
//   }, []);

//   console.log(facingMode + videoConstraints);

//   return (
//     <>
//       <div className="webcam-container">
//         <div className="webcam-img">
//           {image === "" ? (
//             <Webcam
//               className="webcam"
//               audio={false}
//               ref={webcamRef}
//               screenshotFormat="image/jpeg"
//               videoConstraints={videoConstraints}
//               screenshotQuality={1}
//             />
//           ) : (
//             <img
//               src={image}
//               alt="Scan"
//               style={{ width: "500px", height: "auto" }}
//             />
//           )}
//         </div>
//         <button onClick={handleClick}>Switch camera</button>
//       </div>
//     </>
//   );
// }







"use client";
import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr"; // Importing jsQR library for QR code scanning
const Spinner = () => (
  <div className="w-full flex justify-center items-center h-[400px]">
    <div className="w-[70px] h-[70px] border-t-[4px] border-b-[4px] border-[#172554] rounded-[50%] animate-spin"></div>
  </div>
);
const CameraScanner = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraError, setCameraError] = useState("");
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [frontCamera, setFrontCamera] = useState(null);
  const [backCamera, setBackCamera] = useState(null); // Added missing state
  const [isBackCamera, setIsBackCamera] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentStream, setCurrentStream] = useState(null);
  const [scannedData, setScannedData] = useState(null);
  const [scanning, setScanning] = useState(false);
  // Function to get the video stream for a specific camera device
  const getCameraStream = async (deviceId) => {
    try {
      setLoading(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: deviceId } },
      });
      return stream;
    } catch (err) {
      console.error("Error accessing camera:", err);
      setCameraError("Could not access the camera.");
      return null;
    }
  };
  useEffect(() => {
    const startCamera = async () => {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          await navigator.mediaDevices.getUserMedia({ video: true }); // Request camera permission
          const devices = await navigator.mediaDevices.enumerateDevices();
          console.log("Detected devices:", devices);
          const videoDevices = devices.filter(
            (device) => device.kind === "videoinput"
          );
          console.log("Video devices:", videoDevices);
          if (videoDevices.length === 0) {
            setCameraError("No video devices found.");
            return;
          }
          let backCam = videoDevices.find((device) =>
            device.label.toLowerCase().includes("back")
          );
          let frontCam = videoDevices.find((device) =>
            device.label.toLowerCase().includes("front")
          );
          console.log("Front Camera:", frontCam || "Not Found");
          console.log("Back Camera:", backCam || "Not Found");
          // If no labeled front/back camera is found, use the first available camera
          if (!backCam && !frontCam) {
            console.warn(
              "No labeled front/back camera found. Using default camera."
            );
            backCam = videoDevices[0]; // Pick the first available camera
          }
          // Store cameras in state
          setFrontCamera(frontCam);
          setBackCamera(backCam);
          const selectedCam = backCam ? backCam.deviceId : frontCam?.deviceId;
          setSelectedCamera(selectedCam);
          setIsBackCamera(!!backCam); // Set the initial state to back camera if available
          // Start video stream
          const stream = await getCameraStream(selectedCam);
          if (stream) {
            videoRef.current.srcObject = stream;
            setCurrentStream(stream);
          }
          setLoading(false);
        } catch (err) {
          console.error("Error accessing camera:", err);
          setCameraError("Could not access the camera.");
        }
      } else {
        setCameraError("Camera not supported in this browser.");
      }
    };
    startCamera();
    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);
  // Fixed Camera Switching Logic
  const toggleCamera = async () => {
    if (!currentStream) {
      setCameraError("No active camera stream to switch.");
      return;
    }
    // Stop the current stream before switching
    currentStream.getTracks().forEach((track) => track.stop());
    // If there is only one camera, restart the same camera instead of showing an error
    if (!frontCamera || !backCamera) {
      console.warn("Only one camera available. Restarting the same camera.");
      const sameCamera = frontCamera ? frontCamera.deviceId : backCamera?.deviceId;
      if (!sameCamera) {
        setCameraError("No camera found.");
        return;
      }
      // Restart the same camera
      const newStream = await getCameraStream(sameCamera);
      if (newStream) {
        videoRef.current.srcObject = newStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
        };
        setCurrentStream(newStream);
        setIsBackCamera(!isBackCamera); // Flip state even if same camera
        setCameraError(""); // Clear any previous error message
      } else {
        setCameraError("Failed to restart camera.");
      }
      return;
    }
    // **Switch between front and back cameras normally**
    const newCamera = isBackCamera ? frontCamera.deviceId : backCamera.deviceId;
    console.log("Switching to Camera:", newCamera);
    const newStream = await getCameraStream(newCamera);
    if (newStream) {
      videoRef.current.srcObject = newStream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current.play();
      };
      setCurrentStream(newStream);
      setIsBackCamera((prev) => !prev); // Fix: Ensures proper toggling
      setCameraError(""); // Clear any error message
    } else {
      setCameraError("Failed to switch camera.");
    }
  };
  return (
    <div className="relative text-center p-5">
      <h1>Camera Scanner</h1>
      {cameraError ? (
        <div className="text-[red]">{cameraError}</div>
      ) : (
        <div className="flex justify-center items-center relative">
          <video
            className="w-full max-w-[xl] z-10"
            ref={videoRef}
            autoPlay
            playsInline
          />
          {loading && <p>Loading camera...</p>}
        </div>
      )}
      <button
        onClick={toggleCamera}
        style={{
          marginTop: "10px",
          padding: "10px",
          background: "#007BFF",
          color: "#fff",
          border: "none",
          cursor: "pointer",
        }}
      >
        Switch Camera
      </button>
    </div>
  );
};
export default CameraScanner;