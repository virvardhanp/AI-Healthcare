const express = require("express");

const router = express.Router();

// ==========================================
// HEALTHCARE INFORMATION
// ==========================================

const healthData = {

    fever: {
        title: "Fever",
        icon: "🌡️",
        category: "General Health",
        description:
            "Fever is a temporary increase in body temperature that can occur when the body responds to an infection or another condition.",

        symptoms: [
            "Increased body temperature",
            "Feeling tired or weak",
            "Sweating",
            "Chills"
        ],

        tips: [
            "Get adequate rest",
            "Drink appropriate fluids",
            "Monitor how you feel",
            "Seek medical advice if symptoms are severe or persistent"
        ],

        warning:
            "Seek professional medical help if the fever is severe, persistent, or accompanied by concerning symptoms."
    },


    cold: {
        title: "Common Cold",
        icon: "🤧",
        category: "Respiratory Health",
        description:
            "The common cold is a frequent respiratory infection that can cause symptoms such as a runny nose, sneezing, coughing, and sore throat.",

        symptoms: [
            "Runny or blocked nose",
            "Sneezing",
            "Sore throat",
            "Coughing"
        ],

        tips: [
            "Get enough rest",
            "Drink adequate fluids",
            "Maintain good hygiene",
            "Monitor your symptoms"
        ],

        warning:
            "Seek medical advice if symptoms become severe or do not improve."
    },


    headache: {
        title: "Headache",
        icon: "🤕",
        category: "General Health",
        description:
            "Headaches can have many possible causes, including tiredness, stress, dehydration, or illness.",

        symptoms: [
            "Pain or pressure in the head",
            "Sensitivity to light or sound",
            "Tiredness"
        ],

        tips: [
            "Get adequate rest",
            "Stay hydrated",
            "Take breaks from screens",
            "Maintain regular sleep habits"
        ],

        warning:
            "Repeated, severe, or unusual headaches should be discussed with a healthcare professional."
    },


    hydration: {
        title: "Hydration",
        icon: "💧",
        category: "Wellness",
        description:
            "Staying hydrated helps the body perform many normal functions.",

        symptoms: [
            "Thirst",
            "Dry mouth",
            "Tiredness",
            "Dark-colored urine"
        ],

        tips: [
            "Drink fluids regularly",
            "Drink more fluids during hot weather",
            "Drink fluids during physical activity",
            "Pay attention to signs of dehydration"
        ],

        warning:
            "Severe dehydration can require medical attention."
    },


    stress: {
        title: "Stress Management",
        icon: "🧠",
        category: "Mental Wellness",
        description:
            "Stress is a normal response to challenging situations. Healthy habits can help manage everyday stress.",

        symptoms: [
            "Feeling overwhelmed",
            "Difficulty concentrating",
            "Tiredness",
            "Changes in sleep"
        ],

        tips: [
            "Take regular breaks",
            "Maintain a healthy sleep routine",
            "Stay physically active",
            "Talk with someone you trust"
        ],

        warning:
            "If stress is significantly affecting daily life, consider speaking with a qualified healthcare professional."
    },


    "first aid": {
        title: "First Aid",
        icon: "🩹",
        category: "Emergency Care",
        description:
            "First aid means providing immediate basic assistance until appropriate professional medical help is available.",

        symptoms: [
            "Minor cuts",
            "Minor burns",
            "Sprains",
            "Small injuries"
        ],

        tips: [
            "Stay calm",
            "Assess the situation",
            "Keep the injured person safe",
            "Seek professional medical help when necessary"
        ],

        warning:
            "For a serious emergency, contact your local emergency service or seek professional medical assistance immediately."
    }

};


// ==========================================
// GET HEALTH INFORMATION
// ==========================================

router.get("/", (req, res) => {

    const topic = (req.query.topic || "")
        .toLowerCase()
        .trim();


    if (!topic) {

        return res.status(400).json({
            success: false,
            message: "Please provide a healthcare topic."
        });

    }


    // Find matching topic

    let healthInfo = null;

    for (const key in healthData) {

        if (topic.includes(key)) {

            healthInfo = healthData[key];

            break;
        }

    }


    // Topic not found

    if (!healthInfo) {

        return res.status(404).json({

            success: false,

            message: "Healthcare information not found."

        });

    }


    // Send result

    res.json({

        success: true,

        ...healthInfo

    });

});


module.exports = router;