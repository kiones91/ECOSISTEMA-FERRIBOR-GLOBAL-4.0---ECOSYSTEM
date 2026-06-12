import Link from 'next/link';

export function Footer() {
	return (
		<footer>
			<section aria-labelledby="footer-institucional">
				<h2 id="footer-institucional">Institucional</h2>
				<p>Espaço reservado para dados de rodapé, contatos e links legais.</p>
			</section>
			<nav aria-label="Links legais">
				<ul>
					<li><Link href="/legal/privacy">Privacidade</Link></li>
					<li><Link href="/legal/terms">Termos</Link></li>
				</ul>
			</nav>
		</footer>
	);
}
