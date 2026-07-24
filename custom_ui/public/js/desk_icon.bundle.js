/**
 * Custom UI - Dynamic Theme Adaptive Premium Grid Icon Mapper for Frappe v16
 * UI Design: Perfect Circular Icon Badges + Glass Cards + Deep Layered Ambient Shadows
 */

(function () {
    // Lucide Icon Mapping
    const ICON_MAPPING = {
        // Main Workspace Icons
        "Framework": "box",
        "Organization": "building-2",
        "Accounting": "layout-grid",
        "Assets": "package",
        "Buying": "shopping-cart",
        "Manufacturing": "factory",
        "Projects": "landmark",
        "Quality": "shield-check",
        "Selling": "shopping-bag",
        "Stock": "package-check",
        "Subcontracting": "refresh-cw",
        "ERPNext Settings": "settings",
        "MagnaERP Settings": "settings",
        "Frappe HR": "user-check",
        "MagnaHR": "user",
        "CRM": "briefcase-business",

        // Framework Sub-Items
        "Automation": "cpu",
        "Build": "hammer",
        "Data": "database",
        "Email": "mail",
        "Integrations": "blocks",
        "Printing": "printer",
        "System": "terminal",
        "Users": "users-round",
        "Website": "globe",

        // Accounting Sub-Items
        "Invoicing": "file-spreadsheet",
        "Payments": "receipt-text",
        "Financial Reports": "trending-up",
        "Accounts Setup": "sliders",
        "Taxes": "book-open-text",
        "Banking": "dollar-sign",
        "Budget": "wallet",
        "Share Management": "users",
        "Subscription": "monitor-check",

        // MagnaHR Sub-Items
        "Expenses": "credit-card",
        "HR Setup": "sliders-horizontal",
        "Leaves": "calendar-off",
        "Payroll": "coins",
        "Performance": "award",
        "Recruitment": "user-plus",
        "Shift & Attendance": "clock",
        "Tax & Benefits": "percent",
        "Tenure": "hourglass"
    };

    // Color Gradients per Module
    const COLOR_MAPPING = {
        "Framework": "linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)",
        "Organization": "linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)",
        "Accounting": "linear-gradient(135deg, #34d399 0%, #059669 100%)",
        "Assets": "linear-gradient(135deg, #fb923c 0%, #ea580c 100%)",
        "Buying": "linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)",
        "Manufacturing": "linear-gradient(135deg, #818cf8 0%, #4f46e5 100%)",
        "Projects": "linear-gradient(135deg, #2dd4bf 0%, #0d9488 100%)",
        "Quality": "linear-gradient(135deg, #38bdf8 0%, #1d4ed8 100%)",
        "Selling": "linear-gradient(135deg, #c084fc 0%, #9333ea 100%)",
        "Stock": "linear-gradient(135deg, #60a5fa 0%, #1d4ed8 100%)",
        "Subcontracting": "linear-gradient(135deg, #fbbf24 0%, #d97706 100%)",
        "ERPNext Settings": "linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)",
        "MagnaERP Settings": "linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)",
        "Frappe HR": "linear-gradient(135deg, #f87171 0%, #dc2626 100%)",
        "MagnaHR": "linear-gradient(135deg, #34d399 0%, #059669 100%)",
        "CRM": "linear-gradient(135deg, #f472b6 0%, #db2777 100%)",
    };

    // High-Contrast Deep Glow Shadow Values
    const SHADOW_MAPPING = {
        "Framework": "rgba(124, 58, 237, 0.55)",
        "Organization": "rgba(37, 99, 235, 0.55)",
        "Accounting": "rgba(5, 150, 105, 0.55)",
        "Assets": "rgba(234, 88, 12, 0.55)",
        "Buying": "rgba(2, 132, 199, 0.55)",
        "Manufacturing": "rgba(79, 70, 229, 0.55)",
        "Projects": "rgba(13, 148, 136, 0.55)",
        "Quality": "rgba(29, 78, 216, 0.55)",
        "Selling": "rgba(147, 51, 234, 0.55)",
        "Stock": "rgba(29, 78, 216, 0.55)",
        "Subcontracting": "rgba(217, 119, 6, 0.55)",
        "ERPNext Settings": "rgba(2, 132, 199, 0.55)",
        "MagnaERP Settings": "rgba(2, 132, 199, 0.55)",
        "Frappe HR": "rgba(220, 38, 38, 0.55)",
        "MagnaHR": "rgba(5, 150, 105, 0.55)",
        "CRM": "rgba(219, 39, 119, 0.55)",
    };

    function injectLucideIcon(element, iconName, label) {
        if (!window.lucide) return;

        try {
            if (element.querySelector('svg.custom-adaptive-icon')) return;
            element.innerHTML = "";

            const iconNode = document.createElement('i');
            iconNode.setAttribute('data-lucide', iconName);
            iconNode.classList.add("custom-adaptive-icon");
            
            element.appendChild(iconNode);

            const bgGradient = COLOR_MAPPING[label] || "linear-gradient(135deg, #818cf8, #4f46e5)";
            const glowColor = SHADOW_MAPPING[label] || "rgba(79, 70, 229, 0.55)";

            element.style.background = bgGradient;
            element.style.setProperty('--glow-color', glowColor);

            window.lucide.createIcons({
                attrs: {
                    'stroke-width': 2.2,
                    'width': '25',
                    'height': '25'
                }
            });

            const generatedSvg = element.querySelector('svg');
            if (generatedSvg) {
                generatedSvg.classList.add('custom-adaptive-icon');
            }

            element.style.display = "flex";
            element.style.opacity = "1";
            element.style.visibility = "visible";

        } catch (error) {
            console.error(`[MagnaERP UI] Render error for ${iconName}:`, error);
        }
    }

    function executeGlobalIconScan() {
        const targetCards = document.querySelectorAll('.desktop-icon, .workspace-link-item, [data-link-type="workspace"]');
        if (!targetCards.length) return;

        targetCards.forEach(card => {
            let label = card.getAttribute('data-id') || card.getAttribute('data-label');
            if (!label) {
                const textEl = card.querySelector('.link-text, .desktop-icon-label, h3, span');
                if (textEl) label = textEl.textContent.trim();
            }

            if (!label || !ICON_MAPPING[label]) return;

            card.classList.add('custom-premium-card');
            

            const targetIconContainer = card.querySelector('.icon-container, .link-icon, .icon-wrapper');
            if (targetIconContainer) {
                const nativeImg = targetIconContainer.querySelector('img');
                if (nativeImg) nativeImg.style.display = 'none';

                const nativeSvg = targetIconContainer.querySelector('svg:not(.custom-adaptive-icon)');
                if (nativeSvg) nativeSvg.style.display = 'none';

                injectLucideIcon(targetIconContainer, ICON_MAPPING[label], label);
            }
        });
    }

    function initializeIconSystem() {
        executeGlobalIconScan();

        if (window.frappe && frappe.router) {
            frappe.router.on('change', () => {
                setTimeout(executeGlobalIconScan, 60);
                setTimeout(executeGlobalIconScan, 350);
            });
        }

        document.body.addEventListener('click', function(e) {
            if (e.target.closest('.desktop-icon') || e.target.closest('.btn') || e.target.closest('.theme-selector')) {
                setTimeout(executeGlobalIconScan, 120);
                setTimeout(executeGlobalIconScan, 450); 
            }
        });

        const observer = new MutationObserver(() => {
            executeGlobalIconScan();
        });

        const appWrapper = document.getElementById('app') || document.body;
        observer.observe(appWrapper, { childList: true, subtree: true });
    }

    if (!window.lucide) {
        const script = document.createElement('script');
        script.src = "https://unpkg.com/lucide@latest";
        script.onload = () => { initializeIconSystem(); };
        document.head.appendChild(script);
    } else {
        if (window.$) {
            $(document).on('app_ready', function() {
                initializeIconSystem();
            });
        } else {
            document.addEventListener('DOMContentLoaded', initializeIconSystem);
        }
    }

    // Stylesheet: Enhanced Deep Layered Shadows & Glass Effect
    const style = document.createElement('style');
    style.innerHTML = `
        /* Hide native assets */
        .icon-container img, .link-icon img,
        .icon-container svg:not(.custom-adaptive-icon),
        .link-icon svg:not(.custom-adaptive-icon) {
            display: none !important;
        }

        /* Glassmorphic Card with Deep Multi-Layer Shadow */
        .custom-premium-card, .desktop-icon, .workspace-link-item {
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
            text-align: center !important;
            
            padding: 16px 10px !important;
            border-radius: 24px !important;
            
            background: rgba(255, 255, 255, 0.55) !important;
            backdrop-filter: blur(16px) saturate(200%) !important;
            -webkit-backdrop-filter: blur(16px) saturate(200%) !important;
            border: 1px solid rgba(255, 255, 255, 0.75) !important;
            
            /* Deep Layered Card Drop-Shadow */
            box-shadow: 
                0 12px 28px -6px rgba(0, 0, 0, 0.08),
                0 4px 10px -2px rgba(0, 0, 0, 0.04),
                inset 0 1px 1.5px rgba(255, 255, 255, 0.9) !important;
            
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
            cursor: pointer !important;
        }

        /* Dark Mode Glass Card Shadow */
        [data-theme="dark"] .custom-premium-card, 
        [data-theme="dark"] .desktop-icon {
            background: rgba(15, 23, 42, 0.6) !important;
            border: 1px solid rgba(255, 255, 255, 0.15) !important;
            box-shadow: 
                0 14px 30px -5px rgba(0, 0, 0, 0.45),
                0 4px 12px -2px rgba(0, 0, 0, 0.2) !important;
        }

        /* PERFECT CIRCLE ICON BADGE WITH AMBIENT COLOR GLOW SHADOW */
        .custom-premium-card .icon-container, 
        .custom-premium-card .link-icon,
        .desktop-icon .icon-container,
        .custom-premium-card .icon-wrapper {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            
            width: 58px !important;
            height: 58px !important;
            min-width: 58px !important;
            min-height: 58px !important;
            aspect-ratio: 1 / 1 !important;
            
            margin: 0 0 10px 0 !important;
            border-radius: 50% !important;
            overflow: hidden !important;
            
            /* Ultra Deep Ambient Glowing Shadow */
            box-shadow: 
                0 12px 24px -2px var(--glow-color, rgba(0, 0, 0, 0.4)),
                0 4px 8px -1px var(--glow-color, rgba(0, 0, 0, 0.3)),
                inset 0 2px 3px rgba(255, 255, 255, 0.6),
                inset 0 -2px 2px rgba(0, 0, 0, 0.15) !important;
                
            transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease !important;
        }

        /* Lucide SVG Icon Styling & Drop Shadow */
        .custom-adaptive-icon {
            color: #FFFFFF !important;
            filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.25));
            transition: transform 0.25s ease !important;
        }

        /* Hover State with Lifted Shadow Elevation */
        .custom-premium-card:hover, .desktop-icon:hover {
            transform: translateY(-7px) !important;
            background: rgba(255, 255, 255, 0.8) !important;
            border-color: rgba(255, 255, 255, 0.95) !important;
            box-shadow: 
                0 20px 40px -8px rgba(0, 0, 0, 0.12),
                0 8px 16px -4px rgba(0, 0, 0, 0.06),
                inset 0 1px 2px rgba(255, 255, 255, 1) !important;
        }

        [data-theme="dark"] .custom-premium-card:hover {
            background: rgba(15, 23, 42, 0.8) !important;
            border-color: rgba(255, 255, 255, 0.3) !important;
            box-shadow: 
                0 22px 45px -8px rgba(0, 0, 0, 0.6),
                0 8px 18px -4px rgba(0, 0, 0, 0.3) !important;
        }

        .custom-premium-card:hover .icon-container,
        .custom-premium-card:hover .link-icon {
            transform: scale(1.12) !important;
            box-shadow: 
                0 18px 36px -2px var(--glow-color, rgba(0, 0, 0, 0.55)),
                0 8px 14px -1px var(--glow-color, rgba(0, 0, 0, 0.4)),
                inset 0 3px 4px rgba(255, 255, 255, 0.8) !important;
        }

        .custom-premium-card:hover .custom-adaptive-icon {
            transform: scale(1.08) rotate(-2deg) !important;
        }

        /* Typography */
        .desktop-icon-label, .link-text, .custom-premium-card h3, .custom-premium-card span {
            font-size: 13px !important;
            font-weight: 600 !important;
            color: var(--text-color, #0f172a) !important;
            letter-spacing: -0.015em !important;
            line-height: 1.35 !important;
            margin: 0 !important;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }
            
    `;
    
    document.head.appendChild(style);
})();
