import { getServerSession } from "next-auth";
import dbConnect from "../lib/mongoose";
import { authOptions } from "../auth/[...nextauth]";
import CompletedClasses from "../models/CompletedClasses";
import Tutor from "../models/Tutor";

export default async function handler(req, res) {
  await dbConnect();
  if (req.method === "GET") {
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.role) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const username = session.username;
    console.log("username", username);

    // Fetch completed sessions
    const Completedsessions = await CompletedClasses.find({
      studentUsername: username,
      "classStatus.classStatus": "Completed",
    });
    console.log("Completedsessions", Completedsessions);

    // Extract unique tutor IDs from the completed sessions
    const tutorIds = [...new Set(Completedsessions.map((item) => item.tutorId))];
    // console.log("tutorIds", tutorIds);

    // Fetch tutor details based on tutor IDs
    const tutorDetails = await Tutor.find({ _id: { $in: tutorIds } }).lean();
    console.log("tutorDetails", tutorDetails);
    // Map tutor details into a structured response
    const tutorsData = tutorDetails.map((tutor) => {
      return {
        tutorId: tutor._id,
        tutorDetails: tutor.tutorDetails,
        profilepicture: tutor.tutorDetails?.profilePicture || "",
        tutorname: `${tutor.tutorDetails?.firstName || ""} ${
          tutor.tutorDetails?.lastName || ""
        }`.trim(), // Combine first and last name
        subjects: tutor.subjectsTaught?.map((subject) => subject.subjectExpertise) || [],
        Completedsessions: Completedsessions
      };
    });

    // console.log("tutorsData", tutorsData);

    // Send structured data as a response
    return res.status(200).json({
      message: "Tutors fetched successfully",
      data: tutorsData,
    });
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
