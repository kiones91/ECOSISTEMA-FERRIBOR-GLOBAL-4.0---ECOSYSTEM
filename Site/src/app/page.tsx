"use client";

import { useState, useEffect, useRef } from 'react';
import Script from 'next/script';
import { Logo3D } from '../components/navigation/Logo3D';
import { useI18n } from '../i18n/LanguageContext';
import { LanguageSwitcher } from '../i18n/LanguageSwitcher';

const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:5174/auth';

export default function HomePage() {

	const { t } = useI18n();


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

	// Load model-viewer web component
	useEffect(() => {
		import('@google/model-viewer').then(() => {
			if (modelViewerRef.current && !modelViewerRef.current.querySelector('model-viewer')) {
				const mv = document.createElement('model-viewer') as any;
				mv.setAttribute('src', '/models/vedacao-industrial.glb');
				mv.setAttribute('alt', 'Peça industrial FerriBor em 3D');
				mv.setAttribute('auto-rotate', '');
				mv.setAttribute('camera-controls', '');
				mv.setAttribute('shadow-intensity', '1');
				mv.setAttribute('exposure', '1.2');
				mv.style.width = '100%';
				mv.style.height = '100%';
				modelViewerRef.current.appendChild(mv);
			}
		});
	}, []);

	// 7. Hero scroll-video (pre-rendered frame sequence painted on canvas)
	const heroRef = useRef<HTMLElement>(null);
	const heroCanvasRef = useRef<HTMLCanvasElement>(null);
	const heroContentRef = useRef<HTMLDivElement>(null);
	const scrollHintRef = useRef<HTMLDivElement>(null);
	const modelViewerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const canvas = heroCanvasRef.current;
		const section = heroRef.current;
		if (!canvas || !section) return;
		const ctx = canvas.getContext("2d", { alpha: false });
		if (!ctx) return;

		const FRAME_COUNT = 192;
		const framePath = (i: number) => `/assets/video2_frames/frame_${String(i).padStart(3, "0")}.jpg`;
		const frames: HTMLImageElement[] = [];
		let ready = false;
		let targetFrac = 0;
		let currentFrac = 0;
		let raf = 0;
		const ease = 0.12;

		const sizeCanvas = () => {
			const dpr = Math.min(window.devicePixelRatio || 1, 2);
			canvas.width = Math.round(window.innerWidth * dpr);
			canvas.height = Math.round(window.innerHeight * dpr);
		};
		sizeCanvas();

		const paint = () => {
			if (!frames.length) return;
			const idx = Math.max(0, Math.min(frames.length - 1, Math.round(currentFrac * (frames.length - 1))));
			const img = frames[idx];
			if (!img || !img.complete || !img.naturalWidth) return;
			const cw = canvas.width, ch = canvas.height;
			ctx.fillStyle = "#060706";
			ctx.fillRect(0, 0, cw, ch);
			
			// robust cover aspect ratio calculation
			const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
			const dw = img.naturalWidth * scale;
			const dh = img.naturalHeight * scale;
			const dx = (cw - dw) / 2;
			const dy = (ch - dh) / 2;
			
			ctx.drawImage(img, dx, dy, dw, dh);
		};

		const updateTarget = () => {
			const scrollable = section.offsetHeight - window.innerHeight;
			const scrolled = Math.min(Math.max(-section.getBoundingClientRect().top, 0), scrollable);
			targetFrac = scrollable > 0 ? scrolled / scrollable : 0;
			const fade = Math.max(0, 1 - targetFrac / 0.45);
			if (heroContentRef.current) {
				heroContentRef.current.style.opacity = String(fade);
				heroContentRef.current.style.transform = `translateY(${(1 - fade) * -40}px)`;
			}
			if (scrollHintRef.current) scrollHintRef.current.style.opacity = String(fade * 0.7);
		};

		const onScroll = () => { updateTarget(); if (document.hidden) { currentFrac = targetFrac; paint(); } };
		const onResize = () => { sizeCanvas(); updateTarget(); paint(); };
		const onVis = () => { if (!document.hidden && ready) { updateTarget(); currentFrac = targetFrac; paint(); } };

		const loop = () => {
			if (ready) {
				updateTarget();
				currentFrac += (targetFrac - currentFrac) * ease;
				if (Math.abs(currentFrac - targetFrac) < 0.0004) currentFrac = targetFrac;
				paint();
			}
			raf = requestAnimationFrame(loop);
		};

		for (let i = 1; i <= FRAME_COUNT; i++) {
			const img = new Image();
			const done = () => {
				if (i === 1) { ready = true; updateTarget(); currentFrac = targetFrac; paint(); }
			};
			img.onload = done;
			img.onerror = done;
			img.src = framePath(i);
			frames.push(img);
		}

		window.addEventListener("scroll", onScroll, { passive: true });
		window.addEventListener("resize", onResize, { passive: true });
		document.addEventListener("visibilitychange", onVis);
		raf = requestAnimationFrame(loop);

		return () => {
			cancelAnimationFrame(raf);
			window.removeEventListener("scroll", onScroll);
			window.removeEventListener("resize", onResize);
			document.removeEventListener("visibilitychange", onVis);
		};
	}, []);

	// Status per comparison row (none = X, partial = dash) — content comes from i18n
	const comparisonStatus: ('none' | 'partial')[] = ['partial', 'none', 'partial', 'none', 'partial', 'none', 'none', 'none', 'partial', 'none'];
	const comparison = (t('comparison.rows') as { feature: string; competitor: string; ferribor: string }[]).map((row, i) => ({
		...row,
		competitorStatus: comparisonStatus[i],
	}));

	return (
		<>
			{/* Aura background overlays */}
			<div aria-hidden="true" className="aura-noise" />
			<div aria-hidden="true" className="aura-grid" />

			{/* Cinematic hero canvas — scroll-driven video frames (viewport-fixed) */}
			<div className="fixed top-0 left-0 w-screen h-screen z-0 overflow-hidden pointer-events-none">
				<canvas ref={heroCanvasRef} className="absolute inset-0 w-full h-full object-cover block" />
				{/* Dark overlay to improve text readability */}
				<div className="absolute inset-0 bg-black/50"></div>
			</div>

			{/* Fixed hero text overlay — pinned during scrub, fades out */}
			<div ref={heroContentRef} className="fixed inset-0 z-[5] flex items-center pt-24 pb-12 sm:pt-32 sm:pb-16 px-6 md:px-12 pointer-events-none">
				<div className="w-full max-w-[1440px] mx-auto">
					<div className="max-w-3xl pointer-events-auto">
						<h1 className="hero-type text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tighter text-[#f3f0e8] mb-6 font-heading">
							{t('hero.title1')}<br />
							<span className="text-outline-light">{t('hero.title2')} </span>
							<span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-300 font-extrabold">{t('hero.title3')}</span>
						</h1>
						<p className="leading-relaxed text-xs sm:text-sm md:text-base text-[#f3f0e8] max-w-2xl font-normal" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 0 20px rgba(0,0,0,0.7)' }}>
							{t('hero.paragraph')}
						</p>
					</div>
				</div>
			</div>

			{/* Scroll hint */}
			<div ref={scrollHintRef} className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[5] flex flex-col items-center gap-2 pointer-events-none text-[#f3f0e8]">
				<span className="hero-type text-[9px] font-mono uppercase tracking-[0.25em]">{t('hero.scrollHint')}</span>
				<div className="w-px h-8 bg-[#f3f0e8]/30 overflow-hidden relative">
					<div className="absolute top-0 left-0 w-full h-full bg-red-500 animate-scroll-line"></div>
				</div>
			</div>

				{/* Main Content Container with Lateral and Top Borders */}
				<div className="relative w-full max-w-[1440px] min-h-screen mx-auto border border-red-500/20 rounded-t-[32px] xl:rounded-t-[48px] shadow-none flex flex-col z-10" id="viewport-screen">
				

				{/* Header */}
				<header className="fixed top-0 left-0 right-0 z-30 mx-auto flex w-full max-w-[92rem] items-center justify-between px-4 py-3 sm:px-6 sm:py-4 lg:px-8 lg:py-5 xl:px-10">
					{/* Logo */}
					<a className="flex items-center relative z-10" href="#inicio" aria-label="Voltar para o início">
						<Logo3D />
					</a>

					{/* Center Nav Pill */}
					<nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-0.5 rounded-full border border-slate-900/[0.08] bg-slate-900/[0.03] px-2 py-1.5 text-xs font-bold uppercase tracking-[0.1em] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] backdrop-blur-xl lg:flex">
						<a className="group/nav relative overflow-hidden rounded-full px-3.5 py-1.5 transition-all duration-500 hover:text-red-600 hover:shadow-[0_0_28px_rgba(220,38,38,0.18)]" href="/">
							<span className="absolute inset-0 rounded-full bg-red-600/0 transition-all duration-500 group-hover/nav:bg-red-600/[0.07]"></span>
							<span className="absolute bottom-0 left-1/2 h-px w-0 -translate-x-1/2 bg-gradient-to-r from-transparent via-red-500 to-transparent transition-all duration-500 group-hover/nav:w-3/4"></span>
							<span className="relative">{t('nav.inicio')}</span>
						</a>
						<a className="group/nav relative overflow-hidden rounded-full px-3.5 py-1.5 transition-all duration-500 hover:text-red-600 hover:shadow-[0_0_28px_rgba(220,38,38,0.18)]" href="/about">
							<span className="absolute inset-0 rounded-full bg-red-600/0 transition-all duration-500 group-hover/nav:bg-red-600/[0.07]"></span>
							<span className="absolute bottom-0 left-1/2 h-px w-0 -translate-x-1/2 bg-gradient-to-r from-transparent via-red-500 to-transparent transition-all duration-500 group-hover/nav:w-3/4"></span>
							<span className="relative">{t('nav.empresa')}</span>
						</a>
						<a className="group/nav relative overflow-hidden rounded-full px-3.5 py-1.5 transition-all duration-500 hover:text-red-600 hover:shadow-[0_0_28px_rgba(220,38,38,0.18)]" href="/services">
							<span className="absolute inset-0 rounded-full bg-red-600/0 transition-all duration-500 group-hover/nav:bg-red-600/[0.07]"></span>
							<span className="absolute bottom-0 left-1/2 h-px w-0 -translate-x-1/2 bg-gradient-to-r from-transparent via-red-500 to-transparent transition-all duration-500 group-hover/nav:w-3/4"></span>
							<span className="relative">{t('nav.servicos')}</span>
						</a>
						<a className="group/nav relative overflow-hidden rounded-full px-3.5 py-1.5 transition-all duration-500 hover:text-red-600 hover:shadow-[0_0_28px_rgba(220,38,38,0.18)]" href="/catalog">
							<span className="absolute inset-0 rounded-full bg-red-600/0 transition-all duration-500 group-hover/nav:bg-red-600/[0.07]"></span>
							<span className="absolute bottom-0 left-1/2 h-px w-0 -translate-x-1/2 bg-gradient-to-r from-transparent via-red-500 to-transparent transition-all duration-500 group-hover/nav:w-3/4"></span>
							<span className="relative">{t('nav.catalogo')}</span>
						</a>
						<a className="group/nav relative overflow-hidden rounded-full px-3.5 py-1.5 transition-all duration-500 hover:text-red-600 hover:shadow-[0_0_28px_rgba(220,38,38,0.18)]" href="/blog">
							<span className="absolute inset-0 rounded-full bg-red-600/0 transition-all duration-500 group-hover/nav:bg-red-600/[0.07]"></span>
							<span className="absolute bottom-0 left-1/2 h-px w-0 -translate-x-1/2 bg-gradient-to-r from-transparent via-red-500 to-transparent transition-all duration-500 group-hover/nav:w-3/4"></span>
							<span className="relative">{t('nav.contato')}</span>
						</a>
					</nav>

					{/* Portal button + Language Switcher */}
					<div className="relative z-10 flex items-center gap-2 sm:gap-3">
						<LanguageSwitcher />
						<a href={DASHBOARD_URL} className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.12em] px-4 py-2 sm:px-6 sm:py-2.5 bg-white text-black rounded-full border border-white/60 shadow-[0_2px_12px_rgba(0,0,0,0.15)] hover:bg-white/20 hover:backdrop-blur-md hover:border-white/40 hover:text-red-600 transition-all duration-300 text-center inline-block">
							{t('cta.portalCliente')}
						</a>
					</div>
				</header>

				{/* HERO SCRUB SPACER — drives the fixed canvas; you scroll the whole
				    video before the content below appears. Text lives in the fixed overlay. */}
				<section ref={heroRef} id="inicio" className="relative z-10 w-full pointer-events-none" style={{ height: '360vh' }}></section>

				{/* SEGUNDA DOBRA — Catálogo 3D Showcase */}
				<section className="relative z-10 bg-black py-24 lg:py-32 px-6 md:px-12">
					<div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
						{/* Left: Copy + CTA */}
						<div className="space-y-8">
							<div className="inline-flex items-center gap-2">
								<span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
								<span className="text-xs font-bold tracking-widest uppercase text-white/60">{t('catalog3d.tag')}</span>
							</div>
							<h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-white font-heading leading-[1.05]">
								{t('catalog3d.title1')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-300">{t('catalog3d.title2')}</span>
							</h2>
							<p className="text-base md:text-lg text-white/70 leading-relaxed max-w-lg" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
								{t('catalog3d.paragraph')}
							</p>
							<a href="/catalog" className="inline-flex items-center gap-3 px-8 py-4 bg-red-600 text-white font-bold text-sm uppercase tracking-widest rounded-full hover:bg-red-500 hover:shadow-[0_0_30px_rgba(220,38,38,0.4)] transition-all duration-300">
								<span>{t('cta.explorarCatalogo')}</span>
								<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
							</a>
						</div>

						{/* Right: 3D Model Viewer */}
						<div className="relative aspect-square lg:aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 to-black border border-white/10">
							<div
								ref={modelViewerRef}
								className="w-full h-full"
							/>
							<div className="absolute bottom-4 left-4 right-4 flex justify-between items-center pointer-events-none">
								<span className="text-[10px] font-mono uppercase tracking-widest text-white/40">{t('catalog3d.drag')}</span>
								<span className="text-[10px] font-mono uppercase tracking-widest text-white/40">360°</span>
							</div>
						</div>
					</div>
				</section>

				{/* Divisor costura de solda */}
				<div aria-hidden="true" className="weld-seam"></div>

				{/* TERCEIRA DOBRA — Números que Falam */}
				<section className="relative z-10 bg-black py-28 lg:py-36 px-6 md:px-12">
					<div className="max-w-6xl mx-auto text-center mb-16">
						<h2 className="text-3xl md:text-4xl font-bold tracking-tighter text-white font-heading mb-4">
							{t('stats.title1')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-300">{t('stats.title2')}</span>
						</h2>
						<p className="text-white/50 text-sm max-w-md mx-auto">{t('stats.subtitle')}</p>
					</div>
					<div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
						<div className="text-center space-y-3">
							<span className="text-5xl md:text-6xl font-bold text-white font-heading">±0.05</span>
							<span className="text-red-500 text-2xl font-bold">mm</span>
							<p className="text-white/50 text-xs uppercase tracking-widest">{t('stats.items')[0].label}</p>
						</div>
						<div className="text-center space-y-3">
							<span className="text-5xl md:text-6xl font-bold text-white font-heading">12<span className="text-red-500">+</span></span>
							<p className="text-white/50 text-xs uppercase tracking-widest">{t('stats.items')[1].label}</p>
						</div>
						<div className="text-center space-y-3">
							<span className="text-5xl md:text-6xl font-bold text-white font-heading">6</span>
							<p className="text-white/50 text-xs uppercase tracking-widest">{t('stats.items')[2].label}</p>
						</div>
						<div className="text-center space-y-3">
							<span className="text-5xl md:text-6xl font-bold text-white font-heading">250<span className="text-red-500">°C</span></span>
							<p className="text-white/50 text-xs uppercase tracking-widest">{t('stats.items')[3].label}</p>
						</div>
					</div>
				</section>

				{/* Divisor costura de solda */}
				<div aria-hidden="true" className="weld-seam weld-delay-1"></div>

				{/* QUARTA DOBRA — Por que Engenheiros escolhem a FerriBor */}
				<section className="relative z-10 bg-[#0a0a0c] py-28 lg:py-36 px-6 md:px-12">
					<div className="max-w-6xl mx-auto">
						<div className="text-center mb-16 space-y-4">
							<span className="text-xs font-bold tracking-widest uppercase text-red-500/80">{t('why.tag')}</span>
							<h2 className="text-3xl md:text-5xl font-bold tracking-tighter text-white font-heading">
								{t('why.title1')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-300">{t('why.title2')}</span>
							</h2>
							<p className="text-white/50 text-sm max-w-xl mx-auto">{t('why.subtitle')}</p>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{/* Card 1 */}
							<div className="group p-8 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-red-500/20 transition-all duration-500">
								<div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-5">
									<svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" /></svg>
								</div>
								<h3 className="text-lg font-bold text-white mb-2">{t('why.cards')[0].title}</h3>
								<p className="text-white/50 text-sm leading-relaxed">{t('why.cards')[0].desc}</p>
							</div>

							{/* Card 2 */}
							<div className="group p-8 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-red-500/20 transition-all duration-500">
								<div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-5">
									<svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
								</div>
								<h3 className="text-lg font-bold text-white mb-2">{t('why.cards')[1].title}</h3>
								<p className="text-white/50 text-sm leading-relaxed">{t('why.cards')[1].desc}</p>
							</div>

							{/* Card 3 */}
							<div className="group p-8 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-red-500/20 transition-all duration-500">
								<div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-5">
									<svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" /></svg>
								</div>
								<h3 className="text-lg font-bold text-white mb-2">{t('why.cards')[2].title}</h3>
								<p className="text-white/50 text-sm leading-relaxed">{t('why.cards')[2].desc}</p>
							</div>

							{/* Card 4 */}
							<div className="group p-8 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-red-500/20 transition-all duration-500">
								<div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-5">
									<svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" /></svg>
								</div>
								<h3 className="text-lg font-bold text-white mb-2">{t('why.cards')[3].title}</h3>
								<p className="text-white/50 text-sm leading-relaxed">{t('why.cards')[3].desc}</p>
							</div>

							{/* Card 5 */}
							<div className="group p-8 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-red-500/20 transition-all duration-500">
								<div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-5">
									<svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z" /></svg>
								</div>
								<h3 className="text-lg font-bold text-white mb-2">{t('why.cards')[4].title}</h3>
								<p className="text-white/50 text-sm leading-relaxed">{t('why.cards')[4].desc}</p>
							</div>

							{/* Card 6 */}
							<div className="group p-8 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-red-500/20 transition-all duration-500">
								<div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-5">
									<svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" /></svg>
								</div>
								<h3 className="text-lg font-bold text-white mb-2">{t('why.cards')[5].title}</h3>
								<p className="text-white/50 text-sm leading-relaxed">{t('why.cards')[5].desc}</p>
							</div>
						</div>

						{/* CTA Final */}
						<div className="text-center mt-16">
							<a href="/contact" className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-bold text-sm uppercase tracking-widest rounded-full hover:bg-red-500 hover:text-white hover:shadow-[0_0_30px_rgba(220,38,38,0.3)] transition-all duration-300">
								<span>{t('cta.solicitarOrcamento')}</span>
								<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
							</a>
						</div>
					</div>
				</section>

				{/* Divisor costura de solda */}
				<div aria-hidden="true" className="weld-seam weld-delay-2"></div>

				{/* QUINTA DOBRA — Comparativo Tecnológico vs Concorrência */}
				<section className="relative z-10 bg-black py-28 lg:py-36 px-6 md:px-12 overflow-hidden">
					{/* Glow ambiental */}
					<div aria-hidden="true" className="pointer-events-none absolute top-1/4 right-0 w-[40rem] h-[40rem] bg-red-600/10 rounded-full blur-[120px]"></div>

					<div className="max-w-6xl mx-auto relative">
						{/* Cabeçalho */}
						<div className="text-center mb-16 space-y-4 reveal-item">
							<div className="inline-flex items-center gap-2 justify-center">
								<span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
								<span className="text-xs font-bold tracking-widest uppercase text-red-500/80">{t('comparison.tag')}</span>
							</div>
							<h2 className="text-3xl md:text-5xl font-bold tracking-tighter text-white font-heading">
								{t('comparison.title1')} <span className="text-outline-light">{t('comparison.title2')}</span><br />
								{t('comparison.title3')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-300">{t('comparison.title4')}</span>
							</h2>
							<p className="text-white/50 text-sm max-w-2xl mx-auto leading-relaxed">
								{t('comparison.subtitle')}
							</p>
						</div>

						{/* Tabela comparativa */}
						<div className="reveal-item rounded-3xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm overflow-hidden">
							{/* Linha de cabeçalho das colunas */}
							<div className="grid grid-cols-[1.1fr_1fr_1.3fr] md:grid-cols-[1.3fr_1fr_1.4fr] border-b border-white/[0.08]">
								<div className="p-4 md:p-6 flex items-end">
									<span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-white/40">{t('comparison.colCriterio')}</span>
								</div>
								<div className="p-4 md:p-6 border-l border-white/[0.06] flex flex-col gap-1">
									<span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-white/40">{t('comparison.colConcorrencia')}</span>
									<span className="text-[9px] text-white/25 hidden md:block">{t('comparison.colConcorrenciaSub')}</span>
								</div>
								<div className="relative p-4 md:p-6 border-l border-red-500/30 bg-gradient-to-b from-red-600/15 to-transparent flex flex-col gap-1">
									<span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500 to-transparent"></span>
									<span className="text-[10px] md:text-xs font-extrabold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-200">{t('comparison.colFerribor')}</span>
									<span className="text-[9px] text-red-300/40 hidden md:block">{t('comparison.colFerriborSub')}</span>
								</div>
							</div>

							{/* Linhas de dados */}
							{comparison.map((row, i) => (
								<div
									key={row.feature}
									className={`grid grid-cols-[1.1fr_1fr_1.3fr] md:grid-cols-[1.3fr_1fr_1.4fr] items-stretch transition-colors duration-300 hover:bg-white/[0.02] ${i !== comparison.length - 1 ? 'border-b border-white/[0.05]' : ''}`}
								>
									{/* Critério */}
									<div className="p-4 md:p-6 flex items-center">
										<span className="text-xs md:text-sm font-bold text-white/90 leading-snug">{row.feature}</span>
									</div>

									{/* Concorrência */}
									<div className="p-4 md:p-6 border-l border-white/[0.05] flex items-center gap-2.5">
										<svg className="w-4 h-4 flex-shrink-0 text-white/25" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
											{row.competitorStatus === 'none'
												? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
												: <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />}
										</svg>
										<span className="text-[11px] md:text-xs text-white/40 leading-snug">{row.competitor}</span>
									</div>

									{/* FerriBor */}
									<div className="relative p-4 md:p-6 border-l border-red-500/20 bg-gradient-to-r from-red-600/[0.06] to-transparent flex items-center gap-2.5">
										<span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center">
											<svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
											</svg>
										</span>
										<span className="text-[11px] md:text-xs font-medium text-white/85 leading-snug">{row.ferribor}</span>
									</div>
								</div>
							))}
						</div>

						{/* Faixa de impacto */}
						<div className="grid grid-cols-1 sm:grid-cols-3 gap-px mt-px rounded-3xl overflow-hidden border border-white/[0.08] mt-6 reveal-item">
							<div className="bg-white/[0.02] p-6 text-center">
								<span className="block text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-300 font-heading">{t('comparison.impact')[0].value}</span>
								<span className="text-[11px] text-white/40 uppercase tracking-widest">{t('comparison.impact')[0].label}</span>
							</div>
							<div className="bg-white/[0.02] p-6 text-center border-y sm:border-y-0 sm:border-x border-white/[0.06]">
								<span className="block text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-300 font-heading">{t('comparison.impact')[1].value}</span>
								<span className="text-[11px] text-white/40 uppercase tracking-widest">{t('comparison.impact')[1].label}</span>
							</div>
							<div className="bg-white/[0.02] p-6 text-center">
								<span className="block text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-300 font-heading">{t('comparison.impact')[2].value}</span>
								<span className="text-[11px] text-white/40 uppercase tracking-widest">{t('comparison.impact')[2].label}</span>
							</div>
						</div>

						{/* CTA */}
						<div className="text-center mt-14 reveal-item">
							<a href="/contact" className="inline-flex items-center gap-3 px-8 py-4 bg-red-600 text-white font-bold text-sm uppercase tracking-widest rounded-full hover:bg-red-500 hover:shadow-[0_0_30px_rgba(220,38,38,0.4)] transition-all duration-300">
								<span>{t('cta.experimentarEcossistema')}</span>
								<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
							</a>
						</div>
					</div>
				</section>

				{/* FOOTER */}
				<footer
					className="relative mt-auto border-t border-slate-900/10 text-slate-800 py-16 px-6 md:px-12 z-10 overflow-hidden"
					style={{
						backgroundColor: '#F8FAF9',
						backgroundImage:
							'radial-gradient(circle at 50% 0%, rgba(220,38,38,0.06), transparent 45%), linear-gradient(rgba(15,23,42,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.04) 1px, transparent 1px)',
						backgroundSize: '100% 100%, 80px 80px, 80px 80px',
					}}
				>
					{/* LED beams traveling along the grid lines */}
					<div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
						{/* Black LEDs descending the vertical lines */}
						<div className="footer-led-v" style={{ left: '80px', animationDelay: '0s' }} />
						<div className="footer-led-v" style={{ left: '160px', animationDelay: '1.4s' }} />
						<div className="footer-led-v" style={{ left: '240px', animationDelay: '2.6s' }} />
						<div className="footer-led-v" style={{ left: '400px', animationDelay: '0.8s' }} />
						<div className="footer-led-v" style={{ left: '560px', animationDelay: '2s' }} />
						<div className="footer-led-v" style={{ left: '720px', animationDelay: '3.2s' }} />
						<div className="footer-led-v" style={{ left: '880px', animationDelay: '1.1s' }} />
						{/* Red LED sweeping the horizontal top line */}
						<div className="footer-led-h" style={{ top: '0px', animationDelay: '0s' }} />
						<div className="footer-led-h" style={{ top: '0px', animationDelay: '2.5s' }} />
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 max-w-6xl mx-auto mb-12 relative z-10">
						{/* Col 1: Site Map */}
						<div className="space-y-4">
							<h4 className="font-heading text-sm font-bold uppercase tracking-widest text-slate-950">{t('footer.mapaTitle')}</h4>
							<ul className="space-y-2.5 text-sm text-slate-800 font-medium">
								<li><a className="hover:text-red-600 transition-colors cursor-hover" href="#inicio">{t('footer.mapa.home')}</a></li>
								<li><a className="hover:text-red-600 transition-colors cursor-hover" href="#aempresa">{t('footer.mapa.empresa')}</a></li>
								<li><a className="hover:text-red-600 transition-colors cursor-hover" href="#servicos">{t('footer.mapa.servicos')}</a></li>
								<li><a className="hover:text-red-600 transition-colors cursor-hover" href="#depoimentos">{t('footer.mapa.depoimentos')}</a></li>
								<li><a className="hover:text-red-600 transition-colors cursor-hover" href="#noticias">{t('footer.mapa.noticias')}</a></li>
								<li><a className="hover:text-red-600 transition-colors cursor-hover" href="#contato">{t('footer.mapa.contato')}</a></li>
								<li><a className="hover:text-red-600 transition-colors cursor-hover" href="/politica-privacidade.pdf" target="_blank">{t('footer.mapa.privacidade')}</a></li>
							</ul>
						</div>

						{/* Col 2: Contacts */}
						<div className="space-y-4">
							<h4 className="font-heading text-sm font-bold uppercase tracking-widest text-slate-950">{t('footer.contatoTitle')}</h4>
							<ul className="space-y-3.5 text-sm text-slate-800 leading-normal">
								<li className="flex gap-2">
									<i className="iconify text-lg text-red-500 flex-shrink-0 mt-0.5" data-icon="lucide:map-pin"></i>
									<span>{t('footer.endereco')}</span>
								</li>
								<li className="flex gap-2 items-center">
									<i className="iconify text-lg text-red-500" data-icon="lucide:phone"></i>
									<a href="tel:+5519981748364" className="hover:text-red-600 cursor-hover">(19) 98174-8364</a>
								</li>
								<li className="flex gap-2 items-center">
									<i className="iconify text-lg text-green-500" data-icon="lucide:message-square"></i>
									<a href="https://api.whatsapp.com/send?phone=5519981748364&text=Ol%C3%A1!" target="_blank" className="hover:text-red-600 cursor-hover">(19) 98174-8364</a>
								</li>
								<li className="flex gap-2 items-center">
									<i className="iconify text-lg text-red-500" data-icon="lucide:mail"></i>
									<a href="mailto:comercial@ferribor.com.br" className="hover:text-red-600 cursor-hover">comercial@ferribor.com.br</a>
								</li>
							</ul>

							{/* Redes Sociais */}
							<div className="flex items-center gap-3 pt-2">
								<a href="https://www.facebook.com/FerriborArtefatosDeBorracha" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-9 h-9 rounded-full bg-slate-900/[0.04] border border-slate-900/10 flex items-center justify-center text-slate-700 hover:text-white hover:bg-blue-600 hover:border-blue-600 transition-all duration-300 cursor-hover">
									<i className="iconify text-lg" data-icon="lucide:facebook"></i>
								</a>
								<a href="https://www.instagram.com/ferribor_borrachas" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-9 h-9 rounded-full bg-slate-900/[0.04] border border-slate-900/10 flex items-center justify-center text-slate-700 hover:text-white hover:bg-gradient-to-br hover:from-purple-600 hover:via-pink-600 hover:to-orange-500 hover:border-transparent transition-all duration-300 cursor-hover">
									<i className="iconify text-lg" data-icon="lucide:instagram"></i>
								</a>
							</div>
						</div>
					</div>

					{/* Bottom credits bar */}
					<div className="relative z-10 border-t border-slate-900/10 pt-8 text-center max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 font-mono gap-4">
						<span>Copyright &copy; FerriBor 2026. Todos os direitos reservados.</span>
						<span>
							Desenvolvido por{' '}
							<a href="https://buffallos.com.br" target="_blank" className="hover:text-red-600 underline cursor-hover">
								Buffallos Tecnologia
							</a>
						</span>
					</div>
				</footer>
			</div>

			{/* WEBCHAT WIDGET - CRM */}
			<Script
				src="https://app.ferribor.com.br/webchat-widget.js"
				data-widget-id="ferribor-site"
				strategy="lazyOnload"
			/>


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
							<span className="text-xs font-bold tracking-widest uppercase text-slate-500 font-heading">{t('quoteModal.tag')}</span>
						</div>

						<h3 className="text-2xl font-bold tracking-tight text-slate-900 mb-2 font-heading">{t('quoteModal.title')}</h3>
						<p className="text-xs text-slate-500 mb-6 leading-relaxed">{t('quoteModal.subtitle')}</p>

						<form className="space-y-5" onSubmit={(e) => { e.preventDefault(); closeQuoteModal(); setIsSuccessModalOpen(true); }}>
							<div className="input-group">
								<input type="text" placeholder=" " id="input-modal-name" required />
								<label htmlFor="input-modal-name">{t('quoteModal.nome')}</label>
							</div>

							<div className="input-group">
								<input type="text" placeholder=" " id="input-modal-empresa" required />
								<label htmlFor="input-modal-empresa">{t('quoteModal.empresa')}</label>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div className="input-group">
									<input type="email" placeholder=" " id="input-modal-email" required />
									<label htmlFor="input-modal-email">{t('quoteModal.email')}</label>
								</div>
								<div className="input-group">
									<input type="tel" placeholder=" " id="input-modal-phone" required />
									<label htmlFor="input-modal-phone">{t('quoteModal.telefone')}</label>
								</div>
							</div>

							<div className="flex flex-col gap-1">
								<label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider" htmlFor="input-modal-service">{t('quoteModal.servico')}</label>
								<select
									id="input-modal-service"
									value={selectedService}
									onChange={(e) => setSelectedService(e.target.value)}
									className="w-full bg-transparent border-b border-slate-300 py-2.5 text-xs text-slate-800 focus:border-red-600 outline-none"
								>
									{(t('services.items') as { title: string }[]).map((s, i) => (
										<option key={i} value={s.title}>{s.title}</option>
									))}
								</select>
							</div>

							<div className="input-group">
								<textarea className="w-full bg-transparent border-none border-b border-slate-300 outline-none p-2 text-xs focus:border-red-600 transition-colors" placeholder={t('quoteModal.spec')} id="input-modal-spec" required rows={2}></textarea>
							</div>

							<div className="border-2 border-dashed border-slate-900/10 rounded-2xl p-4 text-center cursor-hover hover:border-red-600/30 transition-colors">
								<i className="iconify text-2xl text-slate-400 mx-auto mb-1.5" data-icon="lucide:upload-cloud"></i>
								<span className="text-xs font-bold text-slate-700 block mb-0.5">{t('quoteModal.uploadTitle')}</span>
								<span className="text-[9px] text-slate-400">{t('quoteModal.uploadSub')}</span>
							</div>

							<div className="flex gap-3 pt-2">
								<button type="submit" className="btn-silver-metallic flex-1 cursor-hover" style={{ '--border-gradient': 'linear-gradient(180deg, rgba(255,255,255,0.9), rgba(0,0,0,0.35), rgba(255,255,255,0.9))', '--border-radius-before': '9999px' } as React.CSSProperties}>
									<span>{t('quoteModal.enviar')}</span>
								</button>
								<button type="button" onClick={closeQuoteModal} className="btn-community cursor-hover">
									<span>{t('quoteModal.cancelar')}</span>
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
						<h3 className="text-xl font-bold text-slate-950 mb-2 font-heading">{t('success.title')}</h3>
						<p className="text-slate-500 text-xs leading-relaxed mb-6">
							{t('success.message')}
						</p>
						<button
							onClick={() => setIsSuccessModalOpen(false)}
							className="px-8 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-green-600 hover:shadow-md transition-all duration-300 cursor-hover"
						>
							{t('success.fechar')}
						</button>
					</div>
				</div>
			)}
		</>
	);
}
