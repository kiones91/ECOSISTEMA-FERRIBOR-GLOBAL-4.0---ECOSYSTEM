import Link from 'next/link';

const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:5174/auth';

export function Header() {
	return (
		<header>
			<nav aria-label="Navegação principal">
				<Link href="/">FerriBor</Link>
				<ul>
					<li><Link href="/about">Sobre</Link></li>
					<li><Link href="/catalog">Catálogo</Link></li>
					<li><Link href="/services">Serviços</Link></li>
					<li><Link href="/request-quote">Orçamento</Link></li>
					<li><Link href="/blog">Blog</Link></li>
					<li><Link href="/contact">Contato</Link></li>
				</ul>
				<a href={DASHBOARD_URL} className="cta-cadastre">Área do Cliente</a>
			</nav>
		</header>
	);
}
