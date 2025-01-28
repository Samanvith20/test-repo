// models/Contact.js
import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    emailAddress: {
        type: String,
        required: true,
        
        lowercase: true,
        match: [/\S+@\S+\.\S+/, 'Please provide a valid email address']
    },
    query: {
        type: String,
        required: true,
        trim: true
    },
    phoneNumber: {
        type: String,
        required: true,
        match: [/^\+?[0-9]{10,15}$/, 'Please provide a valid phone number'],
        trim: true
    }

}, { collection:"contact-us",
     timestamps: true });

// Ensure Contactus model is created only once
const Contactus = mongoose.models.Contactus || mongoose.model('Contactus', contactSchema);

export default Contactus;
