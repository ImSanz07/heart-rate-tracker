const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const port = 4000;

// Middleware to parse JSON request bodies
app.use(express.json()); // Add this line

let baseHeartRate = 70;
let lastUpdateTime = Date.now();

// MongoDB connection setup
const mongoURI = 'mongodb+srv://Access_DB:password1234@cluster0.trwxd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connected to MongoDB"))
    .catch((error) => console.error("MongoDB connection error:", error));

// Use CORS middleware
app.use(cors()); // Enable CORS for all routes

// Define a Heartbeat schema and model
const heartbeatSchema = new mongoose.Schema({
    heartRate: Number,
    timestamp: { type: Date, default: Date.now },
});

const Heartbeat = mongoose.model('Heartbeat', heartbeatSchema);

// Heart rate generator function
function getRealisticHeartRate() {
    const currentTime = Date.now();
    const timeDiff = (currentTime - lastUpdateTime) / 1000; // Time difference in seconds
    lastUpdateTime = currentTime;

    // Gradual change in base heart rate
    baseHeartRate += (Math.random() - 0.5) * timeDiff;
    baseHeartRate = Math.max(60, Math.min(100, baseHeartRate)); // Keep base rate between 60 and 100

    // Occasional spikes
    const spikeChance = Math.random();
    let heartRate = baseHeartRate;

    if (spikeChance < 0.1) { // 10% chance of a spike
        const spikeAmount = Math.random() * 20 + 10; // Spike between 10 and 30 bpm
        heartRate += spikeAmount;
    }

    // Add some noise
    heartRate += (Math.random() - 0.5) * 5;

    // Ensure heart rate stays within realistic bounds
    heartRate = Math.max(45, Math.min(180, heartRate));

    return Math.round(heartRate);
}

// Function to generate and save heartbeat data every 10 seconds
// function startHeartRateSimulation() {
//     setInterval(async () => {
//         const heartRate = getRealisticHeartRate();
//         const heartbeatData = new Heartbeat({ heartRate, timestamp: new Date() });

//         try {
//             await heartbeatData.save();
//             console.log(`Generated Heart Rate: ${heartRate} - Saved to MongoDB`);
//         } catch (error) {
//             console.error("Error saving to MongoDB:", error);
//         }
//     }, 10000); // 10 seconds interval
// }

// Endpoint to get the latest heartbeat data (optional)
app.get('/heartbeat', async (req, res) => {
    console.log("Getting latest heartbeat data...");
    try {
        const latestHeartbeat = await Heartbeat.findOne().sort({ timestamp: -1 });
        if (latestHeartbeat) {
            res.json(latestHeartbeat);
        } else {
            res.status(404).json({ message: "No heartbeat data found" });
        }
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Endpoint to add new Heartbeat
app.post('/sensor/heartbeat', async (req, res) => {
    console.log("Adding new heartbeat data...");
    const { heartRate } = req.body; // Make sure heartRate is extracted from the body
    if (!heartRate) {
        return res.status(400).json({ error: "Heart rate is required" });
    }
    try {
        const heartbeatData = new Heartbeat({ heartRate, timestamp: new Date() });
        await heartbeatData.save(); // Save heartbeat data to MongoDB
        res.json({ message: "Heartbeat data added successfully" });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Sensor simulator running on http://localhost:${port}`);
    // startHeartRateSimulation(); // Uncomment to start generating heart rate data every 10 seconds
});
