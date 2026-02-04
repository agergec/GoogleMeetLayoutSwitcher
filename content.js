(function() {
    'use strict';

    // --- Configuration ---
    const TARGET_NAMES = ["Adjust view", "Change layout", "Layout"];
    const TEXT_MORE_OPTIONS = "More options";
    const CHECK_INTERVAL = 500; // Check every 500ms to quickly re-add button if Meet removes it

    // Layout options as they appear in Google Meet's Adjust View dialog
    const LAYOUT_OPTIONS = {
        auto: "Auto (dynamic)",
        tiled: "Tiled (legacy)",
        spotlight: "Spotlight",
        sidebar: "Sidebar"
    };

    // State
    let isProcessing = false;
    let buttonCreated = false;
    let menuVisible = false;
    let checkIntervalId = null;
    let pendingLayoutSelection = null;

    // --- Helper: Check if Settings Dialog is Open ---
    function isSettingsOpen() {
        const headers = document.querySelectorAll('div[role="dialog"] h2');
        for (let h of headers) {
            if (h.innerText.includes("Adjust view") || h.innerText.includes("Layout")) {
                return true;
            }
        }
        return false;
    }

    // --- Helper: Check if in a meeting ---
    function isInMeeting() {
        return !!document.querySelector('[aria-label="Call controls"]');
    }

    // --- Helper: Get call controls container ---
    function getCallControls() {
        return document.querySelector('[aria-label="Call controls"]');
    }

    // --- Helper: Check if our button exists in DOM ---
    function buttonExistsInDOM() {
        return !!document.getElementById('gm-smart-btn');
    }

    // --- Helper: Close the Adjust View dialog ---
    function closeAdjustViewDialog() {
        const dialog = document.querySelector('div[role="dialog"]');
        if (dialog) {
            const closeBtn = dialog.querySelector('button[aria-label="Close"]');
            if (closeBtn) {
                closeBtn.click();
                return true;
            }
            // Try pressing Escape as fallback
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27 }));
        }
        return false;
    }

    // --- Select a specific layout option in the dialog ---
    function selectLayoutInDialog(layoutName) {
        const dialog = document.querySelector('div[role="dialog"]');
        if (!dialog) return false;

        // Find radio buttons or clickable layout options
        const options = dialog.querySelectorAll('[role="radio"], [role="option"], label, div[data-value]');

        for (let opt of options) {
            const text = opt.innerText || opt.textContent || '';
            if (text.includes(layoutName)) {
                opt.click();
                return true;
            }
        }

        // Try finding by aria-label
        const labeledOptions = dialog.querySelectorAll(`[aria-label*="${layoutName}"]`);
        if (labeledOptions.length > 0) {
            labeledOptions[0].click();
            return true;
        }

        // Broader search - find any clickable element with the layout name
        const allElements = dialog.querySelectorAll('*');
        for (let el of allElements) {
            if (el.innerText === layoutName || el.textContent?.trim() === layoutName) {
                el.click();
                return true;
            }
        }

        return false;
    }

    // --- Open Adjust View and optionally select a layout ---
    function openLayoutMenu(targetLayout = null) {
        if (isProcessing) return;
        if (isSettingsOpen() && !targetLayout) return;

        isProcessing = true;
        pendingLayoutSelection = targetLayout;
        hideMenu();
        updateButtonState("...");

        const buttons = Array.from(document.querySelectorAll('button[aria-label]'));
        const moreBtn = buttons.find(b => b.getAttribute('aria-label')?.trim() === TEXT_MORE_OPTIONS);

        if (!moreBtn) {
            resetButton();
            return;
        }

        moreBtn.click();

        let attempts = 0;
        const searchInterval = setInterval(() => {
            attempts++;
            const menuItems = document.querySelectorAll('li[role="menuitem"], span');

            for (let el of menuItems) {
                const text = el.innerText || "";
                if (TARGET_NAMES.some(name => text.includes(name))) {
                    el.click();
                    if (el.parentElement?.tagName === 'LI') el.parentElement.click();

                    clearInterval(searchInterval);

                    // If we need to select a specific layout, wait for dialog and do it
                    if (pendingLayoutSelection) {
                        waitForDialogAndSelect(pendingLayoutSelection);
                    } else {
                        setTimeout(() => {
                            isProcessing = false;
                            checkButtonStatus();
                        }, 500);
                    }
                    return;
                }
            }

            if (attempts > 20) {
                clearInterval(searchInterval);
                resetButton();
            }
        }, 100);
    }

    // --- Wait for the Adjust View dialog to open and select layout ---
    function waitForDialogAndSelect(layoutName) {
        let attempts = 0;
        const checkInterval = setInterval(() => {
            attempts++;

            if (isSettingsOpen()) {
                clearInterval(checkInterval);

                // Small delay to ensure dialog is fully rendered
                setTimeout(() => {
                    const selected = selectLayoutInDialog(layoutName);

                    if (selected) {
                        // Close the dialog after selection
                        setTimeout(() => {
                            closeAdjustViewDialog();
                            pendingLayoutSelection = null;
                            isProcessing = false;
                            checkButtonStatus();
                        }, 300);
                    } else {
                        // Couldn't find the option, just leave dialog open
                        pendingLayoutSelection = null;
                        isProcessing = false;
                        checkButtonStatus();
                    }
                }, 200);
            }

            if (attempts > 30) {
                clearInterval(checkInterval);
                pendingLayoutSelection = null;
                resetButton();
            }
        }, 100);
    }

    // --- Menu Management ---
    function showMenu() {
        if (menuVisible || isSettingsOpen()) return;

        let menu = document.getElementById('gm-layout-menu');
        if (!menu) {
            menu = createMenu();
        }

        // Position menu above the button
        const btn = document.getElementById('gm-smart-btn');
        if (btn) {
            const rect = btn.getBoundingClientRect();
            menu.style.bottom = (window.innerHeight - rect.top + 8) + 'px';
            menu.style.left = rect.left + 'px';
        }

        menu.style.opacity = '0';
        menu.style.display = 'block';
        menu.style.transform = 'translateY(8px)';

        requestAnimationFrame(() => {
            menu.style.opacity = '1';
            menu.style.transform = 'translateY(0)';
        });

        menuVisible = true;
    }

    function hideMenu() {
        const menu = document.getElementById('gm-layout-menu');
        if (menu) {
            menu.style.opacity = '0';
            menu.style.transform = 'translateY(8px)';
            setTimeout(() => {
                menu.style.display = 'none';
            }, 150);
        }
        menuVisible = false;
    }

    function createMenu() {
        const menu = document.createElement('div');
        menu.id = 'gm-layout-menu';

        Object.assign(menu.style, {
            position: 'fixed',
            zIndex: '99998',
            backgroundColor: '#2d2e30',
            borderRadius: '8px',
            padding: '8px 0',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            border: '1px solid #3c4043',
            display: 'none',
            minWidth: '160px',
            transition: 'opacity 0.15s ease, transform 0.15s ease'
        });

        const presets = [
            { icon: '🔄', label: 'Auto (dynamic)', action: () => openLayoutMenu(LAYOUT_OPTIONS.auto) },
            { icon: '▦', label: 'Tiled (legacy)', action: () => openLayoutMenu(LAYOUT_OPTIONS.tiled) },
            { icon: '◐', label: 'Spotlight', action: () => openLayoutMenu(LAYOUT_OPTIONS.spotlight) },
            { icon: '◨', label: 'Sidebar', action: () => openLayoutMenu(LAYOUT_OPTIONS.sidebar) },
            { divider: true },
            { icon: '⚙️', label: 'Adjust view', action: () => openLayoutMenu(null) }
        ];

        presets.forEach(preset => {
            if (preset.divider) {
                const divider = document.createElement('div');
                Object.assign(divider.style, {
                    height: '1px',
                    backgroundColor: '#3c4043',
                    margin: '8px 0'
                });
                menu.appendChild(divider);
                return;
            }

            const item = document.createElement('div');
            item.textContent = `${preset.icon}  ${preset.label}`;

            Object.assign(item.style, {
                padding: '10px 16px',
                cursor: 'pointer',
                color: '#e8eaed',
                fontSize: '14px',
                fontFamily: '"Google Sans", Roboto, Arial, sans-serif',
                transition: 'background-color 0.1s'
            });

            item.onmouseenter = () => { item.style.backgroundColor = '#3c4043'; };
            item.onmouseleave = () => { item.style.backgroundColor = 'transparent'; };
            item.onclick = (e) => {
                e.stopPropagation();
                hideMenu();
                preset.action();
            };

            menu.appendChild(item);
        });

        document.body.appendChild(menu);
        return menu;
    }

    // --- Button State Management ---
    function updateButtonState(text) {
        // No text to update with SVG icon
    }

    function resetButton() {
        isProcessing = false;
        const btn = document.getElementById('gm-smart-btn');
        if (btn) {
            btn.style.backgroundColor = 'rgba(138,180,248,0.15)';
            btn.style.cursor = 'pointer';
            btn.style.color = '#8ab4f8';
        }
    }

    function checkButtonStatus() {
        const btn = document.getElementById('gm-smart-btn');
        if (!btn) return;

        if (isSettingsOpen()) {
            btn.style.backgroundColor = 'rgba(138,180,248,0.24)';
            btn.style.color = '#8ab4f8';
            btn.style.cursor = 'default';
        } else if (!isProcessing) {
            resetButton();
        }
    }

    // --- Create Button inside Call Controls ---
    function createButton() {
        if (document.getElementById('gm-smart-btn')) return;

        const callControls = getCallControls();
        if (!callControls) return;

        // Find a reference Google button to match its size
        const refButton = callControls.querySelector('button');
        const refSize = refButton ? refButton.offsetHeight : 40;

        const btn = document.createElement('button');
        btn.id = 'gm-smart-btn';
        btn.title = 'Adjust view';
        btn.setAttribute('aria-label', 'Adjust view');
        btn.setAttribute('data-tooltip-id', 'tt-c-layout');

        // Create SVG icon to match Google's style
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '24');
        svg.setAttribute('height', '24');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'currentColor');

        // Grid/layout icon
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M3 3h8v8H3V3zm0 10h8v8H3v-8zm10-10h8v8h-8V3zm0 10h8v8h-8v-8zM5 5v4h4V5H5zm0 10v4h4v-4H5zm10-10v4h4V5h-4zm0 10v4h4v-4h-4z');
        svg.appendChild(path);

        btn.appendChild(svg);

        // Match Google Meet's button styling with pastel blue background
        Object.assign(btn.style, {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0',
            backgroundColor: 'rgba(138,180,248,0.15)',
            color: '#8ab4f8',
            border: 'none',
            borderRadius: '50%',
            cursor: 'pointer',
            width: refSize + 'px',
            height: refSize + 'px',
            minWidth: refSize + 'px',
            minHeight: refSize + 'px',
            transition: 'background-color 0.2s ease',
            outline: 'none',
            boxSizing: 'border-box'
        });

        btn.onmouseenter = () => {
            if (!isSettingsOpen() && !isProcessing) {
                btn.style.backgroundColor = 'rgba(138,180,248,0.25)';
            }
        };

        btn.onmouseleave = () => {
            if (!isSettingsOpen() && !isProcessing) {
                btn.style.backgroundColor = 'rgba(138,180,248,0.15)';
            }
        };

        btn.onclick = (e) => {
            e.stopPropagation();
            if (menuVisible) {
                hideMenu();
            } else {
                showMenu();
            }
        };

        // Insert as the first child of call controls
        callControls.insertBefore(btn, callControls.firstChild);
        buttonCreated = true;
    }

    // --- Remove UI ---
    function removeUI() {
        const btn = document.getElementById('gm-smart-btn');
        const menu = document.getElementById('gm-layout-menu');
        if (btn) btn.remove();
        if (menu) menu.remove();
        buttonCreated = false;
        menuVisible = false;
    }

    // --- Periodic Check ---
    function startChecking() {
        if (checkIntervalId) return;

        checkIntervalId = setInterval(() => {
            if (isInMeeting()) {
                // Always check if button exists in DOM (Google Meet may have removed it)
                if (!buttonExistsInDOM()) {
                    buttonCreated = false;
                    createButton();
                }
                checkButtonStatus();
            } else {
                if (buttonCreated) {
                    removeUI();
                }
            }
        }, CHECK_INTERVAL);

        // Initial check
        if (isInMeeting()) {
            createButton();
        }
    }

    // --- Cleanup ---
    function cleanup() {
        if (checkIntervalId) {
            clearInterval(checkIntervalId);
            checkIntervalId = null;
        }
        removeUI();
    }

    // --- Click Outside to Close Menu ---
    document.addEventListener('click', (e) => {
        const menu = document.getElementById('gm-layout-menu');
        const btn = document.getElementById('gm-smart-btn');
        if (menu && menuVisible && !menu.contains(e.target) && !btn?.contains(e.target)) {
            hideMenu();
        }
    });

    // --- Initialization ---
    window.addEventListener('beforeunload', cleanup);
    startChecking();

})();
