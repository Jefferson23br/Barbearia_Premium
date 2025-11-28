# Painel de Cliente Barberia

Este é o **Painel de Acesso do Cliente** - primeira parte do sistema completo de barbearia.

O projeto original está disponível em: https://www.figma.com/design/PiFI7YV1KGUQ8CR5UA3lVu/Painel-de-Cliente-Barberia

## 🚀 Tecnologias

### Front-end
- **Next.js 14** - Framework React para produção
- **React 18** - Biblioteca JavaScript para interfaces
- **TypeScript** - Superset do JavaScript com tipagem estática
- **Tailwind CSS** - Framework CSS utilitário
- **Motion** - Biblioteca de animações
- **Radix UI** - Componentes acessíveis

### Back-end (Próximas etapas)
- **Node.js** - Runtime JavaScript
- **PostgreSQL** - Banco de dados relacional

## 📦 Instalação Local

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev
```

O projeto estará disponível em [http://localhost:3000](http://localhost:3000)

## 🏗️ Build para Produção

```bash
# Criar build otimizado
npm run build

# Iniciar servidor de produção
npm start
```

## 🌐 Deploy na Hostinger

**Veja o arquivo [DEPLOY.md](./DEPLOY.md) para instruções completas de deploy na Hostinger.**

### Resumo rápido:

1. **VPS/Cloud Hosting:**
   ```bash
   npm install
   npm run build
   pm2 start npm --name "barberia-painel" -- start
   ```

2. **Hospedagem Compartilhada:**
   - Fazer build local
   - Fazer upload da pasta `out/` via FTP

## 📁 Estrutura do projeto

```
src/
├── app/              # App Router do Next.js
│   ├── layout.tsx   # Layout principal
│   └── page.tsx     # Página inicial (Login/Registro)
├── components/       # Componentes React
│   ├── figma/       # Componentes do Figma
│   └── ui/          # Componentes de UI (shadcn/ui)
└── styles/          # Estilos globais
```

## 📝 Scripts disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm run start` - Inicia o servidor de produção
- `npm run lint` - Executa o linter

## 🔐 Funcionalidades Atuais

- ✅ Tela de Login
- ✅ Tela de Registro
- ✅ Recuperação de Senha
- ✅ Animações suaves
- ✅ Design responsivo
- ✅ Interface moderna com Tailwind CSS

## 📋 Próximas Etapas

- [ ] Integração com API Node.js
- [ ] Conexão com PostgreSQL
- [ ] Autenticação JWT
- [ ] Dashboard do cliente
- [ ] Agendamento de serviços
- [ ] Histórico de atendimentos

## 📞 Suporte

Para dúvidas sobre deploy ou configuração, consulte o arquivo `DEPLOY.md`