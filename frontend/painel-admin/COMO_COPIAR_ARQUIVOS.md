# 📁 Como Copiar Arquivos para a Hostinger

## 🎯 Passo a Passo

### 1️⃣ Fazer Build Local

No seu computador, execute:

```bash
# Instalar dependências (se ainda não instalou)
npm install

# Criar build estático
npm run build
```

Isso criará uma pasta `out/` com todos os arquivos estáticos.

### 2️⃣ Arquivos para Copiar

Após o build, você terá a pasta `out/` com os seguintes arquivos:

```
out/
├── index.html          ← PORTA DE ENTRADA (tela de login)
├── _next/
│   ├── static/
│   └── ...
├── favicon.ico
└── outros arquivos...
```

### 3️⃣ Copiar para Hostinger

1. Acesse o **Gerenciador de Arquivos** da Hostinger
2. Navegue até a pasta `public_html` (ou a pasta do seu domínio provisório)
3. **Copie TODOS os arquivos e pastas** da pasta `out/` para `public_html/`

### 4️⃣ Estrutura Final na Hostinger

Após copiar, a estrutura deve ficar assim:

```
public_html/
├── index.html          ← Acessa automaticamente quando abrir o domínio
├── _next/
│   └── static/
│       └── ...
└── outros arquivos...
```

## 🌐 Acesso

Após copiar os arquivos:

- **URL de acesso:** `http://seu-dominio-provisorio.com`
- **OU:** `http://seu-dominio-provisorio.com/index.html`

Ambos levam diretamente para a **tela de login**.

## 📋 Checklist

- [ ] Executei `npm install`
- [ ] Executei `npm run build`
- [ ] A pasta `out/` foi criada
- [ ] Copiei TODOS os arquivos de `out/` para `public_html/`
- [ ] Testei acessando o domínio provisório

## ⚠️ Importante

- **NÃO copie** a pasta `out/` inteira, copie o **CONTEÚDO** dela
- Todos os arquivos devem estar diretamente em `public_html/`
- O arquivo `index.html` é a porta de entrada automática

## 🔄 Atualizações Futuras

Sempre que fizer alterações:

1. Execute `npm run build` novamente
2. Copie os arquivos atualizados da pasta `out/` para `public_html/`
3. Substitua os arquivos antigos

