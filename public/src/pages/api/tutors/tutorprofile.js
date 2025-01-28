import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import dbConnect from "../lib/mongoose";
import Tutor from "../models/Tutor";

export default async function handler(req, res) {
  await dbConnect();
  const session = await getServerSession(req, res, authOptions);

  // Check if session exists
  if (!session || !session.id) {
    return res.status(401).json({ message: "Unauthorized, session not found" });
  }
  if (req.method === "GET") {
    try {
      console.log("Tutor ID: ", session.id);

      const tutor = await Tutor.findById(session.id);
      if (!tutor) {
        return res.status(401).json({ message: "Tutor not found" });
      }
      return res.status(200).json({ message: "Tutor found", tutor });
    } catch (error) {
      console.error("Error:", error);
      res
        .status(500)
        .json({
          message: "Error fetching tutor profile",
          error: error.message,
        });
    }
  }
}
