"use client";
import Image from "next/image";
import { Poppins } from "next/font/google";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";
import { useSession } from "next-auth/react";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600"] });

const TutorSkeletonLoader = () => (
  <div className="flex justify-center items-center w-full h-full">
    <div className="container mx-auto px-4 lg:px-10 xl:px-20 bg-white flex flex-col py-6 justify-center items-center">
      {/* Main card structure */}
      <div className="w-full md:max-w-[90%] bg-white flex flex-col md:flex-row gap-6 border rounded-lg overflow-hidden">
        {/* Left Column */}
        <div className="md:w-1/3 w-full p-6 border-b-2 md:border-b-0 md:border-r-2">
          <div className="text-center space-y-4">
            {/* Profile image placeholder */}
            <div className="w-[130px] h-[130px] bg-gray-300 rounded-full mx-auto mb-4"></div>

            {/* Headline and Experience */}
            <div className="h-[20px] bg-gray-300 rounded w-2/3 mx-auto mb-2"></div>
            <div className="h-[20px] bg-gray-300 rounded w-1/2 mx-auto"></div>

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
                <div className="h-[18px] w-2/3 bg-gray-300 rounded mb-2 mx-auto"></div>
                <div className="flex flex-wrap gap-2 justify-center">
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

export default function TutorProfile() {
  const [data, setData] = useState(null);
  console.log("data", data);

  const [loading, setLoading] = useState(true);
  const [reviewsList, setReviewsList] = useState([]);
  const { data: session } = useSession();
  console.log("session", session);
  let tutorId = data?._id;
  console.log("tutorId", tutorId);

  const fetchTutorProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/tutors/tutorprofile", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error("Something went wrong, tutor not found");
      } else {
        console.log(data?.tutor);
        setData(data?.tutor);
        setLoading(false);
        return data;
      }
    } catch (error) {
      console.error("Error fetching tutor profile:", error);
      toast.error("An error occurred while fetching the tutor profile");
    }
  };
  const tutorReviews = async () => {
    try {
      const response = await fetch(
        `/api/student/get-tutor-view?tutorId=${session.id}`
      );

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
  useEffect(() => {
    fetchTutorProfile();
  }, []);

  useEffect(() => {
    tutorReviews();
  }, [session]);

  const dayNames = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  if (loading) {
    return <TutorSkeletonLoader />;
  }

  const AvailabilityDisplay = () => {
    return (
      <div className="">
        <p>Timezone : {data?.tutorDetails?.timezone} Time</p>
        <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
          {data?.tutorDetails?.availability.map((availableDay, index) => (
            <div
              key={index}
              className="text-[#5D5D5D]   text-[15px] font-semibold  px-4 py-2"
            >
              <p>{availableDay.day} : &nbsp;</p>
              <ul className="flex   flex-wrap">
                {availableDay.slots.map((slot, index) => (
                  <li key={index} className="text-nowrap">
                    <p>
                      (From: {slot.from} - To: {slot.to})
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    );
  };
  const totalRatings = reviewsList.reduce(
    (sum, review) => sum + review.rating,
    0
  );
  const avgRating = totalRatings / reviewsList.length || 0;
  const roundedAvgRating = Math.round(avgRating); // Rounded to the nearest integer

  const subjects = {
    Physics: "Physics",
    Biology: "Biology",
    Mathematics: "Mathematics",
    Chemistry: "Chemistry",
    ComputerScience: "Computer Science", // Display name has space
    OtherSubjects: "Other Subjects", // Display name has space
  };

  return (
    <div className={`py-10 w-full h-full   ${poppins.className}`}>
      <div className="container mx-auto px-4 lg:px-[50px] xl:px-[86px]  bg-white flex justify-center items-center">
        <div className="w-full md:max-w-[100%] bg-white flex flex-col md:flex-row gap-6 border rounded-lg overflow-hidden">
          {/* Left Column */}
          <div className="md:w-1/3 w-full  p-6 border-b-2 md:border-b-0 md:border-r-2">
            <div className="text-center">
              <div className="relative mb-4 flex items-center justify-center">
                <Image
                  src={
                    data?.tutorDetails?.profilePicture ||
                    "/images/tutorprofile.png"
                  }
                  width={130}
                  height={130}
                  alt="Tutor profile image"
                  quality={100}
                  unoptimized
                  className="rounded-full"
                />
                <Link href="tutor-edit">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    fill="none"
                    className="absolute right-3 top-1"
                  >
                    <path
                      d="M15.5325 5.27992C15.825 4.98742 15.825 4.49992 15.5325 4.22242L13.7775 2.46742C13.5 2.17492 13.0125 2.17492 12.72 2.46742L11.34 3.83992L14.1525 6.65242M2.25 12.9374V15.7499H5.0625L13.3575 7.44742L10.545 4.63492L2.25 12.9374Z"
                      fill="#5D5D5D"
                    />
                  </svg>
                </Link>
              </div>
              <h2 className="text-[16px] text-[#5D5D5D] font-medium mb-2">
                {data?.tutorDetails?.headline}
              </h2>
              <div className="flex flex-col justify-center items-center gap-2 mb-4">
                {/* <span className="text-[15px] text-[#454545] font-semibold">
                  5
                </span> */}
                <div className="flex gap-2">
                  {showReviewStars(roundedAvgRating)}
                </div>

                <span className="text-[#454545] capitalize text-nowrap text-[16px] font-medium">
                  Experience: {data?.tutorDetails?.experience}
                </span>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-[18px] text-[#252525] mb-2">
                  Languages
                </h3>
                <div className="flex flex-wrap gap-3">
                  <div className="text-[#5D5D5D] text-[15px] font-semibold border px-4 py-2">
                    <p>English</p>
                  </div>
                  <div className="text-[#5D5D5D] text-[15px] font-semibold border px-4 py-2">
                    <p>Spanish</p>
                  </div>
                </div>
              </div>
              <div className="relative">
                <h3 className="font-semibold text-[18px] text-[#252525] mb-2">
                  Subject Expertise
                </h3>
                <div className="mt-3">
                  {data?.subjectsTaught?.map((subject, index) => (
                    <div
                      key={index}
                      className="text-[#5D5D5D] inline-block text-[15px] font-semibold border px-4 py-2 mr-2 mb-2"
                    >
                      <p>{subjects[subject.subjectExpertise]}</p>
                    </div>
                  ))}
                </div>
                <Link href="/tutor/change-subject">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    fill="none"
                    className="  absolute right-3 top-1"
                  >
                    <path
                      d="M15.5325 5.27992C15.825 4.98742 15.825 4.49992 15.5325 4.22242L13.7775 2.46742C13.5 2.17492 13.0125 2.17492 12.72 2.46742L11.34 3.83992L14.1525 6.65242M2.25 12.9374V15.7499H5.0625L13.3575 7.44742L10.545 4.63492L2.25 12.9374Z"
                      fill="#5D5D5D"
                    />
                  </svg>
                </Link>
              </div>

              <div className="relative">
                <h3 className="font-semibold text-[18px] text-[#252525] mb-2">
                  Area of Expertise
                </h3>
                <div className="flex flex-wrap  gap-2">
                  {data?.subjectsTaught?.map((subject, index) => (
                    <div key={index} className="flex gap-2">
                      {subject.areaOfSubjects.map((item, id) => (
                        <span
                          key={id}
                          className="text-[#5D5D5D]  text-[15px] font-semibold border px-4  py-2 "
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
                <Link href="/tutor/change-subject">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    fill="none"
                    className="absolute right-3 top-1"
                  >
                    <path
                      d="M15.5325 5.27992C15.825 4.98742 15.825 4.49992 15.5325 4.22242L13.7775 2.46742C13.5 2.17492 13.0125 2.17492 12.72 2.46742L11.34 3.83992L14.1525 6.65242M2.25 12.9374V15.7499H5.0625L13.3575 7.44742L10.545 4.63492L2.25 12.9374Z"
                      fill="#5D5D5D"
                    />
                  </svg>
                </Link>
              </div>

              <div className="flex gap-24">
                <div>
                  <h3 className="font-semibold text-[18px] text-[#252525] mb-2">
                    Gender
                  </h3>
                  <div className="text-[#5D5D5D] capitalize text-[15px] font-semibold border px-4 py-2">
                    <p>{data?.tutorDetails?.gender}</p>
                  </div>
                </div>
                <div className="">
                  <h3 className="font-semibold text-[18px] text-[#252525] mb-2">
                    Age
                  </h3>
                  <div className="text-[#5D5D5D] text-[15px] font-semibold border px-4 py-2">
                    <p>{data?.tutorDetails?.age}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="md:w-2/3 w-full p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
              <h1 className="text-[27px] capitalize font-semibold text-[#1A696B] mb-2 sm:mb-0">
                {`${data?.tutorDetails?.firstName} ${data?.tutorDetails?.lastName}`}
              </h1>

              <p className="text-[#252525] text-[16px] font-semibold">
                Hourly Rate :{" "}
                <span className="#1E8D8F ">
                  $ {data?.tutorDetails?.hourlyPrice}
                </span>
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-[18px] text-[#252525] mb-2">
                About
              </h3>
              <p className="text-[15px] font-medium text-[#4F4F4F]">
                {data?.tutorDetails?.about}.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-[18px] text-[#252525] mb-2">
                Availability
              </h3>
              <div className="flex flex-wrap gap-3">
                <div className="">
                  <AvailabilityDisplay />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-[18px]  mt-5 text-[#252525] mb-2">
                  Education
                </h3>
                {data?.educationDetails?.map((education, index) => (
                  <div
                    key={index}
                    className="inline-block text-[#5D5D5D] text-[15px] font-semibold border px-4 py-2"
                  >
                    <p>
                      {education.highestEducation} ({education.university})
                    </p>
                  </div>
                ))}
              </div>
              {/* <div>
                <h3 className="font-semibold mt-5  text-[18px] text-[#252525] mb-2">
                  Certifications
                </h3>
                <div className="flex flex-wrap gap-4">
                  {data?.educationDetails?.map((education, index) => (
                    <div
                      key={index}
                      className="text-[#5D5D5D] inline-block text-[15px] font-semibold border px-4 py-2"
                    >
                      <p>{education.uploadDegree}</p>
                    </div>
                  ))}
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
