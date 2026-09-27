const express = require("express");
const router = express.Router();

let OpenAI;
try {
    OpenAI = require("openai");
} catch (e) {
    console.warn("OpenAI package not loaded:", e.message);
}


let openaiClient = null;
if (OpenAI && process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes("your-api-key")) {
    try {
        openaiClient = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
    } catch (err) {
        console.warn("Could not instantiate OpenAI client:", err.message);
    }
}

// =========================================================================
// CLINICAL HEALTHCARE KNOWLEDGE & TRIAGE ENGINE (FALLBACK / OFFLINE BRAIN)
// =========================================================================

// Red-flag emergency indicators requiring immediate medical intervention
const EMERGENCY_KEYWORDS = [
    "chest pain", "heart attack", "can't breathe", "cannot breathe", "difficulty breathing",
    "shortness of breath", "severe bleeding", "coughing blood", "vomiting blood",
    "loss of consciousness", "passed out", "unconscious", "stroke", "face drooping",
    "slurred speech", "numbness one side", "anaphylaxis", "throat swelling", "swallowing difficulty",
    "seizure", "convulsions", "poison", "poisoning", "overdose", "suicide", "kill myself", "severe burn"
];

function checkEmergency(text) {
    const lower = text.toLowerCase();
    return EMERGENCY_KEYWORDS.some(kw => lower.includes(kw));
}

function getEmergencyResponse(userQuery) {
    return {
        reply: `🚨 **URGENT MEDICAL ALERT**

Based on your symptoms (*"${userQuery}"*), this may be a **medical emergency requiring immediate professional care**.

### Immediate Steps:
1. **Call Emergency Services Immediately**:
   - **Emergency Helpline**: Dial **112** or **911** (or your local emergency number).
   - **Ambulance Assistance**: Visit our [Emergency Support](emergency.html) section to submit an urgent request.
2. **Do Not Drive Yourself**: Have someone drive you or wait for an ambulance.
3. **If Experiencing Chest Pain**: Rest in a comfortable seated position; avoid exertion.
4. **If Experiencing Stroke Symptoms (F.A.S.T.)**:
   - **F**ace drooping
   - **A**rm weakness
   - **S**peech difficulty
   - **T**ime to call emergency services!

*Please do not delay seeking hospital emergency care. Our AI is for general informational support only.*`,
        isEmergency: true,
        provider: "healthcare-engine"
    };
}

// Clinical knowledge mapping for common healthcare queries
function generateHealthcareEngineResponse(userQuery, history = []) {
    const q = userQuery.toLowerCase().trim();

    // 1. Emergency check
    if (checkEmergency(q)) {
        return getEmergencyResponse(userQuery);
    }

    // 2. Greetings
    if (/^(hi|hello|hey|greetings|good\s*(morning|afternoon|evening)|halo)\b/i.test(q)) {
        return {
            reply: `👋 **Hello! I am Dr. Nova, your AI Healthcare Assistant.**

I'm here to provide trusted general health guidance, explain common symptoms, share wellness and nutrition tips, and direct you to emergency or blood donor resources.

**How can I assist you today?** You can ask me questions like:
- *"What should I do for a mild fever and body ache?"*
- *"How to manage a tension headache?"*
- *"Who can donate blood and what are the requirements?"*
- *"Tips for a healthy diet and hydration"*
- *"First aid steps for minor burns or cuts"*

*(Remember: I am an AI assistant and do not replace personalized advice from your doctor.)*`,
            isEmergency: false,
            provider: "healthcare-engine"
        };
    }

    // 3. Fever & Chills
    if (q.includes("fever") || q.includes("temperature") || q.includes("chills")) {
        return {
            reply: `🌡️ **Managing a Mild Fever**

A fever is your body's natural defense mechanism against infection. Normal body temperature is around 98.6°F (37°C); a fever is generally considered 100.4°F (38°C) or above.

### Recommended Home Care:
- **Stay Hydrated**: Drink plenty of water, clear broths, oral rehydration solutions, or herbal teas to replace lost fluids.
- **Rest**: Allow your body to rest and conserve energy to fight off the illness.
- **Comfortable Environment**: Wear lightweight, breathable cotton clothing and keep your room at a comfortable, cool temperature.
- **Cool Compresses**: Applying a lukewarm, damp washcloth to the forehead or back of the neck can provide comfort. Avoid cold ice baths.

### ⚠️ When to Seek Medical Attention:
- Fever exceeds **103°F (39.4°C)** in adults, or lasts longer than 3 consecutive days.
- Accompanied by severe headache, stiff neck, shortness of breath, unexplained rash, or confusion.
- In infants under 3 months with a temperature of 100.4°F (38°C) or higher.`,
            isEmergency: false,
            provider: "healthcare-engine"
        };
    }

    // 4. Cold, Cough, Flu, Sore Throat
    if (q.includes("cold") || q.includes("cough") || q.includes("sore throat") || q.includes("flu") || q.includes("congestion") || q.includes("runny nose")) {
        return {
            reply: `🤧 **Cold, Cough & Respiratory Symptoms**

Common colds and flu are viral respiratory infections. Most mild cases resolve naturally within 7 to 10 days.

### Supportive Care:
- **Warm Saltwater Gargle**: Mix 1/2 teaspoon of salt in a glass of warm water to soothe a sore throat.
- **Steam Inhalation**: Inhaling steam from a warm shower or facial steamer can help loosen nasal congestion.
- **Honey & Warm Fluids**: Warm water or herbal tea with a spoonful of honey can naturally soothe coughs *(do not give honey to children under 1 year)*.
- **Adequate Hydration & Sleep**: Drink at least 8–10 glasses of fluids daily to thin out mucus secretions.

### ⚠️ When to See a Doctor:
- Cough lasts longer than 3 weeks or produces yellow/green or bloody phlegm.
- High persistent fever or difficulty breathing/wheezing.
- Inability to swallow fluids or severe ear pain.`,
            isEmergency: false,
            provider: "healthcare-engine"
        };
    }

    // 5. Headache & Migraine
    if (q.includes("headache") || q.includes("migraine") || q.includes("head ache")) {
        return {
            reply: `🤕 **Relief for Headaches**

Headaches are often triggered by tension, dehydration, eye strain, lack of sleep, or missed meals.

### Immediate Relief Steps:
- **Hydrate Immediately**: Drink 1–2 large glasses of water; dehydration is a very common trigger.
- **Rest in a Quiet, Dark Room**: Dim the lights and minimize noise or screen exposure.
- **Cold or Warm Compress**: Place a cold pack on your forehead/temples, or a warm cloth on the back of your neck to relieve muscle tightness.
- **Gentle Massage**: Gently massage your temples, neck, and shoulders to release tension.

### ⚠️ Red Flags (Seek Immediate Care):
- Sudden, excruciating headache ("thunderclap" headache).
- Headache accompanied by fever, neck stiffness, confusion, vision changes, or numbness on one side.`,
            isEmergency: false,
            provider: "healthcare-engine"
        };
    }

    // 6. Stomach ache, Acidity, Nausea, Digestion
    if (q.includes("stomach") || q.includes("acidity") || q.includes("nausea") || q.includes("vomit") || q.includes("diarrhea") || q.includes("indigestion") || q.includes("belly")) {
        return {
            reply: `🤢 **Stomach Upset & Digestive Discomfort**

Common digestive disturbances can occur due to food sensitivity, viral gastroenteritis, acidity, or stress.

### Supportive Measures:
- **B.R.A.T. Diet**: Stick to mild, easily digestible foods like **B**ananas, **R**ice, **A**pplesauce, and **T**oast.
- **Frequent Small Sips**: Drink small sips of water, coconut water, or electrolyte solutions (ORS) to prevent dehydration if vomiting or having diarrhea.
- **Avoid Irritants**: Stay away from spicy, greasy, fried foods, dairy, caffeine, and carbonated beverages until your stomach settles.
- **Ginger or Peppermint Tea**: May naturally relieve nausea and abdominal cramping.

### ⚠️ Consult a Doctor If:
- Persistent vomiting for more than 24 hours or inability to keep fluids down.
- Blood in stool or vomit, or severe localized abdominal pain (such as lower right abdomen).
- High fever or signs of severe dehydration (dark urine, dizziness, extreme thirst).`,
            isEmergency: false,
            provider: "healthcare-engine"
        };
    }

    // 7. Blood Donation Guidance
    if (q.includes("blood") || q.includes("donor") || q.includes("donate") || q.includes("transfusion")) {
        return {
            reply: `🩸 **Blood Donation Information & Eligibility**

Donating blood saves lives! Every donation can help up to 3 patients in critical need.

### General Eligibility Criteria:
- **Age**: Generally between 18 and 65 years old (check local regulations).
- **Weight**: Typically at least 50 kg (110 lbs).
- **Hemoglobin Level**: Adequate hemoglobin level (tested prior to donation at the center).
- **Health**: You must feel healthy and well on the day of donation, free from active infections or fever.

### Preparation Tips:
- Drink an extra 16 oz (500 ml) of water before donating.
- Eat a nutritious, low-fat meal within 2–3 hours prior.
- Avoid strenuous exercise and alcohol for 24 hours after donation.

💡 **Find Donors Nearby**: You can search available donors or register yourself as a life-saving donor right on our [Blood Donor Finder](donors.html) page!`,
            isEmergency: false,
            provider: "healthcare-engine"
        };
    }

    // 8. First Aid (Burns, Cuts, Sprains)
    if (q.includes("burn") || q.includes("cut") || q.includes("wound") || q.includes("bleed") || q.includes("sprain") || q.includes("first aid")) {
        return {
            reply: `🩹 **Essential First Aid Guidelines**

### For Minor Cuts & Scrapes:
1. Wash hands with soap and water before touching the wound.
2. Apply gentle pressure with a clean cloth to stop minor bleeding.
3. Rinse wound gently with clean running water.
4. Apply a mild antiseptic ointment and cover with a sterile bandage.

### For Minor Burns (1st Degree):
1. **Cool Water**: Immediately hold the burn under cool running water for 10–15 minutes. *Never use ice or ice-cold water.*
2. **Moisturize**: Apply pure aloe vera gel or burn lotion. Do not use butter or oils.
3. **Protect**: Cover loosely with a sterile non-stick bandage. Never pop blisters.

### For Sprains & Strains (R.I.C.E.):
- **R**est: Avoid putting weight on the injured joint.
- **I**ce: Apply an ice pack wrapped in a cloth for 15–20 minutes at a time.
- **C**ompression: Wrap with an elastic bandage for support (not too tight).
- **E**levation: Elevate the injured limb above heart level to reduce swelling.`,
            isEmergency: false,
            provider: "healthcare-engine"
        };
    }

    // 9. Warm Beverages & Herbal Teas
    if (q.includes("tea") || q.includes("warm fluid") || q.includes("ginger") || q.includes("honey")) {
        return {
            reply: `☕ **Warm Fluids & Herbal Teas for Health**

Warm beverages are exceptionally therapeutic for soothing throat irritation, easing congestion, and staying hydrated.

### Recommended Choices:
- **Ginger & Honey Tea**: Ginger contains anti-inflammatory gingerols that help calm sore throats and nausea. Adding pure honey coats and soothes vocal cords.
- **Peppermint or Chamomile Tea**: Naturally caffeine-free; chamomile relaxes tension and aids restful sleep, while peppermint can ease nasal congestion and digestive cramps.
- **Warm Lemon Water**: Provides mild vitamin C and helps stimulate digestion.
- **Green Tea**: Packed with catechins (antioxidants) that support immune defense.

*Tip: Keep beverages warm rather than boiling hot to avoid scalding irritated throat tissues.*`,
            isEmergency: false,
            provider: "healthcare-engine"
        };
    }

    // 10. Nutrition, Diet & General Hydration
    if (q.includes("nutrition") || q.includes("diet") || q.includes("food") || q.includes("water") || q.includes("hydration") || q.includes("eat") || q.includes("drink") || q.includes("fluid")) {
        return {
            reply: `🥗 **Nutrition & Daily Hydration Guidelines**

A well-balanced diet fuels your immune system, boosts energy, and prevents chronic illnesses.

### Daily Dietary Balance:
- **Half Your Plate**: Colorful vegetables and fruits (rich in antioxidants, vitamins, and dietary fiber).
- **One Quarter**: Lean proteins (poultry, fish, eggs, lentils, legumes, tofu).
- **One Quarter**: Whole grains (brown rice, oats, whole wheat, quinoa) over refined carbohydrates.
- **Healthy Fats**: Moderate amounts of nuts, seeds, olive oil, and avocado.

### Hydration Rule:
- Adults should aim for **2 to 3 liters (8–10 cups)** of clean water per day.
- Increase your water intake in hot weather or during strenuous exercise.
- Check your urine color: pale straw or light yellow indicates proper hydration.`,
            isEmergency: false,
            provider: "healthcare-engine"
        };
    }

    // 10. Sleep, Fatigue & Mental Wellness
    if (q.includes("sleep") || q.includes("insomnia") || q.includes("tired") || q.includes("fatigue") || q.includes("stress") || q.includes("anxiety") || q.includes("mental")) {
        return {
            reply: `😴 **Sleep Hygiene & Stress Management**

Quality sleep and mental balance are fundamental pillars of overall health.

### Optimizing Sleep:
- **Consistent Schedule**: Go to bed and wake up at the same time every day, even on weekends.
- **Screen Curfew**: Turn off smartphones, tablets, and TVs at least 30–60 minutes before bedtime; blue light disrupts melatonin production.
- **Optimal Environment**: Keep your bedroom quiet, dark, and comfortably cool.

### Stress Reduction Techniques:
- **Box Breathing**: Inhale for 4 seconds, hold for 4 seconds, exhale for 4 seconds, and hold for 4 seconds. Repeat for 3–5 minutes.
- **Daily Physical Movement**: Even a 20-minute daily walk releases endorphins and reduces cortisol.
- **Talk It Out**: Reach out to friends, family, or a counselor when feeling overwhelmed.`,
            isEmergency: false,
            provider: "healthcare-engine"
        };
    }

    // 11. General Healthcare Fallback
    return {
        reply: `🩺 **General Healthcare Insights**

Regarding your query (*"${userQuery}"*):

While every individual situation is unique, here are essential general recommendations:
- **Monitor Your Symptoms**: Keep track of how long symptoms have persisted, their severity, and any associated changes in appetite, sleep, or temperature.
- **Stay Well Hydrated & Rested**: Hydration and adequate rest are the foundation for the body's natural recuperation.
- **Avoid Unverified Self-Medication**: Only take medications prescribed by your physician or recommended by a certified pharmacist.

**Would you like more specific information about:**
1. Common symptoms (fever, cold, headache, digestion)?
2. Finding a blood donor or emergency support?
3. Healthy lifestyle recommendations (diet, exercise, sleep)?

*⚠️ **Medical Disclaimer**: Dr. Nova provides health educational guidance and cannot provide clinical diagnosis. For any persistent, worsening, or severe symptoms, please consult a licensed medical professional.*`,
        isEmergency: false,
        provider: "healthcare-engine"
    };
}

// =========================================================================
// AI ROUTE HANDLERS
// =========================================================================

// Status / Health check for AI module
router.get("/status", (req, res) => {
    res.json({
        status: "online",
        model: openaiClient ? "OpenAI gpt-4o-mini (with Clinical Engine fallback)" : "Clinical Healthcare Intelligence Engine",
        hasApiKey: Boolean(process.env.OPENAI_API_KEY)
    });
});

// POST /api/ai/chat
router.post("/chat", async (req, res) => {
    try {
        const message = req.body && req.body.message ? String(req.body.message).trim() : "";
        const history = Array.isArray(req.body && req.body.history) ? req.body.history : [];

        if (!message) {
            return res.status(400).json({
                success: false,
                reply: "Please enter a health question or symptom description so I can assist you."
            });
        }

        console.log(`[AI Chat] Received query: "${message.substring(0, 80)}"`);

        // Check for urgent red-flag emergency first
        if (checkEmergency(message)) {
            const emergencyResp = getEmergencyResponse(message);
            return res.json({
                success: true,
                reply: emergencyResp.reply,
                isEmergency: true,
                provider: "healthcare-engine"
            });
        }

        // Try calling OpenAI if configured
        if (openaiClient) {
            try {
                // Build multi-turn context
                const messages = [
                    {
                        role: "system",
                        content: `You are Dr. Nova, an empathetic, highly knowledgeable, and professional AI Healthcare Assistant.
Your goal is to provide clear, reliable, practical, and empathetic health and wellness information.
Guidelines:
- Explain symptoms, possible non-severe causes, and practical home care/first-aid steps.
- Structure your answer with clear markdown bullet points and headings.
- If symptoms seem urgent or red-flag (e.g., chest pain, shortness of breath, sudden numbness), instruct the user to seek emergency care immediately.
- Never prescribe prescription drugs or declare definite medical diagnoses.
- Conclude with a brief reminder that this is educational advice and they should consult a physician for clinical diagnosis.`
                    }
                ];

                // Append recent history (up to last 6 turns)
                history.slice(-6).forEach(item => {
                    if (item.role && item.content) {
                        messages.push({
                            role: item.role === "user" ? "user" : "assistant",
                            content: String(item.content)
                        });
                    }
                });

                // Append current user message
                messages.push({
                    role: "user",
                    content: message
                });

                const completion = await openaiClient.chat.completions.create({
                    model: "gpt-4o-mini",
                    messages: messages,
                    max_tokens: 500,
                    temperature: 0.7
                });

                if (completion && completion.choices && completion.choices[0] && completion.choices[0].message) {
                    const aiReply = completion.choices[0].message.content;
                    return res.json({
                        success: true,
                        reply: aiReply,
                        isEmergency: false,
                        provider: "openai"
                    });
                }
            } catch (openAiError) {
                console.warn(`[AI Chat] OpenAI API request failed (${openAiError.message}). Seamlessly engaging Clinical Engine fallback.`);
                // Fall through to Clinical Healthcare Engine fallback below
            }
        }

        // Fallback: Clinical Healthcare Intelligence Engine
        const engineResult = generateHealthcareEngineResponse(message, history);
        return res.json({
            success: true,
            reply: engineResult.reply,
            isEmergency: engineResult.isEmergency,
            provider: engineResult.provider
        });

    } catch (err) {
        console.error("[AI Chat] Server error:", err);
        // Even if unexpected error occurs, provide a graceful recovery message
        return res.json({
            success: true,
            reply: `Hello! I encountered a momentary processing hiccup, but I am here to help.

For general health inquiries, you can ask about:
- **Symptoms**: Fever, cold, cough, headache, digestive upset
- **First Aid**: Minor cuts, burns, sprains
- **Donations**: Blood donor eligibility & requirements
- **Lifestyle**: Balanced diet, sleep, and hydration

*If this is a medical emergency, please call **112** or **911** immediately.*`,
            isEmergency: false,
            provider: "healthcare-engine"
        });
    }
});

module.exports = router;