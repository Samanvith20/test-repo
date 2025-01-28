import dbConnect from "../lib/mongoose";
import ScheduledClasses from "../models/ScheduledClasses";

export default async function checkIfTutorJoined(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { channelName } = req.body;

  if (!channelName) {
    return res.status(400).json({ success: false, message: "Channel name is required." });
  }

  try {
    await dbConnect();

    // Find the scheduled class with the specified channelName
    const scheduledClass = await ScheduledClasses.findOne({ "videos.channelName": channelName });

    if (!scheduledClass) {
      return res.status(404).json({ success: false, message: "Scheduled class not found." });
    }

    // Get the last tutor event from the `tutorEvents` array
    const lastTutorEvent = scheduledClass.videos.tutorEvents?.slice(-1)[0];

    console.log("lastTutorEvent:", lastTutorEvent);

    // Check if the last event exists and is a "join" action
    if (lastTutorEvent?.action === "join") {
      return res.status(200).json({ success: true, message: "Tutor has joined the call." });
    }

    // If no join event is found, return an appropriate message
    return res.status(200).json({
      success: false,
      message: "Tutor has not joined the call yet. Please wait.",
    });
  } catch (error) {
    console.error("Error checking if tutor joined:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while checking tutor status.",
    });
  }
}
