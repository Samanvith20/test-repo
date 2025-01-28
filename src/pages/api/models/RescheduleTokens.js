import mongoose from "mongoose";

const TimeslotSchema = new mongoose.Schema({
  date: { type: String, required: true }, // Date of the session
  time: { type: String, required: true }, // Start and end time in "HH:MM - HH:MM" format
  timezone: { type: String, required: true }, // Tutor's timezone
});

const RescheduleTokensSchema = new mongoose.Schema(
  {
    studentUsername: {
      type: String,
      required: true,
    },
    tutorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tutor",
      required: true,
    },
    rescheduleToken: {
      type: String,
      required: true,
    },
    timeslot: {
      type: TimeslotSchema,
      required: true,
    },
    classToBeRescheduled: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ScheduledClasses",
      required: true,
    },
    rescheduledTimeslot: {
      type: TimeslotSchema,
      required: true,
    },
  },
  {
    collection: "reschedule-tokens",
    timestamps: true,
  }
);

const RescheduleTokens =
  mongoose.models.RescheduleTokens ||
  mongoose.model("RescheduleTokens", RescheduleTokensSchema);

export default RescheduleTokens;
