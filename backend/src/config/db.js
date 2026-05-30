import mongoose from "mongoose";

const LOCAL_MONGO_URI = "mongodb://127.0.0.1:27017/socialconnect";
const DEFAULT_DB_NAME = "socialconnect";

let activeConnection = {
  source: "unknown",
  isLocalFallback: false
};

const connectWithUri = async (uri, source, isLocalFallback = false) => {
  const connection = await mongoose.connect(uri, {
    dbName: process.env.MONGODB_DB || DEFAULT_DB_NAME,
    serverSelectionTimeoutMS: 5000
  });

  activeConnection = {
    source,
    isLocalFallback,
    host: connection.connection.host,
    name: connection.connection.name
  };

  console.log(`MongoDB connected: ${connection.connection.host}/${connection.connection.name}`);
};

export const getDBStatus = () => activeConnection;

export const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      if (process.env.NODE_ENV === "production") {
        throw new Error("MONGODB_URI is not set");
      }

      console.warn("MONGODB_URI is not set; using local MongoDB for development.");
      await connectWithUri(LOCAL_MONGO_URI, "local", true);
      return;
    }

    try {
      await connectWithUri(process.env.MONGODB_URI, "configured", false);
    } catch (error) {
      if (process.env.NODE_ENV === "production") {
        throw error;
      }

      console.warn(`Atlas connection failed, falling back to local MongoDB: ${error.message}`);
      console.warn("Accounts from Atlas will not be available until Atlas network access is fixed.");
      await connectWithUri(LOCAL_MONGO_URI, "local-fallback", true);
    }
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    console.error("If you are using MongoDB Atlas, make sure this machine's IP address is allowed in the Atlas network access list and that the connection string is correct.");
    process.exit(1);
  }
};
