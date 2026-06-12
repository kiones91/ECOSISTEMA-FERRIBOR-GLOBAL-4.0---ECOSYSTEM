import ProductCard from '@/components/catalog/ProductCard';
import { useProducts } from '@/lib/useProducts';

export default async function CatalogPage() {
  const { data: products } = await useProducts(); // TanStack Query wrapper

  return (
    <section className="container mx-auto py-8">
      <h1 className="text-h1 text-primary-100 mb-6">Catálogo de Produtos</h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products?.map(p => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}