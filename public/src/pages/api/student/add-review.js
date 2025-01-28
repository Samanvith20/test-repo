import { getServerSession } from "next-auth";
import dbConnect from "../lib/mongoose";
import { authOptions } from "../auth/[...nextauth]";
import Reviews from "../models/Reviews";

export default async function handler(req, res) {
  // Ensure the method is POST
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  // Authenticate user session
  const session = await getServerSession(req, res, authOptions);
  if (!session || session.role === "tutor") {
    return res
      .status(401)
      .json({ message: "You are not authorized to give a review." });
  }

  try {
    // Connect to the database
    await dbConnect();

    // Destructure and validate the request body
    const { rating, reviewContent, studentUsername, tutorId } = req.body;

    if (!rating || !reviewContent || !studentUsername || !tutorId) {
      return res.status(400).json({
        message:
          "All fields (rating, reviewContent, studentUsername, tutorId) are required.",
      });
    }

    // Check for an existing review
    const existingReview = await Reviews.findOne({
      tutorId,
      studentUsername,
    });

    if (existingReview) {
      // If the review exists and updateStatus is false, update the fields
      if (!existingReview.updateStatus) {
        const updatedReview = await Reviews.findByIdAndUpdate(
          existingReview._id,
          {
            rating: rating || existingReview.rating,
            reviewContent: reviewContent || existingReview.reviewContent,
            updateStatus: true,
          },
          { new: true } // Return the updated document
        );

        return res.status(200).json({
          message:
            "Review updated successfully. Update status has been set to true.",
          review: updatedReview,
        });
      }

      // If updateStatus is true, do not allow further updates
      return res.status(409).json({
        message:
          "You have already updated your review. Further modifications are not allowed.",
      });
    }

    // Create a new review if none exists
    const newReview = await Reviews.create({
      studentUsername,
      tutorId,
      rating,
      reviewContent,
    });

    return res
      .status(201)
      .json({ message: "Review successfully stored", review: newReview });
  } catch (error) {
    console.error("Internal Server Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
