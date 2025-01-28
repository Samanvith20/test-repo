import Stripe from "stripe";
import dbConnect from "../lib/mongoose";
import Payment from "../models/Payment";


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-08-16',
});
console.log("stripeSecretKey",process.env.STRIPE_SECRET_KEY);


export default async function handler(req, res) {
  await dbConnect();
  try {
    if (req.method === "POST") {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: "Email is required." });
      }

      const paymentDetails = await Payment.findOne({ studentEmail: email });

      if (!paymentDetails || !paymentDetails.customerId) {
        return res.status(404).json({ error: "Customer not found." });
      }

      const customerId=paymentDetails.customerId
      console.log("customerId: ", customerId);

      // Fetch the saved cards for the customer from Stripe
      const paymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type: "card",
      });

      console.log("paymentMethods: ", paymentMethods.data);


      // Update the cards in the database
      paymentDetails.cards = paymentMethods.data.map((card) => ({
        
        last4: card.card.last4,
        brand: card.card.brand,
        paymentId: card.id,
      }));

      // Optionally, set the default payment method if not already set
      if (!paymentDetails.defaultPaymentMethodId && paymentMethods.data.length > 0) {
        paymentDetails.defaultPaymentMethodId = paymentMethods.data[0].id;
      }

      await paymentDetails.save();

      // Return the saved cards to the client, including which one is default
      return res.status(200).json({ 
        paymentMethods: paymentDetails.cards,
        defaultPaymentMethodId: paymentDetails.defaultPaymentMethodId
      });
    } else {
      return res.status(405).json({ error: "Method not allowed." });
    }
  } catch (error) {
    console.error('Error fetching saved cards:', error);
    return res.status(500).json({ error: error.message });
  }
}
