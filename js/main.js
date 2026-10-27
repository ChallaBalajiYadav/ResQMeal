// ======================================
// RESQMEAL HOMEPAGE
// ======================================


// ======================================
// GET ELEMENTS
// ======================================

const mealsRescued = document.getElementById("mealsRescued");
const heroMeals = document.getElementById("heroMeals");
const foodDonors = document.getElementById("foodDonors");
const peopleHelped = document.getElementById("peopleHelped");
const foodSaved = document.getElementById("foodSaved");

const footerMeals = document.getElementById("footerMeals");
const footerDonors = document.getElementById("footerDonors");
const footerPeople = document.getElementById("footerPeople");
const footerSaved = document.getElementById("footerSaved");


// ======================================
// LOAD REAL STATISTICS
// ======================================

async function loadStatistics() {
    try {
        // Get all food donations
        const { data: donations, error } = await supabaseClient
            .from("food_donations")
            .select("*");

        if (error) {
            console.error("Statistics error:", error);
            return;
        }

        const donationList = donations || [];

        // ==================================
        // TOTAL DONATIONS
        // ==================================

        const totalDonations = donationList.length;

        // ==================================
        // FOOD DONORS
        // ==================================

        const donorIds = new Set();
        donationList.forEach(function (food) {
            if (food.donated_by) {
                donorIds.add(food.donated_by);
            }
        });
        const totalDonors = donorIds.size;

        // ==================================
        // PEOPLE HELPED
        // ==================================

        const peopleIds = new Set();
        donationList.forEach(function (food) {
            const isClaimed = food.status === "claimed" ||
                              food.status === "picked_up" ||
                              food.claimed === true;

            if (food.claimed_by && isClaimed) {
                peopleIds.add(food.claimed_by);
            }
        });
        const totalPeople = peopleIds.size;

        // ==================================
        // FOOD SAVED
        // ==================================

        let savedPercentage = 0;
        if (totalDonations > 0) {
            const rescuedDonations = donationList.filter(function (food) {
                return (
                    food.status === "claimed" ||
                    food.status === "picked_up" ||
                    food.claimed === true
                );
            });

            savedPercentage = Math.round(
                (rescuedDonations.length / totalDonations) * 100
            );
        }

        // ==================================
        // UPDATE MAIN & HERO STATISTICS
        // ==================================

        if (mealsRescued) mealsRescued.textContent = totalDonations;
        if (heroMeals) heroMeals.textContent = totalDonations;
        if (foodDonors) foodDonors.textContent = totalDonors;
        if (peopleHelped) peopleHelped.textContent = totalPeople;
        if (foodSaved) foodSaved.textContent = savedPercentage + "%";

        // ==================================
        // UPDATE FOOTER IF PRESENT
        // ==================================

        if (footerMeals) footerMeals.textContent = totalDonations;
        if (footerDonors) footerDonors.textContent = totalDonors;
        if (footerPeople) footerPeople.textContent = totalPeople;
        if (footerSaved) footerSaved.textContent = savedPercentage + "%";

    } catch (error) {
        console.error("Unexpected error loading statistics:", error);
    }
}


// ======================================
// RUN
// ======================================

loadStatistics();