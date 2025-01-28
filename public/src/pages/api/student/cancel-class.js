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

  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.id) {
    return res.status(401).json({ message: "Unauthorized, session not found" });
  }

  const role = session.role;
  const { id, hours } = req.body;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    const scheduledClass = await ScheduledClasses.findById(id);
    if (!scheduledClass) {
      return res.status(404).json({ message: "Scheduled class not found" });
    }

    if (scheduledClass?.classStatus?.classStatus === "Cancelled") {
      return res.status(400).json({ message: "Class is already cancelled" });
    }

    const { timezone, date, time } = scheduledClass.timeslot;

    const timezoneMap = {
      Alaska: "America/Anchorage",
      Hawaii: "Pacific/Honolulu",
      Eastern: "America/New_York",
      Central: "America/Chicago",
      Mountain: "America/Denver",
      Pacific: "America/Los_Angeles",
    };

    const mappedTimezone = timezoneMap[timezone.trim()];
    if (!mappedTimezone) {
      return res.status(400).json({ message: "Invalid timezone specified in timeslot" });
    }

    const scheduledDateTime = moment.tz(
      `${date} ${time.split(" - ")[0]}`,
      "MM-DD-YYYY HH:mm",
      mappedTimezone
    );

    if (!scheduledDateTime.isValid()) {
      return res.status(400).json({ message: "Invalid date or time format in timeslot" });
    }

    const cancellationTimestamp = moment.tz(mappedTimezone);
    const timeDifferenceMinutes = scheduledDateTime.diff(
      cancellationTimestamp,
      "minutes"
    );

    if (isNaN(timeDifferenceMinutes)) {
      return res.status(500).json({ message: "Time difference calculation failed" });
    }

    const tutor = await Tutor.findById(scheduledClass.tutorId);
    if (!tutor) {
      return res.status(404).json({ message: "Tutor not found" });
    }

    const cancellationHours = parseInt(hours.match(/\d+/)[0], 10);
    const cancellationDurationMinutes = cancellationHours * 60;
    const isStudentCharged = timeDifferenceMinutes < cancellationDurationMinutes;
    
    const paymentIntentId = scheduledClass?.transactionDetails?.paymentIntentId;

    if (isStudentCharged) {
      const hourlyRate = tutor.tutorDetails.hourlyPrice;
      const amount = Math.round(hourlyRate * cancellationHours);
       console.log("Amount to be charged:", amount);
      try {
        await stripeClient.paymentIntents.capture(paymentIntentId, {
          amount_to_capture: amount * 100, // Stripe uses cents
        });

        scheduledClass.transactionDetails = {
          ...scheduledClass.transactionDetails,
          capturedAmount: amount,
          status: "captured",
          transactions: [
            ...(scheduledClass.transactionDetails?.transactions || []),
            `Late cancellation charge of $${amount.toFixed(2)} captured`,
          ],

        };
        console.log("Payment captured successfully");
        

        const student = await Student.findOne({
          username: scheduledClass.studentUsername,
        });

        if (!student) {
          return res.status(404).json({ message: "Student not found" });
        }

        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: student.email,
          subject: "Class Cancellation Notification",
          text: `Dear Student,\n\nYour class scheduled on ${scheduledDateTime.format(
            "YYYY-MM-DD HH:mm"
          )} has been canceled. You have been charged $${amount.toFixed(
            2
          )} for late cancellation.\n\nRegards,\nEduEliteConnect Team`,
        });
        console.log("Student notified of late cancellation charge");
        
      } catch (paymentError) {
        return res.status(500).json({ message: "Failed to capture payment" });
      }
    } else {
      try {
        await stripeClient.paymentIntents.cancel(paymentIntentId);

        scheduledClass.transactionDetails = {
          ...scheduledClass.transactionDetails,
          status: "studentcanceled",
          transactions: [
            ...(scheduledClass.transactionDetails?.transactions || []),
            "Authorized amount released due to timely cancellation",
          ],
        };

        const student = await Student.findOne({
          username: scheduledClass.studentUsername,
        });

        if (!student) {
          return res.status(404).json({ message: "Student not found" });
        }

        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: student.email,
          subject: "Class Cancellation Notification",
          text: `Dear Student,\n\nYour class scheduled on ${scheduledDateTime.format(
            "YYYY-MM-DD HH:mm"
          )} has been canceled. The authorized amount has been released.\n\nRegards,\nEduEliteConnect Team`,
        });
      } catch (error) {
        console.error("Error releasing hold amount:", error.message);
      }
    }

    scheduledClass.classStatus = {
      classStatus: "Cancelled",
      changedBy: role,
      statusChangeTimestamp: cancellationTimestamp.format("YYYY-MM-DD HH:mm"),
      statusChangeTimeDifference: timeDifferenceMinutes,
      isStudentCharged,
    };

    await scheduledClass.save();

    const completedClassData = new CompletedClasses(scheduledClass.toObject());
    await completedClassData.save();
    await ScheduledClasses.findByIdAndDelete(id);

    const tutorEmail = tutor.email;
     console.log("tutorEmail", tutorEmail); 
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: tutorEmail,
      subject: "Class Cancellation Notification",
      text: `Dear Tutor,\n\nThe class scheduled with the student on ${scheduledDateTime.format(
        "YYYY-MM-DD HH:mm"
      )} has been canceled.\n\nRegards,\nEduEliteConnect Team`,
    });
    console.log("Tutor notified of class cancellation");
    

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
