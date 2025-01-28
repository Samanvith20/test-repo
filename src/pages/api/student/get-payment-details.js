import { getServerSession } from "next-auth";
import dbConnect from "../lib/mongoose";
import { authOptions } from "../auth/[...nextauth]";
import Payment from "../models/Payment";


export default async function handler(req, res) {

    await dbConnect();
     // Get session information
        const session = await getServerSession(req, res, authOptions);
    
        // Check if session exists
        if (!session || !session.id) {
          return res.status(401).json({ message: "Unauthorized, session not found" });
        }
        const email = session.email;
        try {
            const paymentDetails = await Payment.findOne({studentEmail: email});
            if(!paymentDetails){
                return res.status(404).json({message: "Payment details not found"});
            }
            return res.status(200).json({paymentDetails});
            
        } catch (error) {
            return res.status(500).json({message: "Internal server error"});
        }
}