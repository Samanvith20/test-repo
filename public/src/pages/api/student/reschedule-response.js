import dbConnect from "../lib/mongoose";
import RescheduleTokens from "../models/RescheduleTokens";
import ScheduledClasses from "../models/ScheduledClasses";
import nodemailer from "nodemailer";
import Student from "../models/Student";
import Tutor from "../models/Tutor";

export default async function handler(req, res) {
  try {
    await dbConnect();
    const { token, studentResponse } = req.body;

    // 1. Validate token
    const rescheduleToken = await RescheduleTokens.findOne({
      rescheduleToken: token,
    });
    if (!rescheduleToken) {
      return res.status(400).json({ message: "Invalid or expired token." });
    }

    const {
      studentUsername,
      tutorId,
      rescheduledTimeslot,
      classToBeRescheduled,
    } = rescheduleToken;

    const student = await Student.findOne({ username: studentUsername });
    const tutor = await Tutor.findOne({ _id: tutorId });

    console.log("student: ", student);
    console.log("tutor: ", tutor);

    // 2. Check student response
    if (studentResponse === "yes") {
      // Update scheduled class with the new timeslot
      const scheduledClass = await ScheduledClasses.findById(
        classToBeRescheduled
      );
      console.log("scheduledClass: ", scheduledClass);

      if (!scheduledClass) {
        return res.status(404).json({ message: "Scheduled class not found." });
      }

      // Update timeslot and channel name
      scheduledClass.timeslot = rescheduledTimeslot;
      scheduledClass.videoUrlArray = `${tutorId}_${studentUsername}_${rescheduledTimeslot.date}_${rescheduledTimeslot.time}`;
      await scheduledClass.save();

      // Send emails to both student and tutor
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const studentEmailHTML = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px; border: 1px solid #ddd;">
          <h2 style="color: #4CAF50;">Your Session Has Been Rescheduled!</h2>
          <p>Hello ${
            student.studentDetails.firstName && student.studentDetails.lastName
              ? `${student.studentDetails.firstName} ${student.studentDetails.lastName}`
              : `${student.username}`
          },</p>
          <p>Your session with tutor <strong>${tutor.tutorDetails.firstName} ${
        tutor.tutorDetails.lastName
      }</strong> has been successfully rescheduled. Here are the updated details:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;">Date:</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${
                rescheduledTimeslot.date
              }</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;">Time:</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${
                rescheduledTimeslot.time
              }</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;">Timezone:</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${
                rescheduledTimeslot.timezone
              }</td>
            </tr>
          </table>
          <p>We look forward to seeing you in the session.</p>
          <p style="color: #555;">Best regards,<br>EduElite Team</p>
        </div>`;

      const tutorEmailHTML = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px; border: 1px solid #ddd;">
          <h2 style="color: #4CAF50;">Session Reschedule accepted by Student</h2>
          <p>Hello ${tutor.tutorDetails.firstName} ${
        tutor.tutorDetails.lastName
      },</p>
          <p>The session with student <strong>${
            student.studentDetails.firstName && student.studentDetails.lastName
              ? `${student.studentDetails.firstName} ${student.studentDetails.lastName}`
              : `${student.username}`
          }</strong> has been successfully rescheduled. Here are the updated details:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;">Date:</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${
                rescheduledTimeslot.date
              }</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;">Time:</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${
                rescheduledTimeslot.time
              }</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;">Timezone:</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${
                rescheduledTimeslot.timezone
              }</td>
            </tr>
          </table>
          <p>Thank you for your understanding.</p>
          <p style="color: #555;">Best regards,<br>EduElite Team</p>
        </div>`;

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: student.email,
        subject: "Reschedule Confirmation",
        html: studentEmailHTML,
      });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: tutor.email,
        subject: "Session Rescheduled",
        html: tutorEmailHTML,
      });

      // Remove the token entry from RescheduleTokens
      await RescheduleTokens.findByIdAndDelete(rescheduleToken._id);

      return res
        .status(200)
        .json({ message: "Reschedule successfully completed." });
    } else if (studentResponse === "no") {
      // Send email to tutor notifying rejection
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const tutorEmailHTML = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px; border: 1px solid #ddd;">
          <h2 style="color: #e74c3c;">Reschedule Request Rejected</h2>
          <p>Hello ${tutor.firstName},</p>
          <p>The reschedule request for the session with student <strong>${student.firstName} ${student.lastName}</strong> has been rejected by the student. The reschedule request has been removed.</p>
          <p style="color: #555;">Best regards,<br>EduElite Team</p>
        </div>`;

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: tutor.email,
        subject: "Reschedule Request Rejected",
        html: tutorEmailHTML,
      });

      // Remove the token entry from RescheduleTokens
      await RescheduleTokens.findByIdAndDelete(rescheduleToken._id);

      return res
        .status(200)
        .json({ message: "Reschedule request rejected and removed." });
    } else {
      return res.status(400).json({ message: "Invalid student response." });
    }
  } catch (error) {
    console.log("Internal Server Error: ", error);
    return res
      .status(500)
      .json({ message: "An internal server error occurred." });
  }
}
