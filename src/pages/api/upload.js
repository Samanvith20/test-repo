import multer from 'multer';
import multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';
import { getServerSession } from "next-auth";
import dbConnect from './lib/mongoose';
import Student from './models/Student';
import { authOptions } from './auth/[...nextauth]';


console.log("BUCKET_REGION", process.env.BUCKET_REGION);
console.log("USER_ACCESS_KEY", process.env.USER_ACCESS_KEY);
console.log("USER_SECRET_KEY", process.env.USER_SECRET_KEY);
// Create an S3 client instance
const s3 = new S3Client({
  region: process.env.BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.USER_ACCESS_KEY,
    secretAccessKey: process.env.USER_SECRET_KEY,
  },
});

// console.log("s3", s3);


// Set up multer to use S3 for storage
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
// console.log("upload", upload);


// Disable Next.js default body parsing to use multer for form-data
export const config = {
  api: {
    bodyParser: false,
  },
};

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

  if (req.method === "POST") {
    // Run multer middleware to handle the file upload
    await runMiddleware(
      req,
      res,
      upload.fields([{ name: "file", maxCount: 1 }])
    );

    // Get session information
    const session = await getServerSession(req, res, authOptions);

    // Check if session exists
    if (!session || !session.id) {
      return res.status(401).json({ message: "Unauthorized, session not found" });
    }

    // Check if the user exists
    const existingStudent = await Student.findById(session.id);

    // User does not exist
    if (!existingStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    // If a file was uploaded, it will have a 'location' property that gives the S3 URL
    const profileImageUrl = req.files["file"]
      ? req.files["file"][0].location
      : null;

    // Update the student's profile picture in the database
    existingStudent.profilePicture = profileImageUrl;
    await existingStudent.save();

    return res.status(200).json({
      message: "Profile picture uploaded successfully",
      filename: existingStudent.profilePicture,
    });
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}
