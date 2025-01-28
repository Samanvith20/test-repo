import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import dbConnect from "../lib/mongoose";
import Student from "../models/Student";

export default async function handler(req, res) {
  //Connected to MongoDb
  await dbConnect();

  const session = await getServerSession(req, res, authOptions);

  // Check if session exists
  if (!session || !session.id) {
    return res.status(401).json({ message: "Unauthorized, session not found" });
  }

  //  only allow GET request
  if (req.method === "GET") {
    try {
      const student = await Student.findById(session.id);
      // console.log("studentFound", student);

      // if Student not Exist

      if (!student) {
        return res.status(401).json({
          message: "Student not found",
        });
      }

      // return Student
      return res.status(200).json({
        message: "Student found",
        student,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
  //  only allow POST request
  if (req.method === "POST") {
    try {
      const {
        firstName,
        lastName,
        address,
        phoneNumber,
        email,
        country,
        state,
      } = req.body;

      // checking user exist
      const existingStudent = await Student.findById(session.id);

      console.log("existingStudent ", existingStudent);
      // not exist user
      if (!existingStudent) {
        return res.status(404).json({ message: "Student not found" });
      }

      // Ensure studentDetails exists, if not initialize it
      if (!existingStudent.studentDetails) {
        existingStudent.studentDetails = {}; // Creating studentDetails if it doesn't exist
      }

      // Update only the fields that are provided
      if (firstName )
        existingStudent.studentDetails.firstName = firstName;
      if (lastName)
        existingStudent.studentDetails.lastName = lastName;
      if (address)
        existingStudent.studentDetails.address = address;
      if (phoneNumber)
        existingStudent.studentDetails.phoneNumber = phoneNumber;
      if (country)
        existingStudent.studentDetails.country = country;
      if (email ) existingStudent.studentDetails.email = email;
      if (state) existingStudent.studentDetails.state = state;

      // Save the updated student details
      await existingStudent.save();

      // console.log("existingStudent", existingStudent);
      return res
        .status(200)
        .json({ message: "Student details added", student: existingStudent });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
}
