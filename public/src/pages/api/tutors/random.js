import dbConnect from "../lib/mongoose";
import Tutor from "../models/Tutor";

// API to fetch the first 5 tutors
export default async function handler(req, res) {
  await dbConnect(); // Ensure database is connected

  try {
    // Fetch the first 5 tutors from the collection
    const firstFiveTutors = await Tutor.find({}).limit(5); // Get the first 5 tutors

    console.log("First Five tutors: ", firstFiveTutors);

    // Return the data
    res.status(200).json(firstFiveTutors);
  } catch (error) {
    console.error("Error fetching tutors:", error);
    res.status(500).json({ message: "Error fetching tutors" });
  }
}
