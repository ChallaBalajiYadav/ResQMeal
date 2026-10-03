// ===============================
// CHECK LOGIN
// ===============================

async function checkFoodUser() {

    const {
        data: { user }
    } = await supabaseClient.auth.getUser();


    if (!user) {

        alert("Please login to find and claim food.");

        window.location.href = "login.html";

        return null;
    }


    return user;
}


// ===============================
// ELEMENTS
// ===============================

const foodList =
    document.getElementById("foodList");

const refreshBtn =
    document.getElementById("refreshBtn");


// ===============================
// LOAD FOOD
// ===============================

async function loadFood() {

    const user = await checkFoodUser();

    if (!user) {
        return;
    }


    foodList.innerHTML = `
        <p class="loading">
            Loading food donations...
        </p>
    `;


    // ===============================
    // GET FOOD FROM DATABASE
    // ===============================

    const { data, error } = await supabaseClient
        .from("food_donations")
        .select("*")
        .order("created_at", {
            ascending: false
        });


    // ===============================
    // DATABASE ERROR
    // ===============================

    if (error) {

        console.log("Load error:", error);

        foodList.innerHTML = `
            <p class="error">
                Failed to load food donations.
            </p>
        `;

        return;
    }


    // ===============================
    // CHECK FOOD STATUS
    // ===============================

    const currentTime = new Date();

    const availableFood = [];


    data.forEach(function (food) {

        const pickupTime =
            new Date(food.pickup_time);


        // ===============================
        // EXPIRED FOOD
        // ===============================

        if (
            food.status === "available" &&
            pickupTime <= currentTime
        ) {

            food.status = "expired";

        }


        // ===============================
        // ADD AVAILABLE FOOD
        // ===============================

        if (food.status === "available") {

            availableFood.push(food);

        }

    });


    // ===============================
    // NO AVAILABLE FOOD
    // ===============================

    if (availableFood.length === 0) {

        foodList.innerHTML = `
            <div class="no-food">

                <div class="no-food-icon">
                    🍽️
                </div>

                <h2>
                    No food available
                </h2>

                <p>
                    There are no available food donations right now.
                </p>

            </div>
        `;

        return;
    }


    // ===============================
    // CLEAR LIST
    // ===============================

    foodList.innerHTML = "";


    // ===============================
    // CREATE FOOD CARDS
    // ===============================

    availableFood.forEach(function (food) {

        const card =
            document.createElement("div");


        card.className = "food-card";


        card.innerHTML = `

            <div class="food-icon">
                🍱
            </div>


            <div class="food-content">


                <h2>
                    ${food.food_name}
                </h2>


                <p>
                    <strong>Quantity:</strong>
                    ${food.quantity}
                </p>


                <p>
                    <strong>Location:</strong>
                    📍 ${food.location}
                </p>


                <p>
                    <strong>Pickup:</strong>
                    ${new Date(food.pickup_time).toLocaleString()}
                </p>


                <p>
                    <strong>Status:</strong>

                    <span class="food-status available-status">
                        🟢 Available
                    </span>

                </p>


                <p class="food-description">
                    ${food.description || "No description provided."}
                </p>


                <button
                    class="claim-btn"
                    onclick="claimFood('${food.id}')"
                >
                    🤝 Claim Food
                </button>


            </div>

        `;


        foodList.appendChild(card);

    });

}


// ===============================
// CLAIM FOOD
// ===============================

async function claimFood(foodId) {

    const user = await checkFoodUser();

    if (!user) {
        return;
    }


    // ===============================
    // UPDATE STATUS
    // ===============================

    const {
        data,
        error
    } = await supabaseClient

        .from("food_donations")

        .update({
            status: "claimed",
            claimed_by: user.id
        })

        .eq("id", foodId)

        .eq("status", "available")

        .select();


    // ===============================
    // ERROR
    // ===============================

    if (error) {

        console.log(
            "Claim error:",
            error
        );

        alert(
            "Could not claim food: " +
            error.message
        );

        return;
    }


    // ===============================
    // ALREADY CLAIMED
    // ===============================

    if (!data || data.length === 0) {

        alert(
            "Food was already claimed or expired."
        );

        loadFood();

        return;
    }


    // ===============================
    // SUCCESS
    // ===============================

    alert(
        "Food claimed successfully! 🍱"
    );


    // ===============================
    // REFRESH FOOD LIST
    // ===============================

    loadFood();

}


// ===============================
// REFRESH BUTTON
// ===============================

if (refreshBtn) {

    refreshBtn.addEventListener(
        "click",
        loadFood
    );

}


// ===============================
// START
// ===============================

loadFood();