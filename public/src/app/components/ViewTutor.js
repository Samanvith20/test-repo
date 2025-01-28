"use client";
import Image from "next/image";
import { Poppins } from "next/font/google";
import { useEffect, useState, useRef } from "react";
import RequestSession from "./RequestSession";

import Link from "next/link";
import { useSession } from "next-auth/react";
import io from "socket.io-client";
import { useRouter } from "next/navigation";

import { AiFillStar, AiOutlineStar } from "react-icons/ai";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600"] });

const TutorSkeletonLoader = () => (
  <div className="flex justify-center items-center w-full h-full">
    <div className="container mx-auto px-4 lg:px-10 xl:px-20 bg-white flex flex-col py-6 justify-center items-center">
      {/* Back button placeholder */}
      <div className="bg-gray-300 rounded-full w-[32px] h-[32px] self-start mb-4"></div>

      {/* Main card structure */}
      <div className="w-full md:max-w-[100%] bg-white flex flex-col md:flex-row gap-6 border rounded-lg overflow-hidden">
        {/* Left Column */}
        <div className="md:w-1/3 w-full p-6 border-b-2 md:border-b-0 md:border-r-2">
          <div className="text-center space-y-4">
            {/* Profile image placeholder */}
            <div className="w-[130px] h-[130px] bg-gray-300 rounded-full mx-auto mb-4"></div>

            {/* Headline and Experience */}
            <div className="h-[20px] bg-gray-300 rounded w-2/3 mx-auto mb-2"></div>

            {/* Rating stars */}
            <div className="flex justify-center gap-1 mt-3">
              {Array(5)
                .fill()
                .map((_, index) => (
                  <div
                    key={index}
                    className="w-5 h-5 bg-gray-300 rounded-full"
                  ></div>
                ))}
            </div>
            <div className="h-[20px] bg-gray-300 rounded w-1/2 mx-auto"></div>
          </div>

          {/* Other details (Languages, Subject Expertise, Area of Expertise, Gender) */}
          <div className="space-y-6 mt-6">
            {[
              "Languages",
              "Subject Expertise",
              "Area of Expertise",
              "Gender",
            ].map((section, index) => (
              <div key={index}>
                <div className="h-[18px] w-2/3 bg-gray-300 rounded mb-2 "></div>
                <div className="flex flex-wrap gap-2 ">
                  <div className="bg-gray-300 h-[20px] w-1/3 rounded mb-1"></div>
                  <div className="bg-gray-300 h-[20px] w-1/4 rounded mb-1"></div>
                  <div className="bg-gray-300 h-[20px] w-1/3 rounded mb-1"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="md:w-2/3 w-full p-6 space-y-6">
          <div className="flex justify-between items-center">
            {/* Name placeholder */}
            <div className="h-[30px] bg-gray-300 rounded w-1/2"></div>
            {/* Hourly rate placeholder */}
            <div className="h-[20px] bg-gray-300 rounded w-1/4"></div>
          </div>

          {/* About Section */}
          <div>
            <div className="h-[18px] bg-gray-300 rounded w-1/3 mb-2"></div>
            <div className="h-[15px] bg-gray-200 rounded w-full mb-1"></div>
            <div className="h-[15px] bg-gray-200 rounded w-full mb-1"></div>
            <div className="h-[15px] bg-gray-200 rounded w-3/4"></div>
          </div>

          {/* Availability Section */}
          <div>
            <div className="h-[18px] bg-gray-300 rounded w-1/3 mb-2"></div>
            <div className="h-[15px] bg-gray-200 rounded w-full mb-1"></div>
            <div className="h-[15px] bg-gray-200 rounded w-full mb-1"></div>
            <div className="h-[15px] bg-gray-200 rounded w-3/4"></div>
          </div>

          {/* Education Section */}
          <div>
            <div className="h-[18px] bg-gray-300 rounded w-1/3 mb-2"></div>
            <div className="flex flex-wrap gap-3">
              <div className="bg-gray-200 h-[20px] w-1/4 rounded mb-1"></div>
              <div className="bg-gray-200 h-[20px] w-1/3 rounded mb-1"></div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center sm:justify-end mt-4 gap-4">
            <div className="px-4 py-2 bg-gray-300 w-1/3 rounded-lg"></div>
            <div className="px-4 py-2 bg-gray-300 w-1/3 rounded-lg"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default function ViewTutor({ viewTutor, setViewTutor }) {
  const [tutor, setTutor] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const { data: session, status } = useSession();
  const [selectedExpertise, setSelectedExpertise] = useState(null);

  const [reviewsList, setReviewsList] = useState([]);
  console.log("Reviews: ", reviewsList);

  console.log("Tutor: ", tutor);

  const handleOutsideClick = (e) => {
    if (e.target.id === "modal-overlay") {
      setShowModal(false);
    }
  };

  //   console.log(" tutor", tutor)
  //  console.log('viewTutor ',viewTutor )
  const socketRef = useRef(null); // Use a ref to store the socket instance
  const router = useRouter();

  const joinRoomAndNavigate = () => {
    if (session?.id && viewTutor) {
      const studentId = session.id;
      const roomId = `${studentId}_${viewTutor}`;

      // // Emit joinRoom event using the socket ref
      console.log("Room ID (View Page):", roomId);
      socketRef?.current?.emit("joinRoom", {
        roomId,
        studentId,
        tutorId: viewTutor,
      });

      // Navigate to chat page
      router.push(`/chat?tutorId=${viewTutor}`);
    }
  };

  useEffect(() => {
    tutorReviews();
  }, []);

  useEffect(() => {
    const getTutor = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/student/get-tutor-profile?tutorId=${viewTutor}`
        );
        const data = await response.json();

        setTutor(data.tutor);
        console.log("tutor", data.tutor);
        setLoading(false);
      } catch (error) {
        console.log("Error while fetching Tutor Details: ", error);
      }
    };
    getTutor();
  }, [viewTutor]);

  // Automatically select the only expertise if there's just one
  useEffect(() => {
    if (tutor?.subjectsTaught?.length === 1) {
      setSelectedExpertise(tutor?.subjectsTaught[0]?.subjectExpertise);
    }
  }, [tutor?.subjectsTaught]);

  const allAreas = tutor?.subjectsTaught?.flatMap(
    (subject) => subject?.areaOfSubjects
  );

  // Filter areas based on the selected expertise
  const filteredAreas =
    selectedExpertise !== null
      ? tutor?.subjectsTaught?.find(
          (subject) => subject?.subjectExpertise === selectedExpertise
        )?.areaOfSubjects || []
      : allAreas;

  // Handle selecting/deselecting an expertise
  const toggleExpertise = (expertise) => {
    if (tutor?.subjectsTaught.length > 1) {
      setSelectedExpertise((prev) => (prev === expertise ? null : expertise));
    }
  };

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setShowModal(false);
      }
    };

    if (showModal) {
      document.addEventListener("keydown", handleEscape);
    } else {
      document.removeEventListener("keydown", handleEscape);
    }

    return () => document.removeEventListener("keydown", handleEscape);
  }, [showModal]);
  const tutorReviews = async () => {
    try {
      const response = await fetch(
        `/api/student/get-tutor-view?tutorId=${viewTutor}`
      );

      // Check for non-OK responses
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch reviews.");
      }

      // Parse response data
      const data = await response.json();
      console.log("Data for reviews:: ", data);

      console.log("reviews: ", data.reviews);
      // Update the reviews list state
      setReviewsList(data.reviews || []); // Ensure fallback to an empty array if `reviews` is undefined
    } catch (error) {
      console.error("Error while fetching the reviews:", error.message);
    }
  };
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

  const subjects = {
    Physics: "Physics",
    Biology: "Biology",
    Mathematics: "Mathematics",
    Chemistry: "Chemistry",
    ComputerScience: "Computer Science", // Display name has space
    OtherSubjects: "Other Subjects", // Display name has space
  };

  const totalRatings = reviewsList.reduce(
    (sum, review) => sum + review.rating,
    0
  );
  const avgRating = totalRatings / reviewsList.length || 0;
  const roundedAvgRating = Math.round(avgRating); // Rounded to the nearest integer
  useEffect(() => {
    if (showModal) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => document.body.classList.remove("overflow-hidden");
  }, [showModal]);

  if (loading) {
    return <TutorSkeletonLoader />;
  }

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  // if (!session) {
  //   return <p>You are not logged in.</p>;
  // }

  return (
    <div className={` w-full h-full pb-8  relative  ${poppins.className}`}>
      <div className="container mx-auto px-[20px] lg:px-[50px] xl:px-[86px]  bg-white flex flex-col gap-6 py-4">
        <div
          onClick={() => setViewTutor(null)}
          className="bg-[rgba(30,141,143,0.44)] cursor-pointer flex items-center justify-center rounded-full w-[32px] h-[32px] self-start"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
          >
            <path
              d="M15.8332 9.16655H6.52486L10.5915 5.09989C10.9165 4.77489 10.9165 4.24155 10.5915 3.91655C10.5144 3.8393 10.4229 3.77801 10.322 3.73619C10.2212 3.69438 10.1132 3.67285 10.004 3.67285C9.89488 3.67285 9.78681 3.69438 9.686 3.73619C9.58519 3.77801 9.49362 3.8393 9.41652 3.91655L3.92486 9.40822C3.8476 9.48532 3.78631 9.57689 3.7445 9.6777C3.70268 9.77851 3.68115 9.88658 3.68115 9.99572C3.68115 10.1049 3.70268 10.2129 3.7445 10.3137C3.78631 10.4146 3.8476 10.5061 3.92486 10.5832L9.41652 16.0749C9.49367 16.152 9.58527 16.2132 9.68607 16.255C9.78687 16.2967 9.89491 16.3182 10.004 16.3182C10.1131 16.3182 10.2212 16.2967 10.322 16.255C10.4228 16.2132 10.5144 16.152 10.5915 16.0749C10.6687 15.9977 10.7299 15.9061 10.7716 15.8053C10.8134 15.7045 10.8349 15.5965 10.8349 15.4874C10.8349 15.3783 10.8134 15.2702 10.7716 15.1694C10.7299 15.0686 10.6687 14.977 10.5915 14.8999L6.52486 10.8332H15.8332C16.2915 10.8332 16.6665 10.4582 16.6665 9.99989C16.6665 9.54155 16.2915 9.16655 15.8332 9.16655Z"
              fill="black"
            />
          </svg>
        </div>
        <div className="w-full md:max-w-[100%] bg-white flex flex-col md:flex-row gap-6 border rounded-lg overflow-hidden">
          {/* Left Column */}
          <div className="md:w-1/3 w-full  p-6 border-b-2 md:border-b-0 md:border-r-2">
            <div className="text-center">
              <div className="relative mb-4 flex items-center justify-center">
                <Image
                  src={
                    tutor?.tutorDetails?.profilePicture ||
                    "/images/tutorprofile.png"
                  }
                  width={130}
                  height={130}
                  alt="Tutor profile image"
                  quality={100}
                  unoptimized
                  className="rounded-full"
                />
              </div>
              <h2 className="text-[16px] text-[#5D5D5D] font-medium mb-2">
                {tutor?.tutorDetails?.headline ||
                  "Shaping Success One Session at a Time"}
              </h2>
              <div className="flex justify-center flex-col items-center gap-2 mb-4">
                <div className="flex">{showReviewStars(roundedAvgRating)}</div>
                <span className="text-[#454545] text-wrap capitalize text-[16px] font-medium">
                  Expericence Level: {tutor?.tutorDetails?.experience}
                </span>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-[18px] text-[#252525] mb-2">
                  Languages
                </h3>
                <div className="flex flex-wrap gap-3">
                  {tutor?.languages?.map((language, index) => (
                    <div
                      key={index}
                      className="text-[#5D5D5D] text-[15px] font-semibold border px-4 py-2"
                    >
                      <p>{language}</p>
                    </div>
                  )) || (
                    <>
                      <div className="text-[#5D5D5D] text-[15px] font-semibold border px-4 py-2">
                        <p>English</p>
                      </div>
                      <div className="text-[#5D5D5D] text-[15px] font-semibold border px-4 py-2">
                        <p>Spanish</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-[18px] text-[#252525] mb-2">
                  Subject Expertise
                </h3>

                <div className="flex flex-wrap gap-2">
                  {tutor.subjectsTaught?.map((subject, index) => (
                    // <div
                    //   key={index}
                    //   className="text-[#5D5D5D]  inline-block  mt-3 text-[15px] font-semibold border  px-4 py-2"
                    // >
                    //   <p>{subject.subjectExpertise}</p>{" "}
                    // </div>

                    <button
                      key={subject._id}
                      onClick={() => toggleExpertise(subject.subjectExpertise)}
                      className={`  inline-block  mt-3 text-[15px] font-semibold border  px-4 py-2 expertise-button ${
                        selectedExpertise === subject.subjectExpertise
                          ? "bg-[#E77B3E] text-white"
                          : "text-[#5D5D5D]"
                      }`}
                    >
                      {subjects[subject.subjectExpertise]}
                    </button>
                  ))}
                </div>
                {/* <p>{tutor?.subjectsTaught?.[0]?.subjectExpertise || ""}</p> */}
              </div>
              <div>
                <h3 className="font-semibold text-[18px] text-[#252525] mb-2">
                  Area of Expertise
                </h3>

                {/* {tutor?.subjectsTaught?.map((subject, index) => (
                    <div className=" flex gap-2 flex-wrap" key={index}>
                      {subject.areaOfSubjects.map((area, areaIndex) => (
                        <p
                          key={areaIndex}
                          className="text-[#5D5D5D] h-fit text-[15px] font-semibold border px-4 py-2"
                        >
                          {area}
                        </p>
                      ))}
                    </div>
                  ))} */}

                <div className="flex flex-wrap gap-2">
                  {filteredAreas.map((area, index) => (
                    <div key={index} className="flex gap-2 flex-wrap">
                      <p
                        key={index}
                        className="text-[#5D5D5D] h-fit text-[15px] font-semibold border px-4 py-2"
                      >
                        {area}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-24">
                <div>
                  <h3 className="font-semibold text-[18px] text-[#252525] mb-2">
                    Gender
                  </h3>
                  <div className="text-[#5D5D5D] capitalize text-[15px] font-semibold border px-4 py-2">
                    <p>{tutor?.tutorDetails?.gender || "Male"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="md:w-2/3 w-full p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
              <h1 className="text-[27px] capitalize font-semibold text-[#1A696B] mb-2 sm:mb-0">
                {`${tutor?.tutorDetails?.firstName || "Rahul"} ${
                  tutor?.tutorDetails?.lastName || "Verma"
                }`}
              </h1>
              <p className="text-[#252525] text-[16px] font-semibold">
                Hourly Rate :{" "}
                <span className="#1E8D8F ">
                  ${tutor?.tutorDetails?.hourlyPrice || 20}
                </span>
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-[18px] text-[#252525] mb-2">
                About
              </h3>
              <p className="text-[15px] font-medium text-[#4F4F4F]">
                {tutor?.tutorDetails?.about ||
                  `Hi, I’m ${tutor?.tutorDetails?.firstName || "Rahul"} ${
                    tutor?.tutorDetails?.lastName || "Verma"
                  }, a dedicated tutor?...`}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-[18px] text-[#252525] mb-2">
                Availability{" "}
                <span className="text-[14px] font-normal ">
                  (Timezone : {tutor?.tutorDetails?.timezone} Time)
                </span>
              </h3>
              <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto custom-scrollbar">
                {/* {Object.keys(tutor?.tutorDetails?.availability || {})
                  .filter(
                    (day) =>
                      day !== "timeSlot" && tutor?.tutorDetails.availability[day]
                  )
                  .map((day, index) => (
                    <div
                      key={index}
                      className="text-[#5D5D5D] text-[15px] font-semibold border px-4 py-2"
                    >
                      <p>
                        {day}
                        <span className="uppercase">
                          {" ( "}
                          {tutor?.tutorDetails.availability.timeSlot?.from ||
                            "N/A"}{" "}
                          -{" "}
                          {tutor?.tutorDetails.availability.timeSlot?.to ||
                            "N/A"}{" "}
                          {") "}
                        </span>
                      </p>
                    </div>
                  ))} */}
                {tutor?.tutorDetails?.availability.map(
                  (availableDay, index) => (
                    <div
                      key={index}
                      className="text-[#5D5D5D] text-[15px] font-semibold  px-4 py-2"
                    >
                      <p>{availableDay.day} : &nbsp;</p>
                      <ul className="flex flex-wrap">
                        {availableDay.slots.map((slot, index) => (
                          <li key={index} className="text-nowrap">
                            <p>
                              (From: {slot.from} - To: {slot.to})
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-[18px]  text-[#252525] mb-1">
                Education
              </h3>
              {tutor?.educationDetails?.map((education, index) => (
                <div key={index} className="flex flex-wrap gap-3">
                  <div className="text-[#5D5D5D]  inline-block text-[15px] font-semibold border  px-4 py-2">
                    <p>
                      {education.highestEducation || "Degree"} (
                      {education.university || "University"})
                    </p>
                  </div>
                  {/* <div className="text-[#5D5D5D]  inline-block text-[15px] font-semibold border  px-4 py-2">
                    <p></p>
                  </div> */}
                </div>
              ))}
            </div>
            {/* <div>
              <h3 className="font-semibold text-[18px] text-[#252525] mb-1">
                Certifications
              </h3>
              <div className="flex flex-wrap gap-4">
                {tutor?.educationDetails?.[0]?.uploadCertificate?.map(
                  (cert, index) => (
                    <div
                      key={index}
                      className="text-[#5D5D5D] inline-block text-[15px] font-semibold border px-4 py-2"
                    >
                      <p>{cert}</p>
                    </div>
                  )
                )}
              </div>
            </div> */}
            <div className="flex flex-wrap justify-center sm:justify-end mt-4 gap-4">
              <button
                onClick={joinRoomAndNavigate}
                className="px-4 py-2 text-[16px] border-[#E77B3E] font-semibold border rounded-lg text-[#E77B3E]"
              >
                Chat With Tutor
              </button>

              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 bg-[#E77B3E] outline-secondary-600 text-white rounded-lg text-[16px] font-semibold"
              >
                Request a Session
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Modal */}
      {showModal && (
        <div
          id="modal-overlay"
          className="fixed inset-0 bg-black/50 mt-[58px] flex items-center justify-center "
          onClick={handleOutsideClick}
        >
          <div
            className="bg-[white] my-auto w-full md:min-w-[500px] md:w-[50%] rounded-lg"
            onClick={(e) => e.stopPropagation()} // Prevents modal close on inside click
          >
            <RequestSession tutorId={tutor?._id} setShowModal={setShowModal} />
          </div>
        </div>
      )}
    </div>
  );
}
