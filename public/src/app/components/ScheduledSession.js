"use client";
import React, { useEffect, useState } from "react";
import { DateTime } from "luxon";
import Image from "next/image";
import { useSession } from "next-auth/react";
import toast, { Toaster } from "react-hot-toast";

// Spinner Component
const Spinner = () => (
  <div className="flex m-auto justify-center items-center h-24">
    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4  border-secondary-600"></div>
  </div>
);

const ScheduledSession = ({ tutorId, setShowModal,scheduledClassId }) => {
  const { data: session } = useSession();
  const [tutor, setTutor] = useState({});
  const [loading, setLoading] = useState(false);
  const [dateList, setDateList] = useState([]);
  const [duration, setDuration] = useState(60); // Default duration in minutes (1 Hour)
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [subject, setSubject] = useState("");
  const [areaOfSubject, setAreaOfSubject] = useState("");
  const [detailsOfClass, setDetailsOfClass] = useState("");

  useEffect(() => {
    const getTutor = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/student/get-tutor-profile?tutorId=${tutorId}`
        );
        const data = await response.json();

        setTutor(data.tutor);
        setLoading(false);
      } catch (error) {
        console.log("Error while fetching Tutor Details: ", error);
      }
    };
    getTutor();
  }, []);

  useEffect(() => {
    const today = DateTime.now().setZone(
      timezoneMapping[tutor?.tutorDetails?.timezone]
    ); // Get current date in tutor's timezone
    console.log("TODAY: ", today.toString());
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const dates = [];

    for (let i = 0; i < 30; i++) {
      const date = today.plus({ days: i }); // Add i days to the current date in the tutor's timezone

      const dayName = daysOfWeek[date.weekday - 1]; // `weekday` is 1-7 in Luxon, not 0-6

      // Ensure the dayName matches the formatted date by using Luxon's `toFormat()`
      const formattedDate = date.toFormat("cccc MMMM dd"); // "cccc" is the full weekday name, "MMMM" is the full month name, "dd" is the day of the month

      // Ensure consistency between the calculated dayName and the formatted date string
      const dateObj = {
        // dayName: dayName, // Day name as calculated based on the tutor's time zone
        dayName: formattedDate.split(" ")[0],
        dateString: formattedDate, // Formatted date string
        rawDate: date, // Store the raw DateTime object
      };

      dates.push(dateObj);
    }

    console.log("DATES: ", dates);
    setDateList(dates);
  }, [tutor?.tutorDetails?.timezone]);

  const handleDurationChange = (event) => {
    const selectedDuration = event.target.value;
    setDuration(selectedDuration === "1 Hour" ? 60 : 30);
    setSelectedSlot(null);
  };

  const splitSlots = (slot, timezone) => {
    const [startHour, startMinute] = slot.from.split(":").map(Number);
    const [endHour, endMinute] = slot.to.split(":").map(Number);

    // Create DateTime objects for the start and end time in the tutor's time zone
    const startTime = DateTime.now()
      .setZone(timezoneMapping[timezone])
      .set({ hour: startHour, minute: startMinute, second: 0, millisecond: 0 });
    const endTime = DateTime.now()
      .setZone(timezoneMapping[timezone])
      .set({ hour: endHour, minute: endMinute, second: 0, millisecond: 0 });

    const slots = [];
    let currentTime = startTime;

    while (currentTime < endTime) {
      const nextTime = currentTime.plus({ minutes: duration });

      // Break the loop if the next slot exceeds the end time
      if (nextTime > endTime) break;

      slots.push({
        from: currentTime.toFormat("HH:mm"), // Format the time as HH:mm
        to: nextTime.toFormat("HH:mm"), // Format the time as HH:mm
      });

      currentTime = nextTime;
    }

    return slots;
  };

  const handleSlotSelect = (dateString, from, to) => {
    setSelectedSlot({ date: dateString, from, to });
  };

  const handleSendRequest = async () => {
    if (!selectedSlot || !subject || !areaOfSubject || !detailsOfClass) {
      toast.error("Please complete all fields and select a time slot.");
      return;
    }

    // Get the tutor's time zone to handle date formatting properly
    const tutorTimezone = timezoneMapping[tutor?.tutorDetails?.timezone];
    // Find the corresponding date object for the selected date
    const selectedDateObj = dateList.find(
      (dateObj) => dateObj.dateString === selectedSlot.date
    );

    // Ensure that the selected date is in the tutor's time zone
    const selectedDateInTutorTimezone = DateTime.fromJSDate(
      selectedDateObj.rawDate,
      { zone: tutorTimezone }
    )
      .set({
        hour: parseInt(selectedSlot.from.split(":")[0]),
        minute: parseInt(selectedSlot.from.split(":")[1]),
      })
      .toISO(); // Convert to ISO string to maintain consistency

    // The year is directly derived from rawDate
    const year = selectedDateObj.rawDate.year; // Extract year from the `rawDate` of the selected date

    const payload = {
        scheduledClassId: scheduledClassId,
      studentUsername: session?.username,
      tutorId: tutorId,
      timeslot: {
        date: `${selectedSlot.date}, ${year}`, // Use the selected date with the year
        time: `${selectedSlot.from} - ${selectedSlot.to}`,
        timezone: tutor?.tutorDetails?.timezone, // Retain tutor's timezone
      },
      classDescription: detailsOfClass,
      subjectDetails: {
        subject: subject,
        areaOfSubject: areaOfSubject,
      },
      classDuration: duration === 60 ? "1 Hour" : "30 Minutes",
      selectedTime: selectedDateInTutorTimezone, // Add the time with the correct timezone to the payload
    };
 
    try {
      const toastId = toast.loading("Sending your request...");
      const response = await fetch("/api/student/reschedule-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setSelectedSlot(null);
        setAreaOfSubject("");
        setSubject("");
        setDetailsOfClass("");
        toast.dismiss(toastId);
        toast.success("Request sent successfully!", {
          duration: 4000,
        });
      } else {
        const data = await response.json();
        toast.dismiss(toastId);
        toast.error(data.message, {
          duration: 4000,
        });
      }
    } catch (error) {
      console.error("Error sending request:", error);
      toast.error("An error occurred while sending your request.", {
        duration: 4000,
      });
    }
  };

  const timezoneMapping = {
    Hawaii: "Pacific/Honolulu",
    Alaska: "America/Anchorage",
    Pacific: "America/Los_Angeles",
    Mountain: "America/Denver",
    Central: "America/Chicago",
    Eastern: "America/New_York",
  };

  console.log("Selected Time: ", selectedSlot);

  const getCurrentTimeInTutorTimezone = (timezone) => {
    console.log(timezone);
    const standardTimezone = timezoneMapping[timezone];

    // Get the current time in the tutor's time zone
    const tutorTime = DateTime.now().setZone(standardTimezone);

    // Logging the time in tutor's time zone
    console.log("Current Date in Tutor Timezone: ", tutorTime.toString());

    // // If you want to work with it as a Date object in the tutor's time zone (without conversion to local time):
    // console.log("Tutor Time (ISO format): ", tutorTime.toISO()); // ISO string format

    // // If you need a JavaScript Date object but in the tutor's time zone:
    // const tutorDate = tutorTime.toJSDate(); // This will give the Date object in UTC, but converted from the tutor's time zone
    // console.log("JS Date (in UTC): ", tutorDate);

    // return tutorDate; // This returns the JS Date object in UTC, but from the tutor's time zone
    return tutorTime;
  };

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="rounded-md relative md:max-h-[640px] h-[70vh] sm:h-[90vh] p-4 sm:p-10 overflow-y-auto custom-scrollbar border border-black/10 bg-white ">
      <Toaster
        containerStyle={{
          top: 60,
          left: 20,
          bottom: 20,
          right: 20,
        }}
      />
      <div className="flex sm:flex-row flex-col  sm:items-center justify-between">
        <div className="flex gap-2 sm:flex-row flex-col items-center ">
          <Image
            src="/images/student-dashboard.png"
            alt="Student Dashboard"
            width={60}
            height={60}
          />
          <div className="flex flex-col w-full px-4 sm:px-0 ">
            <h1 className="text-[#1A696B] capitalize text-[0.8rem] sm:text-[1.2rem] font-semibold">
              {tutor?.tutorDetails?.firstName} {tutor?.tutorDetails?.lastName}
            </h1>
            <p className="text-[#000] font-bold text-[0.6rem] sm:text-[1rem] flex flex-wrap gap-[4px]">
              <span className="text-nowrap">Subject Expertise :</span>
              {tutor?.subjectsTaught?.map((subject, index) => (
                <span key={index} className="text-[#4F4F4F]">
                  {subject.subjectExpertise}
                  {tutor?.subjectsTaught.length - 1 !== index && ","}
                </span>
              ))}
            </p>
          </div>
        </div>
        <p className="text-[#4F4F4F] text-[0.6rem] px-4 sm:px-0 sm:text-[1rem] font-semibold">
          Price :{" "}
          <span className="text-[#1A696B]">
            ${tutor?.tutorDetails?.hourlyPrice}/Hour
          </span>
        </p>
      </div>

      <div className="text-center my-6">
        <h3 className="text-[#252525] font-semibold text-[14px] sm:text-[18px]">
          Select a time slot you’d like to book
        </h3>
        <p className="text-[#5D5D5D] font-medium text-[12px] sm:text-[16px]">
          Tutor Time Zone: {tutor?.tutorDetails?.timezone} Time
        </p>
      </div>

      <div className="flex justify-center">
        <div className="bg-[#F6F6F6] p-6 rounded-lg w-full h-[340px] overflow-y-auto custom-scrollbar">
          <div className="flex text-[0.6rem] sm:text-[1rem] justify-end items-center mb-4">
            <label className="text-gray-800 mr-2">Duration:</label>
            <select
              className="border border-gray-300 outline-primary-400 rounded-md px-[4px] py-[2px] sm:p-2 text-gray-600"
              // onChange={handleDurationChange}
            >
              <option>1 Hour</option>
              <option>30 Minutes</option>
            </select>
          </div>

          <div className="space-y-6">
            {dateList.map((dateObj, dateIndex) => {
              // Find the tutor's availability for the given day
              const availabilityForDay =
                tutor?.tutorDetails?.availability?.find(
                  (availability) => availability.day === dateObj.dayName
                );

              // If there's no availability for the day or no slots available, skip rendering the day
              if (
                !availabilityForDay ||
                availabilityForDay.slots.length === 0
              ) {
                return null; // Skip days with no availability or empty slots
              }

              // Get the current time in the tutor's time zone
              const currentLocalTime = getCurrentTimeInTutorTimezone(
                tutor?.tutorDetails?.timezone
              );
              console.log("CURRENT LOCAL TIME: ", currentLocalTime);

              // If it's the current day, check if all available slots have passed
              if (dateIndex === 0) {
                // Check if all slots for today have passed
                const allSlotsPassed = availabilityForDay.slots.every(
                  (slot) => {
                    const [slotHour, slotMinute] = slot.from
                      .split(":")
                      .map(Number);

                    // Create a Luxon DateTime object for the slot's start time in the tutor's time zone
                    const slotDateTime = DateTime.fromObject(
                      {
                        year: dateObj.rawDate.year,
                        month: dateObj.rawDate.month,
                        day: dateObj.rawDate.day,
                        hour: slotHour,
                        minute: slotMinute,
                      },
                      { zone: timezoneMapping[tutor?.tutorDetails?.timezone] } // Set the tutor's time zone
                    );

                    // Check if the current local time is greater than or equal to the slot's start time
                    return slotDateTime <= currentLocalTime;
                  }
                );

                // If all slots have passed for today, skip rendering the day
                if (allSlotsPassed) {
                  return null; // Skip today if no slots are available
                }
              }

              return (
                <div key={dateIndex}>
                  <p className="text-orange-600 text-[0.8rem] sm:text-[1.2rem] font-semibold mb-2">
                    {dateObj.dateString}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {availabilityForDay.slots.map((slot, slotIndex) => {
                      // Parse the slot's "from" time and create a Luxon DateTime object in the tutor's time zone
                      const [slotHour, slotMinute] = slot.from
                        .split(":")
                        .map(Number);

                      // Create a Luxon DateTime object for the slot's start time in the tutor's time zone
                      const slotDateTime = DateTime.fromObject(
                        {
                          year: dateObj.rawDate.year,
                          month: dateObj.rawDate.month,
                          day: dateObj.rawDate.day,
                          hour: slotHour,
                          minute: slotMinute,
                        },
                        { zone: timezoneMapping[tutor?.tutorDetails?.timezone] } // Set the tutor's time zone
                      );

                      // Skip past slots only for the current day
                      if (dateIndex === 0 && slotDateTime <= currentLocalTime) {
                        return null; // Skip past slots for today
                      }

                      // For future days, show all available slots
                      return (
                        <button
                          key={`${slotIndex}`}
                          className={`border rounded-md text-[0.6rem] sm:text-[1rem] px-[4px] py-[2px] sm:p-2 ${
                            selectedSlot &&
                            selectedSlot.date === dateObj.dateString &&
                            selectedSlot.from === slot.from &&
                            selectedSlot.to === slot.to
                              ? "bg-primary-500 text-white"
                              : "border-secondary-300 text-secondary-600"
                          }`}
                          onClick={() =>
                            handleSlotSelect(
                              dateObj.dateString,
                              slot.from,
                              slot.to
                            )
                          }
                        >
                          {slot.from} - {slot.to}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex justify-center items-center my-10 text-center">
        <div className="w-full">
          <p className="text-[#252525] font-semibold text-[0.8rem] sm:text-[1.2rem] mb-4">
            <span className="text-primary-600">*</span>Tell{" "}
            {tutor?.tutorDetails?.firstName} {tutor?.tutorDetails?.lastName}{" "}
            About Your Goals For Tutoring
          </p>
          <textarea
            placeholder="ex: I have a doubt....."
            rows="4"
            value={detailsOfClass}
            onChange={(e) => setDetailsOfClass(e.target.value)}
            className="w-full h-auto px-6 py-4 custom-scrollbar shadow-md rounded-lg border border-gray-300 text-[0.6rem] sm:text-sm text-text-800 outline-none resize-none"
          />
        </div>
      </div>

      <div className="w-full border-[1px] border-text-100 gap-2 flex  flex-col lg:flex-row justify-between items-center px-6 py-4 rounded-lg shadow-md my-10">
        <div className="flex flex-col  sm:flex-row sm:items-center justify-between sm:justify-start gap-2   w-full sm:text-[1rem] text-[0.8rem] ">
          <label htmlFor="subject">Subject</label>
          <input
            id="subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="border-[1px]  w-full outline-primary-400 px-2 py-[4px] text-[13px] rounded-md border-text-100 "
            placeholder="Eg: Physics, Mathematics"
          />
        </div>
        <div className="flex flex-col  min-w-1/2 sm:flex-row sm:items-center justify-between w-full gap-2 sm:text-[1rem] text-[0.8rem] ">
          <label htmlFor="areaOfSubject" className="text-nowrap">
            Area of Subject
          </label>
          <input
            id="areaOfSubject"
            type="text"
            value={areaOfSubject}
            onChange={(e) => setAreaOfSubject(e.target.value)}
            className="border-[1px] w-full  outline-primary-400 px-2 py-[4px] text-[13px] rounded-md border-text-100 "
            placeholder="Eg: Kinematics, Algebra"
          />
        </div>
      </div>

      <div className="p-6 bg-white shadow-md text-[0.8rem] sm:text-[1rem] rounded-lg mt-10">
        <h5 className="text-[0.9rem] sm:text-[1.3rem] font-[600]">
          Your Session
        </h5>
        <div className="capitalize ">
          <div className="flex  sm:flex-row flex-col justify-between">
            <div className="flex flex-col w-full ">
              <p className="w-full  flex justify-between ">Type : Online</p>
              <p>Date : {selectedSlot ? selectedSlot.date : "Not selected"}</p>
              <p>
                Time :{" "}
                <span>
                  {selectedSlot
                    ? `${selectedSlot.from} - ${selectedSlot.to}`
                    : "Not selected"}
                </span>
              </p>
            </div>
            <div className="w-full sm:w-[50%]">
              <p>Hourly Rate : ${tutor?.tutorDetails?.hourlyPrice}/hour</p>
              <p>Duration : {duration === 60 ? "1 Hour" : "30 Minutes"}</p>
              <p>Time Zone : {tutor?.tutorDetails?.timezone}</p>
            </div>
          </div>
        </div>
        <div className="flex sm:flex-row flex-col justify-end gap-4 sm:gap-11 mt-5">
          <button
            onClick={() => setShowModal(false)}
            className="text-[#E77B3E] outline-secondary-600 rounded-md px-4 py-2 border border-[#E77B3E] shadow-md sm:w-36"
          >
            Cancel
          </button>
          <button
            onClick={handleSendRequest}
            className="rounded-md bg-[#E77B3E] px-4 py-2 outline-secondary-600 shadow-md sm:w-40 text-white"
          >
            Send a Request
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduledSession;
