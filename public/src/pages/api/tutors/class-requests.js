import dbConnect from "../lib/mongoose";
import SessionRequests from "../models/SessionRequests";
import Student from "../models/Student";
import nodemailer from "nodemailer";
import moment from "moment";
import Tutor from "../models/Tutor";

export default async function handler(req, res) {
  await dbConnect(); // Ensure the database is connected

  if (req.method === "DELETE") {
    const { id, name, tutorId } = req.body; // Retrieve the ID and other details from the request body
    console.log("id", id);
    console.log("name", name);
    console.log("tutorId", tutorId);

    if (!id || !name || !tutorId) {
      return res
        .status(400)
        .json({ error: "Request body must contain an ID, name, and tutorId" });
    }

    try {
      // Delete the session request
      const updatedRequest = await SessionRequests.findByIdAndUpdate(
        id, 
        { status: "Cancelled" }, 
        { new: true } // Return the updated document
      );
      
      if (!updatedRequest) {
        return res.status(404).json({ error: "Class request not found" });
      }
      

      // Find the student by username
      const student = await Student.findOne({ username: name });
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      // Find the tutor by ID to get their name
      const tutor = await Tutor.findById(tutorId);
      if (!tutor) {
        return res.status(404).json({ message: "Tutor not found" });
      }

      const tutorfirstname = tutor.tutorDetails.firstName;
      const tutorlastname = tutor.tutorDetails.lastName;
      const tutorName = `${tutorfirstname} ${tutorlastname}`;

      // Format the date of the timeslot (if present in the deletedRequest)
      const timeslot = updatedRequest.timeslot; // Assuming `timeslot` is part of `deletedRequest`
      const formattedDate = timeslot
        ? moment(timeslot.date, "dddd, MMMM D, YYYY").format("YYYY-MM-DD")
        : "N/A";

      const studentEmail = student.email;

      // Setup Nodemailer transporter
      const transporter = nodemailer.createTransport({
        service: "gmail", // Use the email service you prefer
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      // Email content for the student
      const studentMailOptions = {
        from: process.env.EMAIL_USER,
        to: studentEmail,
        subject: "Session Request Rejection Notification",
        html: `
          <p>Dear ${student.username},</p>
          <p>We regret to inform you that your scheduled class on ${formattedDate} has been rejected by the tutor, ${tutorName}. Please selected another tutor to book a session.</p>
          <p>If you have any questions, please reach out to support.</p>
          <p>Best regards,<br>EduElite Platform Team</p>
        `,
      };

      // Send email to the student
      await transporter.sendMail(studentMailOptions);

      return res.status(200).json(updatedRequest);
    } catch (error) {
      console.error("Error deleting class request:", error);
      res.status(500).json({ error: "Failed to delete class request" });
    }
  } else {
    res.setHeader("Allow", ["DELETE"]);
    res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}
