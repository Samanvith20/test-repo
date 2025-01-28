import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}


const dbConnect = async () => {
    if (cached.conn) {
        return cached.conn;
      }
    
      if (!cached.promise) {
        const opts = {
          // useCreateIndex: true, // Optional, only if you are using createIndex
          // useFindAndModify: false, // Optional, if you're using findOneAndUpdate/Remove
          bufferCommands: false,
        };
    
        cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
          return mongoose;
        });
      }
      cached.conn = await cached.promise;
      return cached.conn;
    
}

export default dbConnect;