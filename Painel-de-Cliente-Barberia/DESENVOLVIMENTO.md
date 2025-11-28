# 🛠️ Como Desenvolver

## Durante o Desenvolvimento (Você NÃO precisa fazer build!)

Para **desenvolver e ver as mudanças em tempo real**, use:

```bash
npm run dev
```

Isso inicia o servidor de desenvolvimento que:
- ✅ Atualiza **automaticamente** quando você salva os arquivos
- ✅ Mostra as mudanças **instantaneamente** no navegador
- ✅ Não precisa executar build manualmente
- ✅ Acesse em: `http://localhost:3000`

### Fluxo de Desenvolvimento

1. **Edite seus arquivos** (page.tsx, componentes, etc.)
2. **Salve o arquivo** (Ctrl+S)
3. **Veja as mudanças automaticamente** no navegador! 🔥

Não precisa executar `npm run build` durante o desenvolvimento!

---

## Build apenas para Produção

O comando `npm run build` é usado **APENAS** quando você quer:

- 📦 Gerar os arquivos finais para colocar no servidor
- 🚀 Preparar para deploy na Hostinger
- ✨ Criar a pasta `out/` com os arquivos estáticos

### Quando fazer build?

- ✅ Antes de copiar arquivos para a Hostinger
- ✅ Quando finalizar as mudanças e quiser testar em produção
- ❌ **NÃO** durante o desenvolvimento diário

---

## Resumo Rápido

| Situação | Comando |
|----------|---------|
| 🛠️ Desenvolvendo e editando código | `npm run dev` |
| 📦 Gerar arquivos para produção | `npm run build` |
| 🚀 Testar build localmente | `npm run build` + `npm start` |

---

## Dica

Durante o desenvolvimento, deixe o `npm run dev` rodando e apenas edite os arquivos. As mudanças aparecerão automaticamente! 🎉

