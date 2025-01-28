import bcrypt from "bcrypt";
import Student from "../models/Student";
import dbConnect from "../lib/mongoose";

export default async function handler(req, res) {
  await dbConnect();
  const { token, newPassword } = req.body;
  console.log("token: ", token);

  try {
    // Find the tutor by the verification token
    const student = await Student.findOne({ forgotPasswordToken: token });
    console.log("Student: ", student);

    if (!student) {
      return res
        .status(402)
        .json({ success: false, message: "Token not found." });
    }

    // Check if token is expired
    if (Date.now() >= new Date(student.passwordTokenExipry).getTime()) {
      return res.status(400).json({ message: "Token has expired" });
    }
    // console.log("Date: ", new Date(student.passwordTokenExipry).getTime());
    // console.log("Date: ", Date.now());
    
    



    // Hash the new password before saving
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    student.password = hashedPassword;
    await student.save();

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }
}
