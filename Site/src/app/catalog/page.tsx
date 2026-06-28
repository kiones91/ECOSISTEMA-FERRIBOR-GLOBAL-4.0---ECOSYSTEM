"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Logo3D } from '../../components/navigation/Logo3D';

const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:5174/auth';

const categories = [
	{ id: "todos", label: "Todos" },
	{ id: "vedacoes", label: "Vedações" },
	{ id: "rolos", label: "Rolos de Transporte" },
	{ id: "niveladores", label: "Pés Niveladores" },
	{ id: "ceramica", label: "Artefatos para Cerâmica" },
	{ id: "solda", label: "Artefatos para Solda" },
	{ id: "agro", label: "Linha Agro" },
	{ id: "testes-3d", label: "Testes 3D" },
];

const materials = ["NBR", "Silicone", "Viton", "Poliuretano", "Neoprene", "EPDM"];

const products = [
	{ id: "oring-nbr-70", name: "O-Ring NBR 70 Shore A", category: "vedacoes", material: "NBR", application: "Hidráulica", imageUrl: "/assets/imagens/7ed173cd6055799d_vedacoes.jpg", shortDesc: "Vedação toroidal em borracha nitrílica, resistente a óleos minerais." },
	{ id: "retentor-viton", name: "Retentor Viton Alta Temperatura", category: "vedacoes", material: "Viton", application: "Rotativa", imageUrl: "/assets/imagens/7ed173cd6055799d_vedacoes.jpg", shortDesc: "Retentor para eixos rotativos em ambientes de até 250°C." },
	{ id: "gaxeta-ptfe", name: "Gaxeta PTFE Expandido", category: "vedacoes", material: "PTFE", application: "Estática", imageUrl: "/assets/imagens/7ed173cd6055799d_vedacoes.jpg", shortDesc: "Vedação para flanges com resistência química universal." },
	{ id: "rolo-borracha-800", name: "Rolo Revestido ø800mm", category: "rolos", material: "NBR", application: "Transporte", imageUrl: "/assets/imagens/6fa5f4bfad00f012_rolos.jpg", shortDesc: "Rolo para esteiras transportadoras com revestimento anti-abrasão." },
	{ id: "rolo-silicone-laminacao", name: "Rolo Silicone Laminação", category: "rolos", material: "Silicone", application: "Laminação", imageUrl: "/assets/imagens/6fa5f4bfad00f012_rolos.jpg", shortDesc: "Rolo de silicone para processos de laminação a quente." },
	{ id: "rolo-pu-impressao", name: "Rolo PU Impressão Offset", category: "rolos", material: "Poliuretano", application: "Impressão", imageUrl: "/assets/imagens/6fa5f4bfad00f012_rolos.jpg", shortDesc: "Rolo de poliuretano com dureza precisa para impressão offset." },
	{ id: "pe-nivelador-m16", name: "Pé Nivelador M16 - 5 ton", category: "niveladores", material: "NBR", application: "Industrial", imageUrl: "/assets/imagens/08ca2f01e3417874_niveladores.jpg", shortDesc: "Pé nivelador com rosca M16 para cargas de até 5 toneladas." },
	{ id: "pe-antivibra-m20", name: "Pé Anti-Vibração M20", category: "niveladores", material: "Neoprene", application: "CNC", imageUrl: "/assets/imagens/08ca2f01e3417874_niveladores.jpg", shortDesc: "Amortecedor de vibração para centros de usinagem CNC." },
	{ id: "raspador-ceramica", name: "Raspador para Esteira Cerâmica", category: "ceramica", material: "Poliuretano", application: "Cerâmica", imageUrl: "/assets/imagens/4d5dd7303ae3d6c2_ceramica.jpg", shortDesc: "Lâmina raspadora de alta resistência para esteiras cerâmicas." },
	{ id: "revestimento-tambor", name: "Revestimento de Tambor", category: "ceramica", material: "NBR", application: "Cerâmica", imageUrl: "/assets/imagens/4d5dd7303ae3d6c2_ceramica.jpg", shortDesc: "Revestimento anti-desgaste para tambores de moagem cerâmica." },
	{ id: "isolante-silicone-solda", name: "Isolante Térmico para Solda", category: "solda", material: "Silicone", application: "Soldagem", imageUrl: "/assets/imagens/7ff406fba3211ef5_solda.jpg", shortDesc: "Proteção térmica em silicone para processos de soldagem MIG/TIG." },
	{ id: "bocal-difusor", name: "Bocal Difusor Especial", category: "solda", material: "Silicone", application: "Soldagem", imageUrl: "/assets/imagens/7ff406fba3211ef5_solda.jpg", shortDesc: "Bocal de silicone com resistência a respingos e alta temperatura." },
	{ id: "vedacao-hidraulica-agro", name: "Vedação Hidráulica Agrícola", category: "agro", material: "Poliuretano", application: "Hidráulica", imageUrl: "/assets/imagens/5d1bcf832d66669c_linha-agro.jpg", shortDesc: "Kit de vedação para cilindros hidráulicos de implementos agrícolas." },
	{ id: "coxim-motor-trator", name: "Coxim de Motor para Trator", category: "agro", material: "NBR", application: "Agrícola", imageUrl: "/assets/imagens/5d1bcf832d66669c_linha-agro.jpg", shortDesc: "Amortecedor de motor com alta resistência a óleo e vibração." },
	{ id: "demo-realista", name: "Demo — Capacete PBR Ultra-realista", category: "testes-3d", material: "Multi-material", application: "Demonstração", imageUrl: "/assets/imagens/7ed173cd6055799d_vedacoes.jpg", shortDesc: "Modelo 3D ultra-realista com texturas PBR. Demonstra o nível visual final." },
	{ id: "demo-garrafa", name: "Demo — Garrafa d'Água (Transparência)", category: "testes-3d", material: "Multi-material", application: "Demonstração", imageUrl: "/assets/imagens/7ed173cd6055799d_vedacoes.jpg", shortDesc: "Garrafa com vidro, metal e transparência. Teste de materiais avançados." },
	{ id: "demo-tenis", name: "Demo — Tênis Customizável", category: "testes-3d", material: "Multi-material", application: "Demonstração", imageUrl: "/assets/imagens/7ed173cd6055799d_vedacoes.jpg", shortDesc: "Tênis multi-material para teste de customização em tempo real." },
	{ id: "rolo-borracha-800", name: "Rolo Revestido ø800mm (3D Placeholder)", category: "testes-3d", material: "NBR", application: "Transporte", imageUrl: "/assets/imagens/6fa5f4bfad00f012_rolos.jpg", shortDesc: "Modelo geométrico placeholder do rolo com customizador de materiais." },
	{ id: "oring-nbr-70", name: "O-Ring NBR 70 (3D Placeholder)", category: "testes-3d", material: "NBR", application: "Hidráulica", imageUrl: "/assets/imagens/7ed173cd6055799d_vedacoes.jpg", shortDesc: "Modelo geométrico placeholder da vedação com customizador." },
];

export default function CatalogPage() {
	const [activeCategory, setActiveCategory] = useState("todos");
	const [activeMaterial, setActiveMaterial] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState("");

	const filteredProducts = products.filter((p) => {
		if (activeCategory !== "todos" && p.category !== activeCategory) return false;
		if (activeMaterial && p.material !== activeMaterial) return false;
		if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase()) && !p.shortDesc.toLowerCase().includes(searchQuery.toLowerCase())) return false;
		return true;
	});

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
						<a className="cursor-hover hover:text-red-600 transition-colors" href="/services">Serviços</a>
						<a className="cursor-hover text-red-600 transition-colors" href="/catalog">Catálogo</a>
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
			<section className="relative z-10 py-12 lg:py-16 px-6 md:px-12 border-b border-slate-900/5">
				<div className="max-w-4xl mx-auto text-center reveal-item">
					<div className="inline-flex items-center gap-2 text-red-600 mb-4">
						<span className="flex h-2 w-2 rounded-full bg-red-600 animate-pulse"></span>
						<span className="text-[10px] font-bold tracking-widest uppercase text-slate-400">Catálogo de Produtos</span>
					</div>
					<h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-[1.05] tracking-tighter text-slate-900 mb-4">
						Encontre a peça ideal<br />
						<span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-black">para sua aplicação.</span>
					</h1>
					<p className="text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
						Navegue por nosso catálogo técnico de artefatos em borracha, silicone e poliuretano. Filtros por categoria, material e aplicação.
					</p>
				</div>
			</section>

			{/* Filters & Grid */}
			<section className="relative z-10 py-8 lg:py-12 px-6 md:px-12">
				<div className="max-w-6xl mx-auto">

					{/* Search + Filters Bar */}
					<div className="flex flex-col lg:flex-row gap-4 mb-8">
						{/* Search */}
						<div className="flex-1">
							<div className="relative">
								<i className="iconify absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" data-icon="lucide:search"></i>
								<input
									type="text"
									placeholder="Buscar produto..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="w-full pl-10 pr-4 py-2.5 rounded-full border border-slate-200 bg-white text-sm text-slate-900 outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition"
								/>
							</div>
						</div>

						{/* Material Filter */}
						<div className="flex flex-wrap gap-2">
							<button
								onClick={() => setActiveMaterial(null)}
								className={`text-[9px] font-bold uppercase tracking-widest px-3 py-2 rounded-full border transition-all ${!activeMaterial ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-200 text-slate-500 hover:border-red-500 hover:text-red-600'}`}
							>
								Todos materiais
							</button>
							{materials.map((mat) => (
								<button
									key={mat}
									onClick={() => setActiveMaterial(activeMaterial === mat ? null : mat)}
									className={`text-[9px] font-bold uppercase tracking-widest px-3 py-2 rounded-full border transition-all ${activeMaterial === mat ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-200 text-slate-500 hover:border-red-500 hover:text-red-600'}`}
								>
									{mat}
								</button>
							))}
						</div>
					</div>

					{/* Category Tabs */}
					<div className="flex flex-wrap gap-2 mb-8 pb-4 border-b border-slate-900/5">
						{categories.map((cat) => (
							<button
								key={cat.id}
								onClick={() => setActiveCategory(cat.id)}
								className={`text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full border transition-all ${activeCategory === cat.id ? 'bg-red-600 text-white border-red-600' : 'border-slate-200 text-slate-500 hover:border-red-500 hover:text-red-600'}`}
							>
								{cat.label}
							</button>
						))}
					</div>

					{/* Results Count */}
					<p className="text-xs text-slate-400 mb-6">{filteredProducts.length} produto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}</p>

					{/* Product Grid */}
					{filteredProducts.length > 0 ? (
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
							{filteredProducts.map((product, i) => (
								<Link
									key={product.id}
									href={`/catalog/product/${product.id}`}
									className="glass-panel-light rounded-2xl overflow-hidden border border-white/40 bg-white/40 backdrop-blur-xl hover:border-red-500/25 hover:shadow-lg transition-all group reveal-item"
									style={{ animationDelay: `${i * 0.05}s` }}
								>
									<div className="aspect-[4/3] overflow-hidden bg-slate-100">
										<img
											src={product.imageUrl}
											alt={product.name}
											className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
											loading="lazy"
										/>
									</div>
									<div className="p-5 space-y-2">
										<div className="flex items-center gap-2 flex-wrap">
											<span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 bg-red-50 text-red-600 rounded-full border border-red-100">
												{categories.find(c => c.id === product.category)?.label}
											</span>
											<span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 bg-slate-50 text-slate-500 rounded-full border border-slate-100">
												{product.material}
											</span>
										</div>
										<h3 className="text-sm font-bold text-slate-900 group-hover:text-red-600 transition-colors">{product.name}</h3>
										<p className="text-xs text-slate-500 leading-relaxed">{product.shortDesc}</p>
										<div className="flex items-center justify-between pt-2">
											<span className="text-[10px] text-slate-400">Aplicação: {product.application}</span>
											<span className="text-[10px] font-bold uppercase tracking-widest text-red-600 group-hover:underline">Ver detalhes →</span>
										</div>
									</div>
								</Link>
							))}
						</div>
					) : (
						<div className="text-center py-16">
							<div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-300 mx-auto mb-4">
								<i className="iconify text-2xl" data-icon="lucide:search-x"></i>
							</div>
							<p className="text-sm text-slate-500">Nenhum produto encontrado com os filtros selecionados.</p>
							<button onClick={() => { setActiveCategory("todos"); setActiveMaterial(null); setSearchQuery(""); }} className="text-[11px] font-bold uppercase tracking-widest text-red-600 mt-4 hover:underline">
								Limpar filtros
							</button>
						</div>
					)}
				</div>
			</section>

			{/* CTA */}
			<section className="relative z-10 py-16 px-6 md:px-12 border-t border-slate-900/5">
				<div className="max-w-3xl mx-auto text-center">
					<h2 className="text-xl md:text-2xl font-bold tracking-tighter text-slate-900 mb-3">
						Precisa de uma peça <span className="text-red-600">sob medida</span>?
					</h2>
					<p className="text-sm text-slate-500 mb-6 max-w-lg mx-auto">
						Fabricamos peças customizadas conforme seu desenho técnico. Envie suas especificações e receba um orçamento em até 24h.
					</p>
					<a href="/#contato" className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest px-6 py-3 bg-slate-900 text-white rounded-full hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300">
						Solicitar Orçamento
						<i className="iconify text-sm" data-icon="lucide:arrow-right"></i>
					</a>
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
							<li><a className="hover:text-white transition-colors" href="/catalog">Catálogo</a></li>
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
