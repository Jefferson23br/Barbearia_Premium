# 🚀 Deploy Rápido - Copiar Arquivos para Hostinger

## ⚡ Método Mais Simples (Recomendado)

### 1. Fazer Build

No seu computador:

```bash
npm install
npm run build
```

### 2. Localizar Arquivos

Após o build, você terá uma pasta `out/` com todos os arquivos estáticos.

### 3. Copiar para Hostinger

1. Acesse o **Gerenciador de Arquivos** da Hostinger
2. Vá até `public_html` (ou pasta do domínio provisório)
3. **Copie TODOS os arquivos** da pasta `out/` para `public_html/`
4. **Copie também** o arquivo `.htaccess` para `public_html/`

### 3. Acessar

Abra no navegador:
- `http://seu-dominio-provisorio.com`
- OU `http://seu-dominio-provisorio.com/index.html`

**A tela de login aparecerá automaticamente!**

## 📁 Estrutura de Arquivos

```
public_html/              ← Pasta na Hostinger
├── index.html           ← PORTA DE ENTRADA (tela de login)
├── .htaccess            ← Configuração Apache (copiar também)
├── _next/               ← Arquivos do Next.js
│   └── static/
└── outros arquivos...
```

## 🎯 Porta de Entrada

- **Arquivo:** `index.html`
- **Caminho:** Raiz do domínio (`/`)
- **URL:** `http://seu-dominio-provisorio.com`
- **Resultado:** Tela de login aparece automaticamente

## ⚠️ Importante

- Copie o **CONTEÚDO** da pasta `out/`, não a pasta inteira
- Todos os arquivos devem estar diretamente em `public_html/`
- Não esqueça de copiar o `.htaccess` também

## 🔄 Atualizar o Site

Sempre que fizer alterações:

1. `npm run build`
2. Copiar arquivos atualizados de `out/` para `public_html/`
3. Substituir arquivos antigos

## ✅ Checklist

- [ ] Executei `npm install`
- [ ] Executei `npm run build`
- [ ] Pasta `out/` foi criada
- [ ] Copiei todos os arquivos de `out/` para `public_html/`
- [ ] Copiei o arquivo `.htaccess` para `public_html/`
- [ ] Testei acessando o domínio provisório
- [ ] Tela de login aparece corretamente

