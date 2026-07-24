frappe.provide("custom_ui.theme");

const CUSTOM_THEMES = {
	blue: "dark",
	// orange: "light",
	// brown: "dark",
	// peach: "light",
	purple: "light",
	sky: "light",
};

// Override set_theme to handle custom themes
frappe.ui.set_theme = (theme) => {
	const root = document.documentElement;
	let theme_mode = root.getAttribute("data-theme-mode");

	if (!theme) {
		if (theme_mode === "automatic") {
			theme = frappe.ui.dark_theme_media_query.matches ? "dark" : "light";
		} else if (theme_mode in CUSTOM_THEMES) {
			theme = CUSTOM_THEMES[theme_mode];
		}
	} else if (theme in CUSTOM_THEMES) {
		theme = CUSTOM_THEMES[theme];
	}

	root.setAttribute("data-theme", theme || theme_mode);
};

custom_ui.theme.apply = function () {
	const theme = localStorage.getItem("custom_theme");

	if (theme) {
		document.documentElement.setAttribute("data-theme-mode", theme);
		frappe.ui.set_theme();
	}
};

custom_ui.theme.clear = function () {
	localStorage.removeItem("custom_theme");
};

custom_ui.theme.set = function (theme) {
	localStorage.setItem("custom_theme", theme);
	document.documentElement.setAttribute("data-theme-mode", theme);
	frappe.ui.set_theme();
};

// Run immediately during script loading to avoid theme-flash
custom_ui.theme.apply();

// Also register on DOMContentLoaded and app_ready to keep it in sync
$(document).ready(() => {
	custom_ui.theme.apply();
});

$(document).on("app_ready", () => {
	custom_ui.theme.apply();
});
