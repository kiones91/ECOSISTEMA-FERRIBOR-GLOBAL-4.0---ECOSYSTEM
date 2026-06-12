import type { Product } from '@/types/product';
import Image from 'next/image';
import Link from 'next/link';
import PrimaryButton from '../ui/PrimaryButton';

interface Props {
  product: Product;
}
export default function ProductCard({ product }: Props) {
  return (
    <div className="bg-neutral-30 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <Link href={`/catalog/product/${product.id}`}>
        <a className="block">
          <Image
            src={product.thumbnail}
            alt={product.name}
            width={400}
            height={300}
            className="object-cover w-full h-48"
          />
          <div className="p-4">
            <h3 className="text-h3 text-neutral-100">{product.name}</h3>
            <p className="text-sm text-neutral-80 mt-2 line-clamp-2">{product.shortDescription}</p>
          </div>
        </a>
      </Link>
      <div className="p-4 pt-0">
        <PrimaryButton onClick={() => {/* abrir quick‑quote */}}>
          Solicitar Orçamento
        </PrimaryButton>
      </div>
    </div>
  );
}