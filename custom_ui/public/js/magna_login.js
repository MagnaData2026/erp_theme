console.log("Magna Login Loaded");

const LOGO = "/assets/custom_ui/images/image.png";

function addLogo(head) {

    if (!head) return;

    let logo = head.querySelector("img.app-logo");

    if (!logo) {
        logo = document.createElement("img");
        logo.className = "app-logo";
        head.prepend(logo);
    }

    logo.src = LOGO;

}

// Wraps everything AFTER page-card-head (form + back-to-login link etc.)
// into a single div so it can be styled as one white "card"

function wrapCardBody(card) {

    if (!card) return;

    if (card.querySelector(".magna-card-body")) return;

    const head = card.querySelector(".page-card-head");

    const wrapper = document.createElement("div");
    wrapper.className = "magna-card-body";

    let node = head ? head.nextElementSibling : card.firstElementChild;
    const toMove = [];

    while (node) {
        toMove.push(node);
        node = node.nextElementSibling;
    }

    if (toMove.length === 0) return;

    toMove.forEach(el => wrapper.appendChild(el));

    if (head) {
    head.insertAdjacentElement("afterend", wrapper);
} else {
    card.appendChild(wrapper);
}

}

// Change the text of a submit button inside a given container

function setButtonText(container, text) {

    if (!container) return;

    const btn = container.querySelector("button[type='submit']") ||
                container.querySelector(".btn-primary") ||
                container.querySelector("button");

    if (btn && btn.innerText.trim() !== text) {
        btn.innerText = text;
    }

}

// Change a link's text if it currently matches oldText (case-insensitive)

function setLinkText(container, oldText, newText) {

    if (!container) return;

    container.querySelectorAll("a").forEach(a => {
        if (a.innerText.trim().toLowerCase() === oldText.toLowerCase()) {
            a.innerText = newText;
        }
    });

}

function customizeLogin() {

    // -----------------------
    // Login Card
    // -----------------------

    const loginCard = document.querySelector(".for-login .page-card");

    if (loginCard) {

        const head = loginCard.querySelector(".page-card-head");
        addLogo(head);

        const heading =
            loginCard.querySelector(".page-card-head h4") ||
            loginCard.querySelector(".page-card-head h2");

        if (heading) {
            heading.innerHTML = "Welcome to MagnaERP";
        }

        wrapCardBody(loginCard);

        // Button should say "Login", not "Continue"
        setButtonText(loginCard, "Login");

    }

    // -----------------------
    // Forgot Password Card
    // -----------------------

    const forgotCard = document.querySelector(".for-forgot .page-card");

    if (forgotCard) {

        const forgotHead = forgotCard.querySelector(".page-card-head");
        addLogo(forgotHead);

        wrapCardBody(forgotCard);

        // Button should say "Reset Password", not "Send Link"
        setButtonText(forgotCard, "Reset Password");

        // Link should say "Back to Login", not "Back to sign in"
        setLinkText(forgotCard, "Back to sign in", "Back to Login");
        setLinkText(forgotCard, "Back to login", "Back to Login");

    }

    // -----------------------
    // Remove "Login with Email Link"
    // -----------------------

    document.querySelectorAll("a").forEach(a => {

        if (a.innerText.trim() === "Login with Email Link") {
            a.closest(".login-with-email-link")?.remove();
            a.remove();
        }

    });

    // -----------------------
    // Remove "OR"
    // -----------------------

    document.querySelectorAll("p,span,div").forEach(el => {

        if (el.innerText.trim().toLowerCase() === "or") {
            el.remove();
        }

    });

}

window.addEventListener("load", () => {
    setTimeout(customizeLogin, 300);
});

window.addEventListener("hashchange", () => {
    setTimeout(customizeLogin, 300);
});

setInterval(customizeLogin, 700);