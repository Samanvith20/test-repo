import mongoose from "mongoose";


const TransactionDetailsSchema = new mongoose.Schema({
  date: { type: Date }, // Date of the transaction
  paymentIntentId: { type: String, required: true }, // Stripe PaymentIntent ID
  authorizedAmount: { type: Number, default: 0 }, // Authorized amount in dollars
  capturedAmount: { type: Number, default: 0 }, // Captured amount in dollars
  transactions: [{ type: String }], // Log of actions
});

// Define the Timeslot schema
const TimeslotSchema = new mongoose.Schema({
  date: { type: String, required: true },
  time: { type: String, required: true },
  timezone: { type: String, required: true },
});

// Define the SubjectDetails schema
const SubjectDetailsSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  areaOfSubject: { type: String, required: true },
});

// Define the VideoEvent schema
const VideoEventSchema = new mongoose.Schema(
  {
    channelName: { type: String },
    valid: { type: Boolean, default: true },
    duration: { type: Number, default: 0 },
    resourceId: { type: String },
    sid: { type: String },
    studentEvents: [
      {
        studentId: { type: String },
        action: { type: String },
        timestamp: { type: Date },
      },
    ],
    tutorEvents: [
      {
        tutorId: { type: String },
        action: { type: String },
        timestamp: { type: Date },
      },
    ],
    lastCheckedTime: { type: Date, default: null },
  },
  { timestamps: true }
);

// Define the Status schema
const StatusSchema = new mongoose.Schema({
  classStatus: { type: String, default: "" },
  changedBy: { type: String, default: "" },
  statusChangeTimestamp: { type: String, default: "" },
  statusChangeTimeDifference: { type: Number, default: 0 },
  isStudentCharged: { type: Boolean, default: false },
});

// Define the ScheduledClass schema
const CompletedClassSchema = new mongoose.Schema(
  {
    studentUsername: { type: String, required: true },
    studentFullName: { type: String },
    tutorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tutor",
      required: true,
    },
    tutorProfilePicture: { type: String },
    price: { type: Number, required: true,default: 0 },
    tutorName: { type: String },
    timeslot: { type: TimeslotSchema },
    classDescription: { type: String },
    subjectDetails: { type: SubjectDetailsSchema },
    classDuration: { type: String },
    acceptedTimestamp: { type: String },
    videoUrlArray: { type: String },
    classStatus: { type: StatusSchema, default: {} },
    videoRecordingUrl: { type: [String], default: [], required: true },
    videos: { type: VideoEventSchema, default: {} },
    transactionDetails: { type: TransactionDetailsSchema },
  },
  {
    collection: "completed-classes",
    timestamps: true,
  }
);

export default mongoose.models.CompletedClasses ||
  mongoose.model("CompletedClasses", CompletedClassSchema);
