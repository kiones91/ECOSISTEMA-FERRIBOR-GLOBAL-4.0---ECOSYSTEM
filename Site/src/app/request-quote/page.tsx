import { FileUploader } from '../../components/quote/FileUploader';
import { QuoteWizard } from '../../components/quote/QuoteWizard';

export default function RequestQuotePage() {
	return (
		<section aria-labelledby="quote-title">
			<h1 id="quote-title">Solicitar orçamento</h1>
			<p>Formulário multi-step com upload reservado para arquivos do cliente.</p>
			<section aria-labelledby="quote-steps-title">
				<h2 id="quote-steps-title">Etapas do pedido</h2>
				<ol>
					<li>Dados do cliente</li>
					<li>Especificação do pedido</li>
					<li>Upload e revisão</li>
				</ol>
			</section>
			<QuoteWizard />
			<section aria-labelledby="upload-title">
				<h2 id="upload-title">Upload de arquivos</h2>
				<FileUploader />
			</section>
		</section>
	);
}