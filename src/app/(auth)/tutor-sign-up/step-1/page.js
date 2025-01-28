"use client";
import { useTutor } from "@/app/components/TutorContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { MdChevronRight } from "react-icons/md";

const SkeletonLoader = () => {
  return (
    <div className="animate-pulse space-y-6">
      {/* Step Indicator Loader */}
      <div className="flex justify-center space-x-16 mb-12">
        {Array(5)
          .fill()
          .map((_, index) => (
            <div
              key={index}
              className="w-[50px] h-[50px] bg-gray-300 rounded-full"
            ></div>
          ))}
      </div>

      {/* Header Loader */}
      <div className="py-6">
        <div className="h-[24px] bg-gray-300 w-[50%] mb-2 rounded"></div>
        <div className="h-[18px] bg-gray-200 w-[30%] rounded"></div>
      </div>

      {/* Subjects Section Loader */}
      <div className="space-y-4">
        {Array(5)
          .fill()
          .map((_, index) => (
            <div key={index} className="space-y-2">
              <div className="h-[24px] bg-gray-300 w-[40%] rounded"></div>
              <div className="h-[40px] bg-gray-200 w-full rounded"></div>
            </div>
          ))}
      </div>

      {/* Buttons Loader */}
      <div className="flex justify-end gap-4 mt-6">
        <div className="w-[155px] h-[32px] bg-gray-300 rounded"></div>
        <div className="w-[155px] h-[32px] bg-gray-300 rounded"></div>
      </div>
    </div>
  );
};

// Reusable component for each subject section
const SubjectSection = ({
  subjectKey,
  displayName,
  isSelected,
  onToggle,
  inputValue,
  onInputChange,
}) => {
  return (
    <div className="mb-2">
      <div
        className="flex w-fit text-[32px] cursor-pointer  px-[4px] items-center gap-2"
        onClick={onToggle}
      >
        <MdChevronRight
          className={`text-secondary-600 transition-all duration-300 ease-in-out ${
            isSelected ? "rotate-[90deg]" : "rotate-[0deg]"
          }`}
        />
        <p className="text-[18px] sm:text-[21px] md:text-[24px] font-[600] leading-normal text-text-900 ">
          {displayName}
        </p>
      </div>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isSelected ? "max-h-[200px]" : "max-h-0"
        }`}
      >
        <div className="py-2 pl-[44px]">
          <input
            type="text"
            placeholder={`Enter topics for ${displayName}`}
            value={inputValue} // Bind the input value to the state
            onChange={onInputChange} // Call the input change handler
            className="px-4 py-2 bg-text-50 text-[12px] sm:text-[16px] leading-normal border-[1px] border-[rgba(0,0,0,0.04)] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.03)] font-[400] 
            w-full md:w-[60%] outline-primary-400 h-full focus-within:outline-2 rounded-[8px]"
          />
        </div>
      </div>
    </div>
  );
};

const Page = () => {
  const { stepsCleared, setStepsCleared, subjectsTaught, setSubjectsTaught } =
    useTutor();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true); // State to manage loading

  // Manage the state of all subjects (both the toggle state and input content)
  const [subjectsState, setSubjectsState] = useState({
    Physics: { isSelected: false, inputValue: "" },
    Biology: { isSelected: false, inputValue: "" },
    Mathematics: { isSelected: false, inputValue: "" },
    Chemistry: { isSelected: false, inputValue: "" },
    ComputerScience: { isSelected: false, inputValue: "" }, // Key without space
    OtherSubjects: { isSelected: false, inputValue: "" },
  });

  useEffect(() => {
    const prefilledState = { ...subjectsState };

    subjectsTaught.forEach((subject) => {
      const { subjectExpertise, areaOfSubjects } = subject;

      if (prefilledState[subjectExpertise]) {
        prefilledState[subjectExpertise] = {
          isSelected: true,
          inputValue: areaOfSubjects.join(", "), // Convert areas to comma-separated string
        };
      }
    });

    setSubjectsState(prefilledState);

    if (stepsCleared["step1"] === false) {
      router.push("/tutor-sign-up"); // Redirect if step1 is not cleared
    } else {
      setIsLoading(false); // Set loading to false if step1 is cleared
    }
  }, [stepsCleared, router]);

  if (isLoading) {
    return <SkeletonLoader />; // Prevent the page from rendering
  }

  // Function to toggle each subject's state (open/close)
  const toggleSubject = (subjectKey) => {
    setSubjectsState((prev) => ({
      ...prev,
      [subjectKey]: {
        ...prev[subjectKey],
        isSelected: !prev[subjectKey].isSelected, // Toggle the isSelected state
      },
    }));
  };

  // Function to handle input change for each subject
  const handleInputChange = (subjectKey, value) => {
    setSubjectsState((prev) => ({
      ...prev,
      [subjectKey]: {
        ...prev[subjectKey],
        inputValue: value, // Update the input value in the state
      },
    }));
  };

  // List of subjects for easy scalability with display names
  const subjects = [
    { key: "Physics", displayName: "Physics" },
    { key: "Biology", displayName: "Biology" },
    { key: "Mathematics", displayName: "Mathematics" },
    { key: "Chemistry", displayName: "Chemistry" },
    { key: "ComputerScience", displayName: "Computer Science" }, // Display name has space
    { key: "OtherSubjects", displayName: "Other Subjects" }, // Display name has space
  ];
  // console.log("Subject state", subjectsState);

  const handleSubjectSubmit = () => {
    const updatedSubjects = Object.keys(subjectsState)
      .map((subjectKey) => {
        const subject = subjectsState[subjectKey];

        if (subject.inputValue !== "") {
          const subjectExpertise = subjectKey;
          const areaOfSubjects = subject.inputValue
            .split(",")
            .map((item) => item.trim()); // Split and trim whitespace

          return { subjectExpertise, areaOfSubjects };
        }
        return null;
      })
      .filter((subject) => subject !== null); // Filter out null values for unselected subjects

    // Replace the old subjectsTaught state with the updated subjects
    setSubjectsTaught(updatedSubjects);
    setStepsCleared({ ...stepsCleared, step2: true });
    router.push("/tutor-sign-up/step-2");
  };

  return (
    <div className="  min-h-[560px] space-y-6 max-h-[800px]">
      {/* Step Indicator */}
      <div className="hidden md:flex  items-center w-[80%] mx-auto py-4 mb-12">
        {Array(5)
          .fill()
          .map((_, index) => (
            <React.Fragment key={index}>
              {/* Step Circle */}
              <p
                className={`flex items-center justify-center w-[50px] h-[50px] rounded-full ${
                  index < 1
                    ? "bg-primary-400 text-white"
                    : "bg-[#D9D9D9] text-text-400"
                } font-bold text-white`}
              >
                {index + 1}
              </p>
              {/* Dashed Line between Steps */}
              {index < 4 && (
                <div
                  className={`flex-grow ${
                    index < 0 ? "border-t-2 border-dashed border-text-800" : ""
                  } mx-2`}
                ></div>
              )}
            </React.Fragment>
          ))}
      </div>

      {/* Step Indicator in mobile */}
      <div className="md:hidden w-[40px] bg-primary-400 text-white h-[40px] rounded-[50%] flex items-center justify-center">
        <p>1</p>
      </div>

      {/* Choose your subjects */}
      <div className="py-6">
        <h1 className="sm:text-[20px] text-[18px] md:text-[24px] font-[600] leading-normal capitalize ">
          Choose your subjects
        </h1>
        <p className="text-text-400 sm:text-[16px] text-[13px] md:text-[18px] leading-normal font-[400] ">
          Select subjects you’d like to tutor. You can add more later once
          you’re done signing up.
        </p>
      </div>

      {/* Subjects Sections */}
      <div className="">
        {subjects.map((subject) => (
          <SubjectSection
            key={subject.key}
            subjectKey={subject.key}
            displayName={subject.displayName} // Render with display name (with space)
            isSelected={subjectsState[subject.key].isSelected}
            inputValue={subjectsState[subject.key].inputValue}
            onToggle={() => toggleSubject(subject.key)}
            onInputChange={(e) =>
              handleInputChange(subject.key, e.target.value)
            }
          />
        ))}
      </div>

      <div className="flex sm:flex-row flex-col items-center justify-end gap-4 mt-6">
        <Link href={"/tutor-sign-up"}>
          <button
            className="border-[2px] border-primary-400 sm:text-[18px] text-[16px]  md:text-[20px] font-[600] leading-normal 
        w-[155px] h-[32px] flex items-center justify-center rounded-[8px] bg-white text-primary-400 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.02)] "
          >
            Back
          </button>
        </Link>
        {/* <Link href={"/tutor-sign-up/step-2"}> */}
        <button
          onClick={handleSubjectSubmit}
          className="bg-primary-400 rounded-[4px] w-[155px] h-[32px] flex items-center justify-center font-[600] sm:text-[18px] text-[16px] md:text-[20px] leading-normal text-white shadow-[0px_2px_4px_0px_rgba(0,0,0,0.15)]"
        >
          Next
        </button>
        {/* </Link> */}
      </div>
    </div>
  );
};

export default Page;
