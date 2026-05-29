// src/context/ToastContext.jsx
import { createContext, useContext, useState, useCallback, useRef } from 'react';

const ToastContext = createContext(null);

// ─── Types ─────────────────────────────────────────────────────────────────────
const ICONS = {
  success: (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  warning: (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  info: (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

const STYLES = {
  success: 'bg-emerald-900 border-emerald-700 text-emerald-100 [--icon-color:theme(colors.emerald.400)]',
  error:   'bg-red-900     border-red-700     text-red-100     [--icon-color:theme(colors.red.400)]',
  warning: 'bg-amber-900   border-amber-700   text-amber-100   [--icon-color:theme(colors.amber.400)]',
  info:    'bg-blue-900    border-blue-700    text-blue-100    [--icon-color:theme(colors.blue.400)]',
};

const ICON_COLORS = {
  success: 'text-emerald-400',
  error:   'text-red-400',
  warning: 'text-amber-400',
  info:    'text-blue-400',
};

// ─── Single Toast Item ──────────────────────────────────────────────────────────
const ToastItem = ({ toast, onRemove }) => {
  return (
    <div
      className={`
        flex items-start gap-3 px-4 py-3.5 rounded-2xl border shadow-2xl min-w-72 max-w-sm
        ${STYLES[toast.type]}
        animate-toast-in
      `}
      role="alert"
    >
      <span className={`mt-0.5 ${ICON_COLORS[toast.type]}`}>{ICONS[toast.type]}</span>
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className="text-sm font-bold leading-tight mb-0.5">{toast.title}</p>
        )}
        <p className="text-xs leading-relaxed opacity-90">{toast.message}</p>
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="mt-0.5 opacity-60 hover:opacity-100 transition-opacity flex-shrink-0"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

// ─── Provider ──────────────────────────────────────────────────────────────────
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const counterRef = useRef(0);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const add = useCallback((message, { type = 'info', title = '', duration = 4000 } = {}) => {
    const id = ++counterRef.current;
    setToasts((prev) => [...prev.slice(-4), { id, message, type, title }]); // max 5

    if (duration > 0) {
      setTimeout(() => remove(id), duration);
    }
    return id;
  }, [remove]);

  // Convenience methods
  const toast = {
    success: (msg, opts = {}) => add(msg, { type: 'success', ...opts }),
    error:   (msg, opts = {}) => add(msg, { type: 'error',   ...opts }),
    warning: (msg, opts = {}) => add(msg, { type: 'warning', ...opts }),
    info:    (msg, opts = {}) => add(msg, { type: 'info',    ...opts }),
    dismiss: remove,
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Toast container — bottom right */}
      <div
        aria-live="assertive"
        className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2.5 items-end pointer-events-none"
        style={{ maxWidth: 'min(calc(100vw - 2.5rem), 24rem)' }}
      >
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto w-full">
            <ToastItem toast={t} onRemove={remove} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// ─── Hook ──────────────────────────────────────────────────────────────────────
export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
};

export default ToastContext;
