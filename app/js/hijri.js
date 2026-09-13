/**
 * Hijri Calendar Converter
 * Converts Gregorian date to Hijri format YYYY-MM-DD
 */
const HijriConverter = {
  toHijri: function(gregorianDateStr, offsetDays = 0) {
    if (!gregorianDateStr) return '';
    try {
      const date = new Date(gregorianDateStr);
      if (isNaN(date.getTime())) return '';
      if (offsetDays !== 0) {
        date.setDate(date.getDate() + offsetDays);
      }

      // Modern Intl API for Islamic Umm al-Qura calendar
      const formatter = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });

      const parts = formatter.formatToParts(date);
      let year = '', month = '', day = '';
      for (const p of parts) {
        if (p.type === 'year') year = p.value;
        if (p.type === 'month') month = p.value.padStart(2, '0');
        if (p.type === 'day') day = p.value.padStart(2, '0');
      }

      // Clean non-numeric characters (like AH or ERA)
      year = year.replace(/\D/g, '');
      month = month.replace(/\D/g, '');
      day = day.replace(/\D/g, '');

      if (year && month && day) {
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
    } catch (e) {
      console.error('Hijri conversion error:', e);
    }
    return '';
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = HijriConverter;
}
