import { getServerSession } from "next-auth";
import dbConnect from "../lib/mongoose";
import Tutor from "../models/Tutor";

import { authOptions } from "../auth/[...nextauth]";
import multer from "multer";
import multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';

// Set up multer for file uploads
const s3 = new S3Client({
  region: process.env.BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.USER_ACCESS_KEY,
    secretAccessKey: process.env.USER_SECRET_KEY,
  },
});

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


export default async function handler(req, res) {
  await dbConnect();

  const session = await getServerSession(req, res, authOptions);

  // Check if session exists
  if (!session || !session.id) {
    return res.status(401).json({ message: "Unauthorized, session not found" });
  }

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
    console.log("req.files: ", req.files); // Log files
    console.log("req.body: ", req.body); // Log other form data

    try {
      const {
        gender,
        dateOfBirth,
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
      } = req.body;


      //   console.log("Body: ", req.body)
      //   console.log("Files: ", req.files);

      const existingTutor = await Tutor.findById(session.id);
      if (!existingTutor) {
        return res
          .status(400)
          .json({ success: false, message: "Tutor not found" });
      }
      const socialSecurityNumber = existingTutor.tutorDetails.socialSecurityNumber;
      console.log("Social Security Number: ", socialSecurityNumber);

      // Parse availability and timezone only if they are defined
      const parsedAvailability = availability ? JSON.parse(availability) : [];
      const parsedTimezone =
        timezone && timezone !== "undefined" ? timezone : "";

      // Update only the fields you want to change
      existingTutor.tutorDetails.gender =
        gender || existingTutor.tutorDetails.gender;
      existingTutor.tutorDetails.dateOfBirth =
        dateOfBirth || existingTutor.tutorDetails.dateOfBirth;
      existingTutor.tutorDetails.age = age || existingTutor.tutorDetails.age;
      existingTutor.tutorDetails.experience =
        experience || existingTutor.tutorDetails.experience;
      existingTutor.tutorDetails.level =
        level || existingTutor.tutorDetails.level;
      existingTutor.tutorDetails.cancellationDuration =
        cancellationDuration || existingTutor.tutorDetails.cancellationDuration;
      existingTutor.tutorDetails.hourlyPrice =
        hourlyPrice || existingTutor.tutorDetails.hourlyPrice;
      existingTutor.tutorDetails.responseTime =
        responseTime || existingTutor.tutorDetails.responseTime;
      existingTutor.tutorDetails.availability = parsedAvailability;
      existingTutor.tutorDetails.timezone =
        parsedTimezone || existingTutor.tutorDetails.timezone;

        existingTutor.tutorDetails.profilePicture = req.files["profilePicture"] && req.files["profilePicture"][0]
        ? req.files["profilePicture"][0].location || null
        : existingTutor.tutorDetails.profilePicture;
      
      existingTutor.tutorDetails.about =
        about || existingTutor.tutorDetails.about;
      existingTutor.tutorDetails.headline =
        headline || existingTutor.tutorDetails.headline;
        existingTutor.tutorDetails.socialSecurityNumber = socialSecurityNumber;

      // Update education details if provided
      if (req.body.education) {
        existingTutor.educationDetails = req.body.education.map(
          (edu, index) => ({
            highestEducation:
              edu.highestEducation ||
              existingTutor.educationDetails[index]?.highestEducation,
            university:
              edu.university ||
              existingTutor.educationDetails[index]?.university,
            typeOfDegree:
              edu.typeOfDegree ||
              existingTutor.educationDetails[index]?.typeOfDegree,
              uploadDegree: req.files[`education[${index}][degreeFile]`] &&
              req.files[`education[${index}][degreeFile]`][0]
                ? req.files[`education[${index}][degreeFile]`][0].location || null
                : existingTutor.educationDetails[index]?.uploadDegree,
            major: edu.major || existingTutor.educationDetails[index]?.major,
            uploadCertificate: req.files[`education[${index}][certificatesFile]`] &&
            req.files[`education[${index}][certificatesFile]`][0]
              ? req.files[`education[${index}][certificatesFile]`][0].location || null
              : existingTutor.educationDetails[index]?.uploadCertificate,
          
          })
        );
      }

      console.log('Existing Tutor: ', existingTutor)

      // Save tutor data to the database
      await existingTutor.save();

      // Respond with success
       return res.status(201).json({ message: "Tutor details updated  successfully" });
    } catch (error) {
      console.error("Error:", error);
       return res.status(400).json({
        success: false,
        message: "Error registering tutor",
        error: error.message,
      });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
