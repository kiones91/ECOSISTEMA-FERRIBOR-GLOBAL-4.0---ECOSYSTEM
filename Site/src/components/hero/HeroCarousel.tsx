"use client";

import { useState, useEffect, useRef } from 'react';
import { useQuoteModal } from '../quote/QuoteContext';

export function HeroCarousel() {
  const { openQuoteModal } = useQuoteModal();
  const [currentCard, setCurrentCard] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const setActiveCard = (cardNumber: number) => {
    if (isAnimating || cardNumber === currentCard) return;
    setIsAnimating(true);
    setCurrentCard(cardNumber);
    setTimeout(() => setIsAnimating(false), 800);
  };

  const startAutoRotation = () => {
    timerRef.current = setInterval(() => {
      setCurrentCard((prev) => (prev % 4) + 1);
    }, 5000);
  };

  const resetAutoRotation = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    startAutoRotation();
  };

  useEffect(() => {
    startAutoRotation();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const cards = [
    { id: 1, label: "Vedações", code: "FB.01", color: "red", title: "Vedações Industriais", subtitle: "NBR, Silicone e Viton", img: "/assets/imagens/7ed173cd6055799d_vedacoes.jpg", icon: "lucide:shield-check", metricLabel: "Precisão de Molde", metricValue: "±0.05 mm", metricWidth: "95%" },
    { id: 2, label: "Revestimentos", code: "FB.02", color: "blue", title: "Rolos de Transporte", subtitle: "Retificados e Usinados", img: "/assets/imagens/6fa5f4bfad00f012_rolos.jpg", icon: "lucide:settings", metricLabel: "Retífica e Acabamento", metricValue: "100% Retificado", metricWidth: "100%" },
    { id: 3, label: "Indústria Cerâmica", code: "FB.03", color: "emerald", title: "Artefatos para Cerâmica", subtitle: "Alta Resistência a Abrasão", img: "/assets/imagens/4d5dd7303ae3d6c2_ceramica.jpg", icon: "lucide:layers", metricLabel: "Composto Resistente", metricValue: "Resistência Máxima", metricWidth: "95%" },
    { id: 4, label: "Solda Industrial", code: "FB.04", color: "amber", title: "Artefatos para Solda", subtitle: "Isolantes em Silicone e PU", img: "/assets/imagens/7ff406fba3211ef5_solda.jpg", icon: "lucide:zap", metricLabel: "Isolamento Térmico", metricValue: "Até 250°C", metricWidth: "90%" },
  ];

  const colorMap: Record<string, { badge: string, bar: string, btn: string }> = {
    red: { badge: "bg-red-600 text-white", bar: "bg-red-600", btn: "hover:bg-red-600" },
    blue: { badge: "bg-blue-600 text-white", bar: "bg-blue-600", btn: "hover:bg-blue-600" },
    emerald: { badge: "bg-emerald-600 text-white", bar: "bg-emerald-600", btn: "hover:bg-emerald-600" },
    amber: { badge: "bg-amber-500 text-slate-900", bar: "bg-amber-500", btn: "hover:bg-amber-600" },
  };

  return (
    <div className="w-full max-w-[26rem] lg:max-w-[34rem] ml-auto mr-0 flex flex-col items-center lg:items-end">
      <div className={`stack-section card-${currentCard}-active relative w-full h-[26rem] mb-4`} id="cards-container">
        {cards.map((card) => {
          const colors = colorMap[card.color];
          return (
            <div key={card.id} className="stack-card glass-panel-light rounded-2xl border border-white/20 p-6 flex flex-col justify-between shadow-lg h-[24rem] w-[20rem] sm:w-[24rem] md:w-[28rem]">
              <div className={`absolute inset-0 bg-gradient-to-br from-${card.color}-500/[0.02] to-slate-900/5 z-0 pointer-events-none`} />
              <div className="relative z-10 flex justify-between items-center">
                <span className={`px-2.5 py-0.5 ${colors.badge} text-[9px] font-bold rounded uppercase`}>{card.label}</span>
                <span className="text-[9px] text-slate-400 font-mono">{card.code}</span>
              </div>
              <div className="relative z-10 flex-1 flex flex-col justify-center items-center text-center px-2">
                <div className="w-full h-28 relative rounded-xl overflow-hidden border border-slate-200/60 mb-3 shadow-inner group">
                  <img src={card.img} alt={card.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="eager" />
                  <div className={`absolute top-2 left-2 w-8 h-8 bg-white/90 rounded-lg flex items-center justify-center text-${card.color}-600 shadow-sm`}>
                    <i className="iconify text-lg" data-icon={card.icon}></i>
                  </div>
                </div>
                <h3 className="font-heading text-base font-bold text-slate-900 mb-0.5">{card.title}</h3>
                <p className="text-[9px] text-slate-400 uppercase tracking-widest mb-3">{card.subtitle}</p>
                <div className="w-full space-y-1.5 text-left">
                  <div className="flex justify-between text-[9px] text-slate-400 font-medium">
                    <span>{card.metricLabel}</span>
                    <span className="text-slate-900 font-bold">{card.metricValue}</span>
                  </div>
                  <div className="w-full bg-slate-200/50 rounded-full h-1">
                    <div className={`${colors.bar} h-1 rounded-full`} style={{ width: card.metricWidth }}></div>
                  </div>
                </div>
              </div>
              <div className="relative z-10">
                <button onClick={() => openQuoteModal(card.title)} className={`w-full py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest ${colors.btn} hover:shadow-md transition-all duration-300 flex items-center justify-center gap-1.5 cursor-hover`}>
                  <span>Solicitar Cotação</span>
                  <i className="iconify text-sm" data-icon="lucide:chevron-right"></i>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex space-x-3 items-center justify-center z-20 lg:mr-[12rem]">
        {[1, 2, 3, 4].map((num) => (
          <button
            key={num}
            className={`cursor-hover rounded-full transition-all duration-300 ${
              currentCard === num
                ? 'w-3.5 h-3.5 bg-slate-900 scale-125 shadow-[0_0_8px_rgba(0,0,0,0.2)]'
                : 'w-2 h-2 bg-slate-900/20 hover:bg-slate-900/50'
            }`}
            onClick={() => {
              setActiveCard(num);
              resetAutoRotation();
            }}
          />
        ))}
      </div>
    </div>
  );
}
