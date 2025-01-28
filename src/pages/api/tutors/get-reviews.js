import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import dbConnect from "../lib/mongoose";
import Reviews from "../models/Reviews";
import Student from "../models/Student";

export default async function handler(req, res) {
  // Restrict method to GET
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed." });
  }

  try {
    // Authenticate session
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
      return res
        .status(401)
        .json({ message: "Unauthorized. Please log in to continue." });
    }

    // Ensure the role is "tutor"
    if (session.role !== "tutor") {
      return res
        .status(403)
        .json({ message: "Forbidden. Access restricted to tutors only." });
    }

    // Connect to the database
    await dbConnect();

    // Fetch reviews for the tutor
    const reviews = await Reviews.find({ tutorId: session.id });

    // Enrich reviews with student names using a for loop
    for (let review of reviews) {
      const student = await Student.findOne({
        username: review.studentUsername,
      });

      // Dynamically add the studentName field
      review.studentName = student
        ? student.studentDetails?.firstName && student.studentDetails?.lastName
          ? `${student.studentDetails.firstName} ${student.studentDetails.lastName}`
          : review.studentUsername
        : review.studentUsername;
    }

    // Convert reviews to plain objects if needed to include dynamically added fields
    const enrichedReviews = reviews.map((review) => ({
      ...review._doc, // Use `_doc` to access the plain object from Mongoose
      studentName: review.studentName,
    }));

    // console.log('Reasdgasdg: ', enrichedReviews)

    return res.status(200).json({
      message: "Reviews fetched successfully.",
      reviews: enrichedReviews,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return res.status(500).json({
      message: "Internal Server Error. Please try again later.",
    });
  }
}
