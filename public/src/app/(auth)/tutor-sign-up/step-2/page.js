"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useTutor } from "@/app/components/TutorContext";
import { useRouter } from "next/navigation";

const SkeletonLoader = () => {
  return (
    <div className="animate-pulse space-y-4">
      {/* Simulating step indicators */}
      <div className="hidden md:flex space-x-24 justify-center">
        {Array(5)
          .fill()
          .map((_, index) => (
            <div className="w-[50px] h-[50px] bg-gray-300 rounded-full  mb-8" key={index}></div>
          ))}
      </div>
      <div className="block md:hidden w-[50px] h-[50px] bg-gray-300 rounded-full  mb-8" ></div>


      {/* Simulating the content area */}
      {Array(20)
        .fill()
        .map((_, index) => (
          <div key={index} className="space-y-4">
            <div className="w-full bg-gray-200 h-[20px] rounded-md"></div>
            <div className="w-3/4 bg-gray-200 h-[20px] rounded-md"></div>
            <div className="w-1/2 bg-gray-200 h-[20px] rounded-md"></div>
          </div>
        ))}
      {/* Simulating the button area */}
      <div className="flex justify-end gap-4 mt-8">
        <div className="w-[100px] h-[32px] bg-gray-300 rounded-md"></div>
        <div className="w-[100px] h-[32px] bg-gray-300 rounded-md"></div>
      </div>
    </div>
  );
};

const OnboardingStep2 = () => {
  const { isRulesAccepted, setIsRulesAccepted, stepsCleared, setStepsCleared } =
    useTutor();
  const [isLoading, setIsLoading] = useState(true); // State to manage loading

  const router = useRouter();
  // Function to handle checkbox change

  const handleCheckboxChange = (e) => {
    setIsRulesAccepted(e.target.checked); // Update the isRulesAccepted state based on the checkbox status
  };

  // Simulating check for stepsCleared
  useEffect(() => {
    if (stepsCleared["step2"] === false) {
      router.push("/tutor-sign-up/step-1");
    } else {
      setIsLoading(false); // Step cleared, stop loading
    }
  }, []);

  const handleNext = () => {
    setStepsCleared({ ...stepsCleared, step3: true });
    router.push("/tutor-sign-up/step-3");
  };

  if (isLoading) {
    return <SkeletonLoader />; // Show loader while checking
  }

  return (
    <div className=" bg-white flex flex-col  sm:py-8 px-[8px] sm:px-10">
      {/* Step Indicator */}
      <div className="md:flex hidden items-center w-[80%] mx-auto py-4 mb-12">
        {Array(5)
          .fill()
          .map((_, index) => (
            <React.Fragment key={index}>
              {/* Step Circle */}
              <div
                className={`flex items-center justify-center w-[50px] h-[50px] rounded-full ${
                  index < 2
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
                    index < 1 ? "border-t-2 border-dashed border-text-800" : ""
                  } mx-2`}
                ></div>
              )}
            </React.Fragment>
          ))}
      </div>

      {/* Step Indicator in mobile */}
      <div className="md:hidden mb-6 w-[40px] bg-primary-400 text-white h-[40px] rounded-[50%] flex items-center justify-center">
        <p>2</p>
      </div>

      <div className="w-full bg-text-50 shadow-lg px-[10px] sm:px-10 py-[20px] sm:py-10  rounded-[24px]">
        {/* Content Section */}
        <div className="mb-8 text-black">
          <h2 className="text-[20px] sm:text-[21px] md:text-[24px] font-[600] mb-4">
            A few things first
          </h2>
          <p className="text-gray-700 text-[13px] sm:text-[15px] md:text-[19px] mb-6">
            Thanks for choosing EduEliteConnect! To prepare you to be a
            successful tutor with EduEliteConnect, we&apos;re going to walk you
            through a few quick points about how EduEliteConnect works.
          </p>

          {/* Additional Sections */}
          <h3 className="text-[20px] sm:text-[21px] md:text-[24px] font-[600] mb-4">
            Your relationship with EduEliteConnect
          </h3>
          <p className="text-gray-700 text-[13px] sm:text-[15px] md:text-[19px] mb-6">
            In EduEliteConnect marketplace, you&apos;re an independent tutor in
            control of your tutoring business. You have full responsibility and
            flexibility for setting up appointments with students and entering
            the lesson details into the system. You select which opportunities
            to pursue and how much to charge. A straightforward commission
            structure lets you know exactly how much you make from each lesson.
          </p>
          <p className="text-gray-700 text-[13px] sm:text-[15px] md:text-[19px] mb-6">
            As an independent tutor, you are not a EduEliteConnect employee and
            we are not able to verify your employment to other companies.
          </p>

          {/* Finding Students Section */}
          <h3 className="text-[20px] sm:text-[21px] md:text-[24px] font-[600] mb-4">
            How to find students
          </h3>
          <p className="text-gray-700 text-[13px] sm:text-[15px] md:text-[19px] mb-6">
            Once you complete your profile, you can find tutoring opportunities
            in two ways:
          </p>
          <ol className="list-decimal list-inside text-gray-700 text-[13px] sm:text-[15px] md:text-[19px] mb-6">
            <li>
              You can search the tutoring jobs board and message students.
            </li>
            <li>Students can find your profile and send you a message.</li>
          </ol>

          {/* Additional Lists and Rules */}
          <p className="text-gray-700 text-[13px] sm:text-[15px] md:text-[19px] mb-6">
            Our marketplace is structured to ensure that students can find the
            best tutors, and that active tutors receive student leads with a
            high match rate. A few things that will improve your match rate are
            your tutoring history, responsiveness and user feedback. This means
            that your rank will improve by:
          </p>
          <ul className="list-disc list-inside text-gray-700 text-[13px] sm:text-[15px] md:text-[19px] mb-6">
            <li>Recording more tutoring hours with EduEliteConnect.</li>
            <li>Responding to new students within 24 hours.</li>
            <li>Receiving high lesson ratings from your students.</li>
          </ul>

          {/* Payment Section */}
          <h3 className="text-[20px] sm:text-[21px] md:text-[24px] font-[600] mb-4">
            Payment
          </h3>
          <p className="text-gray-700 text-[13px] sm:text-[15px] md:text-[19px] mb-6">
            During the registration process, you&apos;ll decide your own default
            hourly rates. Students pay for lessons via the EduEliteConnect
            platform only after each lesson is complete. Tutors do not receive
            direct payment from students at any time. You&apos;ll be paid 75% of
            your rate for each lesson, and EduEliteConnect will retain a 25%
            platform fee. Since tutors listed on EduEliteConnect are
            independent, taxes and other fees will not be withheld from your
            payments.
          </p>

          {/* Important Rules */}
          <h3 className="text-[20px] sm:text-[21px] md:text-[24px] font-[600] mb-4">
            Important rules
          </h3>
          <p className="text-gray-700 text-[13px] sm:text-[15px] md:text-[19px] mb-6">
            EduEliteConnect has built a simple set of rules to ensure that
            tutors get paid in full, to protect the privacy of tutors and
            students, and to make our service fair for everyone. Please keep the
            following things in mind as you use EduEliteConnect:
          </p>
          <ul className="list-disc list-inside text-gray-700 text-[13px] sm:text-[15px] md:text-[19px] mb-6">
            <li>
              Accepting payment directly from students is not allowed, and will
              prevent tutors from being successful on EduEliteConnect.
            </li>
            <li>
              All communication with your students must take place through
              EduEliteConnect messaging system. Do not exchange personal email
              addresses with your students.
            </li>
            <li>
              Before phone numbers can be exchanged or lessons provided, a
              student must have a form of payment on file. We accept credit or
              debit cards, PayPal, checks and money orders. This policy ensures
              that you get paid for all lessons.
            </li>
          </ul>

          {/* Checkbox Section */}
          <div className="flex items-start center mb-6">
            <input
              type="checkbox"
              id="commitment"
              className="mr-2 custom-checkbox mt-2"
              checked={isRulesAccepted} // Bind the state to the checkbox
              onChange={handleCheckboxChange} // Call the handler when checkbox is clicked
            />
            <label
              htmlFor="commitment"
              className="text-gray-700 w-[96%] text-[13px] sm:text-[15px] md:text-[19px]"
            >
              I have a valid Social Security number, I am authorized to work in
              the United States, and I am at least 18 years of age or older.
            </label>
          </div>
        </div>

        <div className="flex sm:flex-row flex-col items-center justify-end gap-4 mt-6">
          <Link href={"/tutor-sign-up/step-1"}>
            <button className="border-[2px] border-primary-400 sm:text-[18px] text-[16px] md:text-[20px] font-[600] leading-normal w-[155px] h-[32px] flex items-center justify-center rounded-[8px] bg-white text-primary-400 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.02)]">
              Back
            </button>
          </Link>
          {/* <Link href={isRulesAccepted ? "/tutor-sign-up/step-3" : "#"} passHref> */}
          <button
            className={`bg-primary-400 rounded-[4px] w-[155px] h-[32px] flex items-center justify-center font-[600] sm:text-[18px] text-[16px] md:text-[20px] leading-normal text-white shadow-[0px_2px_4px_0px_rgba(0,0,0,0.15)] ${
              !isRulesAccepted ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={handleNext}
            disabled={!isRulesAccepted} // Disable button if the checkbox is not checked
          >
            Next
          </button>
          {/* </Link> */}
        </div>
      </div>
    </div>
  );
};

export default OnboardingStep2;
