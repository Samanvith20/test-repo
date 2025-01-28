"use client";

import { useSearchParams } from "next/navigation";
import React, { Suspense, useRef } from "react";

const Page = () => {
  const searchParams = useSearchParams();
  const name = searchParams.get("url");
  const videoRef = useRef(null);

  return (
    <div className=" flex flex-col justify-center items-center min-h-screen bg-white p-4">
      {name ? (
        <div className="w-full max-w-6xl">
          <video
            ref={videoRef}
            controls
            controlsList="nodownload"
            className="w-full h-auto rounded-lg shadow-lg"
            src={name}
          ></video>
        </div>
      ) : (
        <p className="text-gray-800 text-lg sm:text-xl lg:text-2xl font-semibold">
          No video URL provided.
        </p>
      )}
    </div>
  );
};

const SuspenseWrapper = () => {
  return (
    <Suspense fallback={<div className="text-center">Loading...</div>}>
      <Page />
    </Suspense>
  );
};

export default SuspenseWrapper;
