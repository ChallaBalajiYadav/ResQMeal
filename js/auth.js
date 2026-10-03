// ===============================
// SIGN UP
// ===============================

const signupForm = document.getElementById("signupForm");

if (signupForm) {

    signupForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const name = document.getElementById("name").value;
        const email = document.getElementById("signupEmail").value;
        const password = document.getElementById("signupPassword").value;

        const { data, error } = await supabaseClient.auth.signUp({
            email: email,
            password: password,

            options: {
                data: {
                    full_name: name
                }
            }
        });

        if (error) {
            alert(error.message);
            return;
        }

        alert("Account created successfully!");

        window.location.href = "login.html";
    });
}


// ===============================
// LOGIN
// ===============================

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const email = document.getElementById("loginEmail").value;
        const password = document.getElementById("loginPassword").value;

        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {
            alert(error.message);
            return;
        }

        alert("Login successful!");

        window.location.href = "dashboard.html";
    });
}