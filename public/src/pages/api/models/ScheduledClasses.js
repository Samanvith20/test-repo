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

// Recording sessions  schema
const RecordingSessionSchema = new mongoose.Schema({
  resourceId: { type: String, default: "" },
  sid: { type: String, default: "" },
  startedAt: { type: Date, default: null },
  endedAt: { type: Date, default: null },
  status: { type: String, default: "not_started" }, // e.g. "not_started", "started", "stopped", "failed"
  retryCount: { type: Number, default: 0 },
  failureReason: { type: String, default: "" },
});

// Define the VideoEvent schema
const VideoEventSchema = new mongoose.Schema(
  {
    channelName: { type: String, default: "" },
    valid: { type: Boolean, default: true },
    duration: { type: Number, default: 0 },
    resourceId: { type: String, default: "" },
    studentUid: { type: Number, default: 0 },
    tutorUid: { type: Number, default: 0 },
    sid: { type: String, default: "" },
    studentEvents: [
      {
        studentId: { type: String },
        action: { type: String },
        timestamp: { type: Date },
      },
    ],

    recordingSessions: [RecordingSessionSchema],
    recordingStatus: {
      status: { type: String, default: "" }, // e.g. "running", "failed", "stopped"
      attemptsMade: { type: Number, default: 0 },
      message: { type: String, default: "" }, // store last error or success note
    },
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
const ScheduledClassSchema = new mongoose.Schema(
  {
    studentUsername: { type: String, required: true },
    studentFullName: { type: String },
    tutorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tutor",
      required: true,
    },
    tutorProfilePicture: { type: String },
    tutorName: { type: String },
    price: { type: Number, required: true, default: 0 },
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
    whiteboard: {
      roomUuid: { type: String, required: false },
      roomToken: { type: String, required: false },
    },
  },
  {
    collection: "scheduled-classes",
    timestamps: true,
  }
);

export default mongoose.models.ScheduledClasses ||
  mongoose.model("ScheduledClasses", ScheduledClassSchema);