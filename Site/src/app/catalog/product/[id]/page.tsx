import Link from 'next/link';
import { ProductCTA } from '../../../../components/product/ProductCTA';
import { SpecsAccordion } from '../../../../components/product/SpecsAccordion';
import { Viewer3D } from '../../../../components/product/Viewer3D';

export default function ProductPage({ params }: { params: { id: string } }) {
	return (
		<article>
			<header>
				<nav aria-label="Breadcrumb">
					<Link href="/">Home</Link>
					<span aria-hidden="true"> / </span>
					<Link href="/catalog">Catálogo</Link>
					<span aria-hidden="true"> / </span>
					<span>Produto {params.id}</span>
				</nav>
				<h1>Produto {params.id}</h1>
				<p>Ficha técnica estrutural pronta para receber mídia, specs e interações 3D.</p>
			</header>

			<section aria-labelledby="viewer-title">
				<h2 id="viewer-title">Visualização 3D</h2>
				<Viewer3D />
			</section>

			<section aria-labelledby="specs-title">
				<h2 id="specs-title">Especificações</h2>
				<SpecsAccordion />
			</section>

			<section aria-labelledby="cta-title">
				<h2 id="cta-title">Solicitar orçamento</h2>
				<ProductCTA />
			</section>

			<section aria-labelledby="docs-title">
				<h2 id="docs-title">Documentação</h2>
				<div aria-label="Espaço para anexos técnicos e PDFs" />
			</section>

			<section aria-labelledby="related-title">
				<h2 id="related-title">Produtos relacionados</h2>
				<nav aria-label="Produtos relacionados">
					<ul>
						<li><Link href="/catalog/product/placeholder-1">Produto relacionado 1</Link></li>
						<li><Link href="/catalog/product/placeholder-2">Produto relacionado 2</Link></li>
					</ul>
				</nav>
			</section>

			<section aria-labelledby="share-title">
				<h2 id="share-title">Compartilhar produto</h2>
				<div aria-label="Área de botões de compartilhamento" />
			</section>
		</article>
	);
}