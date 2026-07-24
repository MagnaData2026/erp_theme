$(document).on('app_ready', function() {
    // Sidebar Header ke texts ko dynamic dhoond kar badalne ke liye Observer
    const sidebarObserver = new MutationObserver((mutations) => {
        
        // Sidebar ke header titles aur text blocks ko target karega
        $('.sidebar-header .app-name, .nested-navigation .sidebar-header-title, .sidebar-header, .sidebar-header-subtitle').each(function() {
            let currentText = $(this).text().trim();
            let hasChanged = false;

            // 1. Agar "ERPNext" dikhe toh use "MagnaERP" karo
            if (currentText.includes("ERPNext")) {
                currentText = currentText.replace("ERPNext", "MagnaERP");
                hasChanged = true;
            }

            // 2. Agar "Frappe Framework" dikhe toh use "Magna Framework" karo
            if (currentText.includes("Frappe Framework")) {
                currentText = currentText.replace("Frappe Framework", "Magna Framework");
                hasChanged = true;
            }

            // 3. Agar "Frappe HR" dikhe toh use "Magna HR" karo
            if (currentText.includes("Frappe HR")) {
                currentText = currentText.replace("Frappe HR", "Magna HR");
                hasChanged = true;
            }

            // Agar koi bhi text match hua hai, toh hi DOM update karo
            if (hasChanged) {
                $(this).text(currentText);
            }
        });
    });

    // Poore browser screen par dynamic updates track karega
    sidebarObserver.observe(document.body, {
        childList: true,
        subtree: true
    });
});
