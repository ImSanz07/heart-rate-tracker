import { NextResponse } from "next/server";
import mongoose from "mongoose";

// MongoDB connection setup
const mongoURI = 'mongodb+srv://Access_DB:password1234@cluster0.trwxd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Heartbeat schema
const heartbeatSchema = new mongoose.Schema({
    heartRate: Number,
    timestamp: Date
});

const Heartbeat = mongoose.models.Heartbeat || mongoose.model('Heartbeat', heartbeatSchema);

// Connect to MongoDB
async function connectToMongoDB() {
    if (mongoose.connection.readyState === 0) {
        try {
            await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
            console.log("Connected to MongoDB");
        } catch (error) {
            console.error("MongoDB connection error:", error);
            throw new Error("Database connection error");
        }
    }
}

export async function GET() {
    try {
        // Connect to MongoDB
        await connectToMongoDB();

        // Fetch the latest heartbeat data
        const latestHeartbeat = await Heartbeat.findOne().sort({ timestamp: -1 });

        if (latestHeartbeat) {
            return NextResponse.json({ heartRate: latestHeartbeat.heartRate }, { status: 200 });
        } else {
            return NextResponse.json({ message: "No heartbeat data found" }, { status: 404 });
        }
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
