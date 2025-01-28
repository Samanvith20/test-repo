

import crypto from "crypto";

const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY, "hex"); // parse 64 hex chars => 32 bytes
const IV_LENGTH = 16; // For AES, 16 bytes is typical
  console.log("ENCRYPTION_KEY", ENCRYPTION_KEY);
  
export function encryptSSN(ssn) {
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    console.log("iv", iv);
    
    const cipher = crypto.createCipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
     console.log("cipher", cipher);
     
    let encrypted = cipher.update(ssn, "utf8", "hex");
    encrypted += cipher.final("hex");
    console.log("encrypted", encrypted);
    

    // Store IV + encrypted text
    return iv.toString("hex") + ":" + encrypted;
  } catch (error) {
    console.error("Error encrypting SSN:", error);
    throw error;
  }
}

export function decryptSSN(encryptedSSN) {
  try {
    const [ivHex, encrypted] = encryptedSSN.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const decipher = crypto.createDecipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("Error decrypting SSN:", error);
    throw error;
  }
}
