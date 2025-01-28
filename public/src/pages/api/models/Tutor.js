import mongoose from "mongoose";

const availability = new mongoose.Schema({
  day: { type: String, required: true },
  slots: [
    {
      from: { type: String, required: true },
      to: { type: String, required: true },
    },
  ],
});

// Tutor Details Schema
const tutorDetailsSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  zipCode: { type: String }, // Optional validation for US ZIP code
  gender: { type: String },
  dateOfBirth: { type: Date },
  socialSecurityNumber: { type: String , required:true,unique: true}, 
  age: { type: Number }, // Changed to Number for correct data type
  experience: { type: String }, // Kept as string for now
  level: { type: String }, // Kept as string for now
  hourlyPrice: { type: Number, required: true }, // Added hourlyPrice
  cancellationDuration: { type: String, required: true }, // Added cancellationDuration (in hours/days)
  responseTime: { type: String, required: true }, // Added responseTime (e.g., "within 24 hours")
  priceHourly: { type: Number }, // Number for hourly rate
  availability: { type: [availability], required: true },
  timezone: { type: String, required: true },
  profilePicture: { type: String }, // Single picture URL/path
  about: { type: String },
  headline: { type: String },
});

// Subjects Taught Schema
const subjectsTaughtSchema = new mongoose.Schema({
  subjectExpertise: { type: String, required: true }, // E.g. "Physics"
  areaOfSubjects: [{ type: String, required: true }], // Array of topics like ["Kinematics", "Dynamics"]
});

// Education Details Schema
const educationDetailsSchema = new mongoose.Schema({
  highestEducation: { type: String, required: true },
  university: { type: String },
  typeOfDegree: { type: String },
  uploadDegree: [{ type: String }], // Array to store multiple degree file URLs/paths
  major: { type: String },
  uploadCertificate: [{ type: String }], // Array for multiple certificates
});

// Main Tutor Schema
const tutorSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/.+\@.+\..+/, "Please enter a valid email address"], // Basic email validation
    },
    isMailVerified: { type: Boolean, default: false },
    password: {
      type: String,
      required: true,
      // minlength: 6, // Enforce minimum length for security
    },
    passwordTokenExipry: { type: Date },
    forgotPasswordToken: { type: String },
    tutorDetails: { type: tutorDetailsSchema, required: true }, // Ensure tutor details are required
    educationDetails: { type: [educationDetailsSchema], required: true }, // Expect an array of embedded documents here
    subjectsTaught: { type: [subjectsTaughtSchema], required: true }, // List of subjects and topics taught
    emailVerificationToken: { type: String },
    isValidated: { type: Boolean, default: false }, // Default is not validated
    isRulesAccepted: { type: Boolean, default: false }, // Whether the tutor accepted the rules/terms
    termsAndConditions: {
      agreeTerms: { type: Boolean, default: false },
      readTerms: { type: Boolean, default: false },
      ssnAuthorization: { type: Boolean, default: false },
    },
  },
  {
    collection: "tutor",
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Ensure model is only created once
const Tutor = mongoose.models.Tutor || mongoose.model("Tutor", tutorSchema);
export default Tutor;
