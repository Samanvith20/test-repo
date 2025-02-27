"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FaArrowLeft, FaCamera } from "react-icons/fa";
export default function ScanPage() {
  const [capturedImage, setCapturedImage] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const router = useRouter();
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      navigator?.mediaDevices?.getUserMedia
    ) {
      const startCamera = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" }, // Rear camera
          });
          const videoElement = videoRef.current;
          if (videoElement) {
            videoElement.srcObject = stream;
            setCameraActive(true);
          }
        } catch (error) {
          console.error("Camera access denied:", error);
          setErrorMessage(
            "Camera not available. Please allow camera permissions."
          );
          setCameraActive(false);
        }
      };
      startCamera();
    } else {
      console.log(
        "navigator.mediaDevices is not supported in this environment"
      );
      setErrorMessage("Camera not supported in this browser.");
    }
    return () => {
      const videoElement = videoRef.current; // Store ref in a variable
      if (videoElement && videoElement.srcObject) {
        let tracks = videoElement.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);
  // :camera_with_flash: Capture Image from Camera
  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(
        videoRef.current,
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );
      setCapturedImage(canvasRef.current.toDataURL("image/png"));
    }
  };
  return (
    <div className="relative w-full h-screen flex flex-col items-center justify-center bg-black">
      {/* Camera Background */}
      {cameraActive ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute w-full h-full bg-black flex items-center justify-center text-white">
          {errorMessage || "Camera not available"}
        </div>
      )}
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="absolute top-5 left-5 bg-gray-200 p-2 rounded-full shadow-md flex items-center justify-center"
      >
        <FaArrowLeft className="w-6 h-6 text-gray-800" />
      </button>
      {/* Scan Box with Only Corners */}
      <div className="relative w-40 h-40 flex justify-center items-center">
        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white"></div>
        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white"></div>
      </div>
      {/* Capture Button */}
      {cameraActive && (
        <button
          onClick={captureImage}
          className="absolute bottom-10 bg-white text-black px-4 py-2 rounded-full flex items-center"
        >
          <FaCamera className="w-6 h-6 mr-2" />
          Capture Image
        </button>
      )}
      {/* Canvas to Capture Image */}
      <canvas ref={canvasRef} className="hidden" />
      {/* Show Captured Image Using Next.js Image Component */}
      {capturedImage && (
        <div className="absolute top-20 bg-white p-4 rounded-lg shadow-lg">
          <Image
            src={capturedImage}
            alt="Captured"
            width={160}
            height={160}
            className="rounded-lg object-cover"
            priority
          />
        </div>
      )}
    </div>
  );
}






