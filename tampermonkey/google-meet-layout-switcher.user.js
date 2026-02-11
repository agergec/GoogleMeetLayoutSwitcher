// ==UserScript==
// @name         Google Meet Layout Switcher
// @namespace    https://github.com/agergec/GoogleMeetLayoutSwitcher
// @version      1.1.0
// @description  Quickly switch between Google Meet layouts (Auto, Tiled, Spotlight, Sidebar) with a single click from the call controls bar.
// @author       Ahmet Gökalp Ergeç
// @match        https://meet.google.com/*
// @grant        none
// @run-at       document-idle
// @homepageURL  https://github.com/agergec/GoogleMeetLayoutSwitcher
// @supportURL   https://github.com/agergec/GoogleMeetLayoutSwitcher/issues
// @license      MIT
// ==/UserScript==

(function() {
    'use strict';

    // --- Debug Logging System ---
    const log = {
        _enabled: null,
        _isEnabled() {
            if (this._enabled === null) {
                try { this._enabled = !!localStorage.getItem('gm-layout-debug'); } catch(e) { this._enabled = false; }
            }
            return this._enabled;
        },
        debug(...args) { if (this._isEnabled()) console.log('[GMLayout]', ...args); },
        warn(...args) { if (this._isEnabled()) console.warn('[GMLayout]', ...args); },
        error(...args) { console.error('[GMLayout]', ...args); }
    };

    // --- Configuration ---
    // Multi-language menu item names for "Adjust view" / "Change layout" / "Layout"
    const TARGET_NAMES = [
        "Adjust view", "Change layout", "Layout",
        "Ansicht anpassen", "Layout ändern",             // DE
        "Ajustar vista", "Cambiar diseño",               // ES
        "Ajuster la vue", "Modifier la mise en page",    // FR
        "Görünümü ayarla", "Düzeni değiştir",            // TR
        "Regola la visualizzazione", "Modifica layout",  // IT
        "Ajustar visualização", "Alterar layout",        // PT
        "Weergave aanpassen", "Lay-out wijzigen",        // NL
        "レイアウトを変更", "表示を調整",                    // JA
        "레이아웃 변경", "보기 조정",                       // KO
        "调整视图", "更改布局",                             // ZH-CN
        "調整檢視", "變更版面配置"                          // ZH-TW
    ];

    // Multi-language aria-labels for "More options" button
    const MORE_OPTIONS_LABELS = [
        "More options",
        "Weitere Optionen",          // DE
        "Más opciones",              // ES
        "Plus d'options",            // FR
        "Diğer seçenekler",         // TR
        "Altre opzioni",             // IT
        "Mais opções",               // PT
        "Meer opties",               // NL
        "その他のオプション",          // JA
        "옵션 더보기",                // KO
        "更多选项",                   // ZH-CN
        "更多選項"                    // ZH-TW
    ];

    // Multi-language aria-labels for "Close" button
    const CLOSE_LABELS = [
        "Close",
        "Schließen",       // DE
        "Cerrar",          // ES
        "Fermer",          // FR
        "Kapat",           // TR
        "Chiudi",          // IT
        "Fechar",          // PT
        "Sluiten",         // NL
        "閉じる",           // JA
        "닫기",             // KO
        "关闭",             // ZH-CN
        "關閉"              // ZH-TW
    ];

    // Layout options as they appear in Google Meet's Adjust View dialog
    const LAYOUT_OPTIONS = {
        auto: "Auto",
        tiled: "Tiled",
        spotlight: "Spotlight",
        sidebar: "Sidebar"
    };

    // --- Theme Configuration ---
    const THEMES = {
        dark: {
            bg: '#2d2e30',
            bgHover: '#3c4043',
            text: '#e8eaed',
            accent: '#8ab4f8',
            accentBg: 'rgba(138,180,248,0.15)',
            accentBgHover: 'rgba(138,180,248,0.25)',
            accentBgActive: 'rgba(138,180,248,0.24)',
            border: '#3c4043',
            shadow: '0 4px 12px rgba(0,0,0,0.4)',
            divider: '#3c4043'
        },
        light: {
            bg: '#ffffff',
            bgHover: '#f1f3f4',
            text: '#202124',
            accent: '#1a73e8',
            accentBg: 'rgba(26,115,232,0.12)',
            accentBgHover: 'rgba(26,115,232,0.20)',
            accentBgActive: 'rgba(26,115,232,0.24)',
            border: '#dadce0',
            shadow: '0 4px 12px rgba(0,0,0,0.15)',
            divider: '#dadce0'
        }
    };

    let currentTheme = THEMES.dark;

    // --- SVG Icon Paths ---
    const SVG_ICONS = {
        auto: 'M12 6V2L7 7l5 5V8c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z',
        tiled: 'M3 3h8v8H3V3zm0 10h8v8H3v-8zm10-10h8v8h-8V3zm0 10h8v8h-8v-8zM5 5v4h4V5H5zm0 10v4h4v-4H5zm10-10v4h4V5h-4zm0 10v4h4v-4h-4z',
        spotlight: 'M3 3h12v12H3V3zm0 14h12v4H3v-4zm14-14h4v18h-4V3zM5 5v8h8V5H5z',
        sidebar: 'M3 3h12v18H3V3zm14 0h4v18h-4V3zM5 5v14h8V5H5z',
        settings: 'M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.49.49 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.48.48 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.49.49 0 00-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1112 8.4a3.6 3.6 0 010 7.2z'
    };

    // State
    let isProcessing = false;
    let buttonCreated = false;
    let menuVisible = false;
    let pendingLayoutSelection = null;
    let bodyObserver = null;
    let controlsObserver = null;
    let debounceTimer = null;

    // --- Theme Detection ---
    function detectTheme() {
        try {
            const bodyBg = window.getComputedStyle(document.body).backgroundColor;
            const match = bodyBg.match(/\d+/g);
            if (match && match.length >= 3) {
                const [r, g, b] = match.map(Number);
                // Relative luminance formula
                const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
                currentTheme = luminance < 0.5 ? THEMES.dark : THEMES.light;
                log.debug('Theme detected from body bg:', luminance < 0.5 ? 'dark' : 'light');
                return;
            }
        } catch (e) {
            log.warn('Could not detect theme from body bg:', e.message);
        }

        // Fallback to prefers-color-scheme
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            currentTheme = THEMES.light;
            log.debug('Theme detected from media query: light');
        } else {
            currentTheme = THEMES.dark;
            log.debug('Theme defaulting to dark');
        }
    }

    function applyTheme() {
        detectTheme();

        const btn = document.getElementById('gm-smart-btn');
        if (btn) {
            btn.style.backgroundColor = currentTheme.accentBg;
            btn.style.color = currentTheme.accent;
        }

        const menu = document.getElementById('gm-layout-menu');
        if (menu) {
            menu.style.backgroundColor = currentTheme.bg;
            menu.style.border = '1px solid ' + currentTheme.border;
            menu.style.boxShadow = currentTheme.shadow;

            const items = menu.querySelectorAll('[data-gm-item]');
            items.forEach(item => {
                item.style.color = currentTheme.text;
                item.onmouseenter = () => { item.style.backgroundColor = currentTheme.bgHover; };
                item.onmouseleave = () => { item.style.backgroundColor = 'transparent'; };
            });

            const dividers = menu.querySelectorAll('[data-gm-divider]');
            dividers.forEach(d => { d.style.backgroundColor = currentTheme.divider; });
        }
    }

    // --- SVG Icon Helper ---
    function createSVGIcon(key, size) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', String(size));
        svg.setAttribute('height', String(size));
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'currentColor');
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', SVG_ICONS[key]);
        svg.appendChild(path);
        return svg;
    }

    // --- Helper: Check if Settings Dialog is Open ---
    function isSettingsOpen() {
        // Structural check: look for radiogroup inside a dialog (layout selection)
        const dialog = document.querySelector('div[role="dialog"]');
        if (!dialog) return false;

        if (dialog.querySelector('[role="radiogroup"]')) return true;

        // Fallback: h2 text matching against TARGET_NAMES
        const headers = dialog.querySelectorAll('h2');
        for (let h of headers) {
            const text = h.innerText || '';
            if (TARGET_NAMES.some(name => text.includes(name))) {
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

    // --- Helper: Find "More options" button ---
    function findMoreOptionsButton() {
        // Strategy 1: Structural — find button with 3-dot SVG icon inside call controls area
        const allButtons = document.querySelectorAll('button[aria-label]');
        for (const btn of allButtons) {
            const svg = btn.querySelector('svg');
            if (svg) {
                // Check for 3-circle (vertical dots) pattern
                const circles = svg.querySelectorAll('circle');
                if (circles.length === 3) {
                    log.debug('Found More options via SVG 3-circle pattern');
                    return btn;
                }
                // Also check for 3-dot path pattern (some versions use path instead of circles)
                const paths = svg.querySelectorAll('path');
                for (const p of paths) {
                    const d = p.getAttribute('d') || '';
                    // Google's 3-dot icon often uses "M12 8c1.1" or similar 3-dot path
                    if (d.includes('12 8c1.1') || d.includes('12 2c1.1') || d.includes('12 14c1.1')) {
                        log.debug('Found More options via SVG 3-dot path pattern');
                        return btn;
                    }
                }
            }
        }

        // Strategy 2: Multi-language aria-label matching
        for (const btn of allButtons) {
            const label = btn.getAttribute('aria-label')?.trim();
            if (label && MORE_OPTIONS_LABELS.includes(label)) {
                log.debug('Found More options via aria-label:', label);
                return btn;
            }
        }

        log.warn('"More options" button not found via any strategy');
        return null;
    }

    // --- Helper: Close the Adjust View dialog ---
    function closeAdjustViewDialog() {
        try {
            const dialog = document.querySelector('div[role="dialog"]');
            if (!dialog) return false;

            // Strategy 1: Multi-language aria-label close button
            for (const label of CLOSE_LABELS) {
                const closeBtn = dialog.querySelector('button[aria-label="' + label + '"]');
                if (closeBtn) {
                    closeBtn.click();
                    log.debug('Closed dialog via aria-label:', label);
                    return true;
                }
            }

            // Strategy 2: Find small button with SVG icon in dialog header area
            const buttons = dialog.querySelectorAll('button');
            for (const btn of buttons) {
                if (btn.querySelector('svg') && !btn.id) {
                    btn.click();
                    log.debug('Closed dialog via SVG button in dialog');
                    return true;
                }
            }

            // Strategy 3: Escape key fallback
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27, bubbles: true }));
            log.debug('Closed dialog via Escape key');
            return true;
        } catch (e) {
            log.error('Error closing dialog:', e.message);
            return false;
        }
    }

    // --- Select a specific layout option in the dialog ---
    function selectLayoutInDialog(layoutName) {
        try {
            const dialog = document.querySelector('div[role="dialog"]');
            if (!dialog) return false;

            // Find radio buttons or clickable layout options
            const options = dialog.querySelectorAll('[role="radio"], [role="option"], label, div[data-value]');

            for (let opt of options) {
                const text = opt.innerText || opt.textContent || '';
                if (text.includes(layoutName)) {
                    opt.click();
                    log.debug('Selected layout via role selector:', layoutName);
                    return true;
                }
            }

            // Try finding by aria-label
            const labeledOptions = dialog.querySelectorAll('[aria-label*="' + layoutName + '"]');
            if (labeledOptions.length > 0) {
                labeledOptions[0].click();
                log.debug('Selected layout via aria-label:', layoutName);
                return true;
            }

            // Broader search - find any clickable element with the layout name
            const allElements = dialog.querySelectorAll('*');
            for (let el of allElements) {
                if (el.innerText === layoutName || el.textContent?.trim() === layoutName) {
                    el.click();
                    log.debug('Selected layout via text match:', layoutName);
                    return true;
                }
            }

            log.warn('Could not find layout option:', layoutName);
            return false;
        } catch (e) {
            log.error('Error selecting layout:', e.message);
            return false;
        }
    }

    // --- Open Adjust View and optionally select a layout ---
    function openLayoutMenu(targetLayout = null) {
        try {
            if (isProcessing) return;
            if (isSettingsOpen() && !targetLayout) return;

            isProcessing = true;
            pendingLayoutSelection = targetLayout;
            hideMenu();

            const moreBtn = findMoreOptionsButton();

            if (!moreBtn) {
                log.warn('Cannot open layout menu: More options button not found');
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
                    log.warn('Could not find Adjust view menu item after', attempts, 'attempts');
                    resetButton();
                }
            }, 100);
        } catch (e) {
            log.error('Error in openLayoutMenu:', e.message);
            resetButton();
        }
    }

    // --- Wait for the Adjust View dialog to open and select layout ---
    function waitForDialogAndSelect(layoutName) {
        try {
            let attempts = 0;
            const checkInterval = setInterval(() => {
                attempts++;

                if (isSettingsOpen()) {
                    clearInterval(checkInterval);

                    setTimeout(() => {
                        const selected = selectLayoutInDialog(layoutName);

                        if (selected) {
                            setTimeout(() => {
                                closeAdjustViewDialog();
                                pendingLayoutSelection = null;
                                isProcessing = false;
                                checkButtonStatus();
                            }, 300);
                        } else {
                            pendingLayoutSelection = null;
                            isProcessing = false;
                            checkButtonStatus();
                        }
                    }, 200);
                }

                if (attempts > 30) {
                    clearInterval(checkInterval);
                    log.warn('Dialog did not open after', attempts, 'attempts');
                    pendingLayoutSelection = null;
                    resetButton();
                }
            }, 100);
        } catch (e) {
            log.error('Error in waitForDialogAndSelect:', e.message);
            pendingLayoutSelection = null;
            resetButton();
        }
    }

    // --- Menu Management ---
    function showMenu() {
        try {
            if (menuVisible || isSettingsOpen()) return;

            let menu = document.getElementById('gm-layout-menu');
            if (!menu) {
                menu = createMenu();
            }

            // Position menu above the button
            const btn = document.getElementById('gm-smart-btn');
            if (btn) {
                const rect = btn.getBoundingClientRect();
                if (rect.width === 0 && rect.height === 0) {
                    log.warn('Button has zero dimensions, skipping menu positioning');
                    return;
                }
                menu.style.bottom = (window.innerHeight - rect.top + 8) + 'px';
                menu.style.left = rect.left + 'px';
            }

            menu.style.display = 'block';
            menuVisible = true;
        } catch (e) {
            log.error('Error showing menu:', e.message);
        }
    }

    function hideMenu() {
        const menu = document.getElementById('gm-layout-menu');
        if (menu) {
            menu.style.display = 'none';
        }
        menuVisible = false;
    }

    function createMenu() {
        try {
            const menu = document.createElement('div');
            menu.id = 'gm-layout-menu';

            Object.assign(menu.style, {
                position: 'fixed',
                zIndex: '99998',
                backgroundColor: currentTheme.bg,
                borderRadius: '8px',
                padding: '8px 0',
                boxShadow: currentTheme.shadow,
                border: '1px solid ' + currentTheme.border,
                display: 'none',
                minWidth: '180px'
            });

            const presets = [
                { iconKey: 'auto', label: 'Auto (dynamic)', action: () => openLayoutMenu(LAYOUT_OPTIONS.auto) },
                { iconKey: 'tiled', label: 'Tiled (legacy)', action: () => openLayoutMenu(LAYOUT_OPTIONS.tiled) },
                { iconKey: 'spotlight', label: 'Spotlight', action: () => openLayoutMenu(LAYOUT_OPTIONS.spotlight) },
                { iconKey: 'sidebar', label: 'Sidebar', action: () => openLayoutMenu(LAYOUT_OPTIONS.sidebar) },
                { divider: true },
                { iconKey: 'settings', label: 'Adjust view', action: () => openLayoutMenu(null) }
            ];

            presets.forEach(preset => {
                if (preset.divider) {
                    const divider = document.createElement('div');
                    divider.setAttribute('data-gm-divider', '');
                    Object.assign(divider.style, {
                        height: '1px',
                        backgroundColor: currentTheme.divider,
                        margin: '8px 0'
                    });
                    menu.appendChild(divider);
                    return;
                }

                const item = document.createElement('div');
                item.setAttribute('data-gm-item', '');

                Object.assign(item.style, {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 16px',
                    cursor: 'pointer',
                    color: currentTheme.text,
                    fontSize: '14px',
                    fontFamily: '"Google Sans", Roboto, Arial, sans-serif'
                });

                const icon = createSVGIcon(preset.iconKey, 20);
                icon.style.flexShrink = '0';
                item.appendChild(icon);

                const label = document.createElement('span');
                label.textContent = preset.label;
                item.appendChild(label);

                item.onmouseenter = () => { item.style.backgroundColor = currentTheme.bgHover; };
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
        } catch (e) {
            log.error('Error creating menu:', e.message);
            return null;
        }
    }

    // --- Button State Management ---
    function resetButton() {
        isProcessing = false;
        const btn = document.getElementById('gm-smart-btn');
        if (btn) {
            btn.style.backgroundColor = currentTheme.accentBg;
            btn.style.cursor = 'pointer';
            btn.style.color = currentTheme.accent;
        }
    }

    function checkButtonStatus() {
        const btn = document.getElementById('gm-smart-btn');
        if (!btn) return;

        if (isSettingsOpen()) {
            btn.style.backgroundColor = currentTheme.accentBgActive;
            btn.style.color = currentTheme.accent;
            btn.style.cursor = 'default';
        } else if (!isProcessing) {
            resetButton();
        }
    }

    // --- Create Button inside Call Controls ---
    function createButton() {
        try {
            if (document.getElementById('gm-smart-btn')) return;

            const callControls = getCallControls();
            if (!callControls) return;

            detectTheme();

            // Find a reference Google button to match its size
            const refButton = callControls.querySelector('button');
            let refSize = refButton ? refButton.offsetHeight : 0;
            if (!refSize || refSize < 10) {
                refSize = 40;
                log.warn('Reference button size unavailable, using fallback:', refSize);
            }

            const btn = document.createElement('button');
            btn.id = 'gm-smart-btn';
            btn.title = 'Adjust view';
            btn.setAttribute('aria-label', 'Adjust view');
            btn.setAttribute('data-tooltip-id', 'tt-c-layout');

            // Create SVG icon to match Google's style
            const svg = createSVGIcon('tiled', 24);
            btn.appendChild(svg);

            Object.assign(btn.style, {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0',
                backgroundColor: currentTheme.accentBg,
                color: currentTheme.accent,
                border: 'none',
                borderRadius: '50%',
                cursor: 'pointer',
                width: refSize + 'px',
                height: refSize + 'px',
                minWidth: refSize + 'px',
                minHeight: refSize + 'px',
                outline: 'none',
                boxSizing: 'border-box'
            });

            btn.onmouseenter = () => {
                if (!isSettingsOpen() && !isProcessing) {
                    btn.style.backgroundColor = currentTheme.accentBgHover;
                }
            };

            btn.onmouseleave = () => {
                if (!isSettingsOpen() && !isProcessing) {
                    btn.style.backgroundColor = currentTheme.accentBg;
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
            log.debug('Button created successfully');
        } catch (e) {
            log.error('Error creating button:', e.message);
        }
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

    // --- MutationObserver-based Detection ---
    function onDOMMutation() {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            if (isInMeeting()) {
                if (!buttonExistsInDOM()) {
                    buttonCreated = false;
                    createButton();
                }
                checkButtonStatus();
                startControlsObserver();
            } else {
                if (buttonCreated) {
                    removeUI();
                }
                stopControlsObserver();
            }
        }, 200);
    }

    function startBodyObserver() {
        if (bodyObserver) return;

        bodyObserver = new MutationObserver(onDOMMutation);
        bodyObserver.observe(document.body, { childList: true, subtree: true });
        log.debug('Body observer started');

        // Initial check
        if (isInMeeting()) {
            createButton();
            startControlsObserver();
        }
    }

    function startControlsObserver() {
        if (controlsObserver) return;

        const callControls = getCallControls();
        if (!callControls) return;

        controlsObserver = new MutationObserver(() => {
            if (!buttonExistsInDOM() && isInMeeting()) {
                buttonCreated = false;
                createButton();
            }
        });
        controlsObserver.observe(callControls, { childList: true });
        log.debug('Controls observer started');
    }

    function stopControlsObserver() {
        if (controlsObserver) {
            controlsObserver.disconnect();
            controlsObserver = null;
        }
    }

    // --- Cleanup ---
    function cleanup() {
        if (bodyObserver) {
            bodyObserver.disconnect();
            bodyObserver = null;
        }
        stopControlsObserver();
        if (debounceTimer) {
            clearTimeout(debounceTimer);
            debounceTimer = null;
        }
        removeUI();
        log.debug('Cleanup complete');
    }

    // --- Click Outside to Close Menu ---
    document.addEventListener('click', (e) => {
        const menu = document.getElementById('gm-layout-menu');
        const btn = document.getElementById('gm-smart-btn');
        if (menu && menuVisible && !menu.contains(e.target) && !btn?.contains(e.target)) {
            hideMenu();
        }
    });

    // --- Listen for theme changes ---
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
            applyTheme();
            log.debug('Theme updated via media query change');
        });
    }

    // --- Initialization ---
    window.addEventListener('beforeunload', cleanup);
    startBodyObserver();

})();
