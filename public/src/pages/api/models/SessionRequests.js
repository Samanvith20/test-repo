import mongoose from "mongoose";

const TimeslotSchema = new mongoose.Schema({
  date: { type: String, required: true }, // Date of the session
  time: { type: String, required: true }, // Start and end time in "HH:MM - HH:MM" format
  timezone: { type: String, required: true }, // Tutor's timezone
});

const SubjectDetailsSchema = new mongoose.Schema({
  subject: { type: String, required: true }, // Main subject name
  areaOfSubject: { type: String, required: true }, // Specific area of expertise within the subject
});

const SessionRequestSchema = new mongoose.Schema(
  {
    studentUsername: { type: String, required: true }, // Username of the student requesting the session
    tutorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tutor",
      required: true,
    }, // Reference to Tutor model
    timeslot: { type: TimeslotSchema, required: true }, // Timeslot details for the session
    classDescription: { type: String, required: true }, // Description of the class or topics student wants to cover
    subjectDetails: { type: SubjectDetailsSchema, required: true }, // Subject and area details
    classDuration: { type: String, required: true }, // Duration of the class (e.g., "1 Hour", "30 Minutes")
    status: { type: String, default: "Pending" }, // Status of the request (e.g., "Pending", "Approved", "Rejected")
    createdAt: { type: Date, default: Date.now }, // Timestamp of when the request was created
  },
  {
    collection: "session-requests", // Name of the collection in MongoDB
    timestamps: true, // Automatically creates createdAt and updatedAt fields
  }
);

// Ensure model is created only once
const SessionRequests =
  mongoose.models.SessionRequests ||
  mongoose.model("SessionRequests", SessionRequestSchema);

export default SessionRequests;
