import Stripe from "stripe";
import dbConnect from "../lib/mongoose";
import Payment from "../models/Payment";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); // Correct initialization

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'POST') {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    try {
      // Retrieve payment details from the database
      const paymentDetails = await Payment.findOne({ studentEmail: email });

      if (!paymentDetails || !paymentDetails.paymentIntentId) {
        return res.status(404).json({ error: 'Payment details not found or no paymentIntentId available.' });
      }

      const paymentIntentId = paymentDetails.paymentIntentId;
      console.log("paymentIntentId: ", paymentIntentId);

      // Capture the payment using Stripe
      const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId);

      // Update the payment status in the database
      paymentDetails.paymentStatus = paymentIntent.status;
      await paymentDetails.save();

      return res.status(200).json({ message: 'Payment captured successfully.', paymentIntent });
    } catch (error) {
      console.error('Error capturing payment:', error.message);
      return res.status(500).json({ error: error.message });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
