import React from 'react'
const Shimmer = () => {
    return (
      <div className="min-w-md max-w-full mx-auto p-4 space-y-2">
      {/* Shimmer for each chat bubble */}
      {[...Array(15)].map((_, index) => (
        <div
          key={index}
          className={`flex ${index % 2 === 0 ? "justify-start" : "justify-end"}`}
        >
          <div
            className={`w-1/3 p-3 rounded-lg ${
              index % 2 === 0 ? "bg-gray-200" : "bg-gray-200"
            }`}
          >
            <div className="animate-pulse">
              <div className="bg-gray-300 h-2 rounded w-1/4 mb-2"></div>
              <div className="bg-gray-300 h-2 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
    );
  };
  

  export default Shimmer


  