import dbConnect from "../lib/mongoose";
import ScheduledClasses from "../models/ScheduledClasses";
import CompletedClasses from "../models/CompletedClasses"; // Ensure this is imported
import moment from "moment-timezone"; // Import moment-timezone

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "POST") {
    const { id } = req.body;
    console.log("id:", id);

    try {
      // Fetch the scheduled class by ID
      const scheduledClass = await ScheduledClasses.findById(id);

      if (!scheduledClass) {
        return res.status(404).json({ message: "Class not found" });
      }

      const timezoneMap = {
        Alaska: "America/Anchorage",
        Hawaii: "Pacific/Honolulu",
        Eastern: "America/New_York",
        Central: "America/Chicago",
        Mountain: "America/Denver",
        Pacific: "America/Los_Angeles",
      };

      const { date, time, timezone } = scheduledClass.timeslot;
      const classTimezone = timezoneMap[timezone.trim()];

      if (!classTimezone) {
        console.error(`Invalid timezone for class ${scheduledClass._id}`);
        return res.status(400).json({ message: "Invalid timezone for class" });
      }

      // Parse scheduled class datetime in class's timezone
      const scheduledDateTime = moment.tz(
        `${date} ${time.split(" - ")[0]}`,
        "MM-DD-YYYY HH:mm",
        classTimezone
      );
      console.log("scheduledDateTime:", scheduledDateTime.format("YYYY-MM-DD HH:mm"));

      if (!scheduledDateTime.isValid()) {
        console.error(`Invalid date or time for class ${scheduledClass._id}`);
        return res.status(400).json({ message: "Invalid date or time for class" });
      }

      // Get current time in the same timezone
      const currentTimestamp = moment().tz(classTimezone);
      console.log("currentTimestamp:", currentTimestamp.format("YYYY-MM-DD HH:mm"));

      // Calculate the end time of the class
      const endTime = scheduledDateTime.clone().add(
        parseInt(scheduledClass.classDuration, 10),
        "hours"
      );
      console.log("endTime:", endTime.format("YYYY-MM-DD HH:mm"));

      // // Debugging: Check if current time is before, after, or within the class duration
      // console.log("currentTimestamp.isBefore(scheduledDateTime):", currentTimestamp.isBefore(scheduledDateTime));
      // console.log("currentTimestamp.isBetween(scheduledDateTime, endTime):", currentTimestamp.isBetween(scheduledDateTime, endTime));
      // console.log("currentTimestamp.isAfter(endTime):", currentTimestamp.isAfter(endTime));

      // Check if the class is active
      let classActive = false;
      if (currentTimestamp.isBetween(scheduledDateTime, endTime)) {
        classActive = true;
      }

      // Check if the class has already passed
      if (currentTimestamp.isAfter(endTime)) {
        // Class time has passed

        // Check for tutor events
        const tutorEventsExist =
          scheduledClass.videos &&
          scheduledClass.videos.tutorEvents &&
          scheduledClass.videos.tutorEvents.length > 0;

        if (tutorEventsExist) {
          // Tutor events exist, set status to "Completed"
          scheduledClass.classStatus = {
            classStatus: "Completed",
          };
        } else {
          // No tutor events, set status to "Abandoned"
          scheduledClass.classStatus = {
            classStatus: "Abandoned",
          };
        }

        // Save the updated scheduled class
        await scheduledClass.save();

        // Move the class to CompletedClasses
        const completedClassData = new CompletedClasses(
          scheduledClass.toObject()
        );
        await completedClassData.save();

        // Delete the class from ScheduledClasses
        await ScheduledClasses.findByIdAndDelete(scheduledClass._id);

        // Since the class has ended, the "join" button should not be active
        classActive = false;

        return res.status(200).json({
          message: "Class has ended",
          classActive,
        });
      }

      // If the class is ongoing or yet to start
      return res.status(200).json({
        message: "Class status checked",
        classActive,
      });
    } catch (error) {
      console.error("Error in class status check:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}
