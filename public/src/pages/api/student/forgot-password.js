import dbConnect from "../lib/mongoose";

import crypto from "crypto";

import Student from "../models/Student";
import sendVerificationEmail from "./password-nodemailer";
export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "POST") {
    const { email } = req.body;

    console.log("Current Email:", email);

    // Validate input
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameters: email",
      });
    }

    try {
      // Find the tutor with the current email
      const existingStudent = await Student.findOne({ email: email });
      console.log("Existing Tutor:", existingStudent);

      if (!existingStudent) {
        return res.status(400).json({
          success: false,
          message: "No Tutor found with this email",
        });
      }

      const studentVerificationToken = crypto.randomBytes(32).toString("hex");
      let exipry = Date.now() + 3600000; // 1 hour in milliseconds
      let istOffset = 5 * 60 * 60 * 1000 + 30 * 60 * 1000;
      let istExpiry = new Date(exipry + istOffset);
      console.log(
        istExpiry.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
      );

      // Update the tutor's email and verification token
      existingStudent.forgotPasswordToken = studentVerificationToken;
      existingStudent.passwordTokenExipry = istExpiry;

      // Save the tutor

      await existingStudent.save();

      // Send email
      await sendVerificationEmail(email, studentVerificationToken);

      return res.status(200).json({
        success: true,
        message: "Email changed successfully. Please verify your new email.",
      });
    } catch (error) {
      console.error("Error updating email:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while updating the email.",
      });
    }
  } else {
    return res.status(405).json({
      success: false,
      message: "Method not allowed. Only POST requests are accepted.",
    });
  }
}
