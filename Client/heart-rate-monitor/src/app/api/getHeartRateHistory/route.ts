import { NextRequest, NextResponse } from "next/server";
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

export async function GET(request: NextRequest) {
    try {
        // Connect to MongoDB
        await connectToMongoDB();

        // Get the range from query parameters
        const range = request.nextUrl.searchParams.get('range') || 'day';

        // Calculate the start date based on the range
        const now = new Date();
        let startDate = new Date();
        switch (range) {
            case 'day':
                startDate.setDate(now.getDate() - 1);
                break;
            case 'week':
                startDate.setDate(now.getDate() - 7);
                break;
            case 'month':
                startDate.setMonth(now.getMonth() - 1);
                break;
            case 'year':
                startDate.setFullYear(now.getFullYear() - 1);
                break;
            default:
                return NextResponse.json({ error: "Invalid range" }, { status: 400 });
        }

        // Fetch heart rate data
        const heartbeats = await Heartbeat.find({
            timestamp: { $gte: startDate, $lte: now }
        }).sort({ timestamp: 1 });

        // Process data
        const processedData = processHeartRateData(heartbeats, range);

        return NextResponse.json(processedData, { status: 200 });
    } catch (error) {
        console.error("Error fetching heart rate history:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

function processHeartRateData(heartbeats: any[], range: string) {
    if (range === 'day') {
        return heartbeats.map(heartbeat => ({
            label: new Date(heartbeat.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            heartRate: heartbeat.heartRate
        }));
    }

    const groupedData: { [key: string]: number[] } = {};

    heartbeats.forEach(heartbeat => {
        const date = new Date(heartbeat.timestamp);
        let key: string;

        switch (range) {
            case 'week':
                key = date.toLocaleDateString('en-US', { weekday: 'short' });
                break;
            case 'month':
                key = date.getDate().toString();
                break;
            case 'year':
                key = date.toLocaleDateString('en-US', { month: 'short' });
                break;
        }

        if (!groupedData[key]) {
            groupedData[key] = [];
        }
        groupedData[key].push(heartbeat.heartRate);
    });

    return Object.entries(groupedData).map(([label, rates]) => ({
        label,
        heartRate: Math.round(rates.reduce((sum, rate) => sum + rate, 0) / rates.length)
    }));
}