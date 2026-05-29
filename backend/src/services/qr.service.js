// src/services/qr.service.js
const QRCode = require('qrcode');

/**
 * Generate a QR code as a PNG Buffer.
 * The QR encodes a verification URL for the prescription.
 *
 * @param {string} prescriptionId
 * @param {string} baseUrl - e.g. process.env.CLIENT_URL
 * @returns {Promise<Buffer>} PNG buffer
 */
const generateQRCode = async (prescriptionId, baseUrl = 'http://localhost:5173') => {
  const verifyUrl = `${baseUrl}/verify/${prescriptionId}`;

  const buffer = await QRCode.toBuffer(verifyUrl, {
    type:              'png',
    width:             150,
    margin:            1,
    color: {
      dark:  '#1e3a8a', // primary-900 — dark blue dots
      light: '#ffffff',
    },
    errorCorrectionLevel: 'M',
  });

  return buffer;
};

module.exports = { generateQRCode };
