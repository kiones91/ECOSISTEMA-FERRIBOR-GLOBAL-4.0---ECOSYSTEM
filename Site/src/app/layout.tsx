import type { Metadata } from 'next';
import './globals.css';
import Script from 'next/script';

export const metadata: Metadata = {
	title: 'FerriBor',
	description: 'Base inicial do site da FerriBor.'
};

export default function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="pt-BR" className="scroll-smooth">
			<body>
				<a href="#conteudo" className="skip-link">
					Pular para o conteúdo
				</a>
				<main id="conteudo">{children}</main>
				<Script src="https://unpkg.com/lucide@latest" strategy="afterInteractive" />
				<Script src="https://code.iconify.design/3/3.1.0/iconify.min.js" strategy="afterInteractive" />
			</body>
		</html>
	);
}

