require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/database");

const app = express();


// ======================================================
// DATABASE
// ======================================================

connectDB();


// ======================================================
// MIDDLEWARE
// ======================================================

app.use(cors());

app.use(express.json());


// ======================================================
// ROUTES
// ======================================================

// -------------------- Authentication --------------------

const authRoutes = require("./routes/authRoutes");

app.use("/api/auth", authRoutes);


// -------------------- Blood Donors --------------------

const donorRoutes = require("./routes/donorRoutes");

app.use("/api/donors", donorRoutes);


// -------------------- AI Assistant --------------------

const aiRoutes = require("./routes/aiRoutes");

app.use("/api/ai", aiRoutes);


// -------------------- Emergency Support --------------------

const emergencyRoutes = require("./routes/emergencyRoutes");

app.use("/api/emergency", emergencyRoutes);


// -------------------- Healthcare Information --------------------

const healthRoutes = require("./routes/healthRoutes");

app.use("/api/health", healthRoutes);


// ======================================================
// HOME ROUTE
// ======================================================

app.get("/", (req, res) => {

    res.send("AI Healthcare Backend is Working!");

});


// ======================================================
// HEALTH CHECK
// ======================================================

app.get("/api/health-check", (req, res) => {

    res.json({

        success: true,

        message: "Healthcare API is working successfully"

    });

});


// ======================================================
// SERVER
// ======================================================

const PORT = 5000;

app.listen(PORT, () => {

    console.log(
        `Server running at http://localhost:${PORT}`
    );

});