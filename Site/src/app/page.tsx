"use client";

import { useState, useEffect, useRef } from 'react';
import { Logo3D } from '../components/navigation/Logo3D';

const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:5174/auth';

interface Service {
	id: number;
	title: string;
	shortDesc: string;
	longDesc: string;
	icon: string;
	colorClass: string;
	imageUrl: string;
}

export default function HomePage() {
	// 1. Custom Cursor logic
	useEffect(() => {
		const cursor = document.getElementById('custom-cursor');
		const onMouseMove = (e: MouseEvent) => {
			if (cursor) {
				cursor.style.left = e.clientX + 'px';
				cursor.style.top = e.clientY + 'px';
			}
		};
		document.addEventListener('mousemove', onMouseMove);

		const hoverables = document.querySelectorAll('.cursor-hover');
		const onMouseOver = () => cursor?.classList.add('hovered');
		const onMouseOut = () => cursor?.classList.remove('hovered');

		hoverables.forEach((el) => {
			el.addEventListener('mouseover', onMouseOver);
			el.addEventListener('mouseout', onMouseOut);
		});

		return () => {
			document.removeEventListener('mousemove', onMouseMove);
			hoverables.forEach((el) => {
				el.removeEventListener('mouseover', onMouseOver);
				el.removeEventListener('mouseout', onMouseOut);
			});
		};
	}, []);

	// 2. 3D Stack Carousel logic for Hero Section
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

	// 3. Request Quote Modal logic
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedService, setSelectedService] = useState("Vedações");
	const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

	const openQuoteModal = (serviceName?: string) => {
		if (serviceName) {
			setSelectedService(serviceName);
		}
		setIsModalOpen(true);
	};

	const closeQuoteModal = () => {
		setIsModalOpen(false);
	};

	// 4. Contact Form Submit handler
	const handleContactSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setIsSuccessModalOpen(true);
	};

	// 5. Scroll Reveal logic
	useEffect(() => {
		const revealOnViewportScroll = () => {
			const reveals = document.querySelectorAll('.reveal-item');
			const windowHeight = window.innerHeight;
			const elementVisible = 80;

			reveals.forEach((reveal) => {
				const elementTop = reveal.getBoundingClientRect().top;
				if (elementTop < windowHeight - elementVisible) {
					reveal.classList.add('active');
				}
			});
		};
		window.addEventListener('scroll', revealOnViewportScroll);
		revealOnViewportScroll(); // Initial trigger

		return () => {
			window.removeEventListener('scroll', revealOnViewportScroll);
		};
	}, []);

	// 6. Cookies notification
	const [showCookies, setShowCookies] = useState(false);
	useEffect(() => {
		if (typeof window !== 'undefined' && !localStorage.getItem("cookie_ferribor")) {
			setShowCookies(true);
		}
	}, []);

	const acceptCookies = () => {
		localStorage.setItem("cookie_ferribor", "accept");
		setShowCookies(false);
	};

	// Real 6 services data
	const services: Service[] = [
		{
			id: 1,
			title: "Artefatos para Cerâmica",
			shortDesc: "Fabricação e Recuperação de Artefatos para Industria Cerâmica",
			longDesc: "Desenvolvimento e revestimento de peças com compostos de borracha de alta resistência à abrasão sob medida para transportadores e maquinários cerâmicos.",
			icon: "lucide:layers",
			colorClass: "btn-m-red",
			imageUrl: "/assets/imagens/4d5dd7303ae3d6c2_ceramica.jpg"
		},
		{
			id: 2,
			title: "Artefatos para Solda",
			shortDesc: "Fabricação e Recuperação de Artefatos para Equipamentos de Solda",
			longDesc: "Peças isolantes térmicas e elétricas fabricadas com silicone e poliuretanos especiais de altíssima durabilidade para processos de soldagem industrial.",
			icon: "lucide:zap",
			colorClass: "btn-m-blue",
			imageUrl: "/assets/imagens/7ff406fba3211ef5_solda.jpg"
		},
		{
			id: 3,
			title: "Pés Niveladores",
			shortDesc: "Fabricação de Pés Niveladores",
			longDesc: "Componentes projetados para suportar cargas elevadas, absorver vibrações severas e garantir o nivelamento milimétrico de equipamentos industriais.",
			icon: "lucide:chevrons-up-down",
			colorClass: "btn-m-yellow",
			imageUrl: "/assets/imagens/08ca2f01e3417874_niveladores.jpg"
		},
		{
			id: 4,
			title: "Vedações",
			shortDesc: "Fabricação de Vedações",
			longDesc: "Desenvolvimento de O-rings, retentores, gaxetas, raspadores e anéis sob medida em NBR, silicone, viton e poliuretano de alta precisão.",
			icon: "lucide:shield-check",
			colorClass: "btn-m-red",
			imageUrl: "/assets/imagens/7ed173cd6055799d_vedacoes.jpg"
		},
		{
			id: 5,
			title: "Linha Agro",
			shortDesc: "Peças e equipamentos para linha agro",
			longDesc: "Soluções robustas em elastômeros para tratores, colheitadeiras e implementos agrícolas, garantindo resistência contra intempéries e atrito contínuo.",
			icon: "lucide:leaf",
			colorClass: "btn-m-green",
			imageUrl: "/assets/imagens/5d1bcf832d66669c_linha-agro.jpg"
		},
		{
			id: 6,
			title: "Rolos de Transporte",
			shortDesc: "Fabricação e Recuperação de Rolos de Transporte",
			longDesc: "Revestimento de cilindros com elastômeros especiais seguidos de usinagem e retificação de altíssima precisão técnica decimal.",
			icon: "lucide:settings",
			colorClass: "btn-m-grey",
			imageUrl: "/assets/imagens/6fa5f4bfad00f012_rolos.jpg"
		}
	];

	return (
		<>
			{/* Custom Cursor */}
			<div id="custom-cursor" />

			{/* Noise texture overlay */}
			<div className="noise-overlay" />

				{/* Main Content Container with Lateral and Top Borders */}
				<div className="relative w-full max-w-[1440px] min-h-screen mx-auto bg-[#F8FAF9] border-x border-t border-[#2f3136]/30 xl:border-x-[16px] xl:border-t-[16px] xl:border-[#2f3136] rounded-t-[32px] xl:rounded-t-[48px] shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col z-10 overflow-hidden" id="viewport-screen">
				
				{/* Vertical Grid Lines with Laser Beams */}
				<div className="absolute inset-0 z-0 pointer-events-none flex w-full h-full border-r border-slate-900/[0.02] opacity-60">
					<div className="flex-1 border-l border-slate-900/[0.015] h-full relative overflow-hidden">
						<span className="absolute bottom-8 left-4 text-slate-900/[0.04] text-xs font-mono">ENG.01</span>
					</div>
					<div className="flex-1 border-l border-slate-900/[0.015] h-full relative overflow-hidden">
						<div className="absolute top-0 -left-[1px] w-[1px] h-48 bg-gradient-to-b from-transparent via-red-500/15 to-transparent animate-beam-red" style={{ animationDuration: '6s' }} />
						<span className="absolute bottom-8 left-4 text-slate-900/[0.04] text-xs font-mono">ENG.02</span>
					</div>
					<div className="flex-1 border-l border-slate-900/[0.015] h-full flex justify-center relative overflow-hidden">
						<div className="absolute top-0 -left-[1px] w-[1px] h-64 bg-gradient-to-b from-transparent via-slate-500/20 to-transparent animate-beam-slate" style={{ animationDuration: '8s' }} />
						<div className="h-full border-r border-dashed border-red-500/[0.03] w-px"></div>
						<span className="absolute bottom-8 text-red-500/[0.04] text-xs font-mono">ENG.03</span>
					</div>
					<div className="flex-1 border-l border-slate-900/[0.015] h-full relative overflow-hidden">
						<div className="absolute top-0 -left-[1px] w-[1px] h-32 bg-gradient-to-b from-transparent via-red-500/15 to-transparent animate-beam-red" style={{ animationDuration: '5s', animationDelay: '2s' }} />
						<span className="absolute bottom-8 left-4 text-slate-900/[0.04] text-xs font-mono">ENG.04</span>
					</div>
					<div className="flex-1 border-l border-slate-900/[0.015] h-full relative overflow-hidden">
						<span className="absolute bottom-8 left-4 text-slate-900/[0.04] text-xs font-mono">ENG.05</span>
					</div>
				</div>

				{/* Floating Header Capsule */}
				<nav className="sticky top-4 mx-4 md:mx-8 z-50 flex items-center justify-between gap-4 transition-all duration-300">
					{/* Logo 3D fora do menu glass */}
					<a className="cursor-hover group flex items-center relative z-10" href="#inicio" aria-label="Voltar para o início">
						<Logo3D />
					</a>

					{/* Cápsula de Menu reduzida */}
					<div className="glass-panel-light !overflow-visible rounded-full px-4 md:px-6 py-2 flex items-center gap-6 md:gap-8 border border-white/40 shadow-[0_8px_30px_rgba(0,0,0,0.02)] bg-white/40 backdrop-blur-xl">
						<div className="hidden md:flex items-center gap-6 lg:gap-8 text-[11px] font-bold uppercase tracking-widest text-slate-500">
							<a className="cursor-hover text-red-600 transition-colors" href="/">Início</a>
							<a className="cursor-hover hover:text-red-600 transition-colors" href="/about">A Empresa</a>
							<a className="cursor-hover hover:text-red-600 transition-colors" href="/services">Serviços</a>
							<a className="cursor-hover hover:text-red-600 transition-colors" href="/catalog">Catálogo</a>
							<a className="cursor-hover hover:text-red-600 transition-colors" href="/blog">Blog</a>
							<a className="cursor-hover hover:text-red-600 transition-colors" href="/contact">Contato</a>
						</div>

						<div>
							<a href={DASHBOARD_URL} className="cursor-hover text-[10px] font-bold uppercase tracking-widest px-5 py-2.5 bg-slate-900 text-white rounded-full hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300 text-center inline-block">
								Portal do Cliente
							</a>
						</div>
					</div>
				</nav>

				{/* HERO SECTION / INÍCIO */}
				<section id="inicio" className="relative z-10 py-6 lg:py-10 px-6 md:px-12 flex flex-col justify-center min-h-[calc(100vh-120px)] xl:min-h-[690px] border-b border-slate-900/5">
					<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center w-full">
						
						{/* Left Column: Headline and Actions */}
						<div className="lg:col-span-6 flex flex-col justify-center reveal-item active lg:pr-4">
							<div className="inline-flex items-center gap-2 text-red-600 mb-4">
								<span className="flex h-2 w-2 rounded-full bg-red-600 animate-pulse"></span>
								<span className="text-[10px] font-bold tracking-widest uppercase text-slate-400 font-heading">Elastômeros de Precisão</span>
							</div>
							<h1 className="text-4xl md:text-5xl lg:text-5xl font-bold leading-[1.05] tracking-tighter text-slate-900 mb-5 font-heading">
								A Brutalidade da Indústria,<br />
								<span className="text-hollow-black-ds">A Sutileza da</span>
								<span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-black font-extrabold">Tecnologia.</span>
							</h1>
							<p className="leading-relaxed text-xs md:text-sm text-slate-500 max-w-xl mb-8 font-normal">
								Somos fabricantes de Artefatos de Borracha, Silicone e PU. Contamos com colaboradores especializados em Elastômeros. Consulte-nos que teremos prazer em desenvolver a melhor solução para seu projeto industrial com tolerâncias decimais e alta durabilidade.
							</p>

							<div className="flex flex-wrap gap-4 items-center">
								{/* Silver Metallic Button */}
								<a href="/contact" className="btn-silver-metallic cursor-hover text-center" style={{ '--border-gradient': 'linear-gradient(180deg, rgba(255,255,255,0.9), rgba(0,0,0,0.35), rgba(255,255,255,0.9))', '--border-radius-before': '9999px' } as React.CSSProperties}>
									<span>Solicitar Orçamento</span>
									<i className="iconify text-lg text-slate-800" data-icon="lucide:arrow-right"></i>
								</a>

								{/* Secondary button */}
								<a href="https://api.whatsapp.com/send?phone=5519981748364&text=Ol%C3%A1!" target="_blank" className="btn-community cursor-hover gap-2">
									<i className="iconify text-lg text-green-600" data-icon="lucide:message-square"></i>
									<span>Falar no WhatsApp</span>
								</a>
							</div>
						</div>

						{/* Right Column: Interactive Card Stack Carousel showcasing 4 main services */}
						<div className="lg:col-span-6 flex flex-col justify-center relative reveal-item active" style={{ animationDelay: '0.15s' }}>
							<div className="w-full max-w-[26rem] lg:max-w-[34rem] ml-auto mr-0 flex flex-col items-center lg:items-end">
								
								{/* 3D Stack Container */}
								<div className={`stack-section card-${currentCard}-active relative w-full h-[26rem] mb-4`} id="cards-container">
									
									{/* Card 1: Vedações Especiais */}
									<div className="stack-card glass-panel-light rounded-2xl border border-white/20 p-6 flex flex-col justify-between shadow-lg h-[24rem] w-[20rem] sm:w-[24rem] md:w-[28rem]">
										<div className="absolute inset-0 bg-gradient-to-br from-red-500/[0.02] to-slate-900/5 z-0 pointer-events-none" />
										<div className="relative z-10 flex justify-between items-center">
											<span className="px-2.5 py-0.5 bg-red-600 text-white text-[9px] font-bold rounded uppercase">Vedações</span>
											<span className="text-[9px] text-slate-400 font-mono">FB.01</span>
										</div>
										<div className="relative z-10 flex-1 flex flex-col justify-center items-center text-center px-2">
											<div className="w-full h-28 relative rounded-xl overflow-hidden border border-slate-200/60 mb-3 shadow-inner group">
												<img src="/assets/imagens/7ed173cd6055799d_vedacoes.jpg" alt="Vedações" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
												<div className="absolute top-2 left-2 w-8 h-8 bg-white/90 rounded-lg flex items-center justify-center text-red-600 shadow-sm">
													<i className="iconify text-lg" data-icon="lucide:shield-check"></i>
												</div>
											</div>
											<h3 className="font-heading text-base font-bold text-slate-900 mb-0.5">Vedações Industriais</h3>
											<p className="text-[9px] text-slate-400 uppercase tracking-widest mb-3">NBR, Silicone e Viton</p>
											<div className="w-full space-y-1.5 text-left">
												<div className="flex justify-between text-[9px] text-slate-400 font-medium">
													<span>Precisão de Molde</span>
													<span className="text-slate-900 font-bold">&plusmn;0.05 mm</span>
												</div>
												<div className="w-full bg-slate-200/50 rounded-full h-1">
													<div className="bg-red-600 h-1 rounded-full w-[95%]"></div>
												</div>
											</div>
										</div>
										<div className="relative z-10">
											<button onClick={() => openQuoteModal("Vedações")} className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-600 hover:shadow-md transition-all duration-300 flex items-center justify-center gap-1.5 cursor-hover">
												<span>Solicitar Cotação</span>
												<i className="iconify text-sm" data-icon="lucide:chevron-right"></i>
											</button>
										</div>
									</div>

									{/* Card 2: Revestimento de Rolos */}
									<div className="stack-card glass-panel-light rounded-2xl border border-white/20 p-6 flex flex-col justify-between shadow-lg h-[24rem] w-[20rem] sm:w-[24rem] md:w-[28rem]">
										<div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.02] to-slate-900/5 z-0 pointer-events-none" />
										<div className="relative z-10 flex justify-between items-center">
											<span className="px-2.5 py-0.5 bg-blue-600 text-white text-[9px] font-bold rounded uppercase">Revestimentos</span>
											<span className="text-[9px] text-slate-400 font-mono">FB.02</span>
										</div>
										<div className="relative z-10 flex-1 flex flex-col justify-center items-center text-center px-2">
											<div className="w-full h-28 relative rounded-xl overflow-hidden border border-slate-200/60 mb-3 shadow-inner group">
												<img src="/assets/imagens/6fa5f4bfad00f012_rolos.jpg" alt="Rolos de Transporte" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
												<div className="absolute top-2 left-2 w-8 h-8 bg-white/90 rounded-lg flex items-center justify-center text-blue-600 shadow-sm">
													<i className="iconify text-lg" data-icon="lucide:settings"></i>
												</div>
											</div>
											<h3 className="font-heading text-base font-bold text-slate-900 mb-0.5">Rolos de Transporte</h3>
											<p className="text-[9px] text-slate-400 uppercase tracking-widest mb-3">Retificados e Usinados</p>
											<div className="w-full space-y-1.5 text-left">
												<div className="flex justify-between text-[9px] text-slate-400 font-medium">
													<span>Retífica e Acabamento</span>
													<span className="text-slate-900 font-bold">100% Retificado</span>
												</div>
												<div className="w-full bg-slate-200/50 rounded-full h-1">
													<div className="bg-blue-600 h-1 rounded-full w-[100%]"></div>
												</div>
											</div>
										</div>
										<div className="relative z-10">
											<button onClick={() => openQuoteModal("Rolos de Transporte")} className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-600 hover:shadow-md transition-all duration-300 flex items-center justify-center gap-1.5 cursor-hover">
												<span>Solicitar Cotação</span>
												<i className="iconify text-sm" data-icon="lucide:chevron-right"></i>
											</button>
										</div>
									</div>

									{/* Card 3: Cerâmica */}
									<div className="stack-card glass-panel-light rounded-2xl border border-white/20 p-6 flex flex-col justify-between shadow-lg h-[24rem] w-[20rem] sm:w-[24rem] md:w-[28rem]">
										<div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.02] to-slate-900/5 z-0 pointer-events-none" />
										<div className="relative z-10 flex justify-between items-center">
											<span className="px-2.5 py-0.5 bg-emerald-600 text-white text-[9px] font-bold rounded uppercase">Indústria Cerâmica</span>
											<span className="text-[9px] text-slate-400 font-mono">FB.03</span>
										</div>
										<div className="relative z-10 flex-1 flex flex-col justify-center items-center text-center px-2">
											<div className="w-full h-28 relative rounded-xl overflow-hidden border border-slate-200/60 mb-3 shadow-inner group">
												<img src="/assets/imagens/4d5dd7303ae3d6c2_ceramica.jpg" alt="Artefatos para Cerâmica" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
												<div className="absolute top-2 left-2 w-8 h-8 bg-white/90 rounded-lg flex items-center justify-center text-emerald-600 shadow-sm">
													<i className="iconify text-lg" data-icon="lucide:layers"></i>
												</div>
											</div>
											<h3 className="font-heading text-base font-bold text-slate-900 mb-0.5">Artefatos para Cerâmica</h3>
											<p className="text-[9px] text-slate-400 uppercase tracking-widest mb-3">Alta Resistência a Abrasão</p>
											<div className="w-full space-y-1.5 text-left">
												<div className="flex justify-between text-[9px] text-slate-400 font-medium">
													<span>Composto Resistente</span>
													<span className="text-slate-900 font-bold">Resistência Máxima</span>
												</div>
												<div className="w-full bg-slate-200/50 rounded-full h-1">
													<div className="bg-emerald-600 h-1 rounded-full w-[95%]"></div>
												</div>
											</div>
										</div>
										<div className="relative z-10">
											<button onClick={() => openQuoteModal("Artefatos para Cerâmica")} className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-600 hover:shadow-md transition-all duration-300 flex items-center justify-center gap-1.5 cursor-hover">
												<span>Solicitar Cotação</span>
												<i className="iconify text-sm" data-icon="lucide:chevron-right"></i>
											</button>
										</div>
									</div>

									{/* Card 4: Solda */}
									<div className="stack-card glass-panel-light rounded-2xl border border-white/20 p-6 flex flex-col justify-between shadow-lg h-[24rem] w-[20rem] sm:w-[24rem] md:w-[28rem]">
										<div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.02] to-slate-900/5 z-0 pointer-events-none" />
										<div className="relative z-10 flex justify-between items-center">
											<span className="px-2.5 py-0.5 bg-amber-500 text-slate-900 text-[9px] font-bold rounded uppercase">Solda Industrial</span>
											<span className="text-[9px] text-slate-400 font-mono">FB.04</span>
										</div>
										<div className="relative z-10 flex-1 flex flex-col justify-center items-center text-center px-2">
											<div className="w-full h-28 relative rounded-xl overflow-hidden border border-slate-200/60 mb-3 shadow-inner group">
												<img src="/assets/imagens/7ff406fba3211ef5_solda.jpg" alt="Artefatos para Solda" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
												<div className="absolute top-2 left-2 w-8 h-8 bg-white/90 rounded-lg flex items-center justify-center text-amber-600 shadow-sm">
													<i className="iconify text-lg" data-icon="lucide:zap"></i>
												</div>
											</div>
											<h3 className="font-heading text-base font-bold text-slate-900 mb-0.5">Artefatos para Solda</h3>
											<p className="text-[9px] text-slate-400 uppercase tracking-widest mb-3">Isolantes em Silicone e PU</p>
											<div className="w-full space-y-1.5 text-left">
												<div className="flex justify-between text-[9px] text-slate-400 font-medium">
													<span>Isolamento Térmico</span>
													<span className="text-slate-900 font-bold">Até 250°C</span>
												</div>
												<div className="w-full bg-slate-200/50 rounded-full h-1">
													<div className="bg-amber-500 h-1 rounded-full w-[90%]"></div>
												</div>
											</div>
										</div>
										<div className="relative z-10">
											<button onClick={() => openQuoteModal("Artefatos para Solda")} className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-amber-600 hover:shadow-md transition-all duration-300 flex items-center justify-center gap-1.5 cursor-hover">
												<span>Solicitar Cotação</span>
												<i className="iconify text-sm" data-icon="lucide:chevron-right"></i>
											</button>
										</div>
									</div>
								</div>

								{/* Dots Navigation */}
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
						</div>
					</div>
				</section>

				{/* OVERVIEW SECTION - Quick access to main pages */}
				<section className="relative z-10 py-20 lg:py-28 px-6 md:px-12 border-b border-slate-900/5">
					<div className="max-w-5xl mx-auto">
						<div className="text-center mb-14 reveal-item">
							<h2 className="text-2xl md:text-4xl font-bold tracking-tighter text-slate-900 mb-4 font-heading">
								Explore o que a <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-black">FerriBor</span> pode fazer por você.
							</h2>
							<p className="text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
								Mais de 20 anos desenvolvendo soluções em elastômeros para os ambientes industriais mais exigentes.
							</p>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
							<a href="/about" className="glass-panel-light rounded-2xl p-6 border border-white/40 bg-white/40 backdrop-blur-xl hover:border-red-500/25 transition-all group reveal-item">
								<div className="w-10 h-10 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-600 mb-4">
									<i className="iconify text-lg" data-icon="lucide:building-2"></i>
								</div>
								<h3 className="text-sm font-bold text-slate-900 mb-1 group-hover:text-red-600 transition-colors">A Empresa</h3>
								<p className="text-xs text-slate-500 leading-relaxed">Nossa história, valores e certificações que garantem qualidade.</p>
							</a>

							<a href="/services" className="glass-panel-light rounded-2xl p-6 border border-white/40 bg-white/40 backdrop-blur-xl hover:border-red-500/25 transition-all group reveal-item" style={{ animationDelay: "0.05s" }}>
								<div className="w-10 h-10 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-600 mb-4">
									<i className="iconify text-lg" data-icon="lucide:settings"></i>
								</div>
								<h3 className="text-sm font-bold text-slate-900 mb-1 group-hover:text-red-600 transition-colors">Serviços</h3>
								<p className="text-xs text-slate-500 leading-relaxed">6 linhas especializadas em borracha, silicone e poliuretano.</p>
							</a>

							<a href="/catalog" className="glass-panel-light rounded-2xl p-6 border border-white/40 bg-white/40 backdrop-blur-xl hover:border-red-500/25 transition-all group reveal-item" style={{ animationDelay: "0.1s" }}>
								<div className="w-10 h-10 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-600 mb-4">
									<i className="iconify text-lg" data-icon="lucide:package"></i>
								</div>
								<h3 className="text-sm font-bold text-slate-900 mb-1 group-hover:text-red-600 transition-colors">Catálogo</h3>
								<p className="text-xs text-slate-500 leading-relaxed">Navegue por nossos produtos com filtros por material e aplicação.</p>
							</a>

							<a href="/blog" className="glass-panel-light rounded-2xl p-6 border border-white/40 bg-white/40 backdrop-blur-xl hover:border-red-500/25 transition-all group reveal-item" style={{ animationDelay: "0.15s" }}>
								<div className="w-10 h-10 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-600 mb-4">
									<i className="iconify text-lg" data-icon="lucide:newspaper"></i>
								</div>
								<h3 className="text-sm font-bold text-slate-900 mb-1 group-hover:text-red-600 transition-colors">Blog & Notícias</h3>
								<p className="text-xs text-slate-500 leading-relaxed">Artigos técnicos e novidades do setor de elastômeros.</p>
							</a>

							<a href="/contact" className="glass-panel-light rounded-2xl p-6 border border-white/40 bg-white/40 backdrop-blur-xl hover:border-red-500/25 transition-all group reveal-item" style={{ animationDelay: "0.2s" }}>
								<div className="w-10 h-10 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-600 mb-4">
									<i className="iconify text-lg" data-icon="lucide:mail"></i>
								</div>
								<h3 className="text-sm font-bold text-slate-900 mb-1 group-hover:text-red-600 transition-colors">Contato</h3>
								<p className="text-xs text-slate-500 leading-relaxed">Fale com nossa equipe técnica e solicite um orçamento.</p>
							</a>

							<a href={DASHBOARD_URL} className="glass-panel-light rounded-2xl p-6 border border-white/40 bg-white/40 backdrop-blur-xl hover:border-red-500/25 transition-all group reveal-item" style={{ animationDelay: "0.25s" }}>
								<div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-white mb-4">
									<i className="iconify text-lg" data-icon="lucide:layout-dashboard"></i>
								</div>
								<h3 className="text-sm font-bold text-slate-900 mb-1 group-hover:text-red-600 transition-colors">Portal do Cliente</h3>
								<p className="text-xs text-slate-500 leading-relaxed">Acesse pedidos, Track & Trace e recompra automática.</p>
							</a>
						</div>
					</div>
				</section>

				{/* FOOTER */}
				<footer className="relative mt-auto border-t border-slate-900/5 bg-slate-950 text-white py-16 px-6 md:px-12 z-10 overflow-hidden">
					<div className="grid grid-cols-1 md:grid-cols-12 gap-8 max-w-6xl mx-auto mb-12 relative z-10">
						{/* Col 1: Bio */}
						<div className="md:col-span-5 space-y-4">
							<div className="flex items-center">
								<div className="h-20 w-64 relative flex items-center justify-center -ml-4">
									<img src="/assets/imagens/logo.png" alt="Ferribor Logo" className="w-full h-full object-contain scale-[1.3]" />
								</div>
							</div>
							<p className="text-slate-400 text-xs leading-relaxed max-w-sm">
								A Ferri Indústria de Artefatos de Borracha Ltda-ME é especializada no desenvolvimento, fabricação e revestimento de peças técnicas em borracha, silicone e poliuretano.
							</p>
							<div className="flex items-center gap-4 pt-2">
								<a href="https://www.facebook.com/FerriborArtefatosDeBorracha" target="_blank" className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 hover:text-red-500 flex items-center justify-center transition-all cursor-hover text-slate-300">
									<i className="iconify" data-icon="lucide:facebook"></i>
								</a>
								<a href="https://api.whatsapp.com/send?phone=5519981748364&text=Ol%C3%A1!" target="_blank" className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 hover:text-green-500 flex items-center justify-center transition-all cursor-hover text-slate-300">
									<i className="iconify" data-icon="lucide:message-square"></i>
								</a>
							</div>
						</div>

						{/* Col 2: Site Map */}
						<div className="md:col-span-3 space-y-4">
							<h4 className="font-heading text-xs font-bold uppercase tracking-widest text-slate-200">Mapa do Site</h4>
							<ul className="space-y-2 text-xs text-slate-400 font-medium">
								<li><a className="hover:text-white transition-colors cursor-hover" href="#inicio">Home</a></li>
								<li><a className="hover:text-white transition-colors cursor-hover" href="#aempresa">Empresa</a></li>
								<li><a className="hover:text-white transition-colors cursor-hover" href="#servicos">Serviços</a></li>
								<li><a className="hover:text-white transition-colors cursor-hover" href="#depoimentos">Depoimentos</a></li>
								<li><a className="hover:text-white transition-colors cursor-hover" href="#noticias">Notícias & Cotações</a></li>
								<li><a className="hover:text-white transition-colors cursor-hover" href="#contato">Contato</a></li>
								<li><a className="hover:text-white transition-colors cursor-hover" href="/politica-privacidade.pdf" target="_blank">Política de Privacidade</a></li>
							</ul>
						</div>

						{/* Col 3: Contacts */}
						<div className="md:col-span-4 space-y-4">
							<h4 className="font-heading text-xs font-bold uppercase tracking-widest text-slate-200">Contato</h4>
							<ul className="space-y-3.5 text-xs text-slate-400 leading-normal">
								<li className="flex gap-2">
									<i className="iconify text-md text-red-500 flex-shrink-0 mt-0.5" data-icon="lucide:map-pin"></i>
									<span>Rua Aurea Basso Baptista, 36 - Jardim D&apos;itália, Santa Gertrudes - SP, 13510-092</span>
								</li>
								<li className="flex gap-2 items-center">
									<i className="iconify text-md text-red-500" data-icon="lucide:phone"></i>
									<a href="tel:+5519981748364" className="hover:text-white cursor-hover">(19) 98174-8364</a>
								</li>
								<li className="flex gap-2 items-center">
									<i className="iconify text-md text-green-500" data-icon="lucide:message-square"></i>
									<a href="https://api.whatsapp.com/send?phone=5519981748364&text=Ol%C3%A1!" target="_blank" className="hover:text-white cursor-hover">(19) 98174-8364</a>
								</li>
								<li className="flex gap-2 items-center">
									<i className="iconify text-md text-red-500" data-icon="lucide:mail"></i>
									<a href="mailto:comercial@ferribor.com.br" className="hover:text-white cursor-hover">comercial@ferribor.com.br</a>
								</li>
							</ul>
						</div>
					</div>

					{/* Bottom credits bar */}
					<div className="relative z-10 border-t border-white/5 pt-8 text-center max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 font-mono gap-4">
						<span>Copyright &copy; Cont On 2026. Todos os direitos reservados.</span>
						<span>
							Desenvolvido por{' '}
							<a href="https://www.conton.com.br/" target="_blank" className="hover:text-white underline cursor-hover">
								Cont On Sites e Sistemas
							</a>
						</span>
					</div>
				</footer>
			</div>

			{/* FLOATING WHATSAPP BUTTON */}
			<a
				href="https://api.whatsapp.com/send?phone=5519981748364&text=Ol%C3%A1!"
				target="_blank"
				className="fixed bottom-6 right-6 z-55 w-14 h-14 bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-green-600/35 transition-all duration-300 hover:-translate-y-1 cursor-hover"
				title="Está com alguma dúvida?"
			>
				<i className="iconify text-3xl" data-icon="lucide:message-circle"></i>
			</a>

			{/* COOKIES NOTIFICATION BANNER */}
			{showCookies && (
				<div className="fixed bottom-6 left-6 right-6 sm:left-1/2 sm:-translate-x-1/2 z-55 w-full max-w-4xl px-4 pointer-events-none">
					<div className="glass-panel-light p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between border border-white/50 shadow-2xl bg-white/95 pointer-events-auto gap-4">
						<p className="text-slate-600 text-xs text-center sm:text-left">
							Este site usa cookies para garantir que você obtenha a melhor experiência. Ao navegar, você aceita nossa{' '}
							<a href="/politica-privacidade.pdf" target="_blank" className="font-semibold text-slate-800 hover:text-red-600 underline">
								Política de Privacidade
							</a>.
						</p>
						<button
							onClick={acceptCookies}
							className="px-6 py-2.5 bg-slate-900 hover:bg-red-600 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all duration-300 whitespace-nowrap cursor-hover"
						>
							Prosseguir
						</button>
					</div>
				</div>
			)}

			{/* REQUEST QUOTE MODAL (MODAL DE ORÇAMENTO TÉCNICO) */}
			{isModalOpen && (
				<div id="demo-modal" className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300">
					<div className="relative w-full max-w-lg bg-[#F8FAF9] rounded-3xl border border-white/50 p-8 shadow-2xl flex flex-col transition-all duration-300" id="modal-content">
						
						{/* Close Button */}
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

			{/* GENERAL SUCCESS NOTIFICATION MODAL */}
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
