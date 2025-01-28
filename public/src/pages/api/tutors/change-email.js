import dbConnect from "../lib/mongoose";
import Tutor from "../models/Tutor";
import crypto from "crypto";
import sendVerificationEmail from "./nodemailer";
export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "POST") {
    const { currentEmail, newEmail } = req.body;

    console.log("Current Email:", currentEmail);
    console.log("New Email:", newEmail);

    // Validate input
    if (!newEmail) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameters: newEmail",
      });
    }

    try {
      // Find the tutor with the current email
      const existingTutor = await Tutor.findOne({ email: currentEmail }); 
      console.log("Existing Tutor:", existingTutor);


      const emailAlreadyExists = await Tutor.findOne({ email: newEmail });
      if (emailAlreadyExists) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }
      if (!existingTutor) {
        return res.status(400).json({
          success: false,
          message: "No Tutor found with this email",
        });
      }

      // Update the email
      existingTutor.email = newEmail;
      const emailVerificationToken = crypto.randomBytes(32).toString("hex");
      existingTutor.emailVerificationToken = emailVerificationToken;
      // Save the updated document
      await existingTutor.save();
      await sendVerificationEmail(newEmail, emailVerificationToken);

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
