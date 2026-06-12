"use client";

import { useState, useEffect, useRef } from 'react';

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

	// 2. 3D Stack Carousel logic
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

	const toggleDemoModal = () => {
		setIsModalOpen(!isModalOpen);
	};

	// 4. Copy Code utility
	const copyCode = (text: string) => {
		navigator.clipboard.writeText(text);
		alert('Código copiado com sucesso para a área de transferência!');
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
						<a className="cursor-hover group flex items-center gap-2" href="#hero">
							<img src="/assets/logo.svg" alt="FerriBor Logo" className="h-8 transition-transform duration-300 group-hover:scale-103" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
							<div className="h-5 w-[1px] bg-slate-900/10 mx-1"></div>
							<span className="font-heading font-extrabold text-xs tracking-widest text-slate-900 uppercase">SYSTEM 3.0</span>
						</a>

						<div className="hidden md:flex items-center gap-8 text-[11px] font-bold uppercase tracking-widest text-slate-500">
							<a className="cursor-hover hover:text-red-600 transition-colors" href="#hero">Início</a>
							<a className="cursor-hover hover:text-red-600 transition-colors" href="#typography">Tipografia</a>
							<a className="cursor-hover hover:text-red-600 transition-colors" href="#colors">Cores</a>
							<a className="cursor-hover hover:text-red-600 transition-colors" href="#components">Componentes</a>
							<a className="cursor-hover hover:text-red-600 transition-colors" href="#layout">Layout</a>
						</div>

						<div>
							<a href="#components" className="cursor-hover text-[10px] font-bold uppercase tracking-widest px-5 py-2.5 bg-slate-900 text-white rounded-full hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300">
								Ver Biblioteca
							</a>
						</div>
					</div>
				</nav>

				{/* HERO SECTION */}
				<section id="hero" className="relative z-10 py-6 lg:py-10 px-6 md:px-12 flex flex-col justify-center min-h-[calc(100vh-120px)] xl:min-h-[690px] border-b border-slate-900/5">
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
								Projetado especificamente para engenheiros exigentes. Unimos a resistência severa das borrachas e poliuretanos FerriBor com as maiores inovações mecânicas, garantindo vedações perfeitas e durabilidade inabalável sob extrema pressão industrial.
							</p>

							<div className="flex flex-wrap gap-4 items-center">
								{/* Silver Metallic Button */}
								<button className="btn-silver-metallic cursor-hover" style={{ '--border-gradient': 'linear-gradient(180deg, rgba(255,255,255,0.9), rgba(0,0,0,0.35), rgba(255,255,255,0.9))', '--border-radius-before': '9999px' } as React.CSSProperties} type="button">
									<span>Inscreva-se na Lista de Espera</span>
									<i className="iconify text-lg text-slate-800" data-icon="lucide:arrow-right"></i>
								</button>

								{/* Secondary button */}
								<button className="btn-community cursor-hover" type="button">
									<span>Comunidade</span>
								</button>
							</div>
						</div>

						{/* Right Column: Interactive Card Stack Carousel */}
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
											<h3 className="font-heading text-lg font-bold text-slate-900 mb-1">Vedações Especiais</h3>
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
											<button onClick={toggleDemoModal} className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-600 hover:shadow-md transition-all duration-300 flex items-center justify-center gap-1.5 cursor-hover">
												<span>Solicitar Cotação</span>
												<i className="iconify text-sm" data-icon="lucide:chevron-right"></i>
											</button>
										</div>
									</div>

									{/* Card 2: Poliuretano */}
									<div className="stack-card glass-panel-light rounded-2xl border border-white/20 p-6 flex flex-col justify-between shadow-lg h-[24rem] w-[20rem] sm:w-[24rem] md:w-[28rem]">
										<div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.02] to-slate-900/5 z-0 pointer-events-none" />
										<div className="relative z-10 flex justify-between items-center">
											<span className="px-2.5 py-0.5 bg-blue-600 text-white text-[9px] font-bold rounded uppercase">PU Industrial</span>
											<span className="text-[9px] text-slate-400 font-mono">FB.02</span>
										</div>
										<div className="relative z-10 flex-1 flex flex-col justify-center items-center text-center px-2">
											<div className="w-14 h-14 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center mb-4 text-blue-600 shadow-sm">
												<i className="iconify text-2xl" data-icon="lucide:cpu"></i>
											</div>
											<h3 className="font-heading text-lg font-bold text-slate-900 mb-1">Poliuretanos</h3>
											<p className="text-[10px] text-slate-400 uppercase tracking-widest mb-4">Gaxetas e Raspadores</p>
											<div className="w-full space-y-2 text-left">
												<div className="flex justify-between text-[10px] text-slate-400 font-medium">
													<span>Dureza Máxima</span>
													<span class="text-slate-900 font-bold">95 Shore A</span>
												</div>
												<div className="w-full bg-slate-200/50 rounded-full h-1">
													<div className="bg-blue-600 h-1 rounded-full w-[90%]"></div>
												</div>
											</div>
										</div>
										<div className="relative z-10">
											<button onClick={toggleDemoModal} className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-600 hover:shadow-md transition-all duration-300 flex items-center justify-center gap-1.5 cursor-hover">
												<span>Solicitar Cotação</span>
												<i className="iconify text-sm" data-icon="lucide:chevron-right"></i>
											</button>
										</div>
									</div>

									{/* Card 3: Revestimentos */}
									<div className="stack-card glass-panel-light rounded-2xl border border-white/20 p-6 flex flex-col justify-between shadow-lg h-[24rem] w-[20rem] sm:w-[24rem] md:w-[28rem]">
										<div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.02] to-slate-900/5 z-0 pointer-events-none" />
										<div className="relative z-10 flex justify-between items-center">
											<span className="px-2.5 py-0.5 bg-emerald-600 text-white text-[9px] font-bold rounded uppercase">Cilindros</span>
											<span className="text-[9px] text-slate-400 font-mono">FB.03</span>
										</div>
										<div className="relative z-10 flex-1 flex flex-col justify-center items-center text-center px-2">
											<div className="w-14 h-14 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center mb-4 text-emerald-600 shadow-sm">
												<i className="iconify text-2xl" data-icon="lucide:layers"></i>
											</div>
											<h3 class="font-heading text-lg font-bold text-slate-900 mb-1">Revestimento de Rolos</h3>
											<p className="text-[10px] text-slate-400 uppercase tracking-widest mb-4">Usinados e Retificados</p>
											<div className="w-full space-y-2 text-left">
												<div className="flex justify-between text-[10px] text-slate-400 font-medium">
													<span>Retífica e Acabamento</span>
													<span className="text-slate-900 font-bold">100% Retificado</span>
												</div>
												<div className="w-full bg-slate-200/50 rounded-full h-1">
													<div className="bg-emerald-600 h-1 rounded-full w-[100%]"></div>
												</div>
											</div>
										</div>
										<div className="relative z-10">
											<button onClick={toggleDemoModal} className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-600 hover:shadow-md transition-all duration-300 flex items-center justify-center gap-1.5 cursor-hover">
												<span>Solicitar Cotação</span>
												<i className="iconify text-sm" data-icon="lucide:chevron-right"></i>
											</button>
										</div>
									</div>

									{/* Card 4: Vulcanização */}
									<div className="stack-card glass-panel-light rounded-2xl border border-white/20 p-6 flex flex-col justify-between shadow-lg h-[24rem] w-[20rem] sm:w-[24rem] md:w-[28rem]">
										<div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.02] to-slate-900/5 z-0 pointer-events-none" />
										<div className="relative z-10 flex justify-between items-center">
											<span className="px-2.5 py-0.5 bg-amber-500 text-slate-900 text-[9px] font-bold rounded uppercase">Usinagem</span>
											<span className="text-[9px] text-slate-400 font-mono">FB.04</span>
										</div>
										<div className="relative z-10 flex-1 flex flex-col justify-center items-center text-center px-2">
											<div className="w-14 h-14 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-center mb-4 text-amber-600 shadow-sm">
												<i className="iconify text-2xl" data-icon="lucide:settings"></i>
											</div>
											<h3 className="font-heading text-lg font-bold text-slate-900 mb-1">Usinagem & Moldes</h3>
											<p className="text-[10px] text-slate-400 uppercase tracking-widest mb-4">Centros de Usinagem CNC</p>
											<div className="w-full space-y-2 text-left">
												<div className="flex justify-between text-[10px] text-slate-400 font-medium">
													<span>Tolerância de Usinagem</span>
													<span className="text-slate-900 font-bold">&plusmn;0.01 mm</span>
												</div>
												<div className="w-full bg-slate-200/50 rounded-full h-1">
													<div className="bg-amber-500 h-1 rounded-full w-[85%]"></div>
												</div>
											</div>
										</div>
										<div className="relative z-10">
											<button onClick={toggleDemoModal} className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-amber-600 hover:shadow-md transition-all duration-300 flex items-center justify-center gap-1.5 cursor-hover">
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

				{/* SECTION 1: TYPOGRAPHY */}
				<section id="typography" className="py-24 px-6 md:px-12 border-b border-slate-900/5 relative">
					<div className="mb-16 reveal-item">
						<div className="text-[10px] font-bold tracking-widest uppercase text-red-600 mb-2">Escrita de Alta Visibilidade</div>
						<h2 className="text-3xl md:text-5xl font-bold tracking-tighter text-slate-900 mb-4 font-heading">Tipografia do Sistema</h2>
						<p className="text-slate-500 max-w-xl">Hierarquia e estilos de fontes selecionados para a legibilidade técnica de desenhos industriais e catálogos.</p>
					</div>

					<div className="space-y-8 bg-white border border-slate-900/5 p-8 rounded-2xl reveal-item shadow-sm">
						<div className="flex flex-col md:flex-row justify-between gap-6 pb-6 border-b border-slate-900/5 items-start md:items-center">
							<div>
								<span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block mb-2">Montserrat Bold</span>
								<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-none font-heading">Borrachas Especiais</h1>
							</div>
							<span className="font-mono text-xs text-slate-400">Montserrat (700) / 60px</span>
						</div>

						<div className="flex flex-col md:flex-row justify-between gap-6 pb-6 border-b border-slate-900/5 items-start md:items-center">
							<div>
								<span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block mb-2">Oswald Display / Contorno Fino</span>
								<h2 className="text-4xl md:text-5xl font-bold tracking-tight text-hollow-black-ds leading-none font-oswald uppercase">Vedações Industriais</h2>
							</div>
							<span className="font-mono text-xs text-slate-400">Oswald Outline / 48px</span>
						</div>

						<div className="flex flex-col md:flex-row justify-between gap-6 pb-6 border-b border-slate-900/5 items-start md:items-center">
							<div>
								<span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block mb-2">Body Regular / Inter Regular</span>
								<p className="text-base text-slate-600 leading-relaxed max-w-2xl">Oferecemos ferramentaria própria e acompanhamento de desenhos técnicos específicos de engenharia, criando vedações com tolerâncias decimais rígidas.</p>
							</div>
							<span className="font-mono text-xs text-slate-400">Inter (400) / 16px</span>
						</div>
					</div>
				</section>

				{/* SECTION 2: COLORS */}
				<section id="colors" className="py-24 px-6 md:px-12 border-b border-slate-900/5 relative">
					<div className="mb-16 reveal-item">
						<div className="text-[10px] font-bold tracking-widest uppercase text-red-600 mb-2">Identidade Cromática</div>
						<h2 className="text-3xl md:text-5xl font-bold tracking-tighter text-slate-900 mb-4 font-heading">Cores & Superfícies</h2>
						<p className="text-slate-500 max-w-xl">Paleta minimalista baseada no logotipo corporativo da FerriBor, combinada com superfícies de desfoque sofisticadas.</p>
					</div>

					<h3 className="font-heading text-base font-bold mb-6 text-slate-800 reveal-item">Cores Corporativas</h3>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 reveal-item">
						<div className="bg-white border border-slate-900/5 p-5 rounded-2xl flex flex-col justify-between h-40 shadow-sm">
							<div className="w-full h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xs text-slate-400">#FFFFFF</div>
							<div>
								<div className="text-sm font-semibold text-slate-900">Branco Puro</div>
								<div className="text-xs text-slate-400 font-mono mt-0.5">Fundo Geral e Elementos</div>
							</div>
						</div>

						<div className="bg-white border border-slate-900/5 p-5 rounded-2xl flex flex-col justify-between h-40 shadow-sm">
							<div className="w-full h-12 rounded-xl bg-slate-950 flex items-center justify-center text-xs text-white">#0C0F12</div>
							<div>
								<div className="text-sm font-semibold text-slate-900">Preto Profundo</div>
								<div className="text-xs text-slate-400 font-mono mt-0.5">Textos e Molduras</div>
							</div>
						</div>

						<div className="bg-white border border-slate-900/5 p-5 rounded-2xl flex flex-col justify-between h-40 shadow-sm">
							<div className="w-full h-12 rounded-xl bg-[#dc2626] flex items-center justify-center text-xs text-white font-medium">#dc2626</div>
							<div>
								<div className="text-sm font-semibold text-slate-900">Vermelho Industrial</div>
								<div className="text-xs text-slate-400 font-mono mt-0.5">Acentos e Destaque</div>
							</div>
						</div>
					</div>

					<h3 className="font-heading text-base font-bold mb-6 text-slate-800 reveal-item">Cores Cromáticas de Botões (Variantes de Engenharia)</h3>
					<div className="grid grid-cols-2 lg:grid-cols-5 gap-6 reveal-item">
						<div className="bg-white border border-slate-900/5 p-4 rounded-xl flex flex-col gap-3 shadow-sm">
							<div className="h-10 rounded-lg bg-gradient-to-b from-[#FFFFFF] to-[#C2C2C2] border border-slate-300"></div>
							<span className="text-xs font-semibold text-slate-900">Prata Metálico</span>
						</div>
						<div className="bg-white border border-slate-900/5 p-4 rounded-xl flex flex-col gap-3 shadow-sm">
							<div className="h-10 rounded-lg bg-[#dc2626]"></div>
							<span className="text-xs font-semibold text-slate-900">Vermelho Logo</span>
						</div>
						<div className="bg-white border border-slate-900/5 p-4 rounded-xl flex flex-col gap-3 shadow-sm">
							<div className="h-10 rounded-lg bg-[#10b981]"></div>
							<span className="text-xs font-semibold text-slate-900">Verde Sucesso</span>
						</div>
						<div className="bg-white border border-slate-900/5 p-4 rounded-xl flex flex-col gap-3 shadow-sm">
							<div className="h-10 rounded-lg bg-[#2563eb]"></div>
							<span className="text-xs font-semibold text-slate-900">Azul Engenharia</span>
						</div>
						<div className="bg-white border border-slate-900/5 p-4 rounded-xl flex flex-col gap-3 shadow-sm">
							<div className="h-10 rounded-lg bg-[#f59e0b]"></div>
							<span className="text-xs font-semibold text-slate-900">Amarelo Alerta</span>
						</div>
					</div>
				</section>

				{/* SECTION 3: UI COMPONENTS */}
				<section id="components" className="py-24 px-6 md:px-12 border-b border-slate-900/5 relative">
					<div className="mb-16 reveal-item">
						<div className="text-[10px] font-bold tracking-widest uppercase text-red-600 mb-2">Biblioteca do Projeto</div>
						<h2 className="text-3xl md:text-5xl font-bold tracking-tighter text-slate-900 mb-4 font-heading">UI Components</h2>
						<p className="text-slate-500 max-w-xl">Todos os componentes com efeito diagonal de espelho, vidrificação delicada e sombras premium.</p>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start reveal-item">
						{/* Left block - Buttons list */}
						<div className="lg:col-span-7 bg-white border border-slate-900/5 p-8 rounded-2xl space-y-8 shadow-sm">
							<h3 className="font-heading text-lg font-bold border-b border-slate-900/5 pb-3">Botões Metálicos & Vidrificados</h3>
							
							<div className="space-y-6">
								{/* Silver Button */}
								<div className="flex flex-col gap-3 p-4 bg-slate-50 rounded-xl">
									<div className="flex items-center justify-between flex-wrap gap-4">
										<button className="btn-silver-metallic cursor-hover" style={{ '--border-gradient': 'linear-gradient(180deg, rgba(255,255,255,0.9), rgba(0,0,0,0.35), rgba(255,255,255,0.9))', '--border-radius-before': '9999px' } as React.CSSProperties}>
											<span>Prateado Metálico</span>
											<i className="iconify text-lg text-slate-800" data-icon="lucide:arrow-right"></i>
										</button>
										<button onClick={() => copyCode('<button class="btn-silver-metallic" style="--border-gradient: linear-gradient(180deg, rgba(255,255,255,0.9), rgba(0,0,0,0.35), rgba(255,255,255,0.9)); --border-radius-before: 9999px"><span>Lista de Espera</span><i class="lucide-arrow-right"></i></button>')} className="text-[10px] font-mono font-bold uppercase text-red-600 hover:text-red-800 cursor-hover">Copiar HTML</button>
									</div>
									<textarea readOnly className="w-full h-12 bg-white border border-slate-200 rounded-lg p-2 font-mono text-[9px] text-slate-500 overflow-hidden outline-none resize-none" value='<button class="btn-silver-metallic" style="--border-gradient: linear-gradient(180deg, rgba(255,255,255,0.9), rgba(0,0,0,0.35), rgba(255,255,255,0.9)); --border-radius-before: 9999px"><span>Lista de Espera</span><i class="lucide-arrow-right"></i></button>' />
								</div>

								{/* Red Button */}
								<div className="flex flex-col gap-3 p-4 bg-slate-50 rounded-xl">
									<div className="flex items-center justify-between flex-wrap gap-4">
										<button className="btn-metallic-variant btn-m-red cursor-hover">
											<span>Vermelho Logo</span>
											<i className="iconify text-lg text-white" data-icon="lucide:shield"></i>
										</button>
										<button onClick={() => copyCode('<button class="btn-metallic-variant btn-m-red"><span>Vermelho Logo</span></button>')} className="text-[10px] font-mono font-bold uppercase text-red-600 hover:text-red-800 cursor-hover">Copiar HTML</button>
									</div>
									<textarea readOnly className="w-full h-12 bg-white border border-slate-200 rounded-lg p-2 font-mono text-[9px] text-slate-500 overflow-hidden outline-none resize-none" value='<button class="btn-metallic-variant btn-m-red"><span>Vermelho Logo</span></button>' />
								</div>

								{/* Green Button */}
								<div className="flex flex-col gap-3 p-4 bg-slate-50 rounded-xl">
									<div className="flex items-center justify-between flex-wrap gap-4">
										<button className="btn-metallic-variant btn-m-green cursor-hover">
											<span>Verde Sucesso</span>
											<i className="iconify text-lg text-white" data-icon="lucide:check-circle"></i>
										</button>
										<button onClick={() => copyCode('<button class="btn-metallic-variant btn-m-green"><span>Verde Sucesso</span></button>')} className="text-[10px] font-mono font-bold uppercase text-red-600 hover:text-red-800 cursor-hover">Copiar HTML</button>
									</div>
									<textarea readOnly className="w-full h-12 bg-white border border-slate-200 rounded-lg p-2 font-mono text-[9px] text-slate-500 overflow-hidden outline-none resize-none" value='<button class="btn-metallic-variant btn-m-green"><span>Verde Sucesso</span></button>' />
								</div>

								{/* Blue Button */}
								<div className="flex flex-col gap-3 p-4 bg-slate-50 rounded-xl">
									<div className="flex items-center justify-between flex-wrap gap-4">
										<button className="btn-metallic-variant btn-m-blue cursor-hover">
											<span>Azul Engenharia</span>
											<i className="iconify text-lg text-white" data-icon="lucide:wrench"></i>
										</button>
										<button onClick={() => copyCode('<button class="btn-metallic-variant btn-m-blue"><span>Azul Engenharia</span></button>')} className="text-[10px] font-mono font-bold uppercase text-red-600 hover:text-red-800 cursor-hover">Copiar HTML</button>
									</div>
									<textarea readOnly className="w-full h-12 bg-white border border-slate-200 rounded-lg p-2 font-mono text-[9px] text-slate-500 overflow-hidden outline-none resize-none" value='<button class="btn-metallic-variant btn-m-blue"><span>Azul Engenharia</span></button>' />
								</div>

								{/* Yellow Button */}
								<div className="flex flex-col gap-3 p-4 bg-slate-50 rounded-xl">
									<div className="flex items-center justify-between flex-wrap gap-4">
										<button className="btn-metallic-variant btn-m-yellow cursor-hover">
											<span>Amarelo Alerta</span>
											<i className="iconify text-lg text-amber-950" data-icon="lucide:alert-triangle"></i>
										</button>
										<button onClick={() => copyCode('<button class="btn-metallic-variant btn-m-yellow"><span>Amarelo Alerta</span></button>')} className="text-[10px] font-mono font-bold uppercase text-red-600 hover:text-red-800 cursor-hover">Copiar HTML</button>
									</div>
									<textarea readOnly className="w-full h-12 bg-white border border-slate-200 rounded-lg p-2 font-mono text-[9px] text-slate-500 overflow-hidden outline-none resize-none" value='<button class="btn-metallic-variant btn-m-yellow"><span>Amarelo Alerta</span></button>' />
								</div>

								{/* Grey Button */}
								<div className="flex flex-col gap-3 p-4 bg-slate-50 rounded-xl">
									<div className="flex items-center justify-between flex-wrap gap-4">
										<button className="btn-metallic-variant btn-m-grey cursor-hover">
											<span>Cinza Sofisticado</span>
											<i className="iconify text-lg text-white" data-icon="lucide:cog"></i>
										</button>
										<button onClick={() => copyCode('<button class="btn-metallic-variant btn-m-grey"><span>Cinza Sofisticado</span></button>')} className="text-[10px] font-mono font-bold uppercase text-red-600 hover:text-red-800 cursor-hover">Copiar HTML</button>
									</div>
									<textarea readOnly className="w-full h-12 bg-white border border-slate-200 rounded-lg p-2 font-mono text-[9px] text-slate-500 overflow-hidden outline-none resize-none" value='<button class="btn-metallic-variant btn-m-grey"><span>Cinza Sofisticado</span></button>' />
								</div>
							</div>
						</div>

						{/* Right block - Form / Bento */}
						<div className="lg:col-span-5 space-y-8">
							<div className="bg-white border border-slate-900/5 p-8 rounded-2xl space-y-6 shadow-sm">
								<h3 className="font-heading text-lg font-bold border-b border-slate-900/5 pb-3">Formulários Técnicos</h3>
								<div className="input-group">
									<input type="text" placeholder=" " id="input-engineer-ds" />
									<label htmlFor="input-engineer-ds">Nome do Solicitante</label>
								</div>
								<div className="input-group">
									<input type="email" placeholder=" " id="input-email-ds" />
									<label htmlFor="input-email-ds">E-mail Técnico</label>
								</div>
							</div>

							<div className="glass-panel-light mirror-sweep p-8 rounded-2xl cursor-hover group">
								<div className="absolute inset-0 bg-gradient-to-tr from-red-500/[0.02] to-transparent z-0 pointer-events-none" />
								<div className="absolute top-4 right-4 opacity-20 group-hover:opacity-100 transition-opacity duration-300">
									<i className="iconify text-lg text-red-600" data-icon="lucide:arrow-up-right"></i>
								</div>
								<div className="w-12 h-12 bg-red-50 border border-red-100 rounded-xl flex items-center justify-center text-red-600 mb-6 shadow-sm">
									<i className="iconify text-2xl" data-icon="lucide:cpu"></i>
								</div>
								<h3 className="font-heading text-lg font-bold mb-2">Tolerância Decimal</h3>
								<p className="text-xs text-slate-500 leading-relaxed">
									Garantimos encaixes micrométricos nas vedações. Nossos compostos são testados em laboratórios de vulcanização próprios seguindo normas de alta exigência.
								</p>
							</div>

							<div className="bg-white border border-slate-900/5 p-8 rounded-2xl shadow-sm text-center">
								<h3 className="font-heading text-lg font-bold mb-4">Janelas & Pop-ups</h3>
								<button onClick={toggleDemoModal} className="cursor-hover px-6 py-3 bg-slate-900 hover:bg-red-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300">
									Demonstrar Janela Modal
								</button>
							</div>
						</div>
					</div>
				</section>

				{/* SECTION 4: CONTAINER / LAYOUT */}
				<section id="layout" className="py-24 px-6 md:px-12 relative">
					<div className="mb-16 reveal-item">
						<div className="text-[10px] font-bold tracking-widest uppercase text-red-600 mb-2">Estrutura Espacial</div>
						<h2 className="text-3xl md:text-5xl font-bold tracking-tighter text-slate-900 mb-4 font-heading">Grids & Contêineres</h2>
						<p className="text-slate-500 max-w-xl">Modelos espaciais de visualização e Bento grids aplicados a catálogos de especificações.</p>
					</div>

					<div className="space-y-6 reveal-item bg-white border border-slate-900/5 p-8 rounded-2xl shadow-sm">
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							<div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center text-xs font-semibold text-slate-500">
								Coluna Bento 1/3
							</div>
							<div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center text-xs font-semibold text-slate-500">
								Coluna Bento 1/3
							</div>
							<div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center text-xs font-semibold text-slate-500">
								Coluna Bento 1/3
							</div>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center text-xs font-semibold text-slate-500">
								Metade 1/2
							</div>
							<div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center text-xs font-semibold text-slate-500">
								Metade 1/2
							</div>
						</div>
					</div>
				</section>
			</div>

			{/* INTERACTIVE DEMO MODAL */}
			{isModalOpen && (
				<div id="demo-modal" className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300">
					<div className="relative w-full max-w-lg bg-[#F8FAF9] rounded-3xl border border-white/50 p-8 shadow-2xl flex flex-col transition-all duration-300" id="modal-content">
						
						{/* Close Button */}
						<button onClick={toggleDemoModal} className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 cursor-hover">
							<i className="iconify text-2xl" data-icon="lucide:x"></i>
						</button>

						<div className="flex items-center gap-2 text-red-600 mb-4">
							<i className="iconify text-xl" data-icon="lucide:cog"></i>
							<span className="text-xs font-bold tracking-widest uppercase text-slate-500 font-heading">Desenhos Técnicos</span>
						</div>

						<h3 className="text-2xl font-bold tracking-tight text-slate-900 mb-2 font-heading">Enviar Projeto de Engenharia</h3>
						<p className="text-xs text-slate-500 mb-6 leading-relaxed">Carregue sua planta ou desenho técnico para cotação de molde e fabricação de vedações sob demanda.</p>

						<form className="space-y-5" onSubmit={(e) => { e.preventDefault(); alert('Projeto simulado enviado com sucesso!'); toggleDemoModal(); }}>
							<div className="input-group">
								<input type="text" placeholder=" " id="input-modal-name" required />
								<label htmlFor="input-modal-name">Nome do Engenheiro</label>
							</div>
							<div className="input-group">
								<input type="text" placeholder=" " id="input-modal-code" required />
								<label htmlFor="input-modal-code">Código do Componente (ex: FB-802)</label>
							</div>
							
							<div className="border-2 border-dashed border-slate-900/10 rounded-2xl p-6 text-center cursor-hover hover:border-red-600/30 transition-colors">
								<i className="iconify text-3xl text-slate-400 mx-auto mb-2" data-icon="lucide:upload-cloud"></i>
								<span className="text-xs font-bold text-slate-700 block mb-1">Upload de arquivo CAD / PDF</span>
								<span className="text-[10px] text-slate-400">Arraste e solte o arquivo técnico (Máx 50MB)</span>
							</div>

							<div className="flex gap-3 pt-2">
								<button type="submit" className="btn-silver-metallic flex-1 cursor-hover" style={{ '--border-gradient': 'linear-gradient(180deg, rgba(255,255,255,0.9), rgba(0,0,0,0.35), rgba(255,255,255,0.9))', '--border-radius-before': '9999px' } as React.CSSProperties}>
									<span>Enviar Projeto</span>
								</button>
								<button type="button" onClick={toggleDemoModal} className="btn-community cursor-hover">
									<span>Cancelar</span>
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</>
	);
}
