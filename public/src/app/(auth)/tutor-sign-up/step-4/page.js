"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTutor } from "@/app/components/TutorContext";

const SkeletonLoader = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Skeleton for step indicator */}
      <div className="md:flex hidden items-center w-[100%] justify-center  space-x-24 mx-auto py-4 mb-12">
        {Array(5)
          .fill()
          .map((_, index) => (
            <div
              key={index}
              className={`flex items-center justify-center w-[50px] h-[50px] rounded-full bg-gray-300`}
            />
          ))}
      </div>

      <div className="h-fit">
        <div className="w-full bg-gray-200 rounded-md p-8">
          {/* Header Skeleton */}
          <div className="h-6 bg-gray-300 rounded-md w-2/3 mb-4"></div>
          <div className="h-4 bg-gray-300 rounded-md w-full mb-6"></div>

          {/* Agreement Section Skeleton */}
          <div className="h-56 bg-gray-300 rounded-md mb-6"></div>

          {/* Checkbox Skeleton */}
          <div className="space-y-4 mb-6">
            <div className="h-6 bg-gray-300 rounded-md"></div>
            <div className="h-6 bg-gray-300 rounded-md"></div>
            <div className="h-6 bg-gray-300 rounded-md"></div>
          </div>

          {/* Buttons Skeleton */}
          <div className="flex justify-end gap-4">
            <div className="h-10 w-[155px] bg-gray-300 rounded-md"></div>
            <div className="h-10 w-[155px] bg-gray-300 rounded-md"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Page = () => {
  const [checkboxes, setCheckboxes] = useState({
    agreeTerms: false,
    readTerms: false,
    ssnAuthorization: false,
  });
  const {
    stepsCleared,
    setStepsCleared,
    termsAndConditionsCheckboxes,
    setTermsAndConditionsCheckboxes,
    setCallApi
  } = useTutor();
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    setCheckboxes({ ...termsAndConditionsCheckboxes });
    if (stepsCleared["step4"] === false) {
      router.push("/tutor-sign-up/step-3");
    } else {
      setIsLoading(false);
    }
  }, []);

  const allChecked = Object.values(checkboxes).every(Boolean);

  const handleCheckboxChange = (e) => {
    const { id, checked } = e.target;
    setCheckboxes((prev) => ({
      ...prev,
      [id]: checked,
    }));
  };

  if (isLoading) {
    return <SkeletonLoader />;
  }

  const handleTermsAndConditionsAcceptance = () => {
    setTermsAndConditionsCheckboxes({ ...checkboxes });
    setStepsCleared({ ...stepsCleared, step5: true });
    setCallApi(true)
    // router.push('/tutor-sign-up/step-5')
  };

  return (
    <div className="">
      {/* Step Indicator */}
      <div className="md:flex hidden items-center w-[80%] mx-auto py-4 mb-12">
        {Array(5)
          .fill()
          .map((_, index) => (
            <React.Fragment key={index}>
              {/* Step Circle */}
              <div
                className={`flex items-center justify-center w-[50px] h-[50px] rounded-full ${
                  index < 4
                    ? "bg-primary-400 text-white"
                    : "bg-[#D9D9D9] text-text-400"
                } font-bold text-white`}
              >
                {index + 1}
              </div>
              {/* Dashed Line between Steps */}
              {index < 4 && (
                <div
                  className={`flex-grow ${
                    index < 3 ? "border-t-2 border-dashed border-text-800" : ""
                  } mx-2`}
                ></div>
              )}
            </React.Fragment>
          ))}
      </div>

      {/* Step Indicator in mobile */}
      <div className="md:hidden mb-6 w-[40px] bg-primary-400 text-white h-[40px] rounded-[50%] flex items-center justify-center">
        <p>4</p>
      </div>

      {/* Content Container */}
      <div className=" h-fit">
        <div className="w-full bg-white rounded-md sm:p-4 p-2 md:p-8">
          {/* Header Section */}
          <h1 className="text-[20px] text-center sm:text-start  sm:text-[22px] md:text-[24px] font-bold text-gray-900 mb-4">
            Agreement and terms for tutoring
          </h1>
          <p className="text-gray-700 text-center sm:text-start text-[14px] sm:text-[16px] md:text-[18px] mb-6">
            The agreement on this page is a binding legal contract. By
            proceeding with registration, this legal Agreement is entered into
            between EduEliteConnect (&quot;the Company&quot;) and you (&quot;the
            Tutor&quot;).
          </p>

          {/* Agreement Section */}
          <div className="bg-gray-100  text-[14px] sm:text-[16px] md:text-[18px] p-6 rounded-md mb-6 max-h-[500px] overflow-y-auto custom-scrollbar">
            <p className="text-gray-700 mb-6">
              This is a legal and binding agreement (&quot;Agreement&quot;)
              between you (&quot;Independent Tutor&quot;) and EduEliteConnect.
              The parties expressly agree to enter into this Agreement by
              electronic means within the meaning of the Uniform Electronic
              Transactions Act (&quot;UETA&quot;) and the Illinois Electronic
              Commerce Security Act.
            </p>
            {/* Terms Section */}
            <div className="space-y-4 ">
              <div>
                <p className=" font-bold text-secondary-600 mb-2">
                  1. Permission to use EduEliteConnect marketplace.{" "}
                  <span className="text-text-400 font-[400]">
                    Independent Tutor acknowledges that EduEliteConnect operates
                    an Internet-based marketplace allowing individuals seeking
                    the services of a tutor (each, a &quot;Student&quot; and
                    collectively, &quot;Students&quot;) to identify and retain
                    the services of individuals who provide tutoring services
                    (each, a &quot;Tutor&quot; and collectively,
                    &quot;Tutors&quot;). By entering into this Agreement,
                    Independent Tutor seeks permission to access the marketplace
                    for the express purpose of promoting his/her/their
                    independent business, subject to the terms and conditions
                    set forth in this Agreement. Independent Tutor may not
                    advertise or offer to sell any goods or services for any
                    commercial purpose on the Site that are not directly related
                    to the provision of tutoring services on an independent
                    basis.
                  </span>
                </p>
              </div>
              <div>
                <p className=" font-bold text-secondary-600 mb-2">
                  2. Tutor status.{" "}
                  <span className="text-text-400 font-[400]">
                    Independent Tutor acknowledges that EduEliteConnect provides
                    nothing more than an Internet-based marketplace for
                    prospective Students to identify and retain the services of
                    prospective Tutors. Independent Tutor further acknowledges
                    that EduEliteConnect is not directly or indirectly engaging
                    Independent Tutor to render any services whatsoever for
                    EduEliteConnect, and that any engagement of Independent
                    Tutor&apos;s services through the EduEliteConnect website
                    (&quot;Site&quot;) is undertaken exclusively by the Student
                    who has selected Independent Tutor through the Site to
                    provide tutoring services (&quot;Tutor&apos;s
                    Student&quot;). Neither this Agreement, the Terms of Use,
                    nor use of the Site grants Independent Tutor any employment
                    or independent contractor relationship with EduEliteConnect.
                  </span>
                </p>
              </div>
              <div>
                <p className=" font-bold text-secondary-600 mb-2">
                  2. Tutor status.{" "}
                  <span className="text-text-400 font-[400]">
                    Independent Tutor acknowledges that EduEliteConnect provides
                    nothing more than an Internet-based marketplace for
                    prospective Students to identify and retain the services of
                    prospective Tutors. Independent Tutor further acknowledges
                    that EduEliteConnect is not directly or indirectly engaging
                    Independent Tutor to render any services whatsoever for
                    EduEliteConnect, and that any engagement of Independent
                    Tutor&apos;s services through the EduEliteConnect website
                    (&quot;Site&quot;) is undertaken exclusively by the Student
                    who has selected Independent Tutor through the Site to
                    provide tutoring services (&quot;Tutor&apos;s
                    Student&quot;). Neither this Agreement, the Terms of Use,
                    nor use of the Site grants Independent Tutor any employment
                    or independent contractor relationship with EduEliteConnect.
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Checkbox Section */}
          <div className="space-y-4 mb-6 text-[12px] sm:text-[14px] md:text-[16px] ">
            <div className="  flex   items-start">
              <input
                type="checkbox"
                id="agreeTerms"
                className="custom-checkbox mr-4 mt-2"
                checked={checkboxes.agreeTerms}
                onChange={handleCheckboxChange}
              />
              <label htmlFor="agreeTerms" className="text-text-500  w-[96%]">
                I voluntarily agree to be bound by all terms provided in the
                above Independent Tutor Agreement as of today&apos;s date. I
                understand that I may refuse to conduct this transaction with
                EduEliteConnect by electronic means.
              </label>
            </div>
            <div className="flex   items-start">
              <input
                type="checkbox"
                id="readTerms"
                className="custom-checkbox mr-4 mt-1"
                checked={checkboxes.readTerms}
                onChange={handleCheckboxChange}
              />
              <label htmlFor="readTerms" className="text-text-500 w-[96%]">
                I have read and agree to the{" "}
                <span className="text-orange-500 underline cursor-pointer">
                  Terms of use
                </span>
                .
              </label>
            </div>
            <div className="flex items-start">
              <input
                type="checkbox"
                id="ssnAuthorization"
                className="custom-checkbox mr-4 mt-1"
                checked={checkboxes.ssnAuthorization}
                onChange={handleCheckboxChange}
              />
              <label
                htmlFor="ssnAuthorization"
                className="text-text-500 w-[96%]"
              >
                I have a valid Social Security number, I am authorized to work
                in the United States, and I am at least 18 years of age or
                older.
              </label>
            </div>
          </div>

          {/* Buttons Section */}
          <div className="flex sm:flex-row flex-col items-center justify-end gap-4 mt-6">
            <Link href={"/tutor-sign-up/step-3"}>
              <button className="border-[2px] border-primary-400 sm:text-[18px] text-[16px] md:text-[20px] font-[600] leading-normal w-[155px] h-[32px] flex items-center justify-center rounded-[8px] bg-white text-primary-400 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.02)]">
                Back
              </button>
            </Link>
            <Link href={"/tutor-sign-up/step-5"}>
              <button
                onClick={handleTermsAndConditionsAcceptance}
                className={`${
                  allChecked
                    ? "bg-primary-400 text-white"
                    : "bg-gray-300 text-gray-500"
                } rounded-[4px] w-[155px] h-[32px] flex items-center justify-center font-[600] sm:text-[18px] text-[16px] md:text-[20px] leading-normal shadow-[0px_2px_4px_0px_rgba(0,0,0,0.15)]`}
                disabled={!allChecked}
              >
                Next
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
