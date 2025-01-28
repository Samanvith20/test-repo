import { getServerSession } from "next-auth"
import dbConnect from "../lib/mongoose"
import { authOptions } from "../auth/[...nextauth]"
import Tutor from "../models/Tutor"

export default async function handler(req, res) {
    await dbConnect()
    if(req.method === "POST") {
        const{subjectsTaught}=req.body
        console.log("subjectsTaught: ", subjectsTaught);
        
        const session = await getServerSession(req, res, authOptions)

        if (!session || !session.id) {
            return res.status(401).json({ message: "Unauthorized, session not found" });
        }
        try {
            const existingTutor = await Tutor.findById(session.id)

            if (!existingTutor) {
                return res.status(404).json({ message: "Tutor not found" });
            }

            existingTutor.subjectsTaught = subjectsTaught
            await existingTutor.save()

            res.status(200).json({ message: "Subjects updated successfully" });
        } catch (error) {
            console.error("Error:", error);
            res.status(400).json({
              success: false,
              message: "Error chaging subjects tutor",
              error: error.message,
            });
        }

    }
    else{
        res.status(405).json({message: "Method not allowed"})
    }
}