"use client";
import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  Suspense,
} from "react";
import debounce from "lodash.debounce"; // Library for debouncing
import { Poppins } from "next/font/google";
import Image from "next/image";
import ViewTutor from "../components/ViewTutor";
import { useSearchParams } from "next/navigation";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Skeleton Loader Component
const SkeletonLoader = () => (
  <div className="space-y-4 animate-pulse">
    {[...Array(5)].map((_, index) => (
      <div key={index} className="rounded-lg bg-gray-200 h-24 w-full"></div>
    ))}
  </div>
);

// Spinner Component
const Spinner = () => (
  <div className="flex justify-center items-center h-24">
    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4  border-secondary-600"></div>
  </div>
);

const Page = () => {
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const subjectsList = [
    "Mathematics",
    "Physics",
    "Biology",
    "Chemistry",
    "Computer Science",
  ];

  const [tutors, setTutors] = useState([]); // State to store tutor list
  const [loading, setLoading] = useState(true); // Loading state
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const [searchTerm, setSearchTerm] = useState(searchQuery); // For search input

  console.log("Search Parameters: ", searchParams.get("search"));
  const [filters, setFilters] = useState({
    gender: "",
    availability: [],
    subject: "",
    hourlyPrice: 0,
    level: "",
    experience: [],
  });
  const [hourlyPrice, setHourlyPrice] = useState(10); // Default value for hourly rate
  const [showFilterPopup, setShowFilterPopup] = useState(false); // Filter popup for mobile
  const [noTutorsFound, setNoTutorsFound] = useState(false); // State to check if no tutors are found
  const [initialLoad, setInitialLoad] = useState(true); // Flag for initial load
  const [viewTutor, setViewTutor] = useState(null);

  const minRate = 10;
  const maxRate = 1000;

  const searchInputRef = useRef(null); // Create a reference to the search input

  // Add a useEffect to handle the "CTRL + /" key event
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "/") {
        e.preventDefault();
        if (searchInputRef.current) {
          searchInputRef.current.focus(); // Focus the search input
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown); // Cleanup on component unmount
    };
  }, []);

  const fetchFirstFiveTutors = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/tutors/random"); // This hits the first 5 tutors API
      const data = await response.json();
      setLoading(false); // Set loading to false after data is fetched
      setTutors(data);
    } catch (error) {
      console.error("Error fetching tutors:", error);
      setLoading(false); // Set loading to false if there's an error
    }
  };

  // Handle filter changes for gender, subject, and level
  const handleFilterChange = (filterName, value) => {
    if (filterName === "availability") {
      setFilters((prev) => ({
        ...prev,
        availability: prev.availability.includes(value)
          ? prev.availability.filter((day) => day !== value) // Remove if present
          : [...prev.availability, value], // Add if not present
      }));
    } else if (filterName === "experience") {
      setFilters((prev) => ({
        ...prev,
        experience: prev.experience.includes(value)
          ? prev.experience.filter((exp) => exp !== value) // Remove if present
          : [...prev.experience, value], // Add if not present
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        [filterName]: value,
      }));
    }
  };

  // console.log("Data: asdgasd", tutors);

  // Fetch random tutors on initial page load
  useEffect(() => {
    if (searchQuery) {
      searchTutors();
    } else {
      fetchFirstFiveTutors();
    }
  }, []);

  useEffect(() => {
    setSearchTerm(searchQuery);
  }, [searchQuery]);

  const searchTutors = async () => {
    const queryParams = new URLSearchParams({
      search: searchTerm,
      gender: filters.gender,
      availability: filters.availability.join(","), // Send availability as comma-separated string
      subject: filters.subject,
      hourlyPrice: filters.hourlyPrice,
      level: filters.level, // Adding level filter
      experience: filters.experience.join(","), // Adding experience filter
    }).toString();

    try {
      if(searchTerm === "") {
        fetchFirstFiveTutors();
        return;
      }
      setLoading(true);
      const response = await fetch(`/api/tutors/search-tutor?${queryParams}`); // Replace with your actual API
      const data = await response.json();
      
      
      if (data.length === 0) {
        setNoTutorsFound(true);
        setTutors([]); // Clear previous tutors
        
      } else {
        console.log('DATAFROM SEARCH: ', data)
        setTutors(data);
        setInitialLoad(false);
        setLoading(false)
        setNoTutorsFound(false);
      }
    } catch (error) {
      console.error("Error searching tutors:", error);
    }
  };

  // Debounce search input
  const debouncedSearch = useCallback(
    debounce(() => searchTutors(), 500),
    [searchTerm, filters]
  );

  // Trigger search on search term or filter change, but only after initial load
  useEffect(() => {
    if (!initialLoad) {
      debouncedSearch();
    } else {
      setInitialLoad(false); // Mark as loaded after first run
    }
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchTerm, filters]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setShowFilterPopup(false);
      }
    };

    if (showFilterPopup) {
      document.addEventListener("keydown", handleEscape);
    } else {
      document.removeEventListener("keydown", handleEscape);
    }

    return () => document.removeEventListener("keydown", handleEscape);
  }, [showFilterPopup]);

  useEffect(() => {
    if (showFilterPopup) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => document.body.classList.remove("overflow-hidden");
  }, [showFilterPopup]);
  // Handle search input change
  const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value);
    setNoTutorsFound(false); // Reset error state
  };

  const handleExperienceChange = (e) => {
    handleFilterChange("experience", e.target.value);
  };

  const handleGenderChange = (e) => {
    handleFilterChange("gender", e.target.value);
  };

  const setSliderBackground = (hourlyPrice) => {
    const percentage = ((hourlyPrice - minRate) / (maxRate - minRate)) * 100; // Calculate the percentage
    return `linear-gradient(to right, #f58a42 0%, #f58a42 ${percentage}%, #b0b0b0 ${percentage}%, #b0b0b0 100%)`;
  };

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--hourly-slider-background",
      setSliderBackground(hourlyPrice)
    );
  }, [hourlyPrice]); // Update the hourly price background whenever the value changes

  const handleSubjectChange = (e) => {
    handleFilterChange("subject", e.target.value);
  };

  const subjects = {
    Physics: "Physics",
    Biology: "Biology",
    Mathematics: "Mathematics",
    Chemistry: "Chemistry",
    ComputerScience: "Computer Science",
  };
  //

  const handleLevelChange = (e) => {
    handleFilterChange("level", e.target.value);
  };

  // Handle hourly price change
  const handleHourlyPriceChange = (e) => {
    setHourlyPrice(e.target.value);
    setFilters((prev) => ({ ...prev, hourlyPrice: e.target.value }));
  };

  // Handle hourly price change release
  const handleHourlyPriceChangeRelease = () => {
    setFilters((prev) => ({ ...prev, hourlyPrice: hourlyPrice }));
  };

  // Handle availability change
  const handleAvailabilityChange = (day) => {
    setFilters((prev) => {
      const isDaySelected = prev.availability.includes(day);
      return {
        ...prev,
        availability: isDaySelected
          ? prev.availability.filter((d) => d !== day)
          : [...prev.availability, day],
      };
    });
  };

  // Handle popup visibility for small screens
  const handleOutsideClick = (e) => {
    if (e.target.id === "filter-popup-overlay") {
      setShowFilterPopup(false);
    }
  };

  if (viewTutor) {
    return <ViewTutor viewTutor={viewTutor} setViewTutor={setViewTutor} />;
  }

  return (
    <div className={`   ${poppins.className}`}>
      <div className="container mx-auto px-[20px] lg:px-[50px] mb-20 xl:px-[86px] flex py-10">
        {/* Left Container */}
        <aside className="flex flex-col h-fit gap-10 w-full lg:w-[50%]">
          {/* Search bar */}
          <div className="flex w-full md:w-[86%] ml-auto rounded-[8px] drop-shadow-[0px_2px_4px_rgba(0,0,0,0.15)] overflow-hidden">
            <input
              ref={searchInputRef}
              type="text"
              className="py-[2px] px-2 pl-4 text-[12px] md:text-[14px] outline-none w-full font-[400]"
              placeholder="Search By Tutor Name, Subject, Topic"
              value={searchTerm}
              onChange={handleSearchInputChange}
            />
            <button
              onClick={searchTutors}
              className="bg-gradient-to-b text-[12px] md:text-[18px] from-[#FE9E69] px-[27px] py-[7px] to-[rgba(198,81,16,0.76)] font-[600]"
            >
              Search
            </button>
          </div>

          {/* Explore Tutors */}
          <div className="">
            <div className="flex justify-between items-center">
              <h1 className="text-[16px] font-[600]">Explore Tutors</h1>
              <button
                className="bg-gradient-to-b lg:hidden rounded-[10px] from-[#FE9E69] outline-secondary-600 to-[rgba(198,81,16,0.76)] px-[27px] py-[7px] text-white text-[12px] md:text-[18px] font-[600]"
                onClick={() => setShowFilterPopup(true)}
              >
                Filters
              </button>
            </div>
            <div className="flex flex-col mt-4 rounded-[10px] gap-4 h-[112vh] max-h-[820px] overflow-auto custom-scrollbar py-4">
              {noTutorsFound ? (
                <div className="text-center text-gray-500">
                  Sorry, we are unable to find the tutor with the given
                  requirements. Please modify the requirements to get better
                  results.
                </div>
              ) : loading ? (
                // <SkeletonLoader />
                <Spinner />
              ) : (
                tutors?.map((tutor) => (
                  <div
                    key={tutor._id}
                    className="mx-4 rounded-[16px] h-fit  flex pb-4 md:pb-4 px-0 md:px-6 py-4 flex-col shadow-[0px_2px_4px_4px_rgba(0,0,0,0.05)]"
                  >
                    <div className="p-2 flex md:flex-row flex-col justify-between">
                      <div className="md:max-w-fit flex md:flex-row flex-col w-full gap-4 md:items-center">
                        <Image
                          // src={tutor.tutorImage}
                          src={tutor.tutorDetails.profilePicture || "No Image "}
                          width={86}
                          height={111}
                          alt={`Tutor ${tutor.tutorDetails.firstName} ${tutor.tutorDetails.lastName}`}
                          unoptimized
                          priority
                          className="mx-auto md:mx-0 mt-0 text-[12px] "
                        />
                        <div className="flex flex-col">
                          <h3 className="text-[16px] capitalize md:text-[20px] text-secondary-700 leading-normal font-[600]">
                            {tutor.tutorDetails.firstName +
                              " " +
                              tutor.tutorDetails.lastName}
                          </h3>
                          <p className="text-[14px] md:text-[16px] font-[500] text-text-700">
                            {tutor.tutorQualification}
                          </p>
                          <p className="text-text-950 text-[14px] md:text-[14px] font-[500]">
                            Experience:{" "}
                            <span className="text-text-700  capitalize ">
                              {tutor.tutorDetails.experience}
                            </span>
                          </p>
                          <div className="text-[12px]  flex flex-wrap gap-2  md:text-[14px] font-[500] leading-normal text-black">
                            <p className="text-text-700 ">
                              Subject Expertise:{" "}
                              {tutor.subjectsTaught.map((subject, index) => (
                                <span key={index}>
                                  {subjects[subject.subjectExpertise]}
                                  {index !== tutor.subjectsTaught.length - 1
                                    ? ",  "
                                    : ""}
                                </span>
                              ))}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="text-left md:text-right">
                        <p className="text-[13px] text-nowrap md:text-[15px] leading-normal font-[600]">
                          Price:{" "}
                          <span className="text-secondary-700">
                            ${tutor.tutorDetails.hourlyPrice}/hour
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="mt-[4px] md:mt-6 h-fit  px-[10px]">
                      <p
                        className="text-text-700  line-clamp-2  text-[12px] md:text-[13px] xl:text-[15px] font-[400] overflow-hidden text-ellipsis"
                        style={{
                          display: "-webkit-box",
                       
                          WebkitBoxOrient: "vertical",
                          lineHeight: "1.5", // Adjust the line height based on your preference
                        }}
                      >
                        {tutor.tutorDetails.about}
                      </p>
 
 
                      <div className="flex md:flex-row flex-wrap flex-col mt-[6px] h-fit md:justify-between">
                        <div className="flex  flex-col">
                          <div className="text-[11px] md:text-[13px] flex flex-wrap font-[500]">
                            <p className=""> Availability :&nbsp;&nbsp;</p>
                            {/* {Object.keys(tutor.tutorDetails.availability)
                              .filter(
                                (day) =>
                                  day !== "timeSlot" &&
                                  tutor.tutorDetails.availability[day]
                              )
                              .map((day, index, availableDays) => (
                                <span key={index}>
                                  {day}
                                  {index !== availableDays.length - 1
                                    ? ", "
                                    : ""}
                                </span>
                              ))} */}
                            {tutor.tutorDetails.availability.map(
                              (availableDay, index) => (
                                <div className="flex text-nowrap" key={index}>
                                  <p>
                                    {availableDay.day}
                                    {tutor.tutorDetails.availability.length -
                                      1 !==
                                      index && <span>,&nbsp;</span>}
                                  </p>
                                  {/* <ul className="flex flex-wrap">
                                    {availableDay.slots.map(
                                      (timeSlot, index) => (
                                        <li key={index}>
                                          (From: {timeSlot.from} - To:{" "}
                                          {timeSlot.to}) &nbsp;
                                        </li>
                                      )
                                    )}
                                  </ul> */}
                                </div>
                              )
                            )}
                          </div>
                          {/* <p className="text-[11px]  md:text-[12px] font-[500]">
                            {"Time Slot: "}(
                            <span className="uppercase">
                              {tutor.tutorDetails.availability.timeSlot.from} -{" "}
                              {tutor.tutorDetails.availability.timeSlot.to}
                            </span>
                            )
                          </p> */}
                          <p className="text-[11px]  md:text-[13px] font-[500]">
                            Timezone : {tutor.tutorDetails.timezone} Time
                          </p>
                        </div>
                        <button
                          onClick={() => setViewTutor(tutor._id)}
                          className="bg-primary-400 text-nowrap mt-2 shadow-[0px_4px_4px_0px_rgba(0, 0, 0, 0.02)] 
                        self-start md:self-end rounded-[6px] flex items-center justify-center
                         w-[80px] md:w-[98px] h-[28px] font-[600] md:font-[700] text-white text-[10px] md:text-[11px] leading-normal"
                        >
                          View Profile
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>

        {/* Right SideNav for Filters */}
        {/* ... (Retain original UI for filters and filter popup code for mobile) */}
        <aside className=" w-[50%] px-10 hidden lg:block ">
          <div
            className="flex flex-col  px-10  py-6 
            gap-[36px]
            rounded-[16px_0px_0px_16px] shadow-[0px_4px_4px_4px_rgba(0,0,0,0.03)]"
          >
            <h1 className="text-secondary-700 font-[600]  text-[21px] ">
              Filters
            </h1>

            {/* Level Selection  */}
            <div className="rounded-[4px] w-full bg-white px-4 py-2 shadow-[0px_4px_8px_3px_rgba(0,0,0,0.08)]">
              <select
                name="studentLevel"
                className="w-full font-[600] bg-white outline-none"
                onChange={handleLevelChange}
              >
                <option value={""}>Select your level</option>
                <option value={"elementarySchoolLevel"}>
                  Elementary School Level
                </option>
                <option value={"middleSchoolLevel"}>Middle School Level</option>
                <option value={"highSchoolLevel"}>High School Level</option>
              </select>
            </div>

            {/* Gender Selection */}
            <div className="leading-normal space-y-[7px]">
              <h3 className="text-[16px] font-[600] leading-normal">Gender</h3>
              <div className="flex items-center gap-[7px]">
                {/* <input id="femaleGender" type="radio" name="gender" value='Female' 
                className="w-[18px] h-[18px] border-none 
                 checked:bg-white  checked:accent-primary
                focus:bg-white bg-white" /> */}
                <input
                  id="femaleGender"
                  type="radio"
                  name="gender"
                  value="Female"
                  onChange={handleGenderChange}
                  className="appearance-none w-[18px] h-[18px] border-[1px] border-primary-400 rounded-full 
               bg-white checked:bg-primary-400 relative checked:after:block 
               after:hidden after:absolute after:top-1/2 after:left-1/2 
               after:w-[10px] after:h-[10px] after:bg-primary-400 after:rounded-full 
               after:transform after:-translate-x-[5px] after:-translate-y-[5px]"
                />

                <label
                  htmlFor="femaleGender"
                  className="text-[15px] font-[500] "
                >
                  Female
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="maleGender"
                  type="radio"
                  name="gender"
                  value="Male"
                  onChange={handleGenderChange}
                  // defaultChecked
                  className="appearance-none w-[18px] h-[18px] border-[1px] border-primary-400 rounded-full 
               bg-white checked:bg-primary-400 relative checked:after:block 
               after:hidden after:absolute after:top-1/2 after:left-1/2 
               after:w-[10px] after:h-[10px] after:bg-primary-400 after:rounded-full 
               after:transform after:-translate-x-[5px] after:-translate-y-[5px]"
                />
                <label htmlFor="maleGender" className="text-[15px] font-[500] ">
                  Male
                </label>
              </div>
            </div>

            {/* Availability */}
            <div className="text-text-950/95 space-y-[8px]">
              <h3 className="font-[600] text-[16px] leading-normal">
                Availability
              </h3>
              {daysOfWeek.map((day, index) => (
                <div key={index} className="flex items-center gap-[8px]">
                  <input
                    type="checkbox"
                    id={day}
                    name={`day${index}`}
                    value={day}
                    onChange={() => handleFilterChange("availability", day)}
                    className="custom-checkbox"
                  />

                  <label htmlFor={day}>{day}</label>
                </div>
              ))}
            </div>

            {/* Topic */}
            <div className="space-y-2 ">
              <h3 className="text-[16px] font-[600] leading-normal">Topic</h3>
              <div className="rounded-[4px] w-full bg-white px-4 py-2 shadow-[0px_4px_8px_3px_rgba(0,0,0,0.08)]">
                <select
                  name="subject"
                  className="w-full font-[600] bg-white outline-none"
                  onChange={(e) =>
                    handleFilterChange("subject", e.target.value)
                  }
                >
                  <option value={""}>Area of Subject</option>
                  {subjectsList.map((subject, index) => (
                    <option key={index} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Hourly Rate */}
            <div className="space-y-2 relative">
              <h1 className="text-[16px] font-[600] leading-normal">
                Hourly Rate
              </h1>
              <div className="flex items-center justify-between ">
                <span className="text-text-700 text-[14px] font-[600] leading-normal">
                  ${minRate}
                </span>
                <span className="text-text-700 text-[14px] font-[600] leading-normal">
                  ${maxRate}
                </span>
              </div>
              <div className="relative">
                <input
                  type="range"
                  min={minRate}
                  max={maxRate}
                  value={hourlyPrice}
                  onChange={handleHourlyPriceChange} // Update state on change
                  style={{ background: `var(--hourly-slider-background)` }} // Set the background for hourly price
                  className="custom-slider w-full"
                  onMouseUp={handleHourlyPriceChangeRelease} // For mouse release
                  onTouchEnd={handleHourlyPriceChangeRelease} // For touch release
                />
                <div
                  className="slider-thumb-value"
                  style={{
                    left: `${((hourlyPrice - 10) / (1000 - 10)) * 100}%`,
                  }}
                >
                  ${hourlyPrice}
                </div>
              </div>
            </div>

            {/* Tutor Age */}
            {/* <div className="space-y-2 relative">
              <h1 className="text-[16px] font-[600] leading-normal">
                Tutor Age
              </h1>
              <div className="flex items-center justify-between ">
                <span className="text-text-700 text-[14px] font-[600] leading-normal">
                  {minAge}
                </span>
                <span className="text-text-700 text-[14px] font-[600] leading-normal">
                  {maxAge}
                </span>
              </div>
              <div className="relative">
                <input
                  type="range"
                  min={minAge}
                  max={maxAge}
                  value={tutorAge}
                  onChange={handleAgeChange} // Update state on change
                  style={{ background: `var(--tutor-age-slider-background)` }} // Set the background for tutor age
                  className="custom-slider w-full"
                  onMouseUp={handleAgeChangeRelease} // For mouse release
                  onTouchEnd={handleAgeChangeRelease} // For touch release
                />
                <div
                  className="slider-thumb-value"
                  style={{ left: `${((tutorAge - 18) / (100 - 18)) * 100}%` }}
                >
                  {displayAgeValue} Years
                </div>
              </div>
            </div> */}

            {/* Experience */}
            <div className="space-y-2">
              <h3 className="text-[16px] font-[600] leading-normal">
                Experience
              </h3>
              <div className="flex gap-2 items-center">
                <input
                  type="checkbox"
                  id="beginner"
                  name="beginner"
                  value="beginner"
                  className="custom-checkbox"
                  onChange={handleExperienceChange} // Attach the handler here
                />
                <label htmlFor="beginner" className="text-[15px] font-[400]">
                  Beginner (0 - 1 Years)
                </label>
              </div>
              <div className="flex gap-2 items-center">
                <input
                  type="checkbox"
                  id="intermediate"
                  name="intermediate"
                  value="intermediate"
                  className="custom-checkbox"
                  onChange={handleExperienceChange} // Attach the handler here
                />
                <label htmlFor="intermediate">Intermediate (1 - 5 Years)</label>
              </div>
              <div className="flex gap-2 items-center">
                <input
                  type="checkbox"
                  id="experienced"
                  name="experienced"
                  value="experienced"
                  className="custom-checkbox"
                  onChange={handleExperienceChange} // Attach the handler here
                />
                <label htmlFor="experienced">Experienced (5+ Years)</label>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Filter Popup for small screens */}
      {showFilterPopup && (
        <div
          id="filter-popup-overlay"
          className="fixed top-[58px] lg:hidden inset-0 bg-black bg-opacity-50 flex justify-center items-center"
          onClick={handleOutsideClick}
        >
          <div className="bg-white p-4 rounded-lg w-[98%] md:w-[50%]">
            <button
              className="bg-gradient-to-b rounded-[10px] from-[#FE9E69] to-[rgba(198,81,16,0.76)] px-[27px] py-[7px] text-white font-[600]"
              onClick={() => setShowFilterPopup(false)}
            >
              Close
            </button>
            {/* Mobile Filters UI */}
            <section className="w-full max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="flex flex-col px-2 py-6 gap-[36px] rounded-[16px_0px_0px_16px] shadow-[0px_4px_4px_4px_rgba(0,0,0,0.03)]">
                <h1 className="text-secondary-700 font-[600] text-[16px]">
                  Filters
                </h1>

                {/* Level Selection */}
                <div className="rounded-[4px] bg-white w-full px-2 py-1 shadow-[0px_4px_8px_3px_rgba(0,0,0,0.08)]">
                  <select
                    name="studentLevel"
                    className="w-full font-[600] bg-white outline-none"
                    value={filters.level}
                    onChange={handleLevelChange} // Attach handleLevelChange function
                  >
                    <option value={""}>Select your level</option>
                    <option value={"elementarySchoolLevel"}>
                      Elementary School level
                    </option>
                    <option value={"middleSchoolLevel"}>
                      Middle School level
                    </option>
                    <option value={"highSchoolLevel"}>High School level</option>
                  </select>
                </div>

                {/* Gender Selection */}
                <div className="leading-normal space-y-[4px]">
                  <h3 className="text-[14px] font-[600] leading-normal">
                    Gender
                  </h3>
                  <div className="flex items-center gap-[7px]">
                    <input
                      id="femaleGenderMobile"
                      type="radio"
                      name="gender"
                      value="Female"
                      onChange={handleGenderChange} // Attach handleGenderChange function
                      className="appearance-none w-[14px] h-[14px] border-[1px] border-primary-400 rounded-full bg-white checked:bg-primary-400 relative checked:after:block"
                    />
                    <label
                      htmlFor="femaleGenderMobile"
                      className="text-[12px] font-[500]"
                    >
                      Female
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      id="maleGenderMobile"
                      type="radio"
                      name="gender"
                      value="Male"
                      onChange={handleGenderChange} // Attach handleGenderChange function
                      className="appearance-none w-[14px] h-[14px] border-[1px] border-primary-400 rounded-full bg-white checked:bg-primary-400 relative checked:after:block"
                    />
                    <label
                      htmlFor="maleGenderMobile"
                      className="text-[12px] font-[500]"
                    >
                      Male
                    </label>
                  </div>
                </div>

                {/* Availability */}
                <div className="text-text-950/95 space-y-[2px]">
                  <h3 className="font-[600] text-[14px] leading-normal">
                    Availability
                  </h3>
                  {daysOfWeek.map((day, index) => (
                    <div key={index} className="flex items-center gap-[8px]">
                      <input
                        type="checkbox"
                        id={`${day}Mobile`}
                        name={`day${index}Mobile`}
                        value={day}
                        onChange={() => handleFilterChange("availability", day)} // Attach handleFilterChange for availability
                        className="custom-checkbox"
                      />
                      <label htmlFor={`${day}Mobile`} className="text-[12px]">
                        {day}
                      </label>
                    </div>
                  ))}
                </div>

                {/* Topic */}
                <div className="space-y-2">
                  <h3 className="text-[14px] font-[600] leading-normal">
                    Topic
                  </h3>
                  <div className="rounded-[4px] w-full bg-white px-4 py-2 shadow-[0px_4px_8px_3px_rgba(0,0,0,0.08)]">
                    <select
                      name="subject"
                      className="w-full text-[12px] bg-white font-[600] outline-none"
                      onChange={handleSubjectChange} // Attach handleSubjectChange function
                    >
                      <option value={""}>Area of Subject</option>
                      {subjectsList.map((subject, index) => (
                        <option key={index} value={subject}>
                          {subject}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Hourly Rate */}
                <div className="space-y-2 relative ">
                  <h1 className="text-[14px] font-[600] leading-normal">
                    Hourly Rate
                  </h1>
                  <div className="pr-10 realtive">
                    <input
                      type="range"
                      min={minRate}
                      max={maxRate}
                      value={hourlyPrice}
                      onChange={handleHourlyPriceChange} // Attach handleHourlyPriceChange function
                      style={{ background: `var(--hourly-slider-background)` }} // Set the background for hourly price
                      className="custom-slider w-full"
                      onMouseUp={handleHourlyPriceChangeRelease} // For mouse release
                      onTouchEnd={handleHourlyPriceChangeRelease} // For touch release
                    />
                    <div
                      className="slider-thumb-value transform -translate-x-1/2"
                      style={{
                        left:
                          hourlyPrice > 500
                            ? `${((hourlyPrice - 100) / (1000 - 10)) * 100}%` // For hourlyPrice above 500
                            : `${((hourlyPrice - 10) / (1000 - 10)) * 100}%`, // For hourlyPrice below or equal to 500
                        maxWidth: "calc(100% - 20px)", // Prevents overflow
                        whiteSpace: "nowrap",
                        // position: "relative",
                        marginLeft: "0",
                        overflow: "hidden",
                      }}
                    >
                      ${hourlyPrice}
                    </div>
                  </div>
                </div>

                {/* Experience */}
                <div className="space-y-2">
                  <h3 className="text-[14px] font-[600] leading-normal">
                    Experience
                  </h3>
                  <div className="flex gap-6 flex-col">
                    <div className="flex gap-2 items-center">
                      <input
                        type="checkbox"
                        id="beginnerMobile"
                        name="beginner"
                        value="beginner"
                        onChange={handleExperienceChange} // Attach handleExperienceChange function
                        className="custom-checkbox"
                      />
                      <label
                        htmlFor="beginnerMobile"
                        className="text-[13px] font-[400]"
                      >
                        Beginner (0 - 1 Years)
                      </label>
                    </div>
                    <div className="flex gap-2 items-center">
                      <input
                        type="checkbox"
                        id="intermediateMobile"
                        name="intermediate"
                        value="intermediate"
                        onChange={handleExperienceChange} // Attach handleExperienceChange function
                        className="custom-checkbox"
                      />
                      <label
                        htmlFor="intermediateMobile"
                        className="text-[13px] font-[400]"
                      >
                        Intermediate (1 - 5 Years)
                      </label>
                    </div>
                    <div className="flex gap-2 items-center">
                      <input
                        type="checkbox"
                        id="experiencedMobile"
                        name="experienced"
                        value="experienced"
                        onChange={handleExperienceChange} // Attach handleExperienceChange function
                        className="custom-checkbox"
                      />
                      <label
                        htmlFor="experiencedMobile"
                        className="text-[13px] font-[400]"
                      >
                        Experienced (5+ Years)
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
};

const SuspenseWrapper = () => {
  return (
    <Suspense fallback={<h1>Loading... </h1>}>
      <Page />
    </Suspense>
  );
};

export default SuspenseWrapper;
