/**
 * Tafqeet - Converts numbers to Arabic words for financial invoices
 * Example: 13512.50 -> فقط ثلاثةعشر ألف وخمسمائة واثنى عشر ريال و خمسون هللة لاغير
 */
const Tafqeet = {
  ones: ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة', 'عشرة', 'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'],
  tens: ['', 'عشرة', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'],
  hundreds: ['', 'مائة', 'مئتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة'],

  convertThreeDigits: function(num) {
    let result = [];
    let h = Math.floor(num / 100);
    let rem = num % 100;

    if (h > 0) {
      result.push(this.hundreds[h]);
    }

    if (rem > 0) {
      if (rem < 20) {
        result.push(this.ones[rem]);
      } else {
        let t = Math.floor(rem / 10);
        let o = rem % 10;
        if (o > 0) {
          result.push(this.ones[o] + ' و' + this.tens[t]);
        } else {
          result.push(this.tens[t]);
        }
      }
    }

    return result.join(' و');
  },

  convertInteger: function(num) {
    if (num === 0) return 'صفر';
    if (num < 0) return 'سالب ' + this.convertInteger(Math.abs(num));

    let parts = [];
    let billions = Math.floor(num / 1000000000);
    let millions = Math.floor((num % 1000000000) / 1000000);
    let thousands = Math.floor((num % 1000000) / 1000);
    let remainder = num % 1000;

    if (billions > 0) {
      if (billions === 1) parts.push('مليار');
      else if (billions === 2) parts.push('ملياران');
      else if (billions >= 3 && billions <= 10) parts.push(this.convertThreeDigits(billions) + ' مليارات');
      else parts.push(this.convertThreeDigits(billions) + ' مليار');
    }

    if (millions > 0) {
      if (millions === 1) parts.push('مليون');
      else if (millions === 2) parts.push('مليونان');
      else if (millions >= 3 && millions <= 10) parts.push(this.convertThreeDigits(millions) + ' ملايين');
      else parts.push(this.convertThreeDigits(millions) + ' مليون');
    }

    if (thousands > 0) {
      if (thousands === 1) parts.push('ألف');
      else if (thousands === 2) parts.push('ألفان');
      else if (thousands >= 3 && thousands <= 10) parts.push(this.convertThreeDigits(thousands) + ' آلاف');
      else parts.push(this.convertThreeDigits(thousands) + ' ألف');
    }

    if (remainder > 0) {
      parts.push(this.convertThreeDigits(remainder));
    }

    return parts.join(' و');
  },

  toArabicWords: function(amount, currencyName = 'ريال', subunitName = 'هللة') {
    if (amount === null || amount === undefined || isNaN(amount)) return '';
    let val = parseFloat(amount);
    let integerPart = Math.floor(val);
    let decimalPart = Math.round((val - integerPart) * 100);

    let text = 'فقط ' + this.convertInteger(integerPart) + ' ' + currencyName;

    if (decimalPart > 0) {
      text += ' و ' + this.convertInteger(decimalPart) + ' ' + subunitName;
    }

    text += ' لاغير';
    return text;
  },

  convert: function(amount, currencyName = 'ريال', subunitName = 'هللة') {
    return this.toArabicWords(amount, currencyName, subunitName);
  },

  toEnglishWords: function(amount, currencyName = 'SAR', subunitName = 'HALALAS') {
    if (amount === null || amount === undefined || isNaN(amount)) return '';
    const th = ['', 'THOUSAND', 'MILLION', 'BILLION'];
    const dg = ['ZERO', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE'];
    const tn = ['TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN', 'SEVENTEEN', 'EIGHTEEN', 'NINETEEN'];
    const tw = ['TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'];

    function toWords(s) {
      s = s.toString().replace(/[\, ]/g, '');
      if (parseFloat(s) != s) return '';
      let x = s.indexOf('.');
      if (x == -1) x = s.length;
      if (x > 15) return 'too big';
      let n = s.split('');
      let str = '';
      let sk = 0;
      for (let i = 0; i < x; i++) {
        if ((x - i) % 3 == 2) {
          if (n[i] == '1') {
            str += tn[Number(n[i + 1])] + ' ';
            i++;
            sk = 1;
          } else if (n[i] != 0) {
            str += tw[n[i] - 2] + ' ';
            sk = 1;
          }
        } else if (n[i] != 0) {
          str += dg[n[i]] + ' ';
          if ((x - i) % 3 == 0) str += 'HUNDRED ';
          sk = 1;
        }
        if ((x - i) % 3 == 1) {
          if (sk) str += th[(x - i - 1) / 3] + ' ';
          sk = 0;
        }
      }
      return str.trim();
    }

    let val = parseFloat(amount);
    let integerPart = Math.floor(val);
    let decimalPart = Math.round((val - integerPart) * 100);

    let res = currencyName + ' ' + toWords(integerPart);
    if (decimalPart > 0) {
      res += ' AND ' + toWords(decimalPart) + ' ' + subunitName;
    }
    res += ' ONLY';
    return res;
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Tafqeet;
}
