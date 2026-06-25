"use client";

import { useState, useEffect } from 'react';
import { Logo3D } from '../../components/navigation/Logo3D';

const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:5174/auth';

export default function ContactPage() {
	const [formData, setFormData] = useState({ name: '', email: '', phone: '', company: '', sector: '', message: '' });
	const [submitted, setSubmitted] = useState(false);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setSubmitted(true);
	};

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
						<a className="cursor-hover hover:text-red-600 transition-colors" href="/about">A Empresa</a>
						<a className="cursor-hover hover:text-red-600 transition-colors" href="/services">Serviços</a>
						<a className="cursor-hover hover:text-red-600 transition-colors" href="/catalog">Catálogo</a>
						<a className="cursor-hover hover:text-red-600 transition-colors" href="/blog">Blog</a>
						<a className="cursor-hover text-red-600 transition-colors" href="/contact">Contato</a>
					</div>
					<div>
						<a href={DASHBOARD_URL} className="cursor-hover text-[10px] font-bold uppercase tracking-widest px-5 py-2.5 bg-slate-900 text-white rounded-full hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300 text-center inline-block">
							Portal do Cliente
						</a>
					</div>
				</div>
			</nav>

			{/* Hero */}
			<section className="relative z-10 py-16 lg:py-20 px-6 md:px-12 border-b border-slate-900/5">
				<div className="max-w-4xl mx-auto text-center reveal-item">
					<div className="inline-flex items-center gap-2 text-red-600 mb-4">
						<span className="flex h-2 w-2 rounded-full bg-red-600 animate-pulse"></span>
						<span className="text-[10px] font-bold tracking-widest uppercase text-slate-400">Fale Conosco</span>
					</div>
					<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tighter text-slate-900 mb-6">
						Vamos conversar sobre<br />
						<span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-black">seu próximo projeto.</span>
					</h1>
					<p className="text-sm md:text-base text-slate-500 max-w-2xl mx-auto leading-relaxed">
						Nossa equipe técnica está pronta para analisar seu projeto e oferecer a melhor solução em elastômeros industriais. Retornamos em até 24 horas úteis.
					</p>
				</div>
			</section>

			{/* Contact Content */}
			<section className="relative z-10 py-16 lg:py-20 px-6 md:px-12">
				<div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">

					{/* Form */}
					<div className="lg:col-span-7 reveal-item">
						{submitted ? (
							<div className="glass-panel-light rounded-2xl p-12 border border-white/40 bg-white/40 backdrop-blur-xl text-center">
								<div className="w-16 h-16 rounded-full bg-green-50 border border-green-200 flex items-center justify-center text-green-600 mx-auto mb-6">
									<i className="iconify text-2xl" data-icon="lucide:check"></i>
								</div>
								<h2 className="text-xl font-bold text-slate-900 mb-2">Mensagem enviada!</h2>
								<p className="text-sm text-slate-500 mb-6">Nossa equipe retornará em até 24 horas úteis.</p>
								<button onClick={() => setSubmitted(false)} className="text-[11px] font-bold uppercase tracking-widest px-5 py-2.5 border border-slate-200 text-slate-700 rounded-full hover:border-red-500 hover:text-red-600 transition-all">
									Enviar outra mensagem
								</button>
							</div>
						) : (
							<form onSubmit={handleSubmit} className="glass-panel-light rounded-2xl p-8 border border-white/40 bg-white/40 backdrop-blur-xl space-y-5">
								<h2 className="text-lg font-bold text-slate-900 mb-2">Solicite um orçamento</h2>
								<p className="text-xs text-slate-500 mb-6">Preencha os campos abaixo e nossa equipe entrará em contato.</p>

								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<div>
										<label htmlFor="name" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block">Nome completo *</label>
										<input id="name" name="name" type="text" required value={formData.name} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition" placeholder="Seu nome" />
									</div>
									<div>
										<label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block">E-mail *</label>
										<input id="email" name="email" type="email" required value={formData.email} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition" placeholder="voce@empresa.com" />
									</div>
								</div>

								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<div>
										<label htmlFor="phone" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block">Telefone / WhatsApp *</label>
										<input id="phone" name="phone" type="tel" required value={formData.phone} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition" placeholder="(00) 00000-0000" />
									</div>
									<div>
										<label htmlFor="company" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block">Empresa</label>
										<input id="company" name="company" type="text" value={formData.company} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition" placeholder="Nome da empresa" />
									</div>
								</div>

								<div>
									<label htmlFor="sector" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block">Setor de interesse</label>
									<select id="sector" name="sector" value={formData.sector} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition">
										<option value="">Selecionar setor...</option>
										<option value="ceramica">Artefatos para Cerâmica</option>
										<option value="solda">Artefatos para Solda</option>
										<option value="niveladores">Pés Niveladores</option>
										<option value="vedacoes">Vedações</option>
										<option value="agro">Linha Agro</option>
										<option value="rolos">Rolos de Transporte</option>
										<option value="outro">Outro</option>
									</select>
								</div>

								<div>
									<label htmlFor="message" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block">Mensagem / Detalhes do projeto *</label>
									<textarea id="message" name="message" required rows={5} value={formData.message} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition resize-none" placeholder="Descreva sua necessidade, especificações, quantidades..." />
								</div>

								<button type="submit" className="w-full text-[11px] font-bold uppercase tracking-widest px-6 py-3.5 bg-slate-900 text-white rounded-full hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300">
									Enviar Solicitação
								</button>
							</form>
						)}
					</div>

					{/* Sidebar */}
					<div className="lg:col-span-5 space-y-6 reveal-item" style={{ animationDelay: '0.15s' }}>
						{/* Contact Cards */}
						<div className="space-y-4">
							<a href="https://api.whatsapp.com/send?phone=5519981748364&text=Ol%C3%A1!" target="_blank" className="glass-panel-light p-5 rounded-xl flex items-center gap-4 border border-white/40 bg-white/40 backdrop-blur-xl hover:border-green-500/25 transition-all group">
								<div className="w-10 h-10 rounded-full bg-green-50 border border-green-100 flex items-center justify-center text-green-600 flex-shrink-0">
									<i className="iconify text-lg" data-icon="lucide:message-square"></i>
								</div>
								<div>
									<h4 className="text-xs font-bold text-slate-900">WhatsApp</h4>
									<p className="text-[11px] text-slate-500">(19) 98174-8364</p>
								</div>
								<i className="iconify text-sm text-slate-300 group-hover:text-green-500 ml-auto transition-colors" data-icon="lucide:arrow-up-right"></i>
							</a>

							<a href="tel:+5519981748364" className="glass-panel-light p-5 rounded-xl flex items-center gap-4 border border-white/40 bg-white/40 backdrop-blur-xl hover:border-red-500/25 transition-all group">
								<div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 flex-shrink-0">
									<i className="iconify text-lg" data-icon="lucide:phone"></i>
								</div>
								<div>
									<h4 className="text-xs font-bold text-slate-900">Telefone</h4>
									<p className="text-[11px] text-slate-500">(19) 98174-8364</p>
								</div>
								<i className="iconify text-sm text-slate-300 group-hover:text-red-500 ml-auto transition-colors" data-icon="lucide:arrow-up-right"></i>
							</a>

							<a href="mailto:comercial@ferribor.com.br" className="glass-panel-light p-5 rounded-xl flex items-center gap-4 border border-white/40 bg-white/40 backdrop-blur-xl hover:border-red-500/25 transition-all group">
								<div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 flex-shrink-0">
									<i className="iconify text-lg" data-icon="lucide:mail"></i>
								</div>
								<div>
									<h4 className="text-xs font-bold text-slate-900">E-mail</h4>
									<p className="text-[11px] text-slate-500">comercial@ferribor.com.br</p>
								</div>
								<i className="iconify text-sm text-slate-300 group-hover:text-red-500 ml-auto transition-colors" data-icon="lucide:arrow-up-right"></i>
							</a>

							<div className="glass-panel-light p-5 rounded-xl flex items-center gap-4 border border-white/40 bg-white/40 backdrop-blur-xl">
								<div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 flex-shrink-0">
									<i className="iconify text-lg" data-icon="lucide:map-pin"></i>
								</div>
								<div>
									<h4 className="text-xs font-bold text-slate-900">Endereço</h4>
									<p className="text-[11px] text-slate-500 leading-relaxed">Rua Aurea Basso Baptista, 36<br />Jardim D&apos;itália, Santa Gertrudes - SP<br />CEP 13510-092</p>
								</div>
							</div>
						</div>

						{/* Map */}
						<div className="bg-white border border-slate-900/5 p-4 rounded-2xl shadow-sm">
							<h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 px-1 flex items-center gap-1.5">
								<span className="w-2 h-2 rounded-full bg-red-600"></span>
								Nossa Localização
							</h4>
							<div className="w-full h-[280px] rounded-xl overflow-hidden border border-slate-200">
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
							<li><a className="hover:text-white transition-colors" href="/services">Serviços</a></li>
							<li><a className="hover:text-white transition-colors" href="/contact">Contato</a></li>
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
