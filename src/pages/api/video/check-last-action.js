import dbConnect from "../lib/mongoose";
import ScheduledClasses from "../models/ScheduledClasses";

export default async function checkLastAction(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { channelName, userId } = req.body; // Removed `role` as it’s now checking both roles
  console.log("API: Check Last Action", req.body);

  if (!channelName || !userId) {
    return res.status(400).json({ message: "Missing required parameters" });
  }

  try {
    await dbConnect();

    // Find the scheduled class for the given channel
    const scheduledClass = await ScheduledClasses.findOne({
      "videos.channelName": channelName,
    });

    if (!scheduledClass) {
      return res.status(404).json({ message: "Class not found" });
    }

    // Get the last events for both tutor and student roles
    const lastTutorEvent = scheduledClass.videos.tutorEvents?.slice(-1)[0];
    const lastStudentEvent = scheduledClass.videos.studentEvents?.slice(-1)[0];

    // Return the last actions for both roles
    return res.status(200).json({
      lastTutorAction: lastTutorEvent?.action || null,
      lastStudentAction: lastStudentEvent?.action || null,
    });
  } catch (error) {
    console.error("Error checking last action:", error);
    return res.status(500).json({
      message: "An error occurred while checking the last action.",
    });
  }
}
