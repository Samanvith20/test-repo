"use client";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
const Spinner = () => (
  <div className="flex justify-center items-center h-24">
    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-secondary-600"></div>
  </div>
);
export default function Myclasses() {
  const [completedClasses, setCompletedClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  console.log("filteredClasses::", filteredClasses);
  
  const [date, setDate] = useState(() => {
    // Set default date to today in YYYY-MM-DD format
    const today = new Date().toISOString().split("T")[0];
    return today;
  });
  const [loading, setLoading] = useState(false); // Added loading state
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [tutorOptions, setTutorOptions] = useState([]);
  const [selectedTutor, setSelectedTutor] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
   const [error, setError] = useState("");
   console.log("errormessahe::", error);
   
  const router = useRouter();


  const fetchCompletedClasses = async (date) => {
    setLoading(true); // Start loading spinner
    setError(""); // Reset error message
    try {
      const response = await fetch(
        `/api/student/get-completed-classes?date=${date}`
      );
      const data = await response.json();
      console.log("data::", data);
      
     
      if (response.status === 404) {
        setError(data.message);
        setCompletedClasses([]);
        setFilteredClasses([]);
      }
      else {
        return data.completedClasses;
      }
    } catch (error) {
      console.log("Error while fetching class details: ", error);
      return [];
    }
    finally {
      setLoading(false); // Stop loading spinner
    }
  };

  useEffect(() => {
    // Fetch initial data when component mounts
    const fetchData = async () => {
      const classes = await fetchCompletedClasses(date);
      setCompletedClasses(classes);
      setFilteredClasses(classes);
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (completedClasses?.length > 0) {
      // Get unique subjects
      const subjects = completedClasses.map(
        (classItem) => classItem.subjectDetails.subject
      );
      const uniqueSubjects = [...new Set(subjects)];
      setSubjectOptions(uniqueSubjects);

      // Get unique tutors
      const tutors = completedClasses.map((classItem) => classItem.tutorName);
      const uniqueTutors = [...new Set(tutors)];
      setTutorOptions(uniqueTutors);
    }
  }, [completedClasses]); // Run this effect whenever completedClasses is updated

  const handleFilter = async () => {
    const classes = await fetchCompletedClasses(date);
    setCompletedClasses(classes);

    let filtered = classes;

    if (selectedTutor) {
      filtered = filtered.filter(
        (classItem) => classItem.tutorName === selectedTutor
      );
    }

    if (selectedSubject) {
      filtered = filtered.filter(
        (classItem) => classItem.subjectDetails.subject === selectedSubject
      );
    }

    setFilteredClasses(filtered);
  };

  console.log("COMPLETED CLASSES: ", completedClasses);
  console.log("FILTERED CLASSES: ", filteredClasses);
  console.log("SUBJECT OPTIONS: ", subjectOptions);
  console.log("TUTOR OPTIONS: ", tutorOptions);

  return (
    <div className="flex flex-col justify-center h-full overflow-hidden ">
      <div className=" border h-full rounded-md p-5">
        <div className="flex flex-col gap-4 md:flex-row mb-6 md:justify-evenly">
          {/* Tutor Dropdown */}
          <div className="flex flex-col items-start md:items-center">
            <label
              htmlFor="tutor"
              className="text-sm md:text-[15px] py-2 font-semibold"
            >
              Tutor
            </label>
            <div className="w-full md:w-auto border rounded-lg bg-[#F6F6F6] font-medium px-4">
              <select
                id="tutor"
                className="text-sm md:text-[15px] outline-none bg-[#F6F6F6] font-medium w-full"
                value={selectedTutor}
                onChange={(e) => setSelectedTutor(e.target.value)}
              >
                <option value="">All</option>
                {tutorOptions.map((tutor, index) => (
                  <option key={index} className="px-2 py-2 capitalize">
                    {tutor}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Subject Dropdown */}
          <div className="flex flex-col items-start md:items-center">
            <label
              htmlFor="subject"
              className="text-sm md:text-[15px] py-2 font-semibold"
            >
              Subject
            </label>
            <div className="w-full md:w-auto border rounded-lg bg-[#F6F6F6] font-medium px-4">
              <select
                id="subject"
                className="text-sm md:text-[15px] outline-none bg-[#F6F6F6] font-medium w-full"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                <option value="">All</option>
                {subjectOptions.map((subject, index) => (
                  <option key={index} className="px-2 py-2 capitalize">
                    {subject}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date Input */}
          <div className="flex flex-col items-start md:items-center">
            <label
              htmlFor="date"
              className="text-sm md:text-[15px] py-2 font-semibold"
            >
              Date
            </label>
            <div className="w-full md:w-auto border rounded-lg bg-[#F6F6F6] font-medium px-4">
              <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-sm md:text-[14px] bg-[#F6F6F6]  rounded-md font-medium"
              />
            </div>
          </div>

          {/* Filter Button */}
          <button
            className="w-full md:w-auto rounded-lg px-4 py-2 text-white bg-[#E77B3E] text-sm mb-2 md:my-auto"
            onClick={handleFilter}
          >
            Filter
          </button>
        
        </div>
        {/* Spinner */}
        {loading && <Spinner />}

        {/* Error Message */}
        {!loading && error && (
          <div className="text-center text-red-500 font-medium my-4">
            {error}
          </div>
        )}

        {/* Table */}
        {!loading && !error && filteredClasses?.length>0&& (
        <div className="overflow-x-auto overflow-y-auto custom-scrollbar min-h-[50%] max-h-[450px]">
          <table className="min-w-full divide-y">
            <thead className="bg-[#C6E8E9] px-2">
              <tr className="">
                <th className="px-6 py-3 text-left text-[13px] md:text-[14px] 2xl:text-[16px] font-medium">
                  Tutor
                </th>
                <th className="px-6 py-3 text-left text-[13px] md:text-[14px] 2xl:text-[16px] font-medium">
                  Subject
                </th>
                <th className="px-6 py-3 flex flex-col items-start text-[13px] md:text-[14px] 2xl:text-[16px] font-medium">
                  Date <span className="text-[10px]">(MM-DD-YYYY)</span>
                </th>
                <th className="px-6 py-3 text-left text-[13px] md:text-[14px] 2xl:text-[16px] font-medium">
                  Lesson Price
                </th>
                <th className="px-6 py-3 text-left text-[13px] md:text-[14px] 2xl:text-[16px] font-medium">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-[13px] md:text-[14px] 2xl:text-[16px] font-medium">
                  Review Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white capitalize divide-y">
              {filteredClasses?.map((completedClass, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 text-sm font-medium">
                    {completedClass?.tutorName}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    {completedClass?.subjectDetails?.subject}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    {completedClass?.timeslot?.date}
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap text-ellipsis max-w-[120px] overflow-hidden font-medium">
                    $ {completedClass?.lessonPrice}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => {
                        // Check if the index is less than the tutor's rating
                        const isFilled =
                          completedClass.review?.rating === 5 ||
                          i < completedClass.review?.rating;
                        return (
                          <div key={i}>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 16 16"
                              fill="none"
                            >
                              <path
                                d="M8.00005 11.5135L10.7667 13.1868C11.2734 13.4935 11.8934 13.0402 11.76 12.4668L11.0267 9.32017L13.4734 7.20017C13.92 6.8135 13.68 6.08017 13.0934 6.0335L9.87338 5.76017L8.61338 2.78684C8.38671 2.24684 7.61338 2.24684 7.38671 2.78684L6.12671 5.7535L2.90672 6.02684C2.32005 6.0735 2.08005 6.80684 2.52672 7.1935L4.97338 9.3135L4.24005 12.4602C4.10672 13.0335 4.72671 13.4868 5.23338 13.1802L8.00005 11.5135Z"
                                fill={
                                  isFilled ? "rgba(223, 180, 9, 1)" : "#D1D5DB"
                                } // Yellow for filled stars, gray for empty stars
                              />
                            </svg>
                          </div>
                        );
                      })}
                    </div>
                  </td>

                  <td className="px-6 py-4 text-[10px] xl:text-sm font-medium">
                    {completedClass.review === null ? (
                      <button
                        className="bg-primary-400 text-white rounded-lg px-4 py-2"
                        onClick={() =>
                          router.push(
                            `/student/add-tutor-review?tutorId=${completedClass.tutorId}`
                          )
                        }
                      >
                        Give Review
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          
                          router.push(
                            `/student/add-tutor-review?tutorId=${completedClass.tutorId}`
                          )
                        }
                        disabled={completedClass.review.updateStatus}
                        className={`${
                          completedClass.review.updateStatus
                            ? "bg-gray-200 text-text-800"
                            : "bg-secondary-600 text-white"
                        }  rounded-lg px-4 py-2`}
                      >
                        Change Review
                      </button>
                    )}
                  </td>
                </tr>
              ))}
             
            </tbody>
          </table>

        </div>
        )}
      </div>
    </div>
  );
}
