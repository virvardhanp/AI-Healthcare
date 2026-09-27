// ==========================================
// AI HEALTHCARE - HEALTH INFORMATION
// Frontend JavaScript
// ==========================================

const API_URL = "http://localhost:5000/api/health";

// ------------------------------------------
// Search Healthcare Information
// ------------------------------------------

async function searchHealth() {

    const searchInput = document.getElementById("healthSearch");
    const result = document.getElementById("healthResult");

    const topic = searchInput.value.trim();

    // Check empty input
    if (topic === "") {

        result.innerHTML = `
            <div class="health-message warning">
                ⚠️ Please enter a healthcare topic.
            </div>
        `;

        return;
    }

    // Loading state
    result.innerHTML = `
        <div class="health-loading">
            <div class="loader"></div>
            <p>Searching healthcare information...</p>
        </div>
    `;

    try {

        // ------------------------------------------
        // Send request to backend
        // ------------------------------------------

        const response = await fetch(
            `${API_URL}?topic=${encodeURIComponent(topic)}`
        );

        // Check backend response
        if (!response.ok) {
            throw new Error("Server response was not successful");
        }

        const data = await response.json();

        // ------------------------------------------
        // Display backend response
        // ------------------------------------------

        if (data && data.success) {

            displayHealthResult(data);

        } else {

            showNotFound(topic);

        }

    } catch (error) {

        console.error("Healthcare API Error:", error);

        result.innerHTML = `
            <div class="health-message error">

                <h3>⚠️ Unable to load information</h3>

                <p>
                    The healthcare server could not be reached.
                </p>

                <p>
                    Please make sure your backend server is running
                    on <strong>http://localhost:5000</strong>.
                </p>

            </div>
        `;
    }
}


// ==========================================
// Display Healthcare Result
// ==========================================

function displayHealthResult(data) {

    const result = document.getElementById("healthResult");

    result.innerHTML = `

        <div class="health-card">

            <div class="health-card-header">

                <div class="health-icon">
                    ${data.icon || "🏥"}
                </div>

                <div>
                    <h2>${data.title || "Healthcare Information"}</h2>

                    ${
                        data.category
                        ? `<span class="health-category">
                            ${data.category}
                           </span>`
                        : ""
                    }

                </div>

            </div>


            <div class="health-card-body">

                <p>
                    ${data.description || "No description available."}
                </p>


                ${
                    data.symptoms
                    ? `

                    <div class="health-section">

                        <h3>🔍 Common Symptoms</h3>

                        <ul>

                            ${data.symptoms
                                .map(symptom => `<li>${symptom}</li>`)
                                .join("")
                            }

                        </ul>

                    </div>

                    `
                    : ""
                }


                ${
                    data.tips
                    ? `

                    <div class="health-section">

                        <h3>💡 Helpful Tips</h3>

                        <ul>

                            ${data.tips
                                .map(tip => `<li>${tip}</li>`)
                                .join("")
                            }

                        </ul>

                    </div>

                    `
                    : ""
                }


                ${
                    data.warning
                    ? `

                    <div class="health-warning">

                        ⚠️ <strong>Important:</strong>

                        <p>
                            ${data.warning}
                        </p>

                    </div>

                    `
                    : ""
                }

            </div>


            <div class="health-disclaimer">

                <strong>Medical Disclaimer:</strong>

                This information is for general educational
                purposes and does not replace professional
                medical advice.

            </div>

        </div>
    `;
}


// ==========================================
// Topic Not Found
// ==========================================

function showNotFound(topic) {

    const result = document.getElementById("healthResult");

    result.innerHTML = `

        <div class="health-message">

            <div class="not-found-icon">🔎</div>

            <h3>No information found</h3>

            <p>
                We couldn't find healthcare information for
                <strong>${topic}</strong>.
            </p>

            <p>Try searching for:</p>

            <div class="suggestion-list">

                <button onclick="quickSearch('Fever')">
                    🌡️ Fever
                </button>

                <button onclick="quickSearch('Cold')">
                    🤧 Cold
                </button>

                <button onclick="quickSearch('Headache')">
                    🤕 Headache
                </button>

                <button onclick="quickSearch('Hydration')">
                    💧 Hydration
                </button>

                <button onclick="quickSearch('Stress')">
                    🧠 Stress
                </button>

                <button onclick="quickSearch('First Aid')">
                    🩹 First Aid
                </button>

            </div>

        </div>
    `;
}


// ==========================================
// Quick Search
// ==========================================

function quickSearch(topic) {

    const searchInput = document.getElementById("healthSearch");

    searchInput.value = topic;

    searchHealth();
}


// ==========================================
// Enter Key Search
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    const searchInput = document.getElementById("healthSearch");

    if (searchInput) {

        searchInput.addEventListener("keydown", (event) => {

            if (event.key === "Enter") {

                searchHealth();

            }

        });

    }

});