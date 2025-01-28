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
    const[selectedRecordings,setSelectedRecordings]=useState([]);
   const[showPopup,setShowPopup]=useState(false);
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
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setShowPopup(false);
      }
    };
    if (showPopup)  {
      document.addEventListener("keydown", handleEscape);
    } else {
      document.removeEventListener("keydown", handleEscape);
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [showPopup]);

  
  const handleViewRecordings = (recordings) => {
    console.log("view Recordin is called")
    console.log("selectedRecordings: ", recordings);
    
    setSelectedRecordings(recordings);
    setShowPopup(true);
  };

  const handleRecordingClick = (recordingUrl) => {
    router.push(`/video-recording?url=${encodeURIComponent(recordingUrl)}`);
  };

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

  useEffect(() => {
    // Calculate the allowed date range
    const today = new Date();
    const utcToday = new Date(
      Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
    );
    const threeDaysAgo = new Date(utcToday);
    threeDaysAgo.setUTCDate(utcToday.getUTCDate() - 3);

    // Set attributes for the input
    const inputElement = document.getElementById("date");
    inputElement.min = threeDaysAgo.toISOString().split("T")[0];
    inputElement.max = utcToday.toISOString().split("T")[0];
  }, []);

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
                  Recordings
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
                  <button
                    onClick={() => handleViewRecordings(completedClass)}
                    className="px-2 py-1  bg-[#E77B3E]  rounded-lg mt-3  text-white"
                  >
                    View Recordings
                  </button>

                 
                </tr>
              ))}
             
            </tbody>
          </table>

        </div>
        )}

{showPopup && (
  <div
    className="fixed inset-0 z-50 flex backdrop-blur-md items-center justify-center bg-black bg-opacity-50"
    onClick={() => setShowPopup(false)}
  >
    <div
      className="bg-white rounded p-5 w-[90%] sm:w-[500px] mx-auto relative"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex justify-end">
        <button
              onClick={() => setShowPopup(false)}
              className="text-black text-lg     font-bold"
            >
              X
            </button>
            </div>
      <h1 className="text-xl font-semibold text-center">Video Recordings</h1>
      <p className="text-sm text-center py-4">
        Click the following links to view the class recordings
      </p>

      {selectedRecordings?.videoRecordingUrl?.length > 0 ? (
        <ol className="flex flex-wrap gap-2 p-2">
          {selectedRecordings?.videoRecordingUrl?.map((recording, index) => (
            <li
              key={index}
              onClick={() => handleRecordingClick(recording)}
              className="cursor-pointer bg-[#E77B3E]  w-fit p-2 rounded-lg text-white"
            >
              Recording {index + 1}
            </li>
          ))}
          
        </ol>
      ) : (
        <p className="text-center">No recordings found</p>
      )}
    </div>
  </div>
)}

       
      </div>
    </div>
  );
}
