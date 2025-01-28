import { getServerSession } from "next-auth";
import dbConnect from "../lib/mongoose";
import Student from "../models/Student";
import { authOptions } from "../auth/[...nextauth]";


export default async function handler(req, res) {
  // Ensure the request is a GET request
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
      await dbConnect();
    // Get the session
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Extract student ID from session
    const studentId = session.id;
    console.log("studentId", studentId);
    

    if (!studentId) {
      return res.status(400).json({ error: "Student ID not found in session" });
    }

   

    // Find the student data
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Send the student data in the response
    return res.status(200).json({ success: true, data: student });
  } catch (error) {
    console.error("Error fetching student data:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
