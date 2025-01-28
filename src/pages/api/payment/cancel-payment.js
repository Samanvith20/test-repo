import dbConnect from "../lib/mongoose";
import Payment from "../models/Payment";

export default async function handler(req, res) {
    await dbConnect();
   if(req.method==='POST'){
    const{email}=req.body;
    const paymentDetails=await Payment.findOne({ studentEmail: email });
  
    // retrive the paymentIntentId from the database
    const  paymentIntentId=paymentDetails.paymentIntentId;
  
    try {
      const canceledIntent = await stripe.paymentIntents.cancel(paymentIntentId);
      if(canceledIntent){
      return res.status(200).json({ message: 'Authorization canceled.' });
      }else{
        return res.status(404).json({ error: 'PaymentIntent not found.' });
      }
    } catch (error) {
      console.error('Error canceling authorization:', error.message);
      return res.status(500).json({ error: error.message });
    }
  }else{
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
  