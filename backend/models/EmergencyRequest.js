const mongoose = require("mongoose");

const emergencyRequestSchema = new mongoose.Schema(
    {
        requestType: {
            type: String,
            required: true
        },

        location: {
            type: String,
            required: true
        },

        description: {
            type: String,
            required: true
        },

        status: {
            type: String,
            default: "Pending"
        }
    },
    {
        timestamps: true
    }
);

const EmergencyRequest = mongoose.model(
    "EmergencyRequest",
    emergencyRequestSchema
);

module.exports = EmergencyRequest;