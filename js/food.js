// ===============================
// CHECK LOGIN
// ===============================

async function checkFoodUser() {
    try {
        const {
            data: { user },
            error
        } = await supabaseClient.auth.getUser();

        if (error || !user) {
            alert("Please login to find and claim food.");
            window.location.href = "login.html";
            return null;
        }

        return user;
    } catch (err) {
        console.error("Auth check error:", err);
        window.location.href = "login.html";
        return null;
    }
}


// ===============================
// ELEMENTS
// ===============================

const foodList = document.getElementById("foodList");
const refreshBtn = document.getElementById("refreshBtn");


// ===============================
// LOAD FOOD
// ===============================

async function loadFood() {
    const user = await checkFoodUser();
    if (!user) {
        return;
    }

    if (foodList) {
        foodList.innerHTML = `
            <p class="loading">
                Loading food donations...
            </p>
        `;
    }

    try {
        // ===============================
        // GET FOOD FROM DATABASE
        // ===============================

        const { data, error } = await supabaseClient
            .from("food_donations")
            .select("*")
            .order("created_at", {
                ascending: false
            });

        if (error) {
            console.error("Load food error:", error);
            if (foodList) {
                foodList.innerHTML = `
                    <p class="error">
                        Failed to load food donations. Please try refreshing.
                    </p>
                `;
            }
            return;
        }

        // ===============================
        // CHECK FOOD STATUS
        // ===============================

        const currentTime = new Date();
        const availableFood = [];

        (data || []).forEach(function (food) {
            const pickupTime = new Date(food.pickup_time);
            const isClaimed = food.claimed === true || food.status === "claimed" || Boolean(food.claimed_by);
            const isExpired = pickupTime <= currentTime || food.status === "expired";

            // Only present truly available, unexpired food
            if (!isClaimed && !isExpired && (food.status === "available" || !food.status)) {
                availableFood.push(food);
            }
        });

        // ===============================
        // NO AVAILABLE FOOD
        // ===============================

        if (availableFood.length === 0) {
            if (foodList) {
                foodList.innerHTML = `
                    <div class="no-food">
                        <div class="no-food-icon">🍽️</div>
                        <h2>No food available</h2>
                        <p>There are no active food donations available right now. Check back soon!</p>
                    </div>
                `;
            }
            return;
        }

        // ===============================
        // RENDER FOOD CARDS
        // ===============================

        if (foodList) {
            foodList.innerHTML = "";

            availableFood.forEach(function (food) {
                const card = document.createElement("div");
                card.className = "food-card";

                const safeFoodName = escapeHtml(food.food_name || "Food Item");
                const safeQuantity = escapeHtml(food.quantity || "1");
                const safeLocation = escapeHtml(food.location || "Community");
                const safeDesc = escapeHtml(food.description || "No description provided.");
                const formattedTime = new Date(food.pickup_time).toLocaleString();

                card.innerHTML = `
                    <div class="food-icon">🍱</div>
                    <div class="food-content">
                        <h2>${safeFoodName}</h2>
                        <p><strong>Quantity:</strong> ${safeQuantity}</p>
                        <p><strong>Location:</strong> 📍 ${safeLocation}</p>
                        <p><strong>Pickup:</strong> ${formattedTime}</p>
                        <p>
                            <strong>Status:</strong>
                            <span class="food-status available-status">🟢 Available</span>
                        </p>
                        <p class="food-description">${safeDesc}</p>
                        <button class="claim-btn" id="claim-btn-${food.id}" onclick="claimFood('${food.id}')">
                            🤝 Claim Food
                        </button>
                    </div>
                `;

                foodList.appendChild(card);
            });
        }

    } catch (err) {
        console.error("Unexpected loadFood error:", err);
        if (foodList) {
            foodList.innerHTML = `
                <p class="error">
                    Could not connect to service. Please try again later.
                </p>
            `;
        }
    }
}


// Helper to escape HTML characters
function escapeHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ===============================
// CLAIM FOOD
// ===============================

async function claimFood(foodId) {
    const user = await checkFoodUser();
    if (!user) {
        return;
    }

    const btn = document.getElementById(`claim-btn-${foodId}`);
    if (btn) {
        btn.disabled = true;
        btn.textContent = "Claiming...";
    }

    try {
        // Update both status and claimed flag
        const { data, error } = await supabaseClient
            .from("food_donations")
            .update({
                status: "claimed",
                claimed: true,
                claimed_by: user.id
            })
            .eq("id", foodId)
            .or("status.eq.available,status.is.null")
            .select();

        if (error) {
            console.error("Claim error:", error);
            alert("Could not claim food: " + error.message);
            if (btn) {
                btn.disabled = false;
                btn.textContent = "🤝 Claim Food";
            }
            return;
        }

        if (!data || data.length === 0) {
            alert("Food was already claimed or expired.");
            loadFood();
            return;
        }

        alert("Food claimed successfully! 🍱 You can view your claims on your Profile page.");
        loadFood();

    } catch (err) {
        console.error("Unexpected claim error:", err);
        alert("Something went wrong claiming this item.");
        if (btn) {
            btn.disabled = false;
            btn.textContent = "🤝 Claim Food";
        }
    }
}

// Expose claimFood globally for inline onclick
window.claimFood = claimFood;


// ===============================
// REFRESH BUTTON
// ===============================

if (refreshBtn) {
    refreshBtn.addEventListener("click", function () {
        refreshBtn.disabled = true;
        refreshBtn.textContent = "Refreshing...";
        loadFood().finally(function () {
            refreshBtn.disabled = false;
            refreshBtn.textContent = "🔄 Refresh";
        });
    });
}


// ===============================
// INITIALIZE
// ===============================

loadFood();