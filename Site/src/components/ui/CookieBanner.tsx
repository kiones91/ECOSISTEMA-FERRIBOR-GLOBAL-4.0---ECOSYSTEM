"use client";

import { useState, useEffect } from 'react';

export function CookieBanner() {
  const [showCookies, setShowCookies] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("cookie_ferribor")) {
      setShowCookies(true);
    }
  }, []);

  if (!showCookies) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 sm:left-1/2 sm:-translate-x-1/2 z-55 w-full max-w-4xl px-4 pointer-events-none">
      <div className="glass-panel-light p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between border border-white/50 shadow-2xl bg-white/95 pointer-events-auto gap-4">
        <p className="text-slate-600 text-xs text-center sm:text-left">
          Este site usa cookies para garantir que você obtenha a melhor experiência. Ao navegar, você aceita nossa{' '}
          <a href="/politica-privacidade.pdf" target="_blank" className="font-semibold text-slate-800 hover:text-red-600 underline">
            Política de Privacidade
          </a>.
        </p>
        <button
          onClick={() => {
            localStorage.setItem("cookie_ferribor", "accept");
            setShowCookies(false);
          }}
          className="px-6 py-2.5 bg-slate-900 hover:bg-red-600 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all duration-300 whitespace-nowrap cursor-hover"
        >
          Prosseguir
        </button>
      </div>
    </div>
  );
}
