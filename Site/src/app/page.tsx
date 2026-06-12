"use client";

import { useState, useEffect, useRef } from 'react';

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
			imageUrl: "/assets/4d5dd7303ae3d6c2_ceramica.jpg"
		},
		{
			id: 2,
			title: "Artefatos para Solda",
			shortDesc: "Fabricação e Recuperação de Artefatos para Equipamentos de Solda",
			longDesc: "Peças isolantes térmicas e elétricas fabricadas com silicone e poliuretanos especiais de altíssima durabilidade para processos de soldagem industrial.",
			icon: "lucide:zap",
			colorClass: "btn-m-blue",
			imageUrl: "/assets/7ff406fba3211ef5_solda.jpg"
		},
		{
			id: 3,
			title: "Pés Niveladores",
			shortDesc: "Fabricação de Pés Niveladores",
			longDesc: "Componentes projetados para suportar cargas elevadas, absorver vibrações severas e garantir o nivelamento milimétrico de equipamentos industriais.",
			icon: "lucide:chevrons-up-down",
			colorClass: "btn-m-yellow",
			imageUrl: "/assets/08ca2f01e3417874_niveladores.jpg"
		},
		{
			id: 4,
			title: "Vedações",
			shortDesc: "Fabricação de Vedações",
			longDesc: "Desenvolvimento de O-rings, retentores, gaxetas, raspadores e anéis sob medida em NBR, silicone, viton e poliuretano de alta precisão.",
			icon: "lucide:shield-check",
			colorClass: "btn-m-red",
			imageUrl: "/assets/7ed173cd6055799d_vedacoes.jpg"
		},
		{
			id: 5,
			title: "Linha Agro",
			shortDesc: "Peças e equipamentos para linha agro",
			longDesc: "Soluções robustas em elastômeros para tratores, colheitadeiras e implementos agrícolas, garantindo resistência contra intempéries e atrito contínuo.",
			icon: "lucide:leaf",
			colorClass: "btn-m-green",
			imageUrl: "/assets/5d1bcf832d66669c_linha-agro.jpg"
		},
		{
			id: 6,
			title: "Rolos de Transporte",
			shortDesc: "Fabricação e Recuperação de Rolos de Transporte",
			longDesc: "Revestimento de cilindros com elastômeros especiais seguidos de usinagem e retificação de altíssima precisão técnica decimal.",
			icon: "lucide:settings",
			colorClass: "btn-m-grey",
			imageUrl: "/assets/6fa5f4bfad00f012_rolos.jpg"
		}
	];

	return (
		<>
			{/* Custom Cursor */}
			<div id="custom-cursor" />

			{/* Noise texture overlay */}
			<div className="noise-overlay" />

			{/* Main Content Container with Lateral Borders */}
			<div className="relative w-full max-w-[1440px] min-h-screen mx-auto bg-[#F8FAF9] border-x border-[#2f3136]/30 xl:border-x-[16px] xl:border-[#2f3136] shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col z-10" id="viewport-screen">
				
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
				<nav className="sticky top-4 mx-4 md:mx-8 z-50 transition-all duration-300">
					<div className="glass-panel-light rounded-full px-6 py-3.5 flex items-center justify-between border border-white/40 shadow-[0_8px_30px_rgba(0,0,0,0.02)] bg-white/40 backdrop-blur-xl">
						<a className="cursor-hover group flex items-center gap-2" href="#inicio">
							<img src="/assets/logo.svg" alt="FerriBor Logo" className="h-8 transition-transform duration-300 group-hover:scale-105" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
							<span className="font-heading font-extrabold text-xs tracking-widest text-slate-900 uppercase">FERRIBOR</span>
						</a>

						<div className="hidden md:flex items-center gap-8 text-[11px] font-bold uppercase tracking-widest text-slate-500">
							<a className="cursor-hover hover:text-red-600 transition-colors" href="#inicio">Início</a>
							<a className="cursor-hover hover:text-red-600 transition-colors" href="#aempresa">A Empresa</a>
							<a className="cursor-hover hover:text-red-600 transition-colors" href="#servicos">Serviços</a>
							<a className="cursor-hover hover:text-red-600 transition-colors" href="#depoimentos">Depoimentos</a>
							<a className="cursor-hover hover:text-red-600 transition-colors" href="#noticias">Notícias & Cotações</a>
							<a className="cursor-hover hover:text-red-600 transition-colors" href="#contato">Contato</a>
						</div>

						<div>
							<button onClick={() => openQuoteModal()} className="cursor-hover text-[10px] font-bold uppercase tracking-widest px-5 py-2.5 bg-slate-900 text-white rounded-full hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300">
								Solicitar Orçamento
							</button>
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
								<a href="#contato" className="btn-silver-metallic cursor-hover text-center" style={{ '--border-gradient': 'linear-gradient(180deg, rgba(255,255,255,0.9), rgba(0,0,0,0.35), rgba(255,255,255,0.9))', '--border-radius-before': '9999px' } as React.CSSProperties}>
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
											<div className="w-14 h-14 bg-red-50 border border-red-100 rounded-xl flex items-center justify-center mb-4 text-red-600 shadow-sm transition-transform duration-300 hover:scale-105">
												<i className="iconify text-2xl" data-icon="lucide:shield-check"></i>
											</div>
											<h3 className="font-heading text-lg font-bold text-slate-900 mb-1">Vedações Industriais</h3>
											<p className="text-[10px] text-slate-400 uppercase tracking-widest mb-4">NBR, Silicone e Viton</p>
											<div className="w-full space-y-2 text-left">
												<div className="flex justify-between text-[10px] text-slate-400 font-medium">
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
											<div className="w-14 h-14 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center mb-4 text-blue-600 shadow-sm">
												<i className="iconify text-2xl" data-icon="lucide:settings"></i>
											</div>
											<h3 className="font-heading text-lg font-bold text-slate-900 mb-1">Rolos de Transporte</h3>
											<p className="text-[10px] text-slate-400 uppercase tracking-widest mb-4">Retificados e Usinados</p>
											<div className="w-full space-y-2 text-left">
												<div className="flex justify-between text-[10px] text-slate-400 font-medium">
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
											<div className="w-14 h-14 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center mb-4 text-emerald-600 shadow-sm">
												<i className="iconify text-2xl" data-icon="lucide:layers"></i>
											</div>
											<h3 className="font-heading text-lg font-bold text-slate-900 mb-1">Artefatos para Cerâmica</h3>
											<p className="text-[10px] text-slate-400 uppercase tracking-widest mb-4">Alta Resistência a Abrasão</p>
											<div className="w-full space-y-2 text-left">
												<div className="flex justify-between text-[10px] text-slate-400 font-medium">
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
											<div className="w-14 h-14 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-center mb-4 text-amber-600 shadow-sm">
												<i className="iconify text-2xl" data-icon="lucide:zap"></i>
											</div>
											<h3 className="font-heading text-lg font-bold text-slate-900 mb-1">Artefatos para Solda</h3>
											<p className="text-[10px] text-slate-400 uppercase tracking-widest mb-4">Isolantes em Silicone e PU</p>
											<div className="w-full space-y-2 text-left">
												<div className="flex justify-between text-[10px] text-slate-400 font-medium">
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

				{/* SECTION: A EMPRESA */}
				<section id="aempresa" className="py-24 px-6 md:px-12 border-b border-slate-900/5 relative">
					<div className="mb-16 reveal-item">
						<div className="text-[10px] font-bold tracking-widest uppercase text-red-600 mb-2">História e Compromisso</div>
						<h2 className="text-3xl md:text-5xl font-bold tracking-tighter text-slate-900 mb-4 font-heading font-extrabold">A Empresa</h2>
						<p className="text-slate-500 max-w-2xl leading-relaxed text-sm">
							Conheça um pouco sobre a FerriIndústria de Artefatos de Borracha Ltda-ME. Constituída em 20 de Março de 2014, somos movidos pelo compromisso de fabricar e prestar os melhores serviços em elastômeros e derivados da região.
						</p>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-12">
						{/* Main Text Panel */}
						<div className="lg:col-span-6 bg-white border border-slate-900/5 p-8 rounded-2xl shadow-sm flex flex-col justify-center reveal-item">
							<p className="text-slate-600 text-sm leading-relaxed mb-6">
								Localizada estrategicamente em Santa Gertrudes - SP, polo da indústria de cerâmica, nossa pretensão é ir de encontro direto às solicitações mais complexas e urgentes de nossos clientes, desenvolvendo sempre a melhor solução em seus projetos técnicos.
							</p>
							<div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-4">
								<div className="w-12 h-12 bg-red-100/55 rounded-lg flex items-center justify-center text-red-600">
									<i className="iconify text-xl" data-icon="lucide:map-pin"></i>
								</div>
								<div>
									<h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-0.5">Sede Própria</h4>
									<p className="text-slate-500 text-xs">Rua Aurea Basso Baptista, 36 - Jardim D&apos;itália, Santa Gertrudes - SP</p>
								</div>
							</div>
						</div>

						{/* Image or Visual Graphic Panel */}
						<div className="lg:col-span-6 relative rounded-2xl overflow-hidden min-h-[300px] border border-slate-900/5 shadow-sm reveal-item" style={{ animationDelay: '0.1s' }}>
							<img src="/assets/04bf2a71c19980c2_01.jpg" alt="Instalação Industrial" className="absolute inset-0 w-full h-full object-cover" />
							<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent flex flex-col justify-end p-8 text-white">
								<span className="font-heading text-xl font-bold">Desde 2014</span>
								<span className="text-[10px] uppercase tracking-widest text-slate-200 mt-1">Garantindo Alta Performance e Precisão Decimais</span>
							</div>
						</div>
					</div>

					{/* Missão, Visão Panels */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-8 reveal-item">
						<div className="glass-panel-light p-8 rounded-2xl flex flex-col h-full">
							<div className="w-12 h-12 bg-red-50 border border-red-100 rounded-xl flex items-center justify-center text-red-600 mb-6 shadow-sm">
								<i className="iconify text-2xl" data-icon="lucide:compass"></i>
							</div>
							<h3 className="font-heading text-lg font-bold text-slate-900 mb-3">Missão</h3>
							<p className="text-xs text-slate-500 leading-relaxed">
								Garantir a qualidade elevada dos nossos produtos e serviços, com base na nossa competência e experiência aliada ao profissionalismo, superando as expectativas dos clientes e garantindo sua fidelização. Utilizar-se com respeito e conscientização dos Recursos Naturais e promovendo um ambiente seguro aos nossos Colaboradores.
							</p>
						</div>

						<div className="glass-panel-light p-8 rounded-2xl flex flex-col h-full">
							<div className="w-12 h-12 bg-red-50 border border-red-100 rounded-xl flex items-center justify-center text-red-600 mb-6 shadow-sm">
								<i className="iconify text-2xl" data-icon="lucide:eye"></i>
							</div>
							<h3 className="font-heading text-lg font-bold text-slate-900 mb-3">Visão</h3>
							<p className="text-xs text-slate-500 leading-relaxed">
								A Ferri Indústria de Artefatos de Borracha Ltda - ME busca ser reconhecida nacionalmente no seu ramo de atividade, pela capacidade de apresentar novas soluções munida de alta capacidade técnica, agilidade de entrega e respeito incondicional aos nossos clientes.
							</p>
						</div>
					</div>
				</section>

				{/* SECTION: NOSSOS SERVIÇOS (Bento Grid) */}
				<section id="servicos" className="py-24 px-6 md:px-12 border-b border-slate-900/5 relative">
					<div className="mb-16 reveal-item">
						<div className="text-[10px] font-bold tracking-widest uppercase text-red-600 mb-2">Nosso Portfólio de Elastômeros</div>
						<h2 className="text-3xl md:text-5xl font-bold tracking-tighter text-slate-900 mb-4 font-heading font-extrabold">Nossos Serviços</h2>
						<p className="text-slate-500 max-w-xl text-sm leading-relaxed">Oferecemos fabricação e recuperação completa de peças industriais em diversos materiais (Borracha, Silicone, PU e Viton).</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
						{services.map((svc, index) => (
							<div
								key={svc.id}
								className="glass-panel-light mirror-sweep rounded-2xl border border-slate-900/5 flex flex-col justify-between overflow-hidden shadow-sm reveal-item"
								style={{ animationDelay: `${index * 0.05}s` }}
							>
								{/* Image wrapper */}
								<div className="relative h-48 w-full bg-slate-100 overflow-hidden">
									<img
										src={svc.imageUrl}
										alt={svc.title}
										className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
										onError={(e) => {
											// Fallback if image doesn't render
											(e.target as HTMLElement).style.display = 'none';
										}}
									/>
									<div className="absolute top-4 left-4 z-10 w-10 h-10 bg-white/95 rounded-lg flex items-center justify-center text-slate-900 shadow-sm border border-white/50">
										<i className="iconify text-xl" data-icon={svc.icon}></i>
									</div>
								</div>

								{/* Info content */}
								<div className="p-6 flex-1 flex flex-col justify-between">
									<div className="mb-6">
										<h3 className="font-heading font-bold text-slate-900 text-md mb-2">{svc.title}</h3>
										<p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider mb-3">{svc.shortDesc}</p>
										<p className="text-slate-500 text-xs leading-relaxed">{svc.longDesc}</p>
									</div>

									{/* Action button utilizing dynamic button colors */}
									<div>
										<button
											onClick={() => openQuoteModal(svc.title)}
											className={`w-full btn-metallic-variant ${svc.colorClass} cursor-hover`}
										>
											<span>Solicitar Orçamento</span>
											<i className="iconify text-md" data-icon="lucide:arrow-up-right"></i>
										</button>
									</div>
								</div>
							</div>
						))}
					</div>
				</section>

				{/* SECTION: DEPOIMENTOS */}
				<section id="depoimentos" className="py-24 px-6 md:px-12 border-b border-slate-900/5 relative bg-slate-950 text-white">
					{/* Grid layout decoration for dark background */}
					<div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]"></div>

					<div className="relative z-10 mb-16 reveal-item text-center">
						<div className="text-[10px] font-bold tracking-widest uppercase text-red-500 mb-2">Reconhecimento do Mercado</div>
						<h2 className="text-3xl md:text-5xl font-bold tracking-tighter mb-4 font-heading font-extrabold">Depoimentos dos Clientes</h2>
						<p className="text-slate-400 max-w-xl mx-auto text-sm">O que dizem os parceiros e diretores que utilizam e confiam nos artefatos FerriBor.</p>
					</div>

					<div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto reveal-item">
						{/* Testimonial 1 */}
						<div className="bg-white/[0.03] backdrop-blur-md border border-white/10 p-8 rounded-2xl flex flex-col justify-between shadow-lg relative overflow-hidden group hover:border-red-500/20 transition-all duration-300">
							<div className="absolute -top-4 -left-2 text-[120px] font-serif font-black text-red-500/10 pointer-events-none">&ldquo;</div>
							<div className="relative z-10">
								<p className="text-slate-300 text-sm italic leading-relaxed mb-6 font-light">
									&quot;Temos a FerriBor como fornecedor número 1 para artefatos de borracha. Contamos com o melhor preço e prazo da região, o que torna nossos produtos competitivos no Mercado.&quot;
								</p>
							</div>
							<div className="flex items-center gap-3 border-t border-white/5 pt-4">
								<div className="w-10 h-10 rounded-full bg-red-600/20 flex items-center justify-center text-red-500 font-bold font-mono text-sm">
									LG
								</div>
								<div>
									<h4 className="text-xs font-bold text-white uppercase tracking-wider">Leonardo Gabriel</h4>
									<p className="text-[10px] text-slate-500">Sócio Diretor da Trevo Impressoras</p>
								</div>
							</div>
						</div>

						{/* Testimonial 2 */}
						<div className="bg-white/[0.03] backdrop-blur-md border border-white/10 p-8 rounded-2xl flex flex-col justify-between shadow-lg relative overflow-hidden group hover:border-red-500/20 transition-all duration-300">
							<div className="absolute -top-4 -left-2 text-[120px] font-serif font-black text-red-500/10 pointer-events-none">&ldquo;</div>
							<div className="relative z-10">
								<p className="text-slate-300 text-sm italic leading-relaxed mb-6 font-light">
									&quot;A FerriBor trouxe a solução que necessitávamos para a criação de um produto diferenciado, com baixo custo e maior durabilidade para nossos clientes.&quot;
								</p>
							</div>
							<div className="flex items-center gap-3 border-t border-white/5 pt-4">
								<div className="w-10 h-10 rounded-full bg-red-600/20 flex items-center justify-center text-red-500 font-bold font-mono text-sm">
									MV
								</div>
								<div>
									<h4 className="text-xs font-bold text-white uppercase tracking-wider">Marcos Vernice</h4>
									<p className="text-[10px] text-slate-500">Sócio Diretor da M&D Translog</p>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* SECTION: NOTÍCIAS E COTAÇÕES */}
				<section id="noticias" className="py-24 px-6 md:px-12 border-b border-slate-900/5 relative">
					<div className="mb-16 reveal-item">
						<div className="text-[10px] font-bold tracking-widest uppercase text-red-600 mb-2">Indicadores Industriais</div>
						<h2 className="text-3xl md:text-5xl font-bold tracking-tighter text-slate-900 mb-4 font-heading font-extrabold">Notícias & Cotações</h2>
						<p className="text-slate-500 max-w-xl text-sm leading-relaxed">Acompanhe as principais informações econômicas e o feed de atualizações do setor agrícola e de insumos industriais.</p>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch reveal-item">
						{/* News list - styled beautifully in glass panel */}
						<div className="lg:col-span-8 bg-white border border-slate-900/5 p-8 rounded-2xl shadow-sm flex flex-col justify-between">
							<div>
								<div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
									<h3 className="font-heading font-bold text-slate-900 text-sm uppercase tracking-wider">Feed Agro & Industrial</h3>
									<span className="px-2.5 py-0.5 bg-slate-100 text-[10px] font-mono text-slate-500 rounded">Ao Vivo</span>
								</div>

								{/* Render clean mock lists of agricultural and financial news that look beautiful */}
								<div className="space-y-4 max-h-[340px] overflow-y-auto pr-2">
									<div className="p-3 hover:bg-slate-50 rounded-xl transition-colors flex items-start gap-3">
										<span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-2 flex-shrink-0"></span>
										<div>
											<span className="text-[10px] text-slate-400 font-mono block">18:28 | Economia</span>
											<h4 className="text-xs font-semibold text-slate-800 hover:text-red-600 transition-colors">
												Bolsas dos EUA disparam após Trump anunciar cancelamento de plano de ataque contra o Irã
											</h4>
										</div>
									</div>

									<div className="p-3 hover:bg-slate-50 rounded-xl transition-colors flex items-start gap-3">
										<span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 flex-shrink-0"></span>
										<div>
											<span className="text-[10px] text-slate-400 font-mono block">17:44 | Geopolítica</span>
											<h4 className="text-xs font-semibold text-slate-800 hover:text-red-600 transition-colors">
												Trump diz acreditar que líder supremo do Irã aprovou acordo com os EUA
											</h4>
										</div>
									</div>

									<div className="p-3 hover:bg-slate-50 rounded-xl transition-colors flex items-start gap-3">
										<span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-2 flex-shrink-0"></span>
										<div>
											<span className="text-[10px] text-slate-400 font-mono block">17:34 | Finanças</span>
											<h4 className="text-xs font-semibold text-slate-800 hover:text-red-600 transition-colors">
												Ibovespa fecha em alta com alívio no cenário de incertezas externas
											</h4>
										</div>
									</div>

									<div className="p-3 hover:bg-slate-50 rounded-xl transition-colors flex items-start gap-3">
										<span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 flex-shrink-0"></span>
										<div>
											<span className="text-[10px] text-slate-400 font-mono block">17:11 | Clima</span>
											<h4 className="text-xs font-semibold text-slate-800 hover:text-red-600 transition-colors">
												Área entre sul de Minas Gerais, São Paulo e Rio de Janeiro tem alerta laranja para tempestade
											</h4>
										</div>
									</div>

									<div className="p-3 hover:bg-slate-50 rounded-xl transition-colors flex items-start gap-3">
										<span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-2 flex-shrink-0"></span>
										<div>
											<span className="text-[10px] text-slate-400 font-mono block">16:44 | Insumos</span>
											<h4 className="text-xs font-semibold text-slate-800 hover:text-red-600 transition-colors">
												Taxas de juros futuras caem fortemente após abertura das negociações externas de commodities
											</h4>
										</div>
									</div>
								</div>
							</div>
							
							<div className="text-[10px] text-slate-400 mt-4 border-t border-slate-100 pt-3 flex items-center justify-between">
								<span>Fonte: Notícias Agrícolas / Cont On</span>
								<a href="https://www.noticiasagricolas.com.br" target="_blank" className="hover:text-red-600 font-semibold uppercase tracking-wider">Acessar Portal Completo</a>
							</div>
						</div>

						{/* Currency Exchange Frame panel */}
						<div className="lg:col-span-4 bg-white border border-slate-900/5 p-8 rounded-2xl shadow-sm flex flex-col justify-between">
							<div>
								<div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
									<h3 className="font-heading font-bold text-slate-900 text-sm uppercase tracking-wider">Cotação de Moedas</h3>
									<i className="iconify text-lg text-slate-400" data-icon="lucide:line-chart"></i>
								</div>
								
								{/* Embedded Currency Widget from ContOn */}
								<div className="w-full h-[320px] rounded-xl overflow-hidden bg-slate-50 border border-slate-200">
									<iframe
										id="cotacao"
										src="https://www.conton.com.br/cotacao.php"
										width="100%"
										height="100%"
										frameBorder="0"
										scrolling="no"
										referrerPolicy="no-referrer-when-downgrade"
										sandbox="allow-scripts allow-same-origin"
										className="w-full h-full"
									></iframe>
								</div>
							</div>

							<p className="text-[9px] text-slate-400 mt-4 font-mono text-center">Atualizado via API conton.com.br</p>
						</div>
					</div>
				</section>

				{/* SECTION: CONTATO E LOCALIZAÇÃO */}
				<section id="contato" className="py-24 px-6 md:px-12 relative">
					<div className="mb-16 reveal-item">
						<div className="text-[10px] font-bold tracking-widest uppercase text-red-600 mb-2">Atendimento Direto</div>
						<h2 className="text-3xl md:text-5xl font-bold tracking-tighter text-slate-900 mb-4 font-heading font-extrabold">Contato</h2>
						<p className="text-slate-500 max-w-xl text-sm leading-relaxed">Fale diretamente com nossa equipe comercial e técnica. Solicite orçamentos, cotações de moldes e tire dúvidas.</p>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start reveal-item">
						
						{/* Left: Contact Form */}
						<div className="lg:col-span-5 bg-white border border-slate-900/5 p-8 rounded-2xl shadow-sm">
							<h3 className="font-heading text-lg font-bold border-b border-slate-100 pb-3 mb-6">Enviar Mensagem</h3>
							
							<form className="space-y-6" onSubmit={handleContactSubmit} id="form-contato">
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
						</div>

						{/* Right: Info and Google Maps */}
						<div className="lg:col-span-7 space-y-8">
							
							{/* Direct Channels Cards */}
							<div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
								<a href="tel:+5519981748364" className="glass-panel-light p-5 rounded-xl text-center flex flex-col items-center justify-center cursor-hover hover:border-red-500/25 transition-all">
									<div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 mb-3">
										<i className="iconify text-lg" data-icon="lucide:phone"></i>
									</div>
									<h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Telefone</h4>
									<span className="text-xs font-bold text-slate-800">(19) 98174-8364</span>
								</a>

								<a href="mailto:comercial@ferribor.com.br" className="glass-panel-light p-5 rounded-xl text-center flex flex-col items-center justify-center cursor-hover hover:border-red-500/25 transition-all">
									<div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 mb-3">
										<i className="iconify text-lg" data-icon="lucide:mail"></i>
									</div>
									<h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">E-mail</h4>
									<span className="text-xs font-bold text-slate-800 break-all">comercial@ferribor.com.br</span>
								</a>

								<a href="https://maps.app.goo.gl/fctwXZ6ank7TiMUi6" target="_blank" className="glass-panel-light p-5 rounded-xl text-center flex flex-col items-center justify-center cursor-hover hover:border-red-500/25 transition-all">
									<div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 mb-3">
										<i className="iconify text-lg" data-icon="lucide:map-pin"></i>
									</div>
									<h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Endereço</h4>
									<span className="text-[10px] font-semibold text-slate-800 leading-tight">Jd. D&apos;itália, Santa Gertrudes-SP</span>
								</a>
							</div>

							{/* Map Card */}
							<div className="bg-white border border-slate-900/5 p-4 rounded-2xl shadow-sm flex flex-col">
								<h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 px-1 flex items-center gap-1.5">
									<span className="w-2 h-2 rounded-full bg-red-600"></span>
									Nossa Localização
								</h4>
								<div className="w-full h-[320px] rounded-xl overflow-hidden border border-slate-200">
									<iframe
										allowFullScreen
										loading="lazy"
										referrerPolicy="no-referrer-when-downgrade"
										src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3687.1863570868554!2d-47.533248890694246!3d-22.459630221955138!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94c7d0d2775e2127%3A0xdc5ce312fce25945!2sR.%20Aurea%20Basso%20Baptista%2C%2036%20-%20Jardim%20D'it%C3%A1lia%2C%20Santa%20Gertrudes%20-%20SP%2C%2013510-092!5e0!3m2!1spt-BR!2sbr!4v1706014304769!5m2!1spt-BR!2sbr"
										style={{ border: 0 }}
										className="w-full h-full"
									></iframe>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* FOOTER */}
				<footer className="relative mt-auto border-t border-slate-900/5 bg-slate-950 text-white py-16 px-6 md:px-12 z-10 overflow-hidden">
					<div className="grid grid-cols-1 md:grid-cols-12 gap-8 max-w-6xl mx-auto mb-12 relative z-10">
						{/* Col 1: Bio */}
						<div className="md:col-span-5 space-y-4">
							<div className="flex items-center gap-2">
								<img src="/assets/logo.svg" alt="FerriBor Logo" className="h-8 filter brightness-0 invert" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
								<span className="font-heading font-extrabold text-xs tracking-widest uppercase">FERRIBOR</span>
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
