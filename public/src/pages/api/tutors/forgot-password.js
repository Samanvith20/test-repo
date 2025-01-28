import dbConnect from "../lib/mongoose";

import crypto from "crypto";



import Tutor from "../models/Tutor";
import nodemailer from "nodemailer";
async function sendVerificationEmail(tutorEmail, token) {
    const transporter = nodemailer.createTransport({
      service: "gmail", // You can change this to your preferred service
      auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS, // Your email password or app-specific password
      },
    });
  
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: tutorEmail,
      subject: "Verify your password for EduEliteConnect",
      html: `
        <h1>Password Verification</h1>
        <p>Click the link below to verify your email address:</p>
        <a href="${process.env.BASE_URL}/tutor-password-verification?token=${token}">Verify Password</a>
      `,
    };
  
    await transporter.sendMail(mailOptions);
  }
 
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
      const existingTutor = await Tutor.findOne({ email: email });
      console.log("Existing Tutor:", existingTutor);

      if (!existingTutor) {
        return res.status(400).json({
          success: false,
          message: "No Tutor found with this email",
        });
      }

      const tutorVerificationToken = crypto.randomBytes(32).toString("hex");
      let exipry = Date.now() + 3600000; // 1 hour in milliseconds
      let istOffset = 5 * 60 * 60 * 1000 + 30 * 60 * 1000;
      let istExpiry = new Date(exipry + istOffset);
      console.log(
        istExpiry.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
      );

      // Update the tutor's email and verification token
      existingTutor.forgotPasswordToken = tutorVerificationToken;
      existingTutor.passwordTokenExipry = istExpiry;

      // Save the tutor

      await existingTutor.save();

      // Send email
      await sendVerificationEmail(email, tutorVerificationToken);

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
