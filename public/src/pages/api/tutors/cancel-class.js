import { getServerSession } from "next-auth";
import dbConnect from "../lib/mongoose";
import ScheduledClasses from "../models/ScheduledClasses";
import Tutor from "../models/Tutor";
import { authOptions } from "../auth/[...nextauth]";
import moment from "moment-timezone";
import nodemailer from "nodemailer";
import Student from "../models/Student";
import CompletedClasses from "../models/CompletedClasses";
import stripe from "stripe";
const stripeClient = stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  await dbConnect();

  // Get the session and validate it
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.id) {
    return res.status(401).json({ message: "Unauthorized, session not found" });
  }

  const role = session.role; // Get user role
  const { id } = req.body;

  try {
    // Find the scheduled class by ID
    const scheduledClass = await ScheduledClasses.findById(id);
    if (!scheduledClass) {
      return res.status(404).json({ message: "Scheduled class not found" });
    }

    // Check if the class is already cancelled
    if (scheduledClass.classStatus.classStatus === "Cancelled") {
      return res.status(400).json({ message: "Class is already cancelled" });
    }

    // Retrieve the tutor's timezone from the timeslot
    const { timezone, date, time } = scheduledClass.timeslot;
    console.log("Date and time from timeslot:", date, time);

    const timezoneMap = {
      Alaska: "America/Anchorage",
      Hawaii: "Pacific/Honolulu",
      Eastern: "America/New_York",
      Central: "America/Chicago",
      Mountain: "America/Denver",
      Pacific: "America/Los_Angeles",
    };

    // Retrieve the correct timezone string from timezoneMap
    const mappedTimezone = timezoneMap[timezone.trim()];
    if (!mappedTimezone) {
      return res
        .status(400)
        .json({ message: "Invalid timezone specified in timeslot" });
    }

    // Parse scheduledDateTime in the tutor's timezone
    const scheduledDateTime = moment.tz(
      `${date} ${time.split(" - ")[0]}`,
      "MM-DD-YYYY HH:mm",
      mappedTimezone
    );
    if (!scheduledDateTime.isValid()) {
      return res
        .status(400)
        .json({ message: "Invalid date or time format in timeslot" });
    }
    console.log(
      "scheduledDateTime:",
      scheduledDateTime.format("YYYY-MM-DD HH:mm")
    );

    // Get the current time as cancellation timestamp in the tutor's timezone
    const cancellationTimestamp = moment.tz(mappedTimezone);
    console.log(
      "cancellationTimestamp:",
      cancellationTimestamp.format("YYYY-MM-DD HH:mm")
    );

    // Calculate the time difference in minutes
    const timeDifferenceMinutes = scheduledDateTime.diff(
      cancellationTimestamp,
      "minutes"
    );
    console.log("Time Difference (minutes):", timeDifferenceMinutes);

    if (isNaN(timeDifferenceMinutes)) {
      console.error(
        "Time difference calculation failed. Check scheduledDateTime or cancellationTimestamp."
      );
      return res
        .status(500)
        .json({ message: "Time difference calculation failed" });
    }
    const paymentIntentId = scheduledClass?.transactionDetails?.paymentIntentId;
    // Release authorized amount 
    try {
      await stripeClient.paymentIntents.cancel(paymentIntentId);
      scheduledClass.transactionDetails.status = "Tutorcanceled";
      scheduledClass.transactionDetails.transactions.push(
        "Authorized amount released due to  cancellation by tutor"
      );
      scheduledClass.classStatus.isStudentCharged = false;
    } catch (error) {
      console.error("Error releasing hold amount:", error.message);
    }
    


    // Update the class status
    scheduledClass.classStatus = {
      classStatus: "Cancelled",
      changedBy: role,
      statusChangeTimestamp: cancellationTimestamp.format("YYYY-MM-DD HH:mm"),
      statusChangeTimeDifference: timeDifferenceMinutes, // Store in minutes
      isStudentCharged: false, // Ensure student is not charged for tutor-initiated cancellations
    };

    await scheduledClass.save();

    // Move the document to CompletedClasses
    const completedClassData = new CompletedClasses(scheduledClass.toObject());
    await completedClassData.save();

    // Optionally, delete the document from ScheduledClasses after moving
    await ScheduledClasses.findByIdAndDelete(id);

    // Fetch student and tutor emails
    const student = await Student.findOne({
      username: scheduledClass.studentUsername,
    });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    const studentEmail = student.email;
    console.log("studentEmail", studentEmail);

    const tutor = await Tutor.findById(scheduledClass.tutorId);
    if (!tutor) {
      return res.status(404).json({ message: "Tutor not found" });
    }
    const tutorEmail = tutor.email;
    console.log("tutorEmail", tutorEmail);

    // Setup Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail", // or any other email service
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email content for student
    const studentMailOptions = {
      from: process.env.EMAIL_USER,
      to: studentEmail,
      subject: "Class Cancellation Notification",
      text: `Dear Student,\n\nYour class scheduled on ${scheduledDateTime.format(
        "YYYY-MM-DD HH:mm"
      )} has been canceled by the tutor and the  holded amount has been releases to your account.\n\nRegards,\nEduEliteConnect Team`,
    };

    // Email content for tutor
    const tutorMailOptions = {
      from: process.env.EMAIL_USER,
      to: tutorEmail,
      subject: "Class Cancellation Notification",
      text: `Dear Tutor,\n\nThe class scheduled with the student on ${scheduledDateTime.format(
        "YYYY-MM-DD HH:mm"
      )} has been canceled.\n\nRegards,\nEduEliteConnect Team`,
    };

    // Send emails
    await transporter.sendMail(studentMailOptions);
    await transporter.sendMail(tutorMailOptions);

    return res.status(200).json({
      message: "Class cancelled successfully and notification emails sent",
    });
  } catch (error) {
    console.error("Error in class cancellation:", error);
    return res
      .status(500)
      .json({ message: "An error occurred during cancellation" });
  }
}
