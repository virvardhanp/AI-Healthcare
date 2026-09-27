const mongoose = require("mongoose");
const dns = require("dns");

// =========================================================================
// DNS RESOLUTION FIX FOR MONGODB ATLAS SRV RECORDS
// Windows local DNS often fails to resolve _mongodb._tcp SRV records (ESERVFAIL).
// Setting public reliable DNS resolvers (Google 8.8.8.8 / Cloudflare 1.1.1.1) solves this.
// =========================================================================
try {
    dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
} catch (dnsErr) {
    console.warn("Notice: Custom DNS servers could not be set:", dnsErr.message);
}

let isConnecting = false;

const connectDB = async () => {
    if (isConnecting || mongoose.connection.readyState === 1) {
        return;
    }

    isConnecting = true;
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
        console.warn("⚠️ MONGODB_URI is not defined in .env. Running in offline/in-memory mode.");
        isConnecting = false;
        return;
    }

    try {
        console.log("Connecting to MongoDB Atlas...");
        await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 6000
        });

        console.log("✅ MongoDB connected successfully");
        isConnecting = false;
    } catch (error) {
        isConnecting = false;
        console.warn("\n=======================================================");
        console.warn("⚠️  MONGODB ATLAS CONNECTION NOTICE:");
        console.warn(`    ${error.message}`);
        console.warn("\n👉  HOW TO RESOLVE ON MONGODB ATLAS:");
        console.warn("    1. Log in to https://cloud.mongodb.com/");
        console.warn("    2. Navigate to 'Network Access' (under Security)");
        console.warn("    3. Click 'Add IP Address' -> Choose 'Allow Access from Anywhere' (0.0.0.0/0)");
        console.warn("       or click 'Add Current IP Address'");
        console.warn("    4. Click 'Confirm'");
        console.warn("\n⚡  The server and AI Chatbot remain ACTIVE and working!");
        console.warn("=======================================================\n");

        // Non-blocking background retry: try reconnecting every 30 seconds
        setTimeout(() => {
            if (mongoose.connection.readyState !== 1) {
                console.log("Retrying MongoDB Atlas connection in background...");
                connectDB();
            }
        }, 30000);
    }
};

// Listen to connection status events
mongoose.connection.on("connected", () => {
    console.log("✅ MongoDB Atlas connection established.");
});

mongoose.connection.on("disconnected", () => {
    console.warn("⚠️ MongoDB disconnected. Attempting auto-reconnect...");
});

module.exports = connectDB;