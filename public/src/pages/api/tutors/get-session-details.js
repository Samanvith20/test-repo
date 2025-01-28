import SessionRequests from "../models/SessionRequests";
import Tutor from "../models/Tutor";
import { getServerSession } from "next-auth";
import dbConnect from "../lib/mongoose";
import { authOptions } from "../auth/[...nextauth]";


export default async function handler(req, res) {

  const session = await getServerSession(req,res,authOptions)
 
  if (!session) {
    console.error("No session found");
    return res.status(401).json({ message: "Unauthorized" });
}

 
   // Decode query parameters to remove % symbols
   const { name, slotTime, slotDate,timezone } = req.query;
   console.log("slotTime::",slotTime);
   
   console.log("slotDate::",slotDate);
   

   const decodedName = decodeURIComponent(name);
   const decodedSlotTime = decodeURIComponent(slotTime);
   const decodedSlotDate = decodeURIComponent(slotDate);
   const decodedTimezone = decodeURIComponent(timezone);
    console.log("decodedtime::",decodedSlotTime);
    console.log("decodedDate::",decodedSlotDate);
    

 





  if (req.method === "GET") {
    await dbConnect()

  try {
    const student = await SessionRequests.findOne({ 
      studentUsername: decodedName,
      'timeslot.time': decodedSlotTime,
      'timeslot.date': decodedSlotDate,
      tutorId:session?.id,
 


    });

      // Check if student was found
      if (!student) {
        return res.status(404).json({ message: "Session request not found" });
      }
    
    const tutor = await Tutor.findById(student.tutorId).select(
      "hourlyPrice tutorDetails"
    ); // Adjust the field selection as needed

    if (!tutor) {
      return res.status(404).json({ message: "Tutor is not found" });
    }


    const responseData = {
      student,
      tutorHourlyPrice: tutor.hourlyPrice,
      tutorDetails: tutor.tutorDetails, 
    };

 
    res.status(200).json(responseData);
  } catch (error) {
    console.log("error:", error);
    res.status(500).json({ message: "An error occured" });
  }
}
}
