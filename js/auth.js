// ===================================
// ALERT NOTIFICATION HELPER
// ===================================

function showAlert(message, type = "error") {
    const alertEl = document.getElementById("authAlert");
    if (!alertEl) {
        alert(message);
        return;
    }

    const iconMap = {
        error: "⚠️",
        success: "✅",
        info: "ℹ️"
    };

    alertEl.className = `auth-alert ${type}`;
    alertEl.innerHTML = `
        <span class="auth-alert-icon">${iconMap[type] || "ℹ️"}</span>
        <span class="auth-alert-text">${message}</span>
    `;
    alertEl.style.display = "flex";
    alertEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function hideAlert() {
    const alertEl = document.getElementById("authAlert");
    if (alertEl) {
        alertEl.style.display = "none";
        alertEl.textContent = "";
    }
}


// ===================================
// COMPREHENSIVE EMAIL VALIDATION
// ===================================

/**
 * Validates email format, structure, TLD, disposable domains, and typos.
 * Returns { valid: boolean, message?: string }
 */
function validateEmailFormat(email) {
    if (!email || typeof email !== "string") {
        return { valid: false, message: "Please enter your email address." };
    }

    const cleanEmail = email.trim().toLowerCase();

    if (cleanEmail.length < 5 || cleanEmail.length > 254) {
        return { valid: false, message: "Email address must be between 5 and 254 characters long." };
    }

    if (/\s/.test(cleanEmail)) {
        return { valid: false, message: "Email address cannot contain spaces." };
    }

    const parts = cleanEmail.split("@");
    if (parts.length !== 2) {
        return { valid: false, message: "Please enter a valid email address with a single '@'." };
    }

    const [local, domain] = parts;

    if (!local || !domain) {
        return { valid: false, message: "Please enter a complete email address (e.g., name@example.com)." };
    }

    if (local.startsWith(".") || local.endsWith(".")) {
        return { valid: false, message: "Email username cannot start or end with a dot (.)." };
    }

    if (local.includes("..") || domain.includes("..")) {
        return { valid: false, message: "Email cannot contain consecutive dots (..)." };
    }

    // RFC-compliant local part characters
    const localRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_{|}~-]+$/;
    if (!localRegex.test(local)) {
        return { valid: false, message: "Email username contains unsupported special characters." };
    }

    // Domain validation
    if (!domain.includes(".")) {
        return { valid: false, message: "Email domain must include an extension like .com, .org, or .net." };
    }

    const domainParts = domain.split(".");
    const tld = domainParts[domainParts.length - 1];

    if (tld.length < 2) {
        return { valid: false, message: "Domain extension must be at least 2 letters (e.g., .com, .org, .in)." };
    }

    if (!/^[a-zA-Z]{2,24}$/.test(tld)) {
        return { valid: false, message: "Domain extension must consist only of letters (e.g., .com, .org)." };
    }

    for (const part of domainParts) {
        if (!part || part.startsWith("-") || part.endsWith("-") || !/^[a-zA-Z0-9-]+$/.test(part)) {
            return { valid: false, message: "Email domain contains invalid characters or formatting." };
        }
    }

    // Block common placeholder / fake domains
    const blockedDomains = [
        "test.com", "example.com", "fake.com", "sample.com", "invalid.com",
        "test", "localhost", "none.com", "random.com", "domain.com"
    ];
    if (blockedDomains.includes(domain)) {
        return { valid: false, message: "Please provide your real personal or work email address." };
    }

    // Block known disposable / temporary burner email domains
    const disposableDomains = [
        "tempmail.com", "temp-mail.org", "10minutemail.com", "mailinator.com",
        "guerrillamail.com", "guerrillamail.net", "trashmail.com", "yopmail.com",
        "sharklasers.com", "throwawaymail.com", "dispostable.com", "fakeinbox.com",
        "getairmail.com", "mohmal.com", "maildrop.cc", "inboxkitten.com",
        "mytemp.email", "tempail.com", "crazymailing.com"
    ];
    if (disposableDomains.includes(domain)) {
        return { valid: false, message: "Disposable and temporary email addresses are not accepted." };
    }

    // Common domain typo detector
    const typos = {
        "gamil.com": "gmail.com",
        "gmai.com": "gmail.com",
        "gmial.com": "gmail.com",
        "gmaill.com": "gmail.com",
        "gamil.co": "gmail.com",
        "yaho.com": "yahoo.com",
        "yahooo.com": "yahoo.com",
        "hotmial.com": "hotmail.com",
        "hotmaill.com": "hotmail.com",
        "outlok.com": "outlook.com"
    };
    if (typos[domain]) {
        return {
            valid: false,
            message: `Did you mean ${local}@${typos[domain]}? Please check your email for spelling typos.`
        };
    }

    return { valid: true };
}

/**
 * Checks domain DNS records via Google DNS-over-HTTPS.
 * Verifies that the email domain actually exists and has mail (MX) or host (A) records.
 */
async function verifyEmailDomainDNS(email) {
    const domain = email.split("@")[1];
    if (!domain) return { valid: false, message: "Invalid domain." };

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3500);

        const res = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=MX`, {
            signal: controller.signal
        });
        clearTimeout(timeout);

        if (!res.ok) {
            return { valid: true }; // Fail-open on DNS service error
        }

        const data = await res.json();

        // Status 3 is NXDOMAIN (domain does not exist)
        if (data.Status === 3) {
            return {
                valid: false,
                message: `The domain "@${domain}" does not exist. Please enter a valid, active email address.`
            };
        }

        // If domain has no MX records, check if it has a host (A) record
        if (!data.Answer || data.Answer.length === 0) {
            const aRes = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=A`);
            if (aRes.ok) {
                const aData = await aRes.json();
                if ((!aData.Answer || aData.Answer.length === 0) && aData.Status === 3) {
                    return {
                        valid: false,
                        message: `The domain "@${domain}" has no registered mail or web servers.`
                    };
                }
            }
        }

        return { valid: true };

    } catch (err) {
        // Fail-open on network timeout or offline so legitimate signups are not blocked
        return { valid: true };
    }
}


// ===================================
// SIGN UP
// ===================================

const signupForm = document.getElementById("signupForm");
const signupEmailInput = document.getElementById("signupEmail");
const emailHint = document.getElementById("emailHint");

// Live inline email validation on blur & input
if (signupEmailInput) {
    signupEmailInput.addEventListener("blur", function () {
        const val = signupEmailInput.value.trim();
        if (!val) {
            signupEmailInput.classList.remove("input-error", "input-success");
            if (emailHint) {
                emailHint.textContent = "Please enter a valid, active email address.";
                emailHint.className = "form-hint";
            }
            return;
        }

        const check = validateEmailFormat(val);
        if (!check.valid) {
            signupEmailInput.classList.add("input-error");
            signupEmailInput.classList.remove("input-success");
            if (emailHint) {
                emailHint.textContent = check.message;
                emailHint.className = "form-hint error-text";
            }
        } else {
            signupEmailInput.classList.remove("input-error");
            signupEmailInput.classList.add("input-success");
            if (emailHint) {
                emailHint.textContent = "✓ Valid email format";
                emailHint.className = "form-hint success-text";
            }
        }
    });

    signupEmailInput.addEventListener("input", function () {
        hideAlert();
        if (signupEmailInput.classList.contains("input-error")) {
            signupEmailInput.classList.remove("input-error");
            if (emailHint) {
                emailHint.textContent = "Please enter a valid, active email address.";
                emailHint.className = "form-hint";
            }
        }
    });
}

if (signupForm) {
    signupForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        hideAlert();

        const nameInput = document.getElementById("name");
        const name = nameInput ? nameInput.value.trim() : "";
        const email = signupEmailInput ? signupEmailInput.value.trim() : "";
        const passwordInput = document.getElementById("signupPassword");
        const password = passwordInput ? passwordInput.value : "";

        const submitBtn = signupForm.querySelector('button[type="submit"]');
        const originalContent = submitBtn ? submitBtn.innerHTML : "";

        // 1. Validate Name
        if (name.length < 2) {
            showAlert("Please enter your full name (at least 2 characters).", "error");
            if (nameInput) nameInput.focus();
            return;
        }

        // 2. Validate Email Format
        const formatCheck = validateEmailFormat(email);
        if (!formatCheck.valid) {
            showAlert(formatCheck.message, "error");
            if (signupEmailInput) {
                signupEmailInput.classList.add("input-error");
                signupEmailInput.focus();
            }
            if (emailHint) {
                emailHint.textContent = formatCheck.message;
                emailHint.className = "form-hint error-text";
            }
            return;
        }

        // 3. Validate Password Length
        if (password.length < 6) {
            showAlert("Password must be at least 6 characters long.", "error");
            if (passwordInput) passwordInput.focus();
            return;
        }

        try {
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = `<span>Verifying email...</span>`;
            }

            // 4. Verify Domain via DNS (checks if email domain really exists)
            const domainCheck = await verifyEmailDomainDNS(email);
            if (!domainCheck.valid) {
                showAlert(domainCheck.message, "error");
                if (signupEmailInput) {
                    signupEmailInput.classList.add("input-error");
                    signupEmailInput.focus();
                }
                if (emailHint) {
                    emailHint.textContent = domainCheck.message;
                    emailHint.className = "form-hint error-text";
                }
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalContent;
                }
                return;
            }

            if (submitBtn) {
                submitBtn.innerHTML = `<span>Creating account...</span>`;
            }

            // 5. Submit to Supabase
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
                throw error;
            }

            // Check if user already exists (Supabase returns empty identities array for existing emails)
            if (data && data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
                showAlert(
                    "An account with this email address already exists. Please log in or use 'Forgot password' to recover your account.",
                    "error"
                );
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalContent;
                }
                return;
            }

            showAlert("Account created successfully! Redirecting to login...", "success");
            signupForm.reset();
            if (signupEmailInput) {
                signupEmailInput.classList.remove("input-error", "input-success");
            }
            if (emailHint) {
                emailHint.textContent = "Please enter a valid, active email address.";
                emailHint.className = "form-hint";
            }

            setTimeout(function () {
                window.location.href = "login.html";
            }, 1800);

        } catch (error) {
            console.error("Signup error:", error);
            showAlert(error.message || "Signup failed. Please check your information and try again.", "error");

            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalContent;
            }
        }
    });
}


// ===================================
// EMAIL AND PASSWORD LOGIN
// ===================================

const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        hideAlert();

        const emailInput = document.getElementById("email");
        const email = emailInput ? emailInput.value.trim() : "";
        const passwordInput = document.getElementById("password");
        const password = passwordInput ? passwordInput.value : "";

        const loginButton = loginForm.querySelector('button[type="submit"]');
        const originalContent = loginButton ? loginButton.innerHTML : "";

        // Validate email format
        const formatCheck = validateEmailFormat(email);
        if (!formatCheck.valid) {
            showAlert(formatCheck.message, "error");
            if (emailInput) emailInput.focus();
            return;
        }

        try {
            if (loginButton) {
                loginButton.disabled = true;
                loginButton.innerHTML = `<span>Logging in...</span>`;
            }

            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) {
                throw error;
            }

            showAlert("Login successful! Redirecting to dashboard...", "success");

            setTimeout(function () {
                window.location.href = "dashboard.html";
            }, 600);

        } catch (error) {
            console.error("Email login error:", error);
            showAlert(error.message || "Invalid email or password. Please try again.", "error");

            if (loginButton) {
                loginButton.disabled = false;
                loginButton.innerHTML = originalContent;
            }
        }
    });
}


// ===================================
// GOOGLE LOGIN
// ===================================

const googleLogin = document.getElementById("googleLoginBtn");

if (googleLogin) {
    googleLogin.addEventListener("click", async function () {
        hideAlert();
        const buttonText = googleLogin.querySelector("span");
        const originalText = buttonText ? buttonText.textContent : "Continue with Google";

        try {
            googleLogin.disabled = true;

            if (buttonText) {
                buttonText.textContent = "Connecting to Google...";
            }

            const redirectUrl = new URL("dashboard.html", window.location.href).href;

            const { error } = await supabaseClient.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: redirectUrl
                }
            });

            if (error) {
                throw error;
            }

        } catch (error) {
            console.error("Google login error:", error);
            showAlert("Google login failed: " + (error.message || "Unknown error"), "error");

            googleLogin.disabled = false;

            if (buttonText) {
                buttonText.textContent = originalText;
            }
        }
    });
}


// ===================================
// FORGOT PASSWORD
// ===================================

const forgotPasswordForm = document.getElementById("forgotPasswordForm");

if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        hideAlert();

        const emailInput = document.getElementById("resetEmail");
        const email = emailInput ? emailInput.value.trim() : "";

        const submitBtn = document.getElementById("resetSubmitBtn") || forgotPasswordForm.querySelector('button[type="submit"]');
        const originalContent = submitBtn ? submitBtn.innerHTML : "";

        // Validate email format
        const formatCheck = validateEmailFormat(email);
        if (!formatCheck.valid) {
            showAlert(formatCheck.message, "error");
            if (emailInput) emailInput.focus();
            return;
        }

        try {
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = `<span>Verifying email...</span>`;
            }

            // Verify domain exists before requesting reset
            const domainCheck = await verifyEmailDomainDNS(email);
            if (!domainCheck.valid) {
                showAlert(domainCheck.message, "error");
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalContent;
                }
                return;
            }

            if (submitBtn) {
                submitBtn.innerHTML = `<span>Sending link...</span>`;
            }

            const redirectUrl = new URL("update-password.html", window.location.href).href;

            const { error } = await supabaseClient.auth.resetPasswordForEmail(
                email,
                {
                    redirectTo: redirectUrl
                }
            );

            if (error) {
                throw error;
            }

            showAlert(
                "Password reset link has been sent to your email! Please check your inbox (and spam folder) and click the link to reset your password.",
                "success"
            );

            if (emailInput) emailInput.value = "";

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = `<span>Reset Link Sent!</span>`;

                setTimeout(function () {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalContent;
                }, 30000);
            }

        } catch (error) {
            console.error("Password reset error:", error);
            showAlert(error.message || "Password reset failed. Please verify your email and try again.", "error");

            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalContent;
            }
        }
    });
}


// ===================================
// UPDATE PASSWORD
// ===================================

const updatePasswordForm = document.getElementById("updatePasswordForm");

if (updatePasswordForm) {
    const sessionNotice = document.getElementById("sessionNotice");
    let isRecoverySession = false;

    // Check URL hash for error parameters (e.g. otp_expired)
    if (window.location.hash) {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const hashError = hashParams.get("error_description");
        if (hashError) {
            showAlert(decodeURIComponent(hashError).replace(/\+/g, " "), "error");
            if (sessionNotice) {
                sessionNotice.style.display = "block";
            }
            updatePasswordForm.style.display = "none";
        }
    }

    // Listen for auth state change - Supabase sets session on recovery link click
    if (typeof supabaseClient !== "undefined" && supabaseClient.auth) {
        supabaseClient.auth.onAuthStateChange(function (event, session) {
            if (event === "PASSWORD_RECOVERY" || session) {
                isRecoverySession = true;
                if (sessionNotice) {
                    sessionNotice.style.display = "none";
                }
                updatePasswordForm.style.display = "block";
            }
        });

        // Also check if an active session or hash token exists
        supabaseClient.auth.getSession().then(function (response) {
            const session = response && response.data && response.data.session;
            const hasRecoveryHash = window.location.hash && (
                window.location.hash.includes("type=recovery") ||
                window.location.hash.includes("access_token")
            );

            if (!session && !hasRecoveryHash && !isRecoverySession) {
                if (sessionNotice) {
                    sessionNotice.style.display = "block";
                }
                updatePasswordForm.style.display = "none";
                showAlert("No active password reset session found. Please open the link sent to your email or request a new one.", "info");
            }
        });
    }

    updatePasswordForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        hideAlert();

        const passwordInput = document.getElementById("newPassword");
        const password = passwordInput ? passwordInput.value : "";
        const confirmPasswordInput = document.getElementById("confirmPassword");
        const confirmPassword = confirmPasswordInput ? confirmPasswordInput.value : "";

        const updateBtn = document.getElementById("updateSubmitBtn") || updatePasswordForm.querySelector('button[type="submit"]');
        const originalContent = updateBtn ? updateBtn.innerHTML : "";

        if (password.length < 6) {
            showAlert("Password must be at least 6 characters long.", "error");
            if (passwordInput) passwordInput.focus();
            return;
        }

        if (password !== confirmPassword) {
            showAlert("Passwords do not match. Please re-enter.", "error");
            if (confirmPasswordInput) confirmPasswordInput.focus();
            return;
        }

        try {
            if (updateBtn) {
                updateBtn.disabled = true;
                updateBtn.innerHTML = `<span>Updating password...</span>`;
            }

            const { error } = await supabaseClient.auth.updateUser({
                password: password
            });

            if (error) {
                throw error;
            }

            showAlert("Password updated successfully! Redirecting you to login...", "success");
            updatePasswordForm.reset();
            updatePasswordForm.style.display = "none";

            setTimeout(function () {
                window.location.href = "login.html";
            }, 2000);

        } catch (error) {
            console.error("Password update error:", error);
            showAlert(error.message || "Password update failed. Please try again.", "error");

            if (updateBtn) {
                updateBtn.disabled = false;
                updateBtn.innerHTML = originalContent;
            }
        }
    });
}
