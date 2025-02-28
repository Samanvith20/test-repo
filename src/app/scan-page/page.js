import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";  // Importing jsQR library for QR code scanning
const Spinner = () => (
  <div className="w-full flex justify-center items-center h-[400px]">
    <div className="w-[70px] h-[70px] border-t-[4px] border-b-[4px] border-[#172554] rounded-[50%] animate-spin"></div>
  </div>
);
const CameraScanner = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null); // Canvas reference
  const [cameraError, setCameraError] = useState("");
  const [frontCamera, setFrontCamera] = useState(null);
  const [backCamera, setBackCamera] = useState(null);
  const [isBackCamera, setIsBackCamera] = useState(false); // Track current camera
  const [loading, setLoading] = useState(true); // Track when the camera stream is ready
  const [currentStream, setCurrentStream] = useState(null); // Manage the stream state
  const [scannedData, setScannedData] = useState(null); // Store the scanned data
  const [scanning, setScanning] = useState(false); // Track scanning status
  // Function to get the video stream for a specific device
  const getCameraStream = async (deviceId) => {
    try {
      setLoading(true); // Set loading to true before switching streams
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId },
      });
      return stream;
    } catch (err) {
      console.error("Error accessing camera: ", err);
      setCameraError("Could not access the camera.");
      return null;
    }
  };
  useEffect(() => {
    const startCamera = async () => {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          console.log("Detected devices:", devices);
          // Filter for video input devices (cameras)
          const videoDevices = devices.filter(device => device.kind === 'videoinput');
          console.log("Video devices:", videoDevices); // Log the video devices
          if (videoDevices.length === 0) {
            setCameraError("No video devices found.");
            return;
          }
          // If only one camera is found, treat it as the front camera
          const backCam = videoDevices.find(device => device.facing === 'environment');
          const frontCam = videoDevices.find(device => device.facing === 'user') || videoDevices[0];
          console.log("Front Camera:", frontCam);
          console.log("Back Camera:", backCam);
          // Store cameras in state
          setFrontCamera(frontCam);
          setBackCamera(backCam);
          // Use back camera if available, otherwise fallback to front camera
          const stream = await getCameraStream(backCam ? backCam.deviceId : frontCam.deviceId);
          // Assign the stream to the video element
          videoRef.current.srcObject = stream;
          setCurrentStream(stream); // Set the current stream in state
          // Wait until the metadata of the video element is loaded before starting playback
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
            setLoading(false); // Once the stream is ready, stop the loading state
            setScanning(true); // Start scanning automatically
          };
        } catch (err) {
          console.error("Error accessing camera: ", err);
          setCameraError("Could not access the camera.");
        }
      } else {
        setCameraError("Camera not supported in this browser.");
      }
    };
    startCamera();
    // Cleanup the camera stream on component unmount
    return () => {
      if (currentStream) {
        const tracks = currentStream.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []); // Empty dependency array to run once when component mounts
  const toggleCamera = async () => {
    if (!currentStream) {
      setCameraError("No active camera stream to switch.");
      return;
    }
    // Stop the current stream before switching
    const tracks = currentStream.getTracks();
    tracks.forEach(track => track.stop()); // Stop the current stream
    // Switch between front and back cameras
    const newStream = await getCameraStream(
      isBackCamera && backCamera ? backCamera.deviceId : frontCamera.deviceId
    );
    // If a new stream is successfully acquired, update the video element
    if (newStream) {
      videoRef.current.srcObject = newStream;
      // Wait for the video element to be ready before playing the new stream
      videoRef.current.onloadedmetadata = () => {
        videoRef.current.play();
      };
      setCurrentStream(newStream); // Update the current stream state
      setIsBackCamera(!isBackCamera); // Toggle between front and back cameras
    } else {
      setCameraError("Failed to switch camera.");
    }
  };
  // Function to scan the QR code from the video feed
  const scanQRCode = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    console.log("Canvas element:", canvas);
    console.log("Video element:", video);
    if (canvas && video) {
      const context = canvas.getContext("2d"); // Get the canvas context
      console.log("Canvas context:", context);
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        // Debugging - Log canvas dimensions
        console.log("Canvas dimensions:", canvas.width, canvas.height);
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        // Debugging - Log image data
        console.log("Image data:", imageData);
        const code = jsQR(imageData.data, canvas.width, canvas.height);
        if (code) {
          console.log("QR Code Detected:", code.data);
          setScannedData(code.data); // Set the scanned data from the QR code
          setScanning(false); // Stop scanning after detecting a QR code
        } else {
          console.log("No QR Code Detected");
          setScannedData(null); // Reset scanned data if no QR code found
        }
      } else {
        console.log("Canvas context is not available");
      }
    } else {
      console.log("Canvas or video element is not available");
    }
  };
  // Start scanning automatically every 100ms once the camera starts
  useEffect(() => {
    if (scanning && currentStream && !loading) {
      const interval = setInterval(scanQRCode, 100); // Scan every 100ms
      return () => clearInterval(interval); // Clear the interval on component unmount
    }
  }, [currentStream, loading, scanning]);
  return (
    <div className="relative text-center p-5" >
      <h1>Camera Scanner</h1>
      {cameraError ? (
        <div className="text-[red]">{cameraError}</div>
      ) : (
        <div className="flex justify-center items-center relative">
        <video className=" w-full max-w-[xl] z-10" ref={videoRef}  />
        {loading && <p>Loading camera...</p>} {/* Show loading message when camera is loading */}
        {/* Scanning Animation */}
        {scanning && (
          <div className="absolute top- left-0 w-full flex justify-center pointer-events-none z-20">
            <div className="w-[40%] h-2 bg-blue-500 animate-scan-line"></div>
          </div>
        )}
      </div>
      )}
      {/* Display scanned data */}
      {scannedData && (
        <div style={{ marginTop: "10px" }}>
          <h2>Scanned Data:</h2>
          <h1>{scannedData}</h1>
        </div>
      )}
      <button onClick={toggleCamera} style={buttonStyle}>
        Switch Camera
      </button>
      {/* Canvas (hidden) for scanning */}
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
};
// Button styling
const buttonStyle = {
  padding: "10px 20px",
  margin: "10px",
  backgroundColor: "#007BFF",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  fontSize: "16px",
};
export default CameraScanner;