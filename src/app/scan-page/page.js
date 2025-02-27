"use client"
import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
const CameraScanner = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [scannedData, setScannedData] = useState("");
  const [cameraError, setCameraError] = useState("");
  const [currentStream, setCurrentStream] = useState(null);  // Store the current stream
  const [isBackCamera, setIsBackCamera] = useState(true); // Start with back camera by default
  // Function to get the camera stream (either front or back camera)
  const getCameraStream = async (deviceId) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId },
      });
      return stream;
    } catch (err) {
      console.error("Error accessing camera: ", err);
      setCameraError("Could not access the camera. Please check permissions.");
      return null;
    }
  };
  useEffect(() => {
    const startCamera = async () => {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const backCamera = devices.find(device => device.kind === 'videoinput' && device.facing === 'environment');
          const frontCamera = devices.find(device => device.kind === 'videoinput' && device.facing === 'user');
          // Default to back camera
          if (backCamera) {
            const stream = await getCameraStream(backCamera.deviceId);
            if (stream) {
              videoRef.current.srcObject = stream;
              videoRef.current.play();
              setIsBackCamera(true); // Set back camera as default
              setCurrentStream(stream);
            }
          } else if (frontCamera) {
            const stream = await getCameraStream(frontCamera.deviceId);
            if (stream) {
              videoRef.current.srcObject = stream;
              videoRef.current.play();
              setIsBackCamera(false); // Set front camera as fallback
              setCurrentStream(stream);
            }
          } else {
            throw new Error("No camera found");
          }
        } catch (err) {
          console.error("Error accessing camera: ", err);
          setCameraError("Could not access the camera.");
        }
      } else {
        setCameraError("Camera not supported in this browser.");
      }
    };
    startCamera();
    return () => {
      if (currentStream) {
        const tracks = currentStream.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [currentStream]);
  const scanQRCode = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext("2d");
    if (context && video) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, canvas.width, canvas.height);
      if (code) {
        setScannedData(code.data);
        setScanning(false); // stop scanning after a successful scan
      } else {
        setScannedData("");
      }
    }
  };
  useEffect(() => {
    if (scanning) {
      const interval = setInterval(scanQRCode, 500); // Scan every 500ms
      return () => clearInterval(interval);
    }
  }, [scanning]);
  const toggleCamera = async () => {
    if (currentStream) {
      const tracks = currentStream.getTracks();
      tracks.forEach(track => track.stop()); // Stop the current stream
    }
    const devices = await navigator?.mediaDevices?.enumerateDevices();
    const backCamera = devices?.find(device => device?.kind === 'videoinput' && device?.facing === 'environment');
    const frontCamera = devices?.find(device => device?.kind === 'videoinput' && device?.facing === 'user');
    let newStream = null;
    if (isBackCamera && frontCamera) {
      newStream = await getCameraStream(frontCamera.deviceId);
      setIsBackCamera(false); // Switch to front camera
    } else if (!isBackCamera && backCamera) {
      newStream = await getCameraStream(backCamera.deviceId);
      setIsBackCamera(true); // Switch to back camera
    }
    if (newStream) {
      videoRef.current.srcObject = newStream;
      videoRef.current.play();
      setCurrentStream(newStream);
    }
  };
  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>Camera Scanner</h1>
      {cameraError ? (
        <div style={{ color: "red" }}>{cameraError}</div>
      ) : (
        <video ref={videoRef} style={{ width: "100%", maxWidth: "600px" }} />
      )}
      <canvas ref={canvasRef} style={{ display: "none" }} />
      {scannedData && (
        <div>
          <h3>Scanned Data:</h3>
          <p>{scannedData}</p>
        </div>
      )}
      <p>{isBackCamera ? "Using Back Camera" : "Using Front Camera"}</p>
      <button onClick={() => setScanning(true)}>Start Scanning</button>
      <button onClick={toggleCamera} style={{ marginTop: "10px" }}>
        Toggle Camera
      </button>
    </div>
  );
};
export default CameraScanner;






