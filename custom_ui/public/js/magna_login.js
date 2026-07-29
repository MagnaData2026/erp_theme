console.log("Magna Login Loaded");

const LOGO = "/assets/custom_ui/images/image.png";

function customizeLogin() {

    // Login Card
    const loginCard = document.querySelector(".for-login .page-card");
    if (!loginCard) return;

    // -----------------------
    // Logo
    // -----------------------

    let head = loginCard.querySelector(".page-card-head");

    if (head) {

        let logo = head.querySelector("img.app-logo");

        if (!logo) {

            logo = document.createElement("img");
            logo.className = "app-logo";
            head.prepend(logo);

        }

        logo.src = LOGO;
    }

    // -----------------------
    // Heading
    // -----------------------

    const heading =
        loginCard.querySelector(".page-card-head h4") ||
        loginCard.querySelector(".page-card-head h2");

    if (heading) {

        heading.innerHTML = "Welcome to MagnaERP";

    }

    // -----------------------
    // Subtitle
    // -----------------------

    const subtitle = loginCard.querySelector(".page-card-head p");

    if (subtitle) {

        subtitle.innerHTML = "Welcome! Please sign in to continue.";

    }

    // -----------------------
    // Remove Email Link
    // -----------------------

    document.querySelectorAll("a").forEach(a => {

        if (a.innerText.trim() === "Login with Email Link") {

            a.closest(".login-with-email-link")?.remove();
            a.remove();

        }

    });

    // -----------------------
    // Remove OR
    // -----------------------

    document.querySelectorAll("p,span,div").forEach(el => {

        if (el.innerText.trim().toLowerCase() === "or") {

            el.remove();

        }

    });

    // -----------------------
    // Forgot Password Logo
    // -----------------------

    const forgotHead = document.querySelector(".for-forgot .page-card-head");

    if (forgotHead) {

        let logo = forgotHead.querySelector("img.app-logo");

        if (!logo) {

            logo = document.createElement("img");
            logo.className = "app-logo";
            forgotHead.prepend(logo);

        }

        logo.src = LOGO;

    }

}

window.addEventListener("load", () => {

    setTimeout(customizeLogin, 300);

});

window.addEventListener("hashchange", () => {

    setTimeout(customizeLogin, 300);

});

setInterval(customizeLogin, 700);