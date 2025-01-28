import mongoose from "mongoose";

// Student details schema
const studentDetailsSchema = new mongoose.Schema({
  firstName: { type: String },
  lastName: { type: String },
  address: { type: String },

  phoneNumber: {
    type: String,
  },
  country: { type: String },
  state: { type: String },
});

// Main student schema
const studentSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/.+\@.+\..+/, "Please enter a valid email address"], // Email validation
    },
    password: { type: String },
    profilePicture: { type: String },
    passwordTokenExipry: { type: Date },
    forgotPasswordToken: { type: String },
    studentDetails: { type: studentDetailsSchema },
    isValidated: { type: Boolean, default: true }, // Default is not validated
  },
  {
    collection: "student",
    timestamps: true,
  }
);

// Create the model or use an existing one
const Student =
  mongoose.models.Student || mongoose.model("Student", studentSchema);

export default Student;
