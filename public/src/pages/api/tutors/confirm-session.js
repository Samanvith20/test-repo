import dbConnect from "../lib/mongoose";
import SessionRequests from "../models/SessionRequests";
import ScheduledClasses from "../models/ScheduledClasses";
import moment from "moment-timezone";
import Student from "../models/Student";
import nodemailer from "nodemailer";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import Tutor from "../models/Tutor";
import Stripe from "stripe";
import Payment from "../models/Payment";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    console.error("No session found");
    return res.status(401).json({ message: "Unauthorized" });
  }
  console.log("sessionfrom", session);
  await dbConnect();

  if (req.method === "PUT") {
    const {
      _id,
      status,
      studentUsername,

      timeslot,
      classDescription,
      subjectDetails,
      classDuration,
    } = req.body;
    console.log("timeslot", timeslot);

    console.log("tutor date::::", timeslot.date);
    let tutorId = session.id;
    // Parse the date using moment
    const parsedDate = moment(timeslot.date, "dddd MMMM DD, YYYY");
    console.log("parsedDate", parsedDate);

    // Check if the date is valid
    if (!parsedDate.isValid()) {
      console.error("Invalid date format:", timeslot.date);
      return res.status(400).json({ error: "Invalid date format" });
    }

    // Format the date as MM-DD-YYYY
    const changedDate = parsedDate.format("MM-DD-YYYY");
    console.log("changedDate", changedDate);

    try {
      // Check if class has already been scheduled
      const existingRequest = await ScheduledClasses.findOne({
        studentUsername: studentUsername,
        tutorId: tutorId,
        "timeslot.date": changedDate,
        "timeslot.time": timeslot.time,
      });
      console.log("existingRequest", existingRequest);

      const tutorExistingSlot = await ScheduledClasses.findOne({
        tutorId: tutorId,
        "timeslot.date": changedDate,
        "timeslot.time": timeslot.time,
      });
      console.log("tutorExistingSlot", tutorExistingSlot);

      if (existingRequest || tutorExistingSlot) {
        return res.status(409).json({
          message: "This class has already been scheduled.",
        });
      }

      let updatedSessionRequest = null;

      // Only attempt to update the session request if _id is provided
      if (_id) {
        updatedSessionRequest = await SessionRequests.findByIdAndUpdate(
          _id,
          { status },
          { new: true }
        );

        if (!updatedSessionRequest) {
          console.warn("Session request not found, continuing flow...");
        }
      }

      //finding student via username
      const student = await Student.findOne({ username: studentUsername });
      // console.log("student", student);

      if (!student) {
        res.status(404).json({ message: "Student not found" });
      }
      //findin tutor for tutor name
      const tutor = await Tutor.findById(tutorId);
      if (!tutor) {
        res.status(404).json({ message: "tutor not found" });
      }
      console.log("tutor", tutor);

      // Convert the timeslot date to the desired format
      // Convert the timeslot date to the desired format (MM-DD-YYYY)

      const studentEmail = student.email;
      const paymentDetails = await Payment.findOne({
        studentEmail: studentEmail,
      });
      if (!paymentDetails || !paymentDetails.defaultPaymentMethodId) {
        return res
          .status(400)
          .json({
            error: "Payment details not found or no default payment method",
          });
      }

      const cardId = paymentDetails.defaultPaymentMethodId;

      // Calculate the payment amount
      const parsedHourlyRate = tutor.tutorDetails.hourlyPrice;
      const parsedDuration = Number(classDuration.match(/\d+/)[0]);
      const amount = Math.round(parsedHourlyRate * 2 * parsedDuration);

      // Authorize payment
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100, // Amount in cents
        currency: "usd",
        payment_method: cardId,
        customer: paymentDetails.customerId,
        confirmation_method: "automatic",
        capture_method: "manual", // Authorization only
        description: `Authorization for student ${studentEmail} to book a class.`,
        payment_method_types: ["card"],
      });
      const confirmedIntent = await stripe.paymentIntents.confirm(
        paymentIntent.id
      );

      // Update the transaction details in the payment schema
      const transaction = {
        date: new Date(),
        paymentIntentId: confirmedIntent.id,
        authorizedAmount: amount,
        capturedAmount: 0,
        transactions: [
          `Authorized $${amount} for class on ${changedDate} ${timeslot.time}`,
        ],
      };

      const studentfullName =
        (student?.studentDetails?.firstName || "") +
        " " +
        (student?.studentDetails?.lastName || "");

      const tutorName =
        tutor?.tutorDetails?.firstName + " " + tutor?.tutorDetails?.lastName;

      const profilePicture = tutor?.tutorDetails?.profilePicture || "";
      const fullVideoUrl = `${tutorId}_${studentUsername}_${changedDate}_${timeslot.time}`;

      const timezoneMap = {
        Alaska: "America/Anchorage",
        Hawaii: "Pacific/Honolulu",
        Eastern: "America/New_York",
        Central: "America/Chicago",
        Mountain: "America/Denver",
        Pacific: "America/Los_Angeles",
      };

      let timezone = null;

      // Check if timeslot.timezone is provided
      if (timeslot?.timezone) {
        timezone = timezoneMap[timeslot.timezone.trim()];
        if (!timezone) {
          console.error(
            `Invalid or unsupported timezone: ${timeslot.timezone}`
          );
          return res.status(400).json({ error: "Invalid timezone provided" });
        }
      } else {
        // Fallback to tutor's timezone if available
        timezone = timezoneMap[tutor?.tutorDetails?.timezone?.trim()];
        if (!timezone) {
          console.error("Timezone not provided in timeslot or tutor details");
          return res
            .status(400)
            .json({
              error: "Timezone is required in timeslot or tutor details",
            });
        }
      }

      console.log("Using timezone:", timezone);

      // Set AcceptedTimestamp in the specified timezone
      const acceptedTimestamp = moment.tz(new Date(), timezone).format();
      console.log("acceptedTimestamp", acceptedTimestamp);

      // Create a new class only if the session request was successfully updated
      const newClass = new ScheduledClasses({
        studentUsername,
        studentFullname: studentfullName,
        tutorId,
        tutorProfilePicture: profilePicture,
        tutorName: tutorName,
        timeslot: {
          date: changedDate,
          time: timeslot?.time,
          timezone: timeslot?.timezone || tutor?.tutorDetails?.timezone?.trim(),
        },
        classDescription,
        subjectDetails: {
          subject: subjectDetails.subject,
          areaOfSubject: subjectDetails.areaOfSubject,
        },
        classDuration,
        acceptedTimestamp: acceptedTimestamp,
        videoUrlArray: fullVideoUrl,
        tutorJoinDetails: {},
        studentLeftDetails: {},
        tutorLeftDetails: {},
        transactionDetails: transaction,
      });
      console.log("newClass", newClass);

      await newClass.save();

      // Setup Nodemailer transporter
      const transporter = nodemailer.createTransport({
        service: "gmail", // or any other email service
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      // Email content for Tutor
      const tutorMailOptions = {
        from: process.env.EMAIL_USER,
        to: session?.email,
        subject: "New Class Scheduled",
        html: `
<div style="font-family: Arial, sans-serif; line-height: 1.5; background-color: #f9f9f9; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
    <h2 style="color: #000000; margin-bottom: 20px; text-align: center;">New Class Scheduled</h2>
    
    <div style="text-align: left; font-size: 1.2em; color: #000000;">
        <p style="margin: 0;"><strong>Date:</strong> ${timeslot.date}</p>
        <p style="margin: 0;"><strong>Time:</strong> ${timeslot.time}</p>
        <p style="margin: 0;"><strong>Timezone:</strong> ${
          timeslot.timezone
        }-time</p>
    </div>
    
    <div style="margin-top: 20px; text-align: left;">
        <p>Hello <strong>${tutorName || "Tutor"}</strong>,</p>
        <p>A new class has been scheduled with the following details:</p>
        
        <ul style="list-style-type: none; padding: 0;">
            <li><strong>Subject:</strong> ${subjectDetails.subject}</li>
            <li><strong>About Class:</strong> ${classDescription}</li>
            <li><strong>Student Name:</strong> ${studentUsername}</li>
        </ul>
        
        <p>Please prepare accordingly. Looking forward to a successful session!</p>
        
        <p>Best Regards,<br>Your Team</p>
    </div>
</div>


      `,
      };

      // Email content for Student
      const studentMailOptions = {
        from: process.env.EMAIL_USER,
        to: studentEmail,
        subject: "Your Class Has Been Scheduled",
        html: `
   
<div style="font-family: Arial, sans-serif; line-height: 1.5; background-color: #f9f9f9; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;" >
        <h2 style="color: #000000; margin-bottom: 20px; text-align: center;">New Class Scheduled</h2>
        
       <div style="text-align: left; font-size: 1.2em; color: #000000;">
            <p style="font-size: 1em; color: #000000; margin: 0;">
                <strong>Date:</strong> ${timeslot.date}<br>
                <strong>Time:</strong> ${timeslot.time}<br>
                <strong>Timezone:</strong> ${timeslot.timezone}-time
            </p>
        </div>
        
        <p style="margin-top: 20px;">Hello <strong>${
          studentUsername || "Student"
        }</strong>,</p>
        <p>Your class has been scheduled with the following details:</p>
        
        <ul style="list-style-type: none; padding: 0; color: #000000;">
            <li><strong>Subject:</strong> ${subjectDetails.subject}</li>
            <li><strong>About Class:</strong> ${classDescription}</li>
            <li><strong>Tutor Name:</strong> ${tutorName || "Tutor"}</li>
        </ul>
        
        <p style="margin-top: 20px;">We look forward to seeing you in class!</p>
        
        <p style="margin-top: 20px; color: #000000;">
            Best Regards,<br>
            Your Team
        </p>
        <div style="background-color: #d9864f; color: white; padding: 10px; border-radius: 8px; margin-bottom: 20px;">
    <strong>IMPORTANT:</strong> The cancellation or the rescheduleing of the class must be before 08:00 Hours from the start of the class.
</div>
    </div>


  `,
      };

      // Send emails to both tutor and student
      await transporter.sendMail(tutorMailOptions);
      await transporter.sendMail(studentMailOptions);

      res.status(200).json({
        message: "Session status updated successfully",
        updatedSessionRequest,
        clientSecret: paymentIntent.client_secret, // Send client_secret
        nextAction: paymentIntent.next_action,
      });
    } catch (error) {
      console.error("Error updating session status:", error);
      res.status(500).json({ error: "Error updating session status" });
      // send mail to student 
    }
  }
}
