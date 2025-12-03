# 🔍 Guia de SEO - Next.js + React

## ✅ SEO está HABILITADO no Projeto!

### Next.js = Excelente para SEO

O Next.js resolve todos os problemas de SEO do React tradicional:

---

## 🎯 Como Funciona

### 1. **Server-Side Rendering (SSR)**

```
Cliente acessa → Next.js renderiza no servidor → HTML completo enviado
Google vê → HTML completo ✅
```

**React tradicional (SPA):**
```
Cliente acessa → HTML vazio → JavaScript baixa → Renderiza
Google vê → HTML vazio ❌
```

### 2. **Static Site Generation (SSG)**

```
Build do Next.js → Gera HTML estático → Google indexa ✅
```

Nosso projeto usa `output: 'export'` = HTML estático = SEO perfeito!

---

## 📋 SEO Implementado no Projeto

### Painel Cliente (`app.protesecapilarcuiaba.com.br`)

```typescript
metadata = {
  title: 'Prótese Capilar Cuiabá - Painel do Cliente',
  description: 'Acesse seu painel...',
  keywords: ['prótese capilar', 'cuiabá', ...],
  robots: { index: false } // Não indexar (área privada)
}
```

**Por que não indexar?** Área privada/autenticada não deve aparecer no Google.

### Painel Admin (`admin.protesecapilarcuiaba.com.br`)

```typescript
metadata = {
  title: 'Painel Administrativo...',
  robots: { index: false } // Não indexar (área privada)
}
```

### Site Público (`www.protesecapilarcuiaba.com.br`) - Quando criar

```typescript
metadata = {
  title: 'Prótese Capilar em Cuiabá | Solução para Calvície',
  description: 'Prótese capilar de alta qualidade em Cuiabá...',
  keywords: ['prótese capilar cuiabá', ...],
  robots: { index: true } // ✅ INDEXAR (público)
}
```

---

## 🚀 Recursos de SEO do Next.js

### 1. Metadata API

```typescript
export const metadata: Metadata = {
  title: 'Título da Página',
  description: 'Descrição da página',
  keywords: ['palavra1', 'palavra2'],
}
```

### 2. Open Graph (Redes Sociais)

```typescript
openGraph: {
  title: 'Título ao compartilhar',
  description: 'Descrição ao compartilhar',
  images: ['/og-image.jpg'],
  url: 'https://seusite.com',
}
```

### 3. Twitter Cards

```typescript
twitter: {
  card: 'summary_large_image',
  title: 'Título no Twitter',
  description: 'Descrição no Twitter',
  images: ['/twitter-image.jpg'],
}
```

### 4. Sitemap Automático

```typescript
// app/sitemap.ts
export default function sitemap() {
  return [
    {
      url: 'https://www.protesecapilarcuiaba.com.br',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    // ... outras páginas
  ]
}
```

### 5. Robots.txt

```typescript
// app/robots.ts
export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/app/'],
    },
    sitemap: 'https://www.protesecapilarcuiaba.com.br/sitemap.xml',
  }
}
```

---

## 🎯 SEO para o Site Público (Quando Criar)

### Páginas Principais

```typescript
// Home
title: 'Prótese Capilar em Cuiabá | Transformando Vidas'
description: 'Prótese capilar de alta qualidade em Cuiabá. Acabamento natural, materiais premium. Agende sua avaliação gratuita!'

// Serviços
title: 'Serviços de Prótese Capilar | Cuiabá MT'
description: 'Aplicação, manutenção e personalização de próteses capilares. Atendimento especializado em Cuiabá.'

// Planos
title: 'Planos e Pacotes | Prótese Capilar Cuiabá'
description: 'Conheça nossos planos e pacotes de manutenção. Economia e praticidade para seu tratamento capilar.'
```

### Palavras-chave Estratégicas

```
- prótese capilar cuiabá
- peruca masculina cuiabá
- solução calvície cuiabá
- implante capilar cuiabá
- protese de cabelo cuiabá mt
- prótese capilar masculina
- prótese capilar natural
```

---

## 📊 Otimizações Adicionais

### 1. Performance (Core Web Vitals)

```typescript
// Usar Next/Image
import Image from 'next/image'

<Image
  src="/logo.webp"
  alt="Prótese Capilar Cuiabá"
  width={96}
  height={96}
  priority // Carrega primeiro
/>
```

### 2. Structured Data (Schema.org)

```typescript
// Adicionar JSON-LD
const structuredData = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Prótese Capilar Cuiabá",
  "description": "Serviços de prótese capilar premium",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Cuiabá",
    "addressRegion": "MT",
    "addressCountry": "BR"
  },
  "telephone": "+55-XX-XXXX-XXXX",
  "url": "https://www.protesecapilarcuiaba.com.br"
}
```

---

## ✅ Checklist de SEO

### Páginas Privadas (App/Admin)
- [x] Meta tags básicas
- [x] robots: noindex (não aparecer no Google)
- [x] Open Graph configurado
- [x] Título descritivo

### Site Público (Quando Criar)
- [ ] Meta tags otimizadas
- [ ] robots: index (aparecer no Google)
- [ ] Sitemap.xml
- [ ] Robots.txt
- [ ] Structured Data (Schema.org)
- [ ] Open Graph completo
- [ ] Twitter Cards
- [ ] Canonical URLs
- [ ] Alt text em imagens
- [ ] Heading hierarchy (H1, H2, H3)

---

## 🎯 Resumo

**SIM, Next.js + React = Excelente para SEO!**

Vantagens sobre React puro:
- ✅ HTML pré-renderizado
- ✅ Meta tags no servidor
- ✅ Performance superior
- ✅ Google indexa corretamente
- ✅ Controle total sobre SEO

**Nossos painéis:**
- Configurados com `noindex` (não devem aparecer no Google)
- Mas têm meta tags para organização

**Site público (quando criar):**
- Configuraremos com SEO completo
- Aparecerá no Google
- Otimizado para busca local

---

*Next.js resolve todos os problemas de SEO do React!* 🚀


