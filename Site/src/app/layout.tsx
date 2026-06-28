import type { Metadata } from 'next';
import './globals.css';
import Script from 'next/script';
import { LanguageProvider } from '../i18n/LanguageContext';

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
		<html lang="pt-BR" className="scroll-smooth">
			<head>
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
				<link
					rel="stylesheet"
					href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Montserrat:wght@400;500;600;700;800;900&display=swap"
					media="print"
					// @ts-ignore
					onLoad="this.media='all'"
				/>
			</head>
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

