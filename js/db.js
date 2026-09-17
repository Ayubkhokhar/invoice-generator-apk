/**
 * Local Database Management for Invoicing App
 * Uses localStorage for fast, 100% offline, persistent storage
 */
const DB = {
  KEYS: {
    PRODUCTS: 'mjc_products',
    CATEGORIES: 'mjc_categories',
    UNITS: 'mjc_units',
    CUSTOMERS: 'mjc_customers',
    INVOICES: 'mjc_invoices',
    SETTINGS: 'mjc_settings'
  },

  init: function() {
    if (!localStorage.getItem(this.KEYS.SETTINGS)) {
      this.seedDefaultData();
    }
  },

  seedDefaultData: function() {
    const defaultSettings = {
      companyNameAr: 'شركة زين المتقدمة التجارية بالجملة',
      companyNameEn: 'ZAIN ADVANCED TRADING COMPANY',
      activityAr: 'خردوات والقرطاسية وأدوات التجميل بالجملة',
      activityEn: 'Sundries, Stationary & Cosmetics Wholesale',
      addressAr: 'جدة - المحجر - دوار النجوم - مركز النجوم',
      addressEn: 'Jeddah - Mahjar - Dawar Nojoom - Nujoom Center',
      buildingAr: 'حي المحجر - رقم المبنى ٨٢٠٥ - رقم إضافي ٣٧٣١',
      buildingEn: 'Mahjar - Building No. 8205 - Secondary No. 3731',
      postalAr: 'رمز بريدي ٢٢٤٢١ - جدة - المملكة العربية السعودية',
      postalEn: 'Postal Code 22421 - Jeddah - K.S.A',
      phonesAr: '012 608 6220 / 055 886 3822 / 050 587 8700',
      phonesEn: '012 608 6220 / 055 886 3822 / 050 587 8700',
      email: 'wholesalezain@gmail.com',
      taxNumber: '311186943400003',
      crNumber: '4030294347',
      branch: 'فرع 1 - 001',
      costCenter: 'م.تكلفة 1 - 001',
      warehouse: 'مستودع 1 - 01',
      salesRep: '10-المدير',
      currency: 'SR ريال',
      currencySubunit: 'هللة',
      exchangeRate: 1,
      defaultVatRate: 15,
      nextQuotationNumber: 64,
      nextInvoiceNumber: 135746,
      showZatcaQr: true,
      qrType: 'zatca',
      websiteUrl: 'https://www.mayarjeddah.com',
      logoUrl: 'assets/zain_logo.svg',
      notes: '',
      bank1Name: 'SNB',
      bank1Account: 'شركة زين المتقدمة التجارية',
      bank1Iban: 'SA0510000011500000186902',
      bank2Name: 'Al Rajhi Bank',
      bank2Account: 'شركة زين المتقدمة التجارية',
      bank2Iban: 'SA0880000 471608010461457',
      activeTemplate: 'zain'
    };

    const defaultCategories = [
      { id: 'cat_1', name: 'منظفات', nameEn: 'Cleaning Materials' },
      { id: 'cat_2', name: 'مواد غذائية', nameEn: 'Foodstuffs' },
      { id: 'cat_3', name: 'بلاستيك', nameEn: 'Plastic' },
      { id: 'cat_4', name: 'عام', nameEn: 'General' }
    ];

    const defaultUnits = [
      'كرتون', 'حبة', 'جالون', 'طرد', 'درزن', 'كيلو', 'لتر', 'علبة', 'PAK', 'DOZ'
    ];

    const defaultProducts = [
      {
        id: 'prod_101',
        code: '1010101681',
        name: 'GLOVES COTTON TAIWAN - WHITE',
        nameAr: 'جوانتي ابيض تايواني',
        category: 'عام',
        unit: 'PAK',
        packing: '1X48X10',
        price: 5.00,
        vatRate: 15,
        stock: 1000,
        notes: ''
      },
      {
        id: 'prod_102',
        code: '1006542',
        name: 'SHALIS SPRAY 50 ML - WOMEN',
        nameAr: 'شاليسنسائى 50 مل',
        category: 'عام',
        unit: 'DOZ',
        packing: '1X6X8',
        price: 298.00,
        vatRate: 15,
        stock: 500,
        notes: ''
      },
      {
        id: 'prod_96',
        code: '96',
        name: 'كلوركس وسط ابو 1* 18*950مل',
        nameEn: 'Clorox (1x18)',
        category: 'منظفات',
        unit: 'كرتون',
        packing: '1X18',
        price: 84.00,
        vatRate: 15,
        stock: 500,
        notes: ''
      },
      {
        id: 'prod_95',
        code: '95',
        name: 'كلوركس 1* 1.8*8جوالين',
        nameEn: 'Clorox (8x1.89)',
        category: 'منظفات',
        unit: 'كرتون',
        packing: '1X8',
        price: 65.00,
        vatRate: 15,
        stock: 450,
        notes: ''
      }
    ];

    const defaultCustomers = [
      {
        id: 'cust_1',
        name: 'سونو',
        nameEn: 'SONU',
        taxNumber: 'لايوجد',
        crNumber: '',
        address: 'جدة - شارع المحجر',
        district: 'المحجر',
        cityName: 'جدة',
        countryName: 'المملكة العربية السعودية',
        phone: '0558863822',
        destination: 'محلي',
        representative: 'SONU',
        balance: '0.00'
      },
      {
        id: 'cust_2',
        name: 'شركة معيار جده للتجارة',
        nameEn: 'Mayar Jeddah Trading Co',
        taxNumber: '311193748100003',
        crNumber: '4030142891',
        address: 'حي المحجر، جده',
        district: 'المحجر',
        cityName: 'جدة',
        countryName: 'المملكة العربية السعودية',
        phone: '+966-240742691370',
        destination: 'محلي',
        representative: '',
        balance: '48,710.780'
      }
    ];

    const sampleInvoice = {
      id: 'inv_135744',
      type: 'simplified_tax_invoice',
      typeNameAr: 'فاتورة ضريبية مبسطة',
      typeNameEn: 'Simplified Tax Invoice',
      number: '135744',
      date: '2026-09-08',
      hijriDate: '1448-03-25',
      time: '10:15:20',
      orderNo: '',
      refNo: '',
      currency: 'SR ريال',
      exchangeRate: 1,
      costCenter: 'م.تكلفة 1 - 001',
      salesRep: '10-المدير',
      warehouse: 'مستودع 1 - 01',
      pageInfo: 'Page 1 of 1',
      paymentMethod: 'cash',
      customer: {
        id: 'cust_1',
        name: 'سونو / SONU',
        taxNumber: 'لايوجد',
        crNumber: '',
        address: 'جدة - شارع المحجر',
        district: 'المحجر',
        cityName: 'جدة',
        countryName: 'المملكة العربية السعودية',
        phone: '0558863822',
        destination: 'محلي',
        representative: 'SONU',
        balance: '0.00',
        competitors: ''
      },
      items: [
        {
          sr: 1,
          code: '1010101681',
          description: 'GLOVES COTTON TAIWAN - WHITE / جوانتي ابيض تايواني',
          unit: 'PAK',
          packing: '1X48X10',
          quantity: 2.00,
          price: 5.00,
          net: 10.00,
          vatRate: 15,
          vatAmount: 1.50,
          totalWithVat: 11.50
        },
        {
          sr: 2,
          code: '1006542',
          description: 'SHALIS SPRAY 50 ML - WOMEN / شاليسنسائى 50 مل',
          unit: 'DOZ',
          packing: '1X6X8',
          quantity: 0.25,
          price: 298.00,
          net: 74.50,
          vatRate: 15,
          vatAmount: 11.18,
          totalWithVat: 85.68
        }
      ],
      totalQuantity: 2.25,
      subtotal: 84.50,
      additions: 0.00,
      grossTotal: 84.50,
      discountPercent: 0,
      discountAmount: 0.00,
      netTotal: 84.50,
      vatTotal: 12.68,
      grandTotal: 97.18,
      tafqeet: 'فقط سبعة وتسعون ريال و ثمانية عشر هللة لاغير',
      paidAmount: 97.18,
      remainingAmount: 0.00,
      user: 'FARUK 18.15 qa',
      versionNo: 0,
      notes: '',
      status: 'paid',
      createdAt: '2026-09-08T10:15:20Z'
    };

    localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(defaultSettings));
    localStorage.setItem(this.KEYS.CATEGORIES, JSON.stringify(defaultCategories));
    localStorage.setItem(this.KEYS.UNITS, JSON.stringify(defaultUnits));
    localStorage.setItem(this.KEYS.PRODUCTS, JSON.stringify(defaultProducts));
    localStorage.setItem(this.KEYS.CUSTOMERS, JSON.stringify(defaultCustomers));
    localStorage.setItem(this.KEYS.INVOICES, JSON.stringify([sampleInvoice]));
  },

  // Settings
  getSettings: function() {
    const s = localStorage.getItem(this.KEYS.SETTINGS);
    const parsed = s ? JSON.parse(s) : {};
    return Object.assign({
      companyNameAr: 'شركة زين المتقدمة التجارية بالجملة',
      companyNameEn: 'ZAIN ADVANCED TRADING COMPANY',
      activityAr: 'خردوات والقرطاسية وأدوات التجميل بالجملة',
      activityEn: 'Sundries, Stationary & Cosmetics Wholesale',
      addressAr: 'جدة - المحجر - دوار النجوم - مركز النجوم',
      addressEn: 'Jeddah - Mahjar - Dawar Nojoom - Nujoom Center',
      buildingAr: 'حي المحجر - رقم المبنى ٨٢٠٥ - رقم إضافي ٣٧٣١',
      buildingEn: 'Mahjar - Building No. 8205 - Secondary No. 3731',
      postalAr: 'رمز بريدي ٢٢٤٢١ - جدة - المملكة العربية السعودية',
      postalEn: 'Postal Code 22421 - Jeddah - K.S.A',
      phonesAr: '012 608 6220 / 055 886 3822 / 050 587 8700',
      phonesEn: '012 608 6220 / 055 886 3822 / 050 587 8700',
      email: 'wholesalezain@gmail.com',
      taxNumber: '311186943400003',
      crNumber: '4030294347',
      branch: 'فرع 1 - 001',
      costCenter: 'م.تكلفة 1 - 001',
      warehouse: 'مستودع 1 - 01',
      salesRep: '10-المدير',
      currency: 'SR ريال',
      currencySubunit: 'هللة',
      exchangeRate: 1,
      defaultVatRate: 15,
      nextQuotationNumber: 64,
      nextInvoiceNumber: 135746,
      showZatcaQr: true,
      qrType: 'zatca',
      websiteUrl: 'https://www.mayarjeddah.com',
      logoUrl: 'assets/zain_logo.svg',
      notes: '',
      activeTemplate: 'zain'
    }, parsed);
  },
  saveSettings: function(settings) {
    localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(settings));
  },

  getNextInvoiceNumber: function(type = 'simplified_tax_invoice') {
    const settings = this.getSettings();
    const invoices = this.getInvoices();
    if (type === 'quotation') {
      let maxNum = parseInt(settings.nextQuotationNumber, 10) || 64;
      invoices.forEach(inv => {
        if (inv.type === 'quotation') {
          const n = parseInt(inv.number, 10);
          if (!isNaN(n) && n >= maxNum) {
            maxNum = n + 1;
          }
        }
      });
      return maxNum;
    } else {
      let maxNum = parseInt(settings.nextInvoiceNumber, 10) || 135746;
      invoices.forEach(inv => {
        if (inv.type !== 'quotation') {
          const n = parseInt(inv.number, 10);
          if (!isNaN(n) && n >= maxNum) {
            maxNum = n + 1;
          }
        }
      });
      return maxNum;
    }
  },

  incrementNextNumber: function(type, currentNumber) {
    const settings = this.getSettings();
    const numInt = parseInt(currentNumber, 10);
    if (!isNaN(numInt)) {
      if (type === 'quotation') {
        if (numInt >= (parseInt(settings.nextQuotationNumber, 10) || 1)) {
          settings.nextQuotationNumber = numInt + 1;
        }
      } else {
        if (numInt >= (parseInt(settings.nextInvoiceNumber, 10) || 1)) {
          settings.nextInvoiceNumber = numInt + 1;
        }
      }
      this.saveSettings(settings);
    }
  },

  // Products
  getProducts: function() {
    const p = localStorage.getItem(this.KEYS.PRODUCTS);
    return p ? JSON.parse(p) : [];
  },
  saveProduct: function(product) {
    const products = this.getProducts();
    if (product.id) {
      const idx = products.findIndex(p => p.id === product.id);
      if (idx >= 0) products[idx] = product;
      else products.push(product);
    } else {
      product.id = 'prod_' + Date.now();
      products.push(product);
    }
    localStorage.setItem(this.KEYS.PRODUCTS, JSON.stringify(products));
    return product;
  },
  deleteProduct: function(id) {
    let products = this.getProducts().filter(p => p.id !== id);
    localStorage.setItem(this.KEYS.PRODUCTS, JSON.stringify(products));
  },

  // Categories
  getCategories: function() {
    const c = localStorage.getItem(this.KEYS.CATEGORIES);
    return c ? JSON.parse(c) : [];
  },
  saveCategory: function(cat) {
    const categories = this.getCategories();
    if (!cat.id) cat.id = 'cat_' + Date.now();
    const idx = categories.findIndex(c => c.id === cat.id);
    if (idx >= 0) categories[idx] = cat;
    else categories.push(cat);
    localStorage.setItem(this.KEYS.CATEGORIES, JSON.stringify(categories));
    return cat;
  },
  deleteCategory: function(id) {
    const categories = this.getCategories().filter(c => c.id !== id);
    localStorage.setItem(this.KEYS.CATEGORIES, JSON.stringify(categories));
  },

  // Units
  getUnits: function() {
    const u = localStorage.getItem(this.KEYS.UNITS);
    return u ? JSON.parse(u) : [];
  },
  saveUnits: function(unitsArray) {
    localStorage.setItem(this.KEYS.UNITS, JSON.stringify(unitsArray));
  },

  // Customers
  getCustomers: function() {
    const c = localStorage.getItem(this.KEYS.CUSTOMERS);
    return c ? JSON.parse(c) : [];
  },
  saveCustomer: function(cust) {
    const customers = this.getCustomers();
    if (cust.id) {
      const idx = customers.findIndex(c => c.id === cust.id);
      if (idx >= 0) customers[idx] = cust;
      else customers.push(cust);
    } else {
      cust.id = 'cust_' + Date.now();
      customers.push(cust);
    }
    localStorage.setItem(this.KEYS.CUSTOMERS, JSON.stringify(customers));
    return cust;
  },
  deleteCustomer: function(id) {
    const customers = this.getCustomers().filter(c => c.id !== id);
    localStorage.setItem(this.KEYS.CUSTOMERS, JSON.stringify(customers));
  },

  // Invoices
  getInvoices: function() {
    const inv = localStorage.getItem(this.KEYS.INVOICES);
    return inv ? JSON.parse(inv) : [];
  },
  getInvoiceById: function(id) {
    return this.getInvoices().find(i => i.id === id);
  },
  saveInvoice: function(invoice) {
    const invoices = this.getInvoices();
    if (invoice.id) {
      const idx = invoices.findIndex(i => i.id === invoice.id);
      if (idx >= 0) invoices[idx] = invoice;
      else invoices.unshift(invoice);
    } else {
      invoice.id = 'inv_' + Date.now();
      invoices.unshift(invoice);
    }
    localStorage.setItem(this.KEYS.INVOICES, JSON.stringify(invoices));
    return invoice;
  },
  deleteInvoice: function(id) {
    const invoices = this.getInvoices().filter(i => i.id !== id);
    localStorage.setItem(this.KEYS.INVOICES, JSON.stringify(invoices));
  },

  // Backup & Restore
  exportBackup: function() {
    return JSON.stringify({
      version: '1.0',
      timestamp: new Date().toISOString(),
      settings: this.getSettings(),
      categories: this.getCategories(),
      units: this.getUnits(),
      products: this.getProducts(),
      customers: this.getCustomers(),
      invoices: this.getInvoices()
    }, null, 2);
  },
  importBackup: function(jsonStr) {
    try {
      const data = JSON.parse(jsonStr);
      if (data.settings) localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(data.settings));
      if (data.categories) localStorage.setItem(this.KEYS.CATEGORIES, JSON.stringify(data.categories));
      if (data.units) localStorage.setItem(this.KEYS.UNITS, JSON.stringify(data.units));
      if (data.products) localStorage.setItem(this.KEYS.PRODUCTS, JSON.stringify(data.products));
      if (data.customers) localStorage.setItem(this.KEYS.CUSTOMERS, JSON.stringify(data.customers));
      if (data.invoices) localStorage.setItem(this.KEYS.INVOICES, JSON.stringify(data.invoices));
      return true;
    } catch (e) {
      console.error('Backup import error:', e);
      return false;
    }
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = DB;
}
