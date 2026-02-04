(function() {
    'use strict';

    // --- Configuration ---
    const TARGET_NAMES = ["Adjust view", "Change layout", "Layout"];
    const TEXT_MORE_OPTIONS = "More options";
    
    // State flag
    let isProcessing = false;

    // --- Helper: Check if Window is Already Open ---
    function isSettingsOpen() {
        const headers = document.querySelectorAll('div[role="dialog"] h2');
        for (let h of headers) {
            if (h.innerText.includes("Adjust view") || h.innerText.includes("Layout")) {
                return true;
            }
        }
        return false;
    }

    // --- Automation Logic ---
    async function openStandardMenu() {
        if (isProcessing) return;
        if (isSettingsOpen()) return;

        isProcessing = true;
        updateButtonState("..."); 

        const buttons = Array.from(document.querySelectorAll('button[aria-label]'));
        const moreBtn = buttons.find(b => b.getAttribute('aria-label').trim() === TEXT_MORE_OPTIONS);

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
                    if(el.parentElement && el.parentElement.tagName === 'LI') el.parentElement.click(); 
                    
                    clearInterval(searchInterval);
                    setTimeout(() => {
                        isProcessing = false;
                        checkButtonStatus();
                    }, 500);
                    return;
                }
            }
            
            if (attempts > 20) {
                clearInterval(searchInterval);
                resetButton();
            }
        }, 100);
    }

    // --- Button State Management (Chrome Safe) ---
    function updateButtonState(text, color) {
        const btn = document.getElementById('gm-smart-btn');
        if (!btn) return;

        while (btn.firstChild) btn.removeChild(btn.firstChild);

        const iconSpan = document.createElement('span');
        iconSpan.textContent = "🎛️ "; 
        btn.appendChild(iconSpan);

        const textNode = document.createTextNode(text);
        btn.appendChild(textNode);

        if (color) btn.style.backgroundColor = color;
    }

    function resetButton() {
        isProcessing = false;
        const btn = document.getElementById('gm-smart-btn');
        if (btn) {
            while (btn.firstChild) btn.removeChild(btn.firstChild);
            
            const icon = document.createElement('span');
            icon.textContent = "🎛️ ";
            btn.appendChild(icon);
            btn.appendChild(document.createTextNode("Change Layout"));

            btn.style.backgroundColor = '#3c4043';
            btn.style.cursor = 'pointer';
            btn.style.color = 'white';
            btn.style.border = '1px solid #5f6368';
        }
    }
    
    function checkButtonStatus() {
        const btn = document.getElementById('gm-smart-btn');
        if (!btn) return;

        if (isSettingsOpen()) {
            while (btn.firstChild) btn.removeChild(btn.firstChild);
            
            const icon = document.createElement('span');
            icon.textContent = "✅ ";
            btn.appendChild(icon);
            btn.appendChild(document.createTextNode("Active"));

            btn.style.backgroundColor = '#202124';
            btn.style.color = '#9aa0a6';
            btn.style.cursor = 'default';
            btn.style.border = '1px solid #3c4043';
        } else if (!isProcessing) {
            resetButton();
        }
    }

    // --- Create Button (Chrome Safe) ---
    function createButton() {
        if (document.getElementById('gm-smart-btn')) return;

        const btn = document.createElement('button');
        btn.id = 'gm-smart-btn';
        
        const icon = document.createElement('span');
        icon.textContent = "🎛️ ";
        btn.appendChild(icon);
        btn.appendChild(document.createTextNode("Change Layout"));

        Object.assign(btn.style, {
            position: 'fixed',
            top: '12px',
            left: '110px',
            zIndex: '99999',
            padding: '8px 16px',
            backgroundColor: '#3c4043', 
            color: 'white',
            border: '1px solid #5f6368',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '500',
            fontFamily: '"Google Sans", Roboto, Arial, sans-serif',
            boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
        });

        btn.onmouseover = () => { if(!isSettingsOpen() && !isProcessing) btn.style.backgroundColor = '#4d5156'; };
        btn.onmouseout = () => { if(!isSettingsOpen() && !isProcessing) btn.style.backgroundColor = '#3c4043'; };

        btn.onclick = openStandardMenu;
        document.body.appendChild(btn);
    }

    // --- Initialization ---
    setInterval(() => {
        if (document.querySelector('button[aria-label*="microphone"]')) {
            createButton();
            checkButtonStatus();
        }
    }, 500);

})();
