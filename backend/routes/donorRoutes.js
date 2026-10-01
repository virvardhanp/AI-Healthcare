const express = require("express");
const mongoose = require("mongoose");
const Donor = require('../models/donor');

const router = express.Router();

// Fallback in-memory storage when MongoDB is connecting or offline
const fallbackDonors = [
    { _id: "demo1", name: "Rahul Sharma", bloodGroup: "O+", city: "Mumbai" },
    { _id: "demo2", name: "Ananya Patel", bloodGroup: "A+", city: "Delhi" },
    { _id: "demo3", name: "Michael Chang", bloodGroup: "B+", city: "Bangalore" },
    { _id: "demo4", name: "Sara Khan", bloodGroup: "AB+", city: "Hyderabad" },
    { _id: "demo5", name: "David Miller", bloodGroup: "O-", city: "Pune" }
];

// ==================== GET ALL DONORS ====================

router.get("/", async (req, res) => {
    try {
        if (mongoose.connection.readyState === 1) {
            const donors = await Donor.find().maxTimeMS(3000);
            return res.json(donors);
        }
        // Graceful fallback while MongoDB Atlas is connecting or IP whitelisting is pending
        res.json(fallbackDonors);
    } catch (error) {
        console.warn("MongoDB read failed, using fallback donors:", error.message);
        res.json(fallbackDonors);
    }
});

// ==================== ADD DONOR ====================

router.post("/", async (req, res) => {
    try {
        const { name, bloodGroup, city } = req.body;

        if (!name || !bloodGroup || !city) {
            return res.status(400).json({
                message: "Please fill all fields"
            });
        }

        if (mongoose.connection.readyState === 1) {
            const donor = new Donor({
                name: name,
                bloodGroup: bloodGroup,
                city: city
            });

            await donor.save();

            return res.status(201).json({
                message: "Donor added successfully",
                donor: donor
            });
        }

        // Fallback save in memory
        const tempDonor = {
            _id: "local_" + Date.now(),
            name,
            bloodGroup,
            city
        };
        fallbackDonors.unshift(tempDonor);

        res.status(201).json({
            message: "Donor registered successfully (Local fallback mode)",
            donor: tempDonor
        });

    } catch (error) {
        console.error("Error adding donor:", error.message);
        res.status(500).json({
            message: "Failed to add donor"
        });
    }
});

module.exports = router;