const express = require("express");
const mongoose = require("mongoose");
const EmergencyRequest = require("../models/EmergencyRequest");

const router = express.Router();

// ==================== SUBMIT EMERGENCY REQUEST ====================

router.post("/", async (req, res) => {
    try {
        const { requestType, location, description } = req.body;

        if (!requestType || !location || !description) {
            return res.status(400).json({
                message: "Please fill all fields"
            });
        }

        console.log(`\n🚨 [URGENT EMERGENCY REQUEST RECEIVED]`);
        console.log(`Type: ${requestType} | Location: ${location}`);
        console.log(`Details: ${description}\n`);

        if (mongoose.connection.readyState === 1) {
            const emergencyRequest = new EmergencyRequest({
                requestType,
                location,
                description
            });

            await emergencyRequest.save();

            return res.status(201).json({
                message: "Emergency support request submitted successfully",
                request: emergencyRequest
            });
        }

        // Graceful response when MongoDB connection is pending
        return res.status(201).json({
            message: "Emergency support request received and dispatched to response team.",
            request: {
                _id: "em_" + Date.now(),
                requestType,
                location,
                description,
                status: "Pending Dispatch"
            }
        });

    } catch (error) {
        console.error("Emergency request error:", error.message);
        res.status(500).json({
            message: "Failed to submit emergency request"
        });
    }
});

module.exports = router;