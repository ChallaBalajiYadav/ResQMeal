// ======================================
// RESQMEAL HOMEPAGE
// ======================================


// ======================================
// GET ELEMENTS
// ======================================

const mealsRescued =
    document.getElementById("mealsRescued");

const foodDonors =
    document.getElementById("foodDonors");

const peopleHelped =
    document.getElementById("peopleHelped");

const foodSaved =
    document.getElementById("foodSaved");


const footerMeals =
    document.getElementById("footerMeals");

const footerDonors =
    document.getElementById("footerDonors");

const footerPeople =
    document.getElementById("footerPeople");

const footerSaved =
    document.getElementById("footerSaved");


// ======================================
// LOAD REAL STATISTICS
// ======================================

async function loadStatistics() {

    try {

        // Get all food donations

        const {
            data: donations,
            error
        } = await supabaseClient
            .from("food_donations")
            .select("*");


        // Check database error

        if (error) {

            console.log(
                "Statistics error:",
                error
            );

            return;
        }


        // ==================================
        // TOTAL DONATIONS
        // ==================================

        const totalDonations =
            donations.length;


        // ==================================
        // FOOD DONORS
        // ==================================

        const donorIds = new Set();


        donations.forEach(function (food) {

            if (food.donated_by) {

                donorIds.add(food.donated_by);

            }

        });


        const totalDonors =
            donorIds.size;


        // ==================================
        // PEOPLE HELPED
        // ==================================

        const peopleIds = new Set();


        donations.forEach(function (food) {

            if (
                food.claimed_by &&
                (
                    food.status === "claimed" ||
                    food.status === "picked_up"
                )
            ) {

                peopleIds.add(
                    food.claimed_by
                );

            }

        });


        const totalPeople =
            peopleIds.size;


        // ==================================
        // FOOD SAVED
        // ==================================

        let savedPercentage = 0;


        if (totalDonations > 0) {

            const rescuedDonations =
                donations.filter(function (food) {

                    return (
                        food.status === "claimed" ||
                        food.status === "picked_up"
                    );

                });


            savedPercentage =
                Math.round(
                    (
                        rescuedDonations.length /
                        totalDonations
                    ) * 100
                );

        }


        // ==================================
        // UPDATE MAIN STATISTICS
        // ==================================

        mealsRescued.textContent =
            totalDonations;

        foodDonors.textContent =
            totalDonors;

        peopleHelped.textContent =
            totalPeople;

        foodSaved.textContent =
            savedPercentage + "%";


        // ==================================
        // UPDATE FOOTER
        // ==================================

        footerMeals.textContent =
            totalDonations;

        footerDonors.textContent =
            totalDonors;

        footerPeople.textContent =
            totalPeople;

        footerSaved.textContent =
            savedPercentage + "%";


    } catch (error) {

        console.log(
            "Unexpected error:",
            error
        );

    }

}


// ======================================
// RUN
// ======================================

loadStatistics();