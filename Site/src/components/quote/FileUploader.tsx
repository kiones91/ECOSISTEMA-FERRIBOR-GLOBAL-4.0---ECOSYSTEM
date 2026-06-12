export function FileUploader() {
	return (
		<div>
			<p>Arraste e solte arquivos aqui ou selecione manualmente.</p>
			<input
				type="file"
				multiple
				accept=".pdf,.jpg,.jpeg,.png,.mp4"
				aria-label="Selecionar arquivos para upload"
			/>
			<div aria-label="Área para lista de arquivos enviados" />
			<p>Espaço reservado para integração com upload resumável e armazenamento externo.</p>
		</div>
	);
}
