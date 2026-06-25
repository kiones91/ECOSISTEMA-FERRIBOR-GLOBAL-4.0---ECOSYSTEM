export interface ViaCepAddress {
  street: string;
  neighborhood: string;
  city: string;
  state: string;
}

/** Remove formatação e retorna só dígitos do CEP (8 chars). */
export function normalizeCep(cep: string): string {
  return cep.replace(/\D/g, '').slice(0, 8);
}

/** Consulta endereço pelo CEP via ViaCEP (API pública brasileira). */
export async function fetchAddressByCep(cep: string): Promise<ViaCepAddress> {
  const digits = normalizeCep(cep);
  if (digits.length !== 8) {
    throw new Error('CEP deve ter 8 dígitos');
  }

  const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
  if (!res.ok) {
    throw new Error('Não foi possível consultar o CEP');
  }

  const data = await res.json();
  if (data?.erro) {
    throw new Error('CEP não encontrado');
  }

  return {
    street: data.logradouro ?? '',
    neighborhood: data.bairro ?? '',
    city: data.localidade ?? '',
    state: (data.uf ?? '').toUpperCase(),
  };
}
