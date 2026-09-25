/**
 * Internationalization & Multilingual Engine
 * Default: English ('en')
 * Supported: 'en' (English), 'ar' (Arabic)
 * Print Formats: 'bilingual' (ZATCA Standard), 'en' (English Only), 'ar' (Arabic 1:1 سلنو.pdf)
 */

const I18N = {
  currentLang: 'en',
  printLang: 'bilingual',

  translations: {
    // Top Header
    appTitle: {
      en: 'Invoicing & Quotations System',
      ar: 'نظام إدارة الفواتير وعروض الأسعار'
    },
    appSubtitle: {
      en: 'ZATCA Saudi E-Invoicing Compliant',
      ar: 'متوافق مع هيئة الزكاة والضريبة والجمارك (ZATCA)'
    },
    btnNewInvoiceHeader: {
      en: '➕ New Invoice',
      ar: '➕ فاتورة جديدة'
    },
    btnSettingsHeader: {
      en: '⚙️ Settings',
      ar: '⚙️ الإعدادات'
    },

    // Navigation Tabs
    tabInvoices: {
      en: '📋 Invoices & Quotations',
      ar: '📋 الفواتير وعروض الأسعار'
    },
    tabEditor: {
      en: '✏️ Invoice Editor',
      ar: '✏️ محرر الفاتورة'
    },
    tabProducts: {
      en: '📦 Products Catalog',
      ar: '📦 المنتجات والتصنيفات'
    },
    tabCustomers: {
      en: '👥 Customers Directory',
      ar: '👥 دليل العملاء'
    },
    tabCompany: {
      en: '🏢 Company Profile',
      ar: '🏢 بيانات المنشأة'
    },
    tabBackup: {
      en: '💾 Backup & Restore',
      ar: '💾 النسخ الاحتياطي'
    },

    // Invoices List Tab
    invoicesListTitle: {
      en: 'Invoices & Quotations Log',
      ar: 'سجل الفواتير وعروض الأسعار'
    },
    btnCreateInvoice: {
      en: '➕ Create Invoice / Quotation',
      ar: '➕ إنشاء عرض سعر / فاتورة'
    },
    thDocNumber: {
      en: 'Doc No.',
      ar: 'رقم المستند'
    },
    thType: {
      en: 'Type',
      ar: 'النوع'
    },
    thDate: {
      en: 'Date',
      ar: 'التاريخ'
    },
    thCustomer: {
      en: 'Customer',
      ar: 'العميل'
    },
    thGrandTotal: {
      en: 'Total (Inc. VAT)',
      ar: 'الإجمالي شامل الضريبة'
    },
    thStatus: {
      en: 'Payment Status',
      ar: 'حالة الدفع'
    },
    thActions: {
      en: 'Actions',
      ar: 'الإجراءات'
    },
    statusPaid: {
      en: 'Paid in Full',
      ar: 'مدفوع بالكامل'
    },
    statusRemaining: {
      en: 'Balance Due: ',
      ar: 'متبقي: '
    },
    btnActionPrint: {
      en: '🖨️ View / PDF',
      ar: '🖨️ طباعة'
    },
    emptyInvoices: {
      en: 'No invoices found. Click "Create Invoice / Quotation" to start.',
      ar: 'لا توجد فواتير بعد. انقر على "إنشاء فاتورة جديدة" للبدء.'
    },

    // Invoice Editor - Meta Card
    editorMetaTitle: {
      en: 'Document & Customer Details',
      ar: 'بيانات المستند والعميل'
    },
    btnSaveDraft: {
      en: '💾 Save Record',
      ar: '💾 حفظ مسودة'
    },
    btnSaveAndPreview: {
      en: '🖨️ View & Print / PDF',
      ar: '🖨️ حفظ وعرض للطباعة'
    },
    lblDocType: {
      en: 'Document Type',
      ar: 'نوع المستند'
    },
    optSimplifiedTaxInvoice: {
      en: 'Simplified Tax Invoice (فاتورة ضريبية مبسطة)',
      ar: 'فاتورة ضريبية مبسطة (Simplified Tax Invoice)'
    },
    optTaxInvoice: {
      en: 'Tax Invoice (فاتورة ضريبية)',
      ar: 'فاتورة ضريبية (Tax Invoice)'
    },
    optQuotation: {
      en: 'Sales Quotation (عرض سعر مبيعات)',
      ar: 'عرض سعر مبيعات (Sales Quotation)'
    },
    lblDocNumber: {
      en: 'Sequential Doc No.',
      ar: 'رقم المستند (الرقم التسلسلي)'
    },
    lblDocDate: {
      en: 'Gregorian Date',
      ar: 'التاريخ الميلادي'
    },
    lblPaymentMethod: {
      en: 'Payment Method',
      ar: 'طريقة الدفع'
    },
    optPaymentCash: {
      en: 'Cash (نقدي)',
      ar: 'نقدي (Cash)'
    },
    optPaymentCredit: {
      en: 'Credit / On Account (آجل)',
      ar: 'آجل (Credit)'
    },
    optPaymentBank: {
      en: 'Bank Transfer (تحويل بنكي)',
      ar: 'تحويل بنكي (Bank Transfer)'
    },
    optPaymentCard: {
      en: 'Card / Mada (شبكة / مدى)',
      ar: 'شبكة / مدى (Card)'
    },
    lblDocHijri: {
      en: 'Hijri Date (الموافق)',
      ar: 'التاريخ الهجري (الموافق)'
    },
    lblDocTime: {
      en: 'Time',
      ar: 'الوقت'
    },
    lblCostCenter: {
      en: 'Cost Center',
      ar: 'مركز التكلفة'
    },
    lblWarehouse: {
      en: 'Warehouse / Store',
      ar: 'المستودع'
    },
    lblSalesRep: {
      en: 'Sales Representative',
      ar: 'المندوب'
    },
    lblCurrency: {
      en: 'Currency',
      ar: 'العملة'
    },
    lblExchangeRate: {
      en: 'Exchange Rate',
      ar: 'سعر الصرف'
    },
    lblRefNo: {
      en: 'Reference No. (Ref)',
      ar: 'رقم المرجع (Ref)'
    },
    lblOrderNo: {
      en: 'Order No. (PO)',
      ar: 'رقم الطلبية (Order)'
    },
    lblCustomerPicker: {
      en: 'Choose Saved Customer',
      ar: 'اختيار العميل المحفوظ'
    },
    optNewCustomer: {
      en: '-- Or Enter Customer Below --',
      ar: '-- أو أدخل بيانات العميل أدناه --'
    },
    lblCustomerName: {
      en: 'Customer / Company Name',
      ar: 'اسم العميل المطبوع بالفاتورة'
    },
    lblCustomerTax: {
      en: 'Customer VAT No. (15 digits)',
      ar: 'الرقم الضريبي للعميل (15 رقم)'
    },
    lblCustomerCr: {
      en: 'Commercial Reg. (CR No.)',
      ar: 'السجل التجاري'
    },
    lblCustomerPhone: {
      en: 'Customer Phone / Mobile',
      ar: 'رقم جوال / هاتف العميل'
    },
    lblCustomerDest: {
      en: 'Destination / City',
      ar: 'المدينة / الوجهة'
    },
    lblCustomerPostal: {
      en: 'Postal Code (الرمز البريدي)',
      ar: 'الرمز البريدي (Postal Code)'
    },
    lblCustomerAddress: {
      en: 'Customer Address',
      ar: 'العنوان بالتفصيل'
    },
    lblCustomerRep: {
      en: 'Customer Representative',
      ar: 'ممثل العميل'
    },
    step1Heading: {
      en: 'Customer & Client Information',
      ar: 'بيانات العميل (الاسم، الضريبة، الجوال، العنوان)'
    },
    lblMoreDetailsSummary: {
      en: '⚙️ Optional System Defaults & References (Sales Rep, Warehouse, Cost Center, Hijri Date) - [Prefixed]',
      ar: '⚙️ إعدادات النظام والمراجع الاختيارية (المندوب، المستودع، مركز التكلفة، التاريخ الهجري) - [افتراضي]'
    },
    titleSelectProduct: {
      en: 'Select Product From Catalog',
      ar: 'اختيار صنف من الكتالوج'
    },

    // Invoice Line Items
    secItemsHeading: {
      en: 'Select Products & Enter QTY',
      ar: 'اختيار الأصناف وإدخال الكمية (حساب آلي)'
    },
    btnAddFromCatalog: {
      en: '📦 Browse Catalog',
      ar: '📦 اختيار من الكتالوج'
    },
    btnAddCustomLine: {
      en: '➕ Add Custom Item',
      ar: '➕ بند مخصص جديد'
    },
    colSr: {
      en: '#',
      ar: 'م'
    },
    colCode: {
      en: 'Item Code',
      ar: 'ر.الصنف'
    },
    colDesc: {
      en: 'Description / Item Name',
      ar: 'البيـــان / اسم الصنف'
    },
    colUnit: {
      en: 'Unit',
      ar: 'الوحدة'
    },
    colQty: {
      en: 'Qty',
      ar: 'الكمية'
    },
    colPrice: {
      en: 'Unit Price',
      ar: 'السعر'
    },
    colNet: {
      en: 'Net Total',
      ar: 'الصافي'
    },
    colVatRate: {
      en: 'VAT %',
      ar: 'الضريبة'
    },
    colVatAmt: {
      en: 'VAT Amount',
      ar: 'قيمة الضريبة'
    },
    colTotalWithVat: {
      en: 'Total (Inc. VAT)',
      ar: 'الصافي+الضريبة'
    },

    // Adjustments & Summary
    titleAdjustments: {
      en: 'Adjustments & Payment Terms',
      ar: 'التسويات والدفع'
    },
    lblAdditions: {
      en: 'Additions / Fees',
      ar: 'الإضافات (Additions)'
    },
    lblDiscountPercent: {
      en: 'Discount %',
      ar: 'نسبة الخصم %'
    },
    lblDiscountAmount: {
      en: 'Discount Amount',
      ar: 'مبلغ الخصم النقدي'
    },
    lblPaidAmount: {
      en: 'Paid Amount',
      ar: 'المبلغ المدفوع'
    },
    lblInvoiceNotes: {
      en: 'Notes & Invoice Terms',
      ar: 'ملاحظات وشروط الفاتورة'
    },
    phInvoiceNotes: {
      en: 'Enter payment terms or notes printed at the bottom of the invoice...',
      ar: 'ملاحظات تظهر أسفل الفاتورة...'
    },

    // Totals Breakdown Card
    titleSummaryCard: {
      en: 'Financial Totals Breakdown',
      ar: 'ملخص الحسابات'
    },
    lblCurrencyCode: {
      en: 'Currency: SAR (Saudi Riyal)',
      ar: 'العملة: ريال سعودي'
    },
    lblSubtotalSummary: {
      en: 'Subtotal (Excl. VAT):',
      ar: 'الإجمالي (قبل الخصم والضريبة):'
    },
    lblAdditionsSummary: {
      en: 'Additions:',
      ar: 'الإضافات:'
    },
    lblGrossSummary: {
      en: 'Total Gross:',
      ar: 'الإجمالي الكلي:'
    },
    lblDiscountSummary: {
      en: 'Discount Amount:',
      ar: 'قيمة الخصم:'
    },
    lblNetSummary: {
      en: 'Net Amount (After Discount):',
      ar: 'الصافي (بعد الخصم):'
    },
    lblVatSummary: {
      en: 'Total VAT Amount:',
      ar: 'إجمالي ضريبة القيمة المضافة:'
    },
    lblGrandTotalSummary: {
      en: 'Grand Total (Inc. VAT):',
      ar: 'الصافي شامل ض.ق (VAT):'
    },
    lblTotalQtySummary: {
      en: 'Total Quantity:',
      ar: 'إجمالي الكمية:'
    },
    lblPaidSummary: {
      en: 'Paid Amount:',
      ar: 'المدفوع:'
    },
    lblRemainingSummary: {
      en: 'Balance Due:',
      ar: 'المتبقي:'
    },

    // Bottom Action Buttons
    btnResetDraft: {
      en: '🔄 Reset / New Form',
      ar: '🔄 تفريغ وإعادة تعيين'
    },
    btnBottomPrint: {
      en: '🖨️ View & Print / Download PDF (A4)',
      ar: '🖨️ حفظ وعرض الفاتورة للطباعة (A4)'
    },

    // Products Tab
    productsHeading: {
      en: 'Products & Price Catalog',
      ar: 'قائمة المنتجات والأسعار'
    },
    btnAddProduct: {
      en: '➕ Add New Product',
      ar: '➕ إضافة منتج جديد'
    },
    colSku: {
      en: 'Item Code (SKU)',
      ar: 'رقم الصنف (SKU)'
    },
    colProdName: {
      en: 'Product Name / Description',
      ar: 'اسم الصنف / البيان'
    },
    colProdCategory: {
      en: 'Category',
      ar: 'التصنيف'
    },
    colProdUnit: {
      en: 'Unit',
      ar: 'الوحدة'
    },
    colProdPrice: {
      en: 'Base Price',
      ar: 'السعر الأساسي'
    },
    colProdVat: {
      en: 'VAT %',
      ar: 'نسبة الضريبة'
    },
    emptyProducts: {
      en: 'No products in catalog yet. Click "Add New Product" to create one.',
      ar: 'لا توجد منتجات مسجلة. أضف منتجك الأول الآن.'
    },

    // Customers Tab
    customersHeading: {
      en: 'Customers & Companies Directory',
      ar: 'دليل العملاء والشركات'
    },
    btnAddCustomer: {
      en: '➕ Add New Customer',
      ar: '➕ إضافة عميل جديد'
    },
    colCustName: {
      en: 'Customer / Company Name',
      ar: 'اسم العميل / المؤسسة'
    },
    colCustTax: {
      en: 'VAT Number (15 digits)',
      ar: 'الرقم الضريبي'
    },
    colCustCr: {
      en: 'CR Number',
      ar: 'السجل التجاري'
    },
    colCustPhone: {
      en: 'Phone / Mobile',
      ar: 'الهاتف / الجوال'
    },
    colCustAddress: {
      en: 'City / Address',
      ar: 'المدينة / العنوان'
    },
    emptyCustomers: {
      en: 'No customers saved yet. Click "Add New Customer" to add your clients.',
      ar: 'لا يوجد عملاء مسجلين. أضف عميلك الأول الآن.'
    },

    // Company Settings Tab
    settingsHeading: {
      en: 'Company Profile & Invoice Branding Settings',
      ar: 'إعدادات المنشأة وترويسة الفواتير (طباعة 1:1)'
    },
    lblCompNameEn: {
      en: 'Company Name (English)',
      ar: 'اسم المنشأة باللغة الإنجليزية'
    },
    lblCompNameAr: {
      en: 'Company Name (Arabic)',
      ar: 'اسم المنشأة باللغة العربية'
    },
    lblCompTax: {
      en: 'VAT Registration Number (15 Digits)',
      ar: 'الرقم الضريبي للمنشأة (15 رقم)'
    },
    lblCompBranch: {
      en: 'Branch Name / Code',
      ar: 'اسم أو رقم الفرع'
    },
    lblCompCr: {
      en: 'Commercial Registration (CR No.)',
      ar: 'رقم السجل التجاري'
    },
    lblCompPhone: {
      en: 'Phone / Landline',
      ar: 'الهاتف / الجوال'
    },
    lblCompAddress: {
      en: 'Physical Address',
      ar: 'العنوان'
    },
    lblNextInvNo: {
      en: 'Next Invoice Number',
      ar: 'الرقم التسلسلي التالي للفاتورة'
    },
    lblNextQuoteNo: {
      en: 'Next Quotation Number',
      ar: 'الرقم التسلسلي التالي لعرض السعر'
    },
    lblCompLogo: {
      en: '🏢 Middle Header Logo (Center Branding)',
      ar: '🏢 شعار المنشأة بالمنتصف (ترويسة الفاتورة)'
    },
    helpCompLogo: {
      en: 'This logo is placed exactly in the middle of the invoice header between the English and Arabic company names.',
      ar: 'يظهر هذا الشعار في منتصف ترويسة الفاتورة المطبوعة بين اسم المنشأة بالإنجليزي واسمها بالعربي.'
    },
    btnUploadLogo: {
      en: '📁 Upload New Logo',
      ar: '📁 رفع وتغيير الشعار'
    },
    btnResetLogo: {
      en: '🔄 Reset to Default',
      ar: '🔄 استعادة الشعار الأصلي'
    },
    btnRemoveLogo: {
      en: '🗑️ Remove Logo',
      ar: '🗑️ إزالة الشعار'
    },
    helpLogoFormats: {
      en: 'Supports PNG, JPG, SVG, WebP. High-res images are automatically optimized for crisp printing.',
      ar: 'يدعم صور PNG, JPG, SVG, WebP. يتم تحسين الصورة آلياً لتظهر بأعلى دقة عند الطباعة.'
    },
    headingQrSettings: {
      en: '📱 QR Code Configuration (Print & Scanner)',
      ar: '📱 إعدادات رمز الاستجابة السريع (QR Code)'
    },
    lblEnableQrCode: {
      en: 'Show QR Code on Invoices & Quotations',
      ar: 'إظهار رمز QR في الفواتير وعروض الأسعار'
    },
    lblQrCodeType: {
      en: 'QR Code Content / Mode',
      ar: 'محتوى نوع رمز الـ QR'
    },
    optQrWebsite: {
      en: '🌐 Company Website URL (Opens Website on Scan)',
      ar: '🌐 رابط موقع المنشأة (يفتح موقع الشركة عند المسح)'
    },
    optQrZatca: {
      en: '🇸🇦 ZATCA Saudi Tax E-Invoice (TLV Base64)',
      ar: '🇸🇦 فاتورة إلكترونية معتمدة لهيئة الزكاة والضريبة (ZATCA)'
    },
    lblWebsiteUrl: {
      en: 'Client Website URL',
      ar: 'رابط موقع الشركة الإلكتروني'
    },
    helpWebsiteUrl: {
      en: 'When customers scan the QR code with phone camera, it opens this website directly.',
      ar: 'عند مسح الرمز بكاميرا الجوال، سيفتح موقع الشركة مباشرة.'
    },
    lblZatcaQrOption: {
      en: 'Enable ZATCA Phase 1 & 2 Electronic QR Code',
      ar: 'تضمين رمز الاستجابة السريعة (QR Code) المعتمد من هيئة الزكاة'
    },
    btnSaveSettings: {
      en: '💾 Save Profile Settings',
      ar: '💾 حفظ التغييرات والإعدادات'
    },

    // Backup Tab
    backupHeading: {
      en: 'Offline Backup & Data Recovery',
      ar: 'النسخ الاحتياطي واستعادة البيانات (بدون إنترنت)'
    },
    backupDesc: {
      en: 'All your data (invoices, products, customers, and company settings) is stored 100% locally and offline on your device. You can export a JSON backup at any time or restore it on another phone or computer.',
      ar: 'جميع بياناتك محفوظة محلياً على جهازك دون الحاجة لإنترنت. يمكنك تصدير نسخة احتياطية أو استعادتها بأمان في أي وقت.'
    },
    btnExportBackup: {
      en: '📥 Download JSON Backup File',
      ar: '📥 تصدير وحفظ نسخة احتياطية (JSON)'
    },
    btnImportBackup: {
      en: '📤 Restore From Backup File',
      ar: '📤 استيراد واستعادة من ملف'
    },
    btnResetAll: {
      en: '⚠️ Reset to Initial Demo Data',
      ar: '⚠️ تهيئة وإعادة البيانات الافتراضية'
    },

    // Print & PDF Modal
    printModalTitle: {
      en: 'Print & PDF Preview (A4)',
      ar: 'معاينة الطباعة (A4)'
    },
    lblPrintFormat: {
      en: 'Invoice Print Format:',
      ar: 'نموذج الفاتورة للطباعة:'
    },
    optPrintBilingual: {
      en: '🌐 Bilingual (English + Arabic ZATCA)',
      ar: '🌐 مختلط عربي / English (معتمد هيئة الزكاة)'
    },
    optPrintArabic: {
      en: '🇸🇦 Arabic Only (1:1 سلنو.pdf)',
      ar: '🇸🇦 عربي بالكامل (1:1 سلنو)'
    },
    optPrintEnglish: {
      en: '🇬🇧 English Only',
      ar: '🇬🇧 English Only'
    },
    btnDownloadPdfFile: {
      en: '📥 Download PDF (.pdf)',
      ar: '📥 تحميل كملف PDF'
    },
    btnPrintNative: {
      en: '🖨️ Print / Save as PDF',
      ar: '🖨️ طباعة / حفظ كـ PDF'
    },
    btnCloseModal: {
      en: 'Close',
      ar: 'إغلاق'
    },

    // Alerts & Confirmations
    msgInvoiceSaved: {
      en: 'Invoice saved successfully!',
      ar: 'تم حفظ الفاتورة بنجاح!'
    },
    msgConfirmDeleteInv: {
      en: 'Are you sure you want to delete this invoice?',
      ar: 'هل أنت متأكد من حذف هذه الفاتورة؟'
    },
    msgConfirmDeleteProd: {
      en: 'Are you sure you want to delete this product?',
      ar: 'هل أنت متأكد من حذف هذا المنتج؟'
    },
    msgConfirmDeleteCust: {
      en: 'Are you sure you want to delete this customer?',
      ar: 'هل أنت متأكد من حذف هذا العميل؟'
    },
    msgSettingsSaved: {
      en: 'Settings saved successfully!',
      ar: 'تم حفظ الإعدادات بنجاح!'
    },
    msgPdfGenerating: {
      en: 'Generating PDF document, please wait...',
      ar: 'جاري إنشاء ملف PDF، يرجى الانتظار...'
    }
  },

  // -------------------------------------------------------------------------
  // INVOICE PRINT TEMPLATE DICTIONARY (For A4 rendered output)
  // -------------------------------------------------------------------------
  invoice: {
    en: {
      quotationTitle: 'SALES QUOTATION',
      taxInvoiceTitle: 'TAX INVOICE',
      proformaTitle: 'PROFORMA INVOICE',
      page: 'Page:',
      costCenter: 'Cost Center:',
      salesRep: 'Sales Rep:',
      warehouse: 'Warehouse:',
      docNumber: 'Doc No:',
      docType: 'Type:',
      paymentMethod: 'Payment Method:',
      paymentCash: 'Cash',
      paymentCredit: 'Credit / On Account',
      paymentBank: 'Bank Transfer',
      paymentCard: 'Card / Mada',
      refNo: 'Reference:',
      orderNo: 'Order No:',
      rate: 'Rate:',
      currency: 'Currency:',
      currencyUnit: 'SAR',
      date: 'Date:',
      hijri: 'Hijri:',
      time: 'Time:',
      customer: 'Customer:',
      address: 'Address:',
      balance: 'Payment Method:',
      taxNumber: 'Tax Number:',
      destination: 'Destination:',
      crNumber: 'CR Number:',
      repLabel: 'Customer Rep',
      competitorsLabel: 'Competitors',
      thSr: 'Sr.',
      thCode: 'Item Code',
      thDesc: 'Description',
      thUnit: 'Unit',
      thQty: 'Qty',
      thPrice: 'Price',
      thNet: 'Net Amount',
      thVatHeader: 'Value Added Tax (VAT)',
      thVatRate: '%',
      thVatAmt: 'Amount',
      thTotalWithVat: 'Total (Inc. VAT)',
      subtotal: 'Subtotal',
      additions: 'Additions',
      grossTotal: 'Gross Total',
      discount: 'Discount',
      netTotal: 'Net Total',
      vatRow: 'Total VAT',
      grandTotal: 'Grand Total (Inc. VAT)',
      paid: 'Paid Amount',
      remaining: 'Remaining Due',
      totalQty: 'Total Quantity',
      user: 'User:',
      version: 'Version:',
      notes: 'Notes & Terms:',
      receiverSign: 'Receiver Signature: .................................',
      sellerSign: 'Authorized Seller: .................................',
      zatcaStamp: 'ZATCA E-Invoice Compliant',
      websiteStamp: 'Scan to Visit Website'
    },

    bilingual: {
      quotationTitle: 'عرض سعر مبيعات / Sales Quotation',
      taxInvoiceTitle: 'فاتورة ضريبية / Tax Invoice',
      proformaTitle: 'فاتورة أولية / Proforma Invoice',
      page: 'الصفحة / Page:',
      costCenter: 'م.التكلفة / Cost Ctr:',
      salesRep: 'المندوب / Rep:',
      warehouse: 'المستودع / Store:',
      docNumber: 'الرقم / No:',
      docType: 'النوع / Type:',
      paymentMethod: 'طريقة الدفع / Payment:',
      paymentCash: 'نقدي / Cash',
      paymentCredit: 'آجل / Credit',
      paymentBank: 'تحويل بنكي / Bank Transfer',
      paymentCard: 'شبكة (مدى) / Card',
      refNo: 'المرجع / Ref:',
      orderNo: 'الطلبية / Order:',
      rate: 'الصرف / Rate:',
      currency: 'العملة / Currency:',
      currencyUnit: 'SAR ر.س',
      date: 'التاريخ / Date:',
      hijri: 'الموافق / Hijri:',
      time: 'الوقت / Time:',
      customer: 'العميل / Customer',
      address: 'العنوان / Address:',
      balance: 'طريقة الدفع / Payment',
      taxNumber: 'الرقم الضريبي / Tax No',
      destination: 'الوجهة / Dest',
      crNumber: 'السجل / CR No',
      repLabel: 'ممثل العميل / Rep',
      competitorsLabel: 'المنافسين / Comp',
      thSr: 'م<br><span style="font-size:8.5px;font-weight:normal;">Sr</span>',
      thCode: 'ر.الصنف<br><span style="font-size:8.5px;font-weight:normal;">Code</span>',
      thDesc: 'البيــــان<br><span style="font-size:8.5px;font-weight:normal;">Description</span>',
      thUnit: 'الوحدة<br><span style="font-size:8.5px;font-weight:normal;">Unit</span>',
      thQty: 'الكمية<br><span style="font-size:8.5px;font-weight:normal;">Qty</span>',
      thPrice: 'السعر<br><span style="font-size:8.5px;font-weight:normal;">Price</span>',
      thNet: 'الصافي<br><span style="font-size:8.5px;font-weight:normal;">Net</span>',
      thVatHeader: 'ضريبة القيمة المضافة / VAT',
      thVatRate: '%',
      thVatAmt: 'القيمة / Amt',
      thTotalWithVat: 'الصافي+الضريبة<br><span style="font-size:8.5px;font-weight:normal;">Total Incl. VAT</span>',
      subtotal: 'الإجمالي / Subtotal',
      additions: 'الإضافات / Additions',
      grossTotal: 'الإجمالي الكلي / Gross Total',
      discount: 'الخصم / Discount',
      netTotal: 'الصافي / Net Total',
      vatRow: 'ضريبة القيمة المضافة / Total VAT',
      grandTotal: 'الصافي شامل الضريبة / Grand Total',
      paid: 'المدفوع / Paid',
      remaining: 'المتبقي / Balance',
      totalQty: 'إجمالي الكمية / Total Qty',
      user: 'المستخدم / User:',
      version: 'النسخة / Ver:',
      notes: 'ملاحظات / Notes:',
      receiverSign: 'المستلم / Receiver: ...........................',
      sellerSign: 'البائع / Seller: ...........................',
      zatcaStamp: 'فاتورة إلكترونية معتمدة / ZATCA Compliant',
      websiteStamp: 'امسح لزيارة الموقع / Scan Website'
    },

    ar: {
      quotationTitle: 'عرض سعر مبيعات',
      taxInvoiceTitle: 'فاتورة ضريبية',
      proformaTitle: 'فاتورة أولية',
      page: 'الصفحة:',
      costCenter: 'م.التكلفة:',
      salesRep: 'المندوب :',
      warehouse: 'المستودع :',
      docNumber: 'الرقم :',
      docType: 'النوع :',
      paymentMethod: 'طريقة الدفع:',
      paymentCash: 'نقدي',
      paymentCredit: 'آجل',
      paymentBank: 'تحويل بنكي',
      paymentCard: 'شبكة (مدى)',
      refNo: 'المرجع :',
      orderNo: 'الطلبية :',
      rate: 'الصرف :',
      currency: 'العملة :',
      currencyUnit: 'SR ريال',
      date: 'التاريخ:',
      hijri: 'الموافق:',
      time: 'الوقت:',
      customer: 'العميل',
      address: 'العنــوان :',
      balance: 'طريقة الدفع',
      taxNumber: 'برقم ضريبي',
      destination: 'الوجهة',
      crNumber: 'ر.السجل',
      repLabel: 'ممثل العميل',
      competitorsLabel: 'المنافسين',
      thSr: 'م',
      thCode: 'ر.الصنف',
      thDesc: 'البيــــان',
      thUnit: 'الوحدة',
      thQty: 'الكمية',
      thPrice: 'السعر',
      thNet: 'الصافي',
      thVatHeader: 'ضريبة قيمة مضافة',
      thVatRate: '%',
      thVatAmt: 'القيمة',
      thTotalWithVat: 'الصافي+الضريبة',
      subtotal: 'الاجمــالي',
      additions: 'الاضـافــات',
      grossTotal: 'الاجمالي الكلي',
      discount: 'الخصـم',
      netTotal: 'الصـافي',
      vatRow: 'إجمالي ضريبة القيمة المضافة',
      grandTotal: 'الصافي شامل ض.ق VAT',
      paid: 'المدفوع',
      remaining: 'المتبقي',
      totalQty: 'إجمالي الكمية',
      user: 'المستخدم :',
      version: 'رقم النسخة :',
      notes: 'ملاحظات :',
      receiverSign: 'المستلـــــم : .................................',
      sellerSign: 'البــــــائــــــــــــع : .................................',
      zatcaStamp: 'فاتورة إلكترونية معتمدة',
      websiteStamp: 'امسح لزيارة موقع المنشأة'
    }
  },

  // -------------------------------------------------------------------------
  // INITIALIZATION & TOGGLE
  // -------------------------------------------------------------------------
  init: function() {
    this.currentLang = this.getLanguage();
    this.printLang = this.getPrintLanguage();
    this.setLanguage(this.currentLang);
  },

  getLanguage: function() {
    // Default to 'en' unless user explicitly chose otherwise
    return localStorage.getItem('mjc_lang') || 'en';
  },

  setLanguage: function(lang) {
    if (!['en', 'ar'].includes(lang)) lang = 'en';
    this.currentLang = lang;
    localStorage.setItem('mjc_lang', lang);

    const isAr = (lang === 'ar');
    document.documentElement.dir = isAr ? 'rtl' : 'ltr';
    document.documentElement.lang = isAr ? 'ar' : 'en';

    this.applyTranslations();

    // Re-render lists to update status texts and action buttons
    if (typeof App !== 'undefined') {
      if (App.activeTab === 'invoices-tab') App.renderInvoicesList();
      if (App.activeTab === 'products-tab') App.renderProductsList();
      if (App.activeTab === 'customers-tab') App.renderCustomersList();
      if (App.currentInvoice) App.recalculateInvoice();
    }
  },

  toggleLanguage: function() {
    const nextLang = (this.currentLang === 'en') ? 'ar' : 'en';
    this.setLanguage(nextLang);
  },

  getPrintLanguage: function() {
    return localStorage.getItem('mjc_print_lang') || 'bilingual';
  },

  setPrintLanguage: function(lang) {
    if (!['bilingual', 'ar', 'en'].includes(lang)) lang = 'bilingual';
    this.printLang = lang;
    localStorage.setItem('mjc_print_lang', lang);

    document.querySelectorAll('.btn-print-lang').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.plang === lang);
    });

    if (typeof App !== 'undefined' && App.currentInvoice) {
      App.renderPrintInvoiceTemplate(App.currentInvoice, lang);
    }
  },

  applyTranslations: function() {
    const lang = this.currentLang;

    // Elements with data-i18n (textContent)
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      if (this.translations[key] && this.translations[key][lang] !== undefined) {
        el.textContent = this.translations[key][lang];
      }
    });

    // Elements with data-i18n-html (HTML content)
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.dataset.i18nHtml;
      if (this.translations[key] && this.translations[key][lang] !== undefined) {
        el.innerHTML = this.translations[key][lang];
      }
    });

    // Elements with data-i18n-ph (Placeholder)
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
      const key = el.dataset.i18nPh;
      if (this.translations[key] && this.translations[key][lang] !== undefined) {
        el.placeholder = this.translations[key][lang];
      }
    });

    // Update state on 2-way pill switch
    const toggleEn = document.getElementById('lang-switch-en');
    const toggleAr = document.getElementById('lang-switch-ar');
    if (toggleEn) toggleEn.classList.toggle('active', lang === 'en');
    if (toggleAr) toggleAr.classList.toggle('active', lang === 'ar');
  },

  t: function(key) {
    if (this.translations[key] && this.translations[key][this.currentLang] !== undefined) {
      return this.translations[key][this.currentLang];
    }
    return key;
  },

  getInvoiceLabels: function(lang) {
    const target = lang || this.printLang || 'bilingual';
    return this.invoice[target] || this.invoice['bilingual'];
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = I18N;
}
