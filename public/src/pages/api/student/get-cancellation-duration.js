import dbConnect from "../lib/mongoose";
import ScheduledClasses from "../models/ScheduledClasses";
import Tutor from "../models/Tutor";

export default async function handler(req, res) {
  await dbConnect();

  const { id } = req.body;

  try {
    // Find the scheduled class by ID
    const scheduledClass = await ScheduledClasses.findById(id);
    if (!scheduledClass) {
      return res.status(404).json({ message: "Scheduled class not found" });
    }

    // Find the tutor and get cancellation duration
    const tutor = await Tutor.findById(scheduledClass.tutorId);
    if (!tutor) {
      return res.status(404).json({ message: "Tutor not found" });
    }

    const cancellationDuration = tutor?.tutorDetails?.cancellationDuration;
    if (cancellationDuration === undefined) {
      return res.status(400).json({ message: "Cancellation duration not set for this tutor" });
    }

    // Return the cancellation duration
    return res.status(200).json({ cancellationDuration });
  } catch (error) {
    console.error("Error fetching cancellation duration:", error);
    return res.status(500).json({ message: "An error occurred while fetching cancellation duration" });
  }
}
