"use client";
import { Poppins } from "next/font/google";
import React, { useEffect, useState } from "react";
import CustomFileUpload from "../../components/CustomFileUpload";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiPlus, FiMinus, FiX } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600"] });

const TutorProfileForm = () => {
  const router = useRouter();
  function SkeletonLoader() {
    return (
      <div className="space-y-6 animate-pulse container mx-auto px-[20px] lg:px-[50px] xl:px-[86px] py-16">
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
  const [formData, setFormData] = useState({
    tutorDetails: {
      about: "",
      age: null,
      availability: [],
      timezone: "",
      cancellationDuration: "",
      dateOfBirth: "",
      experience: "",
      firstName: "",
      gender: "",
      headline: "",
      hourlyPrice: null,
      lastName: "",
      level: "",
      profilePicture: null,
      responseTime: "",
      zipCode: "",
    },

    educationDetails: [
      {
        highestEducation: "",
        university: "",
        typeOfDegree: "",
        major: "",
        degreeFile: null,
        certificatesFile: null,
      },
    ],
  });

  const allDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

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

  console.log("formData : ", formData);

  const [loading, setLoading] = useState(true);

  // Fetch the initial tutor data from the server
  const fetchTutorProfile = async () => {
    const response = await fetch("/api/tutors/tutorprofile", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    if (response.ok) {
      setLoading(false);
    }
    console.log("DATA: ", data);
    setFormData({
      tutorDetails: data.tutor?.tutorDetails || {},
      educationDetails: data.tutor?.educationDetails || [],
    });
    const availableDays = data?.tutor.tutorDetails?.availability.map(dayObj => dayObj.day);
      setMissingDays((prevMissingDays) => 
        prevMissingDays.filter(day => !availableDays.includes(day))
      );

  };

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

  useEffect(() => {
    fetchTutorProfile();
  }, []);

  if (loading) {
    return <SkeletonLoader />;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      tutorDetails: {
        ...prevState.tutorDetails,
        [name]: value,
      },
    }));
  };

  const handleEducationChange = (index, field, value) => {
    const updatedEducation = [...formData.educationDetails];
    updatedEducation[index][field] = value;
    setFormData((prevState) => ({
      ...prevState,
      educationDetails: [...prevState.educationDetails],
    }));
  };

  const addEducation = () => {
    setFormData((prevState) => ({
      ...prevState,
      educationDetails: [
        ...prevState.educationDetails,
        {
          highestEducation: "",
          university: "",
          typeOfDegree: "",
          major: "",
          degreeFile: null,
          certificatesFile: null,
        },
      ],
    }));
  };

  const removeEducation = (index) => {
    const updatedEducation = formData.educationDetails.filter(
      (_, i) => i !== index
    );
    setFormData((prevState) => ({
      ...prevState,
      educationDetails: updatedEducation,
    }));
  };

  const handleFileChange = (name, file) => {
    setFormData((prev) => ({
      ...prev,
      tutorDetails: {
        ...prev.tutorDetails,
        profilePicture: file,
      },
    }));
  };

  const handleSlotChange = (dayIndex, slotIndex, type, value) => {
    const updatedAvailability = [...formData.tutorDetails.availability];
    updatedAvailability[dayIndex].slots[slotIndex][type] = value;
    setFormData((prev) => ({
      ...prev,
      tutorDetails: {
        ...prev.tutorDetails,
        availability: [...updatedAvailability],
      },
    }));
  };

  const removeDay = (dayIndex) => {
    const removedDay = formData.tutorDetails.availability[dayIndex];
    setFormData((prevState) => ({
      ...prevState,
      tutorDetails: {
        ...prevState.tutorDetails,
        availability: [
          ...prevState.tutorDetails.availability.filter(
            (_, index) => index !== dayIndex
          ),
        ],
      },
    }));
    if (!missingDays.includes(removedDay.day)) {
      setMissingDays((prev) => [...prev, removedDay.day]);
    }
  };

  const addDay = (day) => {
    // Check if the day is already present in tutorDetails.availability
    const dayExists = formData.tutorDetails.availability.some(
      (availableDay) => availableDay.day === day
    );

    if (!dayExists) {
      setFormData((prevState) => ({
        ...prevState,
        tutorDetails: {
          ...prevState.tutorDetails,
          availability: [
            ...prevState.tutorDetails.availability,
            { day, slots: [] },
          ],
        },
      }));
      setMissingDays((prev) => prev.filter((item) => item !== day));
    }
  };

  const addDayBack = (day) => {
    setFormData((prevState) => ({
      ...prevState,
      tutorDetails: {
        ...prevState.tutorDetails,
        availability: [...prevState.tutorDetails.availability, day],
      },
    }));
    // setAvailability((prev) => [...prev, day]);
    setRemovedDays((prev) =>
      prev.filter((removedDay) => removedDay.day !== day.day)
    );
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

  // Toggle slot selection
  const toggleSlot = (day, slot) => {
    setFormData((prevState) => {
      const newAvailability = [...prevState.tutorDetails.availability];
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

  const filterTimeOptions = (dayIndex, slotIndex, type) => {
    const slot = formData.tutorDetails.availability[dayIndex].slots[slotIndex];
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

  const handleFormSubmit = async (e) => {
    e.preventDefault(); // Prevent the form from refreshing the page

    console.log("Form data before submission:", formData); // Debugging line

    const data = new FormData();

    data.append("gender", formData.tutorDetails.gender || "");
    data.append("dateOfBirth", formData.tutorDetails.dateOfBirth || "");
    data.append("age", formData.tutorDetails.age || "");
    data.append("experience", formData.tutorDetails.experience || "");
    data.append("hourlyPrice", formData.tutorDetails.hourlyPrice || "");
    data.append("responseTime", formData.tutorDetailsresponseTime || "");
    data.append(
      "cancellationDuration",
      formData.tutorDetails.cancellationDuration || ""
    );
    data.append("level", formData.tutorDetails.level || "");
    data.append(
      "availability",
      JSON.stringify(formData.tutorDetails.availability)
    );
    data.append(
      "timezone",
      JSON.stringify(formData.tutorDetails.availability.timezone)
    );
    data.append("headline", formData.tutorDetails.headline || "");
    data.append("about", formData.tutorDetails.about || "");

    if (formData.tutorDetails.profilePicture) {
      data.append("profilePicture", formData.tutorDetails.profilePicture);
    }

    formData?.educationDetails?.forEach((edu, index) => {
      data.append(
        `education[${index}][highestEducation]`,
        edu.highestEducation || ""
      );
      data.append(`education[${index}][university]`, edu.university || "");
      data.append(`education[${index}][typeOfDegree]`, edu.typeOfDegree || "");
      data.append(`education[${index}][major]`, edu.major || "");
      if (edu.degreeFile) {
        data.append(`education[${index}][degreeFile]`, edu.degreeFile);
      }
      if (edu.certificatesFile) {
        data.append(
          `education[${index}][certificatesFile]`,
          edu.certificatesFile
        );
      }
    });

    try {
       const toastLoading=toast.loading("Saving Profile...");
      const response = await fetch("/api/tutors/edittutor-profile", {
        method: "POST",
        body: data,
      });

      const result = await response.json();
      if (response.ok) {
        toast.dismiss(toastLoading);
        toast.success("Profile updated successfully");
        console.log("Profile updated successfully:", result);
        router.push("/tutor/my-profile");
      }
      if (!response.ok) {
        toast.dismiss(toastLoading);
        toast.error("Error saving tutor profile:", result.message);
        console.error("Error saving tutor profile:", result.message);
      } else {

        console.log("Profile updated successfully:", result);
      }
    } catch (error) {
      console.error("Error occurred:", error);
    }
  };

  return (
    <div
      className={`container mx-auto ${poppins.className} px-[20px] lg:px-[50px]  xl:px-[86px] py-16`}
    >
      <Toaster/>
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
                value={formData?.tutorDetails?.gender}
                onChange={handleInputChange}
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
                name="dateOfBirth"
                value={
                  formData.tutorDetails.dateOfBirth
                    ? new Date(formData.tutorDetails.dateOfBirth)
                        .toISOString()
                        .split("T")[0]
                    : ""
                } // Ensure it's properly bound
                onChange={handleInputChange}
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
                value={formData?.tutorDetails?.age}
                onChange={handleInputChange}
                placeholder="Age"
                className="w-full text-[12px] outline-primary-400 sm:text-[14px] md:text-[16px] font-normal rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="text-[14px] sm:text-[16px] md:text-[18px] font-semibold text-[#454545]">
                *Experience
              </label>
              <select
                name="experience"
                value={formData?.tutorDetails?.experience}
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
                value={formData.tutorDetails?.hourlyPrice}
                onChange={handleInputChange}
                // placeholder="Hourly Price"
                className="w-full text-[12px] outline-primary-400 sm:text-[14px] md:text-[16px] font-normal rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="text-[14px] sm:text-[16px] md:text-[18px] font-semibold text-[#454545]">
                *Response Time
              </label>
              <input
                type="text"
                name="responseTime"
                value={formData.tutorDetails?.responseTime}
                onChange={handleInputChange}
                // placeholder="e.g. 1 hour or 30 minutes"
                className="w-full text-[12px] outline-primary-400 sm:text-[14px] md:text-[16px] font-normal rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="text-[14px] sm:text-[16px] md:text-[18px] font-semibold text-[#454545]">
                *Cancellation Duration
              </label>
              <input
                type="text"
                name="cancellationDuration"
                value={formData?.tutorDetails?.cancellationDuration}
                onChange={handleInputChange}
                // placeholder="e.g. 2 hours or 30 minutes"
                className="w-full text-[12px] outline-primary-400 sm:text-[14px] md:text-[16px] font-normal rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="text-[14px] sm:text-[16px] md:text-[18px] font-semibold text-[#454545]">
                *Level
              </label>
              <select
                name="level"
                value={formData?.tutorDetails?.level}
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

            <div className="col-span-1 flex flex-col gap-2 md:col-span-2">
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
                        value={formData?.tutorDetails?.timezone}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            tutorDetails: {
                              ...prev.tutorDetails,
                              timezone: e.target.value,
                            },
                          }))
                        }
                        className="w-full p-2 border border-gray-300 rounded-lg focus:border-secondary-500 focus:outline-none"
                      >
                        <option value="">Select Timezone</option>
                        {timeZones.map((zone) => (
                          <option key={zone} value={zone}>
                            {zone} Time
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Availability Slots */}
                    {formData?.tutorDetails?.availability?.map(
                      (dayObj, dayIndex) => (
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
                      )
                    )}

                    {/* Missing Days */}
                    {missingDays.length > 0 && (
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
                    )}

                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="w-full bg-primary-400 text-white font-semibold py-2 rounded-lg shadow hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-secondary-500 mt-4"
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
                  value={formData?.tutorDetails?.headline}
                  onChange={handleInputChange}
                  placeholder="A Short Headline"
                  className="w-full border outline-primary-400 text-[12px] sm:text-[14px] md:text-[16px] font-normal rounded px-3 py-2"
                />
              </div>
              <div>
              <CustomFileUpload
  label="*Profile Picture"
  onChange={(file) => handleFileChange("profilePicture", file)}
  existingFileName={
    formData?.tutorDetails?.profilePicture instanceof File
      ? formData.tutorDetails.profilePicture.name // Use the file name
      : formData?.tutorDetails?.profilePicture || "Existing Profile Picture Name"
  }
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
                value={formData?.tutorDetails?.about}
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
        {formData?.educationDetails?.map((edu, index) => (
          <div
            key={index}
            className="bg-text-50 p-4 md:p-6 rounded-lg shadow-md space-y-4"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-[18px] sm:text-[20px] md:text-[25px] font-semibold text-secondary-700">
                Education Information {index + 1}
              </h2>
              <div className="flex items-center">
                {formData.educationDetails.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeEducation(index)}
                    className="text-[20px] md:text-[24px] font-bold text-primary-400 mr-4"
                  >
                    -
                  </button>
                )}
                {index === formData.educationDetails.length - 1 && (
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
                    edu.uploadDegree || "Existing Degree File Name"
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
                    edu.uploadCertificate || "Existing Certificate File Name"
                  } // Pass the existing file name for certificates
                />
              </div>
            </div>
          </div>
        ))}

        {/* Buttons Section */}
        <div className="flex justify-end gap-4 mt-6">
          <Link href={"/tutor/my-profile"}>
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
            Submit
          </button>
          {/* </Link> */}
        </div>
      </form>
    </div>
  );
};

export default TutorProfileForm;
