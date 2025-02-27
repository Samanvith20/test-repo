"use client"
import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
const CameraScanner = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [scannedData, setScannedData] = useState("");
  const [cameraError, setCameraError] = useState("");
  useEffect(() => {
    const startCamera = async () => {
      // Check if mediaDevices and getUserMedia are available
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          // Get all available devices
          const devices = await navigator.mediaDevices.enumerateDevices();
          console.log("Detected devices:", devices);
          // Filter for video input devices (cameras)
          const videoDevices = devices.filter(device => device.kind === 'videoinput');
          if (videoDevices.length === 0) {
            console.error("No video devices found");
            setCameraError("No camera found");
            return;
          }
          // Find the back camera (facing 'environment')
          const backCamera = devices.find(device => device.kind === 'videoinput' );
          console.log("back",backCamera)
          // If back camera is found, use it
          if (backCamera) {
            console.log("Using Back Camera");
            const stream = await navigator.mediaDevices.getUserMedia({
              video: { deviceId: backCamera.deviceId },
            });
            videoRef.current.srcObject = stream;
            videoRef.current.play();
            setScanning(true);
          } else if (frontCamera) {
            console.log("Using Front Camera");
            const stream = await navigator.mediaDevices.getUserMedia({
              video: { deviceId: frontCamera.deviceId },
            });
            videoRef.current.srcObject = stream;
            videoRef.current.play();
            setScanning(true);
          } else {
            setCameraError("No suitable camera found.");
            console.log("No suitable camera found.");
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
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);
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
      <button onClick={() => setScanning(true)}>Start Scanning</button>
    </div>
  );
};
export default CameraScanner;









