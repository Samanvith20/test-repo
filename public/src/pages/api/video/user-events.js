import dbConnect from "../lib/mongoose";
import ScheduledClass from "../models/ScheduledClasses";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { channelName, userId, tutorUid, studentUid, role, scheduledClassId, action } = req.body;
  console.log("scheduledClassId", scheduledClassId);

  console.log("API: User Events", req.body);

  // Validate input parameters
  if (!channelName || !userId || !role || !action) {
    return res.status(400).json({ message: "Missing required parameters" });
  }

  if (!["join", "leave"].includes(action)) {
    return res.status(400).json({ message: "Invalid action provided" });
  }

  if (!["tutor", "student"].includes(role)) {
    return res.status(400).json({ message: "Invalid role provided" });
  }

  try {
    await dbConnect();

    const timestamp = new Date();
    const update = {};

    // Helper to safely set values on update.$set
    const safeSet = (path, value) => {
      if (!update.$set) {
        update.$set = {};
      }
      update.$set[path] = value;
    };

    const isTutor = role === "tutor";
    const isStudent = role === "student";

    // --------------------------------------------------
    // 1) Tutor join logic
    // --------------------------------------------------
    if (isTutor && action === "join") {
      const tutorEvent = { tutorId: userId, action, timestamp };
      update.$push = { "videos.tutorEvents": tutorEvent };

      // Only store tutorUid if it's a valid (truthy) value
      if (tutorUid) {
        safeSet("videos.tutorUid", tutorUid);
      }
    }
    // --------------------------------------------------
    // 2) Student join logic
    // --------------------------------------------------
    else if (isStudent && action === "join") {
      const existingClass = await ScheduledClass.findById({
        _id: scheduledClassId,
      });
      
          
      // Student cannot join if tutor hasn't joined yet
      if (!existingClass?.videos?.tutorUid) {
        return res
          .status(400)
          .json({ message: "Student cannot join before the tutor joins" });
      }

      const studentEvent = { studentId: userId, action, timestamp };
      update.$push = { "videos.studentEvents": studentEvent };

      // Only store studentUid if it's a valid (truthy) value
      if (studentUid) {
        safeSet("videos.studentUid", studentUid);
      }
    }

    // --------------------------------------------------
    // 3) Tutor events (join or leave) + automatic “leave”
    // --------------------------------------------------
    if (isTutor) {
      // We push tutorEvents for both join and leave
      const tutorEvent = { tutorId: userId, action, timestamp };
      if (!update.$push) {
        update.$push = {};
      }
      update.$push["videos.tutorEvents"] = tutorEvent;

      // If tutor leaves while student is still in session,
      // automatically log a "leave" event for the student
      if (action === "leave") {
        const existingClass = await ScheduledClass.findOne({
          "videos.channelName": channelName,
        });

        const lastStudentEvent =
          existingClass?.videos?.studentEvents?.slice(-1)[0];

        if (lastStudentEvent?.action === "join") {
          if (!update.$push["videos.studentEvents"]) {
            update.$push["videos.studentEvents"] = [];
          }
          update.$push["videos.studentEvents"].push({
            studentId: lastStudentEvent.studentId,
            action: "leave",
            timestamp,
          });

          // Calculate student’s duration
          const lastJoinEvent = existingClass?.videos?.studentEvents
            .slice()
            .reverse()
            .find(
              (event) =>
                event.action === "join" &&
                event.studentId === lastStudentEvent.studentId
            );

          if (lastJoinEvent) {
            let timeDifference = (timestamp - lastJoinEvent.timestamp) / 1000;
            timeDifference = Math.round(timeDifference * 100) / 100;

            const currentDuration = existingClass.videos.duration || 0;
            const updatedDuration = currentDuration + timeDifference;
            update.$set = { "videos.duration": Math.round(updatedDuration * 100) / 100 };
          
          }
        }
      }
    }
    // --------------------------------------------------
    // 4) Student events (join or leave)
    // --------------------------------------------------
    else if (isStudent) {
      // We push studentEvents for both join and leave
      const studentEvent = { studentId: userId, action, timestamp };
      if (!update.$push) {
        update.$push = {};
      }
      update.$push["videos.studentEvents"] = studentEvent;

      // If the student is leaving, calculate how long they stayed
      if (action === "leave") {
        const existingClass = await ScheduledClass.findOne({
          "videos.channelName": channelName,
        });

        const lastJoinEvent = existingClass?.videos?.studentEvents
          .slice()
          .reverse()
          .find(
            (event) => event.action === "join" && event.studentId === userId
          );

        if (lastJoinEvent) {
          const duration = Math.round(
            (timestamp - new Date(lastJoinEvent.timestamp)) / 1000
          );

          safeSet(
            "videos.duration",
            Math.round((existingClass.videos.duration || 0) + duration)
          );
        }
      }
    }

   
    // --------------------------------------------------
    const result = await ScheduledClass.findOneAndUpdate(
      { "videos.channelName": channelName },
      update,
      { upsert: true, new: true }
    );

    console.log(`User Event Logged: Role: ${role}, Action: ${action}`);

    
    

    return res.status(200).json({
      message: "User event recorded successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error recording user event:", error);
    res
      .status(500)
      .json({ message: "Failed to record user event", error: error.message });
  }
}
