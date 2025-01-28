import dbConnect from "../lib/mongoose";
import Tutor from "../models/Tutor";
import multer from "multer";
import multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';

import bcrypt from "bcrypt";
import crypto from "crypto";
import sendVerificationEmail from "./nodemailer";


// Create an S3 client instance
const s3 = new S3Client({
  region: process.env.BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.USER_ACCESS_KEY,
    secretAccessKey: process.env.USER_SECRET_KEY,
  },
});

// console.log("s3", s3);

 


// Set up multer for file uploads
const upload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE, // allowing browsers to display images
    // acl: 'public-read', // Set this according to your needs (public-read/private)
    key: (req, file, cb) => {
      // This sets the file name inside the S3 bucket
      const filename = `${Date.now()}-${file.originalname}`;
      cb(null, `profiles/${filename}`); // Store all profile images under 'profiles/' directory
    },
  }),
});

// Disable default body parsing by Next.js as we need multer to handle form-data
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper function to run middleware (for multer)
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

// Helper function to send a verification email
// async function sendVerificationEmail(tutorEmail, token) {
//   const transporter = nodemailer.createTransport({
//     service: "gmail", // You can change this to your preferred service
//     auth: {
//       user: process.env.EMAIL_USER, // Your email address
//       pass: process.env.EMAIL_PASS, // Your email password or app-specific password
//     },
//   });

//   const mailOptions = {
//     from: process.env.EMAIL_USER,
//     to: tutorEmail,
//     subject: "Verify your email for EduEliteConnect",
//     html: `
//       <h1>Email Verification</h1>
//       <p>Click the link below to verify your email address:</p>
//       <a href="${process.env.BASE_URL}/tutor-email-verification?token=${token}">Verify Email</a>
//     `,
//   };

//   await transporter.sendMail(mailOptions);
// }

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "POST") {
    await runMiddleware(
      req,
      res,
      upload.fields([
        { name: "profilePicture", maxCount: 1 },
        { name: "education[0][degreeFile]", maxCount: 1 },
        { name: "education[0][certificatesFile]", maxCount: 1 },
        { name: "education[1][degreeFile]", maxCount: 1 },
        { name: "education[1][certificatesFile]", maxCount: 1 },
      ])
    );
    // console.log("req.files: ", req.files); // Log files
    // console.log("req.body: ", req.body); // Log other form data

    try {
      const {
        email,
        password,
        firstName,
        lastName,
        zipCode,
        gender,
        dob,
        age,
        experience,
        cancellationDuration,
        hourlyPrice,
        level,
        responseTime,
        availability,
        timezone,
        headline,
        about,
        agreeTerms,
        readTerms,
        socialSecurityNumber,

      } = req.body;

      // console.log("SUBJECTS TAUGHT: ", req.body.subjectsTaught);
      // console.log("Availability: ", availability);

      const existingTutor = await Tutor.findOne({ email });
      if (existingTutor) {
        return res
          .status(400)
          .json({ success: false, message: "Email is already registered." });
      }

      // we need to decode that number and save into database
      const ssnAuthorization = Buffer.from(socialSecurityNumber, 'base64').toString('ascii');
      console.log("ssnAuthorization", ssnAuthorization);
      // const encryptedSSN = encryptSSN(ssnAuthorization);
         
      const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

      // Make sure availability and timeSlot are correctly parsed from JSON strings
      const parsedAvailability = JSON.parse(availability);
      const parsedTimezone = JSON.parse(timezone);
      const parsedSubjectsTaught = JSON.parse(req.body.subjectsTaught);
      // Create a random token for email verification
      const emailVerificationToken = crypto.randomBytes(32).toString("hex");
      // Create a new tutor object
      const newTutor = new Tutor({
        email,
        password: hashedPassword,
        tutorDetails: {
          firstName,
          lastName,
          zipCode,
          gender,
          dateOfBirth: dob,
          age,
          socialSecurityNumber:ssnAuthorization ,
          experience,
          level,
          cancellationDuration,
          hourlyPrice,
          responseTime,
          availability: parsedAvailability,
          timezone: parsedTimezone,
          profilePicture: req.files["profilePicture"] && req.files["profilePicture"][0]
          ? req.files["profilePicture"][0].location || null
          : null,
          about,
          headline,
        },
        educationDetails: req.body.education.map((edu, index) => ({
          highestEducation: edu.highestEducation,
          university: edu.university,
          typeOfDegree: edu.typeOfDegree,
          uploadDegree: req.files[`education[${index}][degreeFile]`]
          ? req.files[`education[${index}][degreeFile]`][0].location || null 
          : null,
        major: edu.major,
        uploadCertificate: req.files[`education[${index}][certificatesFile]`]
          ? req.files[`education[${index}][certificatesFile]`][0].location || null
          : null,
        })),
        subjectsTaught: parsedSubjectsTaught,
        isValidated: false,
        isMailVerified: false, // Set to false until the email is verified
        emailVerificationToken, // Store the verification token
        isRulesAccepted: true,
        termsAndConditions: {
          agreeTerms: agreeTerms === "true",
          readTerms: readTerms === "true",
          ssnAuthorization: ssnAuthorization === "true",
        },
      });

      // Save tutor data to the database
      await newTutor.save();
      await sendVerificationEmail(email, emailVerificationToken);
      // Respond with success
       return res
        .status(201)
        .json({ message: "Tutor registered successfully", tutor: newTutor });
    } catch (error) {
      console.error("Error:", error);
      return  res.status(400).json({
        success: false,
        message: "Error registering tutor",
        error: error.message,
      });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
