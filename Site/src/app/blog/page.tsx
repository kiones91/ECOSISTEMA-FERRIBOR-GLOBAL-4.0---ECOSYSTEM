"use client";

import { useEffect } from 'react';
import { Logo3D } from '../../components/navigation/Logo3D';
import { useI18n } from '../../i18n/LanguageContext';
import { LanguageSwitcher } from '../../i18n/LanguageSwitcher';

const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:5174/auth';

const articleMeta = [
	{ date: "20 Jun 2026", imageUrl: "/assets/imagens/7ed173cd6055799d_vedacoes.jpg" },
	{ date: "15 Jun 2026", imageUrl: "/assets/imagens/6fa5f4bfad00f012_rolos.jpg" },
	{ date: "10 Jun 2026", imageUrl: "/assets/imagens/7ed173cd6055799d_vedacoes.jpg" },
	{ date: "05 Jun 2026", imageUrl: "/assets/imagens/4d5dd7303ae3d6c2_ceramica.jpg" },
	{ date: "28 Mai 2026", imageUrl: "/assets/imagens/08ca2f01e3417874_niveladores.jpg" },
	{ date: "20 Mai 2026", imageUrl: "/assets/imagens/5d1bcf832d66669c_linha-agro.jpg" },
];

export default function BlogPage() {
	const { t } = useI18n();

	const articles = (t('blog.articles') as { title: string; excerpt: string; category: string; readTime: string }[]).map((a, i) => ({
		...a,
		id: i + 1,
		date: articleMeta[i].date,
		imageUrl: articleMeta[i].imageUrl,
	}));
	const categories = t('blog.categories') as string[];

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
						<a className="cursor-hover hover:text-red-600 transition-colors" href="/about">{t('nav.empresa')}</a>
						<a className="cursor-hover hover:text-red-600 transition-colors" href="/services">{t('nav.servicos')}</a>
						<a className="cursor-hover hover:text-red-600 transition-colors" href="/catalog">{t('nav.catalogo')}</a>
						<a className="cursor-hover text-red-600 transition-colors" href="/blog">{t('nav.blog')}</a>
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

			{/* Hero */}
			<section className="relative z-10 py-16 lg:py-20 px-6 md:px-12 border-b border-slate-900/5">
				<div className="max-w-4xl mx-auto text-center reveal-item">
					<div className="inline-flex items-center gap-2 text-red-600 mb-4">
						<span className="flex h-2 w-2 rounded-full bg-red-600 animate-pulse"></span>
						<span className="text-[10px] font-bold tracking-widest uppercase text-slate-400">{t('blog.tag')}</span>
					</div>
					<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tighter text-slate-900 mb-6">
						{t('blog.heroTitle1')}<br />
						<span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-black">{t('blog.heroTitle2')}</span>
					</h1>
					<p className="text-sm md:text-base text-slate-500 max-w-2xl mx-auto leading-relaxed">
						{t('blog.heroParagraph')}
					</p>
				</div>
			</section>

			{/* Categories */}
			<section className="relative z-10 px-6 md:px-12 py-6 border-b border-slate-900/5">
				<div className="max-w-6xl mx-auto flex flex-wrap gap-2 justify-center">
					{categories.map((cat, i) => (
						<button
							key={cat}
							className={`text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full border transition-all ${i === 0 ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-200 text-slate-500 hover:border-red-500 hover:text-red-600'}`}
						>
							{cat}
						</button>
					))}
				</div>
			</section>

			{/* Articles Grid */}
			<section className="relative z-10 py-12 lg:py-16 px-6 md:px-12">
				<div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
					{articles.map((article, i) => (
						<article
							key={article.id}
							className="glass-panel-light rounded-2xl overflow-hidden border border-white/40 bg-white/40 backdrop-blur-xl hover:border-red-500/25 transition-all group reveal-item"
							style={{ animationDelay: `${i * 0.08}s` }}
						>
							<div className="aspect-[16/10] overflow-hidden">
								<img
									src={article.imageUrl}
									alt={article.title}
									className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
									loading="lazy"
								/>
							</div>
							<div className="p-6 space-y-3">
								<div className="flex items-center justify-between">
									<span className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 bg-red-50 text-red-600 rounded-full border border-red-100">
										{article.category}
									</span>
									<span className="text-[10px] text-slate-400">{article.readTime} {t('blog.readTimeSuffix')}</span>
								</div>
								<h2 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-red-600 transition-colors">
									{article.title}
								</h2>
								<p className="text-xs text-slate-500 leading-relaxed">
									{article.excerpt}
								</p>
								<div className="flex items-center justify-between pt-2">
									<span className="text-[10px] text-slate-400 font-mono">{article.date}</span>
									<span className="text-[10px] font-bold uppercase tracking-widest text-red-600 group-hover:underline">
										{t('blog.readMore')}
									</span>
								</div>
							</div>
						</article>
					))}
				</div>
			</section>

			{/* Newsletter CTA */}
			<section className="relative z-10 py-16 lg:py-20 px-6 md:px-12 border-t border-slate-900/5">
				<div className="max-w-3xl mx-auto text-center reveal-item">
					<h2 className="text-2xl md:text-3xl font-bold tracking-tighter text-slate-900 mb-4">
						Receba conteúdo técnico <span className="text-red-600">direto no seu e-mail</span>
					</h2>
					<p className="text-sm text-slate-500 mb-8 max-w-lg mx-auto">
						Artigos quinzenais sobre elastômeros, novos materiais e boas práticas industriais.
					</p>
					<div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
						<input
							type="email"
							placeholder="voce@empresa.com"
							className="flex-1 px-4 py-3 rounded-full border border-slate-200 bg-white text-sm text-slate-900 outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition"
						/>
						<button className="text-[11px] font-bold uppercase tracking-widest px-6 py-3 bg-slate-900 text-white rounded-full hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300 whitespace-nowrap">
							Inscrever-se
						</button>
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
							<li><a className="hover:text-white transition-colors" href="/blog">Blog</a></li>
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
