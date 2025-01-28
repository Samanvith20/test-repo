import { getServerSession } from "next-auth";
import dbConnect from "../lib/mongoose";
import CompletedClasses from "../models/CompletedClasses";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "GET") {
    try {
      const session = await getServerSession(req, res, authOptions);

      console.log("session::", session);

      if (!session) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { fromDate, toDate } = req.query;
      console.log("fromDate::", fromDate);
      console.log("toDate::", toDate);

      
   
        if (isNaN(Date.parse(fromDate)) || isNaN(Date.parse(toDate))) {
          return res.status(400).json({ error: "Invalid date format." });
        }
      

      // Fetch all completed class details for the student
      const paymentDetails = await CompletedClasses.find({
        studentUsername: session.username,
        "transactionDetails.date": {
          $gte: new Date(fromDate),
          $lte: new Date(`${toDate}T23:59:59.999Z`),
        },
      });

      console.log("paymentDetails::", paymentDetails);

      if (!paymentDetails || paymentDetails.length === 0) {
        return res
          .status(404)
          .json({ error: "No completed classes found for the given date range." });
      }

      return res.status(200).json({ paymentDetails });
    } catch (error) {
      console.error("Error fetching transactions:", error);
      return res.status(500).json({ error: error.message });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed." });
  }
}
