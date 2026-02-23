import mongoose, { type ConnectOptions, type Mongoose } from "mongoose";
import { config } from "./env";


const MONGO_URI = config.mongoUri;

declare const global: {
    mongoose: { conn: Mongoose | null; promise: Promise<Mongoose> | null };
};

if (!MONGO_URI) {
    throw new Error("Please define the MONGODB_URI environment variable");
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose || { conn: null, promise: null };

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect(dbName: string = "virallens"): Promise<Mongoose> {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts: ConnectOptions = {
            dbName,
        };

        try {
            mongoose.set("strictQuery", false);
            cached.promise = mongoose
                .connect(MONGO_URI,
                    opts
                )
                .then((mongoose) => {
                    if (process.env.NODE_ENV === "development") {
                        console.log("Connected to MongoDB to database:", dbName);
                    }
                    return mongoose;
                });
        } catch (err) {
            console.error("Error connecting to MongoDB:", err);
            // logging.error(err)
            throw err;
        }
    }

    return cached.conn ? cached.conn : await cached.promise;
}

export default dbConnect;