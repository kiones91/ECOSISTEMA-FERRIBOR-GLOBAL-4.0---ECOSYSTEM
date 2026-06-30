import type { Metadata } from 'next';
import { Inter, Montserrat } from 'next/font/google';
import './globals.css';
import Script from 'next/script';
import { LanguageProvider } from '../i18n/LanguageContext';

// Self-hosted at build time (no external fonts.googleapis.com round-trip).
// The hero <h1> is the LCP element; serving the font same-origin + auto-preload
// removes the late font-swap repaint that was pushing LCP past 17s on mobile.
const inter = Inter({
	subsets: ['latin'],
	variable: '--font-inter',
	display: 'swap',
});

const montserrat = Montserrat({
	subsets: ['latin'],
	variable: '--font-montserrat',
	display: 'swap',
});

export const metadata: Metadata = {
	title: 'FerriBor',
	description: 'FerriBor — Artefatos de Borracha, Silicone e PU. Fabricação e revestimento de peças técnicas industriais.',
};

export default function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="pt-BR" className={`scroll-smooth ${inter.variable} ${montserrat.variable}`}>
			<body>
				<LanguageProvider>
					<a href="#conteudo" className="skip-link">
						Pular para o conteúdo
					</a>
					<main id="conteudo">{children}</main>
				</LanguageProvider>
				<Script src="https://code.iconify.design/3/3.1.0/iconify.min.js" strategy="lazyOnload" />
			</body>
		</html>
	);
}
