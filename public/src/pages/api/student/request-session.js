import { getServerSession } from "next-auth";
import dbConnect from "../lib/mongoose";
import SessionRequests from "../models/SessionRequests";
import { authOptions } from "../auth/[...nextauth]";
import Student from "../models/Student";
import Tutor from "../models/Tutor";
import nodemailer from "nodemailer";
import Payment from "../models/Payment";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  console.log("session");
  // Check if the user is authenticated and has the role 'student'
  if (!session || session.role !== "student") {
    return res
      .status(401)
      .json({ message: "Unauthorized request. Please login to continue" });
  }

  if (req.method === "POST") {
    await dbConnect(); // Ensure database connection

    const {
      tutorId,
      timeslot,
      classDescription,
      studentUsername,
      subjectDetails,
      classDuration,
    } = req.body;

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

      if (existingRequest || tutorExistingSlot) {
        return res.status(409).json({
          message:
            "A request for this time slot has already been sent to this tutor.",
        });
      }
      const student = await Student.findOne({ username: studentUsername });
      // check student was active
      const studentActive = student.isValidated;
      console.log("studentActive",studentActive);
      
      if (!studentActive) {
        return res.status(409).json({
          message: "Student is not active.",
        });
      }
      // check payment details exists for the tutor
      const paymentDetails= await Payment.findOne({
        studentEmail: student.email,
      })
      if (!paymentDetails) {
        return res.status(409).json({
          message: "Please add payment method to send session request.",
        });
      }
      const paymentMethodId=paymentDetails?.defaultPaymentMethodId;
      console.log("paymentMethodId",paymentMethodId);
      
      if (!paymentMethodId) {
        return res.status(409).json({
          message: "Please add payment method to send session request.",
        });

      }
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
        status: "Pending", // Default status as "Pending"
      });

      // Save the session request in the database
      await newSessionRequest.save();
       // Fetch emails for the student and tutor

       const tutor = await Tutor.findById(tutorId);
 
       if (!student || !tutor) {
         return res.status(404).json({
           message: "Student or tutor not found. Unable to send confirmation emails.",
         });
       }
 
       const studentEmail = student.email;
       const tutorEmail = tutor.email;
       const tutorFirstName=tutor.tutorDetails.firstName;
        const tutorLastName=tutor.tutorDetails.lastName;
        const name=tutorFirstName+" "+tutorLastName;
 
       // Send emails
       const transporter = nodemailer.createTransport({
         service: "gmail", // Use your preferred email service
         auth: {
           user: process.env.EMAIL_USER, // Your email
           pass: process.env.EMAIL_PASS, // Your email password or app password
         },
       });
 
       const studentMailOptions = {
         from: process.env.EMAIL_USER,
         to: studentEmail,
         subject: "Session Request Confirmation",
         text: `Dear ${studentUsername},\n\nYour session request with the tutor has been sent successfully.\n\nDetails:\n- Tutor: ${name}\n- Subject: ${subjectDetails.subject}\n- Time: ${timeslot.time} on ${timeslot.date} (${timeslot.timezone})\n- Duration: ${classDuration}\n\nRegards,\nEduElite Team`,
       };
 
       const tutorMailOptions = {
         from: process.env.EMAIL_USER,
         to: tutorEmail,
         subject: "New Session Request",
         text: `Dear ${name},\n\nA new session request has been sent to you by ${studentUsername}.\n\nDetails:\n- Subject: ${subjectDetails.subject}\n- Time: ${timeslot.time} on ${timeslot.date} (${timeslot.timezone})\n- Duration: ${classDuration}\n- Description: ${classDescription}\n\nPlease review and confirm the request.\n\nRegards,\nEduElite Team`,
       };
 
       await transporter.sendMail(studentMailOptions);
       await transporter.sendMail(tutorMailOptions);
 
      

      return res
        .status(200)
        .json({ message: "Session request sent successfully" });
    } catch (error) {
      console.error("Internal Server Error: ", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  } else {
    return res.status(405).json({ message: "Method not supported!" });
  }
}
