import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import CompletedClasses from "../models/CompletedClasses";
import Tutor from "../models/Tutor";
import Reviews from "../models/Reviews";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "This method is not supported" });
  }

  try {
    // Authenticate the session
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({
        message: "You are not authorized to access this resource.",
      });
    }

    if (session.role !== "student") {
      return res.status(401).json({
        message: "You are not authorized to access this resource.",
      });
    }

    // DATE FROM THE FILTER:  2024-11-25

    const { date } = req.query;
    const [year, month, day] = date.split("-");
    const refinedDate = `${month}-${day}-${year}`;

    console.log("DATE FROM THE FILTER: ", date);

    // Fetch completed classes as plain JavaScript objects
    let completedClasses = await CompletedClasses.find({
      studentUsername: session.username,
      "timeslot.date": refinedDate,
    }).lean();
    if(!completedClasses || completedClasses.length === 0) {
      return res.status(404).json({
        message: "No completed classes found for the given date.",
      });
    }

    // Process each completed class
    const processedClasses = await Promise.all(
      completedClasses.map(async (completedClass) => {
        // Fetch tutor details
        const tutor = await Tutor.findOne({
          _id: completedClass.tutorId,
        }).lean();

        // Initialize lessonPrice
        let lessonPrice = 0;

        // Get duration from videos.duration (in seconds)
        let durationInSeconds = 0;

        if (
          completedClass.videos &&
          typeof completedClass.videos.duration === "number"
        ) {
          durationInSeconds = completedClass.videos.duration;
        }

        // Calculate lessonPrice
        if (tutor && tutor.tutorDetails && tutor.tutorDetails.hourlyPrice) {
          lessonPrice =
            (durationInSeconds / 3600) * tutor.tutorDetails.hourlyPrice;
        }

        // Fetch review rating
        const review = await Reviews.findOne({
          studentUsername: session.username,
          tutorId: completedClass.tutorId,
        }).lean();

        // Add lessonPrice and rating to the completedClass object
        return {
          ...completedClass,
          lessonPrice: lessonPrice,
          review: review ? review : null,
        };
      })
    );

    // Return the processed classes
    return res.status(200).json({
      message: "Completed the request",
      completedClasses: processedClasses,
    });
  } catch (error) {
    console.error("Internal Server Error: ", error);
    return res.status(500).json({ message: "Internal Server Error." });
  }
}
