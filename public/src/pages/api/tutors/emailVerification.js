import dbConnect from "../lib/mongoose";
import Tutor from "../models/Tutor";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "GET") {
    const { token } = req.query;

    try {
      // Find the tutor by the verification token
      const tutor = await Tutor.findOne({ emailVerificationToken: token });

      if (!tutor) {
        return res.status(400).json({ success: false, message: "Invalid or expired token." });
      }

      // Set the tutor's email as verified
      tutor.isMailVerified = true;
      tutor.emailVerificationToken = undefined; // Clear the token after verification

      // Save the tutor
      await tutor.save();

      res.status(200).json({ success: true, message: "Email verified successfully!" });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ success: false, message: "Error verifying email.", error: error.message });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
