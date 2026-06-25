"use client";

import { useState } from 'react';

export function QuoteModal() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState("Vedações");
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const openQuoteModal = (serviceName?: string) => {
    if (serviceName) setSelectedService(serviceName);
    setIsModalOpen(true);
  };

  const closeQuoteModal = () => setIsModalOpen(false);

  // Expose openQuoteModal globally for server-rendered buttons
  if (typeof window !== 'undefined') {
    (window as any).__openQuoteModal = openQuoteModal;
  }

  return (
    <>
      {isModalOpen && (
        <div id="demo-modal" className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300">
          <div className="relative w-full max-w-lg bg-[#F8FAF9] rounded-3xl border border-white/50 p-8 shadow-2xl flex flex-col transition-all duration-300">
            <button onClick={closeQuoteModal} className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 cursor-hover">
              <i className="iconify text-2xl" data-icon="lucide:x"></i>
            </button>

            <div className="flex items-center gap-2 text-red-600 mb-4">
              <i className="iconify text-xl" data-icon="lucide:cog"></i>
              <span className="text-xs font-bold tracking-widest uppercase text-slate-500 font-heading">Especificações Técnicas</span>
            </div>

            <h3 className="text-2xl font-bold tracking-tight text-slate-900 mb-2 font-heading">Solicitar Orçamento Técnico</h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">Carregue sua planta técnica ou envie as especificações do artefato para cotação rápida de fabricação/recuperação.</p>

            <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); closeQuoteModal(); setIsSuccessModalOpen(true); }}>
              <div className="input-group">
                <input type="text" placeholder=" " id="input-modal-name" required />
                <label htmlFor="input-modal-name">Seu Nome / Engenheiro</label>
              </div>
              <div className="input-group">
                <input type="text" placeholder=" " id="input-modal-empresa" required />
                <label htmlFor="input-modal-empresa">Empresa</label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="input-group">
                  <input type="email" placeholder=" " id="input-modal-email" required />
                  <label htmlFor="input-modal-email">E-mail Comercial</label>
                </div>
                <div className="input-group">
                  <input type="tel" placeholder=" " id="input-modal-phone" required />
                  <label htmlFor="input-modal-phone">Telefone / Celular</label>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider" htmlFor="input-modal-service">Serviço / Produto</label>
                <select
                  id="input-modal-service"
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full bg-transparent border-b border-slate-300 py-2.5 text-xs text-slate-800 focus:border-red-600 outline-none"
                >
                  <option value="Artefatos para Cerâmica">Artefatos para Cerâmica</option>
                  <option value="Artefatos para Solda">Artefatos para Solda</option>
                  <option value="Pés Niveladores">Pés Niveladores</option>
                  <option value="Vedações">Vedações</option>
                  <option value="Linha Agro">Linha Agro</option>
                  <option value="Rolos de Transporte">Rolos de Transporte</option>
                </select>
              </div>
              <div className="input-group">
                <textarea className="w-full bg-transparent border-none border-b border-slate-300 outline-none p-2 text-xs focus:border-red-600 transition-colors" placeholder="Especificações do elastômero (dureza, composto, dimensões)" id="input-modal-spec" required rows={2}></textarea>
              </div>
              <div className="border-2 border-dashed border-slate-900/10 rounded-2xl p-4 text-center cursor-hover hover:border-red-600/30 transition-colors">
                <i className="iconify text-2xl text-slate-400 mx-auto mb-1.5" data-icon="lucide:upload-cloud"></i>
                <span className="text-xs font-bold text-slate-700 block mb-0.5">Upload de Desenho Técnico (PDF / DXF / STEP)</span>
                <span className="text-[9px] text-slate-400">Arraste e solte o arquivo técnico (Máx 50MB)</span>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-silver-metallic flex-1 cursor-hover" style={{ '--border-gradient': 'linear-gradient(180deg, rgba(255,255,255,0.9), rgba(0,0,0,0.35), rgba(255,255,255,0.9))', '--border-radius-before': '9999px' } as React.CSSProperties}>
                  <span>Enviar Solicitação</span>
                </button>
                <button type="button" onClick={closeQuoteModal} className="btn-community cursor-hover">
                  <span>Cancelar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-sm bg-white rounded-3xl p-8 border border-white/50 shadow-2xl text-center flex flex-col items-center">
            <div className="w-14 h-14 bg-green-50 border border-green-100 rounded-full flex items-center justify-center text-green-600 mb-4 shadow-sm animate-bounce">
              <i className="iconify text-2xl" data-icon="lucide:check-circle"></i>
            </div>
            <h3 className="text-xl font-bold text-slate-950 mb-2 font-heading">Mensagem Enviada!</h3>
            <p className="text-slate-500 text-xs leading-relaxed mb-6">
              Sua solicitação foi processada com sucesso. Nossa equipe comercial/técnica entrará em contato em breve para apresentar a melhor solução.
            </p>
            <button
              onClick={() => setIsSuccessModalOpen(false)}
              className="px-8 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-green-600 hover:shadow-md transition-all duration-300 cursor-hover"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
