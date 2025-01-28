"use client";
import React, { useEffect, useState } from "react";
import CustomFileUpload from "@/app/components/CustomFileUpload";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTutor } from "@/app/components/TutorContext";
import { FiPlus, FiMinus, FiX } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";

function SkeletonLoader() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Basic Information Section Skeleton */}
      <div className="bg-[#F6F6F6] p-4 md:p-6 rounded-lg shadow-md">
        <div className="h-6 bg-gray-300 rounded-md w-1/3 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 md:gap-6">
          <div className="h-10 bg-gray-300 rounded-md"></div>
          <div className="h-10 bg-gray-300 rounded-md"></div>
          <div className="h-10 bg-gray-300 rounded-md"></div>
          <div className="h-10 bg-gray-300 rounded-md"></div>
          <div className="col-span-1 md:col-span-2 h-20 bg-gray-300 rounded-md"></div>
        </div>
      </div>

      {/* Profile Information Section Skeleton */}
      <div className="bg-[#F6F6F6] p-4 md:p-6 rounded-lg shadow-md">
        <div className="h-6 bg-gray-300 rounded-md w-1/3 mb-4"></div>
        <div className="flex md:flex-row flex-col justify-between">
          <div className="w-full md:w-[48%] space-y-4">
            <div className="h-10 bg-gray-300 rounded-md"></div>
            <div className="h-10 bg-gray-300 rounded-md"></div>
          </div>
          <div className="w-full md:w-[48%] space-y-4">
            <div className="h-24 bg-gray-300 rounded-md"></div>
          </div>
        </div>
      </div>

      {/* Education Information Section Skeleton */}
      <div className="bg-[#F6F6F6] p-4 md:p-6 rounded-lg shadow-md">
        <div className="h-6 bg-gray-300 rounded-md w-1/3 mb-4"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="h-10 bg-gray-300 rounded-md"></div>
          <div className="h-10 bg-gray-300 rounded-md"></div>
          <div className="h-10 bg-gray-300 rounded-md"></div>
          <div className="h-10 bg-gray-300 rounded-md"></div>
          <div className="h-10 bg-gray-300 rounded-md"></div>
          <div className="h-10 bg-gray-300 rounded-md"></div>
        </div>
      </div>

      {/* Buttons Section Skeleton */}
      <div className="flex justify-end gap-4 mt-6">
        <div className="h-10 w-[155px] bg-gray-300 rounded-md"></div>
        <div className="h-10 w-[155px] bg-gray-300 rounded-md"></div>
      </div>
    </div>
  );
}

const Page = () => {
  const router = useRouter();
  const allDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const [formData, setFormData] = useState({
    gender: "",
    dob: "",
    age: "",
    socialSecurityNumber: "",
    experience: "",
    level: "",
    hourlyPrice: "",
    responseTime: "",
    cancellationDuration: "",
    availability: [
      // { day: "Monday", slots: [{ from: "", to: "" }] },
      // { day: "Tuesday", slots: [{ from: "", to: "" }] },
      // { day: "Wednesday", slots: [{ from: "", to: "" }] },
      // { day: "Thursday", slots: [{ from: "", to: "" }] },
      // { day: "Friday", slots: [{ from: "", to: "" }] },
      // { day: "Saturday", slots: [{ from: "", to: "" }] },
      // { day: "Sunday", slots: [{ from: "", to: "" }] },
    ],
    timezone: "",
    profileInfo: {
      headline: "",
      about: "",
      profilePicture: null,
    },
    education: [
      {
        highestEducation: "",
        university: "",
        typeOfDegree: "",
        degreeFile: null,
        major: "",
        certificatesFile: null,
      },
    ],
  });

  const {
    stepsCleared,
    setStepsCleared,
    tutorInformation,
    setTutorInformation,
  } = useTutor();

  const [isLoading, setIsLoading] = useState(false);
  const timeZones = [
    "Eastern",
    "Central",
    "Pacific",
    "Mountain",
    "Alaska",
    "Hawaii",
  ];
  const [isOpen, setIsOpen] = useState(false);
  const [removedDays, setRemovedDays] = useState([]);
  const [missingDays, setMissingDays] = useState([
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ]);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  useEffect(() => {
    // Only execute if tutorInformation is available
    if (tutorInformation) {
      setFormData({ ...tutorInformation });

      // Update missingDays based on availability in formData
      const availableDays = tutorInformation.availability.map(dayObj => dayObj.day);
      setMissingDays((prevMissingDays) =>
        prevMissingDays.filter(day => !availableDays.includes(day))
      );
    }

    // Check if the user has cleared the previous step
    if (stepsCleared["step3"] === false) {
      router.push("/tutor-sign-up/step-2"); // Redirect to step 2 if not cleared
    } else {
      setIsLoading(false); // Stop loading if step 3 is cleared
    }
  }, []); // Dependency on tutorInformation

  useEffect(() => {
    if (formData.dob) {
      const birthDate = new Date(formData.dob);
      const age = new Date().getFullYear() - birthDate.getFullYear();
      setFormData((prev) => ({ ...prev, age })); // Automatically update the age
    }
  }, [formData.dob]); // Runs whenever dob changes

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => document.body.classList.remove("overflow-hidden");
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    } else {
      document.removeEventListener("keydown", handleEscape);
    }

    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  if (isLoading) {
    return <SkeletonLoader />;
  }

  const removeDay = (dayIndex) => {
    const removedDay = formData.availability[dayIndex];

    // Remove the day from the availability
    setFormData((prevState) => ({
      ...prevState,
      availability: prevState.availability.filter(
        (_, index) => index !== dayIndex
      ),
    }));

    // Only add the day to missingDays if it is not already present
    if (!missingDays.includes(removedDay.day)) {
      setMissingDays((prev) => [...prev, removedDay.day]);
    }
  };

  const addDay = (day) => {
    // Check if the day is already present in availability
    const dayExists = formData.availability.some(
      (availableDay) => availableDay.day === day
    );

    if (!dayExists) {
      setFormData((prevState) => ({
        ...prevState,
        availability: [...prevState.availability, { day, slots: [] }],
      }));
      setMissingDays((prev) => prev.filter((item) => item !== day));
    }
  };

  // Helper function to generate a time list (24-hour format)
  const generateTimeOptions = () => {
    const options = [];
    for (let i = 0; i < 24; i++) {
      const time = i.toString().padStart(2, "0") + ":00";
      options.push(time);
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  const filterTimeOptions = (dayIndex, slotIndex, type) => {
    const slot = formData.availability[dayIndex].slots[slotIndex];
    const fromIndex = timeOptions.indexOf(slot.from);
    const toIndex = timeOptions.indexOf(slot.to);

    if (type === "from") {
      return timeOptions.filter(
        (_, index) => index < toIndex || toIndex === -1
      );
    } else if (type === "to") {
      return timeOptions.filter(
        (_, index) => index > fromIndex || fromIndex === -1
      );
    }
    return timeOptions;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (name, file) => {
    setFormData((prev) => ({
      ...prev,
      profileInfo: {
        ...prev.profileInfo,
        [name]: file,
      },
    }));
  };

  const handleEducationChange = (index, name, value) => {
    const updatedEducation = [...formData.education];
    updatedEducation[index] = {
      ...updatedEducation[index],
      [name]: value,
    };
    setFormData((prev) => ({ ...prev, education: updatedEducation }));
  };

  // Helper function to generate 1-hour time slots in 24-hour format
  const generateTimeSlots = () => {
    const slots = [];
    for (let i = 0; i < 24; i++) {
      const hour = String(i).padStart(2, "0");
      const from = `${hour}:00`;
      const to = `${i === 23 ? "00" : String(i + 1).padStart(2, "0")}:00`; // Increment the hour for 'to' time, reset to "00" after 23
      slots.push({ from, to });
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const addEducation = () => {
    setFormData((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        {
          highestEducation: "",
          university: "",
          typeOfDegree: "",
          degreeFile: null,
          major: "",
          certificatesFile: null,
        },
      ],
    }));
  };

  const removeEducation = (index) => {
    const updatedEducation = formData.education.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      education: updatedEducation,
    }));
  };

  // Toggle slot selection
  const toggleSlot = (day, slot) => {
    setFormData((prevState) => {
      const newAvailability = [...prevState.availability];
      const dayIndex = newAvailability.findIndex((item) => item.day === day);

      if (dayIndex > -1) {
        const slotIndex = newAvailability[dayIndex].slots.findIndex(
          (existingSlot) =>
            existingSlot.from === slot.from && existingSlot.to === slot.to
        );

        if (slotIndex > -1) {
          // Remove slot
          newAvailability[dayIndex].slots.splice(slotIndex, 1);
          if (newAvailability[dayIndex].slots.length === 0) {
            newAvailability.splice(dayIndex, 1); // Remove the day if no slots left
            setMissingDays((prev) => [...prev, day]);
          }
        } else {
          // Add slot
          newAvailability[dayIndex].slots.push(slot);
        }
      } else {
        // If day not present, add it with the selected slot
        newAvailability.push({ day, slots: [slot] });
      }

      return { ...prevState, availability: newAvailability };
    });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.timezone) {
      toast.error("Please select a timezone.");
      return;
    }
    // console.log("FORM DATA INSIDE SUBMIT HANDLER: ", formData);
    if (formData) {
      setTutorInformation({ ...formData });
    }
    setStepsCleared({ ...stepsCleared, step4: true });
    router.push("/tutor-sign-up/step-4");
  };

  // console.log("FORM DATA: ", formData);

  return (
    <div className="">
      {/* Step Indicator */}
      <Toaster/>
      <div className="md:flex hidden items-center w-[80%] mx-auto py-4 mb-12">
        {Array(5)
          .fill()
          .map((_, index) => (
            <React.Fragment key={index}>
              {/* Step Circle */}
              <div
                className={`flex items-center justify-center w-[50px] h-[50px] rounded-full ${
                  index < 3
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
                    index < 2 ? "border-t-2 border-dashed border-text-800" : ""
                  } mx-2`}
                ></div>
              )}
            </React.Fragment>
          ))}
      </div>

      {/* Step Indicator in mobile */}
      <div className="md:hidden mb-6 w-[40px] bg-primary-400 text-white h-[40px] rounded-[50%] flex items-center justify-center">
        <p>3</p>
      </div>

      <form className="space-y-6" onSubmit={handleFormSubmit}>
        {/* Basic Information Section */}
        <div className="bg-[#F6F6F6] p-4 md:p-6 rounded-lg shadow-md">
          <h2 className="text-[18px] sm:text-[20px] md:text-[25px] font-semibold text-[#1A696B] mb-4">
            Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label className="text-[14px] sm:text-[16px] md:text-[18px] font-semibold text-[#454545]">
                *Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                required
                className="w-full rounded outline-primary-400 font-normal text-[12px] sm:text-[14px] md:text-[16px] px-3 py-2"
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="notWillingToMention">
                  Not Willing To Mention
                </option>
              </select>
            </div>
            <div>
              <label className="text-[14px] sm:text-[16px] md:text-[18px] font-semibold text-[#454545]">
                Date of Birth
              </label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleInputChange}
                required
                className="w-full rounded outline-primary-400 px-3 py-2 text-[12px] sm:text-[14px] md:text-[16px] font-normal"
              />
            </div>
            <div>
              <label className="text-[14px] sm:text-[16px] md:text-[18px] font-semibold text-[#454545]">
                *Age
              </label>
              <input
                type="number"
                name="age"
                value={formData.age}
                // onChange={handleInputChange}
                readOnly
                placeholder="Age"
                className="w-full text-[12px] outline-primary-400 sm:text-[14px] md:text-[16px] font-normal rounded px-3 py-2"
              />
            </div>
            {/*SSN */}
            <div>
              <label className="text-[14px] sm:text-[16px] md:text-[18px] font-semibold text-[#454545]">
                *SSN
                </label>
                <input
                  type="text"
                  name="socialSecurityNumber"
                  value={formData.socialSecurityNumber}
                  onChange={handleInputChange}
                  placeholder="Social Security Number"
                  required
                  className="w-full text-[12px] outline-primary-400 sm:text-[14px] md:text-[16px] font-normal rounded px-3 py-2"
                  />
            </div>
            <div>
              <label className="text-[14px] sm:text-[16px] md:text-[18px] font-semibold text-[#454545]">
                *Experience
              </label>
              <select
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                className="w-full border outline-primary-400 rounded text-[12px] sm:text-[14px] md:text-[16px] font-normal px-3 py-2"
              >
                <option value="">Select</option>
                <option value="beginner">Beginner (0 - 1 Years)</option>
                <option value="intermediate">Intermediate (1 - 5 Years)</option>
                <option value="experienced">Experienced (5+ Years)</option>
              </select>
            </div>
            <div>
              <label className="text-[14px] sm:text-[16px] md:text-[18px] font-semibold text-[#454545]">
                *Hourly Price
              </label>
              <input
                type="number"
                name="hourlyPrice"
                required
                value={formData.hourlyPrice}
                onChange={handleInputChange}
                placeholder="Hourly Price"
                className="w-full text-[12px] outline-primary-400 sm:text-[14px] md:text-[16px] font-normal rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="text-[14px] sm:text-[16px] md:text-[18px] font-semibold text-[#454545]">
                *Response Time (in Minutes)
              </label>
              <input
                type="number" // Use 'time' to enforce HH:MM format
                name="responseTime"
                required
                value={formData.responseTime}
                onChange={handleInputChange}
                className="w-full text-[12px] outline-primary-400 sm:text-[14px] md:text-[16px] font-normal rounded px-3 py-2"
              />
              {/* <p className="text-[12px] text-gray-500 mt-1">
                Enter response time in hours and minutes (e.g., 01:30 for 1 hour
                30 minutes).
              </p> */}
            </div>

            {/* <div>
              <label className="text-[14px] sm:text-[16px] md:text-[18px] font-semibold text-[#454545]">
                *Cancellation Duration (HH:MM)
              </label>
              <input
                type="time"
                name="cancellationDuration"
                value={formData.cancellationDuration}
                onChange={handleInputChange}
                className="w-full text-[12px] outline-primary-400 sm:text-[14px] md:text-[16px] font-normal rounded px-3 py-2"
              />
              <p className="text-[12px] text-gray-500 mt-1">
                Enter duration in hours and minutes (e.g., 02:30 for 2 hours 30
                minutes)
              </p>
            </div> */}

            <div>
              <label className="text-[14px] sm:text-[16px] md:text-[18px] font-semibold text-[#454545]">
                *Cancellation Duration
              </label>
              <select
                name="cancellationDuration"
                required
                value={formData.cancellationDuration}
                onChange={handleInputChange}
                className="w-full text-[12px] outline-primary-400 sm:text-[14px] md:text-[16px] font-normal rounded px-3 py-2"
              >
                <option value="00:00">Select Duration</option>
                <option value="01:00">1 Hour</option>
                <option value="02:00">2 Hours</option>
                <option value="03:00">3 Hours</option>
                <option value="04:00">4 Hours</option>
                <option value="05:00">5 Hours</option>
              </select>
              {/* <p className="text-[12px] text-gray-500 mt-1">
                Choose a cancellation duration up to 5 hours.
              </p> */}
            </div>

            <div>
              <label className="text-[14px] sm:text-[16px] md:text-[18px] font-semibold text-[#454545]">
                *Level
              </label>
              <select
                name="level"
                value={formData.level}
                required
                onChange={handleInputChange}
                className="w-full border outline-primary-400 rounded text-[12px] sm:text-[14px] md:text-[16px] font-normal px-3 py-2"
              >
                <option value="">Select</option>
                <option value="elementarySchoolLevel">
                  Elementary School Level
                </option>
                <option value="middleSchoolLevel">Middle School Level</option>
                <option value="highSchoolLevel">High School Level</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[14px] sm:text-[16px] md:text-[18px] font-semibold text-[#454545]">
                Availability
              </label>
              <button
                onClick={openModal}
                type="button"
                className="bg-primary-400 w-fit text-white font-semibold py-2 px-4 rounded-lg shadow hover:bg-primary-500 focus:outline-none"
              >
                Set Availability
              </button>
              {isOpen && (
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

                    <h2 className="text-2xl font-semibold text-gray-800 text-center mb-4">
                      Set Your Availability
                    </h2>

                    {/* Timezone Selector */}
                    <div>
                      <label className="block text-lg font-medium text-gray-700 mb-1">
                        Timezone
                      </label>
                      <select
                        value={formData.timezone}
                        onChange={(e) =>
                          setFormData((prevState) => ({
                            ...prevState,
                            timezone: e.target.value,
                          }))
                        }
                        required
                        className="w-full p-2 border border-gray-300 rounded-lg focus:border-secondary-500 focus:outline-none"
                      >
                        <option value="">Select Timezone</option>
                        {timeZones.map((zone) => (
                          <option key={zone} value={zone}>
                            {zone} Time
                          </option>
                        ))}
                        
                      </select>
                      {!formData.timezone && (
    <p className="text-red-500 text-sm mt-1">Timezone is required.</p>
  )}
                    </div>

                    {/* Selected Slots */}
                    {formData.availability.map((dayObj, dayIndex) => (
                      <div
                        key={dayObj.day}
                        className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm space-y-4 mt-4"
                      >
                        <div className="flex justify-between items-center">
                          <h3 className="text-xl font-medium text-gray-700">
                            {dayObj.day}
                          </h3>
                          <button
                            type="button"
                            onClick={() => removeDay(dayIndex)}
                            className="text-primary-500 hover:text-primary-600 flex items-center space-x-1"
                          >
                            <FiMinus size={18} />
                            <span className="text-sm">Remove Day</span>
                          </button>
                        </div>

                        {/* Display the available slots for this day */}
                        <div className="grid grid-cols-3 sm:grid-cols-3 gap-4">
                          {timeSlots.map((slot, slotIndex) => (
                            <button
                              key={slotIndex}
                              type="button"
                              onClick={() => toggleSlot(dayObj.day, slot)}
                              className={`border-2 p-2 transition-all duration-200 ease-in-out rounded-lg text-sm border-secondary-600  ${
                                dayObj.slots.some(
                                  (existingSlot) =>
                                    existingSlot.from === slot.from &&
                                    existingSlot.to === slot.to
                                )
                                  ? "bg-primary-400 text-white"
                                  : "hover:bg-primary-300 hover:text-white text-secondary-600 border-secondary-600"
                              }`}
                            >
                              {slot.from} - {slot.to}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}

                    {/* Missing Days */}
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">
                        Add Day
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {missingDays.map((day) => (
                          <button
                            key={day}
                            type="button"
                            onClick={() => addDay(day)}
                            className="text-teal-600 hover:text-teal-800 bg-gray-100 px-3 py-1 rounded-lg border border-teal-500"
                          >
                            Add {day}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={closeModal}
                      className="w-full bg-teal-600 text-white font-semibold py-2 rounded-lg shadow hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 mt-4"
                    >
                      Submit Availability
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="bg-[#F6F6F6] p-4 md:p-6 rounded-lg shadow-md">
          <h2 className="text-[18px] sm:text-[20px] md:text-[25px] font-semibold text-[#1A696B] mb-4">
            Profile Information
          </h2>
          <div className="flex md:flex-row flex-col justify-between">
            <div className="w-full md:w-[48%] space-y-1">
              <div>
                <label className="text-[14px] sm:text-[16px] md:text-[18px] font-medium text-[#5D5D5D]">
                  Short Headline
                </label>
                <input
                  type="text"
                  name="headline"
                  value={formData.profileInfo.headline}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      profileInfo: {
                        ...prev.profileInfo,
                        headline: e.target.value,
                      },
                    }))
                  }
                  placeholder="A Short Headline"
                  className="w-full border outline-primary-400 text-[12px] sm:text-[14px] md:text-[16px] font-normal rounded px-3 py-2"
                />
              </div>
              <div>
                <CustomFileUpload
                  label="*Profile Picture"
                  onChange={(file) => handleFileChange("profilePicture", file)}
                  existingFileName={
                    formData.profileInfo.profilePicture?.name ||
                    "Existing Profile Picture Name"
                  } // Pass the existing file name
                />
                <p className="text-[9px] md:text-[12px] font-medium text-[#6D6D6D]">
                  Minimum size: 200 x 200 pixels
                </p>
                <p className="text-[9px] md:text-[12px] font-medium text-[#6D6D6D]">
                  Tutors with a profile photo receive three times more business
                  than tutors without one.
                </p>
              </div>
            </div>
            <div className="w-full md:w-[48%]">
              <label className="text-[14px] sm:text-[16px] md:text-[18px] font-semibold text-[#454545]">
                *About
              </label>
              <textarea
                name="about"
                value={formData.profileInfo.about}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    profileInfo: {
                      ...prev.profileInfo,
                      about: e.target.value,
                    },
                  }))
                }
                placeholder="Enter Minimum 250 Characters"
                className="w-full outline-primary-400 resize-none border rounded px-3 py-2 text-[12px] sm:text-[14px] md:text-[16px] font-normal"
                rows="4"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Education Information */}
        {formData.education.map((edu, index) => (
          <div
            key={index}
            className="bg-text-50 p-4 md:p-6 rounded-lg shadow-md space-y-4"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-[18px] sm:text-[20px] md:text-[25px] font-semibold text-secondary-700">
                Education Information {index + 1}
              </h2>
              <div className="flex items-center">
                {formData.education.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeEducation(index)}
                    className="text-[20px] md:text-[24px] font-bold text-primary-400 mr-4"
                  >
                    -
                  </button>
                )}
                {index === formData.education.length - 1 && (
                  <button
                    type="button"
                    onClick={addEducation}
                    className="text-[20px] md:text-[24px] font-bold text-secondary-500"
                  >
                    +
                  </button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[14px] sm:text-[16px] md:text-[18px] font-semibold text-[#454545]">
                  *Highest Education
                </label>
                <input
                  type="text"
                  value={edu.highestEducation}
                  onChange={(e) =>
                    handleEducationChange(
                      index,
                      "highestEducation",
                      e.target.value
                    )
                  }
                  required
                  className="w-full border outline-primary-400 rounded px-3 py-2 text-[12px] sm:text-[14px] md:text-[16px] font-normal"
                />
              </div>
              <div>
                <label className="text-[14px] sm:text-[16px] md:text-[18px] font-semibold text-[#454545]">
                  *University
                </label>
                <input
                  type="text"
                  value={edu.university}
                  onChange={(e) =>
                    handleEducationChange(index, "university", e.target.value)
                  }
                  required
                  className="w-full border outline-primary-400 rounded px-3 py-2 text-[12px] sm:text-[14px] md:text-[16px] font-normal"
                />
              </div>
              <div>
                <label className="text-[14px] sm:text-[16px] md:text-[18px] font-semibold text-[#454545]">
                  *Type Of Degree
                </label>
                <input
                  type="text"
                  value={edu.typeOfDegree}
                  onChange={(e) =>
                    handleEducationChange(index, "typeOfDegree", e.target.value)
                  }
                  required
                  className="w-full border outline-primary-400 rounded px-3 py-2 text-[12px] sm:text-[14px] md:text-[16px] font-normal"
                />
              </div>
              <div className="outline-primary-400">
                <CustomFileUpload
                  label="*Upload Degree"
                  onChange={(file) =>
                    handleEducationChange(index, "degreeFile", file)
                  }
                  existingFileName={
                    edu.degreeFile?.name || "Existing Degree File Name"
                  } // Pass the existing file name for degree
                />
              </div>
              <div>
                <label className="text-[14px] sm:text-[16px] md:text-[18px] font-semibold text-[#454545]">
                  *Major
                </label>
                <input
                  type="text"
                  value={edu.major}
                  onChange={(e) =>
                    handleEducationChange(index, "major", e.target.value)
                  }
                  className="w-full border outline-primary-400 rounded px-3 py-2 text-[12px] sm:text-[14px] md:text-[16px] font-normal"
                />
              </div>
              <div>
                <CustomFileUpload
                  label="*Upload Certificates"
                  onChange={(file) =>
                    handleEducationChange(index, "certificatesFile", file)
                  }
                  existingFileName={
                    edu.certificatesFile?.name ||
                    "Existing Certificate File Name"
                  } // Pass the existing file name for certificates
                />
              </div>
            </div>
          </div>
        ))}

        {/* Buttons Section */}
        <div className="flex justify-end gap-4 mt-6">
          <Link href={"/tutor-sign-up/step-2"}>
            <button
              type="button"
              className="border-[2px] border-primary-400 sm:text-[18px] text-[16px] md:text-[20px] font-[600] leading-normal w-[155px] h-[32px] flex items-center justify-center rounded-[8px] bg-white text-primary-400 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.02)]"
            >
              Back
            </button>
          </Link>
          {/* <Link href={"/tutor-sign-up/step-4"}> */}
          <button
            type="submit"
            className="bg-primary-400 rounded-[4px] w-[155px] h-[32px] flex items-center justify-center font-[600] sm:text-[18px] text-[16px] md:text-[20px] leading-normal text-white shadow-[0px_2px_4px_0px_rgba(0,0,0,0.15)]"
          >
            Next
          </button>
          {/* </Link> */}
        </div>
      </form>
    </div>
  );
};

export default Page;
