import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import dbConnect from "../lib/mongoose";
import ScheduledClasses from "../models/ScheduledClasses";
import moment from "moment-timezone";
import CompletedClasses from "../models/CompletedClasses";
import Tutor from "../models/Tutor";
import stripe from "stripe";
import Student from "../models/Student";
import Payment from "../models/Payment";
import nodemailer from "nodemailer";

const stripeClient = stripe(process.env.STRIPE_SECRET_KEY);

const timezoneMap = {
  Alaska: "America/Anchorage",
  Hawaii: "Pacific/Honolulu",
  Eastern: "America/New_York",
  Central: "America/Chicago",
  Mountain: "America/Denver",
  Pacific: "America/Los_Angeles",
};

const sendEmail = async (to, subject, html) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: `EduEliteConnect <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error.message);
  }
};

const calculateLessonPrice = (durationInSeconds, hourlyPrice) => {
  if (!hourlyPrice) return 0;
  const fractionalHours = durationInSeconds / 3600;
  return Math.round(fractionalHours * hourlyPrice * 100) / 100;
};

const processPayment = async (paymentIntentId, transactionDetails, amountToCaptureInCents, email, subject, message) => {
  try {
    // Use only essential data for logging
    console.log("Processing payment for:", {
      paymentIntentId,
      authorizedAmount: transactionDetails.authorizedAmount,
    });

    const capturedPayment = await stripeClient.paymentIntents.capture(paymentIntentId, {
      amount_to_capture: amountToCaptureInCents,
    });

    console.log(`Payment captured: $${amountToCaptureInCents / 100}`);

    transactionDetails.capturedAmount = amountToCaptureInCents / 100;
    transactionDetails.transactions.push(`Captured: $${amountToCaptureInCents / 100}`);
    transactionDetails.status = "completed";

    await sendEmail(email, subject, message);
    return capturedPayment;
  } catch (error) {
    console.error(`Error capturing payment: ${error.message}`);
    return null;
  }
};

const handleClassPayment = async (scheduledClass, tutor, student, paymentDetails) => {
  const { timeslot, transactionDetails, videos } = scheduledClass.toObject(); // Convert to plain object
  const { paymentIntentId, authorizedAmount } = transactionDetails;

  const durationInSeconds = videos?.duration || 0;
  const lessonPrice = calculateLessonPrice(durationInSeconds, tutor?.tutorDetails?.hourlyPrice);
  scheduledClass.price = lessonPrice;
  const amountToCaptureInCents = Math.round(lessonPrice * 100);

  if (!paymentIntentId || !authorizedAmount) return;

  if (lessonPrice <= authorizedAmount) {
    await processPayment(
      paymentIntentId,
      transactionDetails,
      amountToCaptureInCents,
      student.email,
      "Payment Captured",
      `<p>Your class session has been completed. We captured $${lessonPrice}.</p>`
    );
  } else {
    await processPayment(
      paymentIntentId,
      transactionDetails,
      authorizedAmount * 100,
      student.email,
      "Partial Payment Captured",
      `<p>Authorized amount of $${authorizedAmount} captured. Additional payment required.</p>`
    );

    const remainingAmount = lessonPrice - authorizedAmount;
    if (remainingAmount > 0) {
      try {
        const remainingPaymentIntent = await stripeClient.paymentIntents.create({
          amount: Math.round(remainingAmount * 100),
          currency: "usd",
          customer: paymentDetails.customerId,
          payment_method: paymentDetails.defaultPaymentMethodId,
          off_session: true,
          confirm: true,
        });

        console.log(`Remaining payment captured: $${remainingAmount}`);
        await sendEmail(
          student.email,
          "Payment Successful",
          `<p>We successfully charged $${remainingAmount} for your class session.</p>`
        );
      } catch (error) {
        console.error(`Failed to charge remaining amount: ${error.message}`);
        await sendEmail(
          student.email,
          "Payment Failed",
          `<p>Failed to charge the remaining $${remainingAmount}. Please update your payment method.</p>`
        );
      }
    }
  }
};

const processScheduledClasses = async (scheduledClasses, role) => {
  const upcomingClasses = [];

  for (const scheduledClass of scheduledClasses) {
    const plainScheduledClass = scheduledClass.toObject(); // Convert to plain object
    const { timeslot } = plainScheduledClass;
    const { date, time, timezone } = timeslot;
    const classTimezone = timezoneMap[timezone?.trim()];

    if (!classTimezone) {
      console.error(`Invalid timezone for class ${plainScheduledClass._id}`);
      upcomingClasses.push(plainScheduledClass);
      continue;
    }

    const [startTime, endTime] = time.split(" - ").map((t) => t.trim());
    const classStartTime = moment.tz(`${date} ${startTime}`, "MM-DD-YYYY HH:mm", classTimezone);
    const classEndTime = moment.tz(`${date} ${endTime}`, "MM-DD-YYYY HH:mm", classTimezone);
    const currentTimestamp = moment.tz(classTimezone);

    if (currentTimestamp.isAfter(classEndTime)) {
      const tutor = await Tutor.findById(plainScheduledClass.tutorId).lean();
      const student = await Student.findOne({ username: plainScheduledClass.studentUsername }).lean();
      const paymentDetails = await Payment.findOne({ studentEmail: student.email }).lean();

      await handleClassPayment(scheduledClass, tutor, student, paymentDetails);

      const tutorEventsExist = scheduledClass.videos?.tutorEvents?.length > 0;

      scheduledClass.classStatus = tutorEventsExist
        ? { classStatus: "Completed" }
        : { classStatus: "Abandoned" };

      await scheduledClass.save();
      const completedClass = new CompletedClasses(scheduledClass.toObject());
      await completedClass.save();
      await ScheduledClasses.findByIdAndDelete(scheduledClass._id);
    } else {
      upcomingClasses.push(plainScheduledClass);
    }
  }

  return upcomingClasses;
};

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ message: "Unauthorized" });

  const { role, id: tutorId, username: studentUsername } = session;

  if (req.method !== "GET") return res.status(405).json({ message: "Method not allowed" });

  await dbConnect();

  try {
    const scheduledClasses = role === "tutor"
      ? await ScheduledClasses.find({ tutorId })
      : await ScheduledClasses.find({ studentUsername });

    const upcomingClasses = await processScheduledClasses(scheduledClasses, role);

    return res.status(200).json({ scheduledClasses: upcomingClasses });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Error fetching scheduled classes", error: error.message });
  }
}
