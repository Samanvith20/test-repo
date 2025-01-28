import React from "react";

const CustomCircularProgressBar = ({ totalHours, text }) => {
  const radius = 80; // Increased radius for larger circle
  const strokeWidth = 12; // Increased stroke width for more visibility
  const normalizedRadius = radius - strokeWidth * 0.5; // Adjust radius for stroke width
  const circumference = normalizedRadius * 2 * Math.PI; // Circumference of the circle

  // Calculate percentage based on 24 hours
  const percentage = (totalHours / 24) * 100;
  const strokeDashoffset = circumference - (percentage / 100) * circumference; // Calculate the offset for the stroke

  return (
    <div
      style={{
        width: 220,
        height: 220,
        position: "relative",
        
        borderRadius: "10px",
        padding: "20px",
      }}
    >
      <svg height={200} width={200}>
        <circle
          stroke="#D9D9D9" // Background trail color
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke="#E77B3E" // Progress color
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          style={{
            transform: "rotate(-90deg)", // Rotate circle to start at the top
            transformOrigin: "40% 40%", // Ensure the rotation happens around the center
            transition: "stroke-dashoffset 1s ease",
          }}
          strokeLinecap="round" // Makes the stroke ends rounded
        />
      </svg>
      <div
        style={{
          position: "absolute",
          top: "40%",
          left: "26%",
          //   transform: "translate(-25%, -25%)",
          fontSize: "16px", // Increased font size for better visibility
          fontWeight: "bold",
          color: "black", // Ensured color contrast for text
        }}
      >
        {text}
      </div>
    </div>
  );
};

export default CustomCircularProgressBar;
