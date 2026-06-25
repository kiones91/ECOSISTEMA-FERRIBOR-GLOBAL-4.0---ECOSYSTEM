export async function generateStaticParams() {
	return [
		{ slug: 'placeholder' }
	];
}

export default function CatalogCategoryPage({ params }: { params: { slug: string } }) {
	return (
		<>
			<section aria-labelledby="category-title">
				<h1 id="category-title">Categoria: {params.slug}</h1>
				<p>Grade de cards com filtros por material, aplicação e faixa de preço.</p>
			</section>
			<section aria-labelledby="category-filters-title">
				<h2 id="category-filters-title">Filtros da categoria</h2>
				<div aria-label="Área de filtros da categoria" />
			</section>
			<section aria-labelledby="category-grid-title">
				<h2 id="category-grid-title">Produtos da categoria</h2>
				<div aria-label="Grade filtrada da categoria" />
			</section>
		</>
	);
}