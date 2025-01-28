

import Tutor from "./models/Tutor";

// export default async function handler(req, res) {
//   // Ensure the method is GET
//   if (req.method === 'GET') {
//     // Extract the tutor's ID from the query parameters
//     const { id } = req.query;

//     if (!id) {
//       return res.status(400).json({ error: "Tutor ID is required" });
//     }

//     try {
//       // Find the tutor by ID, selecting only the fields we need
//       const tutor = await Tutor.findById(id).select('tutorDetails.profilePicture tutorDetails.firstName  tutorDetails.lastName');
//       console.log("tutor",tutor)
//       // If tutor is found, return the picture and name
//       if (tutor) {
//         const { profilePicture, firstName } = tutor.tutorDetails; // Extract fields from tutorDetails
//         return res.status(200).json({ pic: profilePicture, name: firstName + lastName });
//       } else {
//         return res.status(404).json({ error: "Tutor not found" });
//       }
    

//     } catch (error) {
//       console.error("Error finding tutor:", error);
//       return res.status(500).json({ error: "Server error" });
//     }
 
//   } else {
//     // Handle unsupported HTTP methods
//     return res.status(405).json({ error: "Method Not Allowed" });
//   }
// }



export default async function handler(req, res) {
  // Ensure the method is GET
  if (req.method === 'GET') {
    // Extract the tutor's ID from the query parameters
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: "Tutor ID is required" });
    }

    try {
      // Find the tutor by ID, selecting only the fields we need
      const tutor = await Tutor.findById(id).select('tutorDetails.profilePicture tutorDetails.firstName tutorDetails.lastName');

      console.log("tutor", tutor); // Check the tutor object structure in logs

      // If tutor is found, return the picture and name
      if (tutor) {
        const { profilePicture, firstName, lastName } = tutor.tutorDetails || {}; // Destructure with fallback
        if (!firstName || !lastName || !profilePicture) {
          return res.status(400).json({ error: "Tutor details are incomplete" });
        }
        return res.status(200).json({ pic: profilePicture, name: `${firstName} ${lastName}` });
      } else {
        return res.status(404).json({ error: "Tutor not found" });
      }
    } catch (error) {
      console.error("Error finding tutor:", error);
      return res.status(500).json({ error: "Server error" });
    }
  } else {
    // Handle unsupported HTTP methods
    return res.status(405).json({ error: "Method Not Allowed" });
  }
}
