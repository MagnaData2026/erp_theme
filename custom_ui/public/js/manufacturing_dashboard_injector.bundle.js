// manufacturing_dashboard_injector.bundle.js
(function () {
    'use strict';

    console.log("=== [MagnaERP] Dashboard Injector Active ===");

    if (window.frappe && !window.frappe.ui.color) {
        window.frappe.ui.color = {
            get: (color) => color || '#743ee2'
        };
    }

    // 1. Template Helper for Temperature Widget
    function getTempWidgetHTML(value) {
        return `
            <div class="widget number-widget-box" data-widget-name="Machine Temperature" style="min-height: 100%; display: flex; flex-direction: column; justify-content: space-between;">
                <div class="widget-head" style="display: flex; justify-content: space-between; align-items: center;">
                    <div class="widget-label">
                        <div class="widget-title"><span class="ellipsis" title="Machine Temperature">Machine Temperature</span></div>
                        <div class="widget-subtitle"></div>
                    </div>
                    <div class="widget-control">
                        <div class="card-actions dropdown pull-right">
                            <a data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style="color: #9ca3af; font-weight: bold; cursor: pointer;">...</a>
                        </div>
                    </div>
                </div>
                <div class="widget-body" style="margin-top: 8px;">
                    <div class="widget-content">
                        <div class="number" style="font-size: 24px; font-weight: 700; color: #1f2937;">
                            <span id="live-dynamic-temp-value">${value}</span>
                            <span style="font-size: 14px; color: #6b7280; font-weight: 500; margin-left: 2px;">°C</span>
                        </div>
                    </div>
                </div>
                <div class="widget-footer" style="font-size: 9px; color: #16a34a; font-weight: 600; margin-top: 4px;">
                    ● Telemetry Online
                </div>
            </div>
        `;
    }

    // 2. Template Helper for Volt vs Freq Analytics Card
    function getGraphWidgetHTML(v, f) {
        return `
            <div class="widget dashboard-widget-box custom-isolated-panel" style="padding: 20px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); margin-top: 25px; width: 100%; box-sizing: border-box;">
                <div class="widget-head" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <div class="widget-label">
                        <div class="widget-title" style="font-size: 14px; font-weight: 600; color: #1f2937;">Live Electrical Status (Voltage vs Frequency)</div>
                        <div id="live-graph-telemetry-text" class="widget-subtitle" style="font-size: 11px; color: #6b7280; margin-top: 4px;">Current: ${v}V @ ${f}Hz</div>
                    </div>
                    <span style="color: #9ca3af; font-weight: bold;">···</span>
                </div>
                <div class="widget-body">
                    <svg width="100%" height="140" style="overflow: visible; background: #fafafa; border-radius: 4px; padding: 10px; box-sizing: border-box;">
                        <line x1="0" y1="40" x2="1500" y2="40" stroke="#e2e8f0" stroke-dasharray="4" />
                        <line x1="0" y1="90" x2="1500" y2="90" stroke="#e2e8f0" stroke-dasharray="4" />
                        <path id="svg-volt-wave" d="M 10 55 Q 350 25 700 65 T 1350 45" fill="none" stroke="#318AD8" stroke-width="3" />
                        <path id="svg-freq-wave" d="M 10 95 Q 350 115 700 80 T 1350 100" fill="none" stroke="#F683AE" stroke-width="3" />
                    </svg>
                    <div style="display: flex; gap: 20px; margin-top: 12px; font-size: 12px;">
                        <div style="display: flex; align-items: center; gap: 6px;"><div style="width: 12px; height: 12px; background: #318AD8; border-radius: 3px;"></div>Voltage (V)</div>
                        <div style="display: flex; align-items: center; gap: 6px;"><div style="width: 12px; height: 12px; background: #F683AE; border-radius: 3px;"></div>Frequency (Hz)</div>
                    </div>
                </div>
            </div>
        `;
    }

    function checkAndInjectElements() {
        const route = frappe.get_route();
        if (!route || route[0] !== 'dashboard-view' || route[1] !== 'Manufacturing') return;

        // --- PART 1: Injecting Temperature next to Quality Inspection ---
        const qualityCard = document.querySelector('[data-widget-name="Monthly Quality Inspection"]');
        if (qualityCard) {
            const parentRow = qualityCard.parentElement;
            if (parentRow && !document.getElementById('frappe-injected-temp-card')) {
                // Changing grid allocation properties to auto-arrange columns seamlessly
                parentRow.classList.remove('grid-col-3');
                parentRow.style.setProperty('display', 'grid', 'important');
                parentRow.style.setProperty('grid-template-columns', 'repeat(auto-fit, minmax(220px, 1fr))', 'important');
                parentRow.style.setProperty('gap', '15px', 'important');

                const wrapper = document.createElement('div');
                wrapper.id = 'https://magnaerp.tjdem.online/deskfrappe-injected-temp-card';
                wrapper.className = 'dashboard-widget-box';
                wrapper.innerHTML = getTempWidgetHTML(42.5);
                
                qualityCard.insertAdjacentElement('afterend', wrapper);
            }
        }

        // --- PART 2: Injecting Volt vs Freq Graph to Bottom Layout Container ---
        const layoutEnd = document.querySelector('.dashboard-graph, .dashboard-section-container, .page-content');
        if (layoutEnd && !document.getElementById('frappe-injected-graph-card')) {
            const wrapper = document.createElement('div');
            wrapper.id = 'frappe-injected-graph-card';
            wrapper.style.width = '100%';
            wrapper.innerHTML = getGraphWidgetHTML(230, 50.0);
            
            layoutEnd.appendChild(wrapper);
        }
    }

    // Realtime simulation ticker for live telemetry values changes
    setInterval(() => {
        const tempEl = document.getElementById('live-dynamic-temp-value');
        if (tempEl) {
            tempEl.innerText = +(41.5 + Math.random() * 3).toFixed(1);
        }

        const statsText = document.getElementById('live-graph-telemetry-text');
        const vWave = document.getElementById('svg-volt-wave');
        const fWave = document.getElementById('svg-freq-wave');
        if (statsText) {
            const v = Math.floor(Math.random() * 6) + 228;
            const f = +(50.0 + (Math.random() * 0.2 - 0.1)).toFixed(2);
            statsText.innerText = `Current: ${v}V @ ${f}Hz`;

            if (vWave && fWave) {
                vWave.setAttribute('d', `M 10 ${55 + (Math.random()*12-6)} Q 350 ${20 + (Math.random()*15)} 700 ${65 + (Math.random()*10)} T 1350 ${45 + (Math.random()*10)}`);
                fWave.setAttribute('d', `M 10 ${95 + (Math.random()*10-5)} Q 350 ${110 + (Math.random()*15)} 700 ${80 + (Math.random()*10)} T 1350 ${95 + (Math.random()*12)}`);
            }
        }
    }, 2000);

    // Initial and periodic rendering check engine loops
    $(document).on('page-change ajaxComplete', function () {
        setTimeout(checkAndInjectElements, 600);
    });
    setInterval(checkAndInjectElements, 1000);

})();