import { getServerSession } from "next-auth";
import dbConnect from "../lib/mongoose";
import { authOptions } from "../auth/[...nextauth]";
import CompletedClasses from "../models/CompletedClasses";

export default async function handler(req, res) {
    await dbConnect();
      const session=await getServerSession(req, res,authOptions);

      if(!session){
          return res.status(401).json({message:"Unauthorized"});
      }
      console.log("Session",session);
      const username=session.username;
        console.log("Username",username); 
        
    try {
         const completedClasses=await CompletedClasses.find({
            studentUsername:username
         }).sort({createdAt:-1});
         console.log("completedClasses",completedClasses);
         
         if(completedClasses){
            // const videoRecordingUrls=completedClasses.map((completedClass)=>{
            //     return completedClass?.videoRecordingUrl;
            // })
            console.log("videoRecordingUrls",videoRecordingUrls);
             return res.status(200).json({completedClasses});
         }else{
                return res.status(404).json({message:"No completed classes found"});
         }

    } catch (error) {
         return res.status(500).json({message:"Internal Server Error"});
    }
}