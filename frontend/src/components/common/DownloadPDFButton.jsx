// src/components/common/DownloadPDFButton.jsx
import { useState } from 'react';
import { downloadPrescriptionPDF } from '../../services/prescription.service';

/**
 * Reusable Download PDF button.
 *
 * @prop {string}  prescriptionId  - MongoDB _id of the prescription
 * @prop {string}  [patientName]   - Used to build a readable filename
 * @prop {string}  [variant]       - 'primary' | 'outline' | 'ghost' | 'icon'
 * @prop {string}  [size]          - 'sm' | 'md'
 * @prop {string}  [id]            - HTML id attribute for testing
 */
const DownloadPDFButton = ({
  prescriptionId,
  patientName,
  variant = 'outline',
  size    = 'sm',
  id,
}) => {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleDownload = async () => {
    if (!prescriptionId) return;
    setLoading(true);
    setError('');
    try {
      const rxShort  = String(prescriptionId).slice(-8).toUpperCase();
      const safeName = (patientName || 'patient').replace(/\s+/g, '_').toLowerCase();
      await downloadPrescriptionPDF(
        prescriptionId,
        `prescription_${rxShort}_${safeName}.pdf`
      );
    } catch (err) {
      const msg = err.response?.data?.message || 'PDF generation failed. Please try again.';
      setError(msg);
      // Auto-clear error after 4 seconds
      setTimeout(() => setError(''), 4000);
    } finally {
      setLoading(false);
    }
  };

  // ── Style maps ────────────────────────────────────────────────────────────
  const variantCls = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 border border-primary-600 shadow-sm',
    outline: 'bg-white text-primary-600 hover:bg-primary-50 border border-primary-300',
    ghost:   'bg-transparent text-primary-600 hover:bg-primary-50 border border-transparent',
    icon:    'bg-white text-gray-500 hover:text-primary-600 hover:bg-primary-50 border border-gray-200',
  };

  const sizeCls = {
    sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
    md: 'px-4 py-2   text-sm rounded-xl gap-2',
  };

  const baseClass = `
    inline-flex items-center justify-center font-medium
    transition-all duration-150 active:scale-95
    disabled:opacity-50 disabled:cursor-not-allowed
    ${variantCls[variant] || variantCls.outline}
    ${sizeCls[size]       || sizeCls.sm}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <button
        id={id || `download-pdf-${prescriptionId}`}
        onClick={handleDownload}
        disabled={loading}
        title="Download prescription as PDF"
        className={baseClass}
      >
        {loading ? (
          <>
            <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            {variant !== 'icon' && <span>Generating…</span>}
          </>
        ) : (
          <>
            {/* Download icon */}
            <svg
              className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            {variant !== 'icon' && <span>Download PDF</span>}
          </>
        )}
      </button>

      {/* Inline error under button */}
      {error && (
        <p className="text-xs text-red-500 max-w-[200px] leading-tight">{error}</p>
      )}
    </div>
  );
};

export default DownloadPDFButton;
