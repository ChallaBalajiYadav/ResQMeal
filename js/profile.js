// ===============================
// PROFILE ELEMENTS
// ===============================

const profileName =
    document.getElementById("profileName");

const profileEmail =
    document.getElementById("profileEmail");

const donationCount =
    document.getElementById("donationCount");

const claimedCount =
    document.getElementById("claimedCount");

const totalImpact =
    document.getElementById("totalImpact");

const impactNumber =
    document.getElementById("impactNumber");

const donationActivity =
    document.getElementById("donationActivity");

const claimActivity =
    document.getElementById("claimActivity");


// ===============================
// LOAD PROFILE
// ===============================

async function loadProfile() {

    // Get logged-in user

    const {
        data: { user },
        error: userError
    } = await supabaseClient.auth.getUser();


    // Check login

    if (userError || !user) {

        alert("Please login to view your profile.");

        window.location.href = "login.html";

        return;
    }


    // ===============================
    // USER INFORMATION
    // ===============================

    profileName.textContent =
        user.user_metadata.full_name ||
        "ResQMeal User";

    profileEmail.textContent =
        user.email;


    // ===============================
    // GET DONATIONS
    // ===============================

    const {
        data: donations,
        error: donationError
    } = await supabaseClient
        .from("food_donations")
        .select("*")
        .eq("donated_by", user.id)
        .order("created_at", {
            ascending: false
        });


    // ===============================
    // DONATION ERROR
    // ===============================

    if (donationError) {

        console.log(
            "Donation error:",
            donationError
        );

        donationCount.textContent = "0";

        donationActivity.innerHTML = `
            <div class="empty-activity">

                <div class="empty-activity-icon">
                    ⚠️
                </div>

                <p>
                    Could not load donations.
                </p>

            </div>
        `;

    } else {

        // Donation count

        donationCount.textContent =
            donations.length;


        // ===============================
        // SHOW DONATIONS
        // ===============================

        if (donations.length === 0) {

            donationActivity.innerHTML = `
                <div class="empty-activity">

                    <div class="empty-activity-icon">
                        🍱
                    </div>

                    <p>
                        No food donations yet.
                    </p>

                </div>
            `;

        } else {

            donationActivity.innerHTML = "";


            // Show latest 3 donations

            donations
                .slice(0, 3)
                .forEach(function (food) {

                    const item =
                        document.createElement("div");

                    item.className =
                        "activity-item";


                    item.innerHTML = `

                        <div class="activity-icon">
                            🍱
                        </div>

                        <div class="activity-content">

                            <strong>
                                ${food.food_name}
                            </strong>

                            <p>
                                ${food.quantity}
                                •
                                ${food.status || "available"}
                            </p>

                        </div>

                    `;


                    donationActivity
                        .appendChild(item);

                });

        }

    }


    // ===============================
    // GET CLAIMED FOOD
    // ===============================

    const {
        data: claimedFoods,
        error: claimedError
    } = await supabaseClient
        .from("food_donations")
        .select("*")
        .eq("claimed_by", user.id)
        .order("created_at", {
            ascending: false
        });


    // ===============================
    // CLAIM ERROR
    // ===============================

    if (claimedError) {

        console.log(
            "Claim error:",
            claimedError
        );

        claimedCount.textContent = "0";

        claimActivity.innerHTML = `
            <div class="empty-activity">

                <div class="empty-activity-icon">
                    ⚠️
                </div>

                <p>
                    Could not load claims.
                </p>

            </div>
        `;

    } else {

        // Claim count

        claimedCount.textContent =
            claimedFoods.length;


        // ===============================
        // SHOW CLAIMS
        // ===============================

        if (claimedFoods.length === 0) {

            claimActivity.innerHTML = `
                <div class="empty-activity">

                    <div class="empty-activity-icon">
                        🤝
                    </div>

                    <p>
                        No food claims yet.
                    </p>

                </div>
            `;

        } else {

            claimActivity.innerHTML = "";


            // Show latest 3 claims

            claimedFoods
                .slice(0, 3)
                .forEach(function (food) {

                    const item =
                        document.createElement("div");

                    item.className =
                        "activity-item";


                    item.innerHTML = `

                        <div class="activity-icon">
                            🤝
                        </div>

                        <div class="activity-content">

                            <strong>
                                ${food.food_name}
                            </strong>

                            <p>
                                ${food.quantity}
                                • Claimed
                            </p>

                        </div>

                    `;


                    claimActivity
                        .appendChild(item);

                });

        }

    }


    // ===============================
    // TOTAL IMPACT
    // ===============================

    const donated =
        donations
            ? donations.length
            : 0;

    const claimed =
        claimedFoods
            ? claimedFoods.length
            : 0;

    const total =
        donated + claimed;


    totalImpact.textContent =
        total;

    impactNumber.textContent =
        total;

}


// ===============================
// START PROFILE
// ===============================

loadProfile();