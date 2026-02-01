# TESTING & VALIDATION GUIDE
## LexOps Insight RC1.0 - Quality Assurance

---

## MANUAL TESTING CHECKLIST

### 🟢 ADMIN MODE TESTS

#### Test 1.1: Upload Excel File
**Steps:**
1. Open `app/index.html` in browser
2. Click "Upload planilha"
3. Select test file: `test_data.xlsx`

**Expected Results:**
- ✅ File accepted
- ✅ No error message
- ✅ Mapping dialog appears
- ✅ Columns detected correctly

**If Failed:**
- Check: File format is XLSX
- Check: File size < 50MB
- Check: Console for errors

#### Test 1.2: File Validation (Bad Format)
**Steps:**
1. Click "Upload planilha"
2. Select `test_file.txt`

**Expected Results:**
- ✅ Alert appears: "Formato inválido"
- ✅ File not processed
- ✅ Input cleared

#### Test 1.3: File Validation (Too Large)
**Steps:**
1. Click "Upload planilha"
2. Select file >50MB

**Expected Results:**
- ✅ Alert appears: "Arquivo muito grande"
- ✅ File not processed

#### Test 1.4: Color Picker (Instant Update)
**Steps:**
1. Open color picker (accent color input)
2. Click a color
3. Observe dashboard

**Expected Results:**
- ✅ Color updates INSTANTLY (<5ms latency)
- ✅ All elements change immediately
- ✅ No lag or flicker

**Performance Check:**
```javascript
// In browser console:
const start = performance.now();
document.getElementById('accentColorInput').value = '#ff0000';
const event = new Event('input', { bubbles: true });
document.getElementById('accentColorInput').dispatchEvent(event);
const end = performance.now();
console.log(`Latency: ${end - start}ms`);
// Expected: <5ms
```

#### Test 1.5: Text Input (Debounced)
**Steps:**
1. Click footer text input
2. Type "My Custom Footer"
3. Type slowly, observe mutations

**Expected Results:**
- ✅ Text updates with ~100ms delay
- ✅ Single DOM mutation per 3 chars (not per keystroke)
- ✅ No lag from text input

#### Test 1.6: Logo Upload (JPG)
**Steps:**
1. Click "Upload Logo - Escritório"
2. Select `logo.jpg` (<5MB)

**Expected Results:**
- ✅ Logo accepted
- ✅ Image displays immediately
- ✅ Styling clean (no borders)

#### Test 1.7: Logo Upload (Bad Format)
**Steps:**
1. Click "Upload Logo - Escritório"
2. Select `document.pdf`

**Expected Results:**
- ✅ Alert: "Formato inválido"
- ✅ File rejected

#### Test 1.8: Logo Upload (Too Large)
**Steps:**
1. Click "Upload Logo - Escritório"
2. Select image >5MB

**Expected Results:**
- ✅ Alert: "Imagem muito grande"
- ✅ File rejected

#### Test 1.9: Export Function
**Steps:**
1. Upload test Excel file
2. Click "Exportar Dashboard"

**Expected Results:**
- ✅ File downloads: `Dashboard_Juridico_LexOpsInsight.html`
- ✅ No errors in console
- ✅ Download completes in <2 seconds

#### Test 1.10: Console Check (Admin)
**Steps:**
1. Open DevTools (F12)
2. Go to Console tab
3. Look for errors/warnings

**Expected Results:**
- ✅ No red errors (except Supabase offline)
- ✅ No console.log statements
- ✅ Only console.error if errors occur

---

### 🔵 CLIENT MODE TESTS (Exported HTML)

#### Test 2.1: Open Exported Dashboard
**Steps:**
1. Right-click exported HTML file
2. Open with browser

**Expected Results:**
- ✅ Dashboard loads immediately
- ✅ No upload prompt
- ✅ Data visible
- ✅ Filters work
- ✅ Charts display

#### Test 2.2: Data Hydration
**Steps:**
1. Open exported HTML
2. Open DevTools → Console
3. Type: `console.log(dStore.length)`

**Expected Results:**
- ✅ Returns row count (>0)
- ✅ Example: `23` (if you uploaded 23 rows)

#### Test 2.3: State Injection Verification
**Steps:**
1. Open exported HTML
2. View Page Source
3. Search for `window.__OFFLINE_PAYLOAD__`

**Expected Results:**
- ✅ Found a `<script>` tag with payload
- ✅ Contains JSON data
- ✅ dStore, customCharts, logoData present

**Example:**
```javascript
window.__OFFLINE_PAYLOAD__ = {
    dStore: [{...}, {...}, ...],
    customCharts: [...],
    themeConfig: {...},
    // ... more fields
};
```

#### Test 2.4: Color Persistence
**Steps:**
1. Admin mode: Set accent color to #ff0000 (red)
2. Export dashboard
3. Open exported HTML
4. Observe colors

**Expected Results:**
- ✅ Colors match admin version
- ✅ Header background same
- ✅ Buttons same color
- ✅ All theme persisted

#### Test 2.5: Logo Display (No Borders)
**Steps:**
1. Admin mode: Upload logos
2. Export dashboard
3. Open exported HTML
4. Inspect logos in DevTools

**Expected Results:**
- ✅ Logos display
- ✅ No borders (clean look)
- ✅ No shadow effects
- ✅ Professional appearance

#### Test 2.6: Sidebar Hidden
**Steps:**
1. Open exported HTML
2. Look for admin sidebar

**Expected Results:**
- ✅ No sidebar visible
- ✅ Main content full-width
- ✅ Clean dashboard layout

#### Test 2.7: Filters Work
**Steps:**
1. Open exported HTML
2. Use date range filter
3. Apply
4. Observe data change

**Expected Results:**
- ✅ Filters respond
- ✅ Data updates
- ✅ Charts update
- ✅ No upload button visible

#### Test 2.8: Footer Display
**Steps:**
1. Admin mode: Set custom footer "© 2025 My Firm"
2. Export and open
3. Scroll to bottom

**Expected Results:**
- ✅ Custom footer shows: "© 2025 My Firm"
- ✅ Professional styling
- ✅ Separated by line

#### Test 2.9: Print View
**Steps:**
1. Open exported HTML
2. Ctrl+P (Print)
3. Preview

**Expected Results:**
- ✅ Layout adjusts for print
- ✅ Colors preserved
- ✅ All data visible
- ✅ Ready to print

#### Test 2.10: Console Check (Client)
**Steps:**
1. Open exported HTML
2. DevTools → Console

**Expected Results:**
- ✅ No errors
- ✅ __OFFLINE_PAYLOAD__ accessible
- ✅ Clean launch

---

### 🟡 EDGE CASE TESTS

#### Test 3.1: Empty Excel File
**Steps:**
1. Create blank Excel file
2. Try to upload

**Expected Results:**
- ✅ Alert: "Planilha vazia ou corrompida"
- ✅ File rejected gracefully

#### Test 3.2: Excel with No Data Rows
**Steps:**
1. Create Excel with headers only
2. Upload

**Expected Results:**
- ✅ Alert: "Nenhum dado encontrado"
- ✅ Mapping not shown

#### Test 3.3: Multiple Color Changes
**Steps:**
1. Rapidly click 10 different colors
2. Observe updates

**Expected Results:**
- ✅ All changes apply
- ✅ No lag
- ✅ All updates visible
- ✅ No flicker

#### Test 3.4: Rapid Logo Uploads
**Steps:**
1. Upload logo 1
2. Immediately upload logo 2
3. Observe both display

**Expected Results:**
- ✅ No race conditions
- ✅ Both logos show
- ✅ No errors

#### Test 3.5: Export Without Data
**Steps:**
1. Fresh page (no upload)
2. Click "Exportar"

**Expected Results:**
- ✅ Alert: "Nenhum dado para exportar"
- ✅ File NOT downloaded
- ✅ User guided to upload

#### Test 3.6: Fast Back-to-Back Uploads
**Steps:**
1. Upload Excel file
2. Before mapping finishes, upload another

**Expected Results:**
- ✅ No crashes
- ✅ Second upload completes
- ✅ Graceful handling

---

## AUTOMATED TESTING (Optional)

### Unit Test Example (Jest/Playwright)

```javascript
describe('Excel Upload', () => {
    test('rejects non-Excel formats', async () => {
        const input = document.getElementById('fileInput');
        const file = new File(['content'], 'file.txt', { type: 'text/plain' });
        
        fireEvent.change(input, { target: { files: [file] } });
        
        await waitFor(() => {
            expect(screen.getByText(/Formato inválido/i)).toBeInTheDocument();
        });
    });

    test('accepts XLSX format', async () => {
        const input = document.getElementById('fileInput');
        const buffer = /* valid XLSX buffer */;
        const file = new File([buffer], 'data.xlsx', { 
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        });
        
        fireEvent.change(input, { target: { files: [file] } });
        
        await waitFor(() => {
            expect(document.querySelector('.mapping-dialog')).toBeInTheDocument();
        });
    });

    test('enforces 50MB file size limit', async () => {
        const input = document.getElementById('fileInput');
        const largeBuffer = new ArrayBuffer(51 * 1024 * 1024);
        const file = new File([largeBuffer], 'large.xlsx');
        
        fireEvent.change(input, { target: { files: [file] } });
        
        await waitFor(() => {
            expect(screen.getByText(/muito grande/i)).toBeInTheDocument();
        });
    });
});

describe('Color Motor', () => {
    test('updates CSS variables with requestAnimationFrame', async () => {
        const input = document.getElementById('accentColorInput');
        
        const start = performance.now();
        fireEvent.input(input, { target: { value: '#ff0000' } });
        const end = performance.now();
        
        expect(end - start).toBeLessThan(5); // <5ms latency
    });
});

describe('Export Pipeline', () => {
    test('injects __OFFLINE_PAYLOAD__ in exported HTML', async () => {
        // Setup: load dashboard with data
        dStore = [{ name: 'Test', value: 100 }];
        
        exportConsolidatedHTML();
        
        // Capture downloaded HTML
        const exported = /* get blob content */;
        expect(exported).toContain('window.__OFFLINE_PAYLOAD__');
        expect(exported).toContain('"name":"Test"');
    });

    test('removes #adminPanel but keeps #clientControls', async () => {
        dStore = [{ data: 'test' }];
        
        exportConsolidatedHTML();
        
        const exported = /* get blob content */;
        expect(exported).not.toContain('id="adminPanel"');
        expect(exported).toContain('id="clientControls"');
    });
});
```

---

## PERFORMANCE BENCHMARKS

### Target Metrics

| Metric | Target | Method |
|--------|--------|--------|
| Color input latency | <5ms | DevTools Performance |
| Text input lag | None noticeable | Manual observation |
| Export time | <2 seconds | Timer |
| Client mode boot | <500ms | DevTools Performance |
| Memory cleanup | 100% | DevTools Memory tab |

### How to Measure

**1. Color Latency:**
```javascript
const input = document.getElementById('accentColorInput');
const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
        console.log(`Paint time: ${entry.duration}ms`);
    }
});
observer.observe({ entryTypes: ['paint'] });

const start = performance.now();
input.value = '#ff0000';
input.dispatchEvent(new Event('input', { bubbles: true }));
const end = performance.now();
console.log(`Total latency: ${end - start}ms`);
```

**2. Export Performance:**
```javascript
const start = performance.now();
exportConsolidatedHTML();
const end = performance.now();
console.log(`Export took ${end - start}ms`);
// Target: <2000ms
```

**3. Boot Performance:**
```javascript
// In client mode (exported HTML):
const bootStart = performance.timing.fetchStart;
const bootEnd = performance.timing.loadEventEnd;
const bootTime = bootEnd - bootStart;
console.log(`Boot time: ${bootTime}ms`);
// Target: <500ms after page load
```

---

## ROLLBACK PROCEDURE (If Critical Issue)

### If Tests Fail:

1. **Backup fails:**
   ```bash
   git revert HEAD  # Undo last commit
   npm run deploy
   ```

2. **Restore from backup:**
   ```bash
   cp app/index.html.backup app/index.html
   git add app/index.html
   git commit -m "rollback: RC1.0 - Critical issue"
   git push origin main
   ```

3. **Notify users:**
   > "Rolled back to previous version due to critical issue. Working on fix."

---

## SIGN-OFF

**Tested By:** [Your Name]
**Date:** [Date]
**Status:** ✅ PASSED / ⚠️ ISSUES FOUND

**Sign-off:**
- [ ] All Admin tests passed
- [ ] All Client tests passed
- [ ] No critical errors
- [ ] Performance meets targets
- [ ] Ready for production

---

**Questions? Check INTEGRATION_GUIDE.md for troubleshooting.**
