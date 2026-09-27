// ==================== ADD DONOR ====================

const donorForm = document.getElementById("donorForm");

donorForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const name =
        document.getElementById("donorName").value.trim();

    const bloodGroup =
        document.getElementById("donorBloodGroup").value;

    const city =
        document.getElementById("donorCity").value.trim();

    const donorMessage =
        document.getElementById("donorMessage");


    try {

        const response = await fetch(
            "http://localhost:5000/api/donors",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    name: name,
                    bloodGroup: bloodGroup,
                    city: city
                })
            }
        );


        const data = await response.json();


        if (!response.ok) {

            donorMessage.innerText =
                data.message || "Failed to add donor.";

            return;
        }


        donorMessage.innerText =
            "Donor added successfully!";


        // Clear form
        donorForm.reset();


    } catch (error) {

        console.error(error);

        donorMessage.innerText =
            "Unable to connect to the server.";
    }

});


// ==================== SEARCH DONORS ====================

const searchButton =
    document.getElementById("searchButton");


searchButton.addEventListener("click", async function () {

    const bloodGroup =
        document.getElementById("bloodGroup").value;

    const donorList =
        document.getElementById("donorList");


    if (bloodGroup === "") {

        donorList.innerHTML =
            "<p>Please select a blood group.</p>";

        return;
    }


    donorList.innerHTML =
        "<p>Searching for donors...</p>";


    try {

        const response = await fetch(
            "http://localhost:5000/api/donors"
        );


        if (!response.ok) {

            throw new Error(
                "Failed to fetch donors"
            );
        }


        const donors =
            await response.json();


        // Filter by blood group
        const filteredDonors =
            donors.filter(function (donor) {

                return donor.bloodGroup === bloodGroup;

            });


        if (filteredDonors.length === 0) {

            donorList.innerHTML = `
                <p>
                    No available donors found for
                    <strong>${bloodGroup}</strong>.
                </p>
            `;

            return;
        }


        donorList.innerHTML = "";


        filteredDonors.forEach(function (donor) {

            const donorCard =
                document.createElement("div");

            donorCard.className = "card";


            donorCard.innerHTML = `
                <h3>${donor.name}</h3>

                <p>
                    <strong>Blood Group:</strong>
                    ${donor.bloodGroup}
                </p>

                <p>
                    <strong>City:</strong>
                    ${donor.city}
                </p>

                <p>
                    <strong>Status:</strong>
                    ${
                        donor.available
                        ? "Available"
                        : "Not Available"
                    }
                </p>
            `;


            donorList.appendChild(donorCard);

        });


    } catch (error) {

        console.error(
            "Donor search error:",
            error
        );


        donorList.innerHTML = `
            <p>
                Unable to connect to the server.
                Please try again.
            </p>
        `;
    }

});