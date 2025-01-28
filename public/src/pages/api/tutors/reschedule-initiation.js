import NextAuth, { getServerSession } from "next-auth";
import dbConnect from "../lib/mongoose";
import RescheduleTokens from "../models/RescheduleTokens";
import Student from "../models/Student";
import nodemailer from "nodemailer";
import crypto from "crypto"; // For generating tokens
import { authOptions } from "../auth/[...nextauth]"; // Assuming you have this file for authentication options
import ScheduledClasses from "../models/ScheduledClasses";
import Tutor from "../models/Tutor";

export default async function handler(req, res) {
  console.log("API hit");

  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res
      .status(401)
      .json({ message: "You are not authorized to make this request." });
  }

  if (session.role !== "tutor") {
    return res.status(401).json({
      message: "You are not authorized to make this request.",
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "This method is not supported." });
  }

  try {
    await dbConnect();
    const {
      studentUsername,
      tutorId,
      timeslot,
      rescheduledTimeslot,
      classToBeRescheduled,
    } = req.body;

    console.log(
      "Request body: ",
      studentUsername,
      tutorId,
      timeslot,
      rescheduledTimeslot,
      classToBeRescheduled
    );

    // 1) Check for duplicate entries in RescheduledTokens collection
    const duplicateEntry = await RescheduleTokens.findOne({
      studentUsername,
      tutorId,
      "timeslot.date": timeslot.date,
      "timeslot.time": timeslot.time,
    });

    if (duplicateEntry) {
      return res.status(400).json({
        message: "A reschedule request for this timeslot already exists.",
      });
    }

    // 2) Check for existing reschedule requests with the same rescheduledTimeslot
    const existingEntries = await RescheduleTokens.find({
      studentUsername,
      tutorId,
    });

    let rescheduleConflict = false;

    for (const entry of existingEntries) {
      if (
        entry.rescheduledTimeslot.date === rescheduledTimeslot.date &&
        entry.rescheduledTimeslot.time === rescheduledTimeslot.time
      ) {
        rescheduleConflict = true;
        break;
      }
    }

    if (rescheduleConflict) {
      return res.status(400).json({
        message:
          "A reschedule request with this new timeslot already exists. Please choose a different timeslot.",
      });
    }

    // 3) Generate a token and store details in the database
    const token = crypto.randomBytes(32).toString("hex");

    const newRescheduleToken = new RescheduleTokens({
      studentUsername,
      tutorId,
      timeslot,
      rescheduledTimeslot,
      classToBeRescheduled,
      rescheduleToken: token,
      createdAt: new Date(),
    });

    await newRescheduleToken.save();

    const scheduledClass = await ScheduledClasses.findOne({
      _id: classToBeRescheduled,
    });

    // Send an email to the student about the change in schedule
    const student = await Student.findOne({ username: studentUsername });
    const tutor = await Tutor.findOne({ _id: tutorId });
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }
    // console.log('TUTOR: ', tutor)
    const studentEmail = student.email;

    // Prepare the email content
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Your email
        pass: process.env.EMAIL_PASS, // Your email password or app password
      },
    });

    const confirmationUrl = `${process.env.NEXTAUTH_URL}/confirm-reschedule?token=${token}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: studentEmail,
      subject: "Class Reschedule Request",
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reschedule Confirmation</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f7f7f7;
      margin: 0;
      padding: 0;
    }
    .email-container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      padding: 20px;
    }
    .header {
      text-align: center;
      font-size: 20px;
      font-weight: bold;
      color: #ff6b35;
      margin-bottom: 20px;
    }
    .content {
      font-size: 14px;
      color: #333333;
      line-height: 1.6;
    }
    .content .section {
      margin-bottom: 20px;
    }
    .session-details {
      background-color: #fdf4ef;
      border: 1px solid #ffe3d3;
      border-radius: 8px;
      padding: 15px;
      font-size: 14px;
      margin-bottom: 20px;
    }
    .session-details table {
      width: 100%;
      border-collapse: collapse;
    }
    .session-details td {
      padding: 5px 10px;
      vertical-align: top;
    }
    .session-details td:first-child {
      font-weight: bold;
      color: #ff6b35;
    }
    .actions {
      text-align: center;
      margin-top: 20px;
    }
    .button {
      display: inline-block;
      text-decoration: none; /* Removes the underline from the anchor tag */
      padding: 10px 20px;
      margin: 5px;
      border-radius: 4px;
      font-size: 14px;
      font-weight: bold;
      color: #ffffff !important; /* Ensures text color is white */
    }

    .confirm-reschedule {
      background-color: #2f8f83; /* Green background */
      border: none;
      color: #ffffff !important; /* White text color */
    }

    .reject-reschedule {
      background-color: #e67e22; /* Orange background */
      border: none;
      color: #ffffff !important; /* White text color */
    }

    a.button:visited,
    a.button:active,
    a.button:hover {
      text-decoration: none; /* Prevents underlines on hover, active, and visited states */
      color: #ffffff !important; /* Ensures text color remains white in all states */
    }

    .tips-section {
      font-size: 14px;
      color: #333333;
      margin-top: 20px;
    }
    .tips-section h3 {
      font-size: 16px;
      font-weight: bold;
      color: #ff6b35;
      margin-bottom: 10px;
    }
    .tips-section ul {
      padding-left: 20px;
      list-style-type: decimal;
    }
    .tips-section ul li {
      margin-bottom: 10px;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">Your Tutoring Session has been Rescheduled!</div>
    <div class="content">
      <div class="section">
        Hello, student. We would like to inform you that your session has been rescheduled. Below are the updated details:
      </div>
      <div class="session-details">
        <h3>Original Timeslot</h3>
        <table>
          <tr>
            <td>Subject :</td>
            <td>${scheduledClass.subjectDetails?.subject || "N/A"}, ${
        scheduledClass.subjectDetails?.areaOfSubject || "N/A"
      }</td>

          </tr>
          <tr>
            <td>Date (MM/DD/YYY) :</td>
            <td>${timeslot.date}</td>
          </tr>
          <tr>
            <td>Time :</td>
            <td>${timeslot.time}</td>
          </tr>
          <tr>
            <td>Timezone :</td>
            <td>${timeslot.timezone} - Time</td>
          </tr>
          <tr>
            <td>Duration :</td>
            <td>${scheduledClass.classDuration}</td>
          </tr>
          <tr>
            <td>Tutor :</td>
           <td>${tutor.tutorDetails?.firstName || "N/A"} ${
        tutor.tutorDetails?.lastName || "N/A"
      }</td>

          </tr>
        </table>
      </div>
      <div class="session-details">
        <h3>New Rescheduled Timeslot</h3>
        <table>
          <tr>
            <td>Subject :</td>
<td>${scheduledClass.subjectDetails?.subject || "N/A"}, ${
        scheduledClass.subjectDetails?.areaOfSubject || "N/A"
      }</td>
          </tr>
          <tr>
            <td>Date (MM/DD/YYY) :</td>
            <td>${rescheduledTimeslot.date}</td>
          </tr>
          <tr>
            <td>Time :</td>
            <td>${rescheduledTimeslot.time}</td>
          </tr>
          <tr>
            <td>Timezone :</td>
            <td>${rescheduledTimeslot.timezone} - Time</td>
          </tr>
          <tr>
            <td>Duration :</td>
            <td>${scheduledClass.classDuration}</td>
          </tr>
          <tr>
            <td>Tutor :</td>
            <td>${tutor.tutorDetails?.firstName || "N/A"} ${
        tutor.tutorDetails?.lastName || "N/A"
      }</td>

          </tr>
        </table>
      </div>
      <div class="actions">
        <a
          target="_blank"
          href="${confirmationUrl}&studentResponse=yes"
          class="button confirm-reschedule"
        >
          Yes
        </a>
        <a
          target="_blank"
          href="${confirmationUrl}&studentResponse=no"
          class="button reject-reschedule"
        >
          No
        </a>
      </div>
      <div class="tips-section">
        <h3>Tips for a Successful Online Lesson</h3>
        <ul>
          <li>Choose a quiet, comfortable place with minimal distractions.</li>
          <li>Test your internet connection, microphone, and camera before the session starts.</li>
          <li>Gather any materials you might need ahead of time to avoid interruptions.</li>
          <li>Engage fully in the lesson by taking notes and asking questions.</li>
          <li>Mute your microphone when you're listening to minimize distractions.</li>
          <li>Take short breaks if the session is long to stay focused.</li>
          <li>Use the chat function to ask questions without interrupting the session.</li>
        </ul>
      </div>
      <div class="tips-section">
        <h3>Other Things to Keep in Mind</h3>
        <ul>
          <li>Dress casually but appropriately, as you would in a classroom setting.</li>
          <li>Define your session goals to stay focused.</li>
          <li>Inform those around you about your study time to minimize interruptions.</li>
          <li>Review notes or work on related exercises after the session to retain knowledge.</li>
        </ul>
      </div>
    </div>
  </div>
</body>
</html>
`,
    };

    await transporter.sendMail(mailOptions);

    return res
      .status(200)
      .json({ message: "Reschedule request sent to the student." });
  } catch (error) {
    console.log("Internal Server Error: ", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
