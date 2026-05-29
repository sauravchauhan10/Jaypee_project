import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';

export interface PrescriptionPdfData {
  prescriptionId: string;
  qrToken: string;
  date: Date;
  diagnosis: string;
  symptoms?: string | null;
  notes?: string | null;
  doctor: {
    name: string;
    specialty?: string;
    clinicName?: string;
    licenseNumber?: string;
  };
  patient: {
    name: string;
    age?: number;
    gender?: string;
  };
  medicines: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string | null;
  }>;
}

/**
 * Generates a PDF buffer using PDFKit
 */
export const generatePrescriptionPdf = async (data: PrescriptionPdfData): Promise<Buffer> => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // --- 1. Hospital/Clinic Header ---
      doc.fontSize(24).font('Helvetica-Bold').text(data.doctor.clinicName || 'PrescribeFlow Clinic', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(12).font('Helvetica').text(`Dr. ${data.doctor.name} - ${data.doctor.specialty || 'General Practitioner'}`, { align: 'center' });
      if (data.doctor.licenseNumber) {
        doc.fontSize(10).fillColor('gray').text(`License No: ${data.doctor.licenseNumber}`, { align: 'center' });
      }
      doc.moveDown(1);
      
      // Divider
      doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#dddddd').stroke();
      doc.moveDown(1);

      // --- 2. Patient & Rx Details ---
      doc.fillColor('black');
      const startY = doc.y;
      
      // Left side: Patient
      doc.fontSize(12).font('Helvetica-Bold').text('Patient Information:');
      doc.font('Helvetica').fontSize(11)
         .text(`Name: ${data.patient.name}`)
         .text(`Gender/Age: ${data.patient.gender || 'N/A'} / ${data.patient.age || 'N/A'}`);
         
      // Right side: Rx Info
      doc.fontSize(12).font('Helvetica-Bold').text('Prescription Details:', 350, startY);
      doc.font('Helvetica').fontSize(11)
         .text(`Date: ${data.date.toLocaleDateString()}`, 350)
         .text(`Rx ID: ${data.prescriptionId.split('-')[0]?.toUpperCase() || 'N/A'}`, 350);

      doc.moveDown(2);
      
      // --- 3. Clinical Notes ---
      doc.font('Helvetica-Bold').fontSize(12).text('Diagnosis:', 50);
      doc.font('Helvetica').fontSize(11).text(data.diagnosis);
      doc.moveDown(1);

      if (data.symptoms) {
        doc.font('Helvetica-Bold').fontSize(12).text('Symptoms:');
        doc.font('Helvetica').fontSize(11).text(data.symptoms);
        doc.moveDown(1);
      }

      // --- 4. Medicines Table ---
      doc.font('Helvetica-Bold').fontSize(14).text('Medications:', { underline: true });
      doc.moveDown(1);

      const tableTop = doc.y;
      doc.font('Helvetica-Bold').fontSize(10);
      doc.text('Medicine Name', 50, tableTop);
      doc.text('Dosage', 250, tableTop);
      doc.text('Frequency', 330, tableTop);
      doc.text('Duration', 420, tableTop);
      doc.text('Instructions', 480, tableTop);
      
      doc.moveTo(50, tableTop + 15).lineTo(545, tableTop + 15).stroke();
      
      let y = tableTop + 25;
      doc.font('Helvetica').fontSize(10);
      
      data.medicines.forEach(med => {
        // Add page break if needed
        if (y > 700) {
          doc.addPage();
          y = 50;
        }
        
        doc.text(med.name, 50, y, { width: 190 });
        doc.text(med.dosage, 250, y, { width: 70 });
        doc.text(med.frequency, 330, y, { width: 80 });
        doc.text(med.duration, 420, y, { width: 50 });
        doc.text(med.instructions || '-', 480, y, { width: 65 });
        
        doc.moveTo(50, y + 20).lineTo(545, y + 20).strokeColor('#eeeeee').stroke();
        y += 30;
      });

      doc.moveDown(2);

      // --- 5. Footer: Signature & QR ---
      const footerY = 700; // Fixed near bottom
      
      if (y > 650) {
        doc.addPage();
      }

      // Signature line
      doc.moveTo(400, footerY).lineTo(545, footerY).strokeColor('black').stroke();
      doc.text(`Dr. ${data.doctor.name}`, 400, footerY + 5, { align: 'center', width: 145 });

      // QR Code
      const verificationUrl = `https://prescribeflow.app/verify/${data.qrToken}`; // Example URL
      const qrImageBuffer = await QRCode.toBuffer(verificationUrl, { margin: 1, width: 80 });
      
      doc.image(qrImageBuffer, 50, footerY - 60, { width: 80 });
      doc.fontSize(8).fillColor('gray').text('Scan to verify authenticity', 50, footerY + 25);

      // Finalize PDF
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
