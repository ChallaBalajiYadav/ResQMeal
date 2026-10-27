// ===============================
// CHECK LOGIN & AUTH
// ===============================

async function checkDashboardUser() {
    try {
        const {
            data: { user },
            error
        } = await supabaseClient.auth.getUser();

        if (error || !user) {
            return null;
        }

        return user;
    } catch (err) {
        console.error("Auth check error:", err);
        return null;
    }
}


// ===============================
// LOGOUT BUTTON & USER GREETING
// ===============================

const logoutBtn = document.getElementById("logoutBtn");

async function setupDashboardUser() {
    const user = await checkDashboardUser();

    // If current page is dashboard.html and user is not logged in, redirect
    const path = window.location.pathname.toLowerCase();
    const isDashboardPage = path.endsWith("dashboard.html") || path.endsWith("/dashboard");

    if (!user) {
        if (logoutBtn) {
            logoutBtn.style.display = "none";
        }

        if (isDashboardPage) {
            window.location.replace("login.html");
            return;
        }

        return;
    }

    // Personalized greeting if on dashboard
    const smallTitle = document.querySelector(".welcome-section .small-title");
    if (smallTitle && user) {
        const displayName = (user.user_metadata && user.user_metadata.full_name) ||
                            (user.email ? user.email.split("@")[0] : "");
        if (displayName) {
            smallTitle.textContent = `WELCOME BACK, ${displayName.toUpperCase()}`;
        }
    }

    if (logoutBtn) {
        logoutBtn.style.display = "block";

        logoutBtn.addEventListener("click", async function () {
            try {
                logoutBtn.disabled = true;
                logoutBtn.textContent = "Logging out...";

                const { error } = await supabaseClient.auth.signOut();

                if (error) {
                    alert(error.message);
                    logoutBtn.disabled = false;
                    logoutBtn.textContent = "Logout";
                    return;
                }

                window.location.replace("login.html");
            } catch (err) {
                console.error("Logout error:", err);
                window.location.replace("login.html");
            }
        });
    }
}

setupDashboardUser();


// ===============================
// DASHBOARD STATISTICS
// ===============================

async function loadDashboardStats() {
    try {
        const { data: donations, error } = await supabaseClient
            .from("food_donations")
            .select("id, status, claimed, quantity");

        if (error) {
            console.error("Dashboard stats error:", error);
            return;
        }

        const donationList = donations || [];
        const totalDonations = donationList.length;

        // Accurate claimed count considering both boolean flag and status string
        const claimedFoods = donationList.filter(function (food) {
            return food.claimed === true || food.status === "claimed";
        });

        const totalClaimed = claimedFoods.length;

        const foodDonationsElement = document.getElementById("foodDonations");
        const mealsRescuedElement = document.getElementById("mealsRescued");
        const peopleHelpedElement = document.getElementById("peopleHelped");

        if (foodDonationsElement) {
            foodDonationsElement.textContent = totalDonations;
        }

        if (mealsRescuedElement) {
            mealsRescuedElement.textContent = totalClaimed;
        }

        if (peopleHelpedElement) {
            peopleHelpedElement.textContent = totalClaimed;
        }
    } catch (err) {
        console.error("Error loading dashboard stats:", err);
    }
}

// Load statistics
loadDashboardStats();