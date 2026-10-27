// ===============================
// DONATE PAGE LOGIN CHECK
// ===============================

async function initializeDonatePage() {
    let user = null;

    try {
        const {
            data,
            error
        } = await supabaseClient.auth.getUser();

        if (error || !data || !data.user) {
            alert("Please login to donate food.");
            window.location.replace("login.html");
            return;
        }

        user = data.user;
    } catch (err) {
        console.error("Auth check error:", err);
        window.location.replace("login.html");
        return;
    }

    // ===============================
    // GET DONATION FORM
    // ===============================

    const donationForm = document.getElementById("donationForm");

    if (!donationForm) {
        return;
    }

    // Set min datetime for pickup time input to now
    const pickupTimeInput = document.getElementById("pickupTime");
    if (pickupTimeInput) {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        pickupTimeInput.min = now.toISOString().slice(0, 16);
    }

    // ===============================
    // SUBMIT DONATION
    // ===============================

    donationForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const submitBtn = donationForm.querySelector('button[type="submit"]');
        const originalContent = submitBtn ? submitBtn.innerHTML : "🍱 Donate Food";

        // ===============================
        // GET FORM VALUES
        // ===============================

        const foodName = document.getElementById("foodName").value.trim();
        const quantity = document.getElementById("quantity").value.trim();
        const location = document.getElementById("location").value.trim();
        const pickupTime = document.getElementById("pickupTime").value;
        const description = document.getElementById("description").value.trim();

        // ===============================
        // CHECK PICKUP TIME
        // ===============================

        if (!pickupTime) {
            alert("Please select a pickup date and time.");
            return;
        }

        const selectedPickupTime = new Date(pickupTime);
        const currentTime = new Date();

        if (isNaN(selectedPickupTime.getTime())) {
            alert("Please select a valid pickup date and time.");
            return;
        }

        if (selectedPickupTime <= currentTime) {
            alert("Please select a future pickup time.");
            return;
        }

        // ===============================
        // VERIFY ACTIVE USER SESSION
        // ===============================

        let activeUser = user;
        try {
            const { data: authData } = await supabaseClient.auth.getUser();
            if (authData && authData.user) {
                activeUser = authData.user;
            }
        } catch (authErr) {
            console.warn("Could not refresh user session:", authErr);
        }

        if (!activeUser || !activeUser.id) {
            alert("Your login session has expired. Please log in again to donate food.");
            window.location.replace("login.html");
            return;
        }

        // ===============================
        // SAVE DONATION
        // ===============================

        try {
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = "Donating food...";
            }

            const { data: insertResult, error } = await supabaseClient
                .from("food_donations")
                .insert([
                    {
                        food_name: foodName,
                        quantity: quantity,
                        location: location,
                        pickup_time: selectedPickupTime.toISOString(),
                        description: description,
                        donated_by: activeUser.id,
                        status: "available",
                        claimed: false
                    }
                ])
                .select();

            if (error) {
                console.error("Donation error:", error);
                if (error.code === "42501") {
                    alert("Donation failed: Supabase Row-Level Security (RLS) policy blocked this insert. Please enable INSERT policy for authenticated users in Supabase SQL editor.");
                } else {
                    alert("Donation failed: " + (error.message || "Unknown database error"));
                }
                return;
            }

            alert("Food donated successfully! 🍱 Thank you for making a difference.");
            donationForm.reset();

        } catch (err) {
            console.error("Unexpected donation error:", err);
            alert("Something went wrong while submitting donation: " + (err.message || "Please try again."));
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalContent;
            }
        }
    });
}

// ===============================
// START DONATE PAGE
// ===============================

initializeDonatePage();