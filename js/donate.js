// ===============================
// DONATE PAGE LOGIN CHECK
// ===============================

async function initializeDonatePage() {

    const {
        data: { user },
        error
    } = await supabaseClient.auth.getUser();


    // ===============================
    // USER NOT LOGGED IN
    // ===============================

    if (error || !user) {

        alert("Please login to donate food.");

        window.location.replace("login.html");

        return;
    }


    // ===============================
    // GET DONATION FORM
    // ===============================

    const donationForm =
        document.getElementById("donationForm");


    if (!donationForm) {
        return;
    }


    // ===============================
    // SUBMIT DONATION
    // ===============================

    donationForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            // ===============================
            // GET FORM VALUES
            // ===============================

            const foodName =
                document.getElementById("foodName").value.trim();

            const quantity =
                document.getElementById("quantity").value.trim();

            const location =
                document.getElementById("location").value.trim();

            const pickupTime =
                document.getElementById("pickupTime").value;

            const description =
                document.getElementById("description").value.trim();


            // ===============================
            // CHECK PICKUP TIME
            // ===============================

            const selectedPickupTime =
                new Date(pickupTime);

            const currentTime =
                new Date();


            if (selectedPickupTime <= currentTime) {

                alert(
                    "Please select a future pickup time."
                );

                return;
            }


            // ===============================
            // SAVE DONATION
            // ===============================

            const { error } = await supabaseClient
                .from("food_donations")
                .insert([
                    {
                        food_name: foodName,
                        quantity: quantity,
                        location: location,
                        pickup_time: selectedPickupTime.toISOString(),
                        description: description,
                        donated_by: user.id,
                        status: "available"
                    }
                ]);


            // ===============================
            // CHECK ERROR
            // ===============================

            if (error) {

                console.log(
                    "Donation error:",
                    error
                );

                alert(
                    "Donation failed: " +
                    error.message
                );

                return;
            }


            // ===============================
            // SUCCESS
            // ===============================

            alert(
                "Food donated successfully! 🍱"
            );


            donationForm.reset();

        }
    );
}


// ===============================
// START DONATE PAGE
// ===============================

initializeDonatePage();