import Link from 'next/link';
import { CatalogGrid } from '../../components/catalog/CatalogGrid';
import { FilterSidebar } from '../../components/catalog/FilterSidebar';

export default function CatalogPage() {
	return (
		<>
			<section aria-labelledby="catalog-title">
				<h1 id="catalog-title">Catálogo</h1>
				<p>Lista filtrável de produtos com espaço para filtros, cards e paginação.</p>
				<div>
					<FilterSidebar />
					<CatalogGrid />
				</div>
			</section>
			<section aria-labelledby="catalog-links-title">
				<h2 id="catalog-links-title">Categorias e produtos</h2>
				<ul>
					<li><Link href="/catalog/category/placeholder">Categoria exemplo</Link></li>
					<li><Link href="/catalog/product/placeholder">Produto exemplo</Link></li>
				</ul>
			</section>
		</>
	);
}