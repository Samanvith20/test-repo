"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { use, useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { MdChevronRight } from "react-icons/md";

const SkeletonLoader = () => {
  return (
    <div className="container mx-auto px-[20px] lg:px-[50px] xl:px-[86px] py-16">
      <div className="animate-pulse space-y-6">
        {/* Step Indicator Loader */}

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
  const [subjectsState, setSubjectsState] = useState({
    Physics: { isSelected: false, inputValue: "" },
    Biology: { isSelected: false, inputValue: "" },
    Mathematics: { isSelected: false, inputValue: "" },
    Chemistry: { isSelected: false, inputValue: "" },
    ComputerScience: { isSelected: false, inputValue: "" },
    OtherSubjects: { isSelected: false, inputValue: "" },
  });
  console.log("subjectsState", subjectsState);

  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchTutorProfile = async () => {
      try {
        const response = await fetch("/api/tutors/tutorprofile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        console.log("datais:", data);

        if (response.ok && data.tutor?.subjectsTaught) {
          const subjectTaught = data.tutor.subjectsTaught;
          console.log("subjectExpertise", data.tutor.subjectsTaught);

          const prefilledState = { ...subjectsState };
          subjectTaught.forEach((subject) => {
            const { subjectExpertise, areaOfSubjects } = subject;
            if (prefilledState[subjectExpertise]) {
              prefilledState[subjectExpertise] = {
                isSelected: true,
                inputValue: areaOfSubjects.join(", "),
              };
              //   console.log("are of subject", subject.areaOfSubject);
            }
          });

          setSubjectsState(prefilledState);
        }
      } catch (error) {
        console.error("Error fetching tutor profile:", error);
      } finally {
        setLoading(false); // Ensure loading state is updated
      }
    };

    fetchTutorProfile();
  }, []);

  const subjects = [
    { key: "Physics", displayName: "Physics" },
    { key: "Biology", displayName: "Biology" },
    { key: "Mathematics", displayName: "Mathematics" },
    { key: "Chemistry", displayName: "Chemistry" },
    { key: "ComputerScience", displayName: "Computer Science" }, // Display name has space
    { key: "OtherSubjects", displayName: "Other Subjects" },
  ];
  const toggleSubject = (subjectKey) => {
    setSubjectsState((prev) => ({
      ...prev,
      [subjectKey]: {
        ...prev[subjectKey],
        isSelected: !prev[subjectKey].isSelected,
      },
    }));
  };
  const handleInputChange = (subjectKey, value) => {
    console.log("Subject:::", subjectsState[subjectKey], value);

    setSubjectsState((prev) => ({
      ...prev,
      [subjectKey]: {
        ...prev[subjectKey],
        inputValue: value,
      },
    }));
  };

  const handleSubjectSubmit = async () => {
    const updatedSubjects = [];

    // Loop through the subjectsState to gather selected subjects
    Object.keys(subjectsState).forEach((subjectKey) => {
      const subject = subjectsState[subjectKey];

      if (subject.inputValue !== "") {
        const subjectExpertise = subjectKey;
        const areaOfSubjects = subject.inputValue
          .split(",")
          .map((item) => item.trim())
          .filter((item) => item !== "");

        updatedSubjects.push({
          subjectExpertise,
          areaOfSubjects: areaOfSubjects,
        });
      }
    });

    // Send the updated data to the backend
    try {
      const toastLoading = toast.loading("Updating subjects...");
      const response = await fetch("/api/tutors/update-subjects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ subjectsTaught: updatedSubjects }),
      });

      if (response.ok) {
        const responseData = await response.json();
        toast.dismiss(toastLoading);
        toast.success("Subjects updated successfully!");
        router.push("/tutor/my-profile");
        // console.log("Subjects updated successfully:", responseData);
      } else {
        toast.dismiss(toastLoading);
        toast.error("Error updating subjects. Please try again.");
        console.error("Error updating subjects:", response.statusText);
      }
    } catch (error) {
      console.error("Error in handleSubjectSubmit:", error);
    }
  };

  if (loading) return <SkeletonLoader />;

  return (
    <div className="container mx-auto px-[20px] lg:px-[50px] xl:px-[86px] py-16">
      <Toaster/>
      <div className="  min-h-[560px] space-y-6 max-h-[800px]">
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
          <Link href={"/tutor/my-profile"}>
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
            Submit
          </button>
          {/* </Link> */}
        </div>
      </div>
    </div>
  );
};

export default Page;
