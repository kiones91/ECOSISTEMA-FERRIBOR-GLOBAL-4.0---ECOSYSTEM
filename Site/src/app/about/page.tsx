"use client";

import { useEffect } from 'react';
import { Logo3D } from '../../components/navigation/Logo3D';

const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:5174/auth';

const values = [
	{ icon: "lucide:shield-check", title: "Qualidade Total", desc: "Controle dimensional rigoroso com tolerâncias decimais em cada peça produzida." },
	{ icon: "lucide:clock", title: "Pontualidade", desc: "Compromisso com prazos de entrega, respeitando cronogramas industriais críticos." },
	{ icon: "lucide:lightbulb", title: "Inovação", desc: "Desenvolvimento contínuo de compostos e processos para superar desafios técnicos." },
	{ icon: "lucide:users", title: "Parceria", desc: "Relacionamento próximo com cada cliente, entendendo suas necessidades específicas." },
];

const certifications = [
	{ title: "ISO 9001:2015", desc: "Sistema de Gestão da Qualidade" },
	{ title: "Laboratório Próprio", desc: "Ensaios de dureza, tração e envelhecimento" },
	{ title: "Rastreabilidade", desc: "Controle total de lotes e matérias-primas" },
];

const stats = [
	{ value: "20+", label: "Anos de experiência" },
	{ value: "5.000+", label: "Projetos entregues" },
	{ value: "4", label: "Setores industriais" },
	{ value: "6", label: "Países atendidos" },
];

export default function AboutPage() {
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
		<div className="relative w-full max-w-[1440px] min-h-screen mx-auto bg-[#F8FAF9] border-x border-t border-[#2f3136]/30 xl:border-x-[16px] xl:border-t-[16px] xl:border-[#2f3136] rounded-t-[32px] xl:rounded-t-[48px] shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col z-10 overflow-hidden">

			{/* Header */}
			<nav className="sticky top-4 mx-4 md:mx-8 z-50 flex items-center justify-between gap-4 transition-all duration-300">
				<a className="cursor-hover group flex items-center relative z-10" href="/" aria-label="Voltar para o início">
					<Logo3D />
				</a>
				<div className="glass-panel-light !overflow-visible rounded-full px-4 md:px-6 py-2 flex items-center gap-6 md:gap-8 border border-white/40 shadow-[0_8px_30px_rgba(0,0,0,0.02)] bg-white/40 backdrop-blur-xl">
					<div className="hidden md:flex items-center gap-6 lg:gap-8 text-[11px] font-bold uppercase tracking-widest text-slate-500">
						<a className="cursor-hover hover:text-red-600 transition-colors" href="/">Início</a>
						<a className="cursor-hover text-red-600 transition-colors" href="/about">A Empresa</a>
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

			{/* Hero Section */}
			<section className="relative z-10 py-16 lg:py-24 px-6 md:px-12 border-b border-slate-900/5">
				<div className="max-w-4xl mx-auto text-center reveal-item">
					<div className="inline-flex items-center gap-2 text-red-600 mb-4">
						<span className="flex h-2 w-2 rounded-full bg-red-600 animate-pulse"></span>
						<span className="text-[10px] font-bold tracking-widest uppercase text-slate-400">Sobre Nós</span>
					</div>
					<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tighter text-slate-900 mb-6">
						Mais de 20 anos<br />
						<span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-black">transformando borracha em solução.</span>
					</h1>
					<p className="text-sm md:text-base text-slate-500 max-w-2xl mx-auto leading-relaxed">
						A Ferri Indústria de Artefatos de Borracha Ltda (FerriBor) é especializada no desenvolvimento, fabricação e revestimento de peças técnicas em borracha, silicone e poliuretano para os setores de mineração, cerâmica, agronegócio e metalmecânica.
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
							Nossa <span className="text-red-600">História</span>
						</h2>
						<div className="space-y-4 text-sm text-slate-600 leading-relaxed">
							<p>
								Fundada em Santa Gertrudes, São Paulo, a FerriBor nasceu da paixão por elastômeros e da necessidade de fornecer soluções técnicas de alta precisão para a indústria brasileira.
							</p>
							<p>
								Ao longo de mais de duas décadas, investimos continuamente em tecnologia de produção, laboratório próprio de ensaios e capacitação técnica da nossa equipe, consolidando-nos como referência em artefatos de borracha industrial.
							</p>
							<p>
								Hoje, atendemos clientes em 6 países da América Latina, oferecendo desde vedações especiais até revestimentos de rolos com usinagem de precisão decimal.
							</p>
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
							Nossos <span className="text-red-600">Valores</span>
						</h2>
						<p className="text-sm text-slate-500 max-w-xl mx-auto">Os pilares que guiam cada decisão e cada peça que fabricamos.</p>
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

			{/* Certifications */}
			<section className="relative z-10 py-16 lg:py-20 px-6 md:px-12 border-b border-slate-900/5">
				<div className="max-w-5xl mx-auto">
					<div className="text-center mb-12 reveal-item">
						<h2 className="text-2xl md:text-3xl font-bold tracking-tighter text-slate-900 mb-3">
							Qualidade & <span className="text-red-600">Certificações</span>
						</h2>
						<p className="text-sm text-slate-500 max-w-xl mx-auto">Compromisso com padrões internacionais de qualidade e rastreabilidade.</p>
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
						Pronto para um <span className="text-red-600">projeto sob medida</span>?
					</h2>
					<p className="text-sm text-slate-500 mb-8 max-w-lg mx-auto">
						Entre em contato com nossa equipe técnica e receba uma solução personalizada para seu desafio industrial.
					</p>
					<div className="flex flex-wrap gap-4 items-center justify-center">
						<a href="/#contato" className="text-[11px] font-bold uppercase tracking-widest px-6 py-3 bg-slate-900 text-white rounded-full hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300">
							Solicitar Orçamento
						</a>
						<a href="https://api.whatsapp.com/send?phone=5519981748364&text=Ol%C3%A1!" target="_blank" className="text-[11px] font-bold uppercase tracking-widest px-6 py-3 border border-slate-200 text-slate-700 rounded-full hover:border-green-500 hover:text-green-600 transition-all duration-300 inline-flex items-center gap-2">
							<i className="iconify text-lg text-green-600" data-icon="lucide:message-square"></i>
							WhatsApp
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
