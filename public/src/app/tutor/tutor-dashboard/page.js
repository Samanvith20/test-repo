"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { Poppins } from "next/font/google";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";
import CustomCircularProgressBar from "../../components/ChartComponent";
import CustomDatePicker from "../../components/CustomDatePicker/CustomDatePicker";
import EarningsLineChart from "../../components/EarningsChartComponent";
import Link from "next/link";
import { Toaster, toast } from "react-hot-toast";
import { FaTimes } from "react-icons/fa";
import { DateTime } from "luxon";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Spinner Component
const Spinner = () => (
  <div className="flex justify-center items-center h-24">
    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4  border-secondary-600"></div>
  </div>
);

const Page = () => {
  const [studentDetail, setStudentDetail] = useState([]);
  const [filterType, setFilterType] = useState("All");
  const [selectedButton, setSelectedButton] = useState("Join");
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [classActive, setClassActive] = useState(false);
  console.log("upcomingClasses", upcomingClasses);

  // const reviewsList = [
  //   {
  //     _id: 1,
  //     studentImageUrl: "/images/student-dashboard-tutor-3-small.png",
  //     studentName: "Harry",
  //     reviewRating: 4,
  //     reviewContent:
  //       "Explains complex topics in a simple, clear way that makes learning easy and enjoyable. I’ve gained so much confidence in my understanding thanks to their teaching style",
  //   },
  //   {
  //     _id: 2,
  //     studentImageUrl: "/images/student-dashboard-tutor-3-small.png",
  //     studentName: "Harry",
  //     reviewRating: 4,
  //     reviewContent:
  //       "Explains complex topics in a simple, clear way that makes learning easy and enjoyable. I’ve gained so much confidence in my understanding thanks to their teaching style",
  //   },
  //   {
  //     _id: 3,
  //     studentImageUrl: "/images/student-dashboard-tutor-3-small.png",
  //     studentName: "Harry",
  //     reviewRating: 3,
  //     reviewContent:
  //       "Explains complex topics in a simple, clear way that makes learning easy and enjoyable. I’ve gained so much confidence in my understanding thanks to their teaching style",
  //   },
  //   {
  //     _id: 4,
  //     studentImageUrl: "/images/student-dashboard-tutor-3-small.png",
  //     studentName: "Harry",
  //     reviewRating: 2,
  //     reviewContent:
  //       "Explains complex topics in a simple, clear way that makes learning easy and enjoyable. I’ve gained so much confidence in my understanding thanks to their teaching style",
  //   },
  // ];

  const [reviewsList, setReviewsList] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [tutor, setTutor] = useState({});

  const handleButtonClick = (cardId, buttonType) => {
    setSelectedButton((prevState) => ({
      ...prevState,
      [cardId]: buttonType,
    }));
  };

  const timezoneMapping = {
    Hawaii: "Pacific/Honolulu",
    Alaska: "America/Anchorage",
    Pacific: "America/Los_Angeles",
    Mountain: "America/Denver",
    Central: "America/Chicago",
    Eastern: "America/New_York",
  };
  const today = new Date();

  const [sessionRequestLoading, setSessionRequestLoading] = useState(true);
  const [showReschedulePopUp, setShowReschedulePopUp] = useState(false);
  const [showRescheduleSlot, setShowRescheduleSlot] = useState(false);
  const [upcomingClassesLoading, setUpcomingClassesLoading] = useState(true);

  const [selectedDate, setSelectedDate] = useState(() => {
    // Format the date in 'YYYY-MM-DD' using local time
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`; // Return formatted date as 'YYYY-MM-DD'
  });

  // Helper Functions
  const formatDateToStandard = (dateString) => {
    const parts = dateString.split("-");
    if (parts.length !== 3) return dateString;
    if (parts[0].length === 4) {
      // Already in 'yyyy-mm-dd'
      return dateString;
    } else {
      // 'mm-dd-yyyy' to 'yyyy-mm-dd'
      const [month, day, year] = parts;
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }
  };
  const parseDuration = (timeStr) => {
    const [start, end] = timeStr.split(" - ");
    const [startHour, startMinute] = start.split(":").map(Number);
    const [endHour, endMinute] = end.split(":").map(Number);

    let startTimeInMinutes = startHour * 60 + startMinute;
    let endTimeInMinutes = endHour * 60 + endMinute;

    if (endTimeInMinutes < startTimeInMinutes) {
      endTimeInMinutes += 24 * 60; // Handle overnight times
    }

    const durationInMinutes = endTimeInMinutes - startTimeInMinutes;
    const durationInHours = durationInMinutes / 60;

    return durationInHours;
  };

  // Filter classes scheduled on the selected date
  const classesOnSelectedDate = upcomingClasses.filter((scheduledClass) => {
    const classDate = formatDateToStandard(scheduledClass.timeslot.date);
    const selectedDateFormatted = formatDateToStandard(selectedDate);
    return classDate === selectedDateFormatted;
  });

  // Calculate total hours for classes on the selected date
  const totalHours = classesOnSelectedDate.reduce((sum, scheduledClass) => {
    const duration = parseDuration(scheduledClass.timeslot.time);
    return sum + duration;
  }, 0);

  const showReviewStars = (rating) => {
    const totalStars = 5;
    console.log("rating", rating);
    const filledStars = Math.floor(rating); // Number of full stars
    const hasHalfStar = rating % 1 !== 0; // Check if there is a half star
    const emptyStars = totalStars - filledStars - (hasHalfStar ? 1 : 0); // Remaining empty stars

    return (
      <div className="flex">
        {Array(filledStars)
          .fill()
          .map((_, index) => (
            <AiFillStar key={`filled-${index}`} className="text-yellow-500" />
          ))}
        {/* {hasHalfStar && <RiStarSFill className="text-yellow-500" style={{ clipPath: "inset(0 50% 0 0)" }} />} */}
        {Array(emptyStars)
          .fill()
          .map((_, index) => (
            <AiOutlineStar key={`empty-${index}`} className="text-yellow-500" />
          ))}
      </div>
    );
  };

  useEffect(() => {
    const getTutors = async () => {
      try {
        const response = await fetch("/api/tutors/tutorprofile");
        const data = await response.json();

        if (response.ok) {
          setTutor(data.tutor);
        } else {
          console.log("Error while fetching tutor details: ", data.message);
        }
      } catch (error) {
        console.log("Error while fetching the tutor details: ", error);
      }
    };
    getTutors();
  }, []);

  // Reschedule form component
  function RescheduleForm({ scheduledClass }) {
    // Function to generate timeslots
    const generateTimeslots = () => {
      const timeslots = [];
      for (let hour = 0; hour < 24; hour++) {
        const start = hour.toString().padStart(2, "0") + ":00";
        const end = (hour + 1).toString().padStart(2, "0") + ":00";
        timeslots.push(`${start} - ${end}`);
      }
      return timeslots;
    };

    // Generate timeslots
    const timeslots = generateTimeslots();

    return (
      <form
        className=" bg-white  rounded-lg "
        onSubmit={(event) => handleReschedule(event, scheduledClass)}
      >
        {/* Timeslot Selection */}
        <div className="mb-4">
          <label
            htmlFor="timeslot"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Timeslot
          </label>
          <select
            id="timeslot"
            name="timeslot"
            required
            className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500"
          >
            <option value="" disabled defaultValue="">
              Select timeslot
            </option>
            {timeslots.map((slot, index) => (
              <option value={slot} key={index}>
                {slot}
              </option>
            ))}
          </select>
        </div>

        {/* Date Selection */}
        <div className="mb-4">
          <label
            htmlFor="date"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Date
          </label>
          <input
            id="date"
            name="date"
            type="date"
            required
            className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500"
          />
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            onClick={() => {
              setShowReschedulePopUp(false);
            }}
            className="bg-secondary-700 outline-primary-400 text-white font-medium w-full text-center py-2 rounded-lg hover:bg-secondary-800 "
          >
            Reschedule Class
          </button>
        </div>
      </form>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    console.log("Fromat Date: ", dateString);
    const options = { day: "numeric", month: "long", year: "numeric" };
    const formattedDate = date.toLocaleDateString("en-US", options);

    // Get the day and format it with suffix
    const day = date.getDate();
    const suffix = (day) => {
      if (day > 3 && day < 21) return "th"; // Catch 11th, 12th, 13th
      switch (day % 10) {
        case 1:
          return "st";
        case 2:
          return "nd";
        case 3:
          return "rd";
        default:
          return "th";
      }
    };

    // Return the formatted date with the suffix
    return `${day}${suffix(day)} ${
      formattedDate.split(" ")[0]
    }, ${date.getFullYear()}`;
  };

  //  fetch details
  const fetchData = async () => {
    try {
      setSessionRequestLoading(true);
      const response = await fetch(
        `/api/student/view-session-requests?filterType=${filterType}&status=Pending`,
        {
          method: "GET",
        }
      );
      const data = await response.json();

      console.log("response1", data);

      if (Array.isArray(data)) {
        setStudentDetail(data);
        setSessionRequestLoading(false);
      }
    } catch (error) {
      setSessionRequestLoading(false);
      console.log("Error while fetching the session requests");
      toast.error("Error while fetching the session requests.");
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterType]);

  useEffect(() => {
    if (showReschedulePopUp || showRescheduleSlot) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => document.body.classList.remove("overflow-hidden");
  }, [showReschedulePopUp, showRescheduleSlot]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setShowReschedulePopUp(false);
        setShowRescheduleSlot(false);
      }
    };

    if (showReschedulePopUp || showRescheduleSlot) {
      document.addEventListener("keydown", handleEscape);
    } else {
      document.removeEventListener("keydown", handleEscape);
    }

    return () => document.removeEventListener("keydown", handleEscape);
  }, [showReschedulePopUp, showRescheduleSlot]);

  const fetchReviews = async () => {
    setReviewsLoading(true); // Ensure loading state is set at the beginning
    try {
      const response = await fetch("/api/tutors/get-reviews");

      // Check for non-OK responses
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch reviews.");
      }

      // Parse response data
      const data = await response.json();
      console.log("reviews: ", data.reviews);
      // Update the reviews list state
      setReviewsList(data.reviews || []); // Ensure fallback to an empty array if `reviews` is undefined
    } catch (error) {
      console.error("Error while fetching the reviews:", error.message);
    } finally {
      // Ensure loading state is reset even if an error occurs
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  //upcoming classes
  const scheduledClasses = async () => {
    try {
      const response = await fetch("/api/tutors/scheduled-classes");

      if (!response.ok) {
        throw new Error(
          `Failed to fetch scheduled classes: ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("data::", data);

      setUpcomingClasses(data?.scheduledClasses);
      setUpcomingClassesLoading(false);
    } catch (error) {
      console.error("Error fetching scheduled classes:", error);
      // Optionally, you can set an error state or display an error message to the user.
    }
  };

  useEffect(() => {
    scheduledClasses();
  }, []);

  const handleJoinButton = async (classId, index) => {
    console.log("classId", classId);
    const toastId = toast.loading("Checking the class status...");
    try {
      const response = await fetch(`/api/tutors/join-class`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: classId }),
      });
      const data = await response.json();
      console.log("responseJoin", data);

      if (response.ok) {
        setClassActive(data.classActive);
        if (data.classActive === true) {
          toast.success("Joining the class...", { id: toastId });
          const formattedUrl = encodeURIComponent(
            upcomingClasses[index]?.videoUrlArray
          );
          window.location.href = `/video/${formattedUrl}`;
        }else{
          toast('The class is not active please wait⌛', {id: toastId})
        }
      } else {
        // Handle errors
        console.error(data.message);
      }
    } catch (error) {
      console.error("Error joining class:", error);
    }
  };

  const handleCancelRequest = async (requestId, studentname, tutorId) => {
    const toastId = toast.loading("Cancelling Session Request...");
    try {
      const response = await fetch("/api/tutors/class-requests", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: requestId,
          name: studentname,
          tutorId: tutorId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete class request");
      }

      if (response.status === 404) {
        // toast.error("Session Request Not Found.", { id: toastId });
        throw new Error("Class request not found");
      }

      // If response is successful, re-fetch the scheduled classes
      if (response.status === 200) {
        scheduledClasses();
        // we need to filterout that requets from the list
        setUpcomingClasses(
          upcomingClasses.filter((request) => request._id !== requestId)
        );
        // alert("Class request canceled.");
        toast.success("Session Request Rejected.", { id: toastId });
        fetchData();
      }
    } catch (error) {
      console.error("Error canceling request:", error);
      // alert("Error canceling class request. Please try again.");
      toast.error("Error canceling class request. Please try again.", {
        id: toastId,
      });
    }
  };

  const handleCancelClass = async (classId) => {
    // Show a loading toast
    const toastId = toast.loading("Cancelling class...");
    try {
      const response = await fetch(`/api/tutors/cancel-class`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: classId }),
      });

      const data = await response.json();
      // Dismiss the loading toast
      toast.dismiss(toastId);
      console.log("response", data);

      if (response.ok) {
        // Show success toast message with backend message
        toast.success(data.message || "Class cancelled successfully.", {
          id: toastId,
        });
        scheduledClasses();
      } else {
        // Show error toast message with backend message
        toast.error(
          data.message || "Error cancelling class. Please try again.",
          { id: toastId }
        );
      }
    } catch (error) {
      console.error("Error cancelling class:", error);
      toast.error("Error canceling class. Please try again.");
    }
  };

  const handleReschedule = async (event, scheduledClass) => {
    event.preventDefault(); // Prevent form submission refresh
    try {
      const toastId = toast.loading("Validating reschedule timeslot...");

      // Extract form data
      const form = event.target;
      let rescheduledTimeslot = {
        time: form.timeslot.value, // Selected timeslot
        date: form.date.value, // Selected date
        timezone: scheduledClass.timeslot.timezone, // Existing timezone
      };

      // 1. Validate that the rescheduleTimeslot is not in the past
      const { date, time, timezone } = rescheduledTimeslot;
      const [startHour, startMinute] = time.split(" - ")[0].split(":");
      const rescheduleDateTime = DateTime.fromFormat(
        `${date} ${startHour}:${startMinute}`,
        "yyyy-MM-dd HH:mm",
        { zone: timezoneMapping[timezone] }
      );

      const nowInTutorTimeZone = DateTime.now().setZone(
        timezoneMapping[timezone]
      );

      if (rescheduleDateTime <= nowInTutorTimeZone) {
        toast.error("Please select a future time slot.", {
          id: toastId,
        });
        return;
      }

      // 2. Validate that the rescheduleTimeslot is not in the upcoming classes
      const isConflict = upcomingClasses.some((upcomingClass) => {
        // console.log(
        //   "Comparing with Upcoming Class Timeslot:",
        //   upcomingClass.timeslot
        // );
        // console.log("Reschedue timeSlot: ", rescheduledTimeslot);
        // Normalize `upcomingClass.timeslot.date` (mm/dd/yyyy) to yyyy-mm-dd
        const [upMonth, upDay, upYear] = upcomingClass.timeslot.date.split("-");
        const normalizedUpcomingDate = `${upYear}-${upMonth}-${upDay}`;

        // Normalize `rescheduledTimeslot.date` (dd/mm/yyyy) to yyyy-mm-dd
        const [resYear, resMonth, resDay] = rescheduledTimeslot.date.split("-");
        const normalizedRescheduledDate = `${resYear}-${resMonth}-${resDay}`;

        // console.log("Normalized Upcoming Date:", normalizedUpcomingDate);
        // console.log("Normalized Rescheduled Date:", normalizedRescheduledDate);

        // Compare normalized dates and times
        console.log(
          "Comparing Dates:",
          normalizedUpcomingDate,
          "===",
          normalizedRescheduledDate
        );
        console.log(
          "Comparing Times:",
          upcomingClass.timeslot.time,
          "===",
          rescheduledTimeslot.time
        );

        const dateMatches =
          normalizedUpcomingDate === normalizedRescheduledDate;
        const timeMatches =
          upcomingClass.timeslot.time === rescheduledTimeslot.time;

        // console.log("Date Matches:", dateMatches);
        // console.log("Time Matches:", timeMatches);

        return dateMatches && timeMatches;
      });

      if (isConflict) {
        console.error(
          "Conflict Found! The rescheduled timeslot matches an existing upcoming class."
        );
        toast.error(
          "The selected reschedule timeslot conflicts with another upcoming class.",
          { id: toastId }
        );
        return;
      }

      // console.log("No conflict detected. Proceeding...");
      const [resYear, resMonth, resDay] = rescheduledTimeslot.date.split("-");
      rescheduledTimeslot.date = `${resMonth}-${resDay}-${resYear}`;
      // console.log("RescheduleTimeslot: ", rescheduledTimeslot);

      // Update the message while keeping the toast in the loading state
      toast.loading(
        "Validation complete. Sending reschedule request to the student...",
        {
          id: toastId, // Update the existing toast
        }
      );
      // Prepare payload
      const payload = {
        studentUsername: scheduledClass.studentUsername,
        tutorId: scheduledClass.tutorId,
        timeslot: scheduledClass.timeslot,
        classToBeRescheduled: scheduledClass._id,
        rescheduledTimeslot, // Include the validated timeslot
      };

      // Make API request
      const response = await fetch("/api/tutors/reschedule-initiation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json(); // Parse the response body

      if (response.ok) {
        toast.success(
          result.message || "Reschedule request sent successfully!",
          {
            id: toastId,
          }
        );
      } else {
        toast.error(result.message || "Failed to send reschedule request.", {
          id: toastId,
        });
      }
    } catch (error) {
      console.error("Error while rescheduling the class", error);
      toast.error("Something went wrong while rescheduling.");
    }
  };

  //  message based on the status filter if not present
  const getNoDataMessage = () => {
    if (filterType === "All") return " No Requests";
    if (filterType === "Recent") return "No Recent  Requests";
    if (filterType === "Previous") return "No Previous  Requests";
    return "No Class Requests Available";
  };

  return (
    <div className={`${poppins.className}`}>
      <Toaster />
      <div className="container mx-auto px-[20px] lg:px-[50px] xl:px-[86px] pt-10">
        {/* Welcome Message */}
        <div className=" flex items-center sm:flex-row flex-col gap-2 sm:gap-0 justify-between">
          <h1 className="text-[14px] sm:text-[18px] md:text-[22px] lg:text-[24px] font-[600] ">
            Welcome {tutor?.tutorDetails?.firstName || "Tutor"}{" "}
            {tutor?.tutorDetails?.lastName || "Name"}
          </h1>
          <Link href="/book-a-session">
            <button className="bg-primary-400 rounded-[4px] text-[10px] lg:text-[13px] h-[32px] lg:h-[36px] font-[600] text-white w-[140px] lg:w-[180px] p-[10px]">
              Book a Session
            </button>
          </Link>
        </div>

        {/* Content Container */}
        <section className="flex lg:flex-row flex-col justify-between mt-10 mb-14">
          {/* Left Container (Requests and Student Reviews) */}
          <aside className="space-y-[40px] w-[full] lg:w-[36%] ">
            {/* Requests Container*/}
            <div className=" rounded-t-[16px] bg-[#FFFDFD] border-[1px] border-solid border-[rgba(0,0,0,0.05)] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.03)]">
              {/* Heading */}
              <div className=" flex justify-between px-4 lg:px-6 items-center py-4 lg:py-10">
                <h2 className="text-text-950 font-[600] text-[14px] sm:text-[16px] md:text-[18px]  lg:text-[20px] ">
                  Requests
                </h2>
                <div className="px-2 border-[1px] border-solid flex items-center justify-center border-text-200 rounded-[8px] py-[1px] bg-white w-fit">
                  <select
                    className="px-2 text-[10px] bg-white lg:text-[13px] text-primary-400 font-[600] outline-none "
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <option value="All">All</option>
                    <option value="Recent">Recent</option>
                    <option value="Previous">Previous</option>
                  </select>
                </div>
              </div>

              {/* Card Container */}
              <div className="flex  flex-col max-h-[550px] overflow-y-auto custom-scrollbar">
                {/* CARD */}
                {sessionRequestLoading === true ? (
                  <Spinner />
                ) : studentDetail.length > 0 ? (
                  studentDetail?.map((request, index) => {
                    return (
                      <div
                        key={index}
                        className=" border-t-[1px] border-b-[1px] border-solid border-[rgba(0,0,0,0.08)] p-4 mb-6"
                      >
                        {/* Top content. (image, name, expertise and status) */}
                        <div className="flex justify-between ">
                          <div className="  w-fit flex gap-2 ">
                            <div className="rounded-[50%] w-[42px] h-[42px]">
                              <Image
                                src={
                                  request.studentImageUrl ||
                                  "/images/student-dashboard-tutor-3-small.png"
                                }
                                width={42}
                                height={42}
                                className="h-auto w-auto"
                                alt={
                                  request.studentName || "Student profile image"
                                }
                              />
                            </div>
                            <div className="flex items-center justify-center">
                              <h3 className="text-secondary-700 md:text-[14px] text-[12px] lg:text-[16px] font-[600] leading-normal">
                                {request.studentUsername}
                              </h3>
                            </div>
                          </div>

                          <div className=" flex items-center justify-center ">
                            <div
                              className={`  py-[5px] w-full text-[10px] sm:text-[13px] font-[600] leading-normal text-text-700`}
                            >
                              {request.Time}
                            </div>
                          </div>
                        </div>

                        {/* Bottom content. (Description, Date, Time and Duration) */}
                        <div className="flex  justify-between mt-2 flex-col leading-normal ">
                          <div className=" mb-2">
                            <p className="text-text-700 text-[10px] sm:text-[13px] leading-normal font-[400] ">
                              {request.classDescription}
                            </p>
                          </div>
                          <div className="flex flex-col sm:flex-row justify-between  ">
                            <div className="flex flex-col  ">
                              <p className=" text-text-700 text-[10px] sm:text-[13px] font-[500] ">
                                Date:{" "}
                                <span className="text-secondary-600">
                                  {request?.timeslot?.date}
                                </span>
                              </p>
                              <p className="text-text-700 text-[10px] sm:text-[13px] font-[500] ">
                                Time:{" "}
                                <span className="text-secondary-600">
                                  {request.timeslot?.time}
                                </span>
                              </p>
                            </div>

                            <div className=" flex justify-start sm:justify-center">
                              <p className="text-[10px] sm:text-[13px] text-text-700 font-[500] ">
                                Duration:{" "}
                                <span className="text-secondary-600">
                                  {request.classDuration}
                                </span>
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-4 ml-auto mt-4 ">
                            <button
                              onClick={() =>
                                handleCancelRequest(
                                  request._id,
                                  request.studentUsername,
                                  request.tutorId
                                )
                              }
                              className="bg-white border-[2px] rounded-[4px] border-primary-400 w-[65px] sm:w-[75px] h-[22px] sm:h-[24px] flex items-center justify-center text-[10px] sm:text-[11px] font-[500] text-primary-400"
                            >
                              Cancel
                            </button>
                            <Link
                              href={`/book-a-session?name=${request?.studentUsername}&slotTime=${request?.timeslot.time}&slotDate=${request?.timeslot.date}&timezone=${request?.timeslot.timezone}`}
                            >
                              <button className="bg-primary-400 rounded-[4px]  w-[65px] sm:w-[75px] h-[22px] sm:h-[24px] flex items-center justify-center text-[10px] sm:text-[11px] font-[500] text-white">
                                Accept
                              </button>
                            </Link>
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

            {/* Student Reviews Container*/}
            <div className=" rounded-t-[16px] bg-[#FFFDFD] border-[1px] border-solid border-[rgba(0,0,0,0.05)] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.03)]">
              {/* Heading */}
              <div className=" flex justify-between px-4 sm:flex-row flex-col gap-4 sm:gap-0 lg:px-6 py-4 lg:py-10">
                <h2 className="text-text-950 font-[600] text-[14px] sm:text-[16px] md:text-[18px]  lg:text-[20px] ">
                  Student Reviews
                </h2>
                <div className="px-2 border-[1px] flex items-center justify-center border-solid border-text-200 rounded-[8px] py-[1px] bg-white w-fit">
                  <select className="px-2 bg-white text-[10px] lg:text-[13px] text-primary-400 font-[600] outline-none ">
                    <option value="All">Recent</option>
                    <option value="Accepted">Previous</option>
                  </select>
                </div>
              </div>

              {/* Card Container */}
              <div className="flex flex-col max-h-[585px] overflow-y-auto custom-scrollbar">
                {/* CARD */}

                {reviewsLoading === true ? (
                  <Spinner />
                ) : reviewsList.length > 0 ? (
                  reviewsList.map((review, index) => {
                    return (
                      <div
                        key={index}
                        className=" border-t-[1px] border-b-[1px] border-solid border-[rgba(0,0,0,0.08)] p-4 mb-6"
                      >
                        {/* Top content. (image, name, expertise and status) */}
                        <div className="flex justify-between">
                          <div className="w-fit flex gap-2 ">
                            <div className="rounded-[50%] w-[42px] h-[42px]">
                              <Image
                                src={
                                  review.studentImageUrl ||
                                  "/images/student-dashboard-tutor-3-small.png"
                                }
                                width={42}
                                height={42}
                                className="h-auto w-auto"
                                alt={review.studentImageUrl || "student image"}
                              />
                            </div>
                            <div className="flex flex-col items-start justify-center">
                              <h3 className=" text-secondary-700 text-[14px] lg:text-[16px] font-[600] leading-normal">
                                {review.studentName}
                              </h3>
                              <div className=" text-[13px] font-[500] flex items-center gap-2 text-text-700">
                                {showReviewStars(review.rating)}{" "}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-center ">
                            <div
                              className={`  py-[5px] w-full text-[13px] font-[600] leading-normal text-text-700`}
                            >
                              {/* {request.timeElapsedFromRequest} */}
                            </div>
                          </div>
                        </div>

                        {/* Bottom content. (Description, Date, Time and Duration) */}
                        <div className="flex  justify-between mt-2 flex-col leading-normal ">
                          <div className=" mb-2">
                            <p className="text-text-700 text-[10px] text-justify lg:text-[13px] leading-normal font-[400] ">
                              {review.reviewContent}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center text-gray-500 mt-4">
                    No Reviews Found
                  </p>
                )}
              </div>
            </div>
          </aside>

          {/* Right Container (Schedule, Upcoming Classes and Earning Statistics) */}
          <aside className="min-h-[50vh] w-full lg:mt-0 mt-10 lg:w-[60%] space-y-6 ">
            {/* My Schedule */}
            <div
              className="flex flex-col rounded-[16px] px-4 py-6 md:p-4 lg:p-10 shadow-[0px_2px_4px_2px_rgba(0,0,0,0.03)]
            border-[2px] border-solid border-[rgba(0,0,0,0.05)]
            justify-between"
            >
              <div className=" flex  justify-between">
                <h1 className="text-[12px] lg:text-[20px] text-nowrap font-[600] leading-normal">
                  My Schedule
                </h1>
                <CustomDatePicker
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                />
              </div>
              <div className=" mt-6 flex flex-col md:flex-row items-center justify-around">
                {/* Just send the change the total hours to your required variable */}
                <CustomCircularProgressBar
                  totalHours={totalHours}
                  text={`${totalHours.toFixed(2)} hours`}
                />

                <div className="bg-text-50 w-[100%] md:w-[60%] h-[342px] flex flex-col rounded-[16px] pl-4 pt-8 pb-4">
                  <h1 className="text-primary-400  font-[600] text-[14px] md:text-[16px] lg:text-[18px] leading-normal mb-4">
                    {formatDate(selectedDate)}
                  </h1>
                  <div className=" h-full overflow-y-auto custom-scrollbar">
                    {classesOnSelectedDate.length === 0 ? (
                      <p>No classes scheduled on this date.</p>
                    ) : (
                      classesOnSelectedDate.map((scheduledClass, index) => (
                        <div
                          key={index}
                          className="flex justify-between border-b-[1px] border-[rgba(0, 0, 0, 0.35)] py-2"
                        >
                          <div className="flex flex-col">
                            <h4 className="text-[13px] md:text-[14px] lg:text-[16px] font-[600] text-secondary-700">
                              {scheduledClass.studentUsername}
                            </h4>
                            <p className="text-text-600 text-[11px] sm:text-[13px] font-[500]">
                              Time: {scheduledClass.timeslot.time}
                            </p>
                          </div>
                          <p className="text-[11px] sm:text-[13px] mr-4 text-text-700 font-[500] leading-normal">
                            Duration:{" "}
                            <span className="text-text-600">
                              {scheduledClass.classDuration}
                            </span>
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Upcoming Classes */}
            <div
              className="flex flex-col pl-4 md:px-10 py-6  rounded-[16px] shadow-[0px_2px_4px_2px_rgba(0,0,0,0.03)]
            border-[2px] border-solid border-[rgba(0,0,0,0.05)]"
            >
              <h1 className=" font-[600] text-[14px] sm:text-[16px] md:text-[18px] text-center md:text-start  lg:text-[20px] leading-normal mb-8 ">
                Upcoming Classes
              </h1>

              {/* Cards Container */}
              <div className=" flex mt-4  overflow-y-auto flex-col md:flex-row h-[400px] md:overflow-x-auto custom-scrollbar">
                {upcomingClassesLoading === true ? (
                  <div className="w-full  flex justify-center items-center h-full">
                    <Spinner />
                  </div>
                ) : upcomingClasses?.length === 0 ? (
                  // Display this message when there are no scheduled classes
                  <div className="flex justify-center items-center w-full h-full">
                    <p className="text-text-700 text-[16px] font-[500]">
                      No scheduled classes
                    </p>
                  </div>
                ) : (
                  upcomingClasses?.map((scheduledClass, index) => {
                    return (
                      <div
                        key={index}
                        className="bg-text-50 rounded-[10px] w-full md:max-w-[300px] md:mr-6 mb-6 md:min-w-[266px] min-h-[280px] gap-[4px] px-4 w flex flex-col justify-center"
                      >
                        <div className="flex items-center  flex-col gap-2">
                          <div className="w-[41px] h-[41px]">
                            <Image
                              src={
                                scheduledClass.studentImageUrl ||
                                "/images/student-dashboard-tutor-3-small.png"
                              }
                              width={42}
                              height={42}
                              unoptimized
                              alt={"Student Image"}
                              className="h-auto w-auto"
                            />
                          </div>
                          <div className="text-secondary-700 font-[600] text-[14px] md:text-[16px] ">
                            <p>
                              {scheduledClass?.studentFullname?.trim() ||
                                scheduledClass?.studentUsername?.trim()}
                            </p>
                          </div>
                        </div>
                        <div className="">
                          <p className="text-text-700 whitespace-nowrap text-[11px] text-ellipsis overflow-hidden capitalize sm:text-[13px] font-[500] leading-normal ">
                            Subject:{" "}
                            <span className="text-secondary-600  whitespace-nowrap  ">
                              {scheduledClass.subjectDetails?.subject}(
                              {scheduledClass.subjectDetails?.areaOfSubject})
                            </span>
                          </p>
                        </div>

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
                        <div className="flex">
                          <p className="text-text-700 text-[11px] sm:text-[13px] font-[500] leading-normal ">
                            Day:{" "}
                            <span className="text-secondary-600">
                              {scheduledClass?.timeslot?.date}
                            </span>
                          </p>
                        </div>

                        <div className="flex">
                          <p className="text-text-700 text-[11px] sm:text-[13px] font-[500] leading-normal ">
                            Duration:{" "}
                            <span className="text-secondary-600">
                              {scheduledClass.classDuration}
                            </span>
                          </p>
                        </div>

                        <div className="flex flex-col items-center gap-4 h-[40%] justify-center">
                          <button
                            onClick={() => setShowReschedulePopUp(true)}
                            className={`${
                              selectedButton[scheduledClass._id] ===
                              "Reschedule"
                                ? "bg-primary-400 text-white"
                                : "bg-white text-primary-400"
                            } border-2 hover:bg-primary-400 outline-secondary-600 hover:text-white transition-all duration-300 ease-in-out border-primary-400 py-[4px] w-[80%] font-[600] rounded-[4px] text-[11px]`}
                          >
                            Reschedule
                          </button>

                          {showReschedulePopUp && (
                            <div
                              className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center"
                              onClick={() => setShowReschedulePopUp(false)}
                            >
                              <div
                                className="bg-white space-y-4 text-justify relative px-10 py-10 max-w-[80%] md:max-w-[50%]  lg:max-w-[30%] rounded-xl"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <FaTimes
                                  className="absolute top-4 cursor-pointer hover:text-gray-900  text-gray-500 right-4"
                                  onClick={() => setShowReschedulePopUp(false)}
                                />
                                <p>
                                  To reschedule the class, you need the
                                  student's consent. If the student is
                                  unwilling, you may choose not to reschedule
                                  the class or cancel it instead.
                                </p>

                                <p>Do you want to reschedule the class?</p>

                                <div className="ml-auto w-full flex justify-between gap-6 text-white">
                                  <button
                                    onClick={() => {
                                      setShowRescheduleSlot(true);
                                      setShowReschedulePopUp(false);
                                    }}
                                    className="bg-secondary-700 transition-all outline-primary-400 hover:bg-secondary-800 duration-300 ease-in-out  w-1/2 py-1 rounded-lg "
                                  >
                                    Yes
                                  </button>
                                  <button
                                    onClick={() =>
                                      setShowReschedulePopUp(false)
                                    }
                                    className="bg-primary-400 outline-secondary-600 transition-all hover:bg-primary-600 duration-300 ease-in-out   w-1/2 py-1 rounded-lg"
                                  >
                                    No
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {showRescheduleSlot && (
                            <div
                              className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center"
                              onClick={() => setShowRescheduleSlot(false)}
                            >
                              <div
                                className="bg-white space-y-4 text-justify relative px-10 py-10 max-w-[80%] md:max-w-[50%]  lg:max-w-[30%] rounded-xl"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <FaTimes
                                  className="absolute top-4 cursor-pointer hover:text-gray-900  text-gray-500 right-4"
                                  onClick={() => setShowRescheduleSlot(false)}
                                />
                                <h1 className="text-[1.75rem] font-bold  ">
                                  Reschedule Time
                                </h1>
                                <p>
                                  Select the slot you want to reschedule the
                                  class to:
                                </p>

                                <RescheduleForm
                                  scheduledClass={scheduledClass}
                                />
                              </div>
                            </div>
                          )}

                          <button
                            onClick={() => {
                              handleButtonClick(scheduledClass._id, "Cancel");
                              handleCancelClass(scheduledClass._id);
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
                              handleJoinButton(scheduledClass._id, index);

                              // if (classActive === true) {
                              //   const formattedUrl = encodeURIComponent(
                              //     scheduledClass?.videoUrlArray
                              //   );
                              //   window.location.href = `/video/${formattedUrl}`;
                              // } else {
                              //   toast("Class is not active");
                              // }
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
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Earning Statistics */}
            <div
              className="flex flex-col  lg:px-10 py-6  rounded-[16px] shadow-[0px_2px_4px_2px_rgba(0,0,0,0.03)]
            border-[2px] border-solid border-[rgba(0,0,0,0.05)]"
            >
              {/* Heading Component */}
              <div className="flex items-center px-4 justify-between">
                <h1 className="text-[14px] sm:text-[16px] md:text-[18px] lg:text-[20px] font-[600] leading-normal">
                  Earning Statistics
                </h1>
                <div className="px-2 border-[1px] flex items-center justify-center border-solid border-text-200 rounded-[8px] py-[1px] bg-white w-fit">
                  <select className="px-2 text-[11px] md:text-[13px] bg-white text-primary-400 font-[600] outline-none ">
                    <option value="Monthly">Monthly</option>
                    <option value="Weekly">Weekly</option>
                  </select>
                </div>
              </div>

              {/* Statistics Component */}
              <div className="">
                <EarningsLineChart />
              </div>
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
};

export default Page;
