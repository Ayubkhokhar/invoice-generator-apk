/**
 * Saudi ZATCA (Fatoora) QR Code Generator
 * Encodes Tag-Length-Value (TLV) structure into Base64 according to ZATCA regulations
 */
const Zatca = {
  getTlv: function(tagNum, tagValue) {
    const encoder = new TextEncoder();
    const valueBytes = encoder.encode(tagValue || '');
    const tag = tagNum;
    const length = valueBytes.length;
    
    const buffer = new Uint8Array(2 + length);
    buffer[0] = tag;
    buffer[1] = length;
    buffer.set(valueBytes, 2);
    return buffer;
  },

  generateQrPayload: function(sellerName, vatNumber, timestamp, totalWithVat, vatTotal) {
    try {
      const tlv1 = this.getTlv(1, sellerName);
      const tlv2 = this.getTlv(2, vatNumber);
      const tlv3 = this.getTlv(3, timestamp);
      const tlv4 = this.getTlv(4, parseFloat(totalWithVat).toFixed(2));
      const tlv5 = this.getTlv(5, parseFloat(vatTotal).toFixed(2));

      const totalLength = tlv1.length + tlv2.length + tlv3.length + tlv4.length + tlv5.length;
      const combined = new Uint8Array(totalLength);
      
      let offset = 0;
      [tlv1, tlv2, tlv3, tlv4, tlv5].forEach(buf => {
        combined.set(buf, offset);
        offset += buf.length;
      });

      // Convert to Base64
      let binary = '';
      const len = combined.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(combined[i]);
      }
      return btoa(binary);
    } catch (e) {
      console.error('ZATCA TLV encoding error:', e);
      return '';
    }
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Zatca;
}
