"use client";

import { useEffect } from 'react';
import { Logo3D } from '../../components/navigation/Logo3D';
import { useI18n } from '../../i18n/LanguageContext';
import { LanguageSwitcher } from '../../i18n/LanguageSwitcher';

const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:5174/auth';

const valueIcons = ["lucide:shield-check", "lucide:clock", "lucide:lightbulb", "lucide:users"];

export default function AboutPage() {
	const { t } = useI18n();

	const values = (t('about.values') as { title: string; desc: string }[]).map((v, i) => ({ ...v, icon: valueIcons[i] }));
	const certifications = t('about.certifications') as { title: string; desc: string }[];
	const stats = t('about.stats') as { value: string; label: string }[];

	useEffect(() => {
		const reveals = document.querySelectorAll('.reveal-item');
		const observer = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) entry.target.classList.add('active');
			});
		}, { threshold: 0.1 });
		reveals.forEach((el) => observer.observe(el));
		return () => observer.disconnect();
	}, []);

	return (
		<div className="relative w-full max-w-[1440px] min-h-screen mx-auto bg-white/80 backdrop-blur-sm border border-red-500/20 rounded-t-[32px] xl:rounded-t-[48px] shadow-[0_0_20px_rgba(220,38,38,0.08),0_0_60px_rgba(220,38,38,0.03)] flex flex-col z-10 overflow-hidden">

			{/* Header */}
			<nav className="sticky top-4 mx-4 md:mx-8 z-50 flex items-center justify-between gap-4 transition-all duration-300">
				<a className="cursor-hover group flex items-center relative z-10" href="/" aria-label="Voltar para o início">
					<Logo3D />
				</a>
				<div className="glass-panel-light !overflow-visible rounded-full px-4 md:px-6 py-2 flex items-center gap-6 md:gap-8 border border-white/40 shadow-[0_8px_30px_rgba(0,0,0,0.02)] bg-white/40 backdrop-blur-xl">
					<div className="hidden md:flex items-center gap-6 lg:gap-8 text-[11px] font-bold uppercase tracking-widest text-slate-500">
						<a className="cursor-hover hover:text-red-600 transition-colors" href="/">{t('nav.inicio')}</a>
						<a className="cursor-hover text-red-600 transition-colors" href="/about">{t('nav.empresa')}</a>
						<a className="cursor-hover hover:text-red-600 transition-colors" href="/services">{t('nav.servicos')}</a>
						<a className="cursor-hover hover:text-red-600 transition-colors" href="/catalog">{t('nav.catalogo')}</a>
						<a className="cursor-hover hover:text-red-600 transition-colors" href="/blog">{t('nav.blog')}</a>
						<a className="cursor-hover hover:text-red-600 transition-colors" href="/contact">{t('nav.contato')}</a>
					</div>
					<div className="flex items-center gap-3">
						<LanguageSwitcher />
						<a href={DASHBOARD_URL} className="cursor-hover text-[10px] font-bold uppercase tracking-widest px-5 py-2.5 bg-white text-black rounded-full border border-white/60 hover:bg-white/20 hover:backdrop-blur-md hover:border-white/40 hover:text-red-600 transition-all duration-300 text-center inline-block">
							{t('cta.portalCliente')}
						</a>
					</div>
				</div>
			</nav>

			{/* Hero Section */}
			<section className="relative z-10 py-16 lg:py-24 px-6 md:px-12 border-b border-slate-900/5">
				<div className="max-w-4xl mx-auto text-center reveal-item">
					<div className="inline-flex items-center gap-2 text-red-600 mb-4">
						<span className="flex h-2 w-2 rounded-full bg-red-600 animate-pulse"></span>
						<span className="text-[10px] font-bold tracking-widest uppercase text-slate-400">{t('about.tag')}</span>
					</div>
					<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tighter text-slate-900 mb-6">
						{t('about.heroTitle1')}<br />
						<span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-black">{t('about.heroTitle2')}</span>
					</h1>
					<p className="text-sm md:text-base text-slate-500 max-w-2xl mx-auto leading-relaxed">
						{t('about.heroParagraph')}
					</p>
				</div>
			</section>

			{/* Stats */}
			<section className="relative z-10 py-12 px-6 md:px-12 border-b border-slate-900/5">
				<div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
					{stats.map((stat, i) => (
						<div key={i} className="glass-panel-light rounded-2xl p-6 text-center border border-white/40 bg-white/40 backdrop-blur-xl reveal-item" style={{ animationDelay: `${i * 0.1}s` }}>
							<span className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tighter">{stat.value}</span>
							<p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-2">{stat.label}</p>
						</div>
					))}
				</div>
			</section>

			{/* History */}
			<section className="relative z-10 py-16 lg:py-20 px-6 md:px-12 border-b border-slate-900/5">
				<div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
					<div className="reveal-item">
						<h2 className="text-2xl md:text-3xl font-bold tracking-tighter text-slate-900 mb-6">
							{t('about.historyTitle1')} <span className="text-red-600">{t('about.historyTitle2')}</span>
						</h2>
						<div className="space-y-4 text-sm text-slate-600 leading-relaxed">
							<p>{t('about.historyP1')}</p>
							<p>{t('about.historyP2')}</p>
							<p>{t('about.historyP3')}</p>
						</div>
					</div>
					<div className="reveal-item" style={{ animationDelay: '0.15s' }}>
						<div className="glass-panel-light rounded-2xl p-8 border border-white/40 bg-white/40 backdrop-blur-xl">
							<div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
								<img
									src="/assets/imagens/logo-3d.png"
									alt="FerriBor - Fábrica"
									className="w-2/3 h-auto object-contain"
								/>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Values */}
			<section className="relative z-10 py-16 lg:py-20 px-6 md:px-12 border-b border-slate-900/5">
				<div className="max-w-5xl mx-auto">
					<div className="text-center mb-12 reveal-item">
						<h2 className="text-2xl md:text-3xl font-bold tracking-tighter text-slate-900 mb-3">
							{t('about.valuesTitle1')} <span className="text-red-600">{t('about.valuesTitle2')}</span>
						</h2>
						<p className="text-sm text-slate-500 max-w-xl mx-auto">{t('about.valuesSubtitle')}</p>
					</div>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
						{values.map((v, i) => (
							<div key={i} className="glass-panel-light rounded-2xl p-6 border border-white/40 bg-white/40 backdrop-blur-xl reveal-item hover:border-red-500/25 transition-all" style={{ animationDelay: `${i * 0.1}s` }}>
								<div className="w-10 h-10 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-600 mb-4">
									<i className="iconify text-lg" data-icon={v.icon}></i>
								</div>
								<h3 className="text-sm font-bold text-slate-900 mb-2">{v.title}</h3>
								<p className="text-xs text-slate-500 leading-relaxed">{v.desc}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Mission & Vision */}
			<section className="relative z-10 py-16 lg:py-20 px-6 md:px-12 border-b border-slate-900/5">
				<div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
					<div className="glass-panel-light rounded-2xl p-8 border border-white/40 bg-white/40 backdrop-blur-xl reveal-item">
						<div className="w-10 h-10 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-600 mb-4">
							<i className="iconify text-lg" data-icon="lucide:target"></i>
						</div>
						<h3 className="text-lg font-bold text-slate-900 mb-3">{t('about.missionTitle')}</h3>
						<p className="text-sm text-slate-600 leading-relaxed">
							{t('about.missionText')}
						</p>
					</div>
					<div className="glass-panel-light rounded-2xl p-8 border border-white/40 bg-white/40 backdrop-blur-xl reveal-item" style={{ animationDelay: '0.1s' }}>
						<div className="w-10 h-10 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-600 mb-4">
							<i className="iconify text-lg" data-icon="lucide:eye"></i>
						</div>
						<h3 className="text-lg font-bold text-slate-900 mb-3">{t('about.visionTitle')}</h3>
						<p className="text-sm text-slate-600 leading-relaxed">
							{t('about.visionText')}
						</p>
					</div>
				</div>
			</section>

			{/* Certifications */}
			<section className="relative z-10 py-16 lg:py-20 px-6 md:px-12 border-b border-slate-900/5">
				<div className="max-w-5xl mx-auto">
					<div className="text-center mb-12 reveal-item">
						<h2 className="text-2xl md:text-3xl font-bold tracking-tighter text-slate-900 mb-3">
							{t('about.certTitle1')} <span className="text-red-600">{t('about.certTitle2')}</span>
						</h2>
						<p className="text-sm text-slate-500 max-w-xl mx-auto">{t('about.certSubtitle')}</p>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{certifications.map((cert, i) => (
							<div key={i} className="bg-white border border-slate-900/5 rounded-2xl p-6 shadow-sm reveal-item" style={{ animationDelay: `${i * 0.1}s` }}>
								<div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 mb-4">
									<i className="iconify text-lg" data-icon="lucide:award"></i>
								</div>
								<h3 className="text-sm font-bold text-slate-900 mb-1">{cert.title}</h3>
								<p className="text-xs text-slate-500">{cert.desc}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* CTA */}
			<section className="relative z-10 py-16 lg:py-20 px-6 md:px-12">
				<div className="max-w-3xl mx-auto text-center reveal-item">
					<h2 className="text-2xl md:text-3xl font-bold tracking-tighter text-slate-900 mb-4">
						{t('about.ctaTitle1')} <span className="text-red-600">{t('about.ctaTitle2')}</span>?
					</h2>
					<p className="text-sm text-slate-500 mb-8 max-w-lg mx-auto">
						{t('about.ctaParagraph')}
					</p>
					<div className="flex flex-wrap gap-4 items-center justify-center">
						<a href="/#contato" className="text-[11px] font-bold uppercase tracking-widest px-6 py-3 bg-slate-900 text-white rounded-full hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300">
							{t('about.ctaOrcamento')}
						</a>
						<a href="https://api.whatsapp.com/send?phone=5519981748364&text=Ol%C3%A1!" target="_blank" className="text-[11px] font-bold uppercase tracking-widest px-6 py-3 border border-slate-200 text-slate-700 rounded-full hover:border-green-500 hover:text-green-600 transition-all duration-300 inline-flex items-center gap-2">
							<i className="iconify text-lg text-green-600" data-icon="lucide:message-square"></i>
							{t('about.ctaWhatsapp')}
						</a>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="relative mt-auto border-t border-slate-900/5 bg-slate-950 text-white py-16 px-6 md:px-12 z-10 overflow-hidden">
				<div className="grid grid-cols-1 md:grid-cols-12 gap-8 max-w-6xl mx-auto mb-12 relative z-10">
					<div className="md:col-span-5 space-y-4">
						<div className="flex items-center">
							<div className="h-20 w-64 relative flex items-center justify-center -ml-4">
								<img src="/assets/imagens/logo.png" alt="Ferribor Logo" className="w-full h-full object-contain scale-[1.3]" />
							</div>
						</div>
						<p className="text-slate-400 text-xs leading-relaxed max-w-sm">
							A Ferri Indústria de Artefatos de Borracha Ltda-ME é especializada no desenvolvimento, fabricação e revestimento de peças técnicas em borracha, silicone e poliuretano.
						</p>
					</div>
					<div className="md:col-span-3 space-y-4">
						<h4 className="text-xs font-bold uppercase tracking-widest text-slate-200">Mapa do Site</h4>
						<ul className="space-y-2 text-xs text-slate-400 font-medium">
							<li><a className="hover:text-white transition-colors" href="/">Home</a></li>
							<li><a className="hover:text-white transition-colors" href="/about">Empresa</a></li>
							<li><a className="hover:text-white transition-colors" href="/#servicos">Serviços</a></li>
							<li><a className="hover:text-white transition-colors" href="/#contato">Contato</a></li>
						</ul>
					</div>
					<div className="md:col-span-4 space-y-4">
						<h4 className="text-xs font-bold uppercase tracking-widest text-slate-200">Contato</h4>
						<ul className="space-y-3.5 text-xs text-slate-400 leading-normal">
							<li className="flex gap-2">
								<i className="iconify text-md text-red-500 flex-shrink-0 mt-0.5" data-icon="lucide:map-pin"></i>
								<span>Rua Aurea Basso Baptista, 36 - Jardim D&apos;itália, Santa Gertrudes - SP</span>
							</li>
							<li className="flex gap-2 items-center">
								<i className="iconify text-md text-red-500" data-icon="lucide:phone"></i>
								<a href="tel:+5519981748364" className="hover:text-white">(19) 98174-8364</a>
							</li>
							<li className="flex gap-2 items-center">
								<i className="iconify text-md text-red-500" data-icon="lucide:mail"></i>
								<a href="mailto:comercial@ferribor.com.br" className="hover:text-white">comercial@ferribor.com.br</a>
							</li>
						</ul>
					</div>
				</div>
				<div className="relative z-10 border-t border-white/5 pt-8 text-center max-w-6xl mx-auto text-[11px] text-slate-500 font-mono">
					<span>Copyright &copy; 2026 FerriBor. Todos os direitos reservados.</span>
				</div>
			</footer>
		</div>
	);
}
