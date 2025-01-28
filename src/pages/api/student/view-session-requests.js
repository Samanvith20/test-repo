import { getServerSession } from "next-auth";

import moment from "moment-timezone";
import dbConnect from "../lib/mongoose";
import { authOptions } from "../auth/[...nextauth]";
import SessionRequests from "../models/SessionRequests";


const timezoneMap = {
  Alaska: "America/Anchorage",
  Hawaii: "Pacific/Honolulu",
  Eastern: "America/New_York",
  Central: "America/Chicago",
  Mountain: "America/Denver",
  Pacific: "America/Los_Angeles",
  // Add other mappings as needed
};

// Function to convert UTC time to a specific timezone
const convertUtcToTimezone = (utcTime, timeZone) => {
  const cleanedTimeZone = timeZone.trim();

  const validTimeZone = timezoneMap[cleanedTimeZone];

  if (validTimeZone === undefined) {
    console.error(`Invalid or unrecognized time zone provided: ${timeZone}`);

    return null;
  }

  // console.log("Mapped IANA Time Zone:", validTimeZone);

  return moment.utc(utcTime).tz(validTimeZone).format("YYYY-MM-DD HH:mm:ss"); // Format the output
};

const getRelativeTime = (utcTime, timeZone) => {
  const cleanedTimeZone = timeZone.trim();

  const validTimeZone = timezoneMap[cleanedTimeZone];

  // Convert UTC time to the specified timezone
  const localTime = moment.utc(utcTime).tz(validTimeZone);
  const currentTime = moment.tz(validTimeZone);

  // Calculate the difference
  const diff = moment.duration(currentTime.diff(localTime));

  // Calculate days for filtering
  const daysDifference = Math.floor(diff.asDays());

  // Determine a display format and return the difference in minutes for sorting
  let displayTime;
  if (diff.asMinutes() < 1) {
    displayTime = "Just now";
  } else if (diff.asMinutes() < 60) {
    displayTime = `${Math.floor(diff.asMinutes())} Mins`;
  } else if (diff.asHours() < 24) {
    displayTime = `${Math.floor(diff.asHours())} Hours`;
  } else {
    displayTime = `${Math.floor(diff.asDays())} Days`;
  }

  return {
    displayTime,
    daysDifference,
    timeDifferenceInMinutes: Math.floor(diff.asMinutes()),
  };
};

//  filtering requests
const filterRequests = (requests, filterType) => {
  if (filterType === "All") {
    return requests;
  } else if (filterType === "Recent") {
    return requests.filter(
      (request) => request.timeDifferenceInMinutes <= 1440
    );
  } else if (filterType === "Previous") {
    return requests.filter((request) => request.timeDifferenceInMinutes > 1440);
  }
  return requests;
};

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  // console.log("session-session", session);

  if (req.method === "GET") {
    await dbConnect();

    try {
      // Ensure session exists and has a role
      if (!session || !session.role) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (session.role === "student") {
        // Define the filter for student requests
        const { status } = req.query;
        const filter = { studentUsername: session.username };

        // Add status filter if it's provided and not "All"
        if (status && status !== "All") {
          filter.status = status.trim();
        }

        // Fetch session requests for the student, with optional status filter
        const sessionRequests = await SessionRequests.find(filter)
          .populate("tutorId", [
            "tutorDetails.firstName",
            "tutorDetails.lastName",
            "tutorDetails.profilePicture",
            "tutorDetails.timezone",
            "subjectsTaught.subjectExpertise",
          ])
          .sort({ createdAt: -1 });
          console.log("Filtered sessionRequests for student:", sessionRequests);
          const filteredRequests = sessionRequests.filter((request) => {
            console.log("Request:", request);
            
            
          
            const timeslot = request.timeslot;
            console.log("Timeslot:", timeslot);
            
            const tutorTimezone = timeslot.timezone;
            console.log("Tutor timezones:", tutorTimezone);
            
            const tutorTime = timezoneMap[tutorTimezone];
            console.log("Tutor timezone:", tutorTime);
            
            const date = timeslot.date;
            const time = timeslot.time; 
            
            // Parse the date correctly
            const scheduledDateTime = moment.tz(
              `${date} ${time.split(" - ")[0].trim()}`, // Combine date and start time
              "dddd MMMM DD, YYYY HH:mm", // Match the date format
              tutorTime // Specify the timezone
            );
            
            console.log("scheduledDateTime:", scheduledDateTime.format("YYYY-MM-DD HH:mm"));
            
            // Get the current timestamp in the tutor's timezone
            const currentTimestamp = moment.tz(tutorTime);
            console.log("currentTimestamp:", currentTimestamp.format("YYYY-MM-DD HH:mm"));
            
            // Check if the scheduled time is before the current time
            const isAfter = scheduledDateTime.isAfter(currentTimestamp);
            console.log("Is session before now?", isAfter);
            
            return isAfter; // Include only past sessions
            
          });
          
          console.log("Filtered sessionRequests based on tutor timezone:", filteredRequests);
          
          return res.status(200).json(filteredRequests)
      } else if (session.role === "tutor") {
        try {
          const { filterType, status } = req.query;
          // console.log("Status for tutor dashboard:", status);
      
          // Define the filter object for the query
          const filter = { tutorId: session.id };
      
          // Add status filter if provided
          if (status) {
              filter.status = status;
          }
      
          // Find the session requests for the tutor, applying the filter
          const sessionRequestTutor = await SessionRequests.find(filter).populate("studentUsername", [
              "studentDetails.firstName",
              "studentDetails.lastName",
              "profilePicture",
          ]);
      
          // Format each session request with relative time calculation
          const formattedRequests = sessionRequestTutor.map((request) => {
              const localTimeZone = convertUtcToTimezone(
                  request.createdAt,
                  request.timeslot.timezone
              );
      
              const { displayTime, timeDifferenceInMinutes } = getRelativeTime(
                  request.createdAt,
                  request.timeslot.timezone
              );
      
              return {
                  ...request.toObject(),
                  localTimeZone,
                  Time: displayTime,
                  timeDifferenceInMinutes,
              };
          });
      
          // Apply filtering based on `filterType`
          const filteredRequests = filterRequests(formattedRequests, filterType);
      
          // Sort by timeDifferenceInMinutes in ascending order if required
          const sortedRequests = filteredRequests.sort(
              (a, b) => a.timeDifferenceInMinutes - b.timeDifferenceInMinutes
          );
            //  console.log("Sorted requests for tutor:", sortedRequests);
             const filteredRequest = sortedRequests.filter((request) => {
              // console.log("Request:", request);
              
              
            
              const timeslot = request.timeslot;
              // console.log("Timeslot:", timeslot);
              
              const tutorTimezone = timeslot.timezone;
              // console.log("Tutor timezones:", tutorTimezone);
              
              const tutorTime = timezoneMap[tutorTimezone];
              // console.log("Tutor timezone:", tutorTime);
              
              const date = timeslot.date;
              const time = timeslot.time; 
              
              // Parse the date correctly
              const scheduledDateTime = moment.tz(
                `${date} ${time.split(" - ")[0].trim()}`, // Combine date and start time
                "dddd MMMM DD, YYYY HH:mm", // Match the date format
                tutorTime // Specify the timezone
              );
              
              // console.log("scheduledDateTime:", scheduledDateTime.format("YYYY-MM-DD HH:mm"));
              
              // Get the current timestamp in the tutor's timezone
              const currentTimestamp = moment.tz(tutorTime);
              // console.log("currentTimestamp:", currentTimestamp.format("YYYY-MM-DD HH:mm"));
              
              // Check if the scheduled time is before the current time
              const isAfter = scheduledDateTime.isAfter(currentTimestamp);
              console.log("Is session After now?", isAfter);
              
              return isAfter; // Include only past sessions
              
            });
          return res.status(200).json(filteredRequest);
      } catch (error) {
          console.error("Error fetching session requests for tutor:", error);
          return res.status(500).json({ message: "Internal server error" });
      }
      
      }
    } catch (error) {
      console.error("Error fetching session requests:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
}
