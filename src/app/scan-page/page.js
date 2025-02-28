"use client";
import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import React from 'react';

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
      const sameCamera = frontCamera
        ? frontCamera.deviceId
        : backCamera?.deviceId;

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
  // Function to scan the QR code from the video feed
  const scanQRCode = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (!canvas || !video) {
      console.log("Canvas or video element is not available");
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      console.log("Canvas context is not available");
      return;
    }

    //  Fix: Ensure video is playing before scanning
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      console.log("Video not ready yet, skipping scan...");
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, canvas.width, canvas.height);

    if (code) {
      console.log("QR Code Detected:", code.data);
      if (scannedData !== code.data) {
        setScannedData(code.data);
      }
    } else {
      console.log("No QR Code Detected");
    }
  };

  useEffect(() => {
    if (!currentStream) return;

    // Wait for the video to load before starting scanning
    videoRef.current.onloadedmetadata = () => {
      console.log("Video metadata loaded, starting scanning...");
      setTimeout(() => scanQRCode(), 500); // Small delay to ensure video is ready
    };

    const interval = setInterval(scanQRCode, 300);
    return () => clearInterval(interval);
  }, [currentStream]); // Run whenever stream updates

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
        </div>
      )}

      {scannedData && (
        <div style={{ marginTop: "10px" }}>
          <h2>Scanned Data:</h2>
          <h1>{scannedData}</h1>
          <a href={scannedData}>Click here</a>
        </div>
      )}

      <button
        onClick={toggleCamera}
        style={{
          marginTop: "10px",
          padding: "10px",
          background: "#007bff",
          color: "#fff",
          border: "none",
          cursor: "pointer",
        }}
      >
        Switch Camera
      </button>

      {/* Canvas (hidden) for scanning */}
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
};

export default CameraScanner;