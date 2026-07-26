// console.log("Magna Login Loaded");

// window.addEventListener("load", () => {

//     // Logo
//     const logo = document.querySelector("img.app-logo");
//     if (logo) {
//         logo.src = "/assets/custom_ui/images/image.png";
//     }

//     // Heading
//     const heading =
//         document.querySelector(".page-card-head h4") ||
//         document.querySelector(".page-card-head h2");

//     if (heading) {
//         heading.innerHTML = "Welcome to MagnaERP";
//     }

// });
// // Remove Login with Email Link only
// document.querySelectorAll("a").forEach((a) => {
//     if (a.textContent.trim() === "Login with Email Link") {
//         a.parentElement?.remove();
//         a.remove();
//     }
// });

// // Remove OR text only
// document.querySelectorAll("p, div, span").forEach((el) => {
//     if (el.textContent.trim().toLowerCase() === "or") {
//         el.remove();
//     }
// });
// function addForgotLogo() {
//     if (window.location.hash !== "#forgot") return;

//     const interval = setInterval(() => {
//         const head = document.querySelector(".page-card-head");

//         if (head && !document.querySelector(".forgot-logo")) {

//             head.insertAdjacentHTML(
//                 "afterbegin",
//                 `
//                 <img
//                     class="forgot-logo"
//                     src="/assets/custom_ui/images/image.png"
//                     alt="MagnaData"
//                 >
//                 `
//             );

//             clearInterval(interval);
//         }
//     }, 200);
// }

// window.addEventListener("load", addForgotLogo);
// window.addEventListener("hashchange", addForgotLogo);
// function updateLogo() {
//     document.querySelectorAll("img.app-logo").forEach((logo) => {
//         logo.src = "/assets/custom_ui/images/image.png";
//     });
// }

// updateLogo();

// const observer = new MutationObserver(() => {
//     updateLogo();
// });

// observer.observe(document.body, {
//     childList: true,
//     subtree: true
// });

console.log("Magna Login Loaded");

const LOGO = "/assets/custom_ui/images/image.png";

function customizeLoginPage() {

    // -------------------------------
    // Update all logos
    // -------------------------------
    document.querySelectorAll("img.app-logo").forEach((logo) => {
        logo.src = LOGO;
    });

    // -------------------------------
    // Login Heading
    // -------------------------------
    const loginHeading =
        document.querySelector(".for-login .page-card-head h4") ||
        document.querySelector(".for-login .page-card-head h2");

    if (loginHeading) {
        loginHeading.textContent = "Welcome to MagnaERP";
    }

    // -------------------------------
    // Forgot Password Logo
    // -------------------------------
    // Forgot Password page logo
const forgotLogo = document.querySelector(".for-forgot .page-card-head img.app-logo");

if (forgotLogo) {
    forgotLogo.src = LOGO;
}

    // -------------------------------
    // Remove Login with Email Link
    // -------------------------------
    document.querySelectorAll("a").forEach((a) => {

        if (a.textContent.trim() === "Login with Email Link") {

            a.closest(".login-with-email-link")?.remove();

            a.remove();

        }

    });

    // -------------------------------
    // Remove OR Text
    // -------------------------------
    document.querySelectorAll("p,span,div").forEach((el) => {

        if (el.textContent.trim().toLowerCase() === "or") {

            el.remove();

        }

    });

}

// -------------------------------
// Initial Load
// -------------------------------
window.addEventListener("load", () => {

    setTimeout(customizeLoginPage, 300);

});

// -------------------------------
// Login <-> Forgot Navigation
// -------------------------------
window.addEventListener("hashchange", () => {

    setTimeout(customizeLoginPage, 300);

});

// -------------------------------
// Run every 500ms
// (Safe for Frappe SPA pages)
// -------------------------------
setInterval(() => {

    customizeLoginPage();

}, 500);