/**
 * ════════════════════════════════════════════════════════════════════════════════
 * LEXOPS INSIGHT - SYSTEM ARCHITECTURE OVERHAUL & RELEASE CANDIDATE
 * Distinguished Software Architect (L7+) Implementation
 * ════════════════════════════════════════════════════════════════════════════════
 *
 * This is the complete refactored JavaScript system with:
 * 1. Hydrated State Boot Architecture (Offline-First)
 * 2. Export Pipeline with State Injection
 * 3. Visual HDR & Premium CSS
 * 4. Real-Time Color Motor (requestAnimationFrame)
 * 5. Robust SheetJS Import with Error Handling
 *
 * Replace the <script> section in index.html with this code.
 * ════════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════
// GLOBAL UTILITY FUNCTIONS (Accessible to all modules)
// ═══════════════════════════════════════════════════════════════════════════════

const debounce = (fn, delay = 150) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
};

const setLoadingState = (isLoading) => {
    document.body.style.cursor = isLoading ? 'wait' : 'default';
};

const updateCSSVar = (varName, value) => {
    requestAnimationFrame(() => {
        document.documentElement.style.setProperty(varName, value);
    });
};

// ═══════════════════════════════════════════════════════════════════════════════
// HYDRATED STATE BOOT ARCHITECTURE
// Offline-First SPA: Detects Admin Mode vs Client Mode
// ═══════════════════════════════════════════════════════════════════════════════

(function BOOT() {
    'use strict';

    const BOOT_STATE = {
        isOfflineMode: !!window.__OFFLINE_PAYLOAD__,
        isDOMReady: false
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bootApplication);
    } else {
        bootApplication();
    }

    function bootApplication() {
        try {
            BOOT_STATE.isDOMReady = true;

            if (BOOT_STATE.isOfflineMode) {
                bootClientMode();
            } else {
                bootAdminMode();
            }
        } catch (error) {
            console.error('💥 Boot failed:', error);
            alert('Erro ao inicializar o sistema.');
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // CLIENT MODE: Exported HTML (Read-Only Dashboard)
    // ═══════════════════════════════════════════════════════════════════════════════
    function bootClientMode() {
        try {
            const payload = window.__OFFLINE_PAYLOAD__;

            // Hydrate state
            dStore = payload.dStore || [];
            customCharts = payload.customCharts || [];
            themeConfig = payload.themeConfig || {};
            colMapping = payload.colMapping || {};
            logoData = payload.logoData || {};
            layoutTheme = payload.layoutTheme || 'minimal';
            numericColumns = payload.numericColumns || [];
            mappedValueColumn = payload.mappedValueColumn || null;

            // Hide admin UI
            const sidebar = document.getElementById('adminPanel');
            if (sidebar) sidebar.style.display = 'none';

            // Full-width main
            const main = document.querySelector('main');
            if (main) {
                main.style.width = '100% !important';
                main.style.margin = '0 !important';
            }

            // Render
            document.body.classList.add('client-mode');
            applyTheme();
            applyLayoutTheme();
            applyLogos();
            applyLexOpsLogo();
            initFiltersUI();
            renderAll();

        } catch (err) {
            console.error('Client mode boot failed:', err);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // ADMIN MODE: Upload & Editor Interface
    // ═══════════════════════════════════════════════════════════════════════════════
    function bootAdminMode() {
        try {
            if (!window.XLSX) {
                throw new Error('SheetJS not loaded');
            }

            initializeExcelUpload();
            initializeLogoUploads();
            initializeWhiteLabelControls();
            applyVisualEnhancements();

        } catch (error) {
            console.error('Admin mode boot failed:', error);
            alert('Erro ao inicializar o sistema.');
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // EXCEL UPLOAD: Robust SheetJS Integration
    // ═══════════════════════════════════════════════════════════════════════════════
    function initializeExcelUpload() {
        const fileInput = document.getElementById('fileInput');
        if (!fileInput) return;

        fileInput.addEventListener('change', async (event) => {
            const file = event.target?.files?.[0];
            if (!file) return;

            setLoadingState(true);

            try {
                // Validation
                if (!file.name.match(/\.(xlsx?|csv)$/i)) {
                    throw new Error('Formato inválido. Use XLSX, XLS ou CSV.');
                }
                if (file.size > 50 * 1024 * 1024) {
                    throw new Error('Arquivo muito grande (máx. 50MB).');
                }

                // Parse
                const arrayBuffer = await readFileAsArrayBuffer(file);
                const workbook = XLSX.read(arrayBuffer, { type: 'array' });

                if (!workbook.SheetNames.length) {
                    throw new Error('Planilha vazia ou corrompida.');
                }

                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const rawData = XLSX.utils.sheet_to_json(firstSheet);

                if (!rawData || !rawData.length) {
                    throw new Error('Nenhum dado encontrado na planilha.');
                }

                // Success
                rawHeaders = Object.keys(rawData[0]);
                window._tempRaw = rawData;
                showMapping();

            } catch (error) {
                alert(`❌ ${error.message}`);
                console.error(error);
            } finally {
                setLoadingState(false);
                fileInput.value = '';
            }
        });
    }

    const readFileAsArrayBuffer = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => reject(new Error('Falha ao ler arquivo.'));
            reader.readAsArrayBuffer(file);
        });
    };

    // ═══════════════════════════════════════════════════════════════════════════════
    // LOGO UPLOADS: Memory-Safe Handlers
    // ═══════════════════════════════════════════════════════════════════════════════
    function initializeLogoUploads() {
        const configs = [
            { id: 'logoOffice', key: 'office' },
            { id: 'logoClient', key: 'client' },
            { id: 'lexopsMainLogo', key: 'lexops' }
        ];

        configs.forEach(({ id, key }) => {
            const input = document.getElementById(id);
            if (!input) return;

            input.addEventListener('change', async (event) => {
                const file = event.target?.files?.[0];
                if (!file) return;

                try {
                    if (!file.name.match(/\.(jpg|jpeg|png|svg|webp)$/i)) {
                        throw new Error('Formato inválido. Use JPG, PNG ou SVG.');
                    }
                    if (file.size > 5 * 1024 * 1024) {
                        throw new Error('Imagem muito grande (máx. 5MB).');
                    }

                    const dataURL = await readFileAsDataURL(file);
                    logoData[key] = dataURL;
                    applyLogos();

                } catch (error) {
                    alert(`❌ ${error.message}`);
                } finally {
                    input.value = '';
                }
            });
        });
    }

    const readFileAsDataURL = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => reject(new Error('Falha ao ler imagem.'));
            reader.readAsDataURL(file);
        });
    };

    // ═══════════════════════════════════════════════════════════════════════════════
    // REAL-TIME COLOR MOTOR: requestAnimationFrame + Input Event
    // ═══════════════════════════════════════════════════════════════════════════════
    function initializeWhiteLabelControls() {
        // Color inputs (instant feedback via RAF)
        const colorControls = [
            { id: 'accentColorInput', varName: '--primary-accent' },
            { id: 'headerBgInput', handler: updateHeaderBg },
            { id: 'headerTextInput', varName: '--header-text' }
        ];

        colorControls.forEach(({ id, varName, handler }) => {
            const input = document.getElementById(id);
            if (!input) return;

            input.addEventListener('input', (e) => {
                if (handler) {
                    handler(e.target.value);
                } else if (varName) {
                    updateCSSVar(varName, e.target.value);
                }
            });
        });

        // Text inputs (debounced)
        const textControls = [
            { id: 'panelTitleInput', handler: updatePanelTitle },
            { id: 'footerTextInput', handler: updateFooterText }
        ];

        textControls.forEach(({ id, handler }) => {
            const input = document.getElementById(id);
            if (!input) return;
            input.addEventListener('input', debounce((e) => handler(e.target.value), 100));
        });

        // Opacity slider
        const opacityInput = document.getElementById('headerOpacityInput');
        if (opacityInput) {
            opacityInput.addEventListener('input', (e) => updateHeaderOpacity(e.target.value));
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // VISUAL ENHANCEMENTS: HDR & Premium CSS
    // ═══════════════════════════════════════════════════════════════════════════════
    function applyVisualEnhancements() {
        const style = document.createElement('style');
        style.textContent = `
            /* HDR Shadows & Glassmorphism */
            .metric-card, .chart-container, .card, .glass {
                box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.08), 
                           0 4px 10px -5px rgba(0, 0, 0, 0.04) !important;
                border: 1px solid rgba(255, 255, 255, 0.6) !important;
                backdrop-filter: blur(10px) !important;
            }

            /* Inter Typography */
            body, input, button, select, textarea {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
                -webkit-font-smoothing: antialiased !important;
                -moz-osx-font-smoothing: grayscale !important;
            }

            /* Premium Buttons */
            button {
                transition: all 0.2s ease !important;
            }
            button:hover {
                transform: translateY(-2px) !important;
                box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12) !important;
            }

            /* Logo Styling */
            #imgClient, #imgOffice, #lexopsLogoImg {
                max-height: 45px !important;
                object-fit: contain !important;
                background: transparent !important;
                border: none !important;
                box-shadow: none !important;
            }
        `;
        document.head.appendChild(style);
    }

})();

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT ENGINE: Intelligent Client-Side Build Pipeline
// ═══════════════════════════════════════════════════════════════════════════════

function exportConsolidatedHTML() {
    // Sanity check
    if (!dStore || dStore.length === 0) {
        alert('⚠️ Nenhum dado para exportar. Importe uma planilha primeiro.');
        return;
    }

    const clone = document.documentElement.cloneNode(true);
    const body = clone.querySelector('body');

    // Step 1: Enable client mode
    if (body) {
        body.classList.add('client-mode');
    }

    // Step 2: Sanitization (Remove admin UI)
    ['#adminPanel', '.no-export'].forEach(selector => {
        clone.querySelectorAll(selector).forEach(el => el.remove());
    });

    // CRITICAL: KEEP #clientControls (filter bar)
    // Do NOT remove it

    // Step 3: State Injection (Hydration)
    const offlinePayloadScript = document.createElement('script');
    offlinePayloadScript.textContent = `
        window.__OFFLINE_PAYLOAD__ = {
            dStore: ${JSON.stringify(dStore)},
            customCharts: ${JSON.stringify(customCharts)},
            themeConfig: ${JSON.stringify(themeConfig)},
            colMapping: ${JSON.stringify(colMapping)},
            logoData: ${JSON.stringify(logoData)},
            layoutTheme: '${layoutTheme}',
            numericColumns: ${JSON.stringify(numericColumns)},
            mappedValueColumn: ${mappedValueColumn ? JSON.stringify(mappedValueColumn) : 'null'}
        };
    `;

    const head = clone.querySelector('head');
    if (head) head.appendChild(offlinePayloadScript);

    // Step 4: CSS Freeze (Color Persistence)
    const cssVarsStyle = document.createElement('style');
    const primaryAccent = getComputedStyle(document.documentElement).getPropertyValue('--primary-accent').trim() || '#4f46e5';
    const headerBgRgb = getComputedStyle(document.documentElement).getPropertyValue('--header-bg-rgb').trim() || '255,255,255';
    const headerText = getComputedStyle(document.documentElement).getPropertyValue('--header-text').trim() || '#111827';
    const headerOpacity = getComputedStyle(document.documentElement).getPropertyValue('--header-opacity').trim() || '1';

    cssVarsStyle.textContent = `
        :root {
            --primary-accent: ${primaryAccent};
            --header-bg-rgb: ${headerBgRgb};
            --header-text: ${headerText};
            --header-opacity: ${headerOpacity};
        }
        #imgClient, #imgOffice, #lexopsLogoImg {
            background: transparent !important;
            border: 0px none !important;
            box-shadow: none !important;
            outline: none !important;
            max-height: 50px !important;
            object-fit: contain !important;
            margin: 0 15px !important;
            padding: 0 !important;
        }
        .header-section {
            border: none !important;
            box-shadow: none !important;
        }
    `;
    if (head) head.appendChild(cssVarsStyle);

    // Step 5: Logo Blindage (Inline styles)
    ['#imgClient', '#imgOffice', '#lexopsLogoImg', 'img[id*="Client"]', 'img[id*="Office"]'].forEach(selector => {
        clone.querySelectorAll(selector).forEach(logo => {
            logo.style.cssText = 'background: transparent !important; ' +
                                'border: 0px none !important; ' +
                                'box-shadow: none !important; ' +
                                'outline: none !important; ' +
                                'max-height: 50px !important; ' +
                                'object-fit: contain !important; ' +
                                'margin: 0 15px !important; ' +
                                'padding: 0 !important;';
        });
    });

    // Step 6: Footer Injection
    if (body) {
        const footerInput = document.getElementById('footerTextInput');
        const footerText = footerInput && footerInput.value.trim() ? footerInput.value : 'Powered by LexOps Insight';

        const footer = document.createElement('div');
        footer.style.cssText = 'width: 100%; ' +
                              'text-align: center; ' +
                              'padding: 20px 0; ' +
                              'margin-top: 40px; ' +
                              'border-top: 1px solid #e5e7eb; ' +
                              'color: #9ca3af; ' +
                              'font-size: 11px; ' +
                              'font-family: sans-serif; ' +
                              'clear: both; ' +
                              'box-sizing: border-box;';
        footer.innerHTML = `<p style="margin: 0; font-weight: 500;">${footerText}</p>`;
        body.appendChild(footer);
    }

    // Step 7: Download
    const htmlContent = `<!DOCTYPE html>\n${clone.outerHTML}`;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'Dashboard_Juridico_LexOpsInsight.html';
    a.click();

    setTimeout(() => URL.revokeObjectURL(a.href), 100);
}
