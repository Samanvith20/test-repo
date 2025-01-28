import dbConnect from "../lib/mongoose";
import ScheduledClasses from "../models/ScheduledClasses";

export default async function handler(req, res) {
  // Ensure database connection
  await dbConnect();

  if (req.method === "POST") {
    const { tutorId, username, date, time } = req.body;

    if (!tutorId || !username || !date || !time) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      const scheduledClass = await ScheduledClasses.findOne({
        tutorId,
        "timeslot.date": date,
        "timeslot.time": time,
        studentUsername: username,
      });

      if (!scheduledClass) {
        return res.status(404).json({ error: "Scheduled class not found" });
      }

      return res.status(200).json({ scheduledClass });
    } catch (error) {
      console.error("Error fetching scheduled class:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
