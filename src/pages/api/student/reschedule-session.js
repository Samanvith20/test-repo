import { getServerSession } from "next-auth";
import dbConnect from "../lib/mongoose";
import SessionRequests from "../models/SessionRequests";
import { authOptions } from "../auth/[...nextauth]";
import ScheduledClasses from "../models/ScheduledClasses";
import CompletedClasses from "../models/CompletedClasses";
import Student from "../models/Student";
import Tutor from "../models/Tutor";
import nodemailer from "nodemailer";
import moment from "moment-timezone";
import stripe from "stripe";

const stripeClient = stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  console.log("session");


   // Send emails
   const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  
  // Check if the user is authenticated and has the role 'student'
  if (!session || session.role !== "student") {
    return res
      .status(401)
      .json({ message: "Unauthorized request. Please login to continue" });
  }
  const role = session.role; // Get user role

  if (req.method === "POST") {
    await dbConnect(); // Ensure database connection

    const {
      tutorId,
      timeslot,
      classDescription,
      studentUsername,
      subjectDetails,
      classDuration,
      scheduledClassId,
    } = req.body;
console.log("scheduledClassId", scheduledClassId);

    try {
      // Check if a session request already exists for this student, tutor, and time slot
      const existingRequest = await SessionRequests.findOne({
        studentUsername: studentUsername,
        tutorId: tutorId,
        "timeslot.date": timeslot.date,
        "timeslot.time": timeslot.time,
      });

      const tutorExistingSlot = await SessionRequests.findOne({
        tutorId: tutorId,
        "timeslot.date": timeslot.date,
        "timeslot.time": timeslot.time,
      });

      const scheduleClass = await ScheduledClasses.findOne({
        tutorId: tutorId,
        "timeslot.date": timeslot.date,
        "timeslot.time": timeslot.time,
      });
      

      if (existingRequest || tutorExistingSlot || scheduleClass) {
        return res.status(409).json({
          message:
            "A request for this time slot has already been sent to this tutor.",
        });
      }
      const scheduleClasses = await ScheduledClasses.findById(scheduledClassId)

      // Calculate the time difference
      const timezoneMap = {
        Alaska: "America/Anchorage",
        Hawaii: "Pacific/Honolulu",
        Eastern: "America/New_York",
        Central: "America/Chicago",
        Mountain: "America/Denver",
        Pacific: "America/Los_Angeles",
      };

      const mappedTimezone = timezoneMap[timeslot.timezone.trim()];
      if (!mappedTimezone) {
        return res.status(400).json({
          message: "Invalid timezone specified in timeslot.",
        });
      }
      const {  date, time } =scheduleClasses?.timeslot;

      const scheduledDateTime = moment.tz(
        `${date} ${time.split(" - ")[0]}`,
        "MM-DD-YYYY HH:mm",
        mappedTimezone
      );
      console.log("scheduledDateTime:", scheduledDateTime);
  
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
  
      if (isNaN(timeDifferenceMinutes)) {
        console.error(
          "Time difference calculation failed. Check scheduledDateTime or cancellationTimestamp."
        );
        return res
          .status(500)
          .json({ message: "Time difference calculation failed" });
      }
      
  
      const tutor = await Tutor.findById(scheduleClasses.tutorId);
      if (!tutor) {
        return res.status(404).json({ message: "Tutor not found" });
      }
      const tutorEmail = tutor.email;
      console.log("tutorEmail", tutorEmail);
  
      const tutorHourlyRate= tutor.tutorDetails.cancellationDuration;
      console.log("tutorHourlyRate", tutorHourlyRate);
      const cancellationHours = parseInt(tutorHourlyRate.match(/\d+/)[0], 10);
      console.log("cancellationHours", cancellationHours);
      const cancellationDurationMinutes = cancellationHours * 60;
      console.log("cancellationDurationMinutes", cancellationDurationMinutes);
      
  
      // Determine if the student should be charged based on cancellation duration
      const isStudentCharged =
        timeDifferenceMinutes < cancellationDurationMinutes;
  
      console.log("isStudentCharged:", isStudentCharged);

      const paymentIntentId =  scheduleClasses?.transactionDetails?.paymentIntentId;
        console.log("paymentIntentId", paymentIntentId);
        
      if (isStudentCharged) {
        const hourlyRate = tutor.tutorDetails.hourlyPrice;
        console.log("hourlyRate", hourlyRate);
        
         const amount = Math.round(hourlyRate * cancellationHours);
        console.log("amount", amount);

        try {
          await stripeClient.paymentIntents.capture(paymentIntentId, {
            amount_to_capture: amount * 100,
          });

          scheduleClasses.transactionDetails = {
            ...scheduleClasses.transactionDetails,
            capturedAmount: amount,
            status: "captured",
            transactions: [
              ...(scheduleClasses.transactionDetails?.transactions || []),
              `Late cancellation charge of $${amount.toFixed(2)} captured`,
            ],
          };

          const student = await Student.findOne({
            username: studentUsername,
          });

          if (!student) {
            return res.status(404).json({ message: "Student not found" });
          }

          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: student.email,
            subject: "Class Rescheduled and Charged",
            text: `Dear ${studentUsername},\n\nYour class scheduled on ${scheduledDateTime.format(
              "YYYY-MM-DD HH:mm"
            )} has been rescheduled. You have been charged $${amount.toFixed(
              2
            )} for the reschedule.\n\nRegards,\nEduElite Team`,
          });
        } catch (paymentError) {
          return res.status(500).json({ message: "Failed to capture payment" });
        }
      } else {
        try {
          await stripeClient.paymentIntents.cancel(paymentIntentId);

          scheduleClasses.transactionDetails = {
            ...scheduleClasses.transactionDetails,
            status: "studentcanceled",
            transactions: [
              ...(scheduleClasses.transactionDetails?.transactions || []),
              "Authorized amount released due to timely reschedule",
            ],
          };

          const student = await Student.findOne({
            username: studentUsername,
          });

          if (!student) {
            return res.status(404).json({ message: "Student not found" });
          }

          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: student.email,
            subject: "Class Rescheduled Without Charge",
            text: `Dear ${studentUsername},\n\nYour class scheduled on ${scheduledDateTime.format(
              "YYYY-MM-DD HH:mm"
            )} has been rescheduled without any charges.\n\nRegards,\nEduElite Team`,
          });
        } catch (error) {
          console.error("Error releasing hold amount:", error.message);
        }
      }
  
      // Update the class status
      scheduleClasses.classStatus = {
        classStatus: "Reschedule",
        changedBy: role,
        statusChangeTimestamp: cancellationTimestamp.format("YYYY-MM-DD HH:mm"),
        statusChangeTimeDifference: timeDifferenceMinutes, // Store in minutes for clarity
        isStudentCharged,
      };
  
      await scheduleClasses.save();
      
       // Move the document to CompletedClasses
    const completedClassData = new CompletedClasses(scheduleClasses.toObject());
    await completedClassData.save();

    // Optionally, delete the document from ScheduledClasses after moving
    await ScheduledClasses.findByIdAndDelete(scheduledClassId);
      

      // Create a new session request
      const newSessionRequest = new SessionRequests({
        studentUsername: studentUsername,
        tutorId: tutorId,
        timeslot: {
          date: timeslot.date,
          time: timeslot.time,
          timezone: timeslot.timezone,
        },
        classDescription: classDescription,
        subjectDetails: {
          subject: subjectDetails.subject,
          areaOfSubject: subjectDetails.areaOfSubject,
        },
        classDuration: classDuration,
        status: "Pending",
        timeDifference: timeDifferenceMinutes,
        isStudentCharged,
      });

      await newSessionRequest.save();

      // Fetch emails for the student and tutor
      const student = await Student.findOne({ username: studentUsername });
      

      if (!student || !tutor) {
        return res.status(404).json({
          message:
            "Student or tutor not found. Unable to send confirmation emails.",
        });
      }

      const studentEmail = student.email;
   
      const tutorFirstName = tutor.tutorDetails.firstName;
      const tutorLastName = tutor.tutorDetails.lastName;
      const tutorName = tutorFirstName + " " + tutorLastName;

     

      const studentMailOptions = {
        from: process.env.EMAIL_USER,
        to: studentEmail,
        subject: "Session Rescheduled Confirmation",
        text: `Dear ${studentUsername},\n\nYour session has been rescheduled successfully.\n\nDetails:\n- Tutor: ${tutorName}\n- Subject: ${subjectDetails.subject}\n- Time: ${timeslot.time} on ${timeslot.date} (${timeslot.timezone})\n- Duration: ${classDuration}\n\nRegards,\nEduElite Team`,
      };

      const tutorMailOptions = {
        from: process.env.EMAIL_USER,
        to: tutorEmail,
        subject: "New Session Request",
        text: `Dear ${tutorName},\n\nA session has been rescheduled by ${studentUsername}.\n\nDetails:\n- Subject: ${subjectDetails.subject}\n- Time: ${timeslot.time} on ${timeslot.date} (${timeslot.timezone})\n- Duration: ${classDuration}\n- Description: ${classDescription}\n\nPlease review and confirm the request.\n\nRegards,\nEduElite Team`,
      };

      await transporter.sendMail(studentMailOptions);
      await transporter.sendMail(tutorMailOptions);

      return res
        .status(200)
        .json({ message: "Session rescheduled and request sent successfully" });
    } catch (error) {
      console.error("Internal Server Error: ", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  } else {
    return res.status(405).json({ message: "Method not supported!" });
  }
}
