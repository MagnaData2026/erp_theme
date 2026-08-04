frappe.router.on("change", () => {
    setTimeout(() => {

        const body = document.querySelector(".result-container");
        const header = document.querySelector(".result.no-list-assign-to");

        if (!body || !header) return;

        body.addEventListener("scroll", () => {
            header.scrollLeft = body.scrollLeft;
        });

    }, 300);
});