# 🧾 نظام إدارة الفواتير وعروض الأسعار المتوافق مع هيئة الزكاة والضريبة والجمارك (ZATCA)
### Bilingual Arabic/English Invoice & Quotation Management System + Android APK

[![Build Offline Android APK](https://github.com/Ayubkhokhar/invoice-generator-apk/actions/workflows/build-apk.yml/badge.svg)](https://github.com/Ayubkhokhar/invoice-generator-apk/actions/workflows/build-apk.yml)

---

## 🌐 1. Live Web App (GitHub Pages)
You can open and use the application directly in any browser (mobile, tablet, or desktop):
👉 **[Launch Live Web App](https://ayubkhokhar.github.io/invoice-generator-apk/)**

> **📱 Mobile PWA Installation:**
> - **Android (Chrome)**: Open the link and tap the prompt **" Install App\** or menu ⋮ → **\Add to Home screen\**.
> - **iOS / iPhone (Safari)**: Open the link, tap the **Share** button → **\Add to Home Screen\**.
> - Works **100% offline** once loaded.

---

## 📦 2. Android APK Download
For offline Android phones and tablets:
- 📥 **[Download MayarInvoices.apk (v1.0.0)](MayarInvoices.apk)**
- 📥 **[تحميل تطبيق الأندرويد (فاتورة معيار)](فاتورة_معيار.apk)**

---

## 💻 3. Single-File Offline Version (PC & Laptop)
Double-click and open directly in Chrome/Edge without any internet or server:
- 📄 **[Mayar_Invoices_Offline.html](Mayar_Invoices_Offline.html)** (1.17 MB standalone)
- 📄 **[الفاتورة_أوفلاين.html](الفاتورة_أوفلاين.html)**

---

## ✨ Features & Highlights

1. **🌐 Complete Bilingual Support (English / Arabic)**:
 - Full English interface by default with instant toggle [ EN | عربي ].
 - 3 Invoice Print Formats:
 - 🌐 **Bilingual (English + Arabic ZATCA)**
 - 🇸🇦 **Arabic Only (1:1 سلنو Replica)**
 - 🇬🇧 **English Only**

2. **🖼️ Middle Header Logo Customization**:
 - Upload any company logo from gallery/computer (PNG, JPG, SVG, WebP).
 - Smart canvas auto-compression to ensure optimal storage and crystal-clear printing.
 - One-click reset to default or complete removal.

3. **📱 ZATCA & Website QR Code Integration**:
 - Standard Phase 1 & Phase 2 ZATCA TLV Base64 QR Code.
 - **Website QR Mode**: Scan with smartphone camera to open company website.
 - Guaranteed inside-page boundary (zero spillage or margin clipping).

4. **🖨️ A4 1:1 Pixel-Perfect Printing & Native PDF Export**:
 - Native Android bridge for direct saving to Downloads/Invoices/ and instant WhatsApp/Email share.
 - High-fidelity PDF generation (html2pdf.js).
 - Tafqeet (Arabic & English currency number to words conversion).
 - Automatic Hijri & Gregorian dual calendar conversion.

5. **💾 100% Private Offline Data Storage**:
 - All invoices, customer directory, items directory, and company settings are saved locally using IndexedDB & LocalStorage.
 - Zero external tracking or mandatory servers.

---

## 🛠️ Project Structure

`
├── index.html # Main Web App Entry (for GitHub Pages root)
├── manifest.json # Progressive Web App (PWA) Manifest
├── sw.js # Service Worker for 100% Offline Caching
├── css/
│ └── styles.css # Responsive UI & Print Layout Styles
├── js/
│ ├── app.js # Core Application & Bridge Logic
│ ├── db.js # IndexedDB / LocalStorage Data Store
│ ├── i18n.js # Complete Arabic & English Translations
│ ├── html2pdf.bundle.min.js # Client-side High-Definition PDF Engine
│ ├── qrcode.js # SVG & Canvas QR Generator
│ ├── zatca.js # ZATCA TLV Base64 QR Encoder
│ ├── tafqeet.js # Arabic Numbers to Words Conversion
│ └── hijri.js # Gregorian to Umm al-Qura Hijri Calendar
├── assets/ # Icons & SVG Logos
├── android/ # Capacitor Android Studio Native Project
│ └── app/src/main/java/.../MainActivity.java # Native PDF & Print Java Bridge
├── MayarInvoices.apk # Compiled Native Android APK
└── Mayar_Invoices_Offline.html # Single-file all-in-one standalone HTML
`

---

## 📄 License
MIT License
