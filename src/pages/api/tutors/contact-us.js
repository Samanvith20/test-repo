// pages/api/user.js
import dbConnect from '../lib/mongoose';
import Contactus from '../models/Contact';
export default async function handler(req, res) {
  const { method } = req;

  await dbConnect();

  switch (method) {
    case 'POST':
      try {
        const { firstName, lastName, emailAddress, query, phoneNumber } = req.body;

        // Validate input if necessary here
        const contact = new Contactus({
          firstName,
          lastName,
          emailAddress,
          query,
          phoneNumber,
        });

        await contact.save();

         return res.status(201).json({ success: true, data: contact });
      } catch (error) {
         return res.status(400).json({ success: false, error: error.message });
      }
      break;
    default:
       return res.status(405).json({ success: false, message: 'Method not allowed' });
      break;
  }
}
