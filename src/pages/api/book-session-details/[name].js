// import SessionRequests from "../models/SessionRequests";
// import Tutor from "../models/Tutor";

// export default async function handler(req, res) {
//   const { name } = req.query;

//   try {
//     const student = await SessionRequests.findOne({ studentUsername: name });
//     console.log("student", student);
//     // Find the tutor details based on the tutorId in the student session request
//     const tutor = await Tutor.findById(student.tutorId).select(
//       "hourlyPrice tutorDetails"
//     ); // Adjust the field selection as needed

//     if (!tutor) {
//       return res.status(404).json({ message: "Tutor is not found" });
//     }

//     // Prepare the response data
//     const responseData = {
//       student,
//       tutorHourlyPrice: tutor.hourlyPrice,
//       tutorDetails: tutor.tutorDetails, // Include any other tutor details if needed
//     };

//     // Send the combined response
//     res.status(200).json(responseData);
//   } catch (error) {
//     console.log("error:", error);
//     res.status(500).json({ message: "An error occured" });
//   }
// }
