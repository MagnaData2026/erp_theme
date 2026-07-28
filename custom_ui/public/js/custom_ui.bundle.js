import "./switcher/theme_manager";
import "./switcher/theme_switcher";

frappe.after_ajax(() => {
    console.log("Custom Desk Theme Loaded");
});
// Notification
$(document).on("click", ".sidebar-notification", function () {

    $(".standard-sidebar-item").removeClass("notification-active");
    $(".navbar-search-bar .standard-sidebar-item").removeClass("notification-active");

    $(this).find(".standard-sidebar-item").addClass("notification-active");
});

// Search
$(document).on("click", ".navbar-search-bar", function () {

    $(".standard-sidebar-item").removeClass("notification-active");

    $(this).find(".standard-sidebar-item").addClass("notification-active");
});

// Notification panel close
$(document).on("click", function (e) {

    if (
        !$(e.target).closest(".sidebar-notification").length &&
        !$(e.target).closest(".dropdown-notifications").length &&
        !$(e.target).closest(".navbar-search-bar").length &&
        !$(e.target).closest("#navbar-modal-search").length
    ) {
        $(".standard-sidebar-item").removeClass("notification-active");
    }
});