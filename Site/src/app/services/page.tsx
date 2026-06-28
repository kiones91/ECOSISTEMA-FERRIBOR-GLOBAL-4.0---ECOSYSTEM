"use client";

import { useEffect } from 'react';
import { Logo3D } from '../../components/navigation/Logo3D';

const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:5174/auth';

const services = [
	{
		id: 1,
		title: "Artefatos para Cerâmica",
		shortDesc: "Fabricação e Recuperação de Artefatos para Indústria Cerâmica",
		longDesc: "Desenvolvimento e revestimento de peças com compostos de borracha de alta resistência à abrasão sob medida para transportadores e maquinários cerâmicos. Nossas soluções garantem maior vida útil dos equipamentos em ambientes com alto nível de desgaste particulado.",
		features: ["Revestimento de rolos e tambores", "Raspadores e lâminas flexíveis", "Guias e perfis para esteiras", "Compostos anti-abrasão customizados"],
		icon: "lucide:layers",
		imageUrl: "/assets/imagens/4d5dd7303ae3d6c2_ceramica.jpg"
	},
	{
		id: 2,
		title: "Artefatos para Solda",
		shortDesc: "Fabricação e Recuperação de Artefatos para Equipamentos de Solda",
		longDesc: "Peças isolantes térmicas e elétricas fabricadas com silicone e poliuretanos especiais de altíssima durabilidade para processos de soldagem industrial. Resistência a temperaturas extremas e proteção contra arcos elétricos.",
		features: ["Isolantes térmicos em silicone", "Proteções anti-respingo", "Mangueiras e conduítes flexíveis", "Bocais e difusores especiais"],
		icon: "lucide:zap",
		imageUrl: "/assets/imagens/7ff406fba3211ef5_solda.jpg"
	},
	{
		id: 3,
		title: "Pés Niveladores",
		shortDesc: "Fabricação de Pés Niveladores Industriais",
		longDesc: "Componentes projetados para suportar cargas elevadas, absorver vibrações severas e garantir o nivelamento milimétrico de equipamentos industriais. Fabricados em borracha natural, neoprene e poliuretano com insertos metálicos.",
		features: ["Suporte para cargas de até 20 toneladas", "Absorção de vibração industrial", "Insertos metálicos rosqueados", "Compostos anti-óleo e anti-ozônio"],
		icon: "lucide:chevrons-up-down",
		imageUrl: "/assets/imagens/08ca2f01e3417874_niveladores.jpg"
	},
	{
		id: 4,
		title: "Vedações",
		shortDesc: "Fabricação de Vedações de Alta Precisão",
		longDesc: "Desenvolvimento de O-rings, retentores, gaxetas, raspadores e anéis sob medida em NBR, silicone, viton e poliuretano de alta precisão. Tolerâncias decimais para aplicações hidráulicas, pneumáticas e rotativas.",
		features: ["O-rings e anéis de vedação", "Retentores e gaxetas", "Raspadores hidráulicos", "Vedações rotativas e estáticas"],
		icon: "lucide:shield-check",
		imageUrl: "/assets/imagens/7ed173cd6055799d_vedacoes.jpg"
	},
	{
		id: 5,
		title: "Linha Agro",
		shortDesc: "Peças e Equipamentos para Linha Agrícola",
		longDesc: "Soluções robustas em elastômeros para tratores, colheitadeiras e implementos agrícolas, garantindo resistência contra intempéries e atrito contínuo. Peças projetadas para operação em campo com exposição solar e contato com químicos.",
		features: ["Vedações para sistemas hidráulicos", "Amortecedores e coxins", "Revestimentos anti-desgaste", "Peças para plantio e colheita"],
		icon: "lucide:leaf",
		imageUrl: "/assets/imagens/5d1bcf832d66669c_linha-agro.jpg"
	},
	{
		id: 6,
		title: "Rolos de Transporte",
		shortDesc: "Fabricação e Recuperação de Rolos de Transporte",
		longDesc: "Revestimento de cilindros com elastômeros especiais seguidos de usinagem e retificação de altíssima precisão técnica decimal. Rolos para impressão, laminação, transporte e processamento industrial.",
		features: ["Revestimento em PU, borracha e silicone", "Usinagem e retificação CNC", "Balanceamento dinâmico", "Dureza sob especificação (20 a 90 Shore A)"],
		icon: "lucide:settings",
		imageUrl: "/assets/imagens/6fa5f4bfad00f012_rolos.jpg"
	}
];

export default function ServicesPage() {
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
						<a className="cursor-hover hover:text-red-600 transition-colors" href="/">Início</a>
						<a className="cursor-hover hover:text-red-600 transition-colors" href="/about">A Empresa</a>
						<a className="cursor-hover text-red-600 transition-colors" href="/services">Serviços</a>
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

			{/* Hero */}
			<section className="relative z-10 py-16 lg:py-24 px-6 md:px-12 border-b border-slate-900/5">
				<div className="max-w-4xl mx-auto text-center reveal-item">
					<div className="inline-flex items-center gap-2 text-red-600 mb-4">
						<span className="flex h-2 w-2 rounded-full bg-red-600 animate-pulse"></span>
						<span className="text-[10px] font-bold tracking-widest uppercase text-slate-400">Nossos Serviços</span>
					</div>
					<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tighter text-slate-900 mb-6">
						Soluções em elastômeros<br />
						<span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-black">para cada desafio industrial.</span>
					</h1>
					<p className="text-sm md:text-base text-slate-500 max-w-2xl mx-auto leading-relaxed">
						Desenvolvemos, fabricamos e recuperamos artefatos técnicos em borracha, silicone e poliuretano para os mais exigentes ambientes industriais do Brasil e América Latina.
					</p>
				</div>
			</section>

			{/* Services Grid */}
			<section className="relative z-10 py-16 lg:py-20 px-6 md:px-12">
				<div className="max-w-6xl mx-auto space-y-16">
					{services.map((service, i) => (
						<div
							key={service.id}
							className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center reveal-item ${i % 2 !== 0 ? 'lg:[direction:rtl]' : ''}`}
							style={{ animationDelay: `${i * 0.1}s` }}
						>
							{/* Image */}
							<div className={`${i % 2 !== 0 ? 'lg:[direction:ltr]' : ''}`}>
								<div className="glass-panel-light rounded-2xl p-4 border border-white/40 bg-white/40 backdrop-blur-xl">
									<div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
										<img
											src={service.imageUrl}
											alt={service.title}
											className="w-full h-full object-cover"
											loading="lazy"
										/>
									</div>
								</div>
							</div>

							{/* Content */}
							<div className={`space-y-4 ${i % 2 !== 0 ? 'lg:[direction:ltr]' : ''}`}>
								<div className="inline-flex items-center gap-2">
									<div className="w-8 h-8 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-600">
										<i className="iconify text-sm" data-icon={service.icon}></i>
									</div>
									<span className="text-[10px] font-bold tracking-widest uppercase text-slate-400">Serviço {String(service.id).padStart(2, '0')}</span>
								</div>

								<h2 className="text-2xl md:text-3xl font-bold tracking-tighter text-slate-900">
									{service.title}
								</h2>

								<p className="text-sm text-slate-600 leading-relaxed">
									{service.longDesc}
								</p>

								<ul className="space-y-2 pt-2">
									{service.features.map((feat, j) => (
										<li key={j} className="flex items-center gap-2 text-xs text-slate-600">
											<span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0"></span>
											{feat}
										</li>
									))}
								</ul>

								<div className="pt-4">
									<a
										href="/#contato"
										className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest px-5 py-2.5 bg-slate-900 text-white rounded-full hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300"
									>
										Solicitar Orçamento
										<i className="iconify text-sm" data-icon="lucide:arrow-right"></i>
									</a>
								</div>
							</div>
						</div>
					))}
				</div>
			</section>

			{/* CTA */}
			<section className="relative z-10 py-16 lg:py-20 px-6 md:px-12 border-t border-slate-900/5">
				<div className="max-w-3xl mx-auto text-center reveal-item">
					<h2 className="text-2xl md:text-3xl font-bold tracking-tighter text-slate-900 mb-4">
						Não encontrou o que precisa?
					</h2>
					<p className="text-sm text-slate-500 mb-8 max-w-lg mx-auto">
						Desenvolvemos soluções customizadas para qualquer desafio em elastômeros. Envie seu projeto ou desenho técnico e nossa equipe retorna em até 24h.
					</p>
					<div className="flex flex-wrap gap-4 items-center justify-center">
						<a href="/#contato" className="text-[11px] font-bold uppercase tracking-widest px-6 py-3 bg-slate-900 text-white rounded-full hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300">
							Enviar Projeto
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
							<li><a className="hover:text-white transition-colors" href="/services">Serviços</a></li>
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
