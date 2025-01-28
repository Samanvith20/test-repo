
import ScheduledClasses from "../models/ScheduledClasses";
import dbConnect from "../lib/mongoose";

export default async function handler(req, res) {
    if (req.method === "POST") {
        await dbConnect();
        const { id, date, decodedTime, channelName } = req.body;
        
        console.log("id", id);
        console.log("date", date);
        console.log("timeslot", decodedTime);
        console.log("channelName", channelName);
        
       

        try {
            // Search for the document with the validated tutorId
            const document = await ScheduledClasses.findOne({
                tutorId: id,                       // Check if the tutorId matches the provided id
                "timeslot.date": date,             // Ensure the date matches
                "timeslot.time": decodedTime,      // Ensure the timeslot matches
                videoUrlArray: { $in: [channelName] } // Ensure the channelName exists in videoUrlArray
            });

            if (document) {
                return res.status(200).json({ success: true, message: "Match found", document });
            } else {
                return res.status(404).json({ success: false, message: "No matching record found" });
            }
        } catch (error) {
            console.error("Error in verifying class details:", error);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    } else {
        res.status(405).json({ message: "Method not allowed" });
    }
}
