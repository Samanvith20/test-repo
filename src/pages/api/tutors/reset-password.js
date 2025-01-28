import bcrypt from "bcrypt";

import dbConnect from "../lib/mongoose";
import Tutor from "../models/Tutor";

export default async function handler(req, res) {
  await dbConnect();
  const { token, newPassword } = req.body;
  console.log("token: ", token);

  try {
    // Find the tutor by the verification token
    const tutor = await Tutor.findOne({ forgotPasswordToken: token });
    console.log("tutor: ", tutor);

    if (!tutor) {
      return res
        .status(402)
        .json({ success: false, message: "Token not found." });
    }

    // Check if token is expired
    if (Date.now() >= new Date(tutor.passwordTokenExipry).getTime()) {
      return res.status(400).json({ message: "Token has expired" });
    }
    // console.log("Date: ", new Date(tutor.passwordTokenExipry).getTime());
    // console.log("Date: ", Date.now());
    
    



    // Hash the new password before saving
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    tutor.password = hashedPassword;
    await tutor.save();

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }
}
