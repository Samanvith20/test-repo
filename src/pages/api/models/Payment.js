import mongoose from "mongoose";



// card details schema
const cardDetailsSchema = new mongoose.Schema({
  last4: { type: String },
  brand: { type: String },
  paymentId: { type: String,required:true },
});
// Payment details schema
const paymentDetailsSchema = new mongoose.Schema(
  {
    studentEmail: { type: String, required: true },

    customerId: { type: String },
    
    cards: { type: [cardDetailsSchema] },
    defaultPaymentMethodId: { type: String },
    
    paymentStatus: { type: String },
  },
  { timestamps: true }
);
const Payment =
  mongoose.models.Payment || mongoose.model("Payment", paymentDetailsSchema);

export default Payment;
