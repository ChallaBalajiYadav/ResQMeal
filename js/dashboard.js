// ===============================
// CHECK LOGIN
// ===============================

async function checkDashboardUser() {

    const {
        data: { user }
    } = await supabaseClient.auth.getUser();

    return user;
}


// ===============================
// LOGOUT BUTTON
// ===============================

const logoutBtn =
    document.getElementById("logoutBtn");


async function setupLogout() {

    const user = await checkDashboardUser();


    if (!user) {

        if (logoutBtn) {
            logoutBtn.style.display = "none";
        }

        return;
    }


    if (logoutBtn) {

        logoutBtn.style.display = "block";


        logoutBtn.addEventListener(
            "click",
            async function () {

                const { error } =
                    await supabaseClient.auth.signOut();


                if (error) {

                    alert(error.message);

                    return;
                }


                window.location.replace(
                    "login.html"
                );

            }
        );
    }
}


setupLogout();


// ===============================
// DASHBOARD STATISTICS
// ===============================

async function loadDashboardStats() {

    const {
        data: donations,
        error
    } = await supabaseClient

        .from("food_donations")

        .select("id, claimed, quantity");


    if (error) {

        console.log(
            "Dashboard error:",
            error
        );

        return;
    }


    const totalDonations =
        donations.length;


    const claimedFoods =
        donations.filter(function (food) {

            return food.claimed === true;

        });


    const totalClaimed =
        claimedFoods.length;


    const foodDonationsElement =
        document.getElementById(
            "foodDonations"
        );


    const mealsRescuedElement =
        document.getElementById(
            "mealsRescued"
        );


    const peopleHelpedElement =
        document.getElementById(
            "peopleHelped"
        );


    if (foodDonationsElement) {

        foodDonationsElement.textContent =
            totalDonations;

    }


    if (mealsRescuedElement) {

        mealsRescuedElement.textContent =
            totalClaimed;

    }


    if (peopleHelpedElement) {

        peopleHelpedElement.textContent =
            totalClaimed;

    }
}


// Load statistics

loadDashboardStats();