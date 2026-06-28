import Link from 'next/link';
import { Logo3D } from '../../../../components/navigation/Logo3D';
import { Viewer3D } from '../../../../components/product/Viewer3D';
type ProductModel = {
	id: string;
	name: string;
	modelUrl: string;
	slots: { name: string; label: string; defaultVariantId: string; variants: { id: string; label: string; color: string; metalness: number; roughness: number }[] }[];
};

const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:5174/auth';

type ProductInfo = {
	name: string;
	category: string;
	material: string;
	application: string;
	imageUrl: string;
	description: string;
	specs: { label: string; value: string }[];
	model?: ProductModel;
};

const products: Record<string, ProductInfo> = {
	"oring-nbr-70": { name: "O-Ring NBR 70 Shore A", category: "Vedações", material: "NBR", application: "Hidráulica", imageUrl: "/assets/imagens/7ed173cd6055799d_vedacoes.jpg", description: "Vedação toroidal em borracha nitrílica, resistente a óleos minerais e derivados de petróleo. Ideal para sistemas hidráulicos e pneumáticos.", specs: [{ label: "Dureza", value: "70 Shore A" }, { label: "Temperatura", value: "-30°C a +100°C" }, { label: "Material", value: "NBR (Borracha Nitrílica)" }, { label: "Norma", value: "DIN 3771 / ISO 3601" }],
		model: { id: "oring-nbr-70", name: "O-Ring NBR 70 Shore A", modelUrl: "/models/vedacao-industrial.glb", slots: [
			{ name: "vedacao", label: "Composto", defaultVariantId: "nbr", variants: [
				{ id: "nbr", label: "NBR (Preto)", color: "#1a1a1a", metalness: 0, roughness: 0.85 },
				{ id: "viton", label: "Viton (Marrom)", color: "#5c3a21", metalness: 0, roughness: 0.7 },
				{ id: "silicone", label: "Silicone (Vermelho)", color: "#9b1c1c", metalness: 0, roughness: 0.5 },
				{ id: "epdm", label: "EPDM (Cinza)", color: "#4a4a4a", metalness: 0, roughness: 0.8 },
			]},
			{ name: "anel_metalico", label: "Reforço", defaultVariantId: "inox", variants: [
				{ id: "inox", label: "Aço Inox", color: "#c0c0c0", metalness: 0.9, roughness: 0.2 },
				{ id: "latao", label: "Latão", color: "#b5a642", metalness: 0.85, roughness: 0.3 },
			]},
		]},
	},
	"retentor-viton": { name: "Retentor Viton Alta Temperatura", category: "Vedações", material: "Viton", application: "Rotativa", imageUrl: "/assets/imagens/7ed173cd6055799d_vedacoes.jpg", description: "Retentor para eixos rotativos em ambientes de até 250°C. Excelente resistência química a óleos sintéticos e fluidos agressivos.", specs: [{ label: "Dureza", value: "75 Shore A" }, { label: "Temperatura", value: "-20°C a +250°C" }, { label: "Material", value: "FKM (Viton)" }, { label: "Tipo", value: "Rotativo com mola" }],
		model: { id: "retentor-viton", name: "Retentor Viton", modelUrl: "/models/vedacao-industrial.glb", slots: [
			{ name: "vedacao", label: "Elastômero", defaultVariantId: "viton", variants: [
				{ id: "viton", label: "Viton (Marrom)", color: "#5c3a21", metalness: 0, roughness: 0.7 },
				{ id: "nbr", label: "NBR (Preto)", color: "#1a1a1a", metalness: 0, roughness: 0.85 },
			]},
			{ name: "labio", label: "Lábio", defaultVariantId: "padrao", variants: [
				{ id: "padrao", label: "Padrão", color: "#1a1a1a", metalness: 0, roughness: 0.95 },
				{ id: "ptfe", label: "PTFE (Branco)", color: "#e8e8e8", metalness: 0, roughness: 0.4 },
			]},
		]},
	},
	"rolo-borracha-800": { name: "Rolo Revestido ø800mm", category: "Rolos de Transporte", material: "NBR", application: "Transporte", imageUrl: "/assets/imagens/6fa5f4bfad00f012_rolos.jpg", description: "Rolo para esteiras transportadoras com revestimento anti-abrasão de alta performance. Usinagem CNC com tolerância decimal.", specs: [{ label: "Diâmetro", value: "800mm" }, { label: "Dureza", value: "60 Shore A" }, { label: "Material", value: "NBR anti-abrasão" }, { label: "Acabamento", value: "Retificado CNC" }],
		model: { id: "rolo-borracha-800", name: "Rolo Revestido ø800mm", modelUrl: "/models/rolo-borracha.glb", slots: [
			{ name: "revestimento", label: "Revestimento", defaultVariantId: "nbr", variants: [
				{ id: "nbr", label: "NBR (Preto)", color: "#1a1a1a", metalness: 0, roughness: 0.8 },
				{ id: "poliuretano", label: "Poliuretano", color: "#ff6b00", metalness: 0, roughness: 0.6 },
				{ id: "silicone", label: "Silicone", color: "#e8e8e8", metalness: 0, roughness: 0.4 },
			]},
			{ name: "eixo", label: "Eixo", defaultVariantId: "inox", variants: [
				{ id: "inox", label: "Aço Inox", color: "#c0c0c0", metalness: 0.9, roughness: 0.2 },
				{ id: "carbono", label: "Aço Carbono", color: "#6b6b6b", metalness: 0.8, roughness: 0.4 },
			]},
		]},
	},
	"pe-nivelador-m16": { name: "Pé Nivelador M16 - 5 ton", category: "Pés Niveladores", material: "NBR", application: "Industrial", imageUrl: "/assets/imagens/08ca2f01e3417874_niveladores.jpg", description: "Pé nivelador com rosca M16 para cargas de até 5 toneladas. Absorção de vibração e nivelamento milimétrico.", specs: [{ label: "Rosca", value: "M16" }, { label: "Carga máx.", value: "5.000 kg" }, { label: "Material", value: "NBR + Inserto metálico" }, { label: "Dureza", value: "55 Shore A" }],
		model: { id: "pe-nivelador-m16", name: "Pé Nivelador M16", modelUrl: "/models/broca-diamantada.glb", slots: [
			{ name: "corpo", label: "Base", defaultVariantId: "nbr", variants: [
				{ id: "nbr", label: "NBR", color: "#2a2a2a", metalness: 0.1, roughness: 0.8 },
				{ id: "pu", label: "Poliuretano", color: "#ff6b00", metalness: 0, roughness: 0.6 },
			]},
			{ name: "encaixe", label: "Haste", defaultVariantId: "zincado", variants: [
				{ id: "zincado", label: "Zincado", color: "#9a9a9a", metalness: 0.85, roughness: 0.3 },
				{ id: "inox", label: "Inox", color: "#c0c0c0", metalness: 0.9, roughness: 0.2 },
			]},
		]},
	},
	"demo-realista": { name: "Demo Realista — Capacete PBR", category: "Demonstração 3D", material: "Multi-material", application: "Teste de qualidade visual", imageUrl: "/assets/imagens/7ed173cd6055799d_vedacoes.jpg", description: "Modelo ultra-realista com texturas PBR (normal map, metalness, roughness). Este é o nível de qualidade visual que teremos ao fotografar os produtos reais da FerriBor com fotogrametria ou modelagem 3D profissional.", specs: [{ label: "Formato", value: "glTF Binary (.glb)" }, { label: "Tamanho", value: "3.6 MB" }, { label: "Texturas", value: "PBR Completo (base, normal, metal, rough)" }, { label: "Qualidade", value: "Ultra-realista" }],
		model: { id: "demo-realista", name: "Capacete PBR", modelUrl: "/models/DamagedHelmet.glb", slots: [] },
	},
	"demo-garrafa": { name: "Demo Realista — Garrafa d'Água", category: "Demonstração 3D", material: "PBR Glass", application: "Teste de materiais transparentes", imageUrl: "/assets/imagens/7ed173cd6055799d_vedacoes.jpg", description: "Garrafa com materiais PBR incluindo transparência e reflexos. Demonstra como produtos com partes metálicas e plásticas podem ser visualizados com alta fidelidade.", specs: [{ label: "Formato", value: "glTF Binary (.glb)" }, { label: "Tamanho", value: "8.5 MB" }, { label: "Texturas", value: "PBR + Transparency" }, { label: "Qualidade", value: "Ultra-realista" }],
		model: { id: "demo-garrafa", name: "Garrafa d'Água", modelUrl: "/models/WaterBottle.glb", slots: [] },
	},
	"demo-tenis": { name: "Demo Realista — Tênis Customizável", category: "Demonstração 3D", material: "Multi-material", application: "Teste de customização", imageUrl: "/assets/imagens/7ed173cd6055799d_vedacoes.jpg", description: "Modelo de tênis com materiais múltiplos para demonstrar a troca de cores/materiais em tempo real — a mesma técnica que aplicaremos nos rolos e vedações da FerriBor.", specs: [{ label: "Formato", value: "glTF Binary (.glb)" }, { label: "Tamanho", value: "7.8 MB" }, { label: "Texturas", value: "PBR Multi-material" }, { label: "Qualidade", value: "Ultra-realista" }],
		model: { id: "demo-tenis", name: "Tênis Customizável", modelUrl: "/models/MaterialsVariantsShoe.glb", slots: [] },
	},
};

const defaultProduct: ProductInfo = { name: "Produto", category: "Geral", material: "Borracha", application: "Industrial", imageUrl: "/assets/imagens/7ed173cd6055799d_vedacoes.jpg", description: "Produto técnico em elastômero de alta performance para aplicações industriais.", specs: [{ label: "Material", value: "Sob consulta" }, { label: "Dureza", value: "Sob especificação" }, { label: "Temperatura", value: "Sob consulta" }, { label: "Norma", value: "Conforme aplicação" }] };

export function generateStaticParams() {
	return Object.keys(products).map((id) => ({ id }));
}

export default function ProductPage({ params }: { params: { id: string } }) {
	const product = products[params.id] || defaultProduct;

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
						<a className="cursor-hover hover:text-red-600 transition-colors" href="/#contato">Contato</a>
					</div>
					<div>
						<a href={DASHBOARD_URL} className="cursor-hover text-[10px] font-bold uppercase tracking-widest px-5 py-2.5 bg-slate-900 text-white rounded-full hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300 text-center inline-block">
							Portal do Cliente
						</a>
					</div>
				</div>
			</nav>

			{/* Breadcrumb */}
			<div className="relative z-10 px-6 md:px-12 pt-8">
				<nav className="flex items-center gap-2 text-[11px] text-slate-400">
					<Link href="/" className="hover:text-red-600 transition-colors">Home</Link>
					<span>/</span>
					<Link href="/catalog" className="hover:text-red-600 transition-colors">Catálogo</Link>
					<span>/</span>
					<span className="text-slate-700 font-medium">{product.name}</span>
				</nav>
			</div>

			{/* Product Detail */}
			<section className="relative z-10 py-12 lg:py-16 px-6 md:px-12">
				<div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

					{/* Image / 3D Viewer */}
					<div className="glass-panel-light rounded-2xl p-6 border border-white/40 bg-white/40 backdrop-blur-xl">
						<div className="aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
							{product.model ? (
								<Viewer3D product={product.model} mode="customizer" />
							) : (
								<img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
							)}
						</div>
						<p className="text-[10px] text-slate-400 text-center mt-3 font-mono">
							{product.model ? "Arraste para girar · Toque nas cores para customizar · AR no celular" : "Visualização 3D disponível em breve"}
						</p>
					</div>

					{/* Info */}
					<div className="space-y-6">
						<div>
							<div className="flex items-center gap-2 mb-3">
								<span className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 bg-red-50 text-red-600 rounded-full border border-red-100">{product.category}</span>
								<span className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 bg-slate-50 text-slate-500 rounded-full border border-slate-100">{product.material}</span>
							</div>
							<h1 className="text-2xl md:text-3xl font-bold tracking-tighter text-slate-900 mb-3">{product.name}</h1>
							<p className="text-sm text-slate-600 leading-relaxed">{product.description}</p>
						</div>

						{/* Specs Table */}
						<div className="bg-white border border-slate-900/5 rounded-2xl p-6 shadow-sm">
							<h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 mb-4 flex items-center gap-1.5">
								<span className="w-2 h-2 rounded-full bg-red-600"></span>
								Especificações Técnicas
							</h2>
							<div className="space-y-3">
								{product.specs.map((spec, i) => (
									<div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
										<span className="text-xs text-slate-500">{spec.label}</span>
										<span className="text-xs font-bold text-slate-900">{spec.value}</span>
									</div>
								))}
							</div>
						</div>

						{/* Application */}
						<div className="glass-panel-light rounded-xl p-4 border border-white/40 bg-white/40 backdrop-blur-xl">
							<span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Aplicação principal</span>
							<p className="text-sm font-bold text-slate-900 mt-1">{product.application}</p>
						</div>

						{/* CTA */}
						<div className="flex flex-wrap gap-3 pt-4">
							<a href="/#contato" className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest px-6 py-3 bg-slate-900 text-white rounded-full hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300">
								Solicitar Orçamento
								<i className="iconify text-sm" data-icon="lucide:arrow-right"></i>
							</a>
							<a href="https://api.whatsapp.com/send?phone=5519981748364&text=Ol%C3%A1!%20Tenho%20interesse%20no%20produto%20${encodeURIComponent(product.name)}" target="_blank" className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest px-6 py-3 border border-slate-200 text-slate-700 rounded-full hover:border-green-500 hover:text-green-600 transition-all duration-300">
								<i className="iconify text-lg text-green-600" data-icon="lucide:message-square"></i>
								WhatsApp
							</a>
						</div>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="relative mt-auto border-t border-slate-900/5 bg-slate-950 text-white py-16 px-6 md:px-12 z-10 overflow-hidden">
				<div className="grid grid-cols-1 md:grid-cols-12 gap-8 max-w-6xl mx-auto mb-12 relative z-10">
					<div className="md:col-span-5 space-y-4">
						<div className="h-20 w-64 relative flex items-center justify-center -ml-4">
							<img src="/assets/imagens/logo.png" alt="Ferribor Logo" className="w-full h-full object-contain scale-[1.3]" />
						</div>
						<p className="text-slate-400 text-xs leading-relaxed max-w-sm">Fabricantes de artefatos de borracha, silicone e PU para a indústria.</p>
					</div>
					<div className="md:col-span-3 space-y-4">
						<h4 className="text-xs font-bold uppercase tracking-widest text-slate-200">Mapa do Site</h4>
						<ul className="space-y-2 text-xs text-slate-400">
							<li><a className="hover:text-white transition-colors" href="/">Home</a></li>
							<li><a className="hover:text-white transition-colors" href="/catalog">Catálogo</a></li>
							<li><a className="hover:text-white transition-colors" href="/contact">Contato</a></li>
						</ul>
					</div>
					<div className="md:col-span-4 space-y-4">
						<h4 className="text-xs font-bold uppercase tracking-widest text-slate-200">Contato</h4>
						<ul className="space-y-2 text-xs text-slate-400">
							<li><a href="tel:+5519981748364" className="hover:text-white">(19) 98174-8364</a></li>
							<li><a href="mailto:comercial@ferribor.com.br" className="hover:text-white">comercial@ferribor.com.br</a></li>
						</ul>
					</div>
				</div>
				<div className="relative z-10 border-t border-white/5 pt-8 text-center text-[11px] text-slate-500 font-mono">
					Copyright &copy; 2026 FerriBor. Todos os direitos reservados.
				</div>
			</footer>
		</div>
	);
}
