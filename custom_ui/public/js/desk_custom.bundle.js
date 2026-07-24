$(document).on('app_ready', function() {
    // MutationObserver setup jo HTML me badlao par nazar rakhega
    const observer = new MutationObserver((mutations) => {
        // Jab bhi naye elements screen par aayenge
        $('.frappe-menu.context-menu .dropdown-menu-item').each(function() {
            let itemText = $(this).find('.menu-item-title').text().trim();
            
            if (itemText === "About" || itemText === "Frappe Support") {
                $(this).remove();
            }
        });
    });

    // Poore HTML body ko observe karna shuru karega
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});

// frappe.router.on("change", () => {
//     setTimeout(() => {
//         document.querySelectorAll(".grid-description").forEach(el => {
//             if (
//                 el.innerText.includes("ERPNext") ||
//                 el.innerText.includes("Frappe")
//             ) {
//                 el.remove();   // किंवा el.style.display = "none";
//             }
//         });
//     }, 500);
// });

frappe.router.on("change", () => {
    setTimeout(() => {

        document.querySelectorAll("body *").forEach(el => {
            if (el.children.length > 0) return;

            if (el.textContent.includes("ERPNext")) {
                el.textContent = el.textContent.replace(/ERPNext/g, "MagnaERP");
            }

            if (el.textContent.includes("Frappe")) {
                el.textContent = el.textContent.replace(/Frappe/g, "Magna");
            }
        });

    }, 300);
});
function replaceBranding() {

    const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );

    let node;

    while ((node = walker.nextNode())) {

        node.nodeValue = node.nodeValue
            .replace(/ERPNext/g, "MagnaERP")
            .replace(/Frappe/g, "Magna");
    }
}

frappe.after_ajax(() => {
    replaceBranding();
});

frappe.router.on("change", () => {
    setTimeout(replaceBranding, 300);
    setTimeout(replaceBranding, 1000);
});

