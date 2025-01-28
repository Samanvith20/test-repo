import Stripe from "stripe";
import Payment from "../models/Payment";
import dbConnect from "../lib/mongoose";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
 console.log("stripeSecretKey",process.env.STRIPE_SECRET_KEY);
export default async function handler(req, res) {
  await dbConnect();
  if (req.method === "POST") {
    const { email } = req.body;

    try {
      // Check if a customer already exists in the database
      let paymentDetails = await Payment.findOne({ studentEmail: email });
      console.log("Payment details found:", paymentDetails);
      let customer;
      if (paymentDetails) {
        // Customer already exists, use the existing 
        
        customer = await stripe.customers.retrieve(paymentDetails.customerId);
        console.log("Existing customer retrieved:", customer);
      } else {
        // Create a new customer in Stripe
        customer = await stripe.customers.create({
          email,
        });
        console.log("New customer created:", customer);

        // Save new customer to the database
        paymentDetails = new Payment({
          studentEmail: email,
          customerId: customer.id,
        });
        await paymentDetails.save();
        console.log("New payment record saved:", paymentDetails);
      }

      // Create a SetupIntent to save the payment method for the existing or new customer
      const setupIntent = await stripe.setupIntents.create({
        customer: customer.id,
        payment_method_types: ["card"],
      });
      console.log("SetupIntent created:", setupIntent);

      // Update the payment record with the latest clientSecret
      paymentDetails.clientSecret = setupIntent.client_secret;
      await paymentDetails.save();

      // Return the clientSecret to the frontend
      res.status(200).json({ clientSecret: setupIntent.client_secret });
    } catch (error) {
      console.error("Error occurred:", error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}
