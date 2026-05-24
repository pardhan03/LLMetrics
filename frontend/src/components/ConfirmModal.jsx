import React from 'react';

export default function ConfirmModal({ isOpen, title, body, confirmLabel, onCancel, onConfirm }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-2xl p-5 shadow-2xl animate-in zoom-in-95 duration-150">
        <h3 className="text-base font-bold text-slate-100 mb-2">{title}</h3>
        <p className="text-xs text-slate-400 mb-5 leading-relaxed">{body}</p>
        <div className="flex gap-2 justify-end">
          <button onClick={onCancel} className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition">
            Keep Active
          </button>
          <button onClick={onConfirm} className="bg-rose-500 hover:bg-rose-600 text-white font-bold px-4 py-2 rounded-xl text-xs transition">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}