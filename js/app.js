/**
 * Main Application Logic
 * Manages UI, Invoice Generation, Real-time calculations, CRUD, and Printing
 */

document.addEventListener('DOMContentLoaded', () => {
  DB.init();
  if (typeof I18N !== 'undefined') I18N.init();
  App.init();
});

const App = {
  currentInvoice: null,
  activeTab: 'invoices-tab',

  init: function() {
    this.bindEvents();
    this.renderProductsList();
    this.renderCustomersList();
    this.renderInvoicesList();
    this.loadSettingsForm();
    this.initNewInvoice();

    // Register service worker if available
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').catch(err => console.log('SW registration note:', err));
    }
  },

  bindEvents: function() {
    // Navigation Tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const target = tab.dataset.tab;
        this.switchTab(target);
      });
    });

    // Logo Upload & Optimization
    const logoInput = document.getElementById('setting-logo-file');
    if (logoInput) {
      logoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => {
            const rawData = ev.target.result;
            // Optimize image if it's a bitmap (PNG/JPG/WebP) to prevent storage quota issues
            if (file.type.startsWith('image/') && !file.type.includes('svg')) {
              const img = new Image();
              img.onload = () => {
                const maxW = 500;
                const maxH = 220;
                let w = img.width;
                let h = img.height;
                if (w > maxW || h > maxH) {
                  const ratio = Math.min(maxW / w, maxH / h);
                  w = Math.round(w * ratio);
                  h = Math.round(h * ratio);
                }
                const canvas = document.createElement('canvas');
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, w, h);
                const optimizedData = canvas.toDataURL('image/png');
                const preview = document.getElementById('setting-logo-preview');
                if (preview) preview.src = optimizedData;
                document.getElementById('setting-logo-url').value = optimizedData;
              };
              img.src = rawData;
            } else {
              // SVG or small image
              const preview = document.getElementById('setting-logo-preview');
              if (preview) preview.src = rawData;
              document.getElementById('setting-logo-url').value = rawData;
            }
          };
          reader.readAsDataURL(file);
        }
      });
    }

    // Invoice Date Hijri sync
    const invDateInput = document.getElementById('inv-date');
    if (invDateInput) {
      invDateInput.addEventListener('change', () => {
        this.syncHijriDate();
      });
    }

    // Global print trigger
    window.addEventListener('afterprint', () => {
      // Clean up if needed
    });
  },

  switchTab: function(tabId) {
    this.activeTab = tabId;
    document.querySelectorAll('.nav-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.tab === tabId);
    });
    document.querySelectorAll('.tab-pane').forEach(p => {
      p.classList.toggle('active', p.id === tabId);
    });

    if (tabId === 'invoices-tab') this.renderInvoicesList();
    if (tabId === 'products-tab') this.renderProductsList();
    if (tabId === 'customers-tab') this.renderCustomersList();
    if (tabId === 'settings-tab') this.loadSettingsForm();
  },

  // -------------------------------------------------------------------------
  // INVOICE BUILDER & CALCULATIONS
  // -------------------------------------------------------------------------
  initNewInvoice: function(existingInvoice = null) {
    const settings = DB.getSettings();
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const timeStr = today.toTimeString().split(' ')[0];

    if (existingInvoice) {
      this.currentInvoice = JSON.parse(JSON.stringify(existingInvoice));
    } else {
      const nextNum = String(settings.nextInvoiceNumber || 1).padStart(6, '0');
      this.currentInvoice = {
        id: null,
        type: 'simplified_tax_invoice',
        typeNameAr: 'فاتورة ضريبية مبسطة',
        typeNameEn: 'Simplified Tax Invoice',
        number: nextNum,
        date: dateStr,
        hijriDate: HijriConverter.toHijri(dateStr, -1),
        time: timeStr,
        paymentMethod: 'cash',
        orderNo: '',
        refNo: '',
        currency: settings.currency || 'SR ريال',
        exchangeRate: 1,
        costCenter: settings.costCenter || 'م.تكلفة 1 - 001',
        salesRep: settings.salesRep || '10-المدير',
        warehouse: settings.warehouse || 'مستودع 1 - 01',
        pageInfo: '1 من 1',
        customer: {
          id: '',
          name: '',
          taxNumber: 'لايوجد',
          crNumber: '',
          address: '',
          destination: 'محلي',
          representative: '',
          balance: '',
          competitors: ''
        },
        items: [
          {
            sr: 1,
            code: '96',
            description: 'كلوركس وسط ابو 1* 18*950مل',
            unit: 'كرتون',
            quantity: 50.00,
            price: 84.00,
            net: 4200.00,
            vatRate: 15,
            vatAmount: 630.00,
            totalWithVat: 4830.00
          }
        ],
        totalQuantity: 50.00,
        subtotal: 4200.00,
        additions: 0.00,
        grossTotal: 4200.00,
        discountPercent: 0,
        discountAmount: 0.00,
        netTotal: 4200.00,
        vatTotal: 630.00,
        grandTotal: 4830.00,
        tafqeet: '',
        paidAmount: 0.00,
        remainingAmount: 4830.00,
        user: settings.salesRep || '10-المدير',
        versionNo: 0,
        notes: '',
        status: 'unpaid'
      };
    }

    this.renderInvoiceForm();
    this.recalculateInvoice();
  },

  renderInvoiceForm: function() {
    const inv = this.currentInvoice;
    if (document.getElementById('inv-type')) document.getElementById('inv-type').value = inv.type || 'quotation';
    if (document.getElementById('inv-number')) document.getElementById('inv-number').value = inv.number || '';
    if (document.getElementById('inv-date')) document.getElementById('inv-date').value = inv.date || '';
    if (document.getElementById('inv-payment-method')) document.getElementById('inv-payment-method').value = inv.paymentMethod || 'cash';
    if (document.getElementById('inv-hijri-date')) document.getElementById('inv-hijri-date').value = inv.hijriDate || '';
    if (document.getElementById('inv-time')) document.getElementById('inv-time').value = inv.time || '';
    const orderEl = document.getElementById('inv-order') || document.getElementById('inv-order-no');
    if (orderEl) orderEl.value = inv.orderNo || '';
    const refEl = document.getElementById('inv-ref') || document.getElementById('inv-ref-no');
    if (refEl) refEl.value = inv.refNo || '';
    if (document.getElementById('inv-cost-center')) document.getElementById('inv-cost-center').value = inv.costCenter || '';
    if (document.getElementById('inv-sales-rep')) document.getElementById('inv-sales-rep').value = inv.salesRep || '';
    if (document.getElementById('inv-warehouse')) document.getElementById('inv-warehouse').value = inv.warehouse || '';

    // Customer Select dropdown
    this.populateCustomerSelect(inv.customer ? inv.customer.id : '');

    // Populate Customer Fields
    const custNameEl = document.getElementById('inv-cust-name');
    if (custNameEl) custNameEl.value = inv.customer ? (inv.customer.name || '') : '';
    const custTaxEl = document.getElementById('inv-cust-tax');
    if (custTaxEl) custTaxEl.value = inv.customer ? (inv.customer.taxNumber || 'لايوجد') : 'لايوجد';
    const custPhoneEl = document.getElementById('inv-cust-phone');
    if (custPhoneEl) custPhoneEl.value = inv.customer ? (inv.customer.phone || '') : '';
    const custCrEl = document.getElementById('inv-cust-cr');
    if (custCrEl) custCrEl.value = inv.customer ? (inv.customer.crNumber || '') : '';
    const custAddrEl = document.getElementById('inv-cust-address');
    if (custAddrEl) custAddrEl.value = inv.customer ? (inv.customer.address || '') : '';
    const custDestEl = document.getElementById('inv-cust-dest');
    if (custDestEl) custDestEl.value = inv.customer ? (inv.customer.destination || 'محلي') : 'محلي';
    const custRepEl = document.getElementById('inv-cust-rep');
    if (custRepEl) custRepEl.value = inv.customer ? (inv.customer.representative || '') : '';
    const custBalEl = document.getElementById('inv-cust-balance');
    if (custBalEl) custBalEl.value = inv.customer ? (inv.customer.balance || '') : '';

    // Summary fields
    const addEl = document.getElementById('inv-additions');
    if (addEl) addEl.value = inv.additions || 0;
    const discPctEl = document.getElementById('inv-discount-percent');
    if (discPctEl) discPctEl.value = inv.discountPercent || 0;
    const discAmtEl = document.getElementById('inv-discount-amount');
    if (discAmtEl) discAmtEl.value = inv.discountAmount || 0;
    const paidEl = document.getElementById('inv-paid');
    if (paidEl) paidEl.value = inv.paidAmount || 0;
    const notesEl = document.getElementById('inv-notes');
    if (notesEl) notesEl.value = inv.notes || '';

    this.renderInvoiceItemsRows();
  },

  onPaymentMethodChange: function() {
    const pm = document.getElementById('inv-payment-method')?.value || 'cash';
    if (this.currentInvoice) {
      this.currentInvoice.paymentMethod = pm;
      this.recalculateInvoice();
    }
  },

  onDocTypeChange: function() {
    const docType = document.getElementById('inv-type')?.value || 'simplified_tax_invoice';
    this.currentInvoice.type = docType;
    if (docType === 'quotation') {
      this.currentInvoice.typeNameAr = 'عرض سعر مبيعات';
      this.currentInvoice.typeNameEn = 'Sales Quotation';
    } else if (docType === 'tax_invoice') {
      this.currentInvoice.typeNameAr = 'فاتورة ضريبية';
      this.currentInvoice.typeNameEn = 'Tax Invoice';
    } else {
      this.currentInvoice.typeNameAr = 'فاتورة ضريبية مبسطة';
      this.currentInvoice.typeNameEn = 'Simplified Tax Invoice';
    }
    
    const settings = DB.getSettings();
    if (!this.currentInvoice.id) {
      const nextNum = docType === 'quotation' 
        ? String(settings.nextQuotationNumber || 1).padStart(6, '0')
        : String(settings.nextInvoiceNumber || 1).padStart(6, '0');
      this.currentInvoice.number = nextNum;
      const numEl = document.getElementById('inv-number');
      if (numEl) numEl.value = nextNum;
    }
  },

  populateCustomerSelect: function(selectedId = '') {
    const select = document.getElementById('inv-customer-picker');
    if (!select) return;
    const customers = DB.getCustomers();
    const isEn = (typeof I18N !== 'undefined' && I18N.currentLang === 'en');
    select.innerHTML = `<option value="">${isEn ? '-- Or Select Saved Customer --' : '-- اختر عميل مسجل أو اكتب الاسم مباشرة --'}</option>`;
    customers.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = `${c.name} ${c.taxNumber && c.taxNumber !== 'لايوجد' ? '(' + c.taxNumber + ')' : ''}`;
      if (c.id === selectedId) opt.selected = true;
      select.appendChild(opt);
    });
  },

  onCustomerSelectChange: function(customerId) {
    if (!customerId) return;
    const cust = DB.getCustomers().find(c => c.id === customerId);
    if (cust) {
      this.currentInvoice.customer = {
        id: cust.id,
        name: cust.name,
        taxNumber: cust.taxNumber || 'لايوجد',
        phone: cust.phone || '',
        crNumber: cust.crNumber || '',
        address: cust.address || '',
        destination: cust.destination || 'محلي',
        representative: cust.representative || '',
        balance: cust.balance || ''
      };
      const setF = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.value = val;
      };
      setF('inv-cust-name', cust.name);
      setF('inv-cust-tax', cust.taxNumber || 'لايوجد');
      setF('inv-cust-phone', cust.phone || '');
      setF('inv-cust-cr', cust.crNumber || '');
      setF('inv-cust-address', cust.address || '');
      setF('inv-cust-dest', cust.destination || 'محلي');
      setF('inv-cust-rep', cust.representative || '');
      setF('inv-cust-balance', cust.balance || '');
    }
  },

  onCustomerNameInput: function(name) {
    if (!this.currentInvoice.customer) this.currentInvoice.customer = {};
    this.currentInvoice.customer.name = name;
  },

  onCustomerFieldInput: function(field, val) {
    if (!this.currentInvoice.customer) this.currentInvoice.customer = {};
    this.currentInvoice.customer[field] = val;
  },

  renderInvoiceItemsRows: function() {
    const tbody = document.getElementById('inv-items-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    const products = DB.getProducts();
    const isEn = (typeof I18N !== 'undefined' && I18N.currentLang === 'en');
    const defaultVat = (DB.getSettings().defaultVatRate !== undefined && DB.getSettings().defaultVatRate !== null && !isNaN(parseFloat(DB.getSettings().defaultVatRate))) ? parseFloat(DB.getSettings().defaultVatRate) : 15;

    this.currentInvoice.items.forEach((item, index) => {
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.price) || 0;
      const vRate = (item.vatRate !== undefined && item.vatRate !== null && !isNaN(parseFloat(item.vatRate))) ? parseFloat(item.vatRate) : defaultVat;
      const net = qty * price;
      const vat = net * (vRate / 100);
      const total = net + vat;

      item.quantity = qty;
      item.price = price;
      item.net = net;
      item.vatRate = vRate;
      item.vatAmount = vat;
      item.totalWithVat = total;

      const tr = document.createElement('tr');
      tr.className = 'inv-item-row';
      tr.dataset.rowIndex = index;
      tr.innerHTML = `
        <td class="col-sr-cell" style="width: 35px; text-align: center; font-weight: bold; color: #64748b;">
          <div class="mobile-row-header">
            <span class="mobile-row-title">${isEn ? 'Item #' : 'صنف رقم '} ${index + 1}</span>
            <button type="button" class="btn btn-sm btn-danger mobile-delete-btn" onclick="App.removeItemRow(${index})" title="${isEn ? 'Remove row' : 'حذف السطر'}">
              ✕ ${isEn ? 'Remove' : 'حذف'}
            </button>
          </div>
          <span class="desktop-item-sr">${index + 1}</span>
        </td>
        <td class="col-desc-cell">
          <div style="display: flex; flex-direction: column; gap: 5px;">
            <select class="form-control form-control-sm item-picker-select" data-index="${index}" style="font-weight: 600; color: #0f172a; background: #f8fafc;">
              <option value="">${isEn ? '-- Select Product from Catalog --' : '-- اختر الصنف من القائمة --'}</option>
              ${products.map(p => `<option value="${p.id}" ${p.code === item.code || p.name === item.description ? 'selected' : ''}>${p.name} (${(p.price || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} SAR)</option>`).join('')}
              <option value="custom">✏️ ${isEn ? 'Custom / Edit Description below' : 'بيان مخصص (تعديل النص أدناه)'}</option>
            </select>
            <input type="text" class="form-control form-control-sm item-desc-input" data-index="${index}" value="${item.description || ''}" placeholder="${isEn ? 'Item description / Name' : 'اسم الصنف / البيان'}" style="font-size: 13.5px;">
            <input type="hidden" class="item-code-input" data-index="${index}" value="${item.code || ''}">
          </div>
        </td>
        <td class="col-unit-cell" style="width: 100px;">
          <label class="mobile-field-label">${isEn ? 'Unit' : 'الوحدة'}</label>
          <input type="text" class="form-control form-control-sm item-unit-input" data-index="${index}" value="${item.unit || (isEn ? 'Carton' : 'كرتون')}" placeholder="Unit" style="text-align: center; padding: 4px 4px; font-size: 13px;">
        </td>
        <td class="col-price-cell" style="width: 105px;">
          <label class="mobile-field-label">${isEn ? 'Unit Price (SAR)' : 'سعر الوحدة'}</label>
          <input type="number" step="any" min="0" class="form-control form-control-sm item-price-input" data-index="${index}" value="${item.price !== undefined ? item.price : 0}" style="text-align: center; font-weight: 700;">
        </td>
        <td class="col-qty-cell" style="width: 100px;">
          <label class="mobile-field-label">${isEn ? 'QTY (الكمية)' : 'الكمية'}</label>
          <input type="number" step="any" min="0" class="form-control form-control-sm item-qty-input" data-index="${index}" value="${item.quantity !== undefined ? item.quantity : 1}" style="text-align: center; font-weight: 700;">
        </td>
        <td class="col-net-cell" style="width: 90px; text-align: center; font-weight: bold; color: #002060;">
          <label class="mobile-field-label">${isEn ? 'Net Total' : 'قبل الضريبة'}</label>
          <span class="row-calc-net" id="row-net-${index}">${item.net.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </td>
        <td class="col-vatrate-cell" style="width: 65px; text-align: center; color: #64748b; font-size: 12px;">
          <label class="mobile-field-label">${isEn ? 'VAT %' : 'نسبة الضريبة'}</label>
          <span id="row-vatrate-${index}">${isEn ? `${item.vatRate}%` : `%${item.vatRate}`}</span>
          <input type="hidden" class="item-vat-val" data-index="${index}" value="${item.vatRate}">
        </td>
        <td class="col-vatamt-cell" style="width: 85px; text-align: center; color: #b91c1c; font-weight: 600;">
          <label class="mobile-field-label">${isEn ? `VAT (${item.vatRate}%)` : `ضريبة (%${item.vatRate})`}</label>
          <span class="row-calc-vat" id="row-vat-${index}">${item.vatAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </td>
        <td class="col-total-cell" style="width: 110px; text-align: center; font-weight: bold; background-color: #f0f9ff; color: #0284c7;">
          <label class="mobile-field-label">${isEn ? 'Total (Inc. VAT)' : 'الإجمالي شامل الضريبة'}</label>
          <span class="row-calc-total" id="row-total-${index}">${item.totalWithVat.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </td>
        <td class="col-action-cell" style="width: 40px; text-align: center;">
          <button type="button" class="btn btn-sm btn-outline btn-danger-icon desktop-delete-btn" onclick="App.removeItemRow(${index})" title="${isEn ? 'Remove row' : 'حذف السطر'}">
            ✕
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    this.bindItemInputsEvents();
  },

  bindItemInputsEvents: function() {
    const isEn = (typeof I18N !== 'undefined' && I18N.currentLang === 'en');

    // Description input
    document.querySelectorAll('.item-desc-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const idx = parseInt(e.target.dataset.index);
        if (this.currentInvoice.items[idx]) {
          this.currentInvoice.items[idx].description = e.target.value;
        }
      });
    });

    // Unit input
    document.querySelectorAll('.item-unit-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const idx = parseInt(e.target.dataset.index);
        if (this.currentInvoice.items[idx]) {
          this.currentInvoice.items[idx].unit = e.target.value;
        }
      });
    });

    // Instant Live Recalculation on Quantity Keystroke
    document.querySelectorAll('.item-qty-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const idx = parseInt(e.target.dataset.index);
        if (this.currentInvoice.items[idx]) {
          const qty = parseFloat(e.target.value) || 0;
          const price = parseFloat(this.currentInvoice.items[idx].price) || 0;
          const vatRate = (this.currentInvoice.items[idx].vatRate !== undefined && this.currentInvoice.items[idx].vatRate !== null && !isNaN(parseFloat(this.currentInvoice.items[idx].vatRate)))
            ? parseFloat(this.currentInvoice.items[idx].vatRate)
            : (DB.getSettings().defaultVatRate !== undefined ? DB.getSettings().defaultVatRate : 15);
          const net = qty * price;
          const vat = net * (vatRate / 100);
          const total = net + vat;

          this.currentInvoice.items[idx].quantity = qty;
          this.currentInvoice.items[idx].net = net;
          this.currentInvoice.items[idx].vatRate = vatRate;
          this.currentInvoice.items[idx].vatAmount = vat;
          this.currentInvoice.items[idx].totalWithVat = total;

          // Update row calculation figures in DOM live immediately
          const netEl = document.getElementById(`row-net-${idx}`);
          if (netEl) netEl.textContent = net.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
          const vatEl = document.getElementById(`row-vat-${idx}`);
          if (vatEl) vatEl.textContent = vat.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
          const totalEl = document.getElementById(`row-total-${idx}`);
          if (totalEl) totalEl.textContent = total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

          this.recalculateInvoice();
        }
      });
    });

    // Instant Live Recalculation on Price Keystroke
    document.querySelectorAll('.item-price-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const idx = parseInt(e.target.dataset.index);
        if (this.currentInvoice.items[idx]) {
          const price = parseFloat(e.target.value) || 0;
          const qty = parseFloat(this.currentInvoice.items[idx].quantity) || 0;
          const vatRate = (this.currentInvoice.items[idx].vatRate !== undefined && this.currentInvoice.items[idx].vatRate !== null && !isNaN(parseFloat(this.currentInvoice.items[idx].vatRate)))
            ? parseFloat(this.currentInvoice.items[idx].vatRate)
            : (DB.getSettings().defaultVatRate !== undefined ? DB.getSettings().defaultVatRate : 15);
          const net = qty * price;
          const vat = net * (vatRate / 100);
          const total = net + vat;

          this.currentInvoice.items[idx].price = price;
          this.currentInvoice.items[idx].net = net;
          this.currentInvoice.items[idx].vatRate = vatRate;
          this.currentInvoice.items[idx].vatAmount = vat;
          this.currentInvoice.items[idx].totalWithVat = total;

          // Update row calculation figures in DOM live immediately
          const netEl = document.getElementById(`row-net-${idx}`);
          if (netEl) netEl.textContent = net.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
          const vatEl = document.getElementById(`row-vat-${idx}`);
          if (vatEl) vatEl.textContent = vat.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
          const totalEl = document.getElementById(`row-total-${idx}`);
          if (totalEl) totalEl.textContent = total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

          this.recalculateInvoice();
        }
      });
    });

    // Product Picker Dropdown in Line Items
    document.querySelectorAll('.item-picker-select').forEach(select => {
      select.addEventListener('change', (e) => {
        const idx = parseInt(e.target.dataset.index);
        const prodId = e.target.value;
        if (prodId && prodId !== 'custom') {
          const prod = DB.getProducts().find(p => p.id === prodId);
          if (prod && this.currentInvoice.items[idx]) {
            const pVat = (prod.vatRate !== undefined && prod.vatRate !== null && !isNaN(parseFloat(prod.vatRate))) ? parseFloat(prod.vatRate) : (DB.getSettings().defaultVatRate || 15);
            const pPrice = parseFloat(prod.price) || 0;
            const curQty = parseFloat(this.currentInvoice.items[idx].quantity) || 1;
            const net = curQty * pPrice;
            const vatAmt = net * (pVat / 100);

            this.currentInvoice.items[idx].code = prod.code || '';
            this.currentInvoice.items[idx].description = prod.name;
            this.currentInvoice.items[idx].unit = prod.unit || 'كرتون';
            this.currentInvoice.items[idx].price = pPrice;
            this.currentInvoice.items[idx].vatRate = pVat;
            this.currentInvoice.items[idx].quantity = curQty;
            this.currentInvoice.items[idx].net = net;
            this.currentInvoice.items[idx].vatAmount = vatAmt;
            this.currentInvoice.items[idx].totalWithVat = net + vatAmt;
            
            // Re-render and automatically focus the QTY field!
            this.renderInvoiceItemsRows();
            this.recalculateInvoice();
            
            setTimeout(() => {
              const qtyInputs = document.querySelectorAll('.item-qty-input');
              if (qtyInputs[idx]) {
                qtyInputs[idx].focus();
                qtyInputs[idx].select();
              }
            }, 50);
          }
        }
      });
    });
  },

  addItemRow: function() {
    const defaultVat = (DB.getSettings().defaultVatRate !== undefined && DB.getSettings().defaultVatRate !== null && !isNaN(parseFloat(DB.getSettings().defaultVatRate))) ? parseFloat(DB.getSettings().defaultVatRate) : 15;
    this.currentInvoice.items.push({
      sr: this.currentInvoice.items.length + 1,
      code: '',
      description: '',
      unit: (typeof I18N !== 'undefined' && I18N.currentLang === 'en') ? 'Carton' : 'كرتون',
      quantity: 1,
      price: 0,
      net: 0,
      vatRate: defaultVat,
      vatAmount: 0,
      totalWithVat: 0
    });
    this.renderInvoiceItemsRows();
    this.recalculateInvoice();

    // Focus the newly added row's product selector
    setTimeout(() => {
      const selects = document.querySelectorAll('.item-picker-select');
      if (selects.length > 0) {
        selects[selects.length - 1].focus();
      }
    }, 50);
  },

  addCustomLineItem: function() {
    this.addItemRow();
  },

  removeItemRow: function(index) {
    if (this.currentInvoice.items.length <= 1) {
      alert((typeof I18N !== 'undefined' && I18N.currentLang === 'en') ? 'Invoice must have at least one line item.' : 'يجب أن تحتوي الفاتورة على سطر واحد على الأقل.');
      return;
    }
    this.currentInvoice.items.splice(index, 1);
    this.renderInvoiceItemsRows();
    this.recalculateInvoice();
  },

  recalculateInvoice: function() {
    let totalQty = 0;
    let subtotal = 0;
    let totalVat = 0;

    const isEn = (typeof I18N !== 'undefined' && I18N.currentLang === 'en');
    const defaultVat = (DB.getSettings().defaultVatRate !== undefined && DB.getSettings().defaultVatRate !== null && !isNaN(parseFloat(DB.getSettings().defaultVatRate))) ? parseFloat(DB.getSettings().defaultVatRate) : 15;

    this.currentInvoice.items.forEach((item, idx) => {
      item.sr = idx + 1;
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.price) || 0;
      const vatRate = (item.vatRate !== undefined && item.vatRate !== null && !isNaN(parseFloat(item.vatRate))) ? parseFloat(item.vatRate) : defaultVat;

      const net = qty * price;
      const vatAmount = net * (vatRate / 100);
      const totalWithVat = net + vatAmount;

      item.quantity = qty;
      item.price = price;
      item.net = net;
      item.vatRate = vatRate;
      item.vatAmount = vatAmount;
      item.totalWithVat = totalWithVat;

      totalQty += qty;
      subtotal += net;
      totalVat += vatAmount;

      // Update row calculation figures in DOM live immediately
      const netEl = document.getElementById(`row-net-${idx}`);
      if (netEl) netEl.textContent = net.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const vatEl = document.getElementById(`row-vat-${idx}`);
      if (vatEl) vatEl.textContent = vatAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const totalEl = document.getElementById(`row-total-${idx}`);
      if (totalEl) totalEl.textContent = totalWithVat.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const rateEl = document.getElementById(`row-vatrate-${idx}`);
      if (rateEl) rateEl.textContent = isEn ? `${vatRate}%` : `%${vatRate}`;
    });

    const additions = parseFloat(document.getElementById('inv-additions')?.value) || 0;
    let discountPercent = parseFloat(document.getElementById('inv-discount-percent')?.value) || 0;
    let discountAmount = parseFloat(document.getElementById('inv-discount-amount')?.value) || 0;

    const grossTotal = subtotal + additions;

    if (discountPercent > 0 && discountAmount === 0) {
      discountAmount = grossTotal * (discountPercent / 100);
    }

    const netTotal = grossTotal - discountAmount;
    const grandTotal = netTotal + totalVat;
    const isCredit = (this.currentInvoice.paymentMethod === 'credit');
    const rawPaid = parseFloat(document.getElementById('inv-paid')?.value);
    const paidAmount = isCredit ? (isNaN(rawPaid) ? 0 : rawPaid) : grandTotal;
    const remainingAmount = isCredit ? (grandTotal - paidAmount) : 0;

    this.currentInvoice.totalQuantity = totalQty;
    this.currentInvoice.subtotal = subtotal;
    this.currentInvoice.additions = additions;
    this.currentInvoice.grossTotal = grossTotal;
    this.currentInvoice.discountPercent = discountPercent;
    this.currentInvoice.discountAmount = discountAmount;
    this.currentInvoice.netTotal = netTotal;
    this.currentInvoice.vatTotal = totalVat;
    this.currentInvoice.grandTotal = grandTotal;
    this.currentInvoice.paidAmount = paidAmount;
    this.currentInvoice.remainingAmount = remainingAmount;

    // Currency Tafqeet
    const arWords = (typeof Tafqeet !== 'undefined') ? (Tafqeet.toArabicWords ? Tafqeet.toArabicWords(grandTotal) : Tafqeet.convert(grandTotal)) : '';
    const enWords = (typeof Tafqeet !== 'undefined' && Tafqeet.toEnglishWords) ? Tafqeet.toEnglishWords(grandTotal, 'SAR', 'HALALAS') : '';
    const tafqeetDisplay = isEn ? enWords : (arWords + (enWords ? `<div style="font-size:10px;font-weight:normal;color:#64748b;margin-top:2px;">${enWords}</div>` : ''));
    this.currentInvoice.tafqeet = isEn ? enWords : arWords;

    // Update UI summary indicators
    const setVal = (id, val, isCurrency = true) => {
      const el = document.getElementById(id);
      if (el) {
        el.textContent = isCurrency 
          ? val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
          : val.toLocaleString('en-US');
      }
    };

    setVal('summary-subtotal', subtotal);
    setVal('summary-additions', additions);
    setVal('summary-gross', grossTotal);
    setVal('summary-discount', discountAmount);
    setVal('summary-net', netTotal);
    setVal('summary-vat', totalVat);
    setVal('summary-grand', grandTotal);
    setVal('summary-total-qty', totalQty, false);
    setVal('summary-paid', paidAmount);
    setVal('summary-remaining', remainingAmount);

    const tafqeetEl = document.getElementById('summary-tafqeet');
    if (tafqeetEl) tafqeetEl.innerHTML = tafqeetDisplay;
  },

  syncHijriDate: function() {
    const gDate = document.getElementById('inv-date').value;
    if (gDate) {
      const hijri = HijriConverter.toHijri(gDate, -1);
      document.getElementById('inv-hijri-date').value = hijri;
    }
  },

  saveCurrentInvoice: function(andPrint = false) {
    // Read form headers into state
    const inv = this.currentInvoice;
    inv.type = document.getElementById('inv-type')?.value || 'quotation';
    inv.typeNameAr = inv.type === 'quotation' ? 'عرض سعر مبيعات' : 'فاتورة ضريبية';
    inv.typeNameEn = inv.type === 'quotation' ? 'Sales Quotation' : 'Tax Invoice';
    inv.number = document.getElementById('inv-number')?.value || '000001';
    inv.date = document.getElementById('inv-date')?.value || new Date().toISOString().split('T')[0];
    inv.hijriDate = document.getElementById('inv-hijri-date')?.value || '';
    inv.time = document.getElementById('inv-time')?.value || new Date().toTimeString().split(' ')[0];
    inv.orderNo = document.getElementById('inv-order')?.value || document.getElementById('inv-order-no')?.value || '';
    inv.refNo = document.getElementById('inv-ref')?.value || document.getElementById('inv-ref-no')?.value || '';
    inv.paymentMethod = document.getElementById('inv-payment-method')?.value || 'cash';
    inv.costCenter = document.getElementById('inv-cost-center')?.value || '';
    inv.salesRep = document.getElementById('inv-sales-rep')?.value || '';
    inv.warehouse = document.getElementById('inv-warehouse')?.value || '';

    inv.customer = {
      id: document.getElementById('inv-customer-picker')?.value || '',
      name: document.getElementById('inv-cust-name')?.value || 'Cash Customer',
      taxNumber: document.getElementById('inv-cust-tax')?.value || 'لايوجد',
      phone: document.getElementById('inv-cust-phone')?.value || '',
      crNumber: document.getElementById('inv-cust-cr')?.value || '',
      address: document.getElementById('inv-cust-address')?.value || '',
      destination: document.getElementById('inv-cust-dest')?.value || 'محلي',
      representative: document.getElementById('inv-cust-rep')?.value || '',
      balance: document.getElementById('inv-cust-balance')?.value || ''
    };

    inv.notes = document.getElementById('inv-notes')?.value || '';

    this.recalculateInvoice();

    // Persist to DB
    const saved = DB.saveInvoice(inv);
    this.currentInvoice = saved;

    // Increment next invoice number in settings
    const settings = DB.getSettings();
    const currNumInt = parseInt(inv.number, 10);
    if (!isNaN(currNumInt)) {
      if (inv.type === 'quotation' && currNumInt >= (settings.nextQuotationNumber || 1)) {
        settings.nextQuotationNumber = currNumInt + 1;
      } else if (inv.type === 'tax_invoice' && currNumInt >= (settings.nextInvoiceNumber || 1)) {
        settings.nextInvoiceNumber = currNumInt + 1;
      }
      DB.saveSettings(settings);
    }

    const msg = (typeof I18N !== 'undefined') ? I18N.t('msgInvoiceSaved') : 'Invoice saved successfully!';
    alert(msg);
    this.renderInvoicesList();

    if (andPrint) {
      this.printInvoice(saved.id);
    }
  },

  // -------------------------------------------------------------------------
  // PRINT & VIEW 1:1 REPLICA OF سلنو.pdf
  // -------------------------------------------------------------------------
  printInvoice: function(invoiceId, pLang) {
    try {
      let inv = null;
      if (invoiceId) {
        inv = DB.getInvoiceById(invoiceId);
      }
      if (!inv) {
        inv = this.currentInvoice;
      }
      if (!inv) {
        const list = DB.getInvoices();
        if (list && list.length > 0) inv = list[0];
      }
      if (!inv) {
        alert('No invoice data available to preview.');
        return;
      }

      this.currentInvoice = inv;
      const lang = pLang || (typeof I18N !== 'undefined' ? I18N.printLang : 'bilingual');
      const tpl = this.currentPrintTemplate || DB.getSettings().activeTemplate || 'zain';
      this.currentPrintTemplate = tpl;

      this.renderPrintInvoiceTemplate(inv, lang, tpl);

      // Update active button state in print modal
      document.querySelectorAll('.btn-print-lang').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.plang === lang);
      });
      document.querySelectorAll('.btn-print-tpl').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.ptpl === tpl);
      });

      // Open print preview modal
      const modal = document.getElementById('modal-print-preview');
      if (modal) {
        modal.classList.add('show');
      }
    } catch (err) {
      console.error('Error previewing invoice:', err);
      alert('Error opening invoice preview: ' + err.message);
    }
  },

  setPrintLanguage: function(lang) {
    if (typeof I18N !== 'undefined') {
      I18N.setPrintLanguage(lang);
    }
  },

  setPrintTemplate: function(tpl) {
    this.currentPrintTemplate = tpl;
    document.querySelectorAll('.btn-print-tpl').forEach(b => {
      b.classList.toggle('active', b.dataset.ptpl === tpl);
    });
    if (this.currentInvoice) {
      this.renderPrintInvoiceTemplate(this.currentInvoice, null, tpl);
    }
  },

  closePrintModal: function() {
    const modal = document.getElementById('modal-print-preview');
    if (modal) modal.classList.remove('show');
  },

  downloadPdf: function() {
    const inv = this.currentInvoice;
    if (!inv) return;
    const printEl = document.getElementById('invoice-print-wrapper');
    if (!printEl) return;

    const prefix = (inv.type === 'quotation') ? 'Quotation' : 'Invoice';
    const filename = `${prefix}-${inv.number || '000001'}.pdf`;

    const dlBtn = document.querySelector('button[onclick*="downloadPdf"]');
    const origText = dlBtn ? dlBtn.innerHTML : '';
    if (dlBtn) dlBtn.innerHTML = '⏳ Generating PDF...';

    const self = this;

    const createPdfFromCanvas = (canvas) => {
      try {
        const jsPdfObj = (window.jspdf && window.jspdf.jsPDF) ? window.jspdf.jsPDF : (typeof jsPDF !== 'undefined' ? jsPDF : (typeof html2pdf !== 'undefined' && html2pdf().jsPDF ? html2pdf().jsPDF : null));
        if (jsPdfObj) {
          const doc = new jsPdfObj({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
          });
          const imgData = canvas.toDataURL('image/jpeg', 0.98);
          doc.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');

          if (dlBtn) dlBtn.innerHTML = origText;

          if (window.AndroidPrint && typeof window.AndroidPrint.savePdf === 'function') {
            const pdfDataUri = doc.output('datauristring');
            window.AndroidPrint.savePdf(pdfDataUri, filename);
          } else {
            doc.save(filename);
          }
          return true;
        }
      } catch (e) {
        console.warn('Direct jsPDF error, falling back to html2pdf:', e);
      }
      return false;
    };

    const renderViaSvgForeignObject = async () => {
      const width = printEl.offsetWidth || 794;
      const height = printEl.offsetHeight || 1123;

      let styles = '';
      for (let i = 0; i < document.styleSheets.length; i++) {
        try {
          const rules = document.styleSheets[i].cssRules;
          if (rules) {
            for (let j = 0; j < rules.length; j++) {
              styles += rules[j].cssText + '\n';
            }
          }
        } catch (e) {}
      }

      const clone = printEl.cloneNode(true);

      // Convert any <img> src to base64 data URI if not already
      const imgs = clone.querySelectorAll('img');
      for (let imgEl of imgs) {
        if (imgEl.src && !imgEl.src.startsWith('data:')) {
          try {
            const res = await fetch(imgEl.src);
            const blob = await res.blob();
            const dataUri = await new Promise((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.readAsDataURL(blob);
            });
            imgEl.src = dataUri;
          } catch (e) {}
        }
      }

      const wrapper = document.createElement('div');
      wrapper.appendChild(clone);
      const htmlContent = wrapper.innerHTML;

      const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
        <foreignObject width="100%" height="100%">
          <div xmlns="http://www.w3.org/1999/xhtml" style="background:#ffffff; font-family:'Segoe UI', Tahoma, Arial, 'Noto Sans Arabic', sans-serif; letter-spacing: normal !important;">
            <style>
              ${styles}
              * { letter-spacing: normal !important; }
            </style>
            ${htmlContent}
          </div>
        </foreignObject>
      </svg>`;

      return new Promise((resolve, reject) => {
        const img = new Image();
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        img.onload = function() {
          const canvas = document.createElement('canvas');
          const scale = 2;
          canvas.width = width * scale;
          canvas.height = height * scale;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.scale(scale, scale);
          ctx.drawImage(img, 0, 0);
          URL.revokeObjectURL(url);
          resolve(canvas);
        };

        img.onerror = function(err) {
          URL.revokeObjectURL(url);
          reject(err);
        };

        img.src = url;
      });
    };

    renderViaSvgForeignObject()
      .then(canvas => {
        const success = createPdfFromCanvas(canvas);
        if (!success) throw new Error('Could not create PDF from canvas');
      })
      .catch(err => {
        console.warn('SVG foreignObject render failed, using html2pdf fallback:', err);
        if (typeof html2pdf !== 'undefined') {
          const opt = {
            margin: [0, 0, 0, 0],
            filename: filename,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: {
              scale: 2,
              useCORS: true,
              logging: false,
              scrollY: 0,
              letterRendering: false,
              windowWidth: 794
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
          };

          html2pdf().set(opt).from(printEl).toPdf().get('pdf').then(function(pdf) {
            const totalPages = pdf.internal.getNumberOfPages();
            for (let p = totalPages; p > 1; p--) {
              pdf.deletePage(p);
            }
            if (dlBtn) dlBtn.innerHTML = origText;
            if (window.AndroidPrint && typeof window.AndroidPrint.savePdf === 'function') {
              const pdfDataUri = pdf.output('datauristring');
              window.AndroidPrint.savePdf(pdfDataUri, filename);
            } else {
              pdf.save(filename);
            }
          }).catch(function(e) {
            if (dlBtn) dlBtn.innerHTML = origText;
            self.executePrint();
          });
        } else {
          if (dlBtn) dlBtn.innerHTML = origText;
          self.executePrint();
        }
      });
  },

  executePrint: function() {
    // Check if running inside Android APK with native AndroidPrint bridge
    if (window.AndroidPrint && typeof window.AndroidPrint.printPage === 'function') {
      window.AndroidPrint.printPage();
      return;
    }
    // Browser print dialog
    window.print();
  },

  renderPrintInvoiceTemplate: function(inv, langOverride, templateOverride) {
    const settings = DB.getSettings();
    const printEl = document.getElementById('invoice-print-wrapper');
    if (!printEl) return;

    const pLang = langOverride || (typeof I18N !== 'undefined' ? I18N.printLang : 'bilingual') || 'bilingual';
    const L = (typeof I18N !== 'undefined') ? I18N.getInvoiceLabels(pLang) : null;
    const lbl = L || {
      page: 'الصفحة:',
      costCenter: 'م.التكلفة:',
      salesRep: 'المندوب :',
      warehouse: 'المستودع :',
      docNumber: 'الرقم :',
      docType: 'النوع :',
      paymentMethod: 'طريقة الدفع:',
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
      vatRow: 'إجمالي ضريبة القيمة المضافة 15 %',
      grandTotal: 'الصافي شامل ض.ق VAT',
      paid: 'المدفوع',
      remaining: 'المتبقي',
      totalQty: 'إجمالي الكمية',
      user: 'المستخدم :',
      version: 'رقم النسخة :',
      notes: 'ملاحظات :',
      receiverSign: 'المستلـــــم : .................................',
      sellerSign: 'البــــــائــــــــــــع : .................................',
      zatcaStamp: 'فاتورة إلكترونية معتمدة'
    };

    // Format numbers
    const fmt = (num) => parseFloat(num || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const fmtQty = (num) => parseFloat(num || 0).toLocaleString('en-US');

    // Generate QR Code (Website URL or ZATCA E-Invoice)
    let qrSvgHtml = '';
    let qrCaptionText = '';
    if (settings.showZatcaQr) {
      let qrPayload = '';
      const isWebsiteMode = (settings.qrType === 'website');

      if (isWebsiteMode) {
        qrPayload = (settings.websiteUrl || 'https://www.mayarjeddah.com').trim();
        const displayHost = qrPayload.replace(/^https?:\/\//i, '').replace(/\/.*$/, '');
        if (pLang === 'ar') {
          qrCaptionText = `<div style="font-weight:800;color:#002060;">زيارة موقع المنشأة</div><div style="font-size:10px;font-weight:800;color:#0284c7;margin-top:2px;">${displayHost}</div>`;
        } else if (pLang === 'en') {
          qrCaptionText = `<div style="font-weight:800;color:#002060;">Scan to Visit Website</div><div style="font-size:10px;font-weight:800;color:#0284c7;margin-top:2px;">${displayHost}</div>`;
        } else {
          qrCaptionText = `<div style="font-weight:800;color:#002060;">زيارة الموقع / Scan Website</div><div style="font-size:10px;font-weight:800;color:#0284c7;margin-top:2px;">${displayHost}</div>`;
        }
      } else {
        const timestamp = `${inv.date}T${inv.time || '10:15:20'}Z`;
        qrPayload = Zatca.generateQrPayload(
          settings.companyNameAr || settings.companyNameEn || 'Company',
          settings.taxNumber || '311186943400003',
          timestamp,
          inv.grandTotal,
          inv.vatTotal
        );
        qrCaptionText = `<div style="font-weight:800;color:#002060;">${lbl.zatcaStamp || 'فاتورة إلكترونية معتمدة'}</div><div style="font-size:8.5px;color:#0284c7;font-weight:700;margin-top:2px;">ZATCA E-Invoice</div>`;
      }

      if (qrPayload && typeof qrcode !== 'undefined') {
        const qr = qrcode(0, 'M');
        qr.addData(qrPayload);
        qr.make();
        qrSvgHtml = qr.createSvgTag(3, 0);
      }
    }

    // Logo image / SVG
    let logoHtml = '';
    if (settings.logoUrl && settings.logoUrl !== 'none') {
      logoHtml = `<img src="${settings.logoUrl}" alt="Logo" style="max-height: 48px; max-width: 130px; object-fit: contain;">`;
    } else if (settings.logoUrl === 'none') {
      logoHtml = '';
    } else {
      logoHtml = `<img src="assets/zain_logo.svg" alt="Logo" style="max-height: 48px; max-width: 130px; object-fit: contain;">`;
    }

    // Tafqeet
    let arTafqeet = '';
    let enTafqeet = '';
    let tafqeetText = '';
    try {
      arTafqeet = (typeof Tafqeet !== 'undefined' && Tafqeet.toArabicWords) ? Tafqeet.toArabicWords(inv.grandTotal) : '';
      enTafqeet = (typeof Tafqeet !== 'undefined' && Tafqeet.toEnglishWords) ? Tafqeet.toEnglishWords(inv.grandTotal, 'Saudi Riyal', 'Halalas') : '';
      if (pLang === 'ar') {
        tafqeetText = arTafqeet;
      } else if (pLang === 'en') {
        tafqeetText = enTafqeet;
      } else {
        tafqeetText = `<div>${arTafqeet}</div><div style="font-size: 10px; font-weight: 600; color: #0369a1; margin-top: 1px;">${enTafqeet}</div>`;
      }
    } catch (e) {
      console.error('Tafqeet error:', e);
    }

    const tpl = templateOverride || this.currentPrintTemplate || settings.activeTemplate || 'zain';

    if (tpl === 'mayar') {
      this.renderMayarInvoiceTemplate(inv, pLang, settings, lbl, fmt, qrSvgHtml, logoHtml, qrCaptionText, tafqeetText);
    } else {
      this.renderZainInvoiceTemplate(inv, pLang, settings, fmt, qrSvgHtml, logoHtml, arTafqeet, enTafqeet);
    }
  },

  // -------------------------------------------------------------------------
  // 🔴 ZAIN ADVANCED TRADING RED CONTINUOUS DOT-MATRIX FORMAT (Exact 1:1)
  // -------------------------------------------------------------------------
  renderZainInvoiceTemplate: function(inv, pLang, settings, fmt, qrSvgHtml, logoHtml, arTafqeet, enTafqeet) {
    const printEl = document.getElementById('invoice-print-wrapper');
    if (!printEl) return;

    // Document Title
    let docTitle = '<span dir="rtl">فاتورة ضريبية مبسطة</span> / <span dir="ltr">SIMPLIFIED TAX INVOICE</span>';
    if (inv.type === 'quotation') {
      docTitle = (pLang === 'en') ? 'SALES QUOTATION' : ((pLang === 'bilingual') ? '<span dir="rtl">عرض سعر مبيعات</span> / <span dir="ltr">SALES QUOTATION</span>' : '<span dir="rtl">عرض سعر مبيعات</span>');
    } else if (inv.type === 'tax_invoice') {
      docTitle = (pLang === 'en') ? 'TAX INVOICE' : ((pLang === 'bilingual') ? '<span dir="rtl">فاتورة ضريبية</span> / <span dir="ltr">TAX INVOICE</span>' : '<span dir="rtl">فاتورة ضريبية</span>');
    } else {
      docTitle = (pLang === 'en') ? 'SIMPLIFIED TAX INVOICE' : ((pLang === 'bilingual') ? '<span dir="rtl">فاتورة ضريبية مبسطة</span> / <span dir="ltr">SIMPLIFIED TAX INVOICE</span>' : '<span dir="rtl">فاتورة ضريبية مبسطة</span>');
    }

    const isCash = (!inv.paymentMethod || inv.paymentMethod === 'cash');
    const payMethodText = isCash ? '<span dir="ltr">CASH</span> / <span dir="rtl">نقدي</span>' : (inv.paymentMethod === 'credit' ? '<span dir="ltr">CREDIT</span> / <span dir="rtl">آجل</span>' : (inv.paymentMethod === 'bank' ? '<span dir="ltr">BANK</span> / <span dir="rtl">تحويل</span>' : '<span dir="ltr">CARD</span> / <span dir="rtl">شبكة</span>'));

    const cust = inv.customer || {};
    const custName = cust.name || 'نقدي';
    const custDist = cust.district || (cust.address ? cust.address.split('-')[0].trim() : (cust.destination || ''));
    const custPostal = cust.postalCode || '22421';
    const custCity = cust.cityName || cust.destination || 'جدة';
    const custCountry = cust.countryName || 'المملكة العربية السعودية';
    const custPhone = cust.phone || '';
    const custBalance = cust.balance || '0.00';
    const custCr = cust.crNumber || '';
    const custTax = cust.taxNumber || 'لايوجد';
    const custBuilding = cust.buildingNo || '';
    const custStreet = cust.streetName || (cust.address || '');
    const custSecondary = cust.secondaryNo || '';
    const custArea = cust.areaName || cust.destination || 'جدة';

    const rowsHtml = (inv.items || []).map((item, idx) => `
      <tr>
        <td style="width: 22px; text-align: center; font-weight: 700;">${item.sr || (idx + 1)}</td>
        <td style="width: 48px; text-align: center; font-weight: 700; color: #1e293b;">${item.code || ''}</td>
        <td class="desc-cell" style="font-weight: 700; color: #0f172a;">${item.description || ''}</td>
        <td style="width: 38px; text-align: center; font-weight: 800;">${fmt(item.quantity)}</td>
        <td style="width: 36px; text-align: center;">${item.unit || 'كرتون'}</td>
        <td style="width: 46px; text-align: center;">${fmt(item.price)}</td>
        <td style="width: 46px; text-align: center; color: #475569;">${item.packing || '-'}</td>
        <td style="width: 52px; text-align: center; font-weight: 800;">${fmt(item.net)}</td>
        <td style="width: 30px; text-align: center; font-weight: 700; color: #9e0e24;">${(item.vatRate !== undefined && item.vatRate !== null) ? item.vatRate : 15}</td>
        <td style="width: 44px; text-align: center; font-weight: 700; color: #b91c1c;">${fmt(item.vatAmount)}</td>
        <td style="width: 54px; text-align: center; font-weight: 900; color: #111827;">${fmt(item.totalWithVat)}</td>
      </tr>
    `).join('');

    printEl.innerHTML = `
      <div class="zain-inv-container">
        <!-- 1. Red Header Box -->
        <div class="zain-top-header">
          <!-- Left: English Details -->
          <div class="zain-header-left">
            <div class="comp-title">${settings.companyNameEn || 'ZAIN ADVANCED TRADING COMPANY'}</div>
            <div style="font-style: italic; opacity: 0.95; margin-bottom: 2px;">${settings.activityEn || 'Sundries, Stationary & Cosmetics Wholesale'}</div>
            <div>${settings.addressEn || 'Jeddah - Mahjar - Dawar Nojoom - Nujoom Center'}</div>
            <div>${settings.buildingEn || 'Mahjar - Building No. 8205 - Secondary No. 3731'}</div>
            <div>${settings.postalEn || 'Postal Code 22421 - Jeddah - K.S.A'}</div>
            <div style="margin-top: 2px; font-weight: 700;">${settings.phonesEn || '📞 012 608 6220 📱 055 886 3822 📱 050 587 8700'}</div>
          </div>

          <!-- Center: Logo & Email -->
          <div class="zain-header-center">
            <div class="zain-logo-badge">
              <img src="${settings.logoUrl || 'assets/zain_logo.svg'}" alt="Logo">
            </div>
            <div class="zain-header-email">E-mail: ${settings.email || 'wholesalezain@gmail.com'}</div>
          </div>

          <!-- Right: Arabic Details -->
          <div class="zain-header-right" dir="rtl">
            <div class="comp-title">${settings.companyNameAr || 'شركة زين المتقدمة التجارية بالجملة'}</div>
            <div style="opacity: 0.95; margin-bottom: 2px;">${settings.activityAr || 'خردوات والقرطاسية وأدوات التجميل بالجملة'}</div>
            <div>${settings.addressAr || 'جدة - المحجر - دوار النجوم - مركز النجوم'}</div>
            <div>${settings.buildingAr || 'حي المحجر - رقم المبنى ٨٢٠٥ - رقم إضافي ٣٧٣١'}</div>
            <div>${settings.postalAr || 'رمز بريدي ٢٢٤٢١ - جدة - المملكة العربية السعودية'}</div>
            <div style="margin-top: 2px; font-weight: 700;">${settings.phonesAr || '📞 ٠١٢٦٠٨٦٢٢٠ 📱 ٠٥٥٨٨٦٣٨٢٢ 📱 ٠٥٠٥٨٧٨٧٠٠'}</div>
          </div>
        </div>

        <!-- 2. Sub-Header Strip -->
        <div class="zain-sub-header">
          <div class="zain-sub-left">
            <span>Page : 1 / 1</span>
          </div>
          <div class="zain-sub-center">
            ${docTitle}
          </div>
          <div class="zain-sub-right">
            <span>C.R No. : <b>${settings.crNumber || '4030294347'}</b></span><br>
            <span>VAT No. : <b>${settings.taxNumber || '311186943400003'}</b></span>
          </div>
        </div>

        <!-- 3. Customer & Invoice Meta Box -->
        <div class="zain-meta-section">
          <!-- Full Width Customer Name Bar -->
          <div class="zain-customer-bar">
            <div>Customer Name: <span style="color:#9e0e24; font-size:10.5px; font-weight:900;">${custName}</span></div>
            <div dir="rtl">اسم العميل : <span style="color:#9e0e24; font-size:10.5px; font-weight:900;">${custName}</span></div>
          </div>

          <!-- 3-Column Grid -->
          <div class="zain-meta-grid">
            <!-- Left Column: Customer Address -->
            <div class="zain-meta-col-left">
              <div class="zain-field-row">
                <span class="zain-field-lbl-en">Payment Method:</span>
                <span class="zain-field-val" style="color: #9e0e24;">${payMethodText}</span>
                <span class="zain-field-lbl-ar" dir="rtl">: طريقة الدفع</span>
              </div>
              <div class="zain-field-row">
                <span class="zain-field-lbl-en">District :</span>
                <span class="zain-field-val">${custDist}</span>
                <span class="zain-field-lbl-ar" dir="rtl">: الحي</span>
              </div>
              <div class="zain-field-row">
                <span class="zain-field-lbl-en">Postal Code :</span>
                <span class="zain-field-val">${custPostal}</span>
                <span class="zain-field-lbl-ar" dir="rtl">: رمز البريدي</span>
              </div>
              <div class="zain-field-row">
                <span class="zain-field-lbl-en">City Name :</span>
                <span class="zain-field-val">${custCity}</span>
                <span class="zain-field-lbl-ar" dir="rtl">: إسم المدينة</span>
              </div>
              <div class="zain-field-row">
                <span class="zain-field-lbl-en">Country Name :</span>
                <span class="zain-field-val">${custCountry}</span>
                <span class="zain-field-lbl-ar" dir="rtl">: اسم البلد</span>
              </div>
              <div class="zain-field-row">
                <span class="zain-field-lbl-en">Mobile :</span>
                <span class="zain-field-val">${custPhone}</span>
                <span class="zain-field-lbl-ar" dir="rtl">: رقم الاتصال</span>
              </div>
              <div class="zain-field-row">
                <span class="zain-field-lbl-en">Old Balance :</span>
                <span class="zain-field-val">${custBalance}</span>
                <span class="zain-field-lbl-ar" dir="rtl">: رصيد السابق</span>
              </div>
            </div>

            <!-- Center Column: QR Code -->
            <div class="zain-meta-col-center">
              ${qrSvgHtml || '<div style="font-size:10px;color:#888;">ZATCA QR</div>'}
            </div>

            <!-- Right Column: Invoice Details -->
            <div class="zain-meta-col-right">
              <div class="zain-field-row">
                <span class="zain-field-lbl-en">Invoice No. :</span>
                <span class="zain-field-val" style="color: #9e0e24; font-size:10.5px;">${inv.number || '000001'}</span>
                <span class="zain-field-lbl-ar" dir="rtl">: رقم الفاتورة</span>
              </div>
              <div class="zain-field-row">
                <span class="zain-field-lbl-en">Invoice Date :</span>
                <span class="zain-field-val">${inv.date} ${inv.time || '10:15:20'}</span>
                <span class="zain-field-lbl-ar" dir="rtl">: تاريخ الفاتورة</span>
              </div>
              <div class="zain-field-row">
                <span class="zain-field-lbl-en">C.R No. :</span>
                <span class="zain-field-val">${custCr}</span>
                <span class="zain-field-lbl-ar" dir="rtl">: رقم السجل التجاري</span>
              </div>
              <div class="zain-field-row">
                <span class="zain-field-lbl-en">VAT No. :</span>
                <span class="zain-field-val">${custTax}</span>
                <span class="zain-field-lbl-ar" dir="rtl">: الرقم الضريبي</span>
              </div>
              <div class="zain-field-row">
                <span class="zain-field-lbl-en">Building No. :</span>
                <span class="zain-field-val">${custBuilding}</span>
                <span class="zain-field-lbl-ar" dir="rtl">: رقم المبنى</span>
              </div>
              <div class="zain-field-row">
                <span class="zain-field-lbl-en">Street Name :</span>
                <span class="zain-field-val">${custStreet}</span>
                <span class="zain-field-lbl-ar" dir="rtl">: اسم الشارع</span>
              </div>
              <div class="zain-field-row">
                <span class="zain-field-lbl-en">Secondary No:</span>
                <span class="zain-field-val">${custSecondary}</span>
                <span class="zain-field-lbl-ar" dir="rtl">: الرقم الإضافي</span>
              </div>
              <div class="zain-field-row">
                <span class="zain-field-lbl-en">Area Name :</span>
                <span class="zain-field-val">${custArea}</span>
                <span class="zain-field-lbl-ar" dir="rtl">: اسم المنطقة</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 4. Items Table (11 Columns) -->
        <table class="zain-table">
          <thead>
            <tr>
              <th style="width: 22px;"><span dir="rtl">م</span><br>Sl.No</th>
              <th style="width: 48px;"><span dir="rtl">رمز الصنف</span><br>SKU</th>
              <th><span dir="rtl">اسم الصنف</span><br>Item Description</th>
              <th style="width: 38px;"><span dir="rtl">الكمية</span><br>Qty</th>
              <th style="width: 36px;"><span dir="rtl">الوحدة</span><br>Unit</th>
              <th style="width: 46px;"><span dir="rtl">سعر الوحدة</span><br>U. Price</th>
              <th style="width: 46px;"><span dir="rtl">العبوة</span><br>Packing</th>
              <th style="width: 52px;"><span dir="rtl">إجمالي الفاتورة</span><br>Total Price</th>
              <th style="width: 30px;"><span dir="rtl">الضريبة %</span><br>Tax%</th>
              <th style="width: 44px;"><span dir="rtl">الضريبة</span><br>Vat Amt.</th>
              <th style="width: 54px;"><span dir="rtl">الإجمالي</span><br>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <!-- 5. Bottom Footer Grid -->
        <div class="zain-footer-grid">
          <!-- Left Sub-Grid: Tafqeet, Banks, Signatures -->
          <div class="zain-footer-left">
            <!-- Tafqeet Banner -->
            <div class="zain-tafqeet-strip">
              <div><b>Only :</b> ${enTafqeet || 'Saudi Riyal ' + fmt(inv.grandTotal)} Only</div>
              <div dir="rtl" style="margin-top: 1px;"><b>فقط ،</b> ${arTafqeet || ''} لاغير</div>
            </div>

            <!-- Bank Accounts Box -->
            <div class="zain-bank-box">
              <div class="zain-bank-row">
                <span class="zain-bank-badge">${settings.bank1Name || 'SNB'}</span>
                <span dir="rtl" style="font-weight: 700;">${settings.bank1Account || 'شركة زين المتقدمة التجارية'}</span>
                <span>A/C No: <b>${settings.bank1Iban || 'SA0510000011500000186902'}</b></span>
              </div>
              <div class="zain-bank-row">
                <span class="zain-bank-badge" style="background:#0284c7;">${settings.bank2Name || 'Al Rajhi Bank'}</span>
                <span dir="rtl" style="font-weight: 700;">${settings.bank2Account || 'شركة زين المتقدمة التجارية'}</span>
                <span>A/C No: <b>${settings.bank2Iban || 'SA0880000 471608010461457'}</b></span>
              </div>
            </div>

            <!-- Signatures Row -->
            <div class="zain-signatures-row">
              <div>Received By<br><span dir="rtl">المستلم</span></div>
              <div>Checked by<br><span dir="rtl">المراجع</span></div>
              <div>Prepared By<br><span dir="rtl">اعدت بواسطة : <b>${inv.user || settings.preparedBy || settings.salesRep || 'المدير'}</b></span></div>
            </div>
          </div>

          <!-- Right Sub-Grid: Financial Summary -->
          <div class="zain-financial-box">
            <div class="zain-fin-row">
              <div class="lbl-en-ar">
                <span>Total (Excluding VAT)</span>
                <span class="lbl-ar" dir="rtl">الإجمالي قبل ضريبة القيمة المضافة</span>
              </div>
              <div class="val">${fmt(inv.subtotal)}</div>
            </div>

            <div class="zain-fin-row">
              <div class="lbl-en-ar">
                <span>Total Taxable Amount (Excluding VAT)</span>
                <span class="lbl-ar" dir="rtl">إجمالي المبلغ الخاضع للضريبة (باستثناء ض.ق.م)</span>
              </div>
              <div class="val">${fmt(inv.netTotal)}</div>
            </div>

            <div class="zain-fin-row">
              <div class="lbl-en-ar">
                <span>Total VAT Amount</span>
                <span class="lbl-ar" dir="rtl">المبلغ الإجمالي شامل ضريبة القيمة المضافة</span>
              </div>
              <div class="val">${fmt(inv.vatTotal)}</div>
            </div>

            <div class="zain-fin-row zain-fin-grand-total">
              <div class="lbl-en-ar">
                <span>Total Amount Due</span>
                <span class="lbl-ar" dir="rtl">إجمالي المبلغ المستحق</span>
              </div>
              <div class="val">${fmt(inv.grandTotal)}</div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // -------------------------------------------------------------------------
  // 🔵 MAYAR MODERN BLUE ZATCA FORMAT
  // -------------------------------------------------------------------------
  renderMayarInvoiceTemplate: function(inv, pLang, settings, lbl, fmt, qrSvgHtml, logoHtml, qrCaptionText, tafqeetText) {
    const printEl = document.getElementById('invoice-print-wrapper');
    if (!printEl) return;

    // Document title
    let docTitle = (lbl && lbl.simplifiedTaxInvoiceTitle) ? lbl.simplifiedTaxInvoiceTitle : 'فاتورة ضريبية مبسطة';
    if (inv.type === 'quotation') {
      docTitle = (lbl && lbl.quotationTitle) ? lbl.quotationTitle : 'عرض سعر مبيعات';
    } else if (inv.type === 'tax_invoice') {
      docTitle = (lbl && lbl.taxInvoiceTitle) ? lbl.taxInvoiceTitle : 'فاتورة ضريبية';
    }

    const payMap = {
      cash: (lbl.paymentCash || (pLang === 'en' ? 'Cash' : (pLang === 'bilingual' ? 'نقدي / Cash' : 'نقدي'))),
      credit: (lbl.paymentCredit || (pLang === 'en' ? 'Credit / On Account' : (pLang === 'bilingual' ? 'آجل / Credit' : 'آجل'))),
      bank: (lbl.paymentBank || (pLang === 'en' ? 'Bank Transfer' : (pLang === 'bilingual' ? 'تحويل بنكي / Bank Transfer' : 'تحويل بنكي'))),
      card: (lbl.paymentCard || (pLang === 'en' ? 'Card / Mada' : (pLang === 'bilingual' ? 'شبكة (مدى) / Card' : 'شبكة (مدى)')))
    };
    const payMethodText = payMap[inv.paymentMethod || 'cash'] || payMap['cash'];
    const payBadgeColor = (inv.paymentMethod === 'cash') ? '#059669' : '#0284c7';
    const payBadgeBg = (inv.paymentMethod === 'cash') ? '#dcfce7' : '#e0f2fe';

    const rowsHtml = (inv.items || []).map((item, idx) => `
      <tr class="${idx % 2 === 1 ? 'inv-row-alt' : ''}">
        <td style="width: 25px; text-align: center; font-weight: 700;">${item.sr || (idx + 1)}</td>
        <td style="width: 50px; text-align: center; color: #475569; font-weight: 700;">${item.code || ''}</td>
        <td class="desc" style="color: #0f172a; font-weight: 700;">${item.description || ''}</td>
        <td style="width: 50px; text-align: center;">${item.unit || ''}</td>
        <td style="width: 50px; text-align: center; font-weight: 700;">${fmt(item.quantity)}</td>
        <td style="width: 55px; text-align: center;">${fmt(item.price)}</td>
        <td class="blue-net" style="width: 65px; text-align: center; font-weight: 800;">${fmt(item.net)}</td>
        <td style="width: 32px; text-align: center; font-size: 10px; color: #0284c7; font-weight: 700;">%${(item.vatRate !== undefined && item.vatRate !== null) ? item.vatRate : 15}</td>
        <td style="width: 55px; text-align: center; color: #b91c1c; font-weight: 700;">${fmt(item.vatAmount)}</td>
        <td class="inv-total-vat-col" style="width: 65px; text-align: center; font-weight: 900;">${fmt(item.totalWithVat)}</td>
      </tr>
    `).join('');

    printEl.innerHTML = `
      <!-- Top Decorative Corporate Color Bar -->
      <div class="inv-top-color-bar"></div>

      <!-- 1. Header Grid -->
      <div class="inv-header-grid">
        <div class="inv-company-en">
          ${settings.companyNameEn ? settings.companyNameEn.replace(' ', '<br>') : 'Mayar Jeddah<br>Trading Company'}
        </div>
        <div class="inv-company-logo">
          ${logoHtml}
        </div>
        <div class="inv-company-ar">
          ${settings.companyNameAr || 'شركة معيار جدة للتجارة<br>للمواد الغذائية'}
        </div>
      </div>

      <!-- Tax Numbers Row -->
      <div class="inv-tax-numbers-row">
        <div>Tax Number ${settings.taxNumber || '311193748100003'}</div>
        <div>الرقم الضريبي ${settings.taxNumber || '311193748100003'}</div>
      </div>

      <!-- Branch -->
      <div class="inv-branch-label">
        ${settings.branch || 'فرع 1 - 001'}
      </div>

      <!-- 2. Document Meta Box -->
      <div class="inv-meta-box">
        <!-- Left Sub-Box -->
        <div class="inv-meta-left">
          <div class="inv-meta-row"><span class="label">${lbl.page}</span> <span>${inv.pageInfo || '1 من 1'}</span></div>
          <div class="inv-meta-row"><span class="label">${lbl.costCenter}</span> <span>${inv.costCenter || 'م.تكلفة 1 - 001'}</span></div>
          <div class="inv-meta-row"><span class="label">${lbl.salesRep}</span> <span>${inv.salesRep || ''}</span></div>
          <div class="inv-meta-row"><span class="label">${lbl.warehouse}</span> <span>${inv.warehouse || 'مستودع 1 - 01'}</span></div>
        </div>

        <!-- Center Sub-Box -->
        <div class="inv-meta-center">
          <div class="inv-doc-title">${docTitle}</div>
          <div class="inv-meta-center-details">
            <div class="inv-meta-row"><span class="label">${lbl.docNumber}</span> <span style="font-weight: 800; color: #002060; background: #e0f2fe; padding: 1px 6px; border-radius: 4px;">${inv.number}</span></div>
            <div class="inv-meta-row"><span class="label">${lbl.docType}</span> <span>${inv.type === 'quotation' ? (pLang === 'en' ? 'Quotation' : (pLang === 'bilingual' ? 'عرض بيع / Quotation' : 'عرض بيع')) : (pLang === 'en' ? 'Tax Invoice' : (pLang === 'bilingual' ? 'فاتورة ضريبية / Tax Invoice' : 'فاتورة ضريبية'))}</span></div>
            <div class="inv-meta-row"><span class="label">${lbl.paymentMethod || 'طريقة الدفع:'}</span> <span style="font-weight: 800; color: ${payBadgeColor}; background: ${payBadgeBg}; padding: 1px 6px; border-radius: 4px;">${payMethodText}</span></div>
            <div class="inv-meta-row"><span class="label">${lbl.refNo}</span> <span>${inv.refNo || ''}</span></div>
            <div class="inv-meta-row"><span class="label">${lbl.orderNo}</span> <span>${inv.orderNo || ''}</span></div>
            <div class="inv-meta-row"><span class="label">${lbl.rate}</span> <span>${inv.exchangeRate || 1}</span></div>
            <div class="inv-meta-row"><span class="label">${lbl.currency}</span> <span>${inv.currency || lbl.currencyUnit}</span></div>
          </div>
        </div>

        <!-- Right Sub-Box -->
        <div class="inv-meta-right">
          <div class="inv-meta-row"><span class="label">${lbl.date}</span> <span>${inv.date}</span></div>
          <div class="inv-meta-row"><span class="label">${lbl.hijri}</span> <span>${inv.hijriDate || ''}</span></div>
          <div class="inv-meta-row"><span class="label">${lbl.time}</span> <span>${inv.time || ''}</span></div>
        </div>
      </div>

      <!-- 3. Customer Information Strip -->
      <div class="inv-customer-strip">
        <div class="inv-cust-col">
          <div class="inv-cust-row"><span class="lbl">${lbl.customer}</span> <span>${inv.customer ? inv.customer.name : ''}</span></div>
          <div class="inv-cust-row"><span class="lbl">${lbl.address}</span> <span>${inv.customer ? (inv.customer.address || '') : ''}</span></div>
        </div>

        <div class="inv-cust-col">
          <div class="inv-cust-row"><span class="lbl">${lbl.taxNumber}</span> <span>${inv.customer ? (inv.customer.taxNumber || (pLang === 'en' ? 'N/A' : 'لايوجد')) : (pLang === 'en' ? 'N/A' : 'لايوجد')}</span></div>
          <div class="inv-cust-row"><span class="lbl">${lbl.destination}</span> <span>${inv.customer ? (inv.customer.destination || (pLang === 'en' ? 'Local' : 'محلي')) : (pLang === 'en' ? 'Local' : 'محلي')}</span></div>
        </div>

        <div class="inv-cust-col">
          <div class="inv-cust-row"><span class="lbl">${lbl.crNumber}</span> <span>${inv.customer ? (inv.customer.crNumber || '') : ''}</span></div>
          <div class="inv-cust-row"><span class="lbl">${lbl.repLabel}</span> <span>${inv.customer ? (inv.customer.representative || '') : ''}</span></div>
        </div>

        <div class="inv-cust-col">
          <div class="inv-cust-row"><span class="lbl">${lbl.competitorsLabel}</span> <span>${inv.customer ? (inv.customer.competitors || '') : ''}</span></div>
        </div>
      </div>

      <!-- 4. Main Items Table -->
      <table class="inv-items-table">
        <thead>
          <tr>
            <th rowspan="2" style="width: 25px;">${lbl.thSr}</th>
            <th rowspan="2" style="width: 50px;">${lbl.thCode}</th>
            <th rowspan="2">${lbl.thDesc}</th>
            <th rowspan="2" style="width: 50px;">${lbl.thUnit}</th>
            <th rowspan="2" style="width: 50px;">${lbl.thQty}</th>
            <th rowspan="2" style="width: 55px;">${lbl.thPrice}</th>
            <th rowspan="2" style="width: 65px; color: #002060;">${lbl.thNet}</th>
            <th colspan="2" style="width: 87px;">${lbl.thVatHeader}</th>
            <th rowspan="2" style="width: 65px;">${lbl.thTotalWithVat}</th>
          </tr>
          <tr>
            <th style="width: 32px; font-size: 10px;">${lbl.thVatRate}</th>
            <th style="width: 55px; font-size: 10px;">${lbl.thVatAmt}</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>

      <!-- 5. Totals Grid -->
      <div class="inv-totals-grid">
        <!-- Left: Financial Box -->
        <div class="inv-fin-box">
          <div class="inv-fin-row bold-blue">
            <span>${lbl.subtotal}</span>
            <span>${fmt(inv.subtotal)}</span>
          </div>
          <div class="inv-fin-row">
            <span>${lbl.additions}</span>
            <span>${fmt(inv.additions)}</span>
          </div>
          <div class="inv-fin-row">
            <span>${lbl.grossTotal}</span>
            <span>${fmt(inv.grossTotal)}</span>
          </div>
          <div class="inv-fin-row">
            <span>${lbl.discount}</span>
            <span>${fmt(inv.discountAmount)} | %${inv.discountPercent || 0}</span>
          </div>
          <div class="inv-fin-row">
            <span>${lbl.netTotal}</span>
            <span>${fmt(inv.netTotal)}</span>
          </div>
          <div class="inv-fin-row vat-header">
            <span>${lbl.vatRow}</span>
            <span>${fmt(inv.vatTotal)}</span>
          </div>
          <div class="inv-fin-row grand-total">
            <span>${lbl.grandTotal}</span>
            <span style="font-size: 12px; font-weight: 800;">${fmt(inv.grandTotal)}</span>
          </div>
        </div>

        <!-- Middle: Quantities & Payments -->
        <div class="inv-mid-boxes">
          ${(inv.paymentMethod === 'credit') ? `
            <div class="inv-mid-card">
              <span>${lbl.paid}</span>
              <span>${fmt(inv.paidAmount)}</span>
            </div>
            <div class="inv-mid-card" style="margin-top: 4px;">
              <span>${lbl.remaining}</span>
              <span style="font-weight: 800;">${fmt(inv.remainingAmount)}</span>
            </div>
          ` : ''}
          <div class="inv-mid-card" style="${(inv.paymentMethod === 'credit') ? 'margin-top: 4px;' : ''}">
            <span>${lbl.totalQty}</span>
            <span>${fmt(inv.totalQuantity)}</span>
          </div>
        </div>

        <!-- Right: Metadata & Notes -->
        <div class="inv-right-meta">
          <div><span style="font-weight: 700;">${lbl.user}</span> <bdi dir="auto">${inv.user || '10-المدير'}</bdi></div>
          <div><span style="font-weight: 700;">${lbl.version}</span> ${inv.versionNo || 0}</div>
          <div style="font-size: 10px; color: #444;"><span style="font-weight: 700;">${pLang === 'en' ? 'Date & Time:' : (pLang === 'bilingual' ? 'التاريخ والوقت / Date:' : 'التاريخ والوقت:')}</span> ${inv.date} ${inv.time || ''}</div>
          <div style="margin-top: 4px; font-weight: 700;">${lbl.notes}</div>
          <div style="font-size: 10px; color: #333; min-height: 25px;">${inv.notes || ''}</div>
        </div>
      </div>

      <!-- 7. Tafqeet Banner Box -->
      <div class="inv-tafqeet-box">
        ${tafqeetText}
      </div>

      <!-- 8. Middle QR Code Strip (Directly Under Totals & Tafqeet) -->
      ${settings.showZatcaQr && qrSvgHtml ? `
        <div class="inv-qr-middle-strip">
          <div class="inv-qr-badge-card">
            <div class="inv-qr-svg-wrap">${qrSvgHtml}</div>
            <div class="inv-qr-caption-text">${qrCaptionText}</div>
          </div>
        </div>
      ` : ''}

      <!-- 9. Signatures Row -->
      <div class="inv-signatures-row">
        <div>${lbl.receiverSign}</div>
        <div>${lbl.sellerSign}</div>
      </div>
    `;
  },

  // -------------------------------------------------------------------------
  // INVOICES LIST VIEW
  // -------------------------------------------------------------------------
  // -------------------------------------------------------------------------
  // INVOICES LIST VIEW
  // -------------------------------------------------------------------------
  renderInvoicesList: function() {
    const listContainer = document.getElementById('invoices-table-body');
    if (!listContainer) return;
    const invoices = DB.getInvoices();
    const isEn = (typeof I18N !== 'undefined' && I18N.currentLang === 'en');

    if (invoices.length === 0) {
      const emptyMsg = (typeof I18N !== 'undefined') ? I18N.t('emptyInvoices') : 'No invoices found. Click "Create Invoice" to start.';
      listContainer.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 24px; color: #888;">${emptyMsg}</td></tr>`;
      return;
    }

    listContainer.innerHTML = invoices.map(inv => {
      const typeLabel = isEn 
        ? (inv.type === 'quotation' ? 'Quotation' : 'Tax Invoice')
        : (inv.typeNameAr || (inv.type === 'quotation' ? 'عرض سعر' : 'فاتورة ضريبية'));
      const isPaid = (inv.paymentMethod !== 'credit') || (inv.remainingAmount <= 0);
      const statusText = isPaid
        ? (isEn ? 'Paid in Full' : 'مدفوع بالكامل')
        : ((isEn ? 'Due: ' : 'متبقي: ') + (inv.remainingAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 }));
      const statusColor = isPaid ? '#059669' : '#d97706';
      const custName = inv.customer && inv.customer.name ? inv.customer.name : (isEn ? 'Cash Customer' : 'عميل نقدي');

      return `
        <tr class="app-list-row invoice-list-row" onclick="App.printInvoice('${inv.id}')">
          <td class="col-docno" style="font-weight: bold;">
            <div class="mobile-card-header">
              <span class="mobile-docno-badge">#${inv.number}</span>
              <span class="badge ${inv.type === 'quotation' ? 'badge-info' : 'badge-primary'} mobile-type-badge">
                ${typeLabel}
              </span>
              <span class="mobile-date-text">${inv.date}</span>
            </div>
            <span class="desktop-cell-text">${inv.number}</span>
          </td>
          <td class="col-doctype desktop-only-cell">
            <span class="badge ${inv.type === 'quotation' ? 'badge-info' : 'badge-primary'}">
              ${typeLabel}
            </span>
          </td>
          <td class="col-docdate desktop-only-cell">${inv.date}</td>
          <td class="col-customer">
            <div class="mobile-field-row">
              <span class="mobile-field-label">${isEn ? 'Customer' : 'العميل'}:</span>
              <span class="customer-name-val">${custName}</span>
            </div>
            <span class="desktop-cell-text">${custName}</span>
          </td>
          <td class="col-grandtotal">
            <div class="mobile-field-row">
              <span class="mobile-field-label">${isEn ? 'Total' : 'الإجمالي'}:</span>
              <span class="grand-total-val">${(inv.grandTotal || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} SAR</span>
            </div>
            <span class="desktop-cell-text" style="font-weight: bold; color: #002060;">${(inv.grandTotal || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} SAR</span>
          </td>
          <td class="col-status">
            <div class="mobile-field-row">
              <span class="mobile-field-label">${isEn ? 'Status' : 'الحالة'}:</span>
              <span style="font-size: 12px; font-weight: 700; color: ${statusColor}">● ${statusText}</span>
            </div>
            <span class="desktop-cell-text" style="font-size: 12px; font-weight: 600; color: ${statusColor}">${statusText}</span>
          </td>
          <td class="col-actions">
            <div class="card-actions-wrapper" onclick="event.stopPropagation()">
              <button type="button" class="btn btn-sm btn-primary action-btn-main" onclick="event.stopPropagation(); App.printInvoice('${inv.id}')" title="${isEn ? 'View & Print' : 'عرض وطباعة'}">
                🖨️ ${isEn ? 'View / Print' : 'عرض وطباعة'}
              </button>
              <button type="button" class="btn btn-sm btn-outline action-btn-sec" onclick="event.stopPropagation(); App.editInvoice('${inv.id}')" title="${isEn ? 'Edit' : 'تعديل'}">
                ✏️ ${isEn ? 'Edit' : 'تعديل'}
              </button>
              <button type="button" class="btn btn-sm btn-outline action-btn-sec" onclick="event.stopPropagation(); App.duplicateInvoice('${inv.id}')" title="${isEn ? 'Duplicate' : 'نسخ'}">
                📄
              </button>
              <button type="button" class="btn btn-sm btn-danger action-btn-sec" onclick="event.stopPropagation(); App.deleteInvoice('${inv.id}')" title="${isEn ? 'Delete' : 'حذف'}">
                🗑️
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  editInvoice: function(id) {
    const inv = DB.getInvoiceById(id);
    if (inv) {
      this.initNewInvoice(inv);
      this.switchTab('new-invoice-tab');
    }
  },

  duplicateInvoice: function(id) {
    const inv = DB.getInvoiceById(id);
    if (inv) {
      const copy = JSON.parse(JSON.stringify(inv));
      copy.id = null;
      const settings = DB.getSettings();
      copy.number = String(settings.nextQuotationNumber || 1).padStart(6, '0');
      copy.date = new Date().toISOString().split('T')[0];
      copy.time = new Date().toTimeString().split(' ')[0];
      copy.hijriDate = HijriConverter.toHijri(copy.date, -1);
      this.initNewInvoice(copy);
      this.switchTab('new-invoice-tab');
    }
  },

  deleteInvoice: function(id) {
    const msg = (typeof I18N !== 'undefined') ? I18N.t('msgConfirmDeleteInv') : 'Are you sure you want to delete this invoice?';
    if (confirm(msg)) {
      DB.deleteInvoice(id);
      this.renderInvoicesList();
    }
  },

  // -------------------------------------------------------------------------
  // PRODUCTS & PRICE CATALOG
  // -------------------------------------------------------------------------
  renderProductsList: function() {
    const tbody = document.getElementById('products-table-body');
    if (!tbody) return;
    const products = DB.getProducts();
    const isEn = (typeof I18N !== 'undefined' && I18N.currentLang === 'en');

    if (products.length === 0) {
      const emptyMsg = (typeof I18N !== 'undefined') ? I18N.t('emptyProducts') : 'No products found.';
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 20px; color: #888;">${emptyMsg}</td></tr>`;
      return;
    }

    tbody.innerHTML = products.map(p => `
      <tr class="app-list-row product-list-row" onclick="App.openEditProductModal('${p.id}')">
        <td class="col-sku" style="font-weight: bold; color: #0284c7;">
          <div class="mobile-card-header">
            <span class="mobile-sku-badge">#${p.code || '-'}</span>
            <span class="mobile-prod-title">${p.name}</span>
            <span class="mobile-category-pill">${p.category || (isEn ? 'General' : 'عام')}</span>
          </div>
          <span class="desktop-cell-text">${p.code || '-'}</span>
        </td>
        <td class="col-prodname desktop-only-cell" style="font-weight: 600;">${p.name}</td>
        <td class="col-category desktop-only-cell"><span style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 12px;">${p.category || (isEn ? 'General' : 'عام')}</span></td>
        <td class="col-unit">
          <div class="mobile-field-row">
            <span class="mobile-field-label">${isEn ? 'Unit' : 'الوحدة'}:</span>
            <span>${p.unit || (isEn ? 'Carton' : 'كرتون')}</span>
          </div>
          <span class="desktop-cell-text">${p.unit || (isEn ? 'Carton' : 'كرتون')}</span>
        </td>
        <td class="col-price">
          <div class="mobile-field-row">
            <span class="mobile-field-label">${isEn ? 'Base Price' : 'السعر'}:</span>
            <span style="font-weight: 800; color: #0284c7;">${(p.price || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} SAR</span>
          </div>
          <span class="desktop-cell-text" style="font-weight: bold;">${(p.price || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} SAR</span>
        </td>
        <td class="col-vatrate">
          <div class="mobile-field-row">
            <span class="mobile-field-label">${isEn ? 'VAT %' : 'الضريبة'}:</span>
            <span>%${p.vatRate !== undefined ? p.vatRate : 15}</span>
          </div>
          <span class="desktop-cell-text">%${p.vatRate !== undefined ? p.vatRate : 15}</span>
        </td>
        <td class="col-actions">
          <div class="card-actions-wrapper" onclick="event.stopPropagation()">
            <button type="button" class="btn btn-sm btn-primary action-btn-main" onclick="event.stopPropagation(); App.openEditProductModal('${p.id}')">
              ✏️ ${isEn ? 'Edit Product' : 'تعديل المنتج'}
            </button>
            <button type="button" class="btn btn-sm btn-danger action-btn-sec" onclick="event.stopPropagation(); App.deleteProduct('${p.id}')">
              🗑️ ${isEn ? 'Delete' : 'حذف'}
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  },

  openAddProductModal: function() {
    const isEn = (typeof I18N !== 'undefined' && I18N.currentLang === 'en');
    const title = document.getElementById('modal-prod-title');
    if (title) title.textContent = isEn ? 'Add New Product' : 'إضافة منتج جديد';

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val;
    };

    setVal('prod-id', '');
    setVal('prod-code', '');
    setVal('prod-name', '');
    setVal('prod-category', isEn ? 'General' : 'عام');
    setVal('prod-unit', isEn ? 'Carton' : 'كرتون');
    setVal('prod-price', '');
    setVal('prod-vat', '15');

    const modal = document.getElementById('modal-product');
    if (modal) modal.classList.add('show');
  },

  openEditProductModal: function(id) {
    const prod = DB.getProducts().find(p => p.id === id);
    if (!prod) return;
    const isEn = (typeof I18N !== 'undefined' && I18N.currentLang === 'en');
    const title = document.getElementById('modal-prod-title');
    if (title) title.textContent = isEn ? 'Edit Product' : 'تعديل منتج';

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = (val !== undefined && val !== null) ? val : '';
    };

    setVal('prod-id', prod.id);
    setVal('prod-code', prod.code || '');
    setVal('prod-name', prod.name || '');
    setVal('prod-category', prod.category || (isEn ? 'General' : 'عام'));
    setVal('prod-unit', prod.unit || (isEn ? 'Carton' : 'كرتون'));
    setVal('prod-price', prod.price || 0);
    setVal('prod-vat', prod.vatRate !== undefined ? prod.vatRate : 15);

    const modal = document.getElementById('modal-product');
    if (modal) modal.classList.add('show');
  },

  closeProductModal: function() {
    const modal = document.getElementById('modal-product');
    if (modal) modal.classList.remove('show');
  },

  saveProductForm: function() {
    const nameInput = document.getElementById('prod-name');
    const name = nameInput ? nameInput.value.trim() : '';
    if (!name) {
      alert((typeof I18N !== 'undefined' && I18N.currentLang === 'en') ? 'Please enter product name/description.' : 'يرجى كتابة اسم المنتج أو البيان.');
      return;
    }

    const rawVat = document.getElementById('prod-vat')?.value;
    const vatRate = (rawVat !== undefined && rawVat !== '' && !isNaN(parseFloat(rawVat))) ? parseFloat(rawVat) : 15;

    const prod = {
      id: document.getElementById('prod-id')?.value || null,
      code: document.getElementById('prod-code')?.value.trim() || '',
      name: name,
      category: document.getElementById('prod-category')?.value.trim() || 'General',
      unit: document.getElementById('prod-unit')?.value.trim() || 'كرتون',
      price: parseFloat(document.getElementById('prod-price')?.value) || 0,
      vatRate: vatRate
    };

    DB.saveProduct(prod);
    this.closeProductModal();
    this.renderProductsList();
    this.renderInvoiceItemsRows(); // Refresh dropdown in active invoice
  },

  deleteProduct: function(id) {
    const isEn = (typeof I18N !== 'undefined' && I18N.currentLang === 'en');
    const confirmMsg = isEn ? 'Are you sure you want to delete this product?' : 'هل أنت متأكد من حذف هذا المنتج؟';
    if (confirm(confirmMsg)) {
      DB.deleteProduct(id);
      this.renderProductsList();
      this.renderInvoiceItemsRows();
    }
  },

  // -------------------------------------------------------------------------
  // PRODUCT CATALOG PICKER MODAL
  // -------------------------------------------------------------------------
  openProductPickerModal: function(targetItemIndex = null) {
    const modal = document.getElementById('modal-product-picker');
    if (!modal) return;
    this.pickerTargetIndex = targetItemIndex;
    const searchInput = document.getElementById('catalog-search-input');
    if (searchInput) searchInput.value = '';
    this.filterProductPicker('');
    modal.classList.add('show');
  },

  closeProductPickerModal: function() {
    const modal = document.getElementById('modal-product-picker');
    if (modal) modal.classList.remove('show');
  },

  filterProductPicker: function(query = '') {
    const tbody = document.getElementById('catalog-picker-body');
    if (!tbody) return;
    const products = DB.getProducts();
    const isEn = (typeof I18N !== 'undefined' && I18N.currentLang === 'en');
    const q = (query || '').toLowerCase().trim();

    const filtered = q ? products.filter(p => 
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.code && p.code.toLowerCase().includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q))
    ) : products;

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:18px; color:#888;">${isEn ? 'No products match your search.' : 'لا توجد منتجات مطابقة للبحث.'}</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(p => `
      <tr class="app-list-row picker-list-row" onclick="App.selectProductFromPicker('${p.id}')">
        <td class="col-code" style="font-weight:700; color:#0284c7;">
          <div class="mobile-card-header">
            <span class="mobile-sku-badge">#${p.code || '-'}</span>
            <span class="mobile-prod-title">${p.name}</span>
          </div>
          <span class="desktop-cell-text">${p.code || '-'}</span>
        </td>
        <td class="col-desc desktop-only-cell" style="font-weight:600;">${p.name}</td>
        <td class="col-unit">
          <div class="mobile-field-row">
            <span class="mobile-field-label">${isEn ? 'Unit' : 'الوحدة'}:</span>
            <span>${p.unit || (isEn ? 'Carton' : 'كرتون')}</span>
          </div>
          <span class="desktop-cell-text">${p.unit || (isEn ? 'Carton' : 'كرتون')}</span>
        </td>
        <td class="col-price">
          <div class="mobile-field-row">
            <span class="mobile-field-label">${isEn ? 'Price' : 'السعر'}:</span>
            <span style="font-weight:800; color:#0284c7;">${(p.price || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} SAR</span>
          </div>
          <span class="desktop-cell-text" style="font-weight:700; text-align:center;">${(p.price || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} SAR</span>
        </td>
        <td class="col-actions">
          <button type="button" class="btn btn-sm btn-primary action-btn-main" style="width: 100%; padding: 8px 14px;" onclick="event.stopPropagation(); App.selectProductFromPicker('${p.id}')">
            ➕ ${isEn ? 'Select & Add' : 'اختيار وإضافة'}
          </button>
        </td>
      </tr>
    `).join('');
  },

  selectProductFromPicker: function(productId) {
    const prod = DB.getProducts().find(p => p.id === productId);
    if (!prod) return;

    const pVat = (prod.vatRate !== undefined && prod.vatRate !== null && !isNaN(parseFloat(prod.vatRate)))
      ? parseFloat(prod.vatRate)
      : (DB.getSettings().defaultVatRate !== undefined ? DB.getSettings().defaultVatRate : 15);
    const pPrice = parseFloat(prod.price) || 0;

    const targetIdx = this.pickerTargetIndex;
    if (targetIdx !== null && targetIdx !== undefined && this.currentInvoice.items[targetIdx]) {
      this.currentInvoice.items[targetIdx].code = prod.code || '';
      this.currentInvoice.items[targetIdx].description = prod.name;
      this.currentInvoice.items[targetIdx].unit = prod.unit || 'كرتون';
      this.currentInvoice.items[targetIdx].price = pPrice;
      this.currentInvoice.items[targetIdx].vatRate = pVat;
    } else {
      // If the first row is empty, populate it; otherwise push new row
      const firstItem = this.currentInvoice.items[0];
      if (this.currentInvoice.items.length === 1 && (!firstItem.description || firstItem.price === 0)) {
        firstItem.code = prod.code || '';
        firstItem.description = prod.name;
        firstItem.unit = prod.unit || 'كرتون';
        firstItem.price = pPrice;
        firstItem.quantity = 1;
        firstItem.vatRate = pVat;
      } else {
        const net = pPrice * 1;
        const vatAmt = net * (pVat / 100);
        this.currentInvoice.items.push({
          sr: this.currentInvoice.items.length + 1,
          code: prod.code || '',
          description: prod.name,
          unit: prod.unit || 'كرتون',
          quantity: 1,
          price: pPrice,
          net: net,
          vatRate: pVat,
          vatAmount: vatAmt,
          totalWithVat: net + vatAmt
        });
      }
    }

    this.closeProductPickerModal();
    this.renderInvoiceItemsRows();
    this.recalculateInvoice();

    // Focus the quantity input of the targeted row
    setTimeout(() => {
      const qtyInputs = document.querySelectorAll('.item-qty-input');
      const targetFocusIdx = (targetIdx !== null && targetIdx !== undefined) ? targetIdx : (this.currentInvoice.items.length - 1);
      if (qtyInputs[targetFocusIdx]) {
        qtyInputs[targetFocusIdx].focus();
        qtyInputs[targetFocusIdx].select();
      }
    }, 50);
  },

  // -------------------------------------------------------------------------
  // CUSTOMERS DIRECTORY
  // -------------------------------------------------------------------------
  renderCustomersList: function() {
    const tbody = document.getElementById('customers-table-body');
    if (!tbody) return;
    const customers = DB.getCustomers();
    const isEn = (typeof I18N !== 'undefined' && I18N.currentLang === 'en');

    if (customers.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 20px; color: #888;">${isEn ? 'No customers registered yet.' : 'لا يوجد عملاء مسجلين.'}</td></tr>`;
      return;
    }

    tbody.innerHTML = customers.map(c => `
      <tr class="app-list-row customer-list-row" onclick="App.openEditCustomerModal('${c.id}')">
        <td class="col-custname" style="font-weight: bold;">
          <div class="mobile-card-header">
            <span class="mobile-cust-title">🏢 ${c.name}</span>
            <span class="mobile-dest-badge">${c.destination || (isEn ? 'Local' : 'محلي')}</span>
          </div>
          <span class="desktop-cell-text">${c.name}</span>
        </td>
        <td class="col-tax">
          <div class="mobile-field-row">
            <span class="mobile-field-label">${isEn ? 'VAT No' : 'الرقم الضريبي'}:</span>
            <span>${c.taxNumber || 'لايوجد'}</span>
          </div>
          <span class="desktop-cell-text">${c.taxNumber || 'لايوجد'}</span>
        </td>
        <td class="col-cr">
          <div class="mobile-field-row">
            <span class="mobile-field-label">${isEn ? 'CR No' : 'السجل التجاري'}:</span>
            <span>${c.crNumber || '-'}</span>
          </div>
          <span class="desktop-cell-text">${c.crNumber || '-'}</span>
        </td>
        <td class="col-phone">
          <div class="mobile-field-row">
            <span class="mobile-field-label">${isEn ? 'Phone' : 'الجوال'}:</span>
            <span>${c.phone || '-'}</span>
          </div>
          <span class="desktop-cell-text">${c.phone || '-'}</span>
        </td>
        <td class="col-address">
          <div class="mobile-field-row">
            <span class="mobile-field-label">${isEn ? 'Address' : 'العنوان'}:</span>
            <span>${c.address || '-'}</span>
          </div>
          <span class="desktop-cell-text">${c.address || '-'}</span>
        </td>
        <td class="col-actions">
          <div class="card-actions-wrapper" onclick="event.stopPropagation()">
            <button type="button" class="btn btn-sm btn-primary action-btn-main" onclick="event.stopPropagation(); App.openEditCustomerModal('${c.id}')">
              ✏️ ${isEn ? 'Edit Customer' : 'تعديل العميل'}
            </button>
            <button type="button" class="btn btn-sm btn-danger action-btn-sec" onclick="event.stopPropagation(); App.deleteCustomer('${c.id}')">
              🗑️ ${isEn ? 'Delete' : 'حذف'}
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  },

  openAddCustomerModal: function() {
    const isEn = (typeof I18N !== 'undefined' && I18N.currentLang === 'en');
    const title = document.getElementById('modal-cust-title');
    if (title) title.textContent = isEn ? 'Add New Customer' : 'إضافة عميل جديد';

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val;
    };

    setVal('cust-id', '');
    setVal('cust-name', '');
    setVal('cust-tax', 'لايوجد');
    setVal('cust-cr', '');
    setVal('cust-phone', '');
    setVal('cust-address', '');
    setVal('cust-dest', isEn ? 'Local' : 'محلي');

    const modal = document.getElementById('modal-customer');
    if (modal) modal.classList.add('show');
  },

  openEditCustomerModal: function(id) {
    const cust = DB.getCustomers().find(c => c.id === id);
    if (!cust) return;
    const isEn = (typeof I18N !== 'undefined' && I18N.currentLang === 'en');
    const title = document.getElementById('modal-cust-title');
    if (title) title.textContent = isEn ? 'Edit Customer' : 'تعديل بيانات عميل';

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = (val !== undefined && val !== null) ? val : '';
    };

    setVal('cust-id', cust.id);
    setVal('cust-name', cust.name || '');
    setVal('cust-tax', cust.taxNumber || 'لايوجد');
    setVal('cust-cr', cust.crNumber || '');
    setVal('cust-phone', cust.phone || '');
    setVal('cust-address', cust.address || '');
    setVal('cust-dest', cust.destination || (isEn ? 'Local' : 'محلي'));

    const modal = document.getElementById('modal-customer');
    if (modal) modal.classList.add('show');
  },

  closeCustomerModal: function() {
    const modal = document.getElementById('modal-customer');
    if (modal) modal.classList.remove('show');
  },

  saveCustomerForm: function() {
    const nameInput = document.getElementById('cust-name');
    const name = nameInput ? nameInput.value.trim() : '';
    if (!name) {
      alert((typeof I18N !== 'undefined' && I18N.currentLang === 'en') ? 'Please enter customer name.' : 'يرجى كتابة اسم العميل.');
      return;
    }

    const cust = {
      id: document.getElementById('cust-id')?.value || null,
      name: name,
      taxNumber: document.getElementById('cust-tax')?.value.trim() || 'لايوجد',
      crNumber: document.getElementById('cust-cr')?.value.trim() || '',
      phone: document.getElementById('cust-phone')?.value.trim() || '',
      address: document.getElementById('cust-address')?.value.trim() || '',
      destination: document.getElementById('cust-dest')?.value.trim() || 'محلي'
    };

    const saved = DB.saveCustomer(cust);
    this.closeCustomerModal();
    this.renderCustomersList();
    this.populateCustomerSelect(saved.id);
    this.onCustomerSelectChange(saved.id);
  },

  deleteCustomer: function(id) {
    const isEn = (typeof I18N !== 'undefined' && I18N.currentLang === 'en');
    const confirmMsg = isEn ? 'Are you sure you want to delete this customer?' : 'هل أنت متأكد من حذف هذا العميل؟';
    if (confirm(confirmMsg)) {
      DB.deleteCustomer(id);
      this.renderCustomersList();
      this.populateCustomerSelect();
    }
  },

  // -------------------------------------------------------------------------
  // -------------------------------------------------------------------------
  // COMPANY SETTINGS
  // -------------------------------------------------------------------------
  loadSettingsForm: function() {
    const s = DB.getSettings();
    const setFld = (id1, id2, val) => {
      const el = document.getElementById(id1) || document.getElementById(id2);
      if (el) el.value = (val !== undefined && val !== null) ? val : '';
    };
    setFld('setting-comp-ar', 'setting-name-ar', s.companyNameAr);
    setFld('setting-comp-en', 'setting-name-en', s.companyNameEn);
    setFld('setting-activity-ar', 'setting-activity-ar', s.activityAr || 'خردوات والقرطاسية وأدوات التجميل بالجملة');
    setFld('setting-activity-en', 'setting-activity-en', s.activityEn || 'Sundries, Stationary & Cosmetics Wholesale');
    setFld('setting-tax-number', 'setting-tax', s.taxNumber);
    setFld('setting-cr-number', 'setting-cr', s.crNumber);
    setFld('setting-branch', 'setting-branch', s.branch);
    setFld('setting-prepared-by', 'setting-prepared-by', s.preparedBy || s.salesRep || 'المدير');
    setFld('setting-phone', 'setting-phone', s.phonesEn || s.phone);
    setFld('setting-address', 'setting-address', s.addressEn || s.address);
    setFld('setting-address-ar', 'setting-address-ar', s.addressAr || s.address);
    setFld('setting-building-en', 'setting-building-en', s.buildingEn || '');
    setFld('setting-building-ar', 'setting-building-ar', s.buildingAr || '');
    setFld('setting-postal-en', 'setting-postal-en', s.postalEn || '');
    setFld('setting-postal-ar', 'setting-postal-ar', s.postalAr || '');
    setFld('setting-email', 'setting-email', s.email || 'wholesalezain@gmail.com');
    setFld('setting-bank1-name', 'setting-bank1-name', s.bank1Name || 'SNB');
    setFld('setting-bank1-acc', 'setting-bank1-acc', s.bank1Account || s.companyNameAr);
    setFld('setting-bank1-iban', 'setting-bank1-iban', s.bank1Iban || '');
    setFld('setting-bank2-name', 'setting-bank2-name', s.bank2Name || 'Al Rajhi Bank');
    setFld('setting-bank2-acc', 'setting-bank2-acc', s.bank2Account || s.companyNameAr);
    setFld('setting-bank2-iban', 'setting-bank2-iban', s.bank2Iban || '');
    setFld('setting-template', 'setting-template', s.activeTemplate || 'zain');
    setFld('setting-cost-center', 'setting-cost-center', s.costCenter);
    setFld('setting-warehouse', 'setting-warehouse', s.warehouse);
    setFld('setting-sales-rep', 'setting-sales-rep', s.salesRep);
    setFld('setting-currency', 'setting-currency', s.currency);
    setFld('setting-vat', 'setting-vat', s.defaultVatRate || 15);
    setFld('setting-next-quotation', 'setting-next-quote', s.nextQuotationNumber || 64);
    setFld('setting-next-invoice', 'setting-next-inv', s.nextInvoiceNumber || 135745);

    const qrCheck = document.getElementById('setting-show-zatca-qr') || document.getElementById('setting-show-qr');
    if (qrCheck) qrCheck.checked = s.showZatcaQr !== false;

    const qrTypeEl = document.getElementById('setting-qr-type');
    if (qrTypeEl) qrTypeEl.value = s.qrType || 'zatca';

    const websiteEl = document.getElementById('setting-website-url');
    if (websiteEl) websiteEl.value = s.websiteUrl || 'https://www.mayarjeddah.com';

    this.toggleQrSettingsView();

    const logoUrlEl = document.getElementById('setting-logo-url');
    if (logoUrlEl) logoUrlEl.value = s.logoUrl || '';

    const preview = document.getElementById('setting-logo-preview');
    if (preview) {
      if (s.logoUrl === 'none') {
        preview.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="60" viewBox="0 0 120 60"><rect width="100%" height="100%" fill="%23f1f5f9"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%2394a3b8" font-size="12" font-family="sans-serif">No Logo</text></svg>';
      } else {
        preview.src = s.logoUrl || 'assets/zain_logo.svg';
      }
    }
  },

  resetLogoToDefault: function() {
    const preview = document.getElementById('setting-logo-preview');
    if (preview) preview.src = 'assets/zain_logo.svg';
    const urlInput = document.getElementById('setting-logo-url');
    if (urlInput) urlInput.value = '';
    const fileInput = document.getElementById('setting-logo-file');
    if (fileInput) fileInput.value = '';
  },

  removeLogo: function() {
    const preview = document.getElementById('setting-logo-preview');
    if (preview) preview.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="60" viewBox="0 0 120 60"><rect width="100%" height="100%" fill="%23f1f5f9"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%2394a3b8" font-size="12" font-family="sans-serif">No Logo</text></svg>';
    const urlInput = document.getElementById('setting-logo-url');
    if (urlInput) urlInput.value = 'none';
    const fileInput = document.getElementById('setting-logo-file');
    if (fileInput) fileInput.value = '';
  },

  toggleQrSettingsView: function() {
    const qrType = document.getElementById('setting-qr-type')?.value || 'website';
    const webGrp = document.getElementById('group-website-url');
    if (webGrp) {
      if (qrType === 'website') {
        webGrp.style.opacity = '1';
        webGrp.style.pointerEvents = 'auto';
      } else {
        webGrp.style.opacity = '0.5';
      }
    }
  },

  saveSettingsForm: function() {
    const getFld = (id1, id2, fallback = '') => {
      const el = document.getElementById(id1) || document.getElementById(id2);
      return el ? el.value.trim() : fallback;
    };
    const prev = DB.getSettings();
    const logoInputVal = document.getElementById('setting-logo-url')?.value;
    const s = {
      ...prev,
      companyNameAr: getFld('setting-comp-ar', 'setting-name-ar', prev.companyNameAr),
      companyNameEn: getFld('setting-comp-en', 'setting-name-en', prev.companyNameEn),
      activityAr: getFld('setting-activity-ar', 'setting-activity-ar', prev.activityAr),
      activityEn: getFld('setting-activity-en', 'setting-activity-en', prev.activityEn),
      taxNumber: getFld('setting-tax-number', 'setting-tax', prev.taxNumber),
      crNumber: getFld('setting-cr-number', 'setting-cr', prev.crNumber),
      branch: getFld('setting-branch', 'setting-branch', prev.branch),
      preparedBy: getFld('setting-prepared-by', 'setting-prepared-by', prev.preparedBy || 'المدير'),
      phone: getFld('setting-phone', 'setting-phone', prev.phone),
      phonesEn: getFld('setting-phone', 'setting-phone', prev.phonesEn || prev.phone),
      phonesAr: getFld('setting-phone', 'setting-phone', prev.phonesAr || prev.phone),
      address: getFld('setting-address', 'setting-address', prev.address),
      addressEn: getFld('setting-address', 'setting-address', prev.addressEn || prev.address),
      addressAr: getFld('setting-address-ar', 'setting-address-ar', prev.addressAr || prev.address),
      buildingEn: getFld('setting-building-en', 'setting-building-en', prev.buildingEn),
      buildingAr: getFld('setting-building-ar', 'setting-building-ar', prev.buildingAr),
      postalEn: getFld('setting-postal-en', 'setting-postal-en', prev.postalEn),
      postalAr: getFld('setting-postal-ar', 'setting-postal-ar', prev.postalAr),
      email: getFld('setting-email', 'setting-email', prev.email || 'wholesalezain@gmail.com'),
      bank1Name: getFld('setting-bank1-name', 'setting-bank1-name', prev.bank1Name || 'SNB'),
      bank1Account: getFld('setting-bank1-acc', 'setting-bank1-acc', prev.bank1Account),
      bank1Iban: getFld('setting-bank1-iban', 'setting-bank1-iban', prev.bank1Iban),
      bank2Name: getFld('setting-bank2-name', 'setting-bank2-name', prev.bank2Name || 'Al Rajhi Bank'),
      bank2Account: getFld('setting-bank2-acc', 'setting-bank2-acc', prev.bank2Account),
      bank2Iban: getFld('setting-bank2-iban', 'setting-bank2-iban', prev.bank2Iban),
      activeTemplate: getFld('setting-template', 'setting-template', prev.activeTemplate || 'zain'),
      costCenter: getFld('setting-cost-center', 'setting-cost-center', prev.costCenter),
      warehouse: getFld('setting-warehouse', 'setting-warehouse', prev.warehouse),
      salesRep: getFld('setting-sales-rep', 'setting-sales-rep', prev.salesRep),
      currency: getFld('setting-currency', 'setting-currency', prev.currency || 'SR ريال'),
      defaultVatRate: (() => {
        const v = getFld('setting-vat', 'setting-vat', '15');
        return (v !== undefined && v !== '' && !isNaN(parseFloat(v))) ? parseFloat(v) : 15;
      })(),
      nextQuotationNumber: parseInt(getFld('setting-next-quotation', 'setting-next-quote', '1')) || 1,
      nextInvoiceNumber: parseInt(getFld('setting-next-invoice', 'setting-next-inv', '1')) || 1,
      showZatcaQr: (document.getElementById('setting-show-zatca-qr') || document.getElementById('setting-show-qr'))?.checked !== false,
      qrType: document.getElementById('setting-qr-type')?.value || 'zatca',
      websiteUrl: (document.getElementById('setting-website-url')?.value || 'https://www.mayarjeddah.com').trim(),
      logoUrl: (logoInputVal !== undefined && logoInputVal !== '') ? logoInputVal : ''
    };

    DB.saveSettings(s);
    this.currentPrintTemplate = s.activeTemplate;
    const msg = (typeof I18N !== 'undefined') ? I18N.t('msgSettingsSaved') : 'Settings saved successfully!';
    alert(msg);
  },

  // -------------------------------------------------------------------------
  // BACKUP & RESTORE
  // -------------------------------------------------------------------------
  exportBackup: function() {
    this.downloadBackup();
  },

  downloadBackup: function() {
    const dataStr = DB.exportBackup();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Mayar_Invoices_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  importBackup: function(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const ok = DB.importBackup(e.target.result);
        if (ok) {
          alert('Backup restored successfully!');
          window.location.reload();
        } else {
          alert('Failed to restore backup. Invalid format.');
        }
      } catch (err) {
        alert('Error restoring backup: ' + err.message);
      }
    };
    reader.readAsText(file);
  },

  resetDemoData: function() {
    const isEn = (typeof I18N !== 'undefined' && I18N.currentLang === 'en');
    const confirmMsg = isEn 
      ? 'Are you sure you want to reset all data to initial demo state?'
      : 'هل أنت متأكد من إعادة تعيين كافة البيانات إلى الحالة الافتراضية؟';
    if (confirm(confirmMsg)) {
      DB.resetToDefaults();
      alert(isEn ? 'Data reset successfully!' : 'تمت استعادة البيانات الافتراضية بنجاح!');
      window.location.reload();
    }
  },

  hardRefresh: async function() {
    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (let reg of registrations) {
          await reg.unregister();
        }
      }
      if ('caches' in window) {
        const keys = await caches.keys();
        for (let k of keys) {
          await caches.delete(k);
        }
      }
    } catch (e) {
      console.warn('Cache purge error:', e);
    }
    window.location.href = window.location.pathname + '?v=' + Date.now();
  }
};
