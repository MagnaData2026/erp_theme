console.log("Magna Login Loaded");

window.addEventListener("load", () => {

    // Logo
    const logo = document.querySelector("img.app-logo");
    if (logo) {
        logo.src = "/assets/custom_ui/images/image.png";
    }

    // Heading
    const heading =
        document.querySelector(".page-card-head h4") ||
        document.querySelector(".page-card-head h2");

    if (heading) {
        heading.innerHTML = "Welcome to MagnaERP";
    }

});
// Remove Login with Email Link only
document.querySelectorAll("a").forEach((a) => {
    if (a.textContent.trim() === "Login with Email Link") {
        a.parentElement?.remove();
        a.remove();
    }
});

// Remove OR text only
document.querySelectorAll("p, div, span").forEach((el) => {
    if (el.textContent.trim().toLowerCase() === "or") {
        el.remove();
    }
});