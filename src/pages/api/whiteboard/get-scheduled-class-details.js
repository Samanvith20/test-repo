import dbConnect from "../lib/mongoose";
import ScheduledClasses from "../models/ScheduledClasses";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { scheduledClassId } = req.body;

  if (!scheduledClassId) {
    return res.status(400).json({ message: "scheduledClassId is required" });
  }

  await dbConnect();

  try {
    const scheduledClass = await ScheduledClasses.findById(scheduledClassId);
    if (!scheduledClass) {
      return res.status(404).json({ message: "Class not found" });
    }

    if (scheduledClass.whiteboard?.roomUuid && scheduledClass.whiteboard?.roomToken) {
      return res.status(200).json({
        roomUuid: scheduledClass.whiteboard.roomUuid,
        roomToken: scheduledClass.whiteboard.roomToken,
      });
    } else {
      return res.status(404).json({ message: "Whiteboard details not found for this class" });
    }
  } catch (error) {
    console.error("Error fetching room details:", error);
    return res.status(500).json({ message: "An error occurred while fetching the room details" });
  }
}
