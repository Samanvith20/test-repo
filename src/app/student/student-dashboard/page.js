"use client";

import React, { useEffect, useState } from "react";
import { Poppins } from "next/font/google";
import Image from "next/image";
import { Toaster, toast } from "react-hot-toast";
import { FiX } from "react-icons/fi";


import ScheduledSession from "@/app/components/ScheduledSession";

import ViewTutor from "@/app/components/ViewTutor";
import Link from "next/link";
import { ReviewsPopUp } from "@/app/components/ReviewsComponents";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600"] });

const Page = () => {
  const [tutorDetail, setTutorDetail] = useState([]);
  const [mytutors, setmyTutors] = useState([]);
  const[paymentDetails, setPaymentDetails]=useState([]);
  console.log("paymentDetails::", paymentDetails);
  
  // console.log("mytutors::", mytutors);
  const [viewTutor, setViewTutor] = useState(null);
  //  console.log("viewTutor::", viewTutor);
  const [selectedTutorId, setSelectedTutorId] = useState(null);

   
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedButton, setSelectedButton] = useState("Join");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hours, setHours] = useState(null);
  const [modalType, setModalType] = useState(null);
  const[studentData, setstudentData] = useState([]);
  console.log("studentData::", studentData);
  

  const [currentClassId, setCurrentClassId] = useState(null);
  const [showRequestSession, setShowRequestSession] = useState(false);
 

  useEffect(() => {
    getPaymentDetails();
    fetchMyTutors();
    scheduledClasses();
    fetchstudentData()
  }, []);
  
  useEffect(() => {
    fetchData(statusFilter);
  }, [statusFilter]);
  

  
  // console.log("studentname::", studentname);
  // console.log("tutorId::",viewTutor?._id);
  
  if (viewTutor) {
    return <ViewTutor viewTutor={viewTutor} setViewTutor={setViewTutor} />;
  }
  if(selectedTutorId){
    return <ReviewsPopUp tutorId={selectedTutorId} />
  }

 

  const fetchstudentData = async () => {
    try {
      const response = await fetch(`/api/student/get-student-data`, {
        method: "GET",
      });
      const data = await response.json();
      console.log("data", data);
      setstudentData(data?.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to fetch data. Please try again.");
    }
  }
  const openModal = (id, type) => {
    setModalType(type);
    setCurrentClassId(id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalType(null);
    setCurrentClassId(null);
  };

  const handleButtonClick = (cardId, buttonType) => {
    setSelectedButton((prevState) => ({
      ...prevState,
      [cardId]: buttonType,
    }));
  };

  console.log("statusfilter", statusFilter);
  

  

  
  const fetchMyTutors = async () => {
    try {
      const response = await fetch("/api/student/my-tutors", {
        method: "GET",
      });
      const data = await response.json();
      console.log("data", data);
      setmyTutors(data?.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to fetch data. Please try again.");
    }
  };

  const requestStatusBgColor = {
    Pending: "#FEEDA7",
    Accepted: "#CFFDB2",
    Cancelled: "#FFC9BB",
  };

  const fetchData = async (status = "All") => {
    // Add status query parameter to the API call if status is not "All"
    const response = await fetch(
      `/api/student/view-session-requests?status=${status}`,
      {
        method: "GET",
      }
    );
    const data = await response.json();

    setTutorDetail(data);
  };

  //upcoming classes

  const scheduledClasses = async () => {
    const response = await fetch("/api/tutors/scheduled-classes");
    const data = await response.json();
    console.log("response1", data);
    setUpcomingClasses(data?.scheduledClasses);
  };
  

  const getPaymentDetails = async () => {
    // const toastId = toast.loading("Fetching payment details...");
    const response = await fetch(`/api/student/get-payment-details`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
     
    });

    const data = await response.json();
    // console.log("data", data);

    if (!response.ok) {
     
      return;
    }else{
      // toast.dismiss(toastId);
      setPaymentDetails(data?.paymentDetails);
      // toast.success(data.message || "Payment details fetched successfully.");
    }

    
  }
 
  
  const DurationTime = async (id) => {
    const durationResponse = await fetch(
      `/api/student/get-cancellation-duration`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      }
    );

    const durationData = await durationResponse.json();
    console.log("durationData", durationData);

    if (!durationResponse.ok) {
      toast.error(
        durationData.message ||
          "Failed to retrieve cancellation time. Please try again."
      );
      return;
    }

    const { cancellationDuration } = durationData;
    const Hours = cancellationDuration.split(":")[0];
    console.log("Hours", Hours);

    setHours(Hours);

    if (!Hours) return; // Exit if user does not confirm
  };
  const handleCancelClass = async (id) => {
    // Show a loading toast
    const toastId = toast.loading("Cancelling class...");

    try {
      closeModal();

      // Proceed with cancellation
      const response = await fetch(`/api/student/cancel-class`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id,hours }),
      });

      const data = await response.json();

      // Dismiss the loading toast
      toast.dismiss(toastId);

      if (response.ok) {
        toast.success(data.message || "Class cancelled successfully.");
        scheduledClasses(); // Refresh the scheduled classes list
      } else {
        toast.error(
          data.message || "Failed to cancel class. Please try again."
        );
      }
    } catch (error) {
      // Dismiss the loading toast and show an error message
      toast.dismiss(toastId);
      console.error("Failed to cancel class:", error);
      toast.error("Failed to cancel class. Please try again.");
    }
  };

  //  message based on the status filter if not present
  const getNoDataMessage = () => {
    if (statusFilter === "Accepted") return "No Accepted Class Requests";
    if (statusFilter === "Pending") return "No Pending Class Requests";
    if (statusFilter === "Cancelled") return "No Cancelled Class Requests";
    return "No Class Requests Available";
  };

  return (
    <div className={` ${poppins.className}   min-h-screen`}>
      <Toaster />
      <div className="container mx-auto px-[20px]  lg:px-[50px] xl:px-[86px]   py-10 ">
        <div className=" flex justify-between md:flex-row items-center  flex-col  gap-10 ">
          {/* Student Welcome */}
          <div className="flex flex-col">
          <h1 className="text-[20px] xl:text-[24px] font-[600] text-center md:text-start">
  Welcome,{" "}
  {studentData?.studentDetails?.firstName && studentData?.studentDetails?.lastName 
    ? `${studentData.studentDetails.firstName} ${studentData.studentDetails.lastName}` 
    : studentData?.username}
</h1>
            {/* <p className=" text-lg text-secondary-600 ">Payment Due: $50 </p> */}
          </div>

          {/* Warning If Payment Details are missing */}
          {paymentDetails.length === 0 ||
          paymentDetails?.cards?.length === 0 ? (
            <div className="w-full md:w-[70%] flex md:flex-row flex-col gap-4 md:gap-0 justify-around items-center h-fit md:h-[48px] py-[10px] md:py-0 bg-[rgba(131,192,193,0.30)]">
              <h3 className="text-[14px] md:text-[16px] md:text-start text-center font-[500] leading-normal">
                Payment details missing. Please update your info.
              </h3>
              <Link href="/student/student-profile/payment">
                <button className="bg-primary-400 text-white text-[12px] font-[600] rounded-[4px] px-[4px] md:px-8 py-[4px]">
                  Add Payment Method
                </button>
              </Link>
            </div>
          ) : null}
        </div>

        {/* Content Container */}
        <div className="flex md:flex-row flex-col justify-between  ">
          {/* Left Container */}
          <div className="w-full md:w-[36%] flex flex-col gap-8 ">
            {/*Find a Tutor */}
            <div
              className=" w-[full] flex flex-col items-center
            gap-6 border-[1px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.03)] 
            mt-10 rounded-[16px]  border-[rgba(0,0,0,0.05)] justify-center px-4  md:px-10 py-10 md:py-16 text-center"
            >
              <p className="w-full  md:w-[70%] text-[13px] md:text-[16px] font-[500]">
                Schedule your perfect tutor today and secure your learning
                journey.
              </p>
              <button className="bg-primary-400 text-white shadow-[0px_4px_4px_0px_rgba(0,0,0,0.02)] px-4 md:px-8 py-[2px] text-[12px] md:text-[15px] font-[600]  rounded-[4px] ">
                Find a Tutor
              </button>
            </div>

            {/* Class Requests */}
            <div className="border-[1px] rounded- border-solid border-[rgba(0, 0, 0, 0.05)] ">
              {/* Heading */}
              <div className=" flex justify-between md:justify-around items-center p-2 py-10">
                <h2 className="text-text-950 font-[600] text-[16px] md:text-[20px] ">
                  Class Requests
                </h2>
                <div className="px-2 border-[1px] h-fit  flex items-center justify-center border-solid border-text-200 rounded-[8px] py-[4px] bg-white w-fit">
                  <select
                    className="px-2 text-[10px] md:text-[13px] bg-white text-primary-400 font-[600] outline-none "
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="All">All</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Pending">Pending</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Cards Container */}
              <div className="flex flex-col overflow-y-auto custom-scrollbar   h-[300px]">
                {/* Card */}
                {tutorDetail.length > 0 ? (
                  tutorDetail?.map((request, index) => {
                    return (
                      <div
                        key={index}
                        className=" border-t-[1px] border-b-[1px] border-solid border-[rgba(0,0,0,0.08)] p-4 mb-6"
                      >
                        {/* Top content. (image, name, expertise and status) */}
                        <div className="flex  flex-col md:flex-row items-center md:items-start justify-between p-2">
                          <div className="w-full  md:w-fit flex items-center md:items-start  flex-col md:flex-row gap-2 p-2">
                            <div className=" rounded-[50%] w-[42px] h-[42px]">
                              <Image
                                src={
                                  request.tutorId?.tutorDetails?.profilePicture
                                }
                                width={42}
                                height={42}
                                className="h-auto w-auto"
                                alt={
                                  request.tutorId?.tutorDetails?.profilePicture
                                }
                              />
                            </div>
                            <div className="flex flex-col text-center md:text-start">
                              <h3 className="text-secondary-700 text-[16px] font-[600]  leading-normal">
                                {request.tutorId?.tutorDetails?.firstName}{" "}
                                {request.tutorId?.tutorDetails?.lastName}
                              </h3>

                              <p className="text-text-700 text-[12px] font-[500] leading-normal">
                                {/* {request.tutorId?.subjectsTaught[0].subjectExpertise   } */}
                                {request?.tutorId?.subjectsTaught.map(
                                  (subject, i) => (
                                    <span key={i}>
                                      {subject.subjectExpertise}
                                      {i <
                                        request.tutorId.subjectsTaught.length -
                                          1 && ", "}
                                    </span>
                                  )
                                )}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center  justify-center p-2">
                            <div
                              className={`rounded-[8px]  px-4 py-[5px] w-full text-[11px] font-[500] leading-normal text-text-700`}
                              style={{
                                backgroundColor: {
                                  Pending: "#FEEDA7",
                                  Accepted: "#CFFDB2",
                                  Cancelled: "#FFC9BB",
                                }[request.status],
                              }}
                            >
                              {request.status}
                            </div>
                          </div>
                        </div>

                        {/* Bottom content. (Date, time and duration) */}
                        <div className="flex  justify-between flex-col md:flex-row  mt-2 leading-normal ">
                          <div className="flex flex-col pl-4">
                            <p className="text-text-700 text-[12px] sm:text-[13px] font-[500] ">
                              Date:{" "}
                              <span className="text-secondary-600">
                                {request?.timeslot?.date}
                              </span>
                            </p>
                            <p className="text-text-700 text-[12px] md:text-[13px] font-[500] ">
                              Time:{" "}
                              <span className="text-secondary-600">
                                {request?.timeslot?.time}
                              </span>
                            </p>
                            <p className="text-text-700 text-[12px] md:text-[13px] font-[500] ">
                              TimeZone:{" "}
                              <span className="text-secondary-600">
                                {request.timeslot.timezone}-Time
                              </span>
                            </p>
                          </div>
                          <div className=" flex items-start  justify-start pl-4 md:pl-0 md:justify-center">
                            <p className="text-[12px] md:text-[13px] text-text-700 font-[500] ">
                              Duration:{" "}
                              <span className="text-secondary-600">
                                {request.classDuration}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  // No data message
                  <p className="text-center text-gray-500 mt-4">
                    {getNoDataMessage()}
                  </p>
                )}
              </div>
            </div>

            {/* Session History */}
            <div className="rounded-[16px_16px_0px_0px] border-[1px] rounded- border-solid border-[rgba(0, 0, 0, 0.05)]">
              {/* Heading Container */}
              <div className=" flex justify-start pl-6  p-2 py-6">
                <h2 className="text-text-950 font-[600] text-[16px] md:text-[20px] ">
                  Session History
                </h2>
              </div>

              {/* Cards Container */}
              <div className="flex flex-col overflow-y-auto custom-scrollbar h-[300px]">
  {/* Card */}
  {mytutors.length === 0 ? (
  <>
    <div className="flex justify-center items-center w-full h-full">
      <p className="text-text-700 text-[16px] font-[500]">No completed sessions</p>
    </div>
  </>
) : (
  mytutors.map((tutor, tutorIndex) => (
    <div key={tutorIndex}>
      {/* Completed Sessions for this Tutor */}
      {tutor.Completedsessions?.filter(
        (session) => session?.classStatus?.classStatus === "Completed" // Filter only completed sessions
      ).map((session, sessionIndex) => (
        <div
          key={sessionIndex}
          className="border-t-[1px] border-b-[1px] border-solid border-[rgba(0,0,0,0.08)] p-4 mb-6"
        >
          {/* Top content: Image, Name, Expertise */}
          <div className="flex justify-center md:justify-between p-2">
            <div className="w-fit flex flex-col items-center md:items-start md:flex-row gap-2 p-2">
              {/* Profile Picture */}
              <div className="rounded-[50%] w-[42px] h-[42px]">
                <Image
                  src={tutor.profilepicture || "/default-profile.png"} // Use the correct profile picture
                  width={42}
                  height={42}
                  className="h-auto w-auto"
                  alt={tutor.tutorname || "Tutor"}
                />
              </div>
              {/* Tutor Name and Subject */}
              <div className="flex flex-col text-center md:text-start">
                {/* Tutor Name */}
                <h3 className="text-secondary-700 text-[16px] font-[600]">
                  {tutor.tutorDetails?.firstName}{" "}
                  {tutor.tutorDetails?.lastName || "Unknown Tutor"}
                </h3>
                {/* Subject */}
                <p className="text-text-700 text-[12px] font-[500] leading-normal">
                  {session.subjectDetails?.subject || "No Subject"}
                </p>
              </div>
            </div>
          </div>

          {/* Bottom content: Date, Time, Duration */}
          <div className="flex justify-between flex-col md:flex-row leading-normal">
            <div className="flex flex-col pl-4">
              {/* Date */}
              <p className="text-text-700 text-[13px] font-[500]">
                Date:{" "}
                <span className="text-secondary-600">
                  {session.timeslot?.date || "No Date"}
                </span>
              </p>
              {/* Time */}
              <p className="text-text-700 text-[13px] font-[500]">
                Time:{" "}
                <span className="text-secondary-600">
                  {session.timeslot?.time || "No Time"}
                </span>
              </p>
            </div>
            <div className="flex items-start pl-4 md:pl-0 md:justify-center">
              {/* Duration */}
              <p className="text-[13px] text-text-700 font-[500]">
                Duration:{" "}
                <span className="text-secondary-600">
                  {session.classDuration || "No Duration"}
                </span>
              </p>
            </div>
          </div>

          {/* Add a Review Button */}
          <div className="flex justify-center mt-6 md:mt-0 md:justify-end">
            <button 
            onClick={() => {
              if (tutor.tutorId) {
                // Pass tutorDetails _id to the state
                setSelectedTutorId(tutor.tutorId);
              } else {
                console.warn("Tutor details not available or empty.");
              }
            }}
            className="bg-primary-400 px-4 py-2 text-[11px] rounded-[8px] font-[600] text-white">
              Add a Review
            </button>
          </div>
        </div>
      ))}
    </div>
  ))
)}

</div>


            </div>
          </div>

          {/* Right Container */}
          <div className=" w-full md:w-[60%] flex flex-col gap-[80px]">
            {/* My Tutors */}
            <div
              className=" w-[100%]  flex flex-col items-center
          gap-6 border-[1px] shadow-[0px_4px_10px_4px_rgba(0,0,0,0.03)] 
          mt-10 rounded-[16px] border-[rgba(0,0,0,0.05)] justify-center px-4 md:px-10 py-6 md:py-16 text-center"
            >
              <div className=" w-[100%] flex items-center justify-between ">
                <h1 className="text-[16px] md:text-[20px] font-[600] leading-normal">
                  My Tutors
                </h1>
                <div
                  className="text-[12px] md:text-[13px] font-[600] flex items-center justify-center leading-normal text-primary-400 bg-white px-2 rounded-[8px]
                border-[1px] border-solid border-text-200 py-[4px]"
                >
                  <select className="px-2 bg-white outline-none">
                    <option value="Recent">Recent</option>
                    <option value="Previous">Previous</option>
                  </select>
                </div>
              </div>

              <div className="w-[100%] h-[300px] flex flex-col md:flex-row overflow-y-auto md:overflow-x-auto custom-scrollbar">
  {mytutors.map((tutor, index) => (
    <div
      key={index}
      className="bg-text-50 rounded-[10px] max-w-[100%] min-w-[100%] md:max-w-[246px] md:mr-6 mb-6 md:min-w-[246px] min-h-[239px] gap-2 px-4 flex flex-col items-center justify-center"
    >
      {/* Tutor Profile Picture */}
      <div className="w-[77px] h-[77px] rounded-full">
        <Image
          src={tutor.profilepicture || "/default-profile.png"} // Correctly access profile picture
          width={77}
          height={77}
          alt="Tutor Profile"
        />
      </div>

      {/* Tutor Name */}
      <h3 className="text-secondary-700 text-[16px] font-[600]">
        {tutor.tutorDetails?.firstName}{" "}
        {tutor.tutorDetails?.lastName || "Unknown Tutor"}
      </h3>

      {/* Subjects */}
      <p className="text-[12px] capitalize font-[500]">
        Subject:{" "}
        <span>
          {tutor.subjects?.length > 10
            ? `${tutor.subjects.slice(0, 10).join(", ")}, ...`
            : tutor.subjects?.join(", ") || "N/A"}
        </span>
      </p>

      {/* Buttons */}
      <div className="flex mt-4 flex-col md:flex-row text-[10px] gap-4 justify-around md:gap-6 font-[600]">
        <Link href={`/chat?tutorId=${tutor.tutorId}`}>
        <button 
        className="border-primary-400 border-[2px] text-primary-400 px-6 py-[2px] rounded-[4px]">
          Message
        </button>
        </Link>
        <button
          onClick={() => {
            if (tutor.tutorId) {
              // Pass tutorDetails _id to the state
              setViewTutor(tutor.
                tutorId
                );
            } else {
              console.warn("Tutor details not available or empty.");
            }
          }}
          className="bg-primary-400 text-nowrap px-6 py-[2px] rounded-[4px] text-white"
        >
          View Profile
        </button>
      </div>
    </div>
  ))}
</div>

            </div>

            {/* Scheduled Classes */}
            <div
              className="flex flex-col pl-4 md:px-10 py-6  rounded-[16px] shadow-[0px_2px_4px_2px_rgba(0,0,0,0.03)]
            border-[2px] border-solid border-[rgba(0,0,0,0.05)]"
            >
              <h1 className=" font-[600] text-[14px] sm:text-[16px] md:text-[18px] text-center md:text-start  lg:text-[20px] leading-normal mb-8 ">
                Upcoming Classes
              </h1>

              <div className="flex mt-4  overflow-y-auto flex-col md:flex-row h-[400px] md:overflow-x-auto custom-scrollbar ">
                {upcomingClasses?.length === 0 ? (
                  // Display this message when there are no scheduled classes
                  <div className="flex justify-center items-center w-full h-full">
                    <p className="text-text-700 text-[16px] font-[500]">
                      No scheduled classes
                    </p>
                  </div>
                ) : (
                  // Map through upcoming classes if they exist
                  upcomingClasses?.map((scheduledClass, index) => {
                    return (
                      <div
                        key={index}
                        className="bg-text-50 rounded-[10px] w-full md:max-w-[300px] md:mr-6 mb-6 md:min-w-[266px] min-h-[280px] gap-[4px] px-4 w flex flex-col justify-center"
                      >
                        <div className="flex items-center  flex-col gap-2">
                          <div className="w-[41px] h-[41px] ">
                            <Image
                              src={scheduledClass.tutorProfilePicture}
                              width={41}
                              height={41}
                              unoptimized
                              alt={scheduledClass.tutorProfilePicture}
                              className="h-auto w-auto"
                            />
                          </div>
                          <div className="text-secondary-700 font-[600] text-[14px] md:text-[16px] ">
                            <p>{scheduledClass.tutorName}</p>
                          </div>
                        </div>
                        <div className=" flex ">
                          <p className="text-text-700  capitalize text-[11px] sm:text-[13px] font-[500] leading-normal ">
                            Subject:{" "}
                            <span className="text-secondary-600">
                              {scheduledClass.subjectDetails.subject}
                            </span>
                          </p>
                        </div>
                        <div className="flex  -mt-[6px] sm:mt-0 flex-col justify-between">
                          <div className="flex">
                            <p className="text-text-700 text-[11px] sm:text-[13px] font-[500] leading-normal ">
                              Time:{" "}
                              <span className="text-secondary-600">
                                {scheduledClass?.timeslot?.time}
                              </span>
                            </p>
                          </div>
                          <div className="flex">
                            <p className="text-text-700 text-[11px] sm:text-[13px] font-[500] leading-normal ">
                              TimeZone:{" "}
                              <span className="text-secondary-600">
                                {scheduledClass?.timeslot?.timezone}-Time
                              </span>
                            </p>
                          </div>
                          <div className="w-full  mt-1">
                            <p className="text-text-700 text-[12px] sm:text-[13px] font-[500] leading-normal">
                              Day:{" "}
                              <span className="text-secondary-600">
                                {(
                                  scheduledClass.timeslot?.date
                                )}
                              </span>
                            </p>
                          </div>
                          <div className="w-full ">
                            <p className="text-text-700 text-[12px] sm:text-[13px] font-[500] leading-normal">
                              Duration:{" "}
                              <span className="text-secondary-600">
                                {scheduledClass.classDuration}
                              </span>
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col items-center gap-4 h-[40%] justify-center">
                          <button
                            onClick={() => {
                              handleButtonClick(
                                scheduledClass._id,
                                "Reschedule"
                              );
                              DurationTime(scheduledClass._id);
                              openModal(scheduledClass._id, "Reschedule");
                            }}
                            className={`${
                              selectedButton[scheduledClass._id] ===
                              "Reschedule"
                                ? "bg-primary-400 text-white"
                                : "bg-white text-primary-400"
                            } border-2 border-primary-400 py-[4px] w-[80%] font-[600] rounded-[4px] text-[11px]`}
                          >
                            Reschedule
                          </button>

                          <button
                            onClick={() => {
                              handleButtonClick(scheduledClass._id, "Cancel");
                              DurationTime(scheduledClass._id);
                              openModal(scheduledClass._id, "Cancel");
                            }}
                            className={`${
                              selectedButton[scheduledClass._id] === "Cancel"
                                ? "bg-primary-400 text-white"
                                : "bg-white text-primary-400"
                            } border-2 border-primary-400 py-[4px] w-[80%] font-[600] rounded-[4px] text-[11px]`}
                          >
                            Cancel
                          </button>

                          <button
                            onClick={() => {
                              handleButtonClick(scheduledClass._id, "Join");
                              const formattedUrl = encodeURIComponent(
                                scheduledClass?.videoUrlArray
                              );
                              window.location.href = `/video/${formattedUrl}`;
                            }}
                            className={`${
                              selectedButton[scheduledClass._id] === "Join"
                                ? "bg-primary-400 text-white"
                                : "bg-white text-primary-400"
                            } border-2 border-primary-400 py-[4px] w-[80%] font-[600] rounded-[4px] text-[11px]`}
                          >
                            Join
                          </button>
                        </div>
                        {/* Modal */}
                        {isModalOpen &&
                          currentClassId === scheduledClass._id && (
                            <div
                              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                              onClick={closeModal}
                            >
                              <div
                                className="relative bg-white w-full max-w-2xl p-8 rounded-lg shadow-lg max-h-[80vh] custom-scrollbar overflow-y-auto"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {/* Close Button */}
                                <button
                                  onClick={closeModal}
                                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                                >
                                  <FiX size={24} />
                                </button>

                                {modalType === "Cancel" ? (
                                  <>
                                    <h2 className="text-[16px] font-semibold text-gray-800 text-center mb-4">
                                      If you cancel this class within {hours}{" "}
                                      hours before the class time, you will be
                                      charged based on the duration period. Are
                                      you sure you want to cancel?
                                    </h2>
                                    <div className="flex justify-center gap-4 mt-6">
                                      <button
                                        onClick={() =>
                                          handleCancelClass(scheduledClass._id)
                                        }
                                        className="bg-red-500 text-white py-2 px-4 rounded-lg"
                                      >
                                        Yes, Cancel
                                      </button>
                                      <button
                                        onClick={closeModal}
                                        className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg"
                                      >
                                        No, Go Back
                                      </button>
                                    </div>
                                  </>
                                ) : modalType === "Reschedule" ? (
                                  <>
                                    {showRequestSession ? (
                                      <ScheduledSession
                                        scheduledClassId={scheduledClass?._id}
                                        tutorId={scheduledClass?.tutorId}
                                        setShowModal={closeModal}
                                      />
                                    ) : (
                                      <div>
                                        <h2 className="text-[16px] font-semibold text-gray-800 text-center mb-4">
                                          If you want to reschedule this class
                                          within {hours} hours before the class
                                          time, you will be charged based on the
                                          duration period. Are you sure you want
                                          to cancel?
                                        </h2>

                                        <div className="flex justify-center gap-4 mt-6">
                                          <button
                                            onClick={() =>
                                              setShowRequestSession(true)
                                            } // Show RequestSession component
                                            className="bg-red-500 text-white py-2 px-4 rounded-lg"
                                          >
                                            Yes, Reschedule
                                          </button>
                                          <button
                                            onClick={closeModal} // Close the modal without rendering RequestSession
                                            className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg"
                                          >
                                            No, Go Back
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </>
                                ) : null}
                              </div>
                            </div>
                          )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
