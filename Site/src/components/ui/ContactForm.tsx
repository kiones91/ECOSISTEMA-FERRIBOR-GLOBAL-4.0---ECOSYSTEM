"use client";

import { useState } from 'react';

export function ContactForm() {
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="text-center py-12">
        <div className="w-14 h-14 bg-green-50 border border-green-100 rounded-full flex items-center justify-center text-green-600 mb-4 shadow-sm mx-auto">
          <i className="iconify text-2xl" data-icon="lucide:check-circle"></i>
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2 font-heading">Mensagem Enviada!</h3>
        <p className="text-slate-500 text-xs">Entraremos em contato em breve.</p>
      </div>
    );
  }

  return (
    <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
      <div className="input-group">
        <input type="text" placeholder=" " id="nome" required />
        <label htmlFor="nome">* Nome Completo</label>
      </div>
      <div className="input-group">
        <input type="text" placeholder=" " id="empresa" />
        <label htmlFor="empresa">Empresa</label>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="input-group">
          <input type="tel" placeholder=" " id="telefone" />
          <label htmlFor="telefone">Telefone Fixo</label>
        </div>
        <div className="input-group">
          <input type="tel" placeholder=" " id="celular" />
          <label htmlFor="celular">Celular / WhatsApp</label>
        </div>
      </div>
      <div className="input-group">
        <input type="email" placeholder=" " id="email" required />
        <label htmlFor="email">* E-mail</label>
      </div>
      <div className="input-group">
        <textarea className="w-full bg-transparent border-none border-b border-slate-300 outline-none p-2 min-h-[100px] text-sm focus:border-red-600 transition-colors" placeholder="* Mensagem" id="mensagem" required rows={4}></textarea>
      </div>
      <p className="text-[11px] text-slate-400 leading-normal">
        Ao informar meus dados eu concordo com a <a href="/politica-privacidade.pdf" target="_blank" className="font-semibold text-slate-700 hover:text-red-600 underline">Política de Privacidade</a> da FerriBor.
      </p>
      <div>
        <button type="submit" className="w-full btn-silver-metallic cursor-hover text-center" style={{ '--border-gradient': 'linear-gradient(180deg, rgba(255,255,255,0.9), rgba(0,0,0,0.35), rgba(255,255,255,0.9))', '--border-radius-before': '9999px' } as React.CSSProperties}>
          <span>Enviar Mensagem</span>
          <i className="iconify text-md" data-icon="lucide:send"></i>
        </button>
      </div>
    </form>
  );
}
