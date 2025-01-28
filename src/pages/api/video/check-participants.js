import dbConnect from "../lib/mongoose";
import ScheduledClasses from "../models/ScheduledClasses";

export default async function handler(req, res) {
  await dbConnect();

  const { channelName, type } = req.body;
  console.log("participants::", channelName, type);
  

  if (!channelName || !type) {
    return res.status(400).json({ success: false, message: "Missing required parameters." });
  }

  try {
    const scheduledClass = await ScheduledClasses.findOne({ "videos.channelName": channelName });
    if (!scheduledClass) {
      return res.status(404).json({ success: false, message: "Scheduled class not found." });
    }

    if (type === "tutor") {
      const lastTutorEvent = scheduledClass.videos.tutorEvents?.slice(-1)[0];
      const hasJoined = lastTutorEvent?.action === "join";
      return res.status(200).json({ success: true, hasJoined });
    }

    if (type === "student") {
      const lastStudentEvent = scheduledClass.videos.studentEvents?.slice(-1)[0];
      const hasJoined = lastStudentEvent?.action === "join";
      return res.status(200).json({ success: true, hasJoined });
    }

    return res.status(400).json({ success: false, message: "Invalid type parameter." });
  } catch (error) {
    console.error("Error checking participants:", error);
    return res.status(500).json({ success: false, message: "An error occurred." });
  }
}
