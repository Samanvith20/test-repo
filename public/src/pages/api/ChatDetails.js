import { getServerSession } from "next-auth";
import dbConnect from "./lib/mongoose";
import ChatRoom from "./models/Chat";
import { authOptions } from "./auth/[...nextauth]";
import Tutor from "./models/Tutor";
import Student from "./models/Student";
// // import Tutor from "./models/Tutor";
// // import Student from "./models/Student";



// export default async function handler(req, res) {
//   try {
//     // Connect to the database
//     await dbConnect();

//     // Extract role and sessionId from query params
//     const session = await getServerSession(req, res, authOptions);
//     const role = session.role;
//     const sessionId = session.id;
//     console.log("session3", session);

//     if (!role || !sessionId) {
//       return res.status(400).json({ error: "Missing role or sessionId" });
//     }

//     let chatRooms;
//     let chatList;

     


//     if (role === "student") {
//       // Fetch chat rooms where studentId matches sessionId
//       chatRooms = await ChatRoom.find({ studentId: sessionId });
    
//       console.log("Chat rooms fetched for student:", chatRooms);
    
//       // Fetch student details
//       const student = await Student.findById(sessionId);
      
//       // Determine the student's full name or fallback to username
//       const studentFullName = student?.studentDetails?.firstName && student?.studentDetails?.lastName
//         ? `${student.studentDetails.firstName} ${student.studentDetails.lastName}`
//         : student?.username || ''; // Use username as fallback if firstName/lastName are not present
    
//       // Prepare the response for student
//       chatList = await Promise.all(
//         chatRooms.map(async (chatRoom) => {
//           if (!chatRoom.tutorId) {
//             console.log(`No tutor found for chat room: ${chatRoom.roomId}`);
//             return null; // Skip this room or handle accordingly
//           }
          
//           // Fetch tutor details manually using tutorId
//           const tutor = await Tutor.findById(chatRoom.tutorId);
          
//           // Check if tutor exists
//           if (!tutor) {
//             console.log(`Tutor not found for roomId: ${chatRoom.roomId}`);
//             return {}; // Skip or return an empty object if tutor not found
//           }
    
//           const tutorFullName = `${tutor.tutorDetails.firstName} ${tutor.tutorDetails.lastName}`;
//           const tutorPhoto = tutor.tutorDetails.profilePicture;
    
//           // Prepare response
//           return {
//             roomId: chatRoom.roomId,
//             tutorId: tutor._id,
//             studentId: chatRoom.studentId,
//             tutorName: tutorFullName,
//             tutorPhoto: tutorPhoto,
//             studentName: studentFullName, // Add student name here with fallback
//             messages: [...chatRoom.messages],
//             latestMessage: chatRoom.messages[chatRoom.messages.length - 1]?.message,
//             latestMessageTime: chatRoom.messages[chatRoom.messages.length - 1]?.timestamp,
//           };
//         })
//       );
//     }
    
//     else if (role === "tutor") {
//       // Fetch chat rooms where tutorId matches sessionId
//       chatRooms = await ChatRoom.find({ tutorId: sessionId });
    
//       if (!chatRooms || chatRooms.length === 0) {
//         return res.status(404).json([]);
//       }
    
//       // Fetch tutor details for the current sessionId
//       const tutor = await Tutor.findById(sessionId);
      
//       // Check if tutor exists
//       if (!tutor) {
//         return res.status(404).json({ error: "Tutor not found" });
//       }
    
//       // Extract tutor's full name
//       const tutorFullName = `${tutor.tutorDetails.firstName} ${tutor.tutorDetails.lastName}`;
    
//       // Prepare the response for tutor
//       chatList = await Promise.all(
//         chatRooms.map(async (chatRoom) => {
//           if (!chatRoom.studentId) {
//             console.log(`No student found for chat room: ${chatRoom.roomId}`);
//             return null; // Skip this room or handle accordingly
//           }
    
//           // Fetch student details manually using studentId
//           const student = await Student.findById(chatRoom.studentId);
    
//           // Check if student exists
//           if (!student) {
//             console.log(`Student not found for roomId: ${chatRoom.roomId}`);
//             return {}; // Skip or return an empty object if student not found
//           }
    
//           // Extract student's full name or fallback to username
//           const studentFullName = student.studentDetails
//             ? `${student.studentDetails.firstName} ${student.studentDetails.lastName}`.trim()
//             : student.username;
    
//           const studentPhoto = student.profilePicture;
    
//           // Prepare response
//           return {
//             roomId: chatRoom.roomId,
//             tutorId: chatRoom.tutorId,
//             tutorName: tutorFullName, // Add tutor's full name
//             studentId: student._id,
//             studentName: studentFullName,
//             studentPhoto: studentPhoto,
//             messages: [...chatRoom.messages],
//             latestMessage: chatRoom.messages[chatRoom.messages.length - 1]?.message || null,
//             latestMessageTime: chatRoom.messages[chatRoom.messages.length - 1]?.timestamp || null,
//           };
//         })
//       );
//     }
    
    
//     else {
//       // If role is neither 'student' nor 'tutor'
//       return res.status(403).json({ error: "Unauthorized access" });
//     }

//     return res.status(200).json(chatList);
//   } catch (error) {
//     console.error("Error in fetching chat rooms:", error);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// }




export default async function handler(req, res) {
  try {
    // Connect to the database
    await dbConnect();

    // Extract role, sessionId, and searchTerm from query params
    const session = await getServerSession(req, res, authOptions);
    const { searchTerm } = req.query;

    const role = session.role;
    const sessionId = session.id;

    if (!role || !sessionId) {
      return res.status(400).json({ error: "Missing role or sessionId" });
    }

    let chatRooms;
    let chatList;

    if (role === "student") {
      // Fetch chat rooms where studentId matches sessionId
      chatRooms = await ChatRoom.find({ studentId: sessionId });

      const student = await Student.findById(sessionId);

      const studentFullName = student?.studentDetails?.firstName && student?.studentDetails?.lastName
        ? `${student.studentDetails.firstName} ${student.studentDetails.lastName}`
        : student?.username || '';

      chatList = await Promise.all(
        chatRooms.map(async (chatRoom) => {
          const tutor = await Tutor.findById(chatRoom.tutorId);

          if (!tutor) return null;

          const tutorFullName = `${tutor.tutorDetails.firstName} ${tutor.tutorDetails.lastName}`;
          const tutorPhoto = tutor.tutorDetails.profilePicture;

          return {
            roomId: chatRoom.roomId,
            tutorId: tutor._id,
            studentId: chatRoom.studentId,
            tutorName: tutorFullName,
            tutorPhoto: tutorPhoto,
            studentName: studentFullName,
            messages: [...chatRoom.messages],
            latestMessage: chatRoom.messages[chatRoom.messages.length - 1]?.message,
            latestMessageTime: chatRoom.messages[chatRoom.messages.length - 1]?.timestamp,
          };
        })
      );

      // Apply filter for tutorName if searchTerm is provided
      if (searchTerm) {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        chatList = chatList.filter((chat) =>
          chat.tutorName.toLowerCase().includes(lowerCaseSearchTerm)
        );
      }
     
    } else if (role === "tutor") {
      // Fetch chat rooms where tutorId matches sessionId
      chatRooms = await ChatRoom.find({ tutorId: sessionId });

      const tutor = await Tutor.findById(sessionId);

      const tutorFullName = `${tutor.tutorDetails.firstName} ${tutor.tutorDetails.lastName}`;

      chatList = await Promise.all(
        chatRooms.map(async (chatRoom) => {
          const student = await Student.findById(chatRoom.studentId);

          if (!student) return null;

          const studentFullName = student.studentDetails
            ? `${student.studentDetails.firstName} ${student.studentDetails.lastName}`.trim()
            : student.username;

          const studentPhoto = student.profilePicture;

          return {
            roomId: chatRoom.roomId,
            tutorId: chatRoom.tutorId,
            tutorName: tutorFullName,
            studentId: student._id,
            studentName: studentFullName,
            studentPhoto: studentPhoto,
            messages: [...chatRoom.messages],
            latestMessage: chatRoom.messages[chatRoom.messages.length - 1]?.message || null,
            latestMessageTime: chatRoom.messages[chatRoom.messages.length - 1]?.timestamp || null,
          };
        })
      );

      // Apply filter for studentName if searchTerm is provided
      if (searchTerm) {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        chatList = chatList.filter((chat) =>
          chat.studentName.toLowerCase().includes(lowerCaseSearchTerm)
        );
      }
    } else {
      return res.status(403).json({ error: "Unauthorized access" });
    }

    return res.status(200).json(chatList);
  } catch (error) {
    console.error("Error in fetching chat rooms:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

