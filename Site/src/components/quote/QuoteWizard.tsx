export function QuoteWizard() {
	return (
		<form aria-label="Wizard de orçamento">
			<fieldset>
				<legend>Etapa 1: dados do cliente</legend>
				<div>
					<label htmlFor="quote-name">Nome completo</label>
					<input id="quote-name" name="name" type="text" />
				</div>
				<div>
					<label htmlFor="quote-email">E-mail</label>
					<input id="quote-email" name="email" type="email" />
				</div>
				<div>
					<label htmlFor="quote-phone">Telefone</label>
					<input id="quote-phone" name="phone" type="tel" />
				</div>
				<div>
					<label htmlFor="quote-company">Empresa</label>
					<input id="quote-company" name="company" type="text" />
				</div>
			</fieldset>
			<fieldset>
				<legend>Etapa 2: especificação do pedido</legend>
				<div>
					<label htmlFor="quote-product">Produto</label>
					<select id="quote-product" name="product">
						<option value="">Selecionar</option>
					</select>
				</div>
				<div>
					<label htmlFor="quote-quantity">Quantidade</label>
					<input id="quote-quantity" name="quantity" type="number" min={1} />
				</div>
				<div>
					<label htmlFor="quote-unit">Unidade de medida</label>
					<select id="quote-unit" name="unit">
						<option value="">Selecionar</option>
					</select>
				</div>
				<div>
					<label htmlFor="quote-deadline">Prazo desejado</label>
					<input id="quote-deadline" name="deadline" type="date" />
				</div>
				<div>
					<label htmlFor="quote-size">Tamanho / dimensões</label>
					<input id="quote-size" name="size" type="text" />
				</div>
				<div>
					<label htmlFor="quote-material">Material preferencial</label>
					<select id="quote-material" name="material" multiple>
						<option value="">Selecionar</option>
					</select>
				</div>
				<div>
					<label htmlFor="quote-description">Descrição detalhada</label>
					<textarea id="quote-description" name="description" rows={6} />
				</div>
			</fieldset>
			<fieldset>
				<legend>Etapa 3: revisão e envio</legend>
				<div aria-label="Resumo do pedido" />
				<div>
					<label htmlFor="quote-terms">
						<input id="quote-terms" name="terms" type="checkbox" />
						Aceito a política de privacidade
					</label>
				</div>
				<div>
					<button type="submit">Enviar orçamento</button>
				</div>
			</fieldset>
		</form>
	);
}
