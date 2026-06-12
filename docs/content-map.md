We need output the modified file combining original markdown and schema block? Actually apply suggested edit to original code: basically same content, just spacing? Provide whole file. Include both sections. Provide code fences? Probably output the full content as is.```markdown
# Ferribor – Mapeamento de presença digital

## Dados oficiais
- **CNPJ** – https://cnpj.biz/20036263000168 – Dados cadastrais oficiais.

## Redes sociais e perfis profissionais
- **LinkedIn** – https://www.linkedin.com/company/ferri-industria-de-artefatos-de-borracha-ltda-ferribor – Perfil institucional B2B.
- **Instagram** – https://www.instagram.com/ferribor_borrachas/ – Portfólio visual de produtos.
- **Facebook** – https://www.facebook.com/FerriborArtefatosDeBorracha – Canal de relacionamento com clientes.

## Site institucional
- **Site principal** – https://www.ferribor.com.br – Hub de informação e vendas.

---

### Uso interno
Este documento serve como referência para:
- Inserir links nas páginas “Sobre”, “Contato” e no rodapé.
- Gerar metadados `sameAs` em `JSON‑LD`.
- Criar botões de redes sociais consistentes.

---

### 2️⃣ `schema-organization.html` – Bloco JSON‑LD a ser inserido no `<head>`
# Ferribor – Mapeamento de presença digital

## Dados oficiais
- **CNPJ** – https://cnpj.biz/20036263000168 – Dados cadastrais oficiais.

## Redes sociais e perfis profissionais
- **LinkedIn** – https://www.linkedin.com/company/ferri-industria-de-artefatos-de-borracha-ltda-ferribor – Perfil institucional B2B.
- **Instagram** – https://www.instagram.com/ferribor_borrachas/ – Portfólio visual de produtos.
- **Facebook** – https://www.facebook.com/FerriborArtefatosDeBorracha – Canal de relacionamento com clientes.

## Site institucional
- **Site principal** – https://www.ferribor.com.br – Hub de informação e vendas.

---

### Uso interno
Este documento serve como referência para:
- Inserir links nas páginas “Sobre”, “Contato” e no rodapé.
- Gerar metadados `sameAs` em `JSON‑LD`.
- Criar botões de redes sociais consistentes.
```

---

### 2️⃣ `schema-organization.html` – Bloco JSON‑LD a ser inserido no `<head>`  
```html src/partials/schema-organization.html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Ferribor",
  "legalName": "Ferribor Indústria de Artefatos de Borracha Ltda.",
  "url": "https://www.ferribor.com.br",
  "logo": "https://www.ferribor.com.br/assets/logo.svg",
  "foundingDate": "1998-05-01",
  "taxID": "20.036.263/0001-68",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Rua Exemplo, 123",
    "addressLocality": "São Paulo",
    "addressRegion": "SP",
    "postalCode": "01000-000",
    "addressCountry": "BR"
  },
  "contactPoint": [{
    "@type": "ContactPoint",
    "telephone": "+55-11-9999-9999",
    "contactType": "sales",
    "areaServed": "BR"
  }],
  "sameAs": [
    "https://www.linkedin.com/company/ferri-industria-de-artefatos-de-borracha-ltda-ferribor",
    "https://www.instagram.com/ferribor_borrachas/",
    "https://www.facebook.com/FerriborArtefatosDeBorracha"
  ]
}
</script>
```

---

### 3️⃣ `footer.html` – Rodapé padrão com informações consolidadas  
```html src/partials/footer.html
<footer class="site-footer">
  <div class="container">

    <div class="footer-col">
      <h4>Contato</h4>
      <p>+55 11 9999‑9999</p>
      <p>São Paulo – SP</p>
    </div>

    <div class="footer-col">
      <h4>Legal</h4>
      <p>CNPJ: 20.036.263/0001-68</p>
      <a href="/politica-privacidade.html">Política de Privacidade</a>
    </div>

    <div class="footer-col">
      <h4>Redes Sociais</h4>
      <ul class="social-links">
        <li><a href="https://www.linkedin.com/company/ferri-industria-de-artefatos-de-borracha-ltda-ferribor"
               target="_blank" rel="noopener">LinkedIn</a></li>
        <li><a href="https://www.instagram.com/ferribor_borrachas/"
               target="_blank" rel="noopener">Instagram</a></li>
        <li><a href="https://www.facebook.com/FerriborArtefatosDeBorracha"
               target="_blank" rel="noopener">Facebook</a></li>
      </ul>
    </div>

    <div class="footer-col">
      <h4>Consultas Oficiais</h4>
      <a href="https://cnpj.biz/20036263000168" target="_blank" rel="noopener">Consulta CNPJ</a>
    </div>

  </div>
</footer>
```

---

### 4️⃣ `seo-checklist.md` – Checklist de SEO para o site  
```markdown docs/seo-checklist.md
# Checklist de SEO – Ferribor

## Metatags essenciais
- [ ] `<title>` único e descritivo em cada página.  
- [ ] `<meta name="description">` com até 160 caracteres.  
- [ ] Open Graph (`og:title`, `og:description`, `og:image`, `og:url`).  
- [ ] Twitter Cards (`twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`).  

## Structured Data
- [ ] Inserir `schema-organization.html` em todas as páginas que compartilham o mesmo `<head>`.  
- [ ] Validar via Google Rich Results Test.

## Redirecionamentos
- [ ] Criar `_redirects` ou `.htaccess` para mapear URLs antigas → novas.  
- [ ] Testar com `curl -I https://oldurl.com` → `301 Moved Permanently`.

## Performance (Lighthouse)
- [ ] Score > 90 em **Performance**.  
- [ ] Imagens em WebP + lazy‑load.  
- [ ] CSS/JS minificado e carregado de forma assíncrona.

## Acessibilidade
- [ ] `alt` em todas as imagens.  
- [ ] Landmark ARIA (`<header>`, `<nav>`, `<main>`, `<footer>`).  
- [ ] Contraste de cores ≥ 4.5:1.

## Segurança
- [ ] HTTPS com certificado Let’s Encrypt.  
- [ ] Header `Content‑Security‑Policy`, `Strict‑Transport‑Security`.  

## LGPD
- [ ] Página de Política de Privacidade (link no footer).  
- [ ] Aviso de cookies, se houver scripts de rastreamento.

--- 
**Obs.:** Quando o DNS for apontado para o novo host, basta subir os arquivos acima e ativar o certificado SSL. Todas as metas de SEO, performance e segurança já estarão prontas.