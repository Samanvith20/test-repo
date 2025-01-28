import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

// Define the schema for reviews
const ReviewsSchema = new Schema(
  {
    studentUsername: {
      type: String,
      required: [true, "Student username is required"], // Adding custom error message
      trim: true, // Automatically trims whitespace
    },
    tutorId: {
      type: Schema.Types.ObjectId,
      ref: "Tutor", // References the "Tutor" model
      required: [true, "Tutor ID is required"], // Custom error message
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"], // Custom error message
      min: 1, // Minimum rating value
      max: 5, // Maximum rating value
    },
    reviewContent: {
      type: String,
      required: [true, "Review content is required"], // Custom error message
      trim: true, // Automatically trims whitespace
    },
    updateStatus: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  {
    collection: "reviews", // Collection name
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Check if the model is already created, otherwise create it
const Reviews = models.Reviews || model("Reviews", ReviewsSchema);

export default Reviews;
