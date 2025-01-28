"use client";
import { ReviewsPopUp } from "@/app/components/ReviewsComponents";
import { useSearchParams } from "next/navigation";
import React, { Suspense, useEffect } from "react";
// Spinner Component
const Spinner = () => (
  <div className="flex m-auto justify-center items-center h-24">
    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4  border-secondary-600"></div>
  </div>
);
const Page = () => {
  const searchParams = useSearchParams();
  const tutorId = searchParams.get("tutorId");
  return (
    <div className="w-full bg-black bg-opacity-50 flex items-center justify-center  h-screen">
      <div className="w-[80%]">
        <ReviewsPopUp tutorId={tutorId} />
      </div>
    </div>
  );
};

const SuspenseWrapper = () => {
  return (
    <Suspense
      fallback={
        <div className="w-full h-screen flex items-center justify-center">
          <Spinner />
        </div>
      }
    >
      <Page />
    </Suspense>
  );
};

export default SuspenseWrapper;
