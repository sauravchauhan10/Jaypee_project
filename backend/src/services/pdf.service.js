// src/services/pdf.service.js
const PDFDocument    = require('pdfkit');
const { generateQRCode } = require('./qr.service');

// ─── Color palette ─────────────────────────────────────────────────────────────
const C = {
  primary:      '#1d4ed8', // blue-700
  primaryDark:  '#1e3a8a', // blue-900
  primaryLight: '#eff6ff', // blue-50
  accent:       '#16a34a', // green-600
  gray900:      '#111827',
  gray700:      '#374151',
  gray500:      '#6b7280',
  gray300:      '#d1d5db',
  gray100:      '#f3f4f6',
  white:        '#ffffff',
  black:        '#000000',
};

// ─── Helpers ───────────────────────────────────────────────────────────────────
const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

const shortId = (id) => String(id).slice(-8).toUpperCase();

/**
 * Draw a horizontal rule
 */
const hr = (doc, y, { color = C.gray300, width = 0.5 } = {}) => {
  doc.save()
     .strokeColor(color)
     .lineWidth(width)
     .moveTo(40, y).lineTo(555, y)
     .stroke()
     .restore();
};

/**
 * Draw a filled rectangle
 */
const fillRect = (doc, x, y, w, h, color) => {
  doc.save().fillColor(color).rect(x, y, w, h).fill().restore();
};

/**
 * Draw a label + value pair in two columns
 */
const labelValue = (doc, x, y, label, value, { labelColor = C.gray500, valueColor = C.gray900 } = {}) => {
  doc.font('Helvetica-Bold').fontSize(8).fillColor(labelColor).text(label, x, y);
  doc.font('Helvetica').fontSize(9).fillColor(valueColor).text(value || '—', x, y + 11, { width: 220 });
};

/**
 * Draw a medicine table row
 */
const tableRow = (doc, y, cells, isHeader = false) => {
  const cols   = [40, 185, 270, 380, 470];
  const widths = [140, 80,  105, 85,  85];
  const rowH   = isHeader ? 22 : 20;

  // Row background
  fillRect(doc, 40, y, 515, rowH, isHeader ? C.primaryDark : (cells._even ? C.gray100 : C.white));

  // Cell borders
  doc.save().strokeColor(C.gray300).lineWidth(0.3);
  cols.forEach((x, i) => {
    doc.rect(x, y, widths[i], rowH).stroke();
  });
  doc.restore();

  // Cell text
  cells.forEach((text, i) => {
    doc
      .font(isHeader ? 'Helvetica-Bold' : 'Helvetica')
      .fontSize(isHeader ? 8 : 8.5)
      .fillColor(isHeader ? C.white : C.gray700)
      .text(String(text ?? ''), cols[i] + 5, y + (isHeader ? 7 : 6), {
        width: widths[i] - 10,
        ellipsis: true,
      });
  });
};

// ─── Main PDF generation function ──────────────────────────────────────────────
/**
 * Generate a professional prescription PDF.
 *
 * @param {Object} prescription - Mongoose document (populated doctorId & patientId)
 * @returns {Promise<Buffer>}   - Complete PDF as Buffer
 */
const generatePrescriptionPDF = (prescription) =>
  new Promise(async (resolve, reject) => {
    try {
      // ── Pre-generate QR code ──────────────────────────────────────────────
      const qrBuffer = await generateQRCode(
        prescription._id,
        process.env.CLIENT_URL || 'http://localhost:5173'
      );

      // ── Convenience aliases ───────────────────────────────────────────────
      const doctor  = prescription.doctorId  || {};
      const patient = prescription.patientId || {};
      const rxId    = `RX-${shortId(prescription._id)}`;
      const rxDate  = formatDate(prescription.date);

      // ── Create doc ────────────────────────────────────────────────────────
      const doc = new PDFDocument({
        size:    'A4',
        margins: { top: 0, left: 0, right: 0, bottom: 0 },
        info: {
          Title:   `Prescription ${rxId}`,
          Author:  `Dr. ${doctor.name || 'Unknown'}`,
          Subject: prescription.diagnosis,
          Creator: 'CareBridge — Smart Digital Prescription Platform',
        },
      });

      // Collect chunks into buffer
      const chunks = [];
      doc.on('data',  (c) => chunks.push(c));
      doc.on('end',   () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // ① HEADER BANNER
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      fillRect(doc, 0, 0, 595, 80, C.primaryDark);

      // Logo circle
      doc.save()
         .circle(52, 40, 22)
         .fillColor(C.primary)
         .fill()
         .restore();

      // Rx symbol
      doc.font('Helvetica-Bold')
         .fontSize(22)
         .fillColor(C.white)
         .text('Rx', 41, 28);

      // Platform name
      doc.font('Helvetica-Bold')
         .fontSize(18)
         .fillColor(C.white)
         .text('CareBridge', 85, 22);

      doc.font('Helvetica')
         .fontSize(9)
         .fillColor('#93c5fd') // blue-300
         .text('Smart Digital Prescription Platform', 85, 44);

      // Rx ID badge (top right)
      fillRect(doc, 390, 18, 170, 20, C.primary);
      doc.font('Helvetica-Bold').fontSize(9).fillColor(C.white)
         .text(`Prescription ID: ${rxId}`, 395, 23, { width: 160 });

      // Date (top right)
      doc.font('Helvetica').fontSize(8.5).fillColor('#bfdbfe')
         .text(`Date: ${rxDate}`, 395, 43, { width: 160 });

      // DIGITAL label
      doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#93c5fd')
         .text('✓  DIGITAL PRESCRIPTION', 395, 58, { width: 160 });

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // ② DOCTOR & PATIENT INFO
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      let y = 90;

      // Section background strips
      fillRect(doc, 40,  y, 250, 14, C.primaryDark);
      fillRect(doc, 305, y, 250, 14, C.primaryDark);

      doc.font('Helvetica-Bold').fontSize(8).fillColor(C.white)
         .text('DOCTOR INFORMATION', 45, y + 3);
      doc.font('Helvetica-Bold').fontSize(8).fillColor(C.white)
         .text('PATIENT INFORMATION', 310, y + 3);

      y += 18;
      fillRect(doc, 40,  y, 250, 58, '#eff6ff');
      fillRect(doc, 305, y, 250, 58, '#f0fdf4');

      // Doctor fields
      labelValue(doc, 48, y + 4,  'DOCTOR NAME',  `Dr. ${doctor.name || '—'}`);
      labelValue(doc, 48, y + 28, 'EMAIL ADDRESS', doctor.email || '—');

      // Patient fields
      labelValue(doc, 313, y + 4,  'PATIENT NAME', patient.name || '—');
      const ageGender = [patient.age && `${patient.age} yrs`, patient.gender && `(${patient.gender})`]
        .filter(Boolean).join(' ');
      labelValue(doc, 313, y + 28, 'AGE / GENDER', ageGender || '—');

      // Subtle border
      doc.save().strokeColor(C.gray300).lineWidth(0.5)
         .rect(40, 104, 250, 58).stroke()
         .rect(305, 104, 250, 58).stroke()
         .restore();

      y += 68;

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // ③ DIAGNOSIS
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      fillRect(doc, 40, y, 515, 14, C.primaryDark);
      doc.font('Helvetica-Bold').fontSize(8).fillColor(C.white)
         .text('DIAGNOSIS / CONDITION', 45, y + 3);
      y += 18;

      const diagHeight = Math.max(32, Math.ceil(prescription.diagnosis.length / 85) * 13 + 16);
      fillRect(doc, 40, y, 515, diagHeight, '#fefce8'); // amber-50
      doc.save().strokeColor('#fde68a').lineWidth(0.5).rect(40, y, 515, diagHeight).stroke().restore();

      // Diagnosis icon dot
      doc.save().circle(52, y + 10, 4).fillColor('#f59e0b').fill().restore();

      doc.font('Helvetica').fontSize(10).fillColor(C.gray900)
         .text(prescription.diagnosis, 62, y + 5, { width: 488, lineGap: 3 });

      y += diagHeight + 10;

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // ④ MEDICINES TABLE
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      fillRect(doc, 40, y, 515, 14, C.primaryDark);
      doc.font('Helvetica-Bold').fontSize(8).fillColor(C.white)
         .text('PRESCRIBED MEDICINES', 45, y + 3);
      y += 14;

      // Header row
      tableRow(doc, y, ['Medicine Name', 'Dosage', 'Frequency', 'Duration', 'Status'], true);
      y += 22;

      (prescription.medicines || []).forEach((med, i) => {
        const cells = [med.name, med.dosage, med.frequency, med.duration, prescription.status];
        cells._even = i % 2 === 0;
        tableRow(doc, y, cells, false);
        y += 20;
      });

      y += 8;

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // ⑤ DOCTOR'S NOTES
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      if (prescription.notes?.trim()) {
        fillRect(doc, 40, y, 515, 14, C.gray700);
        doc.font('Helvetica-Bold').fontSize(8).fillColor(C.white)
           .text("DOCTOR'S NOTES & INSTRUCTIONS", 45, y + 3);
        y += 14;

        const noteLines = Math.ceil(prescription.notes.length / 90);
        const noteH     = Math.max(30, noteLines * 13 + 14);
        fillRect(doc, 40, y, 515, noteH, '#f9fafb');
        doc.save().strokeColor(C.gray300).lineWidth(0.5).rect(40, y, 515, noteH).stroke().restore();
        // Left accent bar
        fillRect(doc, 40, y, 4, noteH, C.accent);

        doc.font('Helvetica').fontSize(9).fillColor(C.gray700)
           .text(prescription.notes, 52, y + 8, { width: 498, lineGap: 3 });
        y += noteH + 10;
      }

      y += 6;
      hr(doc, y, { color: C.gray300 });
      y += 12;

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // ⑥ QR CODE  +  DIGITAL SIGNATURE
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      // QR box
      fillRect(doc, 40, y, 140, 140, C.primaryLight);
      doc.save().strokeColor(C.primary).lineWidth(1).rect(40, y, 140, 140).stroke().restore();

      doc.image(qrBuffer, 55, y + 8, { width: 110, height: 110 });

      doc.font('Helvetica-Bold').fontSize(7.5).fillColor(C.primary)
         .text('SCAN TO VERIFY', 40, y + 122, { width: 140, align: 'center' });

      // Signature box
      const sigX = 210;
      fillRect(doc, sigX, y, 345, 140, C.gray100);
      doc.save().strokeColor(C.gray300).lineWidth(0.5).rect(sigX, y, 345, 140).stroke().restore();

      doc.font('Helvetica-Bold').fontSize(9).fillColor(C.primaryDark)
         .text('DIGITAL SIGNATURE & AUTHORIZATION', sigX + 10, y + 10);

      // Signature line
      const lineY = y + 75;
      doc.save()
         .strokeColor(C.gray500).lineWidth(1)
         .moveTo(sigX + 20, lineY).lineTo(sigX + 200, lineY)
         .stroke()
         .restore();

      doc.font('Helvetica').fontSize(8).fillColor(C.gray500)
         .text("Doctor's Signature", sigX + 20, lineY + 4);

      // Doctor seal
      doc.save()
         .circle(sigX + 290, y + 60, 38)
         .strokeColor(C.primary)
         .lineWidth(1.5)
         .dash(4, { space: 3 })
         .stroke()
         .restore();

      doc.save()
         .circle(sigX + 290, y + 60, 30)
         .strokeColor(C.primaryLight)
         .lineWidth(0.5)
         .stroke()
         .restore();

      doc.font('Helvetica-Bold').fontSize(7).fillColor(C.primary)
         .text('OFFICIAL', sigX + 271, y + 52)
         .text('SEAL', sigX + 281, y + 62);

      // Doctor details below sig
      doc.font('Helvetica-Bold').fontSize(9).fillColor(C.gray900)
         .text(`Dr. ${doctor.name || 'Unknown'}`, sigX + 20, lineY + 20);

      doc.font('Helvetica').fontSize(8).fillColor(C.gray500)
         .text(`Registration No: MD-${shortId(doctor._id || '00000000')}`, sigX + 20, lineY + 33)
         .text(`Date: ${rxDate}`, sigX + 20, lineY + 45);

      // Validity note
      fillRect(doc, sigX + 10, y + 118, 325, 14, C.primary);
      doc.font('Helvetica').fontSize(7.5).fillColor(C.white)
         .text('✓  This is a digitally generated and verified prescription issued via CareBridge Platform', sigX + 15, y + 121, { width: 315 });

      y += 152;

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // ⑦ FOOTER
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      const pageH   = doc.page.height;
      const footerY = pageH - 38;

      fillRect(doc, 0, footerY, 595, 38, C.primaryDark);

      doc.font('Helvetica').fontSize(7.5).fillColor('#93c5fd')
         .text(
           `Generated by CareBridge  ·  Prescription ID: ${rxId}  ·  ${rxDate}  ·  This document is system-generated and valid without a wet signature.`,
           40, footerY + 8, { width: 515, align: 'center' }
         );

      doc.font('Helvetica').fontSize(7).fillColor('#60a5fa')
         .text(
           'For verification, scan the QR code or visit scriptmd.app/verify/' + prescription._id,
           40, footerY + 22, { width: 515, align: 'center' }
         );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });

module.exports = { generatePrescriptionPDF };
