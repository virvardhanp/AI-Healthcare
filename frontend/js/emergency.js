const emergencyForm = document.getElementById("emergencyForm");

emergencyForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const requestType =
        document.getElementById("requestType").value;

    const location =
        document.getElementById("location").value.trim();

    const description =
        document.getElementById("description").value.trim();

    const emergencyMessage =
        document.getElementById("emergencyMessage");


    if (!requestType || !location || !description) {

        emergencyMessage.innerText =
            "Please fill all fields.";

        return;
    }


    emergencyMessage.innerText =
        "Submitting request...";


    try {

        const response = await fetch(
            "http://localhost:5000/api/emergency",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    requestType: requestType,
                    location: location,
                    description: description
                })
            }
        );


        const data = await response.json();


        if (!response.ok) {

            emergencyMessage.innerText =
                data.message || "Request failed.";

            return;
        }


        emergencyMessage.innerText =
            "Emergency support request submitted successfully.";

        emergencyForm.reset();


    } catch (error) {

        console.error(
            "Emergency connection error:",
            error
        );

        emergencyMessage.innerText =
            "Unable to connect to the server.";
    }

});