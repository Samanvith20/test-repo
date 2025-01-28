import dbConnect from "../lib/mongoose";
import Student from "../models/Student";
import Tutor from "../models/Tutor"; // Import Tutor model
import bcrypt from "bcrypt";

export default async function handler(req, res) {
  console.log("API triggered");

  await dbConnect(); // Connect to MongoDB

  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { username, email, password, phoneNumber } = req.body;

  // Basic validation
  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ message: "Please provide all required fields." });
  }

  try {
    // Check if the email exists in the Student collection
    const existingStudent = await Student.findOne({ email });

    // If the email exists in either Student or Tutor, return an error
    if (existingStudent) {
      return res.status(409).json({
        message: "A student account with this email already exists.",
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new student
    const newStudent = new Student({
      username,
      email,
      password: hashedPassword, // Store hashed password
      studentDetails: {
        phoneNumber,
      },
    });

    // Save the student to the database
    await newStudent.save();

    // Return success response
    res.status(201).json({ message: "Student signed up successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}
