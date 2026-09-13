const fs = require('fs');
const path = require('path');

const appDir = path.join(__dirname, 'app');

let html = fs.readFileSync(path.join(appDir, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(appDir, 'css', 'styles.css'), 'utf8');
const tafqeetJs = fs.readFileSync(path.join(appDir, 'js', 'tafqeet.js'), 'utf8');
const hijriJs = fs.readFileSync(path.join(appDir, 'js', 'hijri.js'), 'utf8');
const zatcaJs = fs.readFileSync(path.join(appDir, 'js', 'zatca.js'), 'utf8');
const qrcodeJs = fs.readFileSync(path.join(appDir, 'js', 'qrcode.js'), 'utf8');
const html2pdfJs = fs.readFileSync(path.join(appDir, 'js', 'html2pdf.bundle.min.js'), 'utf8');
const i18nJs = fs.readFileSync(path.join(appDir, 'js', 'i18n.js'), 'utf8');
const dbJs = fs.readFileSync(path.join(appDir, 'js', 'db.js'), 'utf8');
const appJs = fs.readFileSync(path.join(appDir, 'js', 'app.js'), 'utf8');
// Embed default logo.svg as inline Data URI
const logoSvgPath = path.join(appDir, 'assets', 'logo.svg');
if (fs.existsSync(logoSvgPath)) {
  const logoSvg = fs.readFileSync(logoSvgPath, 'utf8');
  const logoDataUri = 'data:image/svg+xml;utf8,' + encodeURIComponent(logoSvg);
  html = html.replace(/src="assets\/logo\.svg"/g, `src="${logoDataUri}"`);
}

// Replace stylesheet link with inline <style>
html = html.replace('<link rel="stylesheet" href="css/styles.css">', `<style>\n${css}\n</style>`);

// Replace scripts with inline <script>
const combinedScripts = `
<script>
${tafqeetJs}
${hijriJs}
${zatcaJs}
${qrcodeJs}
${html2pdfJs}
${i18nJs}
${dbJs}
${appJs}
</script>
`;

html = html.replace(/<script src="js\/.*?"><\/script>/g, '');
html = html.replace('</body>', `${combinedScripts}\n</body>`);

const outPathAr = path.join(__dirname, 'الفاتورة_أوفلاين.html');
const outPathEn = path.join(__dirname, 'Mayar_Invoices_Offline.html');
fs.writeFileSync(outPathAr, html, 'utf8');
fs.writeFileSync(outPathEn, html, 'utf8');
console.log('Single-file offline bundle created at: ' + outPathEn + ' and ' + outPathAr);
