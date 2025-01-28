import dbConnect from "../lib/mongoose";
import Reviews from "../models/Reviews";

export default async function handler(req, res) {
  // Allow only GET requests
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { tutorId } = req.query;
    console.log("tutorId", tutorId);

    // Validate tutorId
    if (!tutorId) {
      return res.status(400).json({ message: "Tutor ID is required." });
    }

    console.log("tutorId for profile", tutorId);

    // Connect to the database
    await dbConnect();

    // Fetch reviews for the tutor
    const reviews = await Reviews.find({ tutorId });

    console.log("reviews", reviews);

    // Return the reviews
    return res.status(200).json({
      message: "Reviews fetched successfully.",
      reviews,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
